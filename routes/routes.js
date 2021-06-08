const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-error');

const userRouter = require('./users');
const movieRouter = require('./movies');

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
    password: Joi.string().required().min(8),
  }),
}), createUser);

router.use(auth);
router.use('/users', userRouter);
router.use('/movies', movieRouter);
router.use('*', (req, res, next) => {
  try {
    throw new NotFoundError('Такой страницы не существует');
  } catch (err) {
    next(err);
  }
});

module.exports = router;