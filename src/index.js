const io = require("socket.io")(4000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

let roomid = [];

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
    });
  });

  client.emit("create-game", room_id);

  client.on("join-game", (id, name) => {
    console.log(id);
    client.join(id);
    let valid = null;
    console.log(roomid);
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

  client.on("onDivClick", (number, ID, piece) => {
    console.log(number, ID, piece);
    client.to(ID).emit("draw", number, piece);
  });

  client.on("testvalue", (testvalue, room) => {
    console.log(testvalue);
    console.log(room);
    client.to(room).emit("testvalue", testvalue);
  });
});
