function parseString(str) {
  if (!str) return;
  const regex = new RegExp("[0-9]+", "");
  return Number(str.match(regex)[0]);
}

module.exports = parseString;
