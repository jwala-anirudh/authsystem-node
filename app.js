require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

// custom middleware
const auth = require("./middleware/auth");

// import model - User
const User = require("./model/user");

const app = express();
app.use(express.json()); // discuss this later
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello auth system");
});

app.post("/register", async (req, res) => {
  try {
    // collect all information
    const { firstname, lastname, email, password } = req.body;

    // validate the data, if exists
    if (!(firstname && lastname && email && password)) {
      res.status(401).send("All fields are required");
    }

    // check if email is in correct format

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(401).send("User already found in database");
    }

    // encrypt the password
    const myEncryPassword = await bcrypt.hash(password, 10);

    // create a new entry in database
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: myEncryPassword,
    });

    // create a token and send it to user
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      "shhhhh",
      { expiresIn: "2h" }
    );
    user.token = token;
    // don't want to send the password
    user.password = undefined;

    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    console.log("Error in resgister route");
  }
});

app.post("/login", async (req, res) => {
  try {
    // collect information from frontend
    const { email, password } = req.body;

    // validate
    if (!(email && password)) {
      res.status(401).send("email and password are required");
    }

    // check user in database
    const user = await User.findOne({ email });
    // if user does not exists
    if (!user) {
      res.status(401).send("No user is found");
    }

    // match the password
    if (user && (await bcrypt.compare(password, user.password))) {
      // create a token and send
      const token = jwt.sign({ id: user._id, email }, "shhhhh", {
        expiresIn: "2h",
      });

      user.password = undefined;
      user.token = token;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user,
      });
    } else {
      res.status(400).send("email or password is incorrect");
    }
  } catch (error) {
    console.log(error);
    console.log("Error in login route");
  }
});

app.get("/dashboard", auth, (req, res) => {
  res.send("Welcome to dashboard");
});

app.get("/profile", (req, res) => {
  // access to req.user = user.id, email
  // based on id, query to DB and get all information of user - findOne({id})
  // send a json response with all data
});

module.exports = app;
