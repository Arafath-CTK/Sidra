const express = require("express");
const path = require("path");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { engine } = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

const app = express();

app.engine(
  "hbs",
  engine({
    handlebars: allowInsecurePrototypeAccess(require("handlebars")),
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "/views/layouts/"),
    partialsDir: path.join(__dirname, "views/partials/"),
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));

app.use(cookieParser()); // For JWT
app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true for https only
  })
);
app.use(express.urlencoded({ extended: true })); //same use of body parser. its built in express itself.
app.use(express.json()); // for parsing json to js object.
app.use(express.static(path.join(__dirname, "./public"))); // Setting the public forlder as the forlder for static files.

app.use("/admin", adminRouter);
app.use("/", userRouter);

//Server hosting locally
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on : http://localhost:${port}`);
});
