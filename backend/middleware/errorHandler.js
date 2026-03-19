const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;

