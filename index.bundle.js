(self["webpackChunkbattleship1"] = self["webpackChunkbattleship1"] || []).push([["index"],{

/***/ "./src/factories/DOM.js":
/*!******************************!*\
  !*** ./src/factories/DOM.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Gameboard = __webpack_require__(/*! ./Gameboard */ "./src/factories/Gameboard.js");
const Player = __webpack_require__(/*! ./Player */ "./src/factories/Player.js");
const Drag = __webpack_require__(/*! ./Drag */ "./src/factories/Drag.js");
const parseString = __webpack_require__(/*! ../utilities/parseString */ "./src/utilities/parseString.js");
const DOM = () => {
  let userBoard = Gameboard();
  let user = Player("you");
  let aiBoard = Gameboard();
  let AI = Player("computer");
  let drag = Drag(userBoard, user);
  function initGame() {
    initBoard();
    initShips();
  }
  function header() {
    const h1 = document.createElement("h1");
    h1.innerText = "Battleship";
    h1.classList.add("title");
    document.body.append(h1);
  }
  function initBoard() {
    userBoard.initializeBoard();
    const board = document.createElement("section");
    board.classList.add("board");
    const playerBoard = document.createElement("article");
    playerBoard.classList.add("player-board");
    board.append(playerBoard);
    playerBoard.addEventListener("dragover", drag.dragOver);
    playerBoard.addEventListener("drop", drag.dropShip);
    userBoard.board.forEach((num, index) => {
      const playerSquare = document.createElement("div");
      playerSquare.classList.add("square", index + 1);
      playerBoard.append(playerSquare);
    });
    document.body.append(board);
  }
  function initShips() {
    const shipDiv = document.createElement("section");
    shipDiv.classList.add("ship-div");
    document.querySelector(".board").append(shipDiv);
    const title = document.createElement("h2");
    title.classList.add("directions", "title");
    title.innerText = "Place your ships!";
    shipDiv.append(title);
    const directions = document.createElement("p");
    directions.classList.add("directions");
    directions.innerText = "Double click your ships to rotate them!";
    shipDiv.append(directions);
    user.ships.reverse().forEach(ship => {
      const currentShip = document.createElement("div");
      currentShip.classList.add("ship");
      currentShip.setAttribute("id", ship.name);
      currentShip.draggable = true;
      let index = 0;
      while (index < ship.length) {
        const sq = document.createElement("div");
        sq.classList.add("ship-square");
        sq.setAttribute("id", index + 1);
        currentShip.append(sq);
        currentShip.addEventListener("dragstart", drag.dragStart);
        currentShip.addEventListener("dblclick", drag.doubleClick);
        index++;
      }
      shipDiv.append(currentShip);
    });
    shipDiv.addEventListener("change", e => {
      e.preventDefault();
      initAI();
      shipDiv.remove();
      document.querySelectorAll(".square").forEach(square => {
        square.style.position = "relative";
      });
    });
  }
  function initAI() {
    aiBoard.initializeBoard();
    const board = document.querySelector(".board");
    const enemyBoard = document.createElement("article");
    enemyBoard.classList.add("enemy-board");
    document.querySelector(".board").append(enemyBoard);
    console.log(aiBoard.board);
    aiBoard.board.forEach((num, index) => {
      const enemySquare = document.createElement("div");
      enemySquare.classList.add(index + 1, "square");
      enemyBoard.append(enemySquare);
      enemySquare.addEventListener("click", e => {
        if (enemySquare.firstChild) {
          return;
        } else if (user.ships.every(ship => ship.sunk())) {
          return initGameOver();
        }
        const sq = parseString(e.target.classList.value);
        aiBoard.receiveAttack(sq, AI);
        if (aiBoard.getSquare(sq).occupied === "miss") {
          const piece = document.createElement("div");
          piece.classList.add("piece");
          e.target.append(piece);
        } else if (aiBoard.getSquare(sq).occupied === "hit") {
          const piece = document.createElement("div");
          piece.innerText = "X";
          piece.classList.add("hit");
          e.target.append(piece);
        }
        if (AI.ships.every(ship => ship.sunk())) {
          return initGameOver();
        }
        aiBoard.aiTurn(user, userBoard);
      });
    });
    AI.ships.forEach(ship => {
      const currentShip = document.createElement("div");
      currentShip.classList.add("ship");
      currentShip.setAttribute("id", ship.name);
      let index = 0;
      while (index < ship.length) {
        const sq = document.createElement("div");
        sq.classList.add("ship-square");
        sq.setAttribute("id", index + 1);
        currentShip.append(sq);
        index++;
      }
      const randomStartingIndex = Math.floor(Math.random() * aiBoard.board.length + 1);
      while (true) {
        aiBoard.placeShipRandomly(ship);
        if (ship.squares.length > 0) {
          break;
        }
      }
    });
    board.prepend(enemyBoard);
    // startGame();
  }

  function initGameOver() {
    // _gameOver = false;
    let winner;
    if (user.ships.every(ship => ship.sunk())) {
      winner = AI.name;
    } else {
      winner = user.name;
    }
    const gameOverModal = document.createElement("section");
    gameOverModal.classList.add("game-over");
    gameOverModal.innerHTML = `
      <div>
        <p>
          ${winner.toUpperCase()} won the game!
        </p>
        <button type="button" class="restart btn">
          restart
        </button>
      </div>
    `;
    document.body.append(gameOverModal);
    restartBtn = document.querySelector(".restart.btn");
    restartBtn.addEventListener("click", e => {
      window.location.reload();
    });
  }
  return {
    initGame,
    header
  };
};
module.exports = DOM;

/***/ }),

/***/ "./src/factories/Drag.js":
/*!*******************************!*\
  !*** ./src/factories/Drag.js ***!
  \*******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const parseString = __webpack_require__(/*! ../utilities/parseString */ "./src/utilities/parseString.js");
const Drag = (board, player) => {
  const _rowLength = 10;
  function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
  function dropShip(event) {
    event.preventDefault();
    if (Array.from(event.target.classList).includes("ship-square")) {
      return;
    }
    const shipID = event.dataTransfer.getData("text/plain");
    const droppedShip = document.getElementById(shipID);
    const checkHorizontal = Array.from(droppedShip.classList).includes("horizontal") === true;
    const shipLength = Number(droppedShip.lastChild.id);
    const startingIndex = parseString(event.target.classList.value);
    const checkSpace = startingIndex % 10 === 0 ? 0 : _rowLength - startingIndex % 10 + 1;
    const squares = checkHorizontal ? Array.from({
      length: shipLength
    }, (el, index) => startingIndex + index) : Array.from({
      length: shipLength
    }, (el, index) => startingIndex + index * 10);
    if (checkHorizontal && checkSpace < shipLength) {
      return;
    } else if (!board.checkSquares(squares)) {
      return;
    }
    const currentShip = player.getShip(shipID);
    droppedShip.style.position = "absolute";
    droppedShip.classList.add("placed");
    event.target.appendChild(droppedShip);
    board.placeShip(currentShip, squares);
    const shipsArray = document.querySelectorAll(".ship");

    // checking that all ships were placed to append start btn
    if (!Array.from(shipsArray).every(ship => Array.from(ship.classList).includes("placed"))) {
      return;
    }
    const startBtn = document.createElement("button");
    startBtn.classList.add("btn", "start");
    startBtn.innerText = "start";
    !document.querySelector(".start.btn") && document.querySelector(".ship-div").append(startBtn);
    startBtn.addEventListener("click", e => {
      e.preventDefault();
      const playerBoard = document.querySelector(".player-board");
      playerBoard.removeEventListener("dragover", dragOver);
      playerBoard.removeEventListener("drop", dropShip);
      shipsArray.forEach(ship => {
        ship.removeAttribute("draggable");
        ship.removeEventListener("dragStart", dragStart);
        ship.removeEventListener("dblclick", doubleClick);
      });
      const shipDiv = document.querySelector(".ship-div");
      const ev = new Event("change");
      shipDiv.dispatchEvent(ev);
    });
  }
  function dragStart(event) {
    const square = event.target;
    event.dataTransfer.setData("text/plain", square.id);
  }
  function doubleClick(event) {
    const ship = event.target.parentElement;
    if (!Array.from(ship.classList).includes("placed")) {
      return ship.classList.toggle("horizontal");
    }
    const currentShip = player.getShip(ship.id);
    const shipLength = currentShip.length;
    const checkHorizontal = Array.from(ship.classList).includes("horizontal") !== true;
    const startingIndex = parseString(ship.parentElement.classList.value);
    const checkSpace = startingIndex % 10 === 0 ? 0 : _rowLength - startingIndex % 10 + 1;
    const squares = checkHorizontal ? Array.from({
      length: shipLength
    }, (el, index) => startingIndex + index) : Array.from({
      length: shipLength
    }, (el, index) => startingIndex + index * 10);
    if (!board.checkSquares(squares, currentShip)) {
      return;
    } else if (checkHorizontal && checkSpace < shipLength) {
      return;
    }
    ship.classList.toggle("horizontal");
    board.placeShip(currentShip, squares);
  }
  return {
    dragStart,
    dragOver,
    doubleClick,
    dropShip
  };
};
module.exports = Drag;

/***/ }),

/***/ "./src/factories/Gameboard.js":
/*!************************************!*\
  !*** ./src/factories/Gameboard.js ***!
  \************************************/
/***/ ((module) => {

const Gameboard = () => {
  let board = [];
  const _rowLength = 10;
  function initializeBoard() {
    board.length = 0;
    for (let i = 0; i < new Array(100).length; i++) {
      board.push({
        square: i + 1,
        occupied: null
      });
    }
  }
  function resetBoard() {
    for (let i = 0; i < new Array(100).length; i++) {
      board[i].occupied = null;
    }
  }
  function getSquare(square) {
    return board.find(el => Number(el.square) === square);
  }
  function checkSquares(squares, ship) {
    if (!squares) return;
    const iterable = Array.isArray(squares) ? squares : [squares];
    // checking that all squares in the board array
    if (iterable.some(square => !getSquare(square))) return;
    return iterable.every(square => getSquare(square) && !getSquare(square).occupied || getSquare(square) && ship && getSquare(square).occupied === ship.name);
  }
  function fillSquares(ship, squares) {
    if (!ship || !squares) return;
    const iterable = Array.isArray(squares) && squares || arguments.length > 1 && Array.from(arguments) || [squares];
    board.forEach(el => {
      if (el.occupied === ship.name) {
        el.occupied = null;
      }
    });
    iterable.forEach(el => getSquare(el).occupied = ship.name);
  }
  function placeShip(ship, squares) {
    if (!checkSquares(squares, ship)) return;
    fillSquares(ship, squares);
    ship.addSquare(squares);
  }
  function receiveAttack(square, opponent) {
    if (!getSquare(square).occupied) {
      getSquare(square).occupied = "miss";
      return;
    } else if (getSquare(square).occupied === "hit" || getSquare(square).occupied === "miss") {
      return;
    }
    const occupied = getSquare(square).occupied;
    const ship = opponent.getShip(occupied);
    ship.hit(square);
    getSquare(square).occupied = "hit";
  }
  function placeShipRandomly(ship) {
    const randomIndex = Math.floor(Math.random() * board.length + 1);
    // if randomDir returns zero it will attempt to vertically replace
    // ship before horizontally
    const randomDir = Math.floor(Math.random() * 2);
    let squares = randomDir === 0 ? Array.from({
      length: ship.length
    }, (el, index) => randomIndex + index * 10) : Array.from({
      length: ship.length
    }, (el, index) => randomIndex + index);
    const checkSpace = randomIndex % 10 === 0 ? 0 : _rowLength - randomIndex % 10 + 1;
    if (!randomDir && checkSquares(squares)) {
      console.log("vertical");
      console.log(squares);
      return placeShip(ship, squares);
    } else if (checkSquares(squares) && checkSpace > ship.length) {
      console.log("horizontal");
      console.log(squares);
      return placeShip(ship, squares);
    }
    return false;
  }
  function getSurroundingSquares(square) {
    const sq = Number(square);
    const rightSquare = sq % 10 === 0 ? null : sq + 1;
    const leftSquare = sq % 10 === 1 ? null : sq - 1;
    const topSquare = sq - 10 < 1 ? null : sq - 10;
    const bottomSquare = sq + 10 > 100 ? null : sq + 10;
    return [rightSquare, leftSquare, topSquare, bottomSquare];
  }
  function aiTurn(player, playerBoard) {
    let openSquares = playerBoard.board.filter(sq => sq.occupied !== "miss" && sq.occupied !== "hit");
    const randomNumber = Math.floor(Math.random() * openSquares.length);

    /*======================================== comment ======================================== */

    const currentSquare = openSquares[randomNumber].square;
    const squareDiv = document.querySelectorAll(`.player-board > .square`)[currentSquare - 1];
    playerBoard.receiveAttack(currentSquare, player);
    if (playerBoard.getSquare(currentSquare).occupied === "miss") {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      squareDiv.append(piece);
      return;
    } else if (playerBoard.getSquare(currentSquare).occupied === "hit") {
      const piece = document.createElement("div");
      piece.innerText = "X";
      piece.classList.add("hit");
      squareDiv.append(piece);
    }
    if (player.ships.every(ship => ship.sunk())) {
      console.log("gameOver");
    }
  }
  return {
    initializeBoard,
    receiveAttack,
    checkSquares,
    placeShip,
    receiveAttack,
    getSquare,
    board,
    getSurroundingSquares,
    placeShipRandomly,
    aiTurn,
    resetBoard
  };
};
module.exports = Gameboard;

/***/ }),

