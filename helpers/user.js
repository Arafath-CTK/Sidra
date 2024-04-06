const User = require("../models/user");
const Product = require("../models/product");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

function signUpVerificationHelper(email) {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        resolve({ emailExist: true });
      } else {
        resolve({ emailExist: false });
      }
    } catch (error) {
      reject(error);
    }
  });
}

function signUpHelper(userData) {
  let { name, email, phoneNumber, password } = userData;
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const user = new User({
        name: name,
        email: email,
        phone_number: phoneNumber,
        password: hashedPassword,
        register_date: formattedDate,
      });
      user.save();

      resolve({ success: true, user });
    } catch (error) {
      reject(error);
    }
  });
}

let signInHelper = async (signInData) => {
  try {
    const { email, password } = signInData;
    let existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (existingUser.status === "Blocked") {
        return { blockedUser: true };
      } else if (!passwordMatch) {
        return { passwordNotMatching: true };
      } else {
        return { verified: true, existingUser };
      }
    } else {
      return { invalidEmail: true };
    }
  } catch (error) {
    throw error;
  }
};

// config of nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// OTP generating functiion
function generateOTP() {
  // Generate random bytes (ensuring enough for 6 digits)
  const randomBytes = crypto.randomBytes(4);

  // Convert to a numeric string and extract the first 6 digits
  const otp = parseInt(randomBytes.toString("hex"), 16)
    .toString(10)
    .padStart(6, "0");

  return otp.substring(0, 6);
}

let sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send OTP");
  }
};

let generateAndSendOTP = async (email) => {
  try {
    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000; // otp expires in 10 mins
    await sendOTP(email, otp);
    return { otp, expiry };
  } catch (error) {
    throw error;
  }
};

let addAddressHelper = async (address, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        name,
        house,
        street,
        city,
        state,
        pin,
        phone,
        addressType,
        isPrimary,
      } = address;

      // Set default values if not provided
      if (!addressType) {
        addressType = "Home"; // Set default address type to 'home'
      }
      if (isPrimary === undefined || isPrimary === null) {
        isPrimary = false; // Set default value of isPrimary to false
      }

      let user = await User.findById(userId);

      let existingAddress = await User.findOne({
        _id: userId,
        addresses: {
          $elemMatch: { house_name: house, street: street, pin_code: pin },
        },
      });

      if (existingAddress) {
        resolve({ addressExist: true });
      } else {
        const newAddress = {
          name: name,
          house_name: house,
          street: street,
          city: city,
          state: state,
          pin_code: pin,
          address_type: addressType,
          phone_number: phone,
        };

        // Add isPrimary flag to the new address
        if (isPrimary) {
          newAddress.isPrimary = true;
          // Unset isPrimary flag for existing addresses if this address is set as primary
          user.addresses.forEach((addr) => {
            addr.isPrimary = false;
          });
        }

        user.addresses.push(newAddress);
        const savedUser = await user.save();

        // Find the newly added address in the user's addresses array
        const newlyAddedAddress = savedUser.addresses.find(
          (addr) =>
            addr.house_name === newAddress.house_name &&
            addr.street === newAddress.street &&
            addr.pin_code === newAddress.pin_code
        );

        console.log("address added successfully");
        resolve({ success: true, addressId: newlyAddedAddress._id });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let editAddressHelper = async (address, userId, addressId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        name,
        house,
        street,
        city,
        state,
        pin,
        phone,
        addressType,
        isPrimary,
      } = address;

      // Check if the edited address already exists in the database
      const existingAddress = await User.findOne({
        _id: userId,
        addresses: {
          $elemMatch: {
            _id: { $ne: addressId }, // Exclude the current address being edited
            house_name: house,
            street: street,
            city: city,
            state: state,
            pin_code: pin,
            phone_number: phone,
            address_type: addressType,
          },
        },
      });

      if (existingAddress) {
        resolve({ addressExist: true });
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, "addresses._id": addressId },
        {
          $set: {
            "addresses.$.name": name,
            "addresses.$.house_name": house,
            "addresses.$.street": street,
            "addresses.$.city": city,
            "addresses.$.state": state,
            "addresses.$.pin_code": pin,
            "addresses.$.phone_number": phone,
            "addresses.$.address_type": addressType,
          },
        },
        { new: true }
      );

      // Check if the user was found and updated
      if (!updatedUser) {
        return reject("User or address not found");
      }

      // If the edited address is set as primary, update other addresses accordingly
      if (isPrimary) {
        updatedUser.addresses.forEach((addr) => {
          if (addr._id.toString() !== addressId.toString()) {
            addr.isPrimary = false;
          } else {
            addr.isPrimary = true;
          }
        });
        await updatedUser.save();
      }

      resolve({ success: true, updatedUser });
    } catch (error) {
      reject(error);
    }
  });
};

let deleteAddressHelper = async (addressId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findByIdAndUpdate(userId, {
        $pull: { addresses: { _id: addressId } },
      });

      if (!user) {
        return resolve({ success: false, userNotExist: true });
      }

      console.log("Address deleted successfully");
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

let addToWishlistHelper = async (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findById(userId);

      if (user.wishlist.includes(productId)) {
        resolve({ productExist: true });
      } else {
        user.wishlist.push(productId);
        await user.save();

        console.log("Product added to wishlist successfully");
        resolve({ success: true });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let removeFromWishlistHelper = async (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findByIdAndUpdate(userId, {
        $pull: { wishlist: productId },
      });

      if (!user) {
        resolve({ userNotExist: true });
      }

      console.log("Product removed from wishlist");
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

let addToCartHelper = async (productData, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { productId, quantity } = productData;

      let user = await User.findById(userId);

      let existingCartIndex = user.cart.findIndex((item) =>
        item.product.equals(productId)
      );

      if (existingCartIndex !== -1) {
        user.cart[existingCartIndex].quantity =
          parseInt(user.cart[existingCartIndex].quantity) + parseInt(quantity);
      } else {
        user.cart.push({ product: productId, quantity: quantity });
      }

      await user.save();

      console.log("Product added to cart successfully");
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

let removeFromCartHelper = async (userId, cartId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findByIdAndUpdate(userId, {
        $pull: { cart: { _id: cartId } },
      });

      if (!user) {
        resolve({ success: false, userNotExist: true });
      }

      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

let updateQuantityHelper = async (userId, cartData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { cartId, newQuantity } = cartData;

      const updatedCart = await User.findOneAndUpdate(
        { _id: userId, "cart._id": cartId }, // Criteria to find the user and the cart object
        { $set: { "cart.$.quantity": newQuantity } }, // Update operation
        { new: true } // Return the updated document
      );

      if (!updatedCart) {
        reject({ productNotExist: true });
      }

      resolve({ success: true, updatedCart });
    } catch (error) {
      reject(error);
    }
  });
};

let updateSelectedHelper = async (userId, cartId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { isSelected } = data;
      const updatedCart = await User.findOneAndUpdate(
        { _id: userId, "cart._id": cartId },
        { $set: { "cart.$.isSelected": isSelected } },
        { new: true }
      );

      if (!updatedCart) {
        reject({ productNotExist: true });
      }

      resolve({ success: true, updatedCart });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  signUpHelper,
  signInHelper,
  generateAndSendOTP,
  signUpVerificationHelper,
  addAddressHelper,
  editAddressHelper,
  deleteAddressHelper,
  addToCartHelper,
  addToWishlistHelper,
  removeFromWishlistHelper,
  removeFromCartHelper,
  updateQuantityHelper,
  updateSelectedHelper,
};
