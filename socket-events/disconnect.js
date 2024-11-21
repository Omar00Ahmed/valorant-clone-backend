const {allPlayers} = require("../players");
console.log(allPlayers);
/** @param {import("socket.io").Socket} socket*/
/** @param {import("socket.io").Server} io*/
function disconnect (io,socket,args){
    allPlayers.removePlayer(socket.id);
    io.emit("playerDisconnected",socket.id);
    console.log( allPlayers.getPlayers());
}
module.exports = {
    disconnect
}