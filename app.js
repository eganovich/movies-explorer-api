const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cors = require('cors');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { requestLogger, errorLogger } = require('./middlewares/logger');

const corsWhiteList = ['http://eganovich-diploma.nomoredomains.monster', 'https://eganovich-diploma.nomoredomains.monster', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (corsWhiteList.indexOf(origin) !== -1) {
      callback(null, true);
    }
  },
  credentials: true,
};

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const Router = require('./routes/routes');

app.use(requestLogger);

app.use(cors(corsOptions));

app.use(Router);

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(PORT, () => {});
