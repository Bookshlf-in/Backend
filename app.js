require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes");

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((error) => console.log("Error connecting to database", error));

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: JSON.parse(process.env.CORS_ORIGIN),
  })
);

//My Routes
app.get("/", (req, res) => res.send("Hello Bookshlf"));
app.use("/", routes);

//PORT
const port = process.env.PORT || 4000;

//Starting a server
app.listen(port, console.log(`Server is running at port ${port}`));
