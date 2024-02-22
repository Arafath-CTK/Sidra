const express = require("express");
const path = require("path");
const adminRouter = require("./routes/admin");
const hbs = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

const app = express();

// app.engine(
//   "hbs",
//   hbs.engine({
//     handlebars: allowInsecurePrototypeAccess(require("handlebars")),
//     extname: "hbs",
//     defaultLayout: "layout",
//     layoutsDir: path.join(__dirname, "./views/layout/"),
//     partialsDir: path.join(__dirname, "./views/partials/"),
//   })
// );

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));

app.use("/", adminRouter);

app.use(express.static(path.join(__dirname, "./public")));

//Server hosting locally
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server runs at port: ${port}`);
});
