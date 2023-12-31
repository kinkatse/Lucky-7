class Player {
    constructor(color) {
        this.color = color
        this.oppColor = this.color === "red" ? "blue" : "red"
        this.score = 0
        this.scoreNewText = this.color === "red" ? "Red" : "Blue"
        this.scoreTextEl = document.getElementById(`${this.color}-score`)
        this.scoreOtherText = this.color === "red" ? "Blue" : "Red"
        this.scoreOtherTextEl = document.getElementById(`${this.oppColor}-score`)
    }

    resetPlayer() {
        this.score = 0
        this.scoreTextEl.innerText = `${this.scoreNewText} Score: 0`
        this.scoreOtherTextEl.innerText = `${this.scoreOtherText} Score: 0`
    }

    listenScore(socket, game) {
        socket.on("slap", data => {
            if (data.color === "red") {
                game.score["red"] = data.scoreValue
            } else {
                game.score["blue"] = data.scoreValue
            }

            this.scoreTextEl.innerText = `${this.scoreNewText} Score: ${game.score[this.color]}`
            this.scoreOtherTextEl.innerText = `${this.scoreOtherText} Score: ${game.score[this.oppColor]}`
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
                scoreNewText = "Red"
            } else {
                scoreValue = parseInt(this.scoreTextEl.innerText.slice(12))
                scoreNewText = "Blue"
            }
            let newValue = scoreValue + game.slapValue()
            this.score = newValue

            if (this.color === "red") { game.score["red"] = this.score }
            else { game.score["blue"] = this.score }

            this.scoreTextEl.innerText = `${scoreNewText} Score: ${newValue}`

            const data = {
                color: this.color,
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