/***/ "./src/factories/Player.js":
/*!*********************************!*\
  !*** ./src/factories/Player.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Ship = __webpack_require__(/*! ./Ship */ "./src/factories/Ship.js");
const Player = (name, boolean) => {
  let AI = boolean;
  const carrier = Ship("carrier", 5);
  const battleship = Ship("battleship", 4);
  const cruiser = Ship("cruiser", 3);
  const submarine = Ship("submarine", 3);
  const destroyer = Ship("destroyer", 2);
  function getShip(name) {
    return ships.find(ship => ship.name === name);
  }
  const ships = [carrier, battleship, cruiser, submarine, destroyer];
  function reset() {
    ships.forEach(ship => ship.squares = []);
  }
  return {
    name,
    ships,
    getShip,
    AI,
    reset
  };
};
module.exports = Player;

/***/ }),

/***/ "./src/factories/Ship.js":
/*!*******************************!*\
  !*** ./src/factories/Ship.js ***!
  \*******************************/
/***/ ((module) => {

const Ship = (name, length) => {
  let squares = [];
  function addSquare(number) {
    if (number === undefined) {
      return console.log("error");
    }
    squares.length = 0;
    const iterable = Array.isArray(number) && number || arguments.length > 1 && Array.from(arguments) || [number];
    iterable.forEach(el => squares.push({
      square: el,
      hit: false
    }));
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
    if (squares.length) return squares.map(el => el.square);
  }
  function getSquare(number) {
    return squares.find(el => el.square === number);
  }
  function sunk() {
    if (squares[0] === undefined) return false;
    return squares.map(el => el.hit).every(el => el === true);
  }
  return {
    squares,
    hit,
    sunk,
    addSquare,
    name,
    length,
    getSquares,
    getSquare
  };
};
module.exports = Ship;

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! ../src/index.css */ "./src/index.css");
const DOM = __webpack_require__(/*! ../src/factories/DOM */ "./src/factories/DOM.js");
const dom = DOM();
dom.header();
dom.initGame();

/***/ }),

/***/ "./src/utilities/parseString.js":
/*!**************************************!*\
  !*** ./src/utilities/parseString.js ***!
  \**************************************/
