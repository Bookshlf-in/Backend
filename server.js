require("dotenv").config();

const app = require("./app");
const routes = require("./routes");
const cors = require("cors");

//Cors Middleware
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
