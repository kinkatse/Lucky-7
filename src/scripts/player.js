class Player {
    constructor(color, socket, ctx) {
        this.color = color
        // this.socket = socket
        // this.ctx = ctx
        this.score = 0
        this.scoreNewText = this.color === "red" ? "RED" : "BLUE"
        this.scoreTextEl = document.getElementById(`${this.color}-score`)
    }

    resetPlayer() {
        this.score = 0
        this.scoreTextEl.innerText = `${this.scoreNewText} SCORE: 0`
    }

    setGame(game, socket) {
        if (!this.game) this.game = game
        socket.on("game", game => this.game = game)
    }

    setScore(socket, game) {
        // socket.on("slap", data => {
        //     if (data.color === this.color) {
        //         this.score = data.scoreValue
        //         this.scoreTextEl.innerText = `${this.scoreNewText} SCORE: ${data.scoreValue}`
        //     }
        // })

        socket.on("slap", data => {
            if (data.color === this.color) {
                this.score = data.scoreValue
                this.scoreTextEl.innerText = `${this.scoreNewText} SCORE: ${data.scoreValue}`
                if (this.color === "red") {
                    game.score["red"] = this.score
                } else {
                    game.score["blue"] = this.score
                }
            }
        })
    }

    // joinRoom(gameView) {
    //     debugger
    //     this.socket.emit('join-room', { 'player': this, 'gameView': gameView })

    //     // debugger
    //     // this.socket.on('connect-player', player => {
    //     //     if (gameView.playerRed && gameView.playerBlue) gameView.playersJoined()
    //     // })
    // }

    // BUG TO FIX LATER: Can click rapidly on combos of cards that hold
    // value to cheat and gain more points than youre supposed to
    runEventListeners(game, socket) {
        const slap = document.querySelector(`.slap`)
        slap.classList.add(`${this.color}-button`)
        const buttonHandler = (e) => {
            let scoreValue = null
            let scoreNewText = null
            if (this.color === "red") {
                scoreValue = parseInt(this.scoreTextEl.innerText.slice(11))
                scoreNewText = "RED"
            } else {
                scoreValue = parseInt(this.scoreTextEl.innerText.slice(12))
                scoreNewText = "BLUE"
            }
            let newValue = scoreValue + game.slapValue()
            this.score = newValue
            if (this.color === "red") {
                game.score["red"] = this.score
            } else {
                game.score["blue"] = this.score
            }
            this.scoreTextEl.innerText = `${scoreNewText} SCORE: ${newValue}`

            const data = {
                color: this.color,
                topDeck: game.topDeck,
                scoreValue: this.score
            }
            socket.emit("slap", data)

            game.checkGameOver()
        }

        slap.addEventListener("click", buttonHandler)
        // Important for the removeEventListener
        return buttonHandler
    }
}

export default Player