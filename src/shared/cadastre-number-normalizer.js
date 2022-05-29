module.exports = function (cadastreNumber) {
  const num = (cadastreNumber || '').replace(/[^0-9]/g, '');

  if (!num || num.length < 11 || num.length > 20) {
    return null;
  }

  if (num.length > 11) {
    // Building cadastral designations
    return num.substr(0, 14);
  }

  // Land cadastral designations
  return num.substr(0, 11);
};
