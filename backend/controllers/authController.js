const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"PayApt" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your PayApt Login OTP',
    html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Expires in 10 minutes.</p>`,
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password 
    });

    res.status(201).json({
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +twoFactorOTP +twoFactorOTPExpire');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorOTP = otp;
      user.twoFactorOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      await sendOTPEmail(user.email, otp);
      return res.json({ requires2FA: true, userId: user._id, message: 'OTP sent to your email' });
    }

user.lastLogin = new Date();
user.lastLoginDevice = req.headers['user-agent'];
await user.save({ validateBeforeSave: false });

res.json({
  token: generateToken(user._id),
  user: { id: user._id, name: user.name, email: user.email, lastLogin: user.lastLogin },
});
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+twoFactorOTP +twoFactorOTPExpire');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.twoFactorOTP !== otp || user.twoFactorOTPExpire < new Date())
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    user.twoFactorOTP = undefined;
    user.twoFactorOTPExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, verifyOTP, enable2FA, getMe };
module.exports = { register, login, verifyOTP, enable2FA, getMe, changePassword };