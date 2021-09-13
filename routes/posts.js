const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// get all posts
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);

    if (user.isAdmin) {
      const posts = await Post.find({});
      res.status(200).json(posts);
    } else {
      res.status(403).json("you cant access all the posts");
    }
  } catch (err) {
    res.status(500).json(error);
  }
});

// get posts by id
router.get("/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: res.params.userId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const frinedsPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );

    res.json(userPosts.concat(...frinedsPosts));
  } catch (error) {
    res.status(500).json(error);
  }
});

// new post
router.post("/newpost", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update post
router.put("/updatepost/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).status("updated");
    } else {
      res.status(403).json("who are you ?");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete post
router.delete("/deletepost/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne({ $set: req.body });
      res.status(200).json("deleted");
    } else {
      res.status(403).json("who are you ?");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// like a post
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.include(req.params.id)) {
      await post.updateOne({ $push: { likes: req.body.friendId } });
      res.status(200).json("liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.friendId } });
      res.status(200).json("disliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// comment on post
router.put("/comment/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = {
      userId: req.body.userId,
      commnet: req.body.commnet,
    };

    await post.updateOne({ $push: { comments: comment } });

    res.status(200).json("comment added");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
