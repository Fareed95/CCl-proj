const { AppError } = require('../utils/errors');

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not found'
  });
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: err.message
    });
  }

  console.error(err);
  return res.status(500).json({
    error: 'Internal server error'
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
