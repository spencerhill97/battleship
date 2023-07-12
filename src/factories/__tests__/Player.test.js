const Player = require("../Player");

const fakePlayerOne = Player("user");

test("testing for ships being declared in ships array", () => {
  expect(fakePlayerOne.ships.length).toBe(5);
});

test("testing for name", () => {
  expect(fakePlayerOne.name).toBe("user");
});

test("testing to get ship instance by name", () => {
  expect(fakePlayerOne.getShip("carrier").name).toBe("carrier");
  expect(fakePlayerOne.getShip("submarine").name).toBe("submarine");
});

test("testing to get ship instance by name", () => {
  expect(fakePlayerOne.getShip("otis")).toBeFalsy();
});

test("testing to see that AI is set to false", () => {
  expect(fakePlayerOne.AI).toBeUndefined();
});

/*======================================== testing ======================================== */
const fakeAI = Player("ai", true);

test("testing to see that AI is set to false", () => {
  expect(fakeAI.AI).toBe(true);
});
