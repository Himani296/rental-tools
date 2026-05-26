

// REGISTER
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

/*
====================================
REGISTER ROUTE
====================================
*/
router.post("/register", async (req, res) => {
  try {
    console.log("Register API Hit ✅");

    const { username, email, password, displayName } = req.body;

    const existingUser = await User.findOne({ username });
    const user = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    if (user) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      displayName
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    console.log("REGISTER ERROR 👉", error);
    res.status(500).json({ message: "Signup failed" });
  }
});

//login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    const user = await User.findOne({
      $or: [
        { username: trimmedUsername },
        { email: trimmedUsername }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(trimmedPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    res.json({
      token,
      _id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName
    });

  } catch (error) {
    console.log("LOGIN ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
====================================
GET USER
====================================
*/
router.get("/:id", async (req, res) => {
  try {
    console.log("GET USER ROUTE HIT");

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
====================================
UPDATE USER / ACCOUNT SETTINGS
====================================
*/
router.put("/:id", async (req, res) => {
  try {
    const {
      displayName,
      email,
      language,
      company,
      currentPassword,
      newPassword
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof displayName === "string") {
      user.displayName = displayName.trim();
    }

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailOwner = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id }
      });

      if (emailOwner) {
        return res.status(400).json({ message: "Email already registered" });
      }

      user.email = normalizedEmail;
    }

    if (typeof language === "string") {
      user.language = language;
    }

    if (company && typeof company === "object") {
      user.company = {
        ...(user.company || {}),
        ...company,
        address: {
          ...((user.company && user.company.address) || {}),
          ...((company && company.address) || {})
        }
      };
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (String(newPassword).trim().length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      user.password = await bcrypt.hash(String(newPassword).trim(), 10);
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;
    res.json(safeUser);
  } catch (error) {
    console.log("UPDATE USER ERROR 👉", error);
    res.status(500).json({ message: "Failed to update account" });
  }
});

module.exports = router;