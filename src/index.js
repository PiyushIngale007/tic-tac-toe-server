const io = require("socket.io")(4000 , {
    cors: {
        origin : ["http://localhost:3000"]
    }
})


let roomid = []



io.on("connection" , (client) => {
    const room_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    console.log(client.id)

    roomid.push(room_id)
    client.emit("create-game",room_id)

    client.on("join-game", (id) => {
        console.log(id);
        client.join(id)
        var valid = null
        console.log(roomid);
        if (roomid.includes(id)) {
            valid = true
        } else {
            valid = false
        }
        client.emit("validate", valid)
    })

    client.on("testvalue" , (testvalue , room) => {
        console.log(testvalue);
        console.log(room);
        client.to(room).emit("testvalue" , testvalue)
    })

})

