const {allPlayers} = require("../players");
/** @param {import("socket.io").Socket} socket*/
/** @param {import("socket.io").Server} io*/
function playerUpdate(io,socket,data){
    // console.log(data);
    const player = allPlayers.getPlayer(socket.id);
    player.x = data.x;
    player.y = data.y;
    io.emit("playerUpdate",{
        id:socket.id,
        x:player.x,
        y:player.y,
        health:player.health
    });

}

module.exports = {
    playerUpdate
}