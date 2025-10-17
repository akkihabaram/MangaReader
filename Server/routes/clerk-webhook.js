const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { Webhook } = require("svix");

// This endpoint receives webhooks from Clerk
router.post("/", async (req, res) => {
  try {
    // Get the signing secret from environment
    const signingSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!signingSecret) {
      console.warn("Warning: CLERK_WEBHOOK_SECRET not set");
      // For development without webhook signature verification
      const event = req.body;
      return handleClerkEvent(event, res);
    }

    // Verify the webhook signature
    const wh = new Webhook(signingSecret);
    const headers = req.headers;

    const payload = req.body;
    const evt = wh.verify(payload, headers);

    handleClerkEvent(evt, res);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: error.message });
  }
});

async function handleClerkEvent(evt, res) {
  try {
    if (evt.type === "user.created") {
      const { id, email_addresses, username } = evt.data;

      const primaryEmail =
        email_addresses.find((e) => e.primary)?.email_address || email_addresses[0]?.email_address;

      if (!primaryEmail) {
        return res.status(400).json({ error: "No email found in Clerk user" });
      }

      // Check if this is the first user
      const existingUsers = await User.countDocuments();
      const isFirstUser = existingUsers === 0;

      // Create user in MongoDB
      const newUser = new User({
        clerkId: id,
        email: primaryEmail,
        username: username || primaryEmail.split("@")[0],
        role: isFirstUser ? "owner" : "user",
        isFirstUser,
      });

      await newUser.save();

      console.log(
        `User created: ${primaryEmail} as ${newUser.role}${isFirstUser ? " (FIRST USER - OWNER)" : ""}`
      );

      res.json({
        success: true,
        message: isFirstUser ? "First user created as owner" : "User created",
        user: newUser,
      });
    } else if (evt.type === "user.updated") {
      const { id, email_addresses, username } = evt.data;

      const primaryEmail =
        email_addresses.find((e) => e.primary)?.email_address || email_addresses[0]?.email_address;

      await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: primaryEmail,
          username: username || primaryEmail.split("@")[0],
          updatedAt: Date.now(),
        },
        { new: true }
      );

      console.log(`User updated: ${primaryEmail}`);

      res.json({ success: true, message: "User updated" });
    } else if (evt.type === "user.deleted") {
      const { id } = evt.data;

      await User.findOneAndDelete({ clerkId: id });

      console.log(`User deleted: ${id}`);

      res.json({ success: true, message: "User deleted" });
    } else {
      res.json({ success: true, message: "Event type not handled" });
    }
  } catch (error) {
    console.error("Event handling error:", error);
    throw error;
  }
}

module.exports = router;
