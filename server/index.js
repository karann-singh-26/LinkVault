
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const linkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Link = mongoose.model("Link", linkSchema);

// Test whether the server is running
app.get("/api/health", (req, res) => {
  res.json({ message: "LinkVault backend is running!" });
});

// Get all saved links
app.get("/api/links", async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });

    res.json(
      links.map((link) => ({
        ...link.toObject(),
        shortUrl: `${process.env.BASE_URL || "http://localhost:5000"}/${link.shortCode}`
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Could not load links" });
  }
});

// Create a short link
app.post("/api/links", async (req, res) => {
  try {
    let { originalUrl } = req.body;

    if (!originalUrl || typeof originalUrl !== "string") {
      return res.status(400).json({ message: "Please enter a URL" });
    }

    originalUrl = originalUrl.trim();

    let parsedUrl;
    try {
      parsedUrl = new URL(originalUrl);
    } catch {
      return res.status(400).json({ message: "Please enter a valid URL" });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ message: "Only HTTP and HTTPS URLs are allowed" });
    }

    let shortCode;
    let exists = true;

    while (exists) {
      shortCode = crypto.randomBytes(3).toString("hex");
      exists = await Link.exists({ shortCode });
    }

    const link = await Link.create({ originalUrl, shortCode });

    res.status(201).json({
      ...link.toObject(),
      shortUrl: `${process.env.BASE_URL || "http://localhost:5000"}/${shortCode}`
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create short link" });
  }
});

// Redirect and count clicks
app.get("/:code", async (req, res) => {
  try {
    const link = await Link.findOne({ shortCode: req.params.code });

    if (!link) {
      return res.status(404).send("Short link not found");
    }

    link.clicks += 1;
    await link.save();

    res.redirect(link.originalUrl);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    app.listen(PORT, () => {
      console.log(`LinkVault backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
