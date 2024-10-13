// Utility functions for the GFC App

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const calculateAverage = (numbers) => {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

module.exports = {
  formatDate,
  calculateAverage,
};
