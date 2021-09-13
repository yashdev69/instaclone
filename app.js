const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");

// routes
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");

dotenv.config();
const port = process.env.PORT || 5000;

// db connection
(async () => {
  await mongoose.connect(
    process.env.DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    () => {
      console.log("Connected to db");
    }
  );
})();

// middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());

app.use("/api/auth", authRoute);
app.use("/api/user", usersRoute);

app.listen(port, () => {
  console.log(`server is running on : http://localhost:${port}`);
});
