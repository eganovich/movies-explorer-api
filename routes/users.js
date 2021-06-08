const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  updateUserInfo, getUserInfo
} = require('../controllers/users');

