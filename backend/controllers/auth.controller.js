import bcrypt from 'bcryptjs'
import User from "../models/user.models.js";
import generateTokenAndSetCookie from '../utils/generateToken.js';



//signup controllers
export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords don't match"
      });
    }

    const user = await User.findone({ username });

    if (user) {
      return res.status(400).json({ error: "username already exists" })
    }

    //Hash Password
    const salt = await bcrypt.getSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //https://avatar-placeholder.iran.liara.run/document
    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`

    const newUser = await User({
      fullName,
      username,
      password: hashPassword,
      gender,
      profilePic: gender === 'male' ? boyProfilePic : girlProfilePic
    })

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        profilePic: newUser.profilePic
      })
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" })
  }
}

//Login controllers
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      profilePic: user.profilePic
    })
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" })
  }
}

//logout controllers
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" })
  }
}