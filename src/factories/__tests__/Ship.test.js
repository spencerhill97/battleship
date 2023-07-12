const Ship = require("../Ship");

const fakeShip = Ship("carrier", 5);

/*======================================== comment ======================================== */
test("testing to add one square", () => {
  fakeShip.addSquare(1);
  expect(fakeShip.getSquare(1)).toEqual({ square: 1, hit: false });
});

test("testing to add multiple squares", () => {
  fakeShip.addSquare(2, 3);
  expect(fakeShip.getSquare(2)).toEqual({ square: 2, hit: false });
  expect(fakeShip.getSquare(3)).toEqual({ square: 3, hit: false });
});

test("testing to add an array of squares", () => {
  fakeShip.addSquare([4, 5]);
  expect(fakeShip.getSquare(4)).toEqual({ square: 4, hit: false });
  expect(fakeShip.getSquare(5)).toEqual({ square: 5, hit: false });
});

/*======================================== comment ======================================== */

test("checking for hit", () => {
  fakeShip.hit(5);
  expect(fakeShip.getSquare(5).hit).toBe(true);
});

/*======================================== comment ======================================== */

test("looking for ship to return sunk", () => {
  fakeShip.hit(2);
  fakeShip.hit(3);
  fakeShip.hit(4);
  fakeShip.hit(5);
  console.log(fakeShip.squares);
  expect(fakeShip.sunk()).toBe(true);
});

const fakeShipTwo = Ship("destroyer", 2);

test("looking for ship to return not sunk / false", () => {
  fakeShipTwo.addSquare(99, 100);
  fakeShipTwo.hit(99);
  expect(fakeShipTwo.sunk()).toBe(false);
  expect(fakeShipTwo.getSquare(99).hit).toBe(true);
});
