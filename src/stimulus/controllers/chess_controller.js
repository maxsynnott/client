import { Controller } from "stimulus"

import Chess from "chess.js";
import axios from 'axios';

export default class extends Controller {
	static targets = ["board"]

  connect() {
    this.boardSize = 800;
    this.boardTarget.style.height = this.boardSize + 'px';
    this.boardTarget.style.width = this.boardSize + 'px';

    // Tile initiation
    for (let y = 0; y < 8; y ++) {
      for (let x = 0; x < 8; x ++) {
        const color = ((x + y) % 2 == 0) ? 'white' : 'black'
        const html = `<div class='tile ${color}-tile'></div>`;

        this.boardTarget.insertAdjacentHTML("beforeend", html);
      }
    }
    //

    this.chess_base_url = "http://localhost:3000/api/v1/"

    this.chess = new Chess("empty")
  }

  updatePieces() {
  	const tiles = this.chess.board()

    this.clearBoard()

    this.board = []

  	for (let y = 0; y < 8; y ++) {
      this.board.push([])

  		for (let x = 0; x < 8; x ++) {
  			if (tiles[y][x]) {
  				const piece = document.createElement('div');

  				piece.classList.add('piece');
  				piece.style.backgroundPosition = this.pieceBackgroundPosition(tiles[y][x]);
  				piece.style.top = `${this.boardSize / 8 * y}px`;
  				piece.style.left = `${this.boardSize / 8 * x}px`;
  				piece.style.transform = `scale(${this.boardSize / 8 / 45})`
  				
  				this.boardTarget.insertAdjacentElement('beforeend', piece)

          this.board[y].push(piece)
  			} else {
          this.board[y].push(null)
        }
  		}
  	}
  }

  pieceBackgroundPosition(tile) {
  	const { type, color } = tile;

  	const y = color == 'w' ? 0 : 45;
  	const x = ['q', 'k', 'b', 'n', 'r', 'p'].indexOf(type) * -45;

  	return `${x}px ${y}px`;
  }

  createMatch() {
    axios
      .post(this.chess_base_url + 'matches')
      .then((response) => {
        const match = response.data
        
        this.chess.load(match.fen)
        this.match_id = match.id

        this.updatePieces()
      })
  }

  runMatch() {
    axios
      .post(this.chess_base_url + 'matches/run', {
        id: this.match_id
      })
      .then((response) => {
        const match = response.data;

        const temp_chess = new Chess()

        match.history.forEach(move => temp_chess.move(move))
        
        this.history = temp_chess.history({ verbose: true });
        this.move_index = 0;

        for (let i = 0; i < this.history.length; i ++) {
          setTimeout(() => {
            const move = this.history[i]
            this.nextMove(move)
          }, 500 * i)
        }

        console.log('ready')
      })
  }

  nextMove() {
    const move = this.history[this.move_index]

    console.log(move)

    this.movePiece(move)

    this.move_index += 1
  }

  clearBoard() {
    document.querySelectorAll('.piece').forEach((element) => {
      element.remove()
    })
  }

  algToPiece(alg) {
    const { y, x } = this.algToIndex(alg)
    
    return this.board[y][x]
  }

  algToIndex(alg) {
    return {
      y: this.board.length - alg[1],
      x: alg.charCodeAt(0) - 97
    }
  }

  pieceToIndex(piece) {
    const row = this.board.find(row => row.includes(piece))
    const y = this.board.indexOf(row)
    const x = this.board[y].indexOf(piece)

    return {
      y: y,
      x: x
    }
  }

  algToPosition(alg) {
    return {
      left: (alg.charCodeAt(0) - 97) * this.boardSize / 8,
      top: this.boardSize - this.boardSize / 8 * alg[1]
    }
  }

  movePiece(move) {
    this.chess.move(move.san);

    const fromIndex = this.algToIndex(move.from);
    const piece = this.board[fromIndex.y][fromIndex.x];

    this.board[fromIndex.y][fromIndex.x] = null;

    const toIndex = this.algToIndex(move.to);

    if (move.captured) {
      const capturedPiece = this.board[toIndex.y][toIndex.x]

      this.removePiece(capturedPiece)
    }

    this.board[toIndex.y][toIndex.x] = piece

    const newPos = this.algToPosition(move.to);

    piece.style.top = `${newPos.top}px`;
    piece.style.left = `${newPos.left}px`;
  }

  removePiece(piece) {
    piece.style.opacity = 0;

    setTimeout(() => {
      piece.remove()
    }, 500)
  }
}
