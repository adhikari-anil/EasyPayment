const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User, Account } = require("../model/dataModel");
const { authMiddleware } = require("../middleware");

const router = express.Router();
const sendMail = require("../services/sendMail");
const Mailgen = require("mailgen");

const EMAIL = process.env.EMAIL;

// Zod validation...
const signupSchema = zod.object({
  username: zod.string(),
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string(),
});

//SignUp and SignIn routes...
router.post("/signup", async (req, res) => {
  const { success } = signupSchema.safeParse(req.body);

  if (!success) {
    return res.json({
      message: "Wrong Inputs...",
    });
  }
  const existingUser = await User.findOne({
    username: req.body.username,
  });

  if (existingUser) {
    return res.status(400).json({
      message: " Email is already taken...",
    });
  }

  const user = await User.create({
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    password: req.body.password,
  });

  const userId = user._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET
  );

  res.json({
    message: "User created successfully",
    userId: userId,
    token: token,
  });
});

// SignIn route starts.....
// Zod validation...
const signinSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  const { success } = signinSchema.safeParse(req.body);
  if (!success) {
    return res.json({
      message: "Wrong Inputs....",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });
  console.log(user);

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET
    );

    return res.json({
      message: "SignIn successful",
      token: token,
    });
  }

  return res.status(404).json({
    message: "Error on signin routes",
  });
});

// Edit user info route....
const updateUserSchema = zod.object({
  password: zod.string(),
  firstname: zod.string(),
  lastname: zod.string(),
});

router.put("/update", authMiddleware, async (req, res) => {
  const { success } = updateUserSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Wrong inputs...",
    });
  }

  await User.updateOne(req.body, {
    id: req.userId,
  });

  return res.status(200).json({
    message: "Updated Successfully....",
  });
});

// route for filtring other users...
router.get("/otherUser", authMiddleware, async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstname: {
          $regex: filter,
        },
      },
      {
        lastname: {
          $regex: filter,
        },
      },
    ],
  });
  console.log("From user Filter", users);

  if (users.length == 0) {
    return res.status(404).json({
      message: "No any user with such names..",
    });
  }
  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      _id: user._id,
    })),
  });
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.userId,
    });
    console.log(user);
    res.status(200).json({
      user,
    });
  } catch (error) {
    return res.json({
      message: "Error in /me route..",
    });
  }
});


// Sending mail from real account...
router.post("/forgetPassword", async (req, res) => {
  const email = req.body.username;
  const user = await User.findOne({ username: email });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  //const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  // Integrating email sending process to send token with link..

  let MailGenerator = new Mailgen({
    theme: "salted",
    product: {
      name: "OTP code",
      link: "https://mailgen.js",
    },
  });
  
  let response = {
    body: {
      name: user.firstname,
      title: "Generated OTP is : ",
      intro: "You have received an OTP code",
      outro:
        "If you did not request a password reset, no further action is required on your part.",
    },
  };
  
  let mail = MailGenerator.generate(response);

  await sendMail(email,EMAIL,"Recieving OTP",mail);
  res.json({
    message: "Email Sent"
  })
});

router.post("/verify-otp", async (req, res) => {
  try {
    const email = req.body.email;
    const otprecived = req.body.otp;
    const otp = parseInt(otprecived, 10);
    console.log(otp);  
    console.log(otpStorage[email]); 
    if (otpStorage[email] === otp) {
      delete otpStorage[email]; 
      return res.json({
        check: true,
      });
    } else {
      return res.status(500).json({
        msg: "Invalid OTP",
      });
    }
    //   // hashing password...
    //   const salt = await bycrypt.genSalt(10);
    //   req.body.newPassword = await bycrypt.hash(req.body.newPassword, salt);

    //   // update password...
    //   user.password = req.body.newPassword;
    //   await user.save();
    //   res.status(200).send({ message: "Password updated" });
    // } catch (error) {
    //   console.log("Error in Reset Route: ", error);
    //   res.status(500).json({ error: error.message });
    // }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
