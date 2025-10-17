const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Check if user exists and get their role
router.get("/:clerkId", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      username: user.username,
      role: user.role,
      isFirstUser: user.isFirstUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user (called after Clerk signup)
router.post("/create", async (req, res) => {
  try {
    const { clerkId, email, username } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: "clerkId and email are required" });
    }

    // Check if this is the first user
    const existingUsers = await User.countDocuments();
    const isFirstUser = existingUsers === 0;

    const newUser = new User({
      clerkId,
      email,
      username: username || email.split("@")[0],
      role: isFirstUser ? "owner" : "user",
      isFirstUser,
    });

    await newUser.save();

    res.status(201).json({
      message: isFirstUser
        ? "First user created as site owner/admin"
        : "User created successfully",
      user: {
        _id: newUser._id,
        clerkId: newUser.clerkId,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        isFirstUser: newUser.isFirstUser,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "User already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.patch("/:clerkId/role", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "owner"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findOneAndUpdate(
      { clerkId },
      { role, updatedAt: Date.now() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User role updated",
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-__v");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
