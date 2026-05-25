const jwt = require("jsonwebtoken");

const JWT_SECRET = "my_super_secret_key";

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      error: "No token provided"
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({
      error: "Invalid token"
    });
  }
}

module.exports = auth;