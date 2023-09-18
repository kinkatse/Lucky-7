import AudioUtil from "./audioUtil"

class Game {
    constructor(ctx, playerRed, playerBlue, socket, elements) {
        this.ctx = ctx
        this.difficultySpeed = 1000 // 1500 slow speed // 1000 medium speed // 500 fast speed
        this.playerRed = playerRed
        this.playerBlue = playerBlue
        this.socket = socket
        this.elements = elements

        this.redSlapEl = this.elements['redSlap']
        this.blueSlapEl = this.elements['blueSlap']
        this.prevFourEl = document.getElementById("prev-four")
        this.prevThreeEl = document.getElementById("prev-three")
        this.prevTwoEl = document.getElementById("prev-two")
        this.prevOneEl = document.getElementById("prev-one")
        this.topEl = document.getElementById("top")
    }

    resetToDefault(mode) {
        this.deck_id = null
        this.drawnCard = null
        this.discard = []
        this.topDeck = []
        this.playerRed.resetPlayer()
        this.playerBlue.resetPlayer()
        
        this.prevFourEl.dataset.card = null
        this.prevThreeEl.dataset.card = null
        this.prevTwoEl.dataset.card = null
        this.prevOneEl.dataset.card = null
        this.topEl.dataset.card = null

        this.prevFourEl.children[0].src = "https://deckofcardsapi.com/static/img/back.png"
        this.prevThreeEl.children[0].src = "https://deckofcardsapi.com/static/img/back.png"
        this.prevTwoEl.children[0].src = "https://deckofcardsapi.com/static/img/back.png"
        this.prevOneEl.children[0].src = "https://deckofcardsapi.com/static/img/back.png"
        this.topEl.children[0].src = "https://deckofcardsapi.com/static/img/back.png"

        switch(mode) {
            case "easy":
                this.difficultySpeed = 1500;
                break;
            case "reg":
                this.difficultySpeed = 1000;
                break;
            case "pro":
                this.difficultySpeed = 500;
                break;
            default:
                this.difficultySpeed = 1500;
                break;
        }
    }

    async startGame(mode) {
        this.resetToDefault(mode)
        
        await this.shuffleDecks()
        
        this.redSlapEl.style.display = "block"
        this.blueSlapEl.style.display = "block"

        // Save reference to eventHander for removing it later
        this.redButtonHandler = this.playerRed.runEventListeners(this)
        this.blueButtonHandler = this.playerBlue.runEventListeners(this)

        // this.socket.emit("game", this)
        this.dealerLoop()
    }

