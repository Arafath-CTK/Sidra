const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { use } = require("../routes/user");
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

// user signup helper
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

module.exports = {
  signUpHelper,
  signInHelper,
  generateAndSendOTP,
  signUpVerificationHelper,
  addAddressHelper,
};
