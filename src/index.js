import GameView from "./scripts/gameView"
// import { io } from "socket.io-client"

document.addEventListener("DOMContentLoaded", () => {
    // const canvasEl = document.getElementById("canvas");
    // canvasEl.height = 450;
    // canvasEl.width = 700;
    // const ctx = canvasEl.getContext("2d");
    // ctx.fillStyle = "grey";
    // ctx.fillRect(0, 0, 700, 450);
    const ctx = null

    const video = document.getElementById("video");
    // const socket = io.connect(window.location.origin);
    // socket.emit("game", {game: "hi"})
    // receiveGameView()
    const gameView = new GameView(ctx, video);
})

// const receiveGameView = () => {
//     this.socket.on("game", game => this.game = game)
// }

// setGame() {
//     this.socket.on("game", game => this.game = game)
// }

// setScore() {
//     this.socket.on("slap", data => {
//         if (data.color === this.color) {
//             this.score = data.scoreValue
//             this.scoreTextEl.innerText = `${this.scoreNewText} SCORE: ${data.scoreValue}`
//         }
//     })
// }