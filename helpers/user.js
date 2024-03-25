const User = require("../models/user");
const Product = require("../models/product");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { use } = require("../routes/user");
const user = require("../models/user");
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
      let { name, house, street, city, state, pin, phone, addressType } =
        address;

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

        user.addresses.push(newAddress);
        await user.save();

        console.log("address added successfully");
        resolve({ success: true });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let editAddressHelper = async (address, userId, addressId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { name, house, street, city, state, pin, phone, addressType } =
        address;

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

let addToCartHelper = async (productData, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { productId, qty } = productData;
      let product = await Product.findById(productId);
      let user = await User.findById(userId);

      let existingProduct = await User.findOne({
        _id: userId,
        cart: {
          $elemMatch: { product_id: productId },
        },
      });

      if (existingProduct) {
        resolve({ productExist: true });
      } else {
        const newProduct = {
          product_id: productId,
          name: product.name,
          image: product.images[0],
          quantity: qty,
          price: product.price,
          total_price: qty * product.price,
        };

        user.cart.push(newProduct);
        await user.save();

        console.log("Product added to cart successfully");
        resolve({ success: true });
      }
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
};
