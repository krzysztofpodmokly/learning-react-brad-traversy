// Registering users
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

// @route   POST api/users
// @desc    Route used for registering users => saving them in database
// @access  Public
router.post(
  '/',
  [
    // Validation process with express-validator => https://express-validator.github.io/docs/
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    // sending email and password to /api/auth route in order to register
    // handling response
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log(req.body);
    const { name, email, password } = req.body;

    try {
      // 1. Check if user exists
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] }); // check Postman => Users & Auth collection => Register User Error
      }

      // 2. Get users gravatar
      const avatar = gravatar.url(email, {
        // Gravatar docs => https://github.com/emerleite/node-gravatar
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      // Instance of the User is created but it's not saved yet
      user = new User({
        name,
        email,
        avatar,
        password
      });

      // 3. Encrypt password with bcryptjs => https://github.com/kelektiv/node.bcrypt.js/

      // 1st method of encrypting password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save(); // User is saved in collection which is pointed in mongoURI

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
          console.log(token);
          res.json({ token, userId: user.id });
        }
      );

      res.send('User registered in database!');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
