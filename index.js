const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const app = express();
const {Player,Players}= require("./players")
const { boxManager } = require('./boxes');




var corsOptions = {
    origin: ["http://www.example.com/","http://localhost:5173"],
    methods : ["GET","POST"],
}
    
app.use(cors(corsOptions));
const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: ["http://www.example.com/","http://localhost:5173"],
        methods : ["GET","POST"],
    }
});

app.get("/", (req, res) => {
    res.send("hello world")
})
const {allPlayers} = require("./players");
io.on('connection', (socket) => {
    const player = new Player(socket.id, 70, 70, 20, "#fff","random",100,{
        currentAmmo:15,
        maxAmmo:15
    });
    allPlayers.addPlayer(player);
    socket.emit('initBoxes', boxManager.getBoxes());
    try {
        const eventsPath = path.join(__dirname, 'socket-events');
        const eventFiles = fs.readdirSync(eventsPath);
        
        eventFiles.forEach(file => {
            const filePath = path.join(eventsPath, file);
            const eventHandlers = require(filePath);
            Object.keys(eventHandlers).forEach(eventName => {
                socket.on(eventName, (...args) => eventHandlers[eventName](io,socket, ...args));
            });
        });
    } catch (error) {
        console.error('Error registering events:', error);
    }   
    
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});