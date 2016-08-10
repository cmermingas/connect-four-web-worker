import {EventEmitter} from '@angular/core';
import {ConnectFour, GameColumn} from "../model/connect-four";


export class MinimaxPlayer {
  game: ConnectFour;

  constructor(public myNumber: number, _game: ConnectFour, public maxLevel: number = 4) {
    console.log('My number: ', this.myNumber);
    this.game = _game;
  }

  destroy() {
    this.game = null;
  }

  nextMove(): GameColumn {
    // console.log('***** NEXT MOVE *****');
    return this.minimaxMove(this.game).move;
  }

  scoreGameState(gameState: ConnectFour): number {
    let result = !gameState.winner ? 0 : (gameState.winner === this.myNumber ? 1 : -1);
    // console.log('scoreGameState: ', result);
    return result;
  }

  private minimaxMove(gameState: ConnectFour, level: number = 0): {move: GameColumn, score: number} {
    // console.log('Player: ', gameState.currentPlayer, 'Level: ', level);

    let result = null;

    let availableMoves = gameState.getAvailableMoves();

    if (gameState.gameOver || level >= this.maxLevel || availableMoves.length === 0) {
      let score = 0;
      if (gameState.winner === this.myNumber) {
        score = 1;
      }
      else if (gameState.winner) {
        score = -1;
      }
      score = (level > 0 ? score / level : score);
      // let score = this.scoreGameState(gameState);
      // console.log('Final state with score: ', score);
      return {move: null, score: score};
    }


    // console.log('available Moves: ', availableMoves);

    let bestScore;
    let bestMove;
    let fn = gameState.currentPlayer === this.myNumber ? Math.max : Math.min;

    let logit = '';

    availableMoves.forEach((move, i, a) => {
      let stateCopy = gameState.copy();
      let pieceAdded = stateCopy.playAtColumn(move.index);
      let score = this.minimaxMove(stateCopy, level + 1).score;
      logit += (logit.length > 0 ? ' | ' : '') + move.index + ', ' + score;
      if (bestScore === undefined || bestScore !== fn(bestScore, score) || (bestScore === score && Math.random() >= .8)) {
        // console.log('[' + gameState.currentPlayer + ' / ' + level + '] Best move found: ', move, ' / Score: ', score);
        bestScore = score;
        bestMove = move;
      }
      // else if (bestScore === score && Math.random() >= .5) {
      //   bestScore = score;
      //   bestMove = move;
      // }
    });

    if (level === 0) {
      console.log(logit, fn);
    }

    /*
     let nextLevel = availableMoves.map((v, i, a) => {
     let result = {move: v, game: gameState.copy(), score: 0};
     let pieceAdded = result.game.columns[v.index].addPieceForCurrentPlayer();
     result.game.advanceTurn(pieceAdded.column, pieceAdded.cell);
     result.score = this.minimaxMove(result.game, level + 1).score;
     targetScore = fn(targetScore || result.score, result.score);
     return result;
     });
     */
    // console.log('[' + level +'] next level: ', nextLevel);

    // console.log('[' + gameState.currentPlayer + ' / ' + level + '] Best move: ', bestMove, 'Score: ', bestScore);

    result = {move: bestMove, score: bestScore};

    return result;
  }

}

