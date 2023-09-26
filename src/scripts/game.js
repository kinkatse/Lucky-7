import AudioUtil from "./audioUtil"

class Game {
    constructor(player, elements, socket) {
        // this.ctx = ctx
        this.difficultySpeed = 1000 // 1500 slow speed // 1000 medium speed // 500 fast speed
        // this.playerRed = playerRed
        // this.playerBlue = playerBlue
        this.player = player
        this.score = { red: 0, blue: 0 }
        this.socket = socket
        this.elements = elements
        this.discard = []
        this.topDeck = []
        this.beforeDeck = []

        // this.redSlapEl = this.elements['redSlap']
        // this.blueSlapEl = this.elements['blueSlap']
        this.slapEl = this.elements['slap']
        this.prevFiveEl = document.getElementById("prev-fifth")
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
        this.player.resetPlayer()
        // this.playerRed.resetPlayer()
        // this.playerBlue.resetPlayer()
        
        this.prevFiveEl.dataset.card = null
        this.prevFourEl.dataset.card = null
        this.prevThreeEl.dataset.card = null
        this.prevTwoEl.dataset.card = null
        this.prevOneEl.dataset.card = null
        this.topEl.dataset.card = null

        this.prevFiveEl.children[0].src = "https://deckofcardsapi.com/static/img/back.png"
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
                this.difficultySpeed = 1100;
                break;
            case "pro":
                this.difficultySpeed = 700;
                break;
            default:
                this.difficultySpeed = 1500;
                break;
        }
    }

    async startGame(mode) {
        this.resetToDefault(mode)
        
        await this.shuffleDecks()
        
        this.slapEl.style.display = "block"

        // Save reference to eventHander for removing it later
        this.buttonHandler = this.player.runEventListeners(this, this.socket)

        this.player.setScore(this.socket, this)
        this.drawTempCard()
        this.dealerLoop()
    }

    async connectGame(mode) {
        this.resetToDefault(mode)
        
        this.slapEl.style.display = "block"
        this.buttonHandler = this.player.runEventListeners(this, this.socket)

        this.player.setScore(this.socket, this)
        this.updateCardLoop()
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
        this.interval = setInterval(async () => {
            await this.drawCard()
            // Updating our array of cards to keep track of for point value
            this.topDeck.unshift(this.drawnCard)
            if (this.topDeck.length > 3) this.topDeck.pop()
            this.placeCard()
            this.checkGameOver()
        }, this.difficultySpeed)

        this.elements['stopDealer'].addEventListener("click", (e) => {
            AudioUtil.playClickButton()
            this.remaining = 0
            this.checkGameOver()
        })
    }

    updateCardLoop() {
        this.interval = setInterval(async () => {
            if (!this.drawnCard) return
            AudioUtil.playDealCard()
            // Updating our array of cards to keep track of for point value
            this.topDeck.unshift(this.drawnCard)
            if (this.topDeck.length > 3) this.topDeck.pop()
            this.placeCard()
            this.checkGameOver()
        }, this.difficultySpeed)

        this.elements['stopDealer'].addEventListener("click", (e) => {
            AudioUtil.playClickButton()
            this.remaining = 0
            this.checkGameOver()
        })
    }

    checkGameOver() {
        if (this.score["red"] > 10 || this.score["blue"] > 10 || this.remaining === 0) {
            this.gameOver()
        }
    }

    gameOver() {
        AudioUtil.playGameover()

        clearInterval(this.interval)

        const stopDealer = this.elements['stopDealer']
        this.slapEl.removeEventListener("click", this.buttonHandler)
        this.slapEl.style.display = "none"
        stopDealer.style.display = "none"

        const winner = this.elements['winner']

        if (this.score["red"] > this.score["blue"]) {
            winner.innerText = "Red Player Wins!"
            winner.style.color = "#FF2727";
        } else if (this.score["red"] < this.score["blue"]) {
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

    async drawTempCard() {
        const res = await fetch(`https://deckofcardsapi.com/api/deck/${this.deck_id}/draw/?count=1`,
            {
                "Content-Type": "application/json"
            }
        )
        const cardResponse = await res.json()
        this.beforeDeck.unshift(cardResponse.cards[0])
        
        const cardData = {
            card: cardResponse.cards[0],
            remaining: cardResponse.remaining
        }
        this.socket.emit("draw-new", cardData)
    }

    async drawCard() {
        const res = await fetch(`https://deckofcardsapi.com/api/deck/${this.deck_id}/draw/?count=1`,
            {
                "Content-Type": "application/json"
            }
        )
        const cardResponse = await res.json()

        this.beforeDeck.unshift(cardResponse.cards[0])

        this.drawnCard = this.beforeDeck.pop()
        this.remaining = cardResponse.remaining + 1
        AudioUtil.playDealCard()

        const cardData = {
            card: cardResponse.cards[0],
            remaining: cardResponse.remaining
        }
        this.socket.emit("draw-new", cardData)
    }

    placeCard() {
        this.prevFiveEl.children[0].classList.remove("sixth")
        this.prevFourEl.children[0].classList.remove("fifth")
        this.prevThreeEl.children[0].classList.remove("fourth")
        this.prevTwoEl.children[0].classList.remove("third")
        this.prevOneEl.children[0].classList.remove("second")
        this.topEl.children[0].classList.remove("top")

        this.prevFiveEl.offsetWidth
        this.prevFourEl.offsetWidth
        this.prevThreeEl.offsetWidth
        this.prevTwoEl.offsetWidth
        this.prevOneEl.offsetWidth
        this.topEl.offsetWidth

        this.prevFiveEl.children[0].classList.add("sixth")
        this.prevFourEl.children[0].classList.add("fifth")
        this.prevThreeEl.children[0].classList.add("fourth")
        this.prevTwoEl.children[0].classList.add("third")
        this.prevOneEl.children[0].classList.add("second")
        this.topEl.children[0].classList.add("top")

        if (this.prevFourEl.dataset.card) {
            this.prevFiveEl.dataset.card = this.prevFourEl.dataset.card
            this.prevFiveEl.children[0].src = this.prevFourEl.children[0].src
        }
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
        return -2
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