import {Component, OnInit, OnDestroy} from '@angular/core';
import {Http} from '@angular/http';
import {ConnectFourComponent} from "./connect-four/connect-four.component";
import {ConnectFour} from "./model/connect-four";
import {MinimaxPlayer} from "./minimax-player/minimax-player";
// import {Observable, Subscription} from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [ConnectFourComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  public game: ConnectFour;
  playerName: string[] = [null, 'Player 1', 'Robot'];
  // playerRobots: MinimaxPlayer[] = [];
  minimaxWorker: any;
  playerIsRobot = [null, false, true];

  constructor() {}

  ngOnInit() {
    this.resetGame();
    // this.switchPlayer(2);
    this.minimaxWorker = new Worker('/app/minimax-player/minimax-web-worker.js');
    this.minimaxWorker.addEventListener('message', e => {
      // console.log('The worker said: ', e.data);
      this.playAtColumn(this.game.columns[e.data]);
    }, false);

    // this.robotMoveListener = this.nextTurn.subscribe((player) => {
    //   if (this.playerRobots[player]) {
    //     let move = this.playerRobots[this.game.currentPlayer].nextMove();
    //     this.playAtColumn(move);
    //   }
    // });
  }

  ngOnDestroy() {
    this.minimaxWorker.terminate();

    // this.playerRobots.forEach((v, i, a) => {
    //   if (v) {
    //     v.destroy();
    //   }
    // });
  }

  // resetRobot(p: number) {
  //   this.playerRobots[p] = new MinimaxPlayer(p, this.game);
  // }

  switchPlayer(p: number) {
    if (p === 1 || p === 2) {
      this.playerIsRobot[p] = !this.playerIsRobot[p];
      this.playerName[p] = this.playerIsRobot[p] ? 'Robot' : 'Player ' + p;

      if (this.game.currentPlayer === p) {
        this.turnAdvanced();
      }
    }
    // if (p === 1 || p === 2) {
    //   if (!this.playerRobots[p]) {
    //     this.resetRobot(p);
    //     this.playerName[p] = 'Robot';
    //     if (this.game.currentPlayer === p) {
    //       this.turnAdvanced();
    //     }
    //   }
    //   else {
    //     this.playerRobots[p].destroy();
    //     this.playerRobots[p] = null;
    //     this.playerName[p] = 'Player 2';
    //   }
    // }
  }

  resetGame() {
    this.game = new ConnectFour(15, 6);
    this.turnAdvanced();
    // this.playerRobots.forEach((v, i, a) => v && this.resetRobot(i));
  }

  turnAdvanced() {
    // if (this.playerRobots[this.game.currentPlayer]) {
    if (this.playerIsRobot[this.game.currentPlayer]) {
      this.minimaxWorker.postMessage(this.game.toJSON());

      // this.zone.runOutsideAngular(() => {
      //   let move = this.playerRobots[this.game.currentPlayer].nextMove();
      //   this.zone.run(() => {
      //     this.playAtColumn(move);
      //     })
      // });
    }
  }

  playAtColumn(col) {
    this.game.playAtColumn(col.index);
    this.turnAdvanced();
  }

  columnClicked(col) {
    // if (!this.game.gameOver && !this.playerRobots[this.game.currentPlayer]) {
    if (!this.game.gameOver && !this.playerIsRobot[this.game.currentPlayer]) {
      this.playAtColumn(col);
    }
  }
}
