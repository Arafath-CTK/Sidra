const jwt = require("jsonwebtoken");
const env = require("dotenv").config();

let signUser = (user) => {
  return new Promise((resolve, reject) => {
    const jwtKey = process.env.JWT_KEY;
    const payLoad = {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      role: "user",
    };
    jwt.sign(payLoad, jwtKey, { expiresIn: "1d" }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
};

let verifyUser = (token) => {
  return new Promise((resolve, reject) => {
    const jwtKey = process.env.JWT_KEY;
    jwt.verify(token, jwtKey, (error, decodedToken) => {
      if (error) {
        console.error("JWT verification failed", error);
        reject(error);
      } else {
        console.log("Verified the user with JWT Token");
        resolve(decodedToken);
      }
    });
  });
};

let signAdmin = (user) => {
  return new Promise((resolve, reject) => {
    const jwtKey = process.env.JWT_KEY;
    const payLoad = {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      role: "admin",
    };
    jwt.sign(payLoad, jwtKey, { expiresIn: "1d" }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
};

let verifyAdmin = (token) => {
  return new Promise((resolve, reject) => {
    const jwtKey = process.env.JWT_KEY;
    jwt.verify(token, jwtKey, (error, decodedToken) => {
      if (error) {
        console.error("JWT verification failed", error);
        reject(error);
      } else {
        console.log("Verified the admin with JWT Token");
        resolve(decodedToken);
      }
    });
  });
};

module.exports = { signUser, verifyUser, signAdmin, verifyAdmin };
