const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const keys = require('../config/keys');
const errorHandler = require('../utils/errorHandler');

module.exports.login = async function(req, res) {
  if (req.body.email && req.body.password) {
    const candidate = await User.findOne({ email: req.body.email });
    if (candidate) {
      const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
      if (passwordResult) {
        const token = jwt.sign(
          {
            email: candidate.email,
            userId: candidate._id
          },
          keys.jwt,
          { expiresIn: 60 * 60 }
        );
        res.status(200).json({ token: `Bearer ${token}` });
      } else {
        res.status(401).json({
          message: `Password doesn't match.`
        });
      }
    } else {
      res.status(404).json({
        message: 'User is not exist.'
      });
    }
  } else {
    res.status(400).json({
      message: 'Bad request, no email or password.'
    });
  }
};

module.exports.register = async function(req, res) {
  if (req.body.email && req.body.password) {
    const candidate = await User.findOne({ email: req.body.email });
    if (candidate) {
      res.status(409).json({
        message: 'Email is already in use.'
      });
    } else {
      const salt = bcrypt.genSaltSync(10);
      const password = req.body.password;
      const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(password, salt)
      });

      try {
        await user.save();
        res.status(201).json(user);
      } catch (e) {
        errorHandler(res, e);
        res.status(500).json({
          message: 'Something went wrong, please try again later.'
        });
      }
    }
  } else {
    res.status(400).json({
      message: 'Bad request, no email or password.'
    });
  }
};
