// require('dotenv').config();

// server.js
// where your node app starts

// init project
const express = require("express");
const socketio = require('socket.io');
const http = require('http');
const bodyParser = require("body-parser");
const app = express();
// const server = http.Server(app);
const server = http.createServer(app);
const io = socketio(server, {
  origin: "http://localhost:5000/"
});
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("dist"));






// init sqlite db
// const dbFile = "./.data/sqlite.db";
// const exists = fs.existsSync(dbFile);
// const sqlite3 = require("sqlite3").verbose();
// const db = new sqlite3.Database(dbFile);

// // if ./.data/sqlite.db does not exist, create it, otherwise print records to console
// db.serialize(() => {
//   if (!exists) {
//     db.run(
//       "CREATE TABLE Dreams (id INTEGER PRIMARY KEY AUTOINCREMENT, dream TEXT)"
//     );
//     console.log("New table Dreams created!");

//     // insert default dreams
//     db.serialize(() => {
//       db.run(
//         'INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")'
//       );
//     });
//   } else {
//     console.log('Database "Dreams" ready to go!');
//     db.each("SELECT * from Dreams", (err, row) => {
//       if (row) {
//         console.log(`record: ${row.dream}`);
//       }
//     });
//   }
// });

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});





const room = [null, null];
io.on('connection', (socket) => {
  // console.log("making request")

  // My Attempt to make rooms for each session with 
  // socket.on('join-room', (player, gameView) => {
  //   if (gameView.playerRed && gameView.playerBlue) {
  //     console.log("Already two players connected")
  //     return;
  //   } else if (gameView.playerBlue) {
  //     player.color = "red"
  //     gameView.playerRed = player
  //   } else {
  //     player.color = "blue"
  //     gameView.playerBlue = player
  //   }
  //   console.log(player.color, "player joined")
  //   socket.broadcast.emit('connect-player', player);
  // })
    
    // Emit the slap to all other clients
    // Find an available player number
    let playerIndex = -1;
    for (let i = 0; i < room.length; i++) {
      if (room[i] === null) {
        playerIndex = i;
      }
    }
    
    // // Tell the connecting client what player number they are
    // socket.emit('player-number', playerIndex);
    if (playerIndex === -1) return; // Future error handling if someone else tries to join
    room[playerIndex] = socket;
    
    console.log("player joined with index", playerIndex)
    let color = playerIndex === 0 ? "red" : "blue"
    console.log("player color", color)
    socket.broadcast.emit('connect-player', color);
  // });

  socket.on('start-game', (gameData) => {
    console.log(gameData)
    // Emit the start-game clients
    if (gameData.color === "red") {
      // console.log("Sending other player they are blue")
      gameData.color = "blue"
      socket.broadcast.emit('connect-game', gameData);
    } else {
      // console.log("Sending other player they are red")
      gameData.color = "red"
      socket.broadcast.emit('connect-game', gameData);
    }
  });

  socket.on('slap', (data) => {
    const { color, topDeck, scoreValue } = data;
    
    const slap = {
      color,
      topDeck,
      scoreValue
    };

    // Emit the slap to all other clients
    socket.broadcast.emit('slap', slap);
  });

  socket.on('draw-new', (cardData) => {
    console.log("draw info", cardData)

    // Emit the draw-new to all other clients
    socket.broadcast.emit('draw-new', cardData);
  });

  socket.on('game-over', (boolean) => {
    // Emit the if gameover to all other clients
    socket.broadcast.emit('force-gameover', boolean);
  });

  // socket.on('game', (game) => {
  //   console.log("game info", game)

  //   // Emit the game to all other clients
  //   socket.broadcast.emit('game', game);
  // });

  socket.on('disconnect', () => {
    // console.log(`Player ${playerIndex} Disconnected`);
    room[playerIndex] = null;
  });
});

server.listen(8080, () => {
  console.log(`Listening on port ${8080}`);
});









// // endpoint to get all the dreams in the database
// app.get("/getDreams", (request, response) => {
//   db.all("SELECT * from Dreams", (err, rows) => {
//     response.send(JSON.stringify(rows));
//   });
// });

// // endpoint to add a dream to the database
// app.post("/addDream", (request, response) => {
//   console.log(`add to dreams ${request.body.dream}`);

//   // DISALLOW_WRITE is an ENV variable that gets reset for new projects
//   // so they can write to the database
//   if (!process.env.DISALLOW_WRITE) {
//     const cleansedDream = cleanseString(request.body.dream);
//     db.run(`INSERT INTO Dreams (dream) VALUES (?)`, cleansedDream, error => {
//       if (error) {
//         response.send({ message: "error!" });
//       } else {
//         response.send({ message: "success" });
//       }
//     });
//   }
// });

// // endpoint to clear dreams from the database
// app.get("/clearDreams", (request, response) => {
//   // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
//   if (!process.env.DISALLOW_WRITE) {
//     db.each(
//       "SELECT * from Dreams",
//       (err, row) => {
//         console.log("row", row);
//         db.run(`DELETE FROM Dreams WHERE ID=?`, row.id, error => {
//           if (row) {
//             console.log(`deleted row ${row.id}`);
//           }
//         });
//       },
//       err => {
//         if (err) {
//           response.send({ message: "error!" });
//         } else {
//           response.send({ message: "success" });
//         }
//       }
//     );
//   }
// });

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
// var listener = app.listen(process.env.PORT, () => {
//   console.log(`Your app is listening on port ${listener.address().port}`);
// });

// server.listen(3000, () => console.log('server started'));