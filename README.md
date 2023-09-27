# Code Challenge: Lucky 7

This is a card game that is similar to SlapJack. Whichever player slaps the stack first on a combination will gain points. The players can win in one of two ways: Either you reach 77 points or the cards are all dealt out. There are two decks per game so you have 104 cards in total. (NOTE: Currently the Stop Dealer button will make it so that only one game stops at a time)

### When should a player slap (Combos):
- Anytime a 7 shows up - 7 Points
- Any 2 cards that can mathematically equate to 7 (2&5, 3&4, 10&3, 9&2, NO ACE COMBOS) - 5 Points
- Any 2 cards that are the same value right next to each other - 3 Points
- Duplicate cards (Exact same value and suit) right next to each other - 5 Points
- Any 3 cards of the Royal Flush combination in a row (10, J, Q, K, A) - 5 Points
- Sandwich combos are when any 2 matching cards have a card in between (Q2Q, A8A, 6K6) - 4 Points
- Lucky 7 is where all top 3 cards of the deck are 7s - 77 Points (Auto win)
- NOTE: Multiple points can be accumulated!
    - For example: 929 would be 9 points, 7A7 would be 11 Points, KKK where the last two Kings are the same suit as well is 17 points
- Should a player slap on something with no value, that will be a deduction of points - -10 Points
- BONUS: There will be a random card generator indicator at the top of the screen, this is a jackpot card so if you hit it when you see this card (only if it fulfills other requirements as well), then you get 2x points!

## How to Set Up/Play:
- Download the project
- `npm install`
- Open up two terminals for webpack and node and run in both:
    - `npm run watch`
    - `npm run start`
- Open up http://localhost:8080/ on two browsers
- Press the same play button on the host (The one with the play buttons)
    - Other client will say "Waiting for host..."

### Bugs/Comments:
- There is no database needed for this project but it can be useful in some cases I discuss below (in Future Implementations)
- I have worked a lot on game logic and fine tuning that but ran into trouble with sockets that led some buttons to not function as they should:
    - Attempted to create a room for both players to join
    - There is not a way for 2 players to play without using the same mouse
    - For now, you can click the slap button multiple times during a combo to 'cheat' more points until the next card appears

### Game Conditions:
- There will be 2 decks of cards that the dealer will go through (all shuffled).
- When a player reaches 77 points or cards were all dealt, that is game over (You can stop the game with the Stop Dealer button which prematurely ends the game)
- BONUS: If a player slaps 7/8 of the 7 cards, then the game is over
- The dealer will deal every few seconds (based on speed difficulty), to give players time to determine if they should slap or not
- If nothing happens in the time alloted, then the dealer deals the next card regardless if there were combinations or points
- Players can see points they have vs other players at the top

# Features List:
- Feature 1: Game Logic
- Feature 2: Multiplayer (SocketIO)
- Feature 3: Animations (Canvas)
- Feature 4: Hand Detection (TensorFlow)
    - I intend to include hand detection so a player can slap with their hand in their live video feed and that would influence the game actions
    - I also wanted both live feeds to appear on the application so it would be a fun interactive game
    - BONUS: Different Hand Actions
    - BONUS: Cards Fall and have HitBox so You Need To Hit The Card (Collision Detection) in order to be considered a Slap

### Technologies Included:
- SocketIO
- Deck of Cards API
- Web Audio API
- Webpack
- Node.js
- Express
### Intended Technologies for the Future:
- Canvas
- TensorFlow

## Actual Timeline:
- 15 minutes planning
- 15 minutes setup
- 1.5 hour game logic
- 30 minutes styling + audio
- 1 hour researching socketIO
- 1.5 minutes implementing live tracking of score and game
    - Lot's of time went to debugging

## Future Implementations:
- I would like to take more time in understanding SocketIO to get more practice and develop better live interaction
- Potential for React & Redux but I wanted to focus on more of the functionality given the time constraints.
    - In hindsight, I realized it would have helped to make DOM Manipulation less tedious, have control over lifecycles, and update the state more efficiently
- Potential for a database to store the scores, store the deck of cards for a single place where they exist, or maybe potentially store multiple rooms so that not just one room can go on playing
- Add Animations (indicate what combo it was better, show the different points that were added up, cards being dealt more smoothly with an animation, cards moving down the stack with animation, etc)
- Add TensorFlow involving hand detection to determine actions in the game
- Add Bonuses
- Refactor code for optimization and efficiency
- Add more Comments as documentation and understanding the code (And more semantic)
- Add Tests and Error Handling

## Closing Thoughts:
- Thank you for giving me this opportunity to challenge myself. This was very stressful and made me grow more even if I didn't accomplish a finished product in time. I am excited to continue working on this and show more progress throughout the week! Keep in tuned!