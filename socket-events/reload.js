
const {allPlayers} = require("../players");

function reload(io, socket) {
    const currentPlayer = allPlayers.getPlayer(socket.id);
    console.log(currentPlayer);
    
    currentPlayer.ammo.currentAmmo = currentPlayer.ammo.maxAmmo;
    
    setTimeout(() => {
        io.emit('playerReloaded', {
            playerId: socket.id,
            ammo: currentPlayer.ammo.currentAmmo
        });
    }, 2000);
}

module.exports = {
    reload
};
