import { Controller } from "stimulus"

import Chess from "chess.js";
import 'axios';

export default class extends Controller {
	static targets = ["board"]

  connect() {
  	this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  	this.initTiles()
  	this.displayPieces()

    this.chess_base_url = "http://localhost:3000/api/v1/"
  }

  initTiles() {
  	for (let y = 0; y < 8; y ++) {
  		for (let x = 0; x < 8; x ++) {
  			const color = ((x + y) % 2 == 0) ? 'white' : 'black'
  			const html = `<div class='tile ${color}-tile'></div>`;

  			this.boardTarget.insertAdjacentHTML("beforeend", html);
  		}
  	}
  }

  displayPieces() {
  	const chess = new Chess(this.fen)
  	const tiles = chess.board()

  	for (let y = 0; y < 8; y ++) {
  		for (let x = 0; x < 8; x ++) {
  			if (tiles[y][x]) {
  				const piece = document.createElement('div');

  				piece.classList.add('piece');
  				piece.style.backgroundPosition = this.pieceBackgroundPosition(tiles[y][x]);
  				piece.style.top = `${this.boardTarget.offsetHeight / 8 * y}px`;
  				piece.style.left = `${this.boardTarget.offsetWidth / 8 * x}px`;
  				piece.style.transform = `scale(${this.boardTarget.offsetWidth / 8 / 45})`
  				

  				// const tile = document.querySelectorAll('.tile')[y * 8 + x];

  				// tile.insertAdjacentHTML('beforeend', `<div class='piece' style='background-position: ${position}'></div>`)
  				console.log(piece)
  				this.boardTarget.insertAdjacentElement('beforeend', piece)
  				console.log(top)
  				
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
    axios.post(this.chess_base_url + 'matches')
  }
}
