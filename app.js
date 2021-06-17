require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My routes
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/account");

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((error) => console.log("Error connecting to database", error));

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//My Routes
app.get("/", (req, res) => res.send("Hello Bookshlf"));
app.use("/", authRoutes);
app.use("/", accountRoutes);

//PORT
const port = process.env.PORT || 4000;

//Starting a server
app.listen(port, console.log(`Server is running at port ${port}`));
