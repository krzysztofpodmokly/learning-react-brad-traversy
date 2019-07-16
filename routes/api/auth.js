// Handling JWT (json web token) for authentication
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
  // by adding auth as a second parameter it makes this route protected
  try {
    // user id was decoded into the token so access to req.user.id is granted
    console.log('auth route => ', req.user);
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/',
  [
    // Validation process with express-validator => https://express-validator.github.io/docs/
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // sending email and password to /api/auth route in order to register
    // handling response
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log(req.body);
    const { email, password } = req.body;

    try {
      // 1. Check if user exists
      let user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] }); // check Postman => Users & Auth collection => Register User Error
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // jsonwebtoken
      const payload = {
        user: {
          id: user.id // this is id comming from mongoDB, mongoose replaces _id to id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 }, // in production expiration date will be set to 1 hour
        (err, token) => {
          if (err) throw err;
          console.log('TOKEN => ', token);
          res.json({ token, userId: user.id });
        }
      );

      // res.send('User logged!');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