export const minimaxWebWorker = new Blob([`
// This is just copy-pasted from the transpiled minimax-player.ts
// It's awful. Just experimenting with web workers within angular.
var WINNING_LENGTH = 4;
var GameCell = (function () {
  function GameCell(content) {
    if (content === void 0) {
      content = 0;
    }
    this.content = content;
    this.isWinning = false;
  }

  GameCell.prototype.setContent = function (newContent) {
    this.content = newContent;
  };
  GameCell.prototype.setWinning = function () {
    this.isWinning = true;
  };
  GameCell.prototype.copy = function () {
    var result = new GameCell(this.content);
    result.isWinning = this.isWinning;
    return result;
  };
  GameCell.prototype.toJSON = function () {
    return {
      isWinning: this.isWinning,
      content: this.content
    };
  };
  GameCell.fromJSON = function (json) {
    var result = new GameCell(json.content);
    result.isWinning = json.isWinning;
    return result;
  };
  return GameCell;
}());

var GameColumn = (function () {
  function GameColumn(index, cellCount) {
    this.index = index;
    this.cellCount = cellCount;
    this.cells = [];
    this.currentIndex = cellCount - 1;
    for (var i = 0; i < cellCount; i++) {
      this.cells.push(new GameCell());
    }
  }

  GameColumn.prototype.copy = function () {
    var result = new GameColumn(this.index, this.cellCount);
    result.cells = this.cells.map(function (v, i, a) {
      return v.copy();
    });
    result.currentIndex = this.currentIndex;
    return result;
  };
  GameColumn.prototype.toJSON = function () {
    return {
      index: this.index,
      cellCount: this.cellCount,
      cells: this.cells.map(function (v, i, a) {
        return v.toJSON();
      }),
      currentIndex: this.currentIndex
    };
  };
  GameColumn.fromJSON = function (json) {
    var result = new GameColumn(json.index, json.cellCount);
    result.currentIndex = json.currentIndex;
    result.cells = json.cells.map(function (v, i, a) {
      return GameCell.fromJSON(v);
    });
    return result;
  };
  GameColumn.prototype.isFull = function () {
    return this.currentIndex < 0;
  };
  GameColumn.prototype.addPiece = function (player) {
    var pieceAdded = null;
    if (this.currentIndex >= 0) {
      this.cells[this.currentIndex].setContent(player);
      pieceAdded = {column: this.index, cell: this.currentIndex};
      this.currentIndex--;
    }
    return pieceAdded;
  };
  return GameColumn;
}());

var ConnectFour = (function () {
  function ConnectFour(columnCount, cellsPerColumn) {
    this.columnCount = columnCount;
    this.cellsPerColumn = cellsPerColumn;
    this.moveCount = 0;
    this.reset();
  }

  ConnectFour.prototype.copy = function () {
    var result = new ConnectFour(this.columnCount, this.cellsPerColumn);
    result.columns = this.columns.map(function (v, i, a) {
      var colCopy = v.copy();
      return colCopy;
    });
    result.currentPlayer = this.currentPlayer;
    result.winner = this.winner;
    result.gameOver = this.gameOver;
    result.lastMove = {column: this.lastMove.column, cell: this.lastMove.cell};
    result.moveCount = this.moveCount;
    return result;
  };
  ConnectFour.prototype.toJSON = function () {
    return {
      columnCount: this.columnCount,
      cellsPerColumn: this.cellsPerColumn,
      columns: this.columns.map(function (v, i, a) {
        return v.toJSON();
      }),
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      gameOver: this.gameOver,
      lastMove: this.lastMove,
      moveCount: this.moveCount
    };
  };
  ConnectFour.fromJSON = function (json) {
    var result = new ConnectFour(json.columnCount, json.cellsPerColumn);
    result.columns = json.columns.map(function (v, i, a) {
      return GameColumn.fromJSON(v);
    });
    result.currentPlayer = json.currentPlayer;
    result.winner = json.winner;
    result.gameOver = json.gameOver;
    result.lastMove = json.lastMove;
    result.moveCount = json.moveCount;
    return result;
  };
  ConnectFour.prototype.reset = function () {
    var result = [];
    for (var i = 0; i < this.columnCount; i++) {
      var column = new GameColumn(i, this.cellsPerColumn);
      result.push(column);
    }
    this.columns = result;
    this.currentPlayer = 1;
    this.winner = 0;
    this.gameOver = false;
    this.moveCount = 0;
    this.lastMove = {column: -1, cell: -1};
  };
  ConnectFour.prototype.playAtColumn = function (index) {
    if (!this.gameOver && index >= 0 && index < this.columnCount) {
      var pieceAdded = this.columns[index].addPiece(this.currentPlayer);
      if (pieceAdded) {
        this.moveCount++;
        this.lastMove = pieceAdded;
        this.currentPlayer = this.currentPlayer % 2 + 1;
        this.checkWinner();
        this.gameOver = this.gameOver || this.moveCount > this.columnCount * this.cellsPerColumn;
      }
    }
  };
  ConnectFour.prototype.getCellAt = function (c) {
    var column = this.columns[c.column];
    var result = column ? column.cells[c.cell] : null;
    return result ? result : null;
  };
  ConnectFour.prototype.getAvailableMoves = function () {
    var result = this.columns.filter(function (v, i, a) {
      return !v.isFull();
    });
    return result;
  };
  ConnectFour.prototype.getWinnersInSequence = function (sequence, forPLayer) {
    var result = [];
    var currentIndex = sequence.findIndex(function (e) {
      return e.content === forPLayer;
    });
    var iteration = 1;
    while (currentIndex < sequence.length - WINNING_LENGTH + 1) {
      var noMatchIndex = sequence.slice(currentIndex).findIndex(function (e) {
        return e.content !== forPLayer;
      });
      noMatchIndex = (noMatchIndex === -1) ? sequence.length : noMatchIndex;
      if (noMatchIndex >= WINNING_LENGTH) {
        result.push.apply(result, sequence.slice(currentIndex, noMatchIndex));
      }
      currentIndex += noMatchIndex + 1;
    }
    return result;
  };
  ConnectFour.prototype.getRow = function (row, _fromColumn, _toColumn) {
    var fromColumn = Math.max(Math.min(_fromColumn, _toColumn), 0);
    var toColumn = Math.min(Math.max(_fromColumn, _toColumn), this.columnCount - 1);
    var result = [];
    for (var i = fromColumn; i <= toColumn; i++) {
      var cell = this.getCellAt({column: i, cell: row});
      if (cell !== null) {
        result.push(cell);
      }
    }
    return result;
  };
  ConnectFour.prototype.getColumn = function (column, _fromRow, _toRow) {
    var fromRow = Math.max(Math.min(_fromRow, _toRow), 0);
    var toRow = Math.min(Math.max(_fromRow, _toRow), this.cellsPerColumn - 1);
    var result = [];
    for (var i = fromRow; i <= toRow; i++) {
      var cell = this.getCellAt({column: column, cell: i});
      if (cell !== null) {
        result.push(cell);
      }
    }
    return result;
  };
  ConnectFour.prototype.getDiagonal = function (fromCell, toCell) {
    var result = [];
    if (toCell.column !== fromCell.column) {
      var slope = (toCell.cell - fromCell.cell) / (toCell.column - fromCell.column);
      if (slope === 1 || slope === -1) {
        var fromCol = Math.max(Math.min(fromCell.column, toCell.column), 0);
        var toCol = Math.min(Math.max(fromCell.column, toCell.column), this.columnCount - 1);
        var intercept = fromCell.cell - slope * fromCell.column;
        for (var c = fromCol; c <= toCol; c++) {
          var cell = this.getCellAt({column: c, cell: (slope * c + intercept)});
          if (cell !== null) {
            result.push(cell);
          }
        }
      }
    }
    return result;
  };
  ConnectFour.prototype.checkWinner = function () {
    var column = this.lastMove.column;
    var cell = this.lastMove.cell;
    var player = this.getCellAt({column: column, cell: cell}).content;
    var delta = WINNING_LENGTH - 1;
    var row = this.getRow(cell, column - delta, column + delta);
    var col = this.getColumn(column, cell - delta, cell + delta);
    var swToNe = this.getDiagonal({column: (column - delta), cell: (cell + delta)}, {
      column: (column + delta),
      cell: (cell - delta)
    });
    var nWToSe = this.getDiagonal({column: (column - delta), cell: (cell - delta)}, {
      column: (column + delta),
      cell: (cell + delta)
    });
    var winners = this.getWinnersInSequence(row, player).concat(this.getWinnersInSequence(col, player), this.getWinnersInSequence(swToNe, player), this.getWinnersInSequence(nWToSe, player));
    var winnerFound = winners.length > 0;
    if (winnerFound) {
      winners.forEach(function (v, i, a) {
        return v.setWinning();
      });
      this.gameOver = true;
      this.currentPlayer = 0;
      this.winner = player;
    }
  };
  return ConnectFour;
}());

//////////////////////

minimaxMove = function (game, level, player) {
  var result = 0;

  var availableMoves = game.getAvailableMoves();

  if (game.gameOver || level == 0 || availableMoves.length === 0) {
    var score = 0;
    if (game.winner === player) {
      score = 1;
    }
    else if (game.winner) {
      score = -1;
    }
    score = score * (level + 1);

    return {move: null, score: score};
  }

  var bestScore;
  var bestMove;
  var fn = game.currentPlayer === player ? Math.max : Math.min;

  for (var i = 0; i < availableMoves.length; i++) {
    var gameCopy = game.copy();
    var move = gameCopy.columns[availableMoves[i].index];
    var pieceAdded = gameCopy.playAtColumn(move.index);
    var score = minimaxMove(gameCopy, level - 1, player).score;
    if (bestScore === undefined || bestScore !== fn(bestScore, score) || (bestScore === score && Math.random() >= .8)) {
      bestScore = score;
      bestMove = move;
    }
  }

  return {move: bestMove, score: bestScore};
};

onmessage = function (e) {
  var maxLevel = 4;
  var game = ConnectFour.fromJSON(e.data);
  var move = minimaxMove(game, maxLevel, game.currentPlayer);
  postMessage(move.move.index);
};
`]);
