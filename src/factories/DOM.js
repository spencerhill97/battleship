const Gameboard = require("./Gameboard");
const Player = require("./Player");
const Drag = require("./Drag");
const parseString = require("../utilities/parseString");

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

    user.ships.reverse().forEach((ship) => {
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

    shipDiv.addEventListener("change", (e) => {
      e.preventDefault();
      initAI();
      shipDiv.remove();
      document.querySelectorAll(".square").forEach((square) => {
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
      enemySquare.addEventListener("click", (e) => {
        if (enemySquare.firstChild) {
          return;
        } else if (user.ships.every((ship) => ship.sunk())) {
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

        if (AI.ships.every((ship) => ship.sunk())) {
          return initGameOver();
        }

        aiBoard.aiTurn(user, userBoard);
      });
    });

    AI.ships.forEach((ship) => {
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

      const randomStartingIndex = Math.floor(
        Math.random() * aiBoard.board.length + 1
      );

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

    if (user.ships.every((ship) => ship.sunk())) {
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
    restartBtn.addEventListener("click", (e) => {
      window.location.reload();
    });
  }

  return { initGame, header };
};

module.exports = DOM;
