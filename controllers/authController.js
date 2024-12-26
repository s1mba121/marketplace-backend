// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Registering user with email:', email);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    console.log('User registered successfully:', user);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generated for registered user:', token);

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Logging in with email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.warn('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generated:', token);

    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

exports.logout = async (req, res) => {
    try {
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({ message: 'Error logging out', error });
    }
  };