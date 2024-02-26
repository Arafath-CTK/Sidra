const User = require("../models/user");

const bcrypt = require("bcrypt");
const { objectId } = require("mongodb");

// user signup helper
function signUpHelper(userData) {
  let { name, email, phoneNumber, password } = userData;
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
          name: name,
          email: email,
          phone_number: phoneNumber,
          password: hashedPassword,
        });
        user.save();
        resolve({ success: true, user });
      } else {
        resolve({ emailExist: true });
      }
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { signUpHelper };
