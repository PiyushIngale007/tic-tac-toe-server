const io = require("socket.io")(5000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});
// const express = require("express");
// const app = express();

let roomid = [];
const answers = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const checkWinner = (playerArray) => {
  return answers.some((answer) => {
    return answer.every((move) => {
      return playerArray.includes(move);
    });
  });
};

io.on("connection", (client) => {
  const room_id = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);
  console.log(client.id);

  client.on("create-game", (name) => {
    const Player1Piece = Math.random() > 0.5 ? "X" : "O";
    const Player2Piece = Player1Piece === "X" ? "O" : "X";

    roomid.push({
      RoomId: room_id,
      Player1: name,
      Player2: null,
      Player1Piece: Player1Piece,
      Player2Piece: Player2Piece,
      player1Array: [],
      player2Array: [],
      Player1Score: 0,
      Player2Score: 0,
    });
  });

  client.emit("create-game", room_id);

  client.on("join-game", (id, name) => {
    console.log(id);
    client.join(id);
    let valid = null;

    let Room = null;
    roomid.forEach((room) => {
      if (room.RoomId === id) {
        room.Player2 = name;
        valid = true;
        Room = room;
        client.emit("validate", valid, Room);
        client.to(Room.RoomId).emit("testvalue", Room);
      } else {
        valid = false;
      }
    });
    console.log(roomid);
    // if (roomid.includes(id)) {
    //     valid = true
    // } else {
    //     valid = false
    // }
  });

  client.on("onDivClick", (number, details, piece) => {
    console.log(number, details.RoomId, piece);
    if (details.Player1Piece === piece) {
      details.player1Array.push(number - 1);
    } else {
      details.player2Array.push(number - 1);
    }
    let p1 = checkWinner(details.player1Array);
    let p2 = checkWinner(details.player2Array);
    console.log(p1, p2, details.player1Array, details.player2Array);
    if (p1) {
      console.log("Player 1 Winner");
      details.Player1Score++;
      io.in(details.RoomId).emit(
        "scoreUpdate",
        details.Player1Score,
        details.Player2Score
      );
      io.in(details.RoomId).emit("result", details.Player1);
    } else if (p2) {
      console.log("Player 2 Winner");
      details.Player2Score++;
      io.in(details.RoomId).emit(
        "scoreUpdate",
        details.Player1Score,
        details.Player2Score
      );
      io.in(details.RoomId).emit("result", details.Player2);
    } else if (
      details.player1Array.length + details.player2Array.length ===
      9
    ) {
      io.in(details.RoomId).emit("result", "Draw");
    }

    client.to(details.RoomId).emit("draw", number, piece, details);
  });

  client.on("testvalue", (testvalue, room) => {
    console.log(testvalue);
    console.log(room);
    client.to(room).emit("testvalue", testvalue);
  });

  client.on("playAgain", (details) => {
    // const Player1Piece = Math.random() > 0.5 ? "X" : "O";
    // const Player2Piece = Player1Piece === "X" ? "O" : "X";

    // details.Player1Piece = Player1Piece;
    // details.Player2Piece = Player2Piece;

    client.to(details.RoomId).emit("playAgain");
  });

  client.on("disconnecting1", (id) => {
    console.log("disconnected");
    roomid.forEach((room, index) => {
      if (room.RoomId === id) {
        console.log("Delete Room");
        delete roomid[index];
      } else {
        console.log(id);
      }
    });
  });
});
