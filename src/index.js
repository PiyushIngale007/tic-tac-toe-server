const io = require("socket.io")(4000 , {
    cors: {
        origin : ["http://localhost:3000"]
    }
})


let roomid = []


io.on("connection" , (client) => {
    const room_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    console.log(client.id)

    

    client.on('create-game', (name) => {
        roomid.push({RoomId:room_id,Player1:name,Player2:null});
    });

    client.emit("create-game",room_id)

    client.on("join-game", (id,name) => {
        console.log(id);
        client.join(id)
        let valid = null
        console.log(roomid);
        let Room=null
        roomid.forEach((room)=>{
            if(room.RoomId === id){
                room.Player2 = name
                valid = true
                Room = room
            }
            else{
                valid = false
            }
        })
        console.log(roomid);
        // if (roomid.includes(id)) {
        //     valid = true
        // } else {
        //     valid = false
        // }
        client.emit("validate", valid,Room)
    })

    client.on("testvalue" , (testvalue , room) => {
        console.log(testvalue);
        console.log(room);
        client.to(room).emit("testvalue" , testvalue)
    })

})

