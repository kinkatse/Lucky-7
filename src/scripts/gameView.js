import Game from "./game"
import Player from "./player"
import AudioUtil from "./audioUtil"
import { io } from "socket.io-client"

class GameView {
    constructor (ctx, video) {
        // this.video = video
        this.ctx = ctx
        this.socket = io.connect(window.location.origin);
        // this.playerRed = new Player("red", this.socket, ctx)
        // this.playerBlue = new Player("blue", this.socket, ctx)
        this.mode = "easy"
        this.elements = {
            'gameOver': document.querySelector('.gameover'),
            'winner': document.querySelector('.winner'),
            'slap': document.querySelector('.slap'),
            // 'redSlap': document.querySelector('.red-button'),
            // 'blueSlap': document.querySelector('.blue-button'),
            'stopDealer': document.getElementById('stop-dealer'),
            'playButtons': document.querySelector('.play-buttons'),
            'playAgain': document.querySelector('.play-again'),
            'logo': document.querySelector('.logo'),
            'joinRoom': document.querySelector('.join-room')
        }

        this.connectPlayers()
        // this.playersJoined()
        // this.addJoinRoomEventListener()
        // this.testSocket()
    }

    connectPlayers() {
        // First player connected, then second player connected
        this.socket.on("connect-player", color => {
            // debugger
            console.log("Connecting player")
            if (color === "red") {
                this.player = new Player("red")
                this.playersJoined()
            } else {
                this.player = new Player("blue")
                this.playersJoined()
            }
        })

        // After game starts, the 2nd player receives this so it can create player instance
        this.socket.on("connect-game", data => {
            const { color, mode } = data
            console.log("Connecting other player")
            console.log(`Other player is ${color}`)
            if (color === "red") {
                this.player = new Player("red")
            } else {
                this.player = new Player("blue")
            }
            this.mode = mode
            this.game = new Game(this.player, this.elements, this.socket)
            this.game.connectGame(this.mode)
            AudioUtil.playStartGame()
            this.startGameSetting()
        })

        this.socket.on("draw-new", cardData => {
            console.log("Received a new card")
            // this.game.deck_id = cardData.deck_id
            this.game.drawnCard = cardData.card
            this.game.remaining = cardData.remaining
        })
    }

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
        this.elements['playButtons'].addEventListener("click", (e) => {
            this.mode = e.target.getAttribute("mode")
            this.game = new Game(this.player, this.elements, this.socket)
            // this.game = new Game(this.ctx, this.playerRed, this.playerBlue, this.socket, this.elements)
            
            const startGameData = {
                color: this.player.color,
                mode: this.mode
            }

            console.log(`This player is ${this.player.color}`)
            this.socket.emit("start-game", startGameData)
            AudioUtil.playStartGame()
            this.game.startGame(this.mode)
            this.startGameSetting()
        })
    }

    startGameSetting() {
        this.elements['logo'].style.display = "none"
        this.elements['gameOver'].style.display = "none"
        this.elements['winner'].style.display = "none"
        this.elements['slap'].style.display = "block"
        this.elements['stopDealer'].style.display = "block"
        this.elements['playButtons'].style.display = "none"
        this.elements['playAgain'].style.display = "none"
    }

}

export default GameView