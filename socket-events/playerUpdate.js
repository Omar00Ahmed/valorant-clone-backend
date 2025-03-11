const {allPlayers} = require("../players");

// Persistent queue system at module level
const updateQueues = new Map();
const processingStates = new Map();

function playerUpdate(io, socket, data) {
    // Initialize queue if first time
    if (!updateQueues.has(socket.id)) {
        updateQueues.set(socket.id, []);
        processingStates.set(socket.id, false);
    }
    
    // Add to queue
    updateQueues.get(socket.id).push({
        x: data.x,
        y: data.y,
        timestamp: Date.now()
    });

    // Only start processing if not already processing
    if (!processingStates.get(socket.id)) {
        processingStates.set(socket.id, true);
        processQueue(io, socket);
    }
}

function processQueue(io, socket) {
    const queue = updateQueues.get(socket.id);
    if (!queue || queue.length === 0) {
        processingStates.set(socket.id, false);
        return;
    }

    const update = queue.shift();
    const player = allPlayers.getPlayer(socket.id);
    
    if (player) {
        player.x = update.x;
        player.y = update.y;
        
        io.emit("playerUpdate", {
            id: socket.id,
            x: player.x,
            y: player.y,
            health: player.health
        });
    }

    setTimeout(() => processQueue(io, socket), 16);
}

// Clean up when player disconnects
function cleanupPlayer(socketId) {
    updateQueues.delete(socketId);
    processingStates.delete(socketId);
}

module.exports = {
    playerUpdate,
    cleanupPlayer
}
