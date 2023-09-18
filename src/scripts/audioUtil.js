// This is for playing different dealcard audios
// When audio isn't done yet and is attempted to play again,
// it won't restart the audio. Thus, it needs to be separate
// audio clips and this array keeps track of which to play next
const dealCardArr = ['a','b','c','d']

const AudioUtil = {
    playSound: (sound) => {
        let element = document.getElementById(sound)
        element.volume = 0.1;
        element.play()
    },
    playStartGame: () => {
        AudioUtil.playSound("start-game")
    },
    playClickButton: () => {
        AudioUtil.playSound("click-button")
    },
    playDealCard: () => {
        AudioUtil.playSound(`deal-card-${dealCardArr[0]}`)
        dealCardArr.push(dealCardArr.shift())
    },
    playPlayerMisclicks: () => {
        AudioUtil.playSound("player-misclicks")
    },
    playPoints: () => {
        AudioUtil.playSound("points")
    },
    playGameover: () => {
        AudioUtil.playSound("gameover")
    }
}

export default AudioUtil