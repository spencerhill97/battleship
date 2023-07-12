const Ship = (name, length) => {
  let squares = [];

  function addSquare(number) {
    if (number === undefined) {
      return console.log("error");
    }

    squares.length = 0;

    const iterable = (Array.isArray(number) && number) ||
      (arguments.length > 1 && Array.from(arguments)) || [number];

    iterable.forEach((el) => squares.push({ square: el, hit: false }));
  }

  function hit(number) {
    squares.forEach((el, index) => {
      if (el.square === number) {
        el.hit = true;
      }
    });

    sunk();
  }

  function getSquares() {
    if (squares.length) return squares.map((el) => el.square);
  }

  function getSquare(number) {
    return squares.find((el) => el.square === number);
  }

  function sunk() {
    if (squares[0] === undefined) return false;
    return squares.map((el) => el.hit).every((el) => el === true);
  }

  return { squares, hit, sunk, addSquare, name, length, getSquares, getSquare };
};

module.exports = Ship;
