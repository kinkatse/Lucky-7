import Game from "./game"
import Player from "./player"
import AudioUtil from "./audioUtil"
import { io } from "socket.io-client"

class GameView {
    constructor (ctx, video) {
        // this.video = video
        this.ctx = ctx
        this.socket = io.connect(window.location.origin);
        this.playerRed = new Player("red", this.socket, ctx)
        this.playerBlue = new Player("blue", this.socket, ctx)
        this.mode = "easy"
        this.elements = {
            'gameOver': document.querySelector('.gameover'),
            'winner': document.querySelector('.winner'),
            'redSlap': document.querySelector('.red-button'),
            'blueSlap': document.querySelector('.blue-button'),
            'stopDealer': document.getElementById('stop-dealer'),
            'playButtons': document.querySelector('.play-buttons'),
            'playAgain': document.querySelector('.play-again'),
            'logo': document.querySelector('.logo'),
            'joinRoom': document.querySelector('.join-room')
        }

        this.playersJoined()
        // this.addJoinRoomEventListener()
        // this.testSocket()
    }

    // testSocket() {
    //     const title = document.getElementsByClassName("title")[0]
    //     title.addEventListener("click", (e) => {
    //         this.socket.emit("chat", "Hello")
    //     })
    // }

    // addJoinRoomEventListener() {
    //     this.elements['playButtons'].style.display = "none"
    //     let player = null
    //     this.elements['joinRoom'].addEventListener("click", (e) => {
    //         player = new Player(this.socket, this.ctx)
    //         // player.joinRoom(this)
    //         // if (player.color === 'red') {
    //         //     this.playerRed = player
    //         //     // this.playersJoined()
    //         // } else {
    //         //     this.playerBlue = player
    //         // }
    //         // debugger

    //         // if (this.playerRed && this.playerBlue) this.playersJoined()
    //     })
    // }

    playersJoined() {
        // debugger
        // this.elements['playButtons'].style.display = "block"
        this.elements['playButtons'].addEventListener("click", (e) => {
            this.mode = e.target.getAttribute("mode")
            this.game = new Game(this.ctx, this.playerRed, this.playerBlue, this.socket, this.elements)
            AudioUtil.playStartGame()
            this.game.startGame(this.mode)
            this.elements['logo'].style.display = "none";
            this.elements['gameOver'].style.display = "none";
            this.elements['winner'].style.display = "none";
            this.elements['redSlap'].style.display = "block"
            this.elements['blueSlap'].style.display = "block"
            this.elements['stopDealer'].style.display = "block"
            this.elements['playButtons'].style.display = "none"
            this.elements['playAgain'].style.display = "none"
        })
    }

}

export default GameView