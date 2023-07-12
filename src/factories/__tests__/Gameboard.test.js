const Gameboard = require("../Gameboard");
const Player = require("../Player");

const fakeGameboard = Gameboard();
fakeGameboard.initializeBoard();

/*======================================== comment ======================================== */
test("testing the length of the game board", () => {
  expect(fakeGameboard.board.length).toBe(100);
});

test("confirming keys of each square on the board", () => {
  expect(fakeGameboard.getSquare(1)).toEqual({
    square: 1,
    occupied: null,
  });
});

/*======================================== comment ======================================== */
test("checking one available square", () => {
  expect(fakeGameboard.checkSquares(51)).toBeTruthy();
});

test("checking one unavailable square", () => {
  expect(fakeGameboard.checkSquares(101)).toBeFalsy();
});

test("checking array of available squares", () => {
  expect(fakeGameboard.checkSquares([50, 51, 52])).toBeTruthy();
});

test("checking available squares not in an array", () => {
  expect(fakeGameboard.checkSquares(50, 51, 52)).toBeTruthy();
});

test("testing for falsy return value with available and unavailable", () => {
  expect(fakeGameboard.checkSquares(104, 1, 3, 4)).toBeFalsy();
});

test("testing for falsy return value with an array of available and unavailable", () => {
  expect(fakeGameboard.checkSquares([104, 1, 3, 4])).toBeFalsy();
});

/*======================================== comment ======================================== */
const testGame = Gameboard();
testGame.initializeBoard();

const playerOne = Player("player one");
const playerTwo = Player("player two");

test("checking that ships were placed correctly", () => {
  testGame.placeShip(playerOne.getShip("carrier"), [1, 2, 3, 4, 5]);
  expect(playerOne.getShip("carrier").getSquares()).toContain(1);
  expect(playerOne.getShip("carrier").occupied).not.toBeNull();
  expect(playerOne.getShip("carrier").getSquares()).toContain(2);
  expect(playerOne.getShip("carrier").getSquares()).toContain(3);
  expect(playerOne.getShip("carrier").getSquares()).toContain(4);
  expect(playerOne.getShip("carrier").getSquares()).toContain(5);
  expect(playerOne.getShip("carrier").getSquares()).not.toContain(6);
});

test("checking that ships were placed incorrectly", () => {
  testGame.placeShip(playerOne.getShip("battleship"), [1, 2, 3, 105]);
  // returns undefined and ships.squares is an empty array
  expect(
    testGame.placeShip(playerOne.getShip("battleship"), [1, 2, 3, 105])
  ).toBe(undefined);
});

test("checking that after placing ships that squares are marked occupied", () => {
  expect(testGame.getSquare(1).occupied).toBeTruthy();
  expect(testGame.getSquare(2).occupied).toBeTruthy();
  expect(testGame.getSquare(3).occupied).toBeTruthy();
  expect(testGame.getSquare(4).occupied).toBeTruthy();
  expect(testGame.getSquare(5).occupied).toBeTruthy();
  // checking for square that is not assigned a ship
  expect(testGame.board[6].occupied).toBeNull();
});

/*======================================== comment ======================================== */
test("testing for a valid hit on ship", () => {
  testGame.receiveAttack(1, playerOne);
  expect(playerOne.getShip("carrier").getSquare(1).hit).toBe(true);
});

test("testing for a invalid hit on ship", () => {
  expect(playerOne.getShip("carrier").getSquare(2).hit).toBe(false);
});

test("testing for miss", () => {
  testGame.receiveAttack(100, playerOne);
  expect(testGame.getSquare(100).occupied).toBe("miss");
});

/*======================================== comment ======================================== */
test("testing for a sunken ship to return true", () => {
  testGame.receiveAttack(1, playerOne);
  testGame.receiveAttack(2, playerOne);
  testGame.receiveAttack(3, playerOne);
  testGame.receiveAttack(4, playerOne);
  testGame.receiveAttack(5, playerOne);
  expect(playerOne.getShip("carrier").sunk()).toBe(true);
});

test("testing for a ship thats not sunk to return false", () => {
  expect(playerTwo.getShip("carrier").sunk()).toBe(false);
});

/*======================================== comment ======================================== */
test("testing for ai to make ai logical choice and count hits", () => {
  expect(
    playerOne.getShip("carrier").squares.filter((square) => square.hit).length
  ).toBe(5);
});

test("testing direction test for ai logical choice", () => {
  const arr1 = [11, 21, 31, 41, 51, 61, 71, 81, 91];
  const arr2 = [51, 52, 53, 54, 55, 56, 57, 58, 59];

  expect(arr1.every((el, i) => el % 10 === arr1[0] % 10)).toBe(true);
  expect(arr2.every((el, i) => el % 10 === arr2[0] % 10)).toBe(false);
});

/*======================================== comment ======================================== */
test("checking for surrounding squares", () => {
  expect(fakeGameboard.getSurroundingSquares(45)).toContain(46);
  expect(fakeGameboard.getSurroundingSquares(45)).toContain(44);
  expect(fakeGameboard.getSurroundingSquares(45)).toContain(55);
  expect(fakeGameboard.getSurroundingSquares(45)).toContain(35);
});

test("testing for square above 100 to return null", () => {
  expect(fakeGameboard.getSurroundingSquares(95)).not.toContain(105);
});

test("testing for square below 1 to return null", () => {
  expect(fakeGameboard.getSurroundingSquares(5)).not.toContain(-5);
});

test("testing for square at end of row to return null", () => {
  expect(fakeGameboard.getSurroundingSquares(50)).not.toContain(51);
});

test("testing for square at beginning of row to return null", () => {
  expect(fakeGameboard.getSurroundingSquares(21)).not.toContain(20);
});

/*======================================== comment ======================================== */
const randomBoard = Gameboard();
randomBoard.initializeBoard();
const AI = Player("ai", true);

test("testing for randomly placed ships", () => {
  AI.ships.forEach((ship) => {
    while (true) {
      randomBoard.placeShipRandomly(ship);
      if (ship.squares.length > 0) {
        break;
      }
    }
  });
  expect(AI.getShip("carrier").squares.length === AI.getShip("carrier").length);
  expect(
    AI.getShip("submarine").squares.length === AI.getShip("submarine").length
  );
  expect(AI.getShip("cruiser").squares.length === AI.getShip("cruiser").length);
  expect(
    AI.getShip("destroyer").squares.length === AI.getShip("destroyer").length
  );
  expect(
    AI.getShip("battleship").squares.length === AI.getShip("battleship").length
  );
});

/*======================================== comment ======================================== */
