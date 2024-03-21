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
    jwt.sign(payLoad, jwtKey, { expiresIn: "2d" }, (error, token) => {
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

let signAdmin = (admin) => {
  return new Promise((resolve, reject) => {
    const jwtKey = process.env.JWT_KEY;
    const payLoad = {
      adminId: admin._id,
      adminName: admin.name,
      adminEmail: admin.email,
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

let authenticateAdmin = () => async (req, res, next) => {
  try {
    const jwtKey = process.env.JWT_KEY;
    const baererToken = req.cookies.adminToken;
    if (!baererToken) {
      return res
        .status(401)
        .render("error", {
          layout: false,
          errorMessage: "Unauthorized access",
        });
    }
    jwt.verify(baererToken, jwtKey, (error, decodedToken) => {
      if (error) {
        console.error(
          "Unexpected error occured during JWT verification",
          error
        );
        return res
          .status(403)
          .render("error", {
            layout: false,
            errorMessage:
              "Unexpected error occured during JWT verification due to unauthorized access",
          });
      }

      if (decodedToken.role !== "admin") {
        return res
          .status(403)
          .render("error", {
            layout: false,
            errorMessage: "You are not authorized to access this page",
          });
      }

      next();
    });
  } catch (error) {
    console.error(error);
  }
};

let authenticateUser = () => async (req, res, next) => {
  try {
    const jwtKey = process.env.JWT_KEY;
    const baererToken = req.cookies.userToken;
    if (!baererToken) {
      return res.redirect("/signIn");
    }

    jwt.verify(baererToken, jwtKey, (error, decodedToken) => {
      //IF IT HAS JWT THEN VERIFY THE CORRECT ROLE AND STATUS
      if (error) {
        //IF UNEXPECTED ERROR
        console.error(
          "Unexpected error occured while authentication process",
          error
        );
        return res
          .status(403)
          .send("Unexpected error occured due to unauthorized access");
      }

      if (decodedToken.role !== "user") {
        console.log("You are unauthorized to access this page");
        return res.redirect("/signIn");
      }

      console.log("user role matched");
      next();
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  signUser,
  verifyUser,
  signAdmin,
  verifyAdmin,
  authenticateAdmin,
  authenticateUser,
};
