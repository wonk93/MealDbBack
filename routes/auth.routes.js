const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./../models/User.model");
const { isAuthenticated } = require("../middlewares/verifyToken.middleware");
const saltRounds = 10;

router.post("/signup", (req, res, next) => {
  const { email, password, userName } = req.body;

  if (email === "" || password === "" || userName === "") {
    res
      .status(400)
      .json({
        message:
          "Se requiere email, contraseña, nombre de usuario y nombre completo",
      });
    return;
  }

  if (password.length < 8) {
    res
      .status(400)
      .json({ message: "Password must have at least 8 characters" });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      return User.create({ email, password: hashedPassword, userName });
    })
    .then((createdUser) => {
      const { email, userName, _id } = createdUser;
      const user = { email, userName, _id };

      res.status(201).json({ user });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found." });
        return;
      }

      if (bcrypt.compareSync(password, foundUser.password)) {
        const { _id, email, userName } = foundUser;

        const payload = { _id, email, userName };

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.json({ authToken, user: payload });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err));
});

router.get("/verify", isAuthenticated, (req, res, next) => {
  res.status(200).json(req.payload);
});

module.exports = router;
