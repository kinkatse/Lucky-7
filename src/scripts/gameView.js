import Game from "./game"
import Player from "./player"
import AudioUtil from "./audioUtil"
import { io } from "socket.io-client"

class GameView {
    constructor (ctx, video, socket) {
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
        this.gameLoop()
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
        this.elements['playButtons'].addEventListener("click", (e) => {
            debugger
            this.mode = e.target.getAttribute("mode")
            this.game = new Game(this.ctx, this.playerRed, this.playerBlue, this.socket, this.elements, this)
            AudioUtil.playStartGame()
            this.game.startGame(this.mode)
            debugger
            clearInterval(this.checkStartedInterval)
            this.setGame()
            // this.game.dealerLoop(this.updateGame.bind(this))
            // await this.game.deal()
            this.gameStartingSetting()
            this.setGameLoopInterval()
        })
    }

    gameLoop() {
        this.checkStartedInterval = setInterval(async () => {
            // debugger
            this.updateGame()
            // since the other player should have cleared interval if they started, this
            // should only trigger if the other player receives that the other player started
            if (this.started) {
                debugger
                AudioUtil.playStartGame()
                this.elements['redSlap'].style.display = "block"
                this.elements['blueSlap'].style.display = "block"
                this.redButtonHandler = this.playerRed.runEventListeners(this.game)
                this.blueButtonHandler = this.playerBlue.runEventListeners(this.game)
                this.gameStartingSetting()

                this.setGameLoopInterval()
                clearInterval(this.checkStartedInterval)
            }
        }, 1000)
    }

    setGameLoopInterval() {
        const interval = () => setInterval(async () => {
            this.updateGame()
            // this.mode = this.mode
            // this.game = this.game
            this.setGame()
            await this.game.deal()
        }, this.game.difficultySpeed)
        this.interval = interval()
        this.game.interval = this.interval
    }

    gameStartingSetting() {
        this.elements['logo'].style.display = "none";
        this.elements['gameOver'].style.display = "none";
        this.elements['winner'].style.display = "none";
        this.elements['redSlap'].style.display = "block";
        this.elements['blueSlap'].style.display = "block";
        this.elements['stopDealer'].style.display = "block";
        this.elements['playButtons'].style.display = "none";
        this.elements['playAgain'].style.display = "none";
    }

    setGame() {
        console.log(this.game)
        const gameData = {
            started: this.game.started,
            playerRed: this.playerRed,
            playerBlue: this.playerBlue,
            mode: this.mode,
            game: this.game,
            deck_id: this.game.deck_id
        }
        this.socket.emit("game", gameData)
    }

    updateGame() {
        this.socket.on("game", game => {
            // this.ctx = game.ctx
            this.started = game.started
            this.playerRed = game.playerRed
            this.playerBlue = game.playerBlue
            this.mode = game.mode
            this.game = game,
            this.game.deck_id = game.deck_id
        })
    }

}

export default GameView