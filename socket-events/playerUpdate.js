const {allPlayers} = require("../players");

function playerUpdate(io, socket, data) {
    const player = allPlayers.getPlayer(socket.id);
    if (!player) return;

    player.x = data.x;
    player.y = data.y;

    io.emit("playerUpdate", {
        id: socket.id,
        x: player.x,
        y: player.y,
        health: player.health,
        timestamp: data.timestamp
    });
}

module.exports = {
    playerUpdate
}
