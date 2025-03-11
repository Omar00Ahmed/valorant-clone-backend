const {allPlayers} = require("../players");

function playerFlash(io, socket, data) {
    console.log("hello");
    const currentPlayer = allPlayers.getPlayer(socket.id);
    if (!currentPlayer) return;

    const nearbyPlayers = Object.values(allPlayers.getPlayers()).filter(player => {
        if (player.id === socket.id) return false;
        const dx = player.x - currentPlayer.x;
        const dy = player.y - currentPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= 500; // Flash radius of 300 units
    });
    console.log("ha",nearbyPlayers);
    
    nearbyPlayers.forEach(player => {
        io.to(player.id).emit("playerFlash", socket.id);
    });
}

module.exports = {
    playerFlash
}