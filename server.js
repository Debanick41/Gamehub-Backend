require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const auth = require("./middleware/auth");
const admin = require("./middleware/admin");

const app = express();

const JWT_SECRET =  process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

mongoose.connect(
  process.env.MONGODB_URI
)
.then(() => {
  console.log("MongoDB connected ✅");
})
.catch((err) => {
  console.log(err);
});

app.get("/admin/users", auth, admin, async (req, res) => {
  res.json({
    message: "GameHub backend is running 🚀"
  });
});


// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({
      username
    });

    if (existing) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      username,
      password: hashedPassword
    });

    res.json({
      message: "User created",
      username: user.username
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid username"
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(400).json({
        error: "Wrong password"
      });
    }

    const token = jwt.sign(
      {
        username: user.username
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      username: user.username,
      balance: user.balance
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});


// GET USER
app.get("/user/:username", auth, async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json({
      username: user.username,
      balance: user.balance
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});


// UPDATE BALANCE
app.put("/user/:username/balance", auth, async (req, res) => {
  try {
    const { balance } = req.body;

    const user = await User.findOneAndUpdate(
      {
        username: req.params.username
      },
      {
        balance
      },
      {
        new: true
      }
    );

    res.json(user);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});


// ADMIN DASHBOARD
app.get("/admin/users", auth, async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});