/***/ ((module) => {

function parseString(str) {
  if (!str) return;
  const regex = new RegExp("[0-9]+", "");
  return Number(str.match(regex)[0]);
}
module.exports = parseString;

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/index.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/index.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

@font-face {
  font-family: "Black Ops One";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/blackopsone/v20/qWcsB6-ypo7xBdr6Xshe96H3aDvbtw.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "Lato";
  font-style: normal;
  font-weight: 300;
  src: url(https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwiPGQ.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "Lato";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "Lato";
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  height: 100vh;
  background-image: linear-gradient(
    to left top,
    #1e3a8a,
    #163777,
    #163363,
    #1a2e4f,
    #1e293b
  );
  padding-top: 50px;
}

h1 {
  font-family: "Black Ops One";
  font-size: clamp(3rem, 6vw, 5rem);
  text-align: center;
  margin: 0 auto;
  background: linear-gradient(
    to top,
    #f9fafb,
    #dee4ea,
    #c5ced9,
    #acb8c8,
    #94a3b8
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  border-top: 10px solid rgb(145, 11, 11);
  width: max-content;
}

.board {
  padding-top: 50px;
  display: flex;
  flex-wrap: no-wrap;
  justify-content: center;
  gap: 50px;
}

.board .enemy-board,
.board .player-board {
  position: relative;
  display: grid;
  aspect-ratio: 1 / 1;
  min-width: 300px;
  max-height: 300px;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  background: rgba(26, 102, 153, 0.65);
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  backdrop-filter: blur(3.5px);
  -webkit-backdrop-filter: blur(3.5px);
  border-radius: 0;
  z-index: 1;
}

.enemy-board {
  cursor: pointer;
}

.square {
  border: 1px solid rgba(26, 102, 153, 0.65);
}

.enemy-board .square:not(.hit):hover,
.enemy-board .square:not(.hit):active {
  background-color: rgb(45, 134, 194);
}

.ship-div {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  gap: 24px;
  width: 300px;
  padding: 20px;
}

.directions.title {
  text-align: center;
  font-weight: 700;
  font-size: 1.5rem;
}

.directions {
  width: 100%;
  color: white;
  font-family: "Lato";
}

.ship {
  display: flex;
  flex-direction: column;
}

.ship.horizontal {
  flex-direction: row;
}

.ship[draggable] {
  cursor: grab;
}

.ship[draggable]:active {
  cursor: grabbing;
}

.ship-square {
  width: 30px;
  height: 30px;
  aspect-ratio: 1 / 1;
  border: 1px solid #cbd5e1;
  background-color: #94a3b8;
}

.piece {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  z-index: 10;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  background-color: white;
}

.hit {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: red;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: white;
  border: 1px solid black;
}

.start.btn,
.restart.btn {
  width: 125px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-family: Arial;
  font-weight: 700;
  letter-spacing: 0.03rem;
  font-size: 1.25rem;
  margin-top: 25px;
  cursor: pointer;
  border: none;
  background-color: red;
  color: white;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.start.btn:active,
.restart.btn:active {
  color: white;
  box-shadow: none;
}

.game-over {
  position: absolute;
  display: grid;
  place-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  top: 0;
  right: 0;
  z-index: 99999;
  width: 100%;
  height: 100%;
}

.game-over div {
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
}
`, "",{"version":3,"sources":["webpack://./src/index.css"],"names":[],"mappings":"AAAA;EACE,sBAAsB;EACtB,UAAU;EACV,SAAS;AACX;;AAEA;EACE,4BAA4B;EAC5B,kBAAkB;EAClB,gBAAgB;EAChB;mBACiB;EACjB;;0CAEwC;AAC1C;;AAEA;EACE,mBAAmB;EACnB,kBAAkB;EAClB,gBAAgB;EAChB;mBACiB;EACjB;;0CAEwC;AAC1C;;AAEA;EACE,mBAAmB;EACnB,kBAAkB;EAClB,gBAAgB;EAChB;mBACiB;EACjB;;0CAEwC;AAC1C;;AAEA;EACE,mBAAmB;EACnB,kBAAkB;EAClB,gBAAgB;EAChB;mBACiB;EACjB;;0CAEwC;AAC1C;;AAEA;EACE;+EAC6E;EAC7E,aAAa;EACb;;;;;;;GAOC;EACD,iBAAiB;AACnB;;AAEA;EACE,4BAA4B;EAC5B,iCAAiC;EACjC,kBAAkB;EAClB,cAAc;EACd;;;;;;;GAOC;EACD,6BAA6B;EAC7B,oCAAoC;EACpC,uCAAuC;EACvC,kBAAkB;AACpB;;AAEA;EACE,iBAAiB;EACjB,aAAa;EACb,kBAAkB;EAClB,uBAAuB;EACvB,SAAS;AACX;;AAEA;;EAEE,kBAAkB;EAClB,aAAa;EACb,mBAAmB;EACnB,gBAAgB;EAChB,iBAAiB;EACjB,sCAAsC;EACtC,mCAAmC;EACnC,oCAAoC;EACpC;+EAC6E;EAC7E,4BAA4B;EAC5B,oCAAoC;EACpC,gBAAgB;EAChB,UAAU;AACZ;;AAEA;EACE,eAAe;AACjB;;AAEA;EACE,0CAA0C;AAC5C;;AAEA;;EAEE,mCAAmC;AACrC;;AAEA;EACE,kBAAkB;EAClB,aAAa;EACb,eAAe;EACf,uBAAuB;EACvB,yBAAyB;EACzB,SAAS;EACT,YAAY;EACZ,aAAa;AACf;;AAEA;EACE,kBAAkB;EAClB,gBAAgB;EAChB,iBAAiB;AACnB;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,mBAAmB;AACrB;;AAEA;EACE,aAAa;EACb,sBAAsB;AACxB;;AAEA;EACE,mBAAmB;AACrB;;AAEA;EACE,YAAY;AACd;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,mBAAmB;EACnB,yBAAyB;EACzB,yBAAyB;AAC3B;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,mBAAmB;EACnB,WAAW;EACX,kBAAkB;EAClB,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC;+EAC6E;EAC7E,uBAAuB;AACzB;;AAEA;EACE,kBAAkB;EAClB,WAAW;EACX,YAAY;EACZ,qBAAqB;EACrB,eAAe;EACf,gBAAgB;EAChB,kBAAkB;EAClB,YAAY;EACZ,uBAAuB;AACzB;;AAEA;;EAEE,YAAY;EACZ,iBAAiB;EACjB,oBAAoB;EACpB,kBAAkB;EAClB,gBAAgB;EAChB,uBAAuB;EACvB,kBAAkB;EAClB,gBAAgB;EAChB,eAAe;EACf,YAAY;EACZ,qBAAqB;EACrB,YAAY;EACZ;+EAC6E;AAC/E;;AAEA;;EAEE,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,aAAa;EACb,mBAAmB;EACnB,oCAAoC;EACpC,MAAM;EACN,QAAQ;EACR,cAAc;EACd,WAAW;EACX,YAAY;AACd;;AAEA;EACE,uBAAuB;EACvB,8EAA8E;EAC9E,aAAa;EACb,sBAAsB;EACtB,mBAAmB;EACnB,uBAAuB;EACvB,aAAa;AACf","sourcesContent":["* {\n  box-sizing: border-box;\n  padding: 0;\n  margin: 0;\n}\n\n@font-face {\n  font-family: \"Black Ops One\";\n  font-style: normal;\n  font-weight: 400;\n  src: url(https://fonts.gstatic.com/s/blackopsone/v20/qWcsB6-ypo7xBdr6Xshe96H3aDvbtw.woff2)\n    format(\"woff2\");\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,\n    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,\n    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n\n@font-face {\n  font-family: \"Lato\";\n  font-style: normal;\n  font-weight: 300;\n  src: url(https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwiPGQ.woff2)\n    format(\"woff2\");\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,\n    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,\n    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n\n@font-face {\n  font-family: \"Lato\";\n  font-style: normal;\n  font-weight: 400;\n  src: url(https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2)\n    format(\"woff2\");\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,\n    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,\n    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n\n@font-face {\n  font-family: \"Lato\";\n  font-style: normal;\n  font-weight: 700;\n  src: url(https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ.woff2)\n    format(\"woff2\");\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,\n    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,\n    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica,\n    Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n  height: 100vh;\n  background-image: linear-gradient(\n    to left top,\n    #1e3a8a,\n    #163777,\n    #163363,\n    #1a2e4f,\n    #1e293b\n  );\n  padding-top: 50px;\n}\n\nh1 {\n  font-family: \"Black Ops One\";\n  font-size: clamp(3rem, 6vw, 5rem);\n  text-align: center;\n  margin: 0 auto;\n  background: linear-gradient(\n    to top,\n    #f9fafb,\n    #dee4ea,\n    #c5ced9,\n    #acb8c8,\n    #94a3b8\n  );\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  border-top: 10px solid rgb(145, 11, 11);\n  width: max-content;\n}\n\n.board {\n  padding-top: 50px;\n  display: flex;\n  flex-wrap: no-wrap;\n  justify-content: center;\n  gap: 50px;\n}\n\n.board .enemy-board,\n.board .player-board {\n  position: relative;\n  display: grid;\n  aspect-ratio: 1 / 1;\n  min-width: 300px;\n  max-height: 300px;\n  grid-template-columns: repeat(10, 1fr);\n  grid-template-rows: repeat(10, 1fr);\n  background: rgba(26, 102, 153, 0.65);\n  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,\n    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;\n  backdrop-filter: blur(3.5px);\n  -webkit-backdrop-filter: blur(3.5px);\n  border-radius: 0;\n  z-index: 1;\n}\n\n.enemy-board {\n  cursor: pointer;\n}\n\n.square {\n  border: 1px solid rgba(26, 102, 153, 0.65);\n}\n\n.enemy-board .square:not(.hit):hover,\n.enemy-board .square:not(.hit):active {\n  background-color: rgb(45, 134, 194);\n}\n\n.ship-div {\n  position: relative;\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  align-content: flex-start;\n  gap: 24px;\n  width: 300px;\n  padding: 20px;\n}\n\n.directions.title {\n  text-align: center;\n  font-weight: 700;\n  font-size: 1.5rem;\n}\n\n.directions {\n  width: 100%;\n  color: white;\n  font-family: \"Lato\";\n}\n\n.ship {\n  display: flex;\n  flex-direction: column;\n}\n\n.ship.horizontal {\n  flex-direction: row;\n}\n\n.ship[draggable] {\n  cursor: grab;\n}\n\n.ship[draggable]:active {\n  cursor: grabbing;\n}\n\n.ship-square {\n  width: 30px;\n  height: 30px;\n  aspect-ratio: 1 / 1;\n  border: 1px solid #cbd5e1;\n  background-color: #94a3b8;\n}\n\n.piece {\n  width: 10px;\n  height: 10px;\n  border-radius: 100%;\n  z-index: 10;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,\n    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;\n  background-color: white;\n}\n\n.hit {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  background-color: red;\n  font-size: 20px;\n  font-weight: 700;\n  text-align: center;\n  color: white;\n  border: 1px solid black;\n}\n\n.start.btn,\n.restart.btn {\n  width: 125px;\n  padding-top: 10px;\n  padding-bottom: 10px;\n  font-family: Arial;\n  font-weight: 700;\n  letter-spacing: 0.03rem;\n  font-size: 1.25rem;\n  margin-top: 25px;\n  cursor: pointer;\n  border: none;\n  background-color: red;\n  color: white;\n  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,\n    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;\n}\n\n.start.btn:active,\n.restart.btn:active {\n  color: white;\n  box-shadow: none;\n}\n\n.game-over {\n  position: absolute;\n  display: grid;\n  place-items: center;\n  background-color: rgba(0, 0, 0, 0.5);\n  top: 0;\n  right: 0;\n  z-index: 99999;\n  width: 100%;\n  height: 100%;\n}\n\n.game-over div {\n  background-color: white;\n  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 50px;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./index.css */ "./node_modules/css-loader/dist/cjs.js!./src/index.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/index.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sZ0ZBQWdGLFlBQVksV0FBVyxVQUFVLE1BQU0sS0FBSyxZQUFZLGFBQWEsYUFBYSxNQUFNLE9BQU8sT0FBTyxPQUFPLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxNQUFNLE9BQU8sT0FBTyxPQUFPLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxNQUFNLE9BQU8sT0FBTyxPQUFPLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxNQUFNLE9BQU8sT0FBTyxPQUFPLE9BQU8sS0FBSyxLQUFLLE9BQU8sV0FBVyxXQUFXLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsV0FBVyxXQUFXLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxPQUFPLEtBQUssWUFBWSxXQUFXLFlBQVksYUFBYSxXQUFXLE1BQU0sTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsTUFBTSxPQUFPLGFBQWEsYUFBYSxhQUFhLFdBQVcsTUFBTSxLQUFLLFVBQVUsT0FBTyxLQUFLLFlBQVksT0FBTyxNQUFNLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxXQUFXLFVBQVUsVUFBVSxNQUFNLEtBQUssWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxZQUFZLE9BQU8sS0FBSyxVQUFVLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVUsTUFBTSxLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLFdBQVcsVUFBVSxZQUFZLE1BQU0sT0FBTyxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxPQUFPLE1BQU0sVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLFdBQVcsS0FBSyxPQUFPLE9BQU8sTUFBTSxVQUFVLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLE1BQU0sS0FBSyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxXQUFXLDRCQUE0QiwyQkFBMkIsZUFBZSxjQUFjLEdB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QUFDQTs7Ozs7Ozs7Ozs7QUNuRmE7O0FBRWI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ2pDYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ1RhOztBQUViO0FBQ0E7QUFDQSxjQUFjLEtBQXdDLEdBQUcsc0JBQWlCLEdBQUcsQ0FBSTtBQUNqRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ1RhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7QUFDQTtBQUNBO0FBQ0EsaUZBQWlGO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EseURBQXlEO0FBQ3pEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQzVEYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAxLy4vc3JjL2ZhY3Rvcmllcy9ET00uanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcDEvLi9zcmMvZmFjdG9yaWVzL0RyYWcuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcDEvLi9zcmMvZmFjdG9yaWVzL0dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwMS8uL3NyYy9mYWN0b3JpZXMvUGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAxLy4vc3JjL2ZhY3Rvcmllcy9TaGlwLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAxLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAxLy4vc3JjL3V0aWxpdGllcy9wYXJzZVN0cmluZy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwMS8uL3NyYy9pbmRleC5jc3MiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcDEvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAxLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcDEvLi9zcmMvaW5kZXguY3NzP2NmZTQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcDEvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcDEvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAxLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAxLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAxLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcDEvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBHYW1lYm9hcmQgPSByZXF1aXJlKFwiLi9HYW1lYm9hcmRcIik7XG5jb25zdCBQbGF5ZXIgPSByZXF1aXJlKFwiLi9QbGF5ZXJcIik7XG5jb25zdCBEcmFnID0gcmVxdWlyZShcIi4vRHJhZ1wiKTtcbmNvbnN0IHBhcnNlU3RyaW5nID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy9wYXJzZVN0cmluZ1wiKTtcblxuY29uc3QgRE9NID0gKCkgPT4ge1xuICBsZXQgdXNlckJvYXJkID0gR2FtZWJvYXJkKCk7XG4gIGxldCB1c2VyID0gUGxheWVyKFwieW91XCIpO1xuICBsZXQgYWlCb2FyZCA9IEdhbWVib2FyZCgpO1xuICBsZXQgQUkgPSBQbGF5ZXIoXCJjb21wdXRlclwiKTtcbiAgbGV0IGRyYWcgPSBEcmFnKHVzZXJCb2FyZCwgdXNlcik7XG5cbiAgZnVuY3Rpb24gaW5pdEdhbWUoKSB7XG4gICAgaW5pdEJvYXJkKCk7XG4gICAgaW5pdFNoaXBzKCk7XG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXIoKSB7XG4gICAgY29uc3QgaDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDFcIik7XG4gICAgaDEuaW5uZXJUZXh0ID0gXCJCYXR0bGVzaGlwXCI7XG4gICAgaDEuY2xhc3NMaXN0LmFkZChcInRpdGxlXCIpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGgxKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRCb2FyZCgpIHtcbiAgICB1c2VyQm9hcmQuaW5pdGlhbGl6ZUJvYXJkKCk7XG5cbiAgICBjb25zdCBib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuICAgIGJvYXJkLmNsYXNzTGlzdC5hZGQoXCJib2FyZFwiKTtcblxuICAgIGNvbnN0IHBsYXllckJvYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFydGljbGVcIik7XG4gICAgcGxheWVyQm9hcmQuY2xhc3NMaXN0LmFkZChcInBsYXllci1ib2FyZFwiKTtcbiAgICBib2FyZC5hcHBlbmQocGxheWVyQm9hcmQpO1xuXG4gICAgcGxheWVyQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIGRyYWcuZHJhZ092ZXIpO1xuICAgIHBsYXllckJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGRyYWcuZHJvcFNoaXApO1xuXG4gICAgdXNlckJvYXJkLmJvYXJkLmZvckVhY2goKG51bSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBsYXllclNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBwbGF5ZXJTcXVhcmUuY2xhc3NMaXN0LmFkZChcInNxdWFyZVwiLCBpbmRleCArIDEpO1xuICAgICAgcGxheWVyQm9hcmQuYXBwZW5kKHBsYXllclNxdWFyZSk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChib2FyZCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0U2hpcHMoKSB7XG4gICAgY29uc3Qgc2hpcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuICAgIHNoaXBEaXYuY2xhc3NMaXN0LmFkZChcInNoaXAtZGl2XCIpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYm9hcmRcIikuYXBwZW5kKHNoaXBEaXYpO1xuXG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgdGl0bGUuY2xhc3NMaXN0LmFkZChcImRpcmVjdGlvbnNcIiwgXCJ0aXRsZVwiKTtcbiAgICB0aXRsZS5pbm5lclRleHQgPSBcIlBsYWNlIHlvdXIgc2hpcHMhXCI7XG4gICAgc2hpcERpdi5hcHBlbmQodGl0bGUpO1xuXG4gICAgY29uc3QgZGlyZWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIGRpcmVjdGlvbnMuY2xhc3NMaXN0LmFkZChcImRpcmVjdGlvbnNcIik7XG4gICAgZGlyZWN0aW9ucy5pbm5lclRleHQgPSBcIkRvdWJsZSBjbGljayB5b3VyIHNoaXBzIHRvIHJvdGF0ZSB0aGVtIVwiO1xuICAgIHNoaXBEaXYuYXBwZW5kKGRpcmVjdGlvbnMpO1xuXG4gICAgdXNlci5zaGlwcy5yZXZlcnNlKCkuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFNoaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgY3VycmVudFNoaXAuY2xhc3NMaXN0LmFkZChcInNoaXBcIik7XG4gICAgICBjdXJyZW50U2hpcC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBzaGlwLm5hbWUpO1xuICAgICAgY3VycmVudFNoaXAuZHJhZ2dhYmxlID0gdHJ1ZTtcblxuICAgICAgbGV0IGluZGV4ID0gMDtcblxuICAgICAgd2hpbGUgKGluZGV4IDwgc2hpcC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qgc3EgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzcS5jbGFzc0xpc3QuYWRkKFwic2hpcC1zcXVhcmVcIik7XG4gICAgICAgIHNxLnNldEF0dHJpYnV0ZShcImlkXCIsIGluZGV4ICsgMSk7XG4gICAgICAgIGN1cnJlbnRTaGlwLmFwcGVuZChzcSk7XG5cbiAgICAgICAgY3VycmVudFNoaXAuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCBkcmFnLmRyYWdTdGFydCk7XG4gICAgICAgIGN1cnJlbnRTaGlwLmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCBkcmFnLmRvdWJsZUNsaWNrKTtcblxuICAgICAgICBpbmRleCsrO1xuICAgICAgfVxuICAgICAgc2hpcERpdi5hcHBlbmQoY3VycmVudFNoaXApO1xuICAgIH0pO1xuXG4gICAgc2hpcERpdi5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpbml0QUkoKTtcbiAgICAgIHNoaXBEaXYucmVtb3ZlKCk7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNxdWFyZVwiKS5mb3JFYWNoKChzcXVhcmUpID0+IHtcbiAgICAgICAgc3F1YXJlLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0QUkoKSB7XG4gICAgYWlCb2FyZC5pbml0aWFsaXplQm9hcmQoKTtcblxuICAgIGNvbnN0IGJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ib2FyZFwiKTtcblxuICAgIGNvbnN0IGVuZW15Qm9hcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXJ0aWNsZVwiKTtcbiAgICBlbmVteUJvYXJkLmNsYXNzTGlzdC5hZGQoXCJlbmVteS1ib2FyZFwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJvYXJkXCIpLmFwcGVuZChlbmVteUJvYXJkKTtcblxuICAgIGNvbnNvbGUubG9nKGFpQm9hcmQuYm9hcmQpO1xuXG4gICAgYWlCb2FyZC5ib2FyZC5mb3JFYWNoKChudW0sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBlbmVteVNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBlbmVteVNxdWFyZS5jbGFzc0xpc3QuYWRkKGluZGV4ICsgMSwgXCJzcXVhcmVcIik7XG4gICAgICBlbmVteUJvYXJkLmFwcGVuZChlbmVteVNxdWFyZSk7XG4gICAgICBlbmVteVNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgaWYgKGVuZW15U3F1YXJlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAodXNlci5zaGlwcy5ldmVyeSgoc2hpcCkgPT4gc2hpcC5zdW5rKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIGluaXRHYW1lT3ZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3EgPSBwYXJzZVN0cmluZyhlLnRhcmdldC5jbGFzc0xpc3QudmFsdWUpO1xuICAgICAgICBhaUJvYXJkLnJlY2VpdmVBdHRhY2soc3EsIEFJKTtcblxuICAgICAgICBpZiAoYWlCb2FyZC5nZXRTcXVhcmUoc3EpLm9jY3VwaWVkID09PSBcIm1pc3NcIikge1xuICAgICAgICAgIGNvbnN0IHBpZWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICBwaWVjZS5jbGFzc0xpc3QuYWRkKFwicGllY2VcIik7XG4gICAgICAgICAgZS50YXJnZXQuYXBwZW5kKHBpZWNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChhaUJvYXJkLmdldFNxdWFyZShzcSkub2NjdXBpZWQgPT09IFwiaGl0XCIpIHtcbiAgICAgICAgICBjb25zdCBwaWVjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgcGllY2UuaW5uZXJUZXh0ID0gXCJYXCI7XG4gICAgICAgICAgcGllY2UuY2xhc3NMaXN0LmFkZChcImhpdFwiKTtcbiAgICAgICAgICBlLnRhcmdldC5hcHBlbmQocGllY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEFJLnNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLnN1bmsoKSkpIHtcbiAgICAgICAgICByZXR1cm4gaW5pdEdhbWVPdmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhaUJvYXJkLmFpVHVybih1c2VyLCB1c2VyQm9hcmQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBBSS5zaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50U2hpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBjdXJyZW50U2hpcC5jbGFzc0xpc3QuYWRkKFwic2hpcFwiKTtcbiAgICAgIGN1cnJlbnRTaGlwLnNldEF0dHJpYnV0ZShcImlkXCIsIHNoaXAubmFtZSk7XG5cbiAgICAgIGxldCBpbmRleCA9IDA7XG5cbiAgICAgIHdoaWxlIChpbmRleCA8IHNoaXAubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHNxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc3EuY2xhc3NMaXN0LmFkZChcInNoaXAtc3F1YXJlXCIpO1xuICAgICAgICBzcS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpbmRleCArIDEpO1xuICAgICAgICBjdXJyZW50U2hpcC5hcHBlbmQoc3EpO1xuXG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJhbmRvbVN0YXJ0aW5nSW5kZXggPSBNYXRoLmZsb29yKFxuICAgICAgICBNYXRoLnJhbmRvbSgpICogYWlCb2FyZC5ib2FyZC5sZW5ndGggKyAxXG4gICAgICApO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBhaUJvYXJkLnBsYWNlU2hpcFJhbmRvbWx5KHNoaXApO1xuICAgICAgICBpZiAoc2hpcC5zcXVhcmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYm9hcmQucHJlcGVuZChlbmVteUJvYXJkKTtcbiAgICAvLyBzdGFydEdhbWUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRHYW1lT3ZlcigpIHtcbiAgICAvLyBfZ2FtZU92ZXIgPSBmYWxzZTtcbiAgICBsZXQgd2lubmVyO1xuXG4gICAgaWYgKHVzZXIuc2hpcHMuZXZlcnkoKHNoaXApID0+IHNoaXAuc3VuaygpKSkge1xuICAgICAgd2lubmVyID0gQUkubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2lubmVyID0gdXNlci5uYW1lO1xuICAgIH1cblxuICAgIGNvbnN0IGdhbWVPdmVyTW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VjdGlvblwiKTtcbiAgICBnYW1lT3Zlck1vZGFsLmNsYXNzTGlzdC5hZGQoXCJnYW1lLW92ZXJcIik7XG4gICAgZ2FtZU92ZXJNb2RhbC5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2PlxuICAgICAgICA8cD5cbiAgICAgICAgICAke3dpbm5lci50b1VwcGVyQ2FzZSgpfSB3b24gdGhlIGdhbWUhXG4gICAgICAgIDwvcD5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJyZXN0YXJ0IGJ0blwiPlxuICAgICAgICAgIHJlc3RhcnRcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmQoZ2FtZU92ZXJNb2RhbCk7XG5cbiAgICByZXN0YXJ0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yZXN0YXJ0LmJ0blwiKTtcbiAgICByZXN0YXJ0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHsgaW5pdEdhbWUsIGhlYWRlciB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBET007XG4iLCJjb25zdCBwYXJzZVN0cmluZyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMvcGFyc2VTdHJpbmdcIik7XG5cbmNvbnN0IERyYWcgPSAoYm9hcmQsIHBsYXllcikgPT4ge1xuICBjb25zdCBfcm93TGVuZ3RoID0gMTA7XG5cbiAgZnVuY3Rpb24gZHJhZ092ZXIoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gXCJtb3ZlXCI7XG4gIH1cblxuICBmdW5jdGlvbiBkcm9wU2hpcChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBpZiAoQXJyYXkuZnJvbShldmVudC50YXJnZXQuY2xhc3NMaXN0KS5pbmNsdWRlcyhcInNoaXAtc3F1YXJlXCIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2hpcElEID0gZXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpO1xuICAgIGNvbnN0IGRyb3BwZWRTaGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2hpcElEKTtcbiAgICBjb25zdCBjaGVja0hvcml6b250YWwgPVxuICAgICAgQXJyYXkuZnJvbShkcm9wcGVkU2hpcC5jbGFzc0xpc3QpLmluY2x1ZGVzKFwiaG9yaXpvbnRhbFwiKSA9PT0gdHJ1ZTtcbiAgICBjb25zdCBzaGlwTGVuZ3RoID0gTnVtYmVyKGRyb3BwZWRTaGlwLmxhc3RDaGlsZC5pZCk7XG4gICAgY29uc3Qgc3RhcnRpbmdJbmRleCA9IHBhcnNlU3RyaW5nKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QudmFsdWUpO1xuICAgIGNvbnN0IGNoZWNrU3BhY2UgPVxuICAgICAgc3RhcnRpbmdJbmRleCAlIDEwID09PSAwID8gMCA6IF9yb3dMZW5ndGggLSAoc3RhcnRpbmdJbmRleCAlIDEwKSArIDE7XG4gICAgY29uc3Qgc3F1YXJlcyA9IGNoZWNrSG9yaXpvbnRhbFxuICAgICAgPyBBcnJheS5mcm9tKHsgbGVuZ3RoOiBzaGlwTGVuZ3RoIH0sIChlbCwgaW5kZXgpID0+IHN0YXJ0aW5nSW5kZXggKyBpbmRleClcbiAgICAgIDogQXJyYXkuZnJvbShcbiAgICAgICAgICB7IGxlbmd0aDogc2hpcExlbmd0aCB9LFxuICAgICAgICAgIChlbCwgaW5kZXgpID0+IHN0YXJ0aW5nSW5kZXggKyBpbmRleCAqIDEwXG4gICAgICAgICk7XG5cbiAgICBpZiAoY2hlY2tIb3Jpem9udGFsICYmIGNoZWNrU3BhY2UgPCBzaGlwTGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICghYm9hcmQuY2hlY2tTcXVhcmVzKHNxdWFyZXMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY3VycmVudFNoaXAgPSBwbGF5ZXIuZ2V0U2hpcChzaGlwSUQpO1xuICAgIGRyb3BwZWRTaGlwLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGRyb3BwZWRTaGlwLmNsYXNzTGlzdC5hZGQoXCJwbGFjZWRcIik7XG4gICAgZXZlbnQudGFyZ2V0LmFwcGVuZENoaWxkKGRyb3BwZWRTaGlwKTtcblxuICAgIGJvYXJkLnBsYWNlU2hpcChjdXJyZW50U2hpcCwgc3F1YXJlcyk7XG5cbiAgICBjb25zdCBzaGlwc0FycmF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaGlwXCIpO1xuXG4gICAgLy8gY2hlY2tpbmcgdGhhdCBhbGwgc2hpcHMgd2VyZSBwbGFjZWQgdG8gYXBwZW5kIHN0YXJ0IGJ0blxuICAgIGlmIChcbiAgICAgICFBcnJheS5mcm9tKHNoaXBzQXJyYXkpLmV2ZXJ5KChzaGlwKSA9PlxuICAgICAgICBBcnJheS5mcm9tKHNoaXAuY2xhc3NMaXN0KS5pbmNsdWRlcyhcInBsYWNlZFwiKVxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBzdGFydEJ0bi5jbGFzc0xpc3QuYWRkKFwiYnRuXCIsIFwic3RhcnRcIik7XG4gICAgc3RhcnRCdG4uaW5uZXJUZXh0ID0gXCJzdGFydFwiO1xuICAgICFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnN0YXJ0LmJ0blwiKSAmJlxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zaGlwLWRpdlwiKS5hcHBlbmQoc3RhcnRCdG4pO1xuXG4gICAgc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCBwbGF5ZXJCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxheWVyLWJvYXJkXCIpO1xuICAgICAgcGxheWVyQm9hcmQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIGRyYWdPdmVyKTtcbiAgICAgIHBsYXllckJvYXJkLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGRyb3BTaGlwKTtcblxuICAgICAgc2hpcHNBcnJheS5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIHNoaXAucmVtb3ZlQXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIpO1xuICAgICAgICBzaGlwLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkcmFnU3RhcnRcIiwgZHJhZ1N0YXJ0KTtcbiAgICAgICAgc2hpcC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgZG91YmxlQ2xpY2spO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHNoaXBEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNoaXAtZGl2XCIpO1xuICAgICAgY29uc3QgZXYgPSBuZXcgRXZlbnQoXCJjaGFuZ2VcIik7XG4gICAgICBzaGlwRGl2LmRpc3BhdGNoRXZlbnQoZXYpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhZ1N0YXJ0KGV2ZW50KSB7XG4gICAgY29uc3Qgc3F1YXJlID0gZXZlbnQudGFyZ2V0O1xuICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBzcXVhcmUuaWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZG91YmxlQ2xpY2soZXZlbnQpIHtcbiAgICBjb25zdCBzaGlwID0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG5cbiAgICBpZiAoIUFycmF5LmZyb20oc2hpcC5jbGFzc0xpc3QpLmluY2x1ZGVzKFwicGxhY2VkXCIpKSB7XG4gICAgICByZXR1cm4gc2hpcC5jbGFzc0xpc3QudG9nZ2xlKFwiaG9yaXpvbnRhbFwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50U2hpcCA9IHBsYXllci5nZXRTaGlwKHNoaXAuaWQpO1xuICAgIGNvbnN0IHNoaXBMZW5ndGggPSBjdXJyZW50U2hpcC5sZW5ndGg7XG4gICAgY29uc3QgY2hlY2tIb3Jpem9udGFsID1cbiAgICAgIEFycmF5LmZyb20oc2hpcC5jbGFzc0xpc3QpLmluY2x1ZGVzKFwiaG9yaXpvbnRhbFwiKSAhPT0gdHJ1ZTtcbiAgICBjb25zdCBzdGFydGluZ0luZGV4ID0gcGFyc2VTdHJpbmcoc2hpcC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC52YWx1ZSk7XG4gICAgY29uc3QgY2hlY2tTcGFjZSA9XG4gICAgICBzdGFydGluZ0luZGV4ICUgMTAgPT09IDAgPyAwIDogX3Jvd0xlbmd0aCAtIChzdGFydGluZ0luZGV4ICUgMTApICsgMTtcbiAgICBjb25zdCBzcXVhcmVzID0gY2hlY2tIb3Jpem9udGFsXG4gICAgICA/IEFycmF5LmZyb20oeyBsZW5ndGg6IHNoaXBMZW5ndGggfSwgKGVsLCBpbmRleCkgPT4gc3RhcnRpbmdJbmRleCArIGluZGV4KVxuICAgICAgOiBBcnJheS5mcm9tKFxuICAgICAgICAgIHsgbGVuZ3RoOiBzaGlwTGVuZ3RoIH0sXG4gICAgICAgICAgKGVsLCBpbmRleCkgPT4gc3RhcnRpbmdJbmRleCArIGluZGV4ICogMTBcbiAgICAgICAgKTtcblxuICAgIGlmICghYm9hcmQuY2hlY2tTcXVhcmVzKHNxdWFyZXMsIGN1cnJlbnRTaGlwKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoY2hlY2tIb3Jpem9udGFsICYmIGNoZWNrU3BhY2UgPCBzaGlwTGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2hpcC5jbGFzc0xpc3QudG9nZ2xlKFwiaG9yaXpvbnRhbFwiKTtcbiAgICBib2FyZC5wbGFjZVNoaXAoY3VycmVudFNoaXAsIHNxdWFyZXMpO1xuICB9XG5cbiAgcmV0dXJuIHsgZHJhZ1N0YXJ0LCBkcmFnT3ZlciwgZG91YmxlQ2xpY2ssIGRyb3BTaGlwIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWc7XG4iLCJjb25zdCBHYW1lYm9hcmQgPSAoKSA9PiB7XG4gIGxldCBib2FyZCA9IFtdO1xuICBjb25zdCBfcm93TGVuZ3RoID0gMTA7XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZUJvYXJkKCkge1xuICAgIGJvYXJkLmxlbmd0aCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXcgQXJyYXkoMTAwKS5sZW5ndGg7IGkrKykge1xuICAgICAgYm9hcmQucHVzaCh7IHNxdWFyZTogaSArIDEsIG9jY3VwaWVkOiBudWxsIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0Qm9hcmQoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXcgQXJyYXkoMTAwKS5sZW5ndGg7IGkrKykge1xuICAgICAgYm9hcmRbaV0ub2NjdXBpZWQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNxdWFyZShzcXVhcmUpIHtcbiAgICByZXR1cm4gYm9hcmQuZmluZCgoZWwpID0+IE51bWJlcihlbC5zcXVhcmUpID09PSBzcXVhcmUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tTcXVhcmVzKHNxdWFyZXMsIHNoaXApIHtcbiAgICBpZiAoIXNxdWFyZXMpIHJldHVybjtcbiAgICBjb25zdCBpdGVyYWJsZSA9IEFycmF5LmlzQXJyYXkoc3F1YXJlcykgPyBzcXVhcmVzIDogW3NxdWFyZXNdO1xuICAgIC8vIGNoZWNraW5nIHRoYXQgYWxsIHNxdWFyZXMgaW4gdGhlIGJvYXJkIGFycmF5XG4gICAgaWYgKGl0ZXJhYmxlLnNvbWUoKHNxdWFyZSkgPT4gIWdldFNxdWFyZShzcXVhcmUpKSkgcmV0dXJuO1xuXG4gICAgcmV0dXJuIGl0ZXJhYmxlLmV2ZXJ5KFxuICAgICAgKHNxdWFyZSkgPT5cbiAgICAgICAgKGdldFNxdWFyZShzcXVhcmUpICYmICFnZXRTcXVhcmUoc3F1YXJlKS5vY2N1cGllZCkgfHxcbiAgICAgICAgKGdldFNxdWFyZShzcXVhcmUpICYmIHNoaXAgJiYgZ2V0U3F1YXJlKHNxdWFyZSkub2NjdXBpZWQgPT09IHNoaXAubmFtZSlcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsbFNxdWFyZXMoc2hpcCwgc3F1YXJlcykge1xuICAgIGlmICghc2hpcCB8fCAhc3F1YXJlcykgcmV0dXJuO1xuICAgIGNvbnN0IGl0ZXJhYmxlID0gKEFycmF5LmlzQXJyYXkoc3F1YXJlcykgJiYgc3F1YXJlcykgfHxcbiAgICAgIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBBcnJheS5mcm9tKGFyZ3VtZW50cykpIHx8IFtzcXVhcmVzXTtcblxuICAgIGJvYXJkLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICBpZiAoZWwub2NjdXBpZWQgPT09IHNoaXAubmFtZSkge1xuICAgICAgICBlbC5vY2N1cGllZCA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpdGVyYWJsZS5mb3JFYWNoKChlbCkgPT4gKGdldFNxdWFyZShlbCkub2NjdXBpZWQgPSBzaGlwLm5hbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYWNlU2hpcChzaGlwLCBzcXVhcmVzKSB7XG4gICAgaWYgKCFjaGVja1NxdWFyZXMoc3F1YXJlcywgc2hpcCkpIHJldHVybjtcbiAgICBmaWxsU3F1YXJlcyhzaGlwLCBzcXVhcmVzKTtcbiAgICBzaGlwLmFkZFNxdWFyZShzcXVhcmVzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY2VpdmVBdHRhY2soc3F1YXJlLCBvcHBvbmVudCkge1xuICAgIGlmICghZ2V0U3F1YXJlKHNxdWFyZSkub2NjdXBpZWQpIHtcbiAgICAgIGdldFNxdWFyZShzcXVhcmUpLm9jY3VwaWVkID0gXCJtaXNzXCI7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIGdldFNxdWFyZShzcXVhcmUpLm9jY3VwaWVkID09PSBcImhpdFwiIHx8XG4gICAgICBnZXRTcXVhcmUoc3F1YXJlKS5vY2N1cGllZCA9PT0gXCJtaXNzXCJcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvY2N1cGllZCA9IGdldFNxdWFyZShzcXVhcmUpLm9jY3VwaWVkO1xuICAgIGNvbnN0IHNoaXAgPSBvcHBvbmVudC5nZXRTaGlwKG9jY3VwaWVkKTtcbiAgICBzaGlwLmhpdChzcXVhcmUpO1xuICAgIGdldFNxdWFyZShzcXVhcmUpLm9jY3VwaWVkID0gXCJoaXRcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYWNlU2hpcFJhbmRvbWx5KHNoaXApIHtcbiAgICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGJvYXJkLmxlbmd0aCArIDEpO1xuICAgIC8vIGlmIHJhbmRvbURpciByZXR1cm5zIHplcm8gaXQgd2lsbCBhdHRlbXB0IHRvIHZlcnRpY2FsbHkgcmVwbGFjZVxuICAgIC8vIHNoaXAgYmVmb3JlIGhvcml6b250YWxseVxuICAgIGNvbnN0IHJhbmRvbURpciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xuICAgIGxldCBzcXVhcmVzID1cbiAgICAgIHJhbmRvbURpciA9PT0gMFxuICAgICAgICA/IEFycmF5LmZyb20oXG4gICAgICAgICAgICB7IGxlbmd0aDogc2hpcC5sZW5ndGggfSxcbiAgICAgICAgICAgIChlbCwgaW5kZXgpID0+IHJhbmRvbUluZGV4ICsgaW5kZXggKiAxMFxuICAgICAgICAgIClcbiAgICAgICAgOiBBcnJheS5mcm9tKFxuICAgICAgICAgICAgeyBsZW5ndGg6IHNoaXAubGVuZ3RoIH0sXG4gICAgICAgICAgICAoZWwsIGluZGV4KSA9PiByYW5kb21JbmRleCArIGluZGV4XG4gICAgICAgICAgKTtcbiAgICBjb25zdCBjaGVja1NwYWNlID1cbiAgICAgIHJhbmRvbUluZGV4ICUgMTAgPT09IDAgPyAwIDogX3Jvd0xlbmd0aCAtIChyYW5kb21JbmRleCAlIDEwKSArIDE7XG5cbiAgICBpZiAoIXJhbmRvbURpciAmJiBjaGVja1NxdWFyZXMoc3F1YXJlcykpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidmVydGljYWxcIik7XG4gICAgICBjb25zb2xlLmxvZyhzcXVhcmVzKTtcbiAgICAgIHJldHVybiBwbGFjZVNoaXAoc2hpcCwgc3F1YXJlcyk7XG4gICAgfSBlbHNlIGlmIChjaGVja1NxdWFyZXMoc3F1YXJlcykgJiYgY2hlY2tTcGFjZSA+IHNoaXAubGVuZ3RoKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImhvcml6b250YWxcIik7XG4gICAgICBjb25zb2xlLmxvZyhzcXVhcmVzKTtcbiAgICAgIHJldHVybiBwbGFjZVNoaXAoc2hpcCwgc3F1YXJlcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U3Vycm91bmRpbmdTcXVhcmVzKHNxdWFyZSkge1xuICAgIGNvbnN0IHNxID0gTnVtYmVyKHNxdWFyZSk7XG4gICAgY29uc3QgcmlnaHRTcXVhcmUgPSBzcSAlIDEwID09PSAwID8gbnVsbCA6IHNxICsgMTtcbiAgICBjb25zdCBsZWZ0U3F1YXJlID0gc3EgJSAxMCA9PT0gMSA/IG51bGwgOiBzcSAtIDE7XG4gICAgY29uc3QgdG9wU3F1YXJlID0gc3EgLSAxMCA8IDEgPyBudWxsIDogc3EgLSAxMDtcbiAgICBjb25zdCBib3R0b21TcXVhcmUgPSBzcSArIDEwID4gMTAwID8gbnVsbCA6IHNxICsgMTA7XG5cbiAgICByZXR1cm4gW3JpZ2h0U3F1YXJlLCBsZWZ0U3F1YXJlLCB0b3BTcXVhcmUsIGJvdHRvbVNxdWFyZV07XG4gIH1cblxuICBmdW5jdGlvbiBhaVR1cm4ocGxheWVyLCBwbGF5ZXJCb2FyZCkge1xuICAgIGxldCBvcGVuU3F1YXJlcyA9IHBsYXllckJvYXJkLmJvYXJkLmZpbHRlcihcbiAgICAgIChzcSkgPT4gc3Eub2NjdXBpZWQgIT09IFwibWlzc1wiICYmIHNxLm9jY3VwaWVkICE9PSBcImhpdFwiXG4gICAgKTtcbiAgICBjb25zdCByYW5kb21OdW1iZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBvcGVuU3F1YXJlcy5sZW5ndGgpO1xuXG4gICAgLyo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IGNvbW1lbnQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gICAgY29uc3QgY3VycmVudFNxdWFyZSA9IG9wZW5TcXVhcmVzW3JhbmRvbU51bWJlcl0uc3F1YXJlO1xuICAgIGNvbnN0IHNxdWFyZURpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5wbGF5ZXItYm9hcmQgPiAuc3F1YXJlYClbXG4gICAgICBjdXJyZW50U3F1YXJlIC0gMVxuICAgIF07XG5cbiAgICBwbGF5ZXJCb2FyZC5yZWNlaXZlQXR0YWNrKGN1cnJlbnRTcXVhcmUsIHBsYXllcik7XG5cbiAgICBpZiAocGxheWVyQm9hcmQuZ2V0U3F1YXJlKGN1cnJlbnRTcXVhcmUpLm9jY3VwaWVkID09PSBcIm1pc3NcIikge1xuICAgICAgY29uc3QgcGllY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgcGllY2UuY2xhc3NMaXN0LmFkZChcInBpZWNlXCIpO1xuICAgICAgc3F1YXJlRGl2LmFwcGVuZChwaWVjZSk7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChwbGF5ZXJCb2FyZC5nZXRTcXVhcmUoY3VycmVudFNxdWFyZSkub2NjdXBpZWQgPT09IFwiaGl0XCIpIHtcbiAgICAgIGNvbnN0IHBpZWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHBpZWNlLmlubmVyVGV4dCA9IFwiWFwiO1xuICAgICAgcGllY2UuY2xhc3NMaXN0LmFkZChcImhpdFwiKTtcbiAgICAgIHNxdWFyZURpdi5hcHBlbmQocGllY2UpO1xuICAgIH1cblxuICAgIGlmIChwbGF5ZXIuc2hpcHMuZXZlcnkoKHNoaXApID0+IHNoaXAuc3VuaygpKSkge1xuICAgICAgY29uc29sZS5sb2coXCJnYW1lT3ZlclwiKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXRpYWxpemVCb2FyZCxcbiAgICByZWNlaXZlQXR0YWNrLFxuICAgIGNoZWNrU3F1YXJlcyxcbiAgICBwbGFjZVNoaXAsXG4gICAgcmVjZWl2ZUF0dGFjayxcbiAgICBnZXRTcXVhcmUsXG4gICAgYm9hcmQsXG4gICAgZ2V0U3Vycm91bmRpbmdTcXVhcmVzLFxuICAgIHBsYWNlU2hpcFJhbmRvbWx5LFxuICAgIGFpVHVybixcbiAgICByZXNldEJvYXJkLFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lYm9hcmQ7XG4iLCJjb25zdCBTaGlwID0gcmVxdWlyZShcIi4vU2hpcFwiKTtcblxuY29uc3QgUGxheWVyID0gKG5hbWUsIGJvb2xlYW4pID0+IHtcbiAgbGV0IEFJID0gYm9vbGVhbjtcblxuICBjb25zdCBjYXJyaWVyID0gU2hpcChcImNhcnJpZXJcIiwgNSk7XG4gIGNvbnN0IGJhdHRsZXNoaXAgPSBTaGlwKFwiYmF0dGxlc2hpcFwiLCA0KTtcbiAgY29uc3QgY3J1aXNlciA9IFNoaXAoXCJjcnVpc2VyXCIsIDMpO1xuICBjb25zdCBzdWJtYXJpbmUgPSBTaGlwKFwic3VibWFyaW5lXCIsIDMpO1xuICBjb25zdCBkZXN0cm95ZXIgPSBTaGlwKFwiZGVzdHJveWVyXCIsIDIpO1xuXG4gIGZ1bmN0aW9uIGdldFNoaXAobmFtZSkge1xuICAgIHJldHVybiBzaGlwcy5maW5kKChzaGlwKSA9PiBzaGlwLm5hbWUgPT09IG5hbWUpO1xuICB9XG5cbiAgY29uc3Qgc2hpcHMgPSBbY2FycmllciwgYmF0dGxlc2hpcCwgY3J1aXNlciwgc3VibWFyaW5lLCBkZXN0cm95ZXJdO1xuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIHNoaXBzLmZvckVhY2goKHNoaXApID0+IChzaGlwLnNxdWFyZXMgPSBbXSkpO1xuICB9XG5cbiAgcmV0dXJuIHsgbmFtZSwgc2hpcHMsIGdldFNoaXAsIEFJLCByZXNldCB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG4iLCJjb25zdCBTaGlwID0gKG5hbWUsIGxlbmd0aCkgPT4ge1xuICBsZXQgc3F1YXJlcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIGFkZFNxdWFyZShudW1iZXIpIHtcbiAgICBpZiAobnVtYmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcImVycm9yXCIpO1xuICAgIH1cblxuICAgIHNxdWFyZXMubGVuZ3RoID0gMDtcblxuICAgIGNvbnN0IGl0ZXJhYmxlID0gKEFycmF5LmlzQXJyYXkobnVtYmVyKSAmJiBudW1iZXIpIHx8XG4gICAgICAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgQXJyYXkuZnJvbShhcmd1bWVudHMpKSB8fCBbbnVtYmVyXTtcblxuICAgIGl0ZXJhYmxlLmZvckVhY2goKGVsKSA9PiBzcXVhcmVzLnB1c2goeyBzcXVhcmU6IGVsLCBoaXQ6IGZhbHNlIH0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpdChudW1iZXIpIHtcbiAgICBzcXVhcmVzLmZvckVhY2goKGVsLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGVsLnNxdWFyZSA9PT0gbnVtYmVyKSB7XG4gICAgICAgIGVsLmhpdCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzdW5rKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTcXVhcmVzKCkge1xuICAgIGlmIChzcXVhcmVzLmxlbmd0aCkgcmV0dXJuIHNxdWFyZXMubWFwKChlbCkgPT4gZWwuc3F1YXJlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNxdWFyZShudW1iZXIpIHtcbiAgICByZXR1cm4gc3F1YXJlcy5maW5kKChlbCkgPT4gZWwuc3F1YXJlID09PSBudW1iZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3VuaygpIHtcbiAgICBpZiAoc3F1YXJlc1swXSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHNxdWFyZXMubWFwKChlbCkgPT4gZWwuaGl0KS5ldmVyeSgoZWwpID0+IGVsID09PSB0cnVlKTtcbiAgfVxuXG4gIHJldHVybiB7IHNxdWFyZXMsIGhpdCwgc3VuaywgYWRkU3F1YXJlLCBuYW1lLCBsZW5ndGgsIGdldFNxdWFyZXMsIGdldFNxdWFyZSB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaGlwO1xuIiwicmVxdWlyZShcIi4uL3NyYy9pbmRleC5jc3NcIik7XG5jb25zdCBET00gPSByZXF1aXJlKFwiLi4vc3JjL2ZhY3Rvcmllcy9ET01cIik7XG5jb25zdCBkb20gPSBET00oKTtcblxuZG9tLmhlYWRlcigpO1xuZG9tLmluaXRHYW1lKCk7XG4iLCJmdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgaWYgKCFzdHIpIHJldHVybjtcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKFwiWzAtOV0rXCIsIFwiXCIpO1xuICByZXR1cm4gTnVtYmVyKHN0ci5tYXRjaChyZWdleClbMF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlU3RyaW5nO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYCoge1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBwYWRkaW5nOiAwO1xuICBtYXJnaW46IDA7XG59XG5cbkBmb250LWZhY2Uge1xuICBmb250LWZhbWlseTogXCJCbGFjayBPcHMgT25lXCI7XG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcbiAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgc3JjOiB1cmwoaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbS9zL2JsYWNrb3Bzb25lL3YyMC9xV2NzQjYteXBvN3hCZHI2WHNoZTk2SDNhRHZidHcud29mZjIpXG4gICAgZm9ybWF0KFwid29mZjJcIik7XG4gIHVuaWNvZGUtcmFuZ2U6IFUrMDAwMC0wMEZGLCBVKzAxMzEsIFUrMDE1Mi0wMTUzLCBVKzAyQkItMDJCQywgVSswMkM2LCBVKzAyREEsXG4gICAgVSswMkRDLCBVKzAzMDQsIFUrMDMwOCwgVSswMzI5LCBVKzIwMDAtMjA2RiwgVSsyMDc0LCBVKzIwQUMsIFUrMjEyMiwgVSsyMTkxLFxuICAgIFUrMjE5MywgVSsyMjEyLCBVKzIyMTUsIFUrRkVGRiwgVStGRkZEO1xufVxuXG5AZm9udC1mYWNlIHtcbiAgZm9udC1mYW1pbHk6IFwiTGF0b1wiO1xuICBmb250LXN0eWxlOiBub3JtYWw7XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG4gIHNyYzogdXJsKGh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20vcy9sYXRvL3YyNC9TNnU5dzRCTVVUUEhoN1VTU3dpUEdRLndvZmYyKVxuICAgIGZvcm1hdChcIndvZmYyXCIpO1xuICB1bmljb2RlLXJhbmdlOiBVKzAwMDAtMDBGRiwgVSswMTMxLCBVKzAxNTItMDE1MywgVSswMkJCLTAyQkMsIFUrMDJDNiwgVSswMkRBLFxuICAgIFUrMDJEQywgVSswMzA0LCBVKzAzMDgsIFUrMDMyOSwgVSsyMDAwLTIwNkYsIFUrMjA3NCwgVSsyMEFDLCBVKzIxMjIsIFUrMjE5MSxcbiAgICBVKzIxOTMsIFUrMjIxMiwgVSsyMjE1LCBVK0ZFRkYsIFUrRkZGRDtcbn1cblxuQGZvbnQtZmFjZSB7XG4gIGZvbnQtZmFtaWx5OiBcIkxhdG9cIjtcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xuICBmb250LXdlaWdodDogNDAwO1xuICBzcmM6IHVybChodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tL3MvbGF0by92MjQvUzZ1eXc0Qk1VVFBIang0d1hnLndvZmYyKVxuICAgIGZvcm1hdChcIndvZmYyXCIpO1xuICB1bmljb2RlLXJhbmdlOiBVKzAwMDAtMDBGRiwgVSswMTMxLCBVKzAxNTItMDE1MywgVSswMkJCLTAyQkMsIFUrMDJDNiwgVSswMkRBLFxuICAgIFUrMDJEQywgVSswMzA0LCBVKzAzMDgsIFUrMDMyOSwgVSsyMDAwLTIwNkYsIFUrMjA3NCwgVSsyMEFDLCBVKzIxMjIsIFUrMjE5MSxcbiAgICBVKzIxOTMsIFUrMjIxMiwgVSsyMjE1LCBVK0ZFRkYsIFUrRkZGRDtcbn1cblxuQGZvbnQtZmFjZSB7XG4gIGZvbnQtZmFtaWx5OiBcIkxhdG9cIjtcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xuICBmb250LXdlaWdodDogNzAwO1xuICBzcmM6IHVybChodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tL3MvbGF0by92MjQvUzZ1OXc0Qk1VVFBIaDZVVlN3aVBHUS53b2ZmMilcbiAgICBmb3JtYXQoXCJ3b2ZmMlwiKTtcbiAgdW5pY29kZS1yYW5nZTogVSswMDAwLTAwRkYsIFUrMDEzMSwgVSswMTUyLTAxNTMsIFUrMDJCQi0wMkJDLCBVKzAyQzYsIFUrMDJEQSxcbiAgICBVKzAyREMsIFUrMDMwNCwgVSswMzA4LCBVKzAzMjksIFUrMjAwMC0yMDZGLCBVKzIwNzQsIFUrMjBBQywgVSsyMTIyLCBVKzIxOTEsXG4gICAgVSsyMTkzLCBVKzIyMTIsIFUrMjIxNSwgVStGRUZGLCBVK0ZGRkQ7XG59XG5cbmJvZHkge1xuICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgSGVsdmV0aWNhLFxuICAgIEFyaWFsLCBzYW5zLXNlcmlmLCBcIkFwcGxlIENvbG9yIEVtb2ppXCIsIFwiU2Vnb2UgVUkgRW1vamlcIiwgXCJTZWdvZSBVSSBTeW1ib2xcIjtcbiAgaGVpZ2h0OiAxMDB2aDtcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KFxuICAgIHRvIGxlZnQgdG9wLFxuICAgICMxZTNhOGEsXG4gICAgIzE2Mzc3NyxcbiAgICAjMTYzMzYzLFxuICAgICMxYTJlNGYsXG4gICAgIzFlMjkzYlxuICApO1xuICBwYWRkaW5nLXRvcDogNTBweDtcbn1cblxuaDEge1xuICBmb250LWZhbWlseTogXCJCbGFjayBPcHMgT25lXCI7XG4gIGZvbnQtc2l6ZTogY2xhbXAoM3JlbSwgNnZ3LCA1cmVtKTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBtYXJnaW46IDAgYXV0bztcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KFxuICAgIHRvIHRvcCxcbiAgICAjZjlmYWZiLFxuICAgICNkZWU0ZWEsXG4gICAgI2M1Y2VkOSxcbiAgICAjYWNiOGM4LFxuICAgICM5NGEzYjhcbiAgKTtcbiAgLXdlYmtpdC1iYWNrZ3JvdW5kLWNsaXA6IHRleHQ7XG4gIC13ZWJraXQtdGV4dC1maWxsLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgYm9yZGVyLXRvcDogMTBweCBzb2xpZCByZ2IoMTQ1LCAxMSwgMTEpO1xuICB3aWR0aDogbWF4LWNvbnRlbnQ7XG59XG5cbi5ib2FyZCB7XG4gIHBhZGRpbmctdG9wOiA1MHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LXdyYXA6IG5vLXdyYXA7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBnYXA6IDUwcHg7XG59XG5cbi5ib2FyZCAuZW5lbXktYm9hcmQsXG4uYm9hcmQgLnBsYXllci1ib2FyZCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZGlzcGxheTogZ3JpZDtcbiAgYXNwZWN0LXJhdGlvOiAxIC8gMTtcbiAgbWluLXdpZHRoOiAzMDBweDtcbiAgbWF4LWhlaWdodDogMzAwcHg7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDEwLCAxZnIpO1xuICBncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCgxMCwgMWZyKTtcbiAgYmFja2dyb3VuZDogcmdiYSgyNiwgMTAyLCAxNTMsIDAuNjUpO1xuICBib3gtc2hhZG93OiByZ2JhKDAsIDAsIDAsIDAuNCkgMHB4IDJweCA0cHgsXG4gICAgcmdiYSgwLCAwLCAwLCAwLjMpIDBweCA3cHggMTNweCAtM3B4LCByZ2JhKDAsIDAsIDAsIDAuMikgMHB4IC0zcHggMHB4IGluc2V0O1xuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMy41cHgpO1xuICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cigzLjVweCk7XG4gIGJvcmRlci1yYWRpdXM6IDA7XG4gIHotaW5kZXg6IDE7XG59XG5cbi5lbmVteS1ib2FyZCB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLnNxdWFyZSB7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjYsIDEwMiwgMTUzLCAwLjY1KTtcbn1cblxuLmVuZW15LWJvYXJkIC5zcXVhcmU6bm90KC5oaXQpOmhvdmVyLFxuLmVuZW15LWJvYXJkIC5zcXVhcmU6bm90KC5oaXQpOmFjdGl2ZSB7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig0NSwgMTM0LCAxOTQpO1xufVxuXG4uc2hpcC1kaXYge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtd3JhcDogd3JhcDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XG4gIGdhcDogMjRweDtcbiAgd2lkdGg6IDMwMHB4O1xuICBwYWRkaW5nOiAyMHB4O1xufVxuXG4uZGlyZWN0aW9ucy50aXRsZSB7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgZm9udC1zaXplOiAxLjVyZW07XG59XG5cbi5kaXJlY3Rpb25zIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGNvbG9yOiB3aGl0ZTtcbiAgZm9udC1mYW1pbHk6IFwiTGF0b1wiO1xufVxuXG4uc2hpcCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG59XG5cbi5zaGlwLmhvcml6b250YWwge1xuICBmbGV4LWRpcmVjdGlvbjogcm93O1xufVxuXG4uc2hpcFtkcmFnZ2FibGVdIHtcbiAgY3Vyc29yOiBncmFiO1xufVxuXG4uc2hpcFtkcmFnZ2FibGVdOmFjdGl2ZSB7XG4gIGN1cnNvcjogZ3JhYmJpbmc7XG59XG5cbi5zaGlwLXNxdWFyZSB7XG4gIHdpZHRoOiAzMHB4O1xuICBoZWlnaHQ6IDMwcHg7XG4gIGFzcGVjdC1yYXRpbzogMSAvIDE7XG4gIGJvcmRlcjogMXB4IHNvbGlkICNjYmQ1ZTE7XG4gIGJhY2tncm91bmQtY29sb3I6ICM5NGEzYjg7XG59XG5cbi5waWVjZSB7XG4gIHdpZHRoOiAxMHB4O1xuICBoZWlnaHQ6IDEwcHg7XG4gIGJvcmRlci1yYWRpdXM6IDEwMCU7XG4gIHotaW5kZXg6IDEwO1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogNTAlO1xuICBsZWZ0OiA1MCU7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICBib3gtc2hhZG93OiByZ2JhKDAsIDAsIDAsIDAuNCkgMHB4IDJweCA0cHgsXG4gICAgcmdiYSgwLCAwLCAwLCAwLjMpIDBweCA3cHggMTNweCAtM3B4LCByZ2JhKDAsIDAsIDAsIDAuMikgMHB4IC0zcHggMHB4IGluc2V0O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbn1cblxuLmhpdCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xuICBmb250LXNpemU6IDIwcHg7XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgY29sb3I6IHdoaXRlO1xuICBib3JkZXI6IDFweCBzb2xpZCBibGFjaztcbn1cblxuLnN0YXJ0LmJ0bixcbi5yZXN0YXJ0LmJ0biB7XG4gIHdpZHRoOiAxMjVweDtcbiAgcGFkZGluZy10b3A6IDEwcHg7XG4gIHBhZGRpbmctYm90dG9tOiAxMHB4O1xuICBmb250LWZhbWlseTogQXJpYWw7XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIGxldHRlci1zcGFjaW5nOiAwLjAzcmVtO1xuICBmb250LXNpemU6IDEuMjVyZW07XG4gIG1hcmdpbi10b3A6IDI1cHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgYm9yZGVyOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XG4gIGNvbG9yOiB3aGl0ZTtcbiAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjQpIDBweCAycHggNHB4LFxuICAgIHJnYmEoMCwgMCwgMCwgMC4zKSAwcHggN3B4IDEzcHggLTNweCwgcmdiYSgwLCAwLCAwLCAwLjIpIDBweCAtM3B4IDBweCBpbnNldDtcbn1cblxuLnN0YXJ0LmJ0bjphY3RpdmUsXG4ucmVzdGFydC5idG46YWN0aXZlIHtcbiAgY29sb3I6IHdoaXRlO1xuICBib3gtc2hhZG93OiBub25lO1xufVxuXG4uZ2FtZS1vdmVyIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBkaXNwbGF5OiBncmlkO1xuICBwbGFjZS1pdGVtczogY2VudGVyO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNSk7XG4gIHRvcDogMDtcbiAgcmlnaHQ6IDA7XG4gIHotaW5kZXg6IDk5OTk5O1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xufVxuXG4uZ2FtZS1vdmVyIGRpdiB7XG4gIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICBib3gtc2hhZG93OiByZ2JhKDAsIDAsIDAsIDAuMTkpIDBweCAxMHB4IDIwcHgsIHJnYmEoMCwgMCwgMCwgMC4yMykgMHB4IDZweCA2cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBwYWRkaW5nOiA1MHB4O1xufVxuYCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvaW5kZXguY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBO0VBQ0Usc0JBQXNCO0VBQ3RCLFVBQVU7RUFDVixTQUFTO0FBQ1g7O0FBRUE7RUFDRSw0QkFBNEI7RUFDNUIsa0JBQWtCO0VBQ2xCLGdCQUFnQjtFQUNoQjttQkFDaUI7RUFDakI7OzBDQUV3QztBQUMxQzs7QUFFQTtFQUNFLG1CQUFtQjtFQUNuQixrQkFBa0I7RUFDbEIsZ0JBQWdCO0VBQ2hCO21CQUNpQjtFQUNqQjs7MENBRXdDO0FBQzFDOztBQUVBO0VBQ0UsbUJBQW1CO0VBQ25CLGtCQUFrQjtFQUNsQixnQkFBZ0I7RUFDaEI7bUJBQ2lCO0VBQ2pCOzswQ0FFd0M7QUFDMUM7O0FBRUE7RUFDRSxtQkFBbUI7RUFDbkIsa0JBQWtCO0VBQ2xCLGdCQUFnQjtFQUNoQjttQkFDaUI7RUFDakI7OzBDQUV3QztBQUMxQzs7QUFFQTtFQUNFOytFQUM2RTtFQUM3RSxhQUFhO0VBQ2I7Ozs7Ozs7R0FPQztFQUNELGlCQUFpQjtBQUNuQjs7QUFFQTtFQUNFLDRCQUE0QjtFQUM1QixpQ0FBaUM7RUFDakMsa0JBQWtCO0VBQ2xCLGNBQWM7RUFDZDs7Ozs7OztHQU9DO0VBQ0QsNkJBQTZCO0VBQzdCLG9DQUFvQztFQUNwQyx1Q0FBdUM7RUFDdkMsa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsaUJBQWlCO0VBQ2pCLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsdUJBQXVCO0VBQ3ZCLFNBQVM7QUFDWDs7QUFFQTs7RUFFRSxrQkFBa0I7RUFDbEIsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQixnQkFBZ0I7RUFDaEIsaUJBQWlCO0VBQ2pCLHNDQUFzQztFQUN0QyxtQ0FBbUM7RUFDbkMsb0NBQW9DO0VBQ3BDOytFQUM2RTtFQUM3RSw0QkFBNEI7RUFDNUIsb0NBQW9DO0VBQ3BDLGdCQUFnQjtFQUNoQixVQUFVO0FBQ1o7O0FBRUE7RUFDRSxlQUFlO0FBQ2pCOztBQUVBO0VBQ0UsMENBQTBDO0FBQzVDOztBQUVBOztFQUVFLG1DQUFtQztBQUNyQzs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixhQUFhO0VBQ2IsZUFBZTtFQUNmLHVCQUF1QjtFQUN2Qix5QkFBeUI7RUFDekIsU0FBUztFQUNULFlBQVk7RUFDWixhQUFhO0FBQ2Y7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsZ0JBQWdCO0VBQ2hCLGlCQUFpQjtBQUNuQjs7QUFFQTtFQUNFLFdBQVc7RUFDWCxZQUFZO0VBQ1osbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsYUFBYTtFQUNiLHNCQUFzQjtBQUN4Qjs7QUFFQTtFQUNFLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLFlBQVk7QUFDZDs7QUFFQTtFQUNFLGdCQUFnQjtBQUNsQjs7QUFFQTtFQUNFLFdBQVc7RUFDWCxZQUFZO0VBQ1osbUJBQW1CO0VBQ25CLHlCQUF5QjtFQUN6Qix5QkFBeUI7QUFDM0I7O0FBRUE7RUFDRSxXQUFXO0VBQ1gsWUFBWTtFQUNaLG1CQUFtQjtFQUNuQixXQUFXO0VBQ1gsa0JBQWtCO0VBQ2xCLFFBQVE7RUFDUixTQUFTO0VBQ1QsZ0NBQWdDO0VBQ2hDOytFQUM2RTtFQUM3RSx1QkFBdUI7QUFDekI7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsV0FBVztFQUNYLFlBQVk7RUFDWixxQkFBcUI7RUFDckIsZUFBZTtFQUNmLGdCQUFnQjtFQUNoQixrQkFBa0I7RUFDbEIsWUFBWTtFQUNaLHVCQUF1QjtBQUN6Qjs7QUFFQTs7RUFFRSxZQUFZO0VBQ1osaUJBQWlCO0VBQ2pCLG9CQUFvQjtFQUNwQixrQkFBa0I7RUFDbEIsZ0JBQWdCO0VBQ2hCLHVCQUF1QjtFQUN2QixrQkFBa0I7RUFDbEIsZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZixZQUFZO0VBQ1oscUJBQXFCO0VBQ3JCLFlBQVk7RUFDWjsrRUFDNkU7QUFDL0U7O0FBRUE7O0VBRUUsWUFBWTtFQUNaLGdCQUFnQjtBQUNsQjs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixhQUFhO0VBQ2IsbUJBQW1CO0VBQ25CLG9DQUFvQztFQUNwQyxNQUFNO0VBQ04sUUFBUTtFQUNSLGNBQWM7RUFDZCxXQUFXO0VBQ1gsWUFBWTtBQUNkOztBQUVBO0VBQ0UsdUJBQXVCO0VBQ3ZCLDhFQUE4RTtFQUM5RSxhQUFhO0VBQ2Isc0JBQXNCO0VBQ3RCLG1CQUFtQjtFQUNuQix1QkFBdUI7RUFDdkIsYUFBYTtBQUNmXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIioge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIHBhZGRpbmc6IDA7XFxuICBtYXJnaW46IDA7XFxufVxcblxcbkBmb250LWZhY2Uge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJCbGFjayBPcHMgT25lXFxcIjtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBzcmM6IHVybChodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tL3MvYmxhY2tvcHNvbmUvdjIwL3FXY3NCNi15cG83eEJkcjZYc2hlOTZIM2FEdmJ0dy53b2ZmMilcXG4gICAgZm9ybWF0KFxcXCJ3b2ZmMlxcXCIpO1xcbiAgdW5pY29kZS1yYW5nZTogVSswMDAwLTAwRkYsIFUrMDEzMSwgVSswMTUyLTAxNTMsIFUrMDJCQi0wMkJDLCBVKzAyQzYsIFUrMDJEQSxcXG4gICAgVSswMkRDLCBVKzAzMDQsIFUrMDMwOCwgVSswMzI5LCBVKzIwMDAtMjA2RiwgVSsyMDc0LCBVKzIwQUMsIFUrMjEyMiwgVSsyMTkxLFxcbiAgICBVKzIxOTMsIFUrMjIxMiwgVSsyMjE1LCBVK0ZFRkYsIFUrRkZGRDtcXG59XFxuXFxuQGZvbnQtZmFjZSB7XFxuICBmb250LWZhbWlseTogXFxcIkxhdG9cXFwiO1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gIHNyYzogdXJsKGh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20vcy9sYXRvL3YyNC9TNnU5dzRCTVVUUEhoN1VTU3dpUEdRLndvZmYyKVxcbiAgICBmb3JtYXQoXFxcIndvZmYyXFxcIik7XFxuICB1bmljb2RlLXJhbmdlOiBVKzAwMDAtMDBGRiwgVSswMTMxLCBVKzAxNTItMDE1MywgVSswMkJCLTAyQkMsIFUrMDJDNiwgVSswMkRBLFxcbiAgICBVKzAyREMsIFUrMDMwNCwgVSswMzA4LCBVKzAzMjksIFUrMjAwMC0yMDZGLCBVKzIwNzQsIFUrMjBBQywgVSsyMTIyLCBVKzIxOTEsXFxuICAgIFUrMjE5MywgVSsyMjEyLCBVKzIyMTUsIFUrRkVGRiwgVStGRkZEO1xcbn1cXG5cXG5AZm9udC1mYWNlIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTGF0b1xcXCI7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAgc3JjOiB1cmwoaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbS9zL2xhdG8vdjI0L1M2dXl3NEJNVVRQSGp4NHdYZy53b2ZmMilcXG4gICAgZm9ybWF0KFxcXCJ3b2ZmMlxcXCIpO1xcbiAgdW5pY29kZS1yYW5nZTogVSswMDAwLTAwRkYsIFUrMDEzMSwgVSswMTUyLTAxNTMsIFUrMDJCQi0wMkJDLCBVKzAyQzYsIFUrMDJEQSxcXG4gICAgVSswMkRDLCBVKzAzMDQsIFUrMDMwOCwgVSswMzI5LCBVKzIwMDAtMjA2RiwgVSsyMDc0LCBVKzIwQUMsIFUrMjEyMiwgVSsyMTkxLFxcbiAgICBVKzIxOTMsIFUrMjIxMiwgVSsyMjE1LCBVK0ZFRkYsIFUrRkZGRDtcXG59XFxuXFxuQGZvbnQtZmFjZSB7XFxuICBmb250LWZhbWlseTogXFxcIkxhdG9cXFwiO1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIHNyYzogdXJsKGh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20vcy9sYXRvL3YyNC9TNnU5dzRCTVVUUEhoNlVWU3dpUEdRLndvZmYyKVxcbiAgICBmb3JtYXQoXFxcIndvZmYyXFxcIik7XFxuICB1bmljb2RlLXJhbmdlOiBVKzAwMDAtMDBGRiwgVSswMTMxLCBVKzAxNTItMDE1MywgVSswMkJCLTAyQkMsIFUrMDJDNiwgVSswMkRBLFxcbiAgICBVKzAyREMsIFUrMDMwNCwgVSswMzA4LCBVKzAzMjksIFUrMjAwMC0yMDZGLCBVKzIwNzQsIFUrMjBBQywgVSsyMTIyLCBVKzIxOTEsXFxuICAgIFUrMjE5MywgVSsyMjEyLCBVKzIyMTUsIFUrRkVGRiwgVStGRkZEO1xcbn1cXG5cXG5ib2R5IHtcXG4gIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFxcXCJTZWdvZSBVSVxcXCIsIFJvYm90bywgSGVsdmV0aWNhLFxcbiAgICBBcmlhbCwgc2Fucy1zZXJpZiwgXFxcIkFwcGxlIENvbG9yIEVtb2ppXFxcIiwgXFxcIlNlZ29lIFVJIEVtb2ppXFxcIiwgXFxcIlNlZ29lIFVJIFN5bWJvbFxcXCI7XFxuICBoZWlnaHQ6IDEwMHZoO1xcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KFxcbiAgICB0byBsZWZ0IHRvcCxcXG4gICAgIzFlM2E4YSxcXG4gICAgIzE2Mzc3NyxcXG4gICAgIzE2MzM2MyxcXG4gICAgIzFhMmU0ZixcXG4gICAgIzFlMjkzYlxcbiAgKTtcXG4gIHBhZGRpbmctdG9wOiA1MHB4O1xcbn1cXG5cXG5oMSB7XFxuICBmb250LWZhbWlseTogXFxcIkJsYWNrIE9wcyBPbmVcXFwiO1xcbiAgZm9udC1zaXplOiBjbGFtcCgzcmVtLCA2dncsIDVyZW0pO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgbWFyZ2luOiAwIGF1dG87XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoXFxuICAgIHRvIHRvcCxcXG4gICAgI2Y5ZmFmYixcXG4gICAgI2RlZTRlYSxcXG4gICAgI2M1Y2VkOSxcXG4gICAgI2FjYjhjOCxcXG4gICAgIzk0YTNiOFxcbiAgKTtcXG4gIC13ZWJraXQtYmFja2dyb3VuZC1jbGlwOiB0ZXh0O1xcbiAgLXdlYmtpdC10ZXh0LWZpbGwtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLXRvcDogMTBweCBzb2xpZCByZ2IoMTQ1LCAxMSwgMTEpO1xcbiAgd2lkdGg6IG1heC1jb250ZW50O1xcbn1cXG5cXG4uYm9hcmQge1xcbiAgcGFkZGluZy10b3A6IDUwcHg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC13cmFwOiBuby13cmFwO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBnYXA6IDUwcHg7XFxufVxcblxcbi5ib2FyZCAuZW5lbXktYm9hcmQsXFxuLmJvYXJkIC5wbGF5ZXItYm9hcmQge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGFzcGVjdC1yYXRpbzogMSAvIDE7XFxuICBtaW4td2lkdGg6IDMwMHB4O1xcbiAgbWF4LWhlaWdodDogMzAwcHg7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMCwgMWZyKTtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogcmVwZWF0KDEwLCAxZnIpO1xcbiAgYmFja2dyb3VuZDogcmdiYSgyNiwgMTAyLCAxNTMsIDAuNjUpO1xcbiAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjQpIDBweCAycHggNHB4LFxcbiAgICByZ2JhKDAsIDAsIDAsIDAuMykgMHB4IDdweCAxM3B4IC0zcHgsIHJnYmEoMCwgMCwgMCwgMC4yKSAwcHggLTNweCAwcHggaW5zZXQ7XFxuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMy41cHgpO1xcbiAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoMy41cHgpO1xcbiAgYm9yZGVyLXJhZGl1czogMDtcXG4gIHotaW5kZXg6IDE7XFxufVxcblxcbi5lbmVteS1ib2FyZCB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbi5zcXVhcmUge1xcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNiwgMTAyLCAxNTMsIDAuNjUpO1xcbn1cXG5cXG4uZW5lbXktYm9hcmQgLnNxdWFyZTpub3QoLmhpdCk6aG92ZXIsXFxuLmVuZW15LWJvYXJkIC5zcXVhcmU6bm90KC5oaXQpOmFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNDUsIDEzNCwgMTk0KTtcXG59XFxuXFxuLnNoaXAtZGl2IHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LXdyYXA6IHdyYXA7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XFxuICBnYXA6IDI0cHg7XFxuICB3aWR0aDogMzAwcHg7XFxuICBwYWRkaW5nOiAyMHB4O1xcbn1cXG5cXG4uZGlyZWN0aW9ucy50aXRsZSB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxufVxcblxcbi5kaXJlY3Rpb25zIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgZm9udC1mYW1pbHk6IFxcXCJMYXRvXFxcIjtcXG59XFxuXFxuLnNoaXAge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxufVxcblxcbi5zaGlwLmhvcml6b250YWwge1xcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcXG59XFxuXFxuLnNoaXBbZHJhZ2dhYmxlXSB7XFxuICBjdXJzb3I6IGdyYWI7XFxufVxcblxcbi5zaGlwW2RyYWdnYWJsZV06YWN0aXZlIHtcXG4gIGN1cnNvcjogZ3JhYmJpbmc7XFxufVxcblxcbi5zaGlwLXNxdWFyZSB7XFxuICB3aWR0aDogMzBweDtcXG4gIGhlaWdodDogMzBweDtcXG4gIGFzcGVjdC1yYXRpbzogMSAvIDE7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjY2JkNWUxO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzk0YTNiODtcXG59XFxuXFxuLnBpZWNlIHtcXG4gIHdpZHRoOiAxMHB4O1xcbiAgaGVpZ2h0OiAxMHB4O1xcbiAgYm9yZGVyLXJhZGl1czogMTAwJTtcXG4gIHotaW5kZXg6IDEwO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG4gIGJveC1zaGFkb3c6IHJnYmEoMCwgMCwgMCwgMC40KSAwcHggMnB4IDRweCxcXG4gICAgcmdiYSgwLCAwLCAwLCAwLjMpIDBweCA3cHggMTNweCAtM3B4LCByZ2JhKDAsIDAsIDAsIDAuMikgMHB4IC0zcHggMHB4IGluc2V0O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxufVxcblxcbi5oaXQge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XFxuICBmb250LXNpemU6IDIwcHg7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgYm9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxufVxcblxcbi5zdGFydC5idG4sXFxuLnJlc3RhcnQuYnRuIHtcXG4gIHdpZHRoOiAxMjVweDtcXG4gIHBhZGRpbmctdG9wOiAxMHB4O1xcbiAgcGFkZGluZy1ib3R0b206IDEwcHg7XFxuICBmb250LWZhbWlseTogQXJpYWw7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDNyZW07XFxuICBmb250LXNpemU6IDEuMjVyZW07XFxuICBtYXJnaW4tdG9wOiAyNXB4O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgYm9yZGVyOiBub25lO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjQpIDBweCAycHggNHB4LFxcbiAgICByZ2JhKDAsIDAsIDAsIDAuMykgMHB4IDdweCAxM3B4IC0zcHgsIHJnYmEoMCwgMCwgMCwgMC4yKSAwcHggLTNweCAwcHggaW5zZXQ7XFxufVxcblxcbi5zdGFydC5idG46YWN0aXZlLFxcbi5yZXN0YXJ0LmJ0bjphY3RpdmUge1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgYm94LXNoYWRvdzogbm9uZTtcXG59XFxuXFxuLmdhbWUtb3ZlciB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgcGxhY2UtaXRlbXM6IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gIHRvcDogMDtcXG4gIHJpZ2h0OiAwO1xcbiAgei1pbmRleDogOTk5OTk7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuXFxuLmdhbWUtb3ZlciBkaXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICBib3gtc2hhZG93OiByZ2JhKDAsIDAsIDAsIDAuMTkpIDBweCAxMHB4IDIwcHgsIHJnYmEoMCwgMCwgMCwgMC4yMykgMHB4IDZweCA2cHg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIHBhZGRpbmc6IDUwcHg7XFxufVxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2luZGV4LmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vaW5kZXguY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiXSwibmFtZXMiOlsiR2FtZWJvYXJkIiwicmVxdWlyZSIsIlBsYXllciIsIkRyYWciLCJwYXJzZVN0cmluZyIsIkRPTSIsInVzZXJCb2FyZCIsInVzZXIiLCJhaUJvYXJkIiwiQUkiLCJkcmFnIiwiaW5pdEdhbWUiLCJpbml0Qm9hcmQiLCJpbml0U2hpcHMiLCJoZWFkZXIiLCJoMSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImlubmVyVGV4dCIsImNsYXNzTGlzdCIsImFkZCIsImJvZHkiLCJhcHBlbmQiLCJpbml0aWFsaXplQm9hcmQiLCJib2FyZCIsInBsYXllckJvYXJkIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRyYWdPdmVyIiwiZHJvcFNoaXAiLCJmb3JFYWNoIiwibnVtIiwiaW5kZXgiLCJwbGF5ZXJTcXVhcmUiLCJzaGlwRGl2IiwicXVlcnlTZWxlY3RvciIsInRpdGxlIiwiZGlyZWN0aW9ucyIsInNoaXBzIiwicmV2ZXJzZSIsInNoaXAiLCJjdXJyZW50U2hpcCIsInNldEF0dHJpYnV0ZSIsIm5hbWUiLCJkcmFnZ2FibGUiLCJsZW5ndGgiLCJzcSIsImRyYWdTdGFydCIsImRvdWJsZUNsaWNrIiwiZSIsInByZXZlbnREZWZhdWx0IiwiaW5pdEFJIiwicmVtb3ZlIiwicXVlcnlTZWxlY3RvckFsbCIsInNxdWFyZSIsInN0eWxlIiwicG9zaXRpb24iLCJlbmVteUJvYXJkIiwiY29uc29sZSIsImxvZyIsImVuZW15U3F1YXJlIiwiZmlyc3RDaGlsZCIsImV2ZXJ5Iiwic3VuayIsImluaXRHYW1lT3ZlciIsInRhcmdldCIsInZhbHVlIiwicmVjZWl2ZUF0dGFjayIsImdldFNxdWFyZSIsIm9jY3VwaWVkIiwicGllY2UiLCJhaVR1cm4iLCJyYW5kb21TdGFydGluZ0luZGV4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwicGxhY2VTaGlwUmFuZG9tbHkiLCJzcXVhcmVzIiwicHJlcGVuZCIsIndpbm5lciIsImdhbWVPdmVyTW9kYWwiLCJpbm5lckhUTUwiLCJ0b1VwcGVyQ2FzZSIsInJlc3RhcnRCdG4iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInJlbG9hZCIsIm1vZHVsZSIsImV4cG9ydHMiLCJwbGF5ZXIiLCJfcm93TGVuZ3RoIiwiZXZlbnQiLCJkYXRhVHJhbnNmZXIiLCJkcm9wRWZmZWN0IiwiQXJyYXkiLCJmcm9tIiwiaW5jbHVkZXMiLCJzaGlwSUQiLCJnZXREYXRhIiwiZHJvcHBlZFNoaXAiLCJnZXRFbGVtZW50QnlJZCIsImNoZWNrSG9yaXpvbnRhbCIsInNoaXBMZW5ndGgiLCJOdW1iZXIiLCJsYXN0Q2hpbGQiLCJpZCIsInN0YXJ0aW5nSW5kZXgiLCJjaGVja1NwYWNlIiwiZWwiLCJjaGVja1NxdWFyZXMiLCJnZXRTaGlwIiwiYXBwZW5kQ2hpbGQiLCJwbGFjZVNoaXAiLCJzaGlwc0FycmF5Iiwic3RhcnRCdG4iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlQXR0cmlidXRlIiwiZXYiLCJFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJzZXREYXRhIiwicGFyZW50RWxlbWVudCIsInRvZ2dsZSIsImkiLCJwdXNoIiwicmVzZXRCb2FyZCIsImZpbmQiLCJpdGVyYWJsZSIsImlzQXJyYXkiLCJzb21lIiwiZmlsbFNxdWFyZXMiLCJhcmd1bWVudHMiLCJhZGRTcXVhcmUiLCJvcHBvbmVudCIsImhpdCIsInJhbmRvbUluZGV4IiwicmFuZG9tRGlyIiwiZ2V0U3Vycm91bmRpbmdTcXVhcmVzIiwicmlnaHRTcXVhcmUiLCJsZWZ0U3F1YXJlIiwidG9wU3F1YXJlIiwiYm90dG9tU3F1YXJlIiwib3BlblNxdWFyZXMiLCJmaWx0ZXIiLCJyYW5kb21OdW1iZXIiLCJjdXJyZW50U3F1YXJlIiwic3F1YXJlRGl2IiwiU2hpcCIsImJvb2xlYW4iLCJjYXJyaWVyIiwiYmF0dGxlc2hpcCIsImNydWlzZXIiLCJzdWJtYXJpbmUiLCJkZXN0cm95ZXIiLCJyZXNldCIsIm51bWJlciIsInVuZGVmaW5lZCIsImdldFNxdWFyZXMiLCJtYXAiLCJkb20iLCJzdHIiLCJyZWdleCIsIlJlZ0V4cCIsIm1hdGNoIl0sInNvdXJjZVJvb3QiOiIifQ==