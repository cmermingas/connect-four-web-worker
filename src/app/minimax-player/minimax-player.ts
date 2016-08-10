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
