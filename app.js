const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
//const cors = require('cors');
//const cookieParser = require('cookie-parser'); */

const { PORT = 3000 } = process.env;
const app = express();

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

//const { requestLogger, errorLogger } = require('./middlewares/logger');

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const Router = require('./routes/routes');

//app.use(cookieParser());

app.use(requestLogger);

/* app.use(cors({
  origin: ['http://eganovich.nomoredomains.rocks', 'https://eganovich.nomoredomains.rocks'],
  credentials: true,
})); */

app.use(Router);

//app.use(errorLogger);

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