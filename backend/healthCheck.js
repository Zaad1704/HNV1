const mongoose = require('mongoose');

const checkMongo = () => {
  const isConnected = mongoose.connection.readyState === 1;
  return {
    status: isConnected ? 'up' : 'down',
    ...(!isConnected && { reason: `MongoDB connection state is: ${mongoose.connection.readyState}` }),
  };
};

const healthCheckHandler = async (req, res) => {
  const checks = {
    mongodb: checkMongo(),
  };

  const isHealthy = Object.values(checks).every((check) => check.status === 'up');
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'ok' : 'error',
    details: checks,
  });
};

module.exports = { healthCheckHandler };