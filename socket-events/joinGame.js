const {allPlayers} = require("../players");
function joinGame(io,socket,data){
    console.log("joinGame");
    const currentPlayer = allPlayers.getPlayer(socket.id);
    socket.emit("loadPlayers", {players: allPlayers.getPlayers()});
    io.emit("playerJoined",{
        id:socket.id,
        x:70,
        y:70,
        ammo:{
            currentAmmo:15,
            maxAmmo:100
        },
        health:currentPlayer.health
    })
}

module.exports ={
    joinGame
}