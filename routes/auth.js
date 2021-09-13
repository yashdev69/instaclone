const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Register User
router.post("/register", async (req, res) => {
  try {
    // const useremail = await User.findOne({ email: req.body.email });
    // useremail && res.send("Email already taken");

    // const username = await User.findOne({ username: req.body.username });
    // username && res.send("username already taken");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create user object
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      isAdmin: req.body.isAdmin,
      password: hashedPassword,
    });

    // save the user to db
    const user = await newUser.save();

    const { password, ...others } = user._doc;

    const accessToken = jwt.sign(others, process.env.ACCESS_TOKEN_KEY);

    res.status(200).json(accessToken);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(404).json("wrong password");

    const { password, ...others } = user._doc;

    const accessToken = jwt.sign(others, process.env.ACCESS_TOKEN_KEY);

    res.status(200).json(accessToken);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get current user from token
router.get("/currentuser", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json("not a valid user");

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
    if (err) return res.status(400).json("not a valid user");

    res.status(200).json(user);
  });
});

module.exports = router;
