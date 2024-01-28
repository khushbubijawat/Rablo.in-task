const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/products-api", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  featured: { type: Boolean, default: false },
  rating: { type: Number },
  createdAt: { type: Date, default: Date.now, required: true },
  company: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);

// Middleware for parsing JSON
app.use(bodyParser.json());

// Authentication Middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.error("No token provided");
    return res.sendStatus(401);
  }

  // Check if the token is in the correct format
  const [bearer, token] = authHeader.split(" ");

  if (bearer !== "Bearer" || !token) {
    console.error("Invalid token format");
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, "secret-key");
    const user = await User.findOne({ username: decoded.username });

    if (!user) {
      console.error("User not found");
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.sendStatus(403);
  }
}

// User Registration Endpoint
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create a new user
    const newUser = new User({ username, password });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Authentication Endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a token
    const token = jwt.sign({ username: user.username }, "secret-key");
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD Endpoints for Products

// 1) Create a product
app.post("/products", authenticateToken, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2) Read all products
app.get("/products", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3) Update a product
app.put("/products/:productId", authenticateToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4) Delete a product
app.delete("/products/:productId", authenticateToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
