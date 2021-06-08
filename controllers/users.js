require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const NotUniqueEmailError = require('../errors/not-unique-email-error');
const AuthFailedError = require('../errors/auth-failed-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUserInfo = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такой пользователь не найден');
      }
      return res.send(user);
    })
    .catch(next);
};


module.exports.updateUserInfo = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такой пользователь не найден');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`);
      } else if (err.name === 'MongoError' && err.code === 11000) {
        throw new NotUniqueEmailError('Пользователь с таким email уже существует');
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      User.create({
        email: req.body.email,
        name: req.body.name,
        password: hash,
      })
        .then((user) => res.send({
          _id: user._id,
          email: user.email,
          name: user.name,
        }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new ValidationError(`${Object.values(err.errors)
              .map((error) => error.message)
              .join(', ')}`);
          } else if (err.name === 'MongoError' && err.code === 11000) {
            throw new NotUniqueEmailError('Пользователь с таким email уже существует');
          } else {
            next(err);
          }
        })
        .catch(next);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthFailedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthFailedError('Неправильные почта или пароль');
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    })
    .catch(next);
};