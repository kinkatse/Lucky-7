import Game from "./game"
import Player from "./player"
import AudioUtil from "./audioUtil"
import { io } from "socket.io-client"

class GameView {
    constructor () {
        this.socket = io.connect(window.location.origin);
        this.mode = "easy"
        this.elements = {
            'gameOver': document.querySelector('.gameover'),
            'winner': document.querySelector('.winner'),
            'slap': document.querySelector('.slap'),
            'stopDealer': document.getElementById('stop-dealer'),
            'playButtons': document.querySelector('.play-buttons'),
            'waiting': document.querySelector('.waiting'),
            'playAgain': document.querySelector('.play-again'),
            'logo': document.querySelector('.logo'),
            'joinRoom': document.querySelector('.join-room')
        }

        this.connectPlayers()
        // this.addJoinRoomEventListener()
    }

    connectPlayers() {
        // Only for the first player
        // First player connected, then second player connected
        this.socket.on("connect-player", color => {
            console.log("Connecting player")
            console.log(`This player is ${color}`)
            this.elements['playButtons'].style.display = "flex"
            this.elements['waiting'].style.display = "none"
            if (color === "red") {
                this.player = new Player("red")
            } else {
                this.player = new Player("blue")
            }
            this.playersJoined()
        })

        // Only for the second player
        // After game starts, the 2nd player receives this so it can create player instance
        this.socket.on("connect-game", data => {
            const { color, mode } = data
            console.log("Connecting other player")
            console.log(`Other player is ${color}`)
            this.elements['waiting'].style.display = "none"

            if (color === "red") {
                this.player = new Player("red")
            } else {
                this.player = new Player("blue")
            }
            this.mode = mode
            this.game = new Game(this.player, this.elements, this.socket)
            this.game.client = "entrant"
            this.startGameSetting()
        })

        this.socket.on("draw-new", cardData => {
            console.log("Received a new card")
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

    // Only after both players are 'connected', first player runs this function
    playersJoined() {
        this.elements['playButtons'].addEventListener("click", (e) => {
            this.mode = e.target.getAttribute("mode")
            this.game = new Game(this.player, this.elements, this.socket)
            // this.game = new Game(this.ctx, this.playerRed, this.playerBlue, this.socket, this.elements)
            
            const startGameData = {
                color: this.player.color,
                mode: this.mode
            }

            this.socket.emit("start-game", startGameData)
            this.game.client = "host"
            this.startGameSetting()
        })
    }

    startGameSetting() {
        this.game.startGame(this.mode)
        AudioUtil.playStartGame()
        
        this.elements['logo'].style.display = "none"
        this.elements['gameOver'].style.display = "none"
        this.elements['winner'].style.display = "none"
        this.elements['slap'].style.display = "block"
        this.elements['playButtons'].style.display = "none"
        this.elements['playAgain'].style.display = "none"

        if (this.game.client === "host") this.elements['stopDealer'].style.display = "block"
    }

}

export default GameView