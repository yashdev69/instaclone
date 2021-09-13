const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// get all users (for admin)
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (user.isAdmin === true) {
      const allusers = await User.find({});
      res.status(200).json(allusers);
    } else {
      res.status(400).json("who are you ?");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get user by id
router.get("/", async (req, res) => {
  const userId = req.body.userId;
  const email = req.query.email;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ email: email });
    const { password, ...others } = user._doc;

    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error);
  }
});

// search users by username
router.get("/search/:term", async (req, res) => {
  try {
    const term = req.params.term;
    const users = await User.find({ username: { $regex: ".*" + term + ".*" } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update user by id
router.put("/updateuser/:id", async (req, res) => {
  if (req.body.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } catch (error) {
      res.status(400).json(error);
    }
  }
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });

    res.status(200).json("updated successfulley");
  } catch (error) {
    res.status(403).json(error);
  }
});

// make a follow request
router.put("/followrequest/:userId", async (req, res) => {
  if (req.body.userId === req.params.userId || req.body.isAdmin) {
    try {
      const friend = await User.findById(req.body.friendId);

      await friend.updateOne({ $push: { requests: req.body.userId } });
      res.status(200).json("request sent");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("who are you ?");
  }
});

// accept the request
router.put("/acceptrequest/:userId", async (req, res) => {
  if (req.params.userId === req.body.userId || req.body.isAdmin) {
    try {
      const currentUser = await User.findById(req.body.userId);
      const friend = await User.findById(req.body.friendId);

      await currentUser.updateOne({ $push: { followers: req.body.friendId } });
      await friend.updateOne({ $push: { following: req.body.userId } });

      await currentUser.updateOne({ $pull: { requests: req.body.friendId } });

      res.status(200).json("request accepted");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("who are you ?");
  }
});

// reject request
router.put("/rejectrequest/:userId", async (req, res) => {
  if (req.body.userId === req.params.userId || req.body.isAdmin) {
    try {
      const user = await User.findById(req.body.userId);
      await user.updateOne({ $pull: { requests: req.body.friendId } });

      res.status(200).json("rejected");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("who are you ?");
  }
});

// unfollow user
router.put("/unfollowuser/:userId", async (req, res) => {
  if (req.body.userId === req.params.userId || req.body.isAdmin) {
    try {
      const user = await User.findById(req.body.userId);
      await user.updateOne({ $pull: { following: req.body.friendId } });

      res.status(200).json("unfollowed successfulley");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("who are you ?");
  }
});

module.exports = router;

// block user (for admin)
