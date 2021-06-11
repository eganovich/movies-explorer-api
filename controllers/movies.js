const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`);
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.deleteMovieById = (req, res, next) => {
  const userId = req.user._id;
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Такого фильма нет');
      } else if (movie.owner.toString() !== userId.toString()) {
        throw new ValidationError('Вы не можете удалить чужой фильм');
      } else if (movie.owner.toString() === userId.toString()) {
        Movie.findByIdAndDelete(movieId)
          .then(() => res.send(movie))
          .catch(next);
      }
    })
    .catch(next);
};
