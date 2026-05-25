const User = require("../models/User");

async function admin(req, res, next) {
  try {
    const user = await User.findOne({
      username: req.user.username
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access only"
      });
    }

    next();

  } catch (err) {
    res.status(500).json({
      error: "Server error"
    });
  }
}

module.exports = admin;