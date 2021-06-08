const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email - обязательно поле'],
    unique: true,
    validate: [validator.isEmail, 'Неправильный email'],
  },
  password: {
    select: false,
    type: String,
    required: [true, 'Пароль - обязательно поле'],
  },
  name: {
    type: String,
    default: 'noname',
    required: false,
    minlength: [2, 'Имя должно быть 2 или более символов'],
    maxlength: [30, 'Имя не должно быть длиннее 30 символов'],
  },
});

module.exports = mongoose.model('user', userSchema);