    async shuffleDecks() {
        const res = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=2",
            {
                "Content-Type": "application/json"
            }
        )
        const deck = await res.json()
        this.deck_id = deck.deck_id
    }

    dealerLoop() {
        // this.update()
        this.interval = setInterval(async () => {
            // Updating the score
            this.playerRed.setScore()
            this.playerBlue.setScore()
            
            await this.drawCard()
            // Updating our array of cards to keep track of for point value
            this.topDeck.unshift(this.drawnCard)
            if (this.topDeck.length > 3) this.topDeck.pop()
            this.placeCard()
            this.checkGameOver()
            // this.update()
        }, this.difficultySpeed)

        this.elements['stopDealer'].addEventListener("click", (e) => {
            AudioUtil.playClickButton()
            this.remaining = 0
            this.checkGameOver()
        })
    }

    update() {
        // this.playerRed.setGame(this)
        // if (this.playerBlue.game) {
        //     this would be where we update the other user's interface
        // }
        // this.playerBlue.setGame(this)
    }

    checkGameOver() {
        if (this.playerRed.score > 76 || this.playerBlue.score > 76 || this.remaining === 0) {
            this.gameOver()
        }
    }

    gameOver() {
        AudioUtil.playGameover()

        clearInterval(this.interval)

        const stopDealer = this.elements['stopDealer']
        this.redSlapEl.removeEventListener("click", this.redButtonHandler)
        this.blueSlapEl.removeEventListener("click", this.blueButtonHandler)
        this.redSlapEl.style.display = "none"
        this.blueSlapEl.style.display = "none"
        stopDealer.style.display = "none"

        const winner = this.elements['winner']
        
        if (this.playerRed.score > this.playerBlue.score) {
            winner.innerText = "Red Player Wins!"
            winner.style.color = "#FF2727";
        } else if (this.playerRed.score < this.playerBlue.score) {
            winner.innerText = "Blue Player Wins!"
            winner.style.color = "#4A77FF";
        } else {
            winner.innerText = "It's a Tie!"
            winner.style.color = "black";
        }

        winner.style.display = "block";
        this.elements['gameOver'].style.display = "block";
        this.elements['playAgain'].style.display = "block";
        this.elements['playButtons'].style.display = "flex";
    }

    async drawCard() {
        const res = await fetch(`https://deckofcardsapi.com/api/deck/${this.deck_id}/draw/?count=1`,
            {
                "Content-Type": "application/json"
            }
        )
        const cardResponse = await res.json()
        AudioUtil.playDealCard()
        this.drawnCard = cardResponse.cards[0]
        this.remaining = cardResponse.remaining
    }

    placeCard() {
        if (this.prevThreeEl.dataset.card) {
            this.prevFourEl.dataset.card = this.prevThreeEl.dataset.card
            this.prevFourEl.children[0].src = this.prevThreeEl.children[0].src
        }
        if (this.prevTwoEl.dataset.card) {
            // All cards at this point are irrelevant so we can add to discard pile
            this.discard.push(this.prevTwoEl.dataset.card)
            this.prevThreeEl.dataset.card = this.prevTwoEl.dataset.card
            this.prevThreeEl.children[0].src = this.prevTwoEl.children[0].src
        }
        if (this.prevOneEl.dataset.card) {
            this.prevTwoEl.dataset.card = this.prevOneEl.dataset.card
            this.prevTwoEl.children[0].src = this.prevOneEl.children[0].src
        }
        if (this.topEl.dataset.card) {
            this.prevOneEl.dataset.card = this.topEl.dataset.card
            this.prevOneEl.children[0].src = this.topEl.children[0].src
        }

        this.topEl.dataset.card = `${this.drawnCard.value} ${this.drawnCard.suit}`
        this.topEl.children[0].src = this.drawnCard.image
    }

    slapValue() {
        let value = 0

        value += this.slap7()
        value += this.slapMath()
        value += this.slapDuplicate()
        value += this.slapDouble() // Dont forget to include in ReadMe
        value += this.slapRoyalThree() // Dont forget to include in ReadMe
        value += this.slapSandwich()
        value += this.slapLucky7()
        // value += this.slapJackpot()

        if (value > 0) {
            AudioUtil.playPoints()
            return value
        }
        AudioUtil.playPlayerMisclicks()
        return -10
    }

    slap7() {
        let first = this.topDeck[0]
        if (first && first.value === "7") return 7
        return 0
    }

    slapMath() {
        let first = this.topDeck[0]
        let second = this.topDeck[1]
        // To avoid calling .value on undefined
        if (!first || !second) return 0
        first = parseInt(first.value)
        second = parseInt(second.value)
        // To avoid getting NaN for parseInt on a value that is not numbers
        if (!first || !second) return 0
        if ((first + second === 7) || (Math.abs(first - second) === 7)) return 5
        return 0
    }

    slapDuplicate() {
        let first = this.topDeck[0]
        let second = this.topDeck[1]
        if (first && second &&
            first.value === second.value && first.suit === second.suit) return 5
        return 0
    }

    slapDouble() {
        let first = this.topDeck[0]
        let second = this.topDeck[1]
        if (first && second &&
            first.value === second.value) return 3
        return 0
    }

    slapRoyalThree() {
        let first = this.topDeck[0]
        let second = this.topDeck[1]
        let third = this.topDeck[2]
        const royalArr = ["10", "JACK", "QUEEN", "KING", "ACE"]
        if (first && second && third &&
            royalArr.includes(first.value) &&
            royalArr.includes(second.value) &&
            royalArr.includes(third.value)) return 5
        return 0
    }

    slapSandwich() {
        let first = this.topDeck[0]
        let third = this.topDeck[2]
        if (first && third &&
            first.value === third.value) return 4
        return 0
    }

    slapLucky7() {
        let first = this.topDeck[0]
        let second = this.topDeck[1]
        let third = this.topDeck[2]
        if (first && second && third &&
            parseInt(first.value) === 7 &&
            parseInt(second.value) === 7 &&
            parseInt(third.value) === 7) return 77
        return 0
    }
}

export default Game