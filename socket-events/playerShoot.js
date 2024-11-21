const {allPlayers} = require("../players");
const { boxManager } = require('../boxes');

function playerShoot(io, socket, data) {
    const currentPlayer = allPlayers.getPlayer(socket.id);
    
    const bulletData = {
        startX: currentPlayer.x,
        startY: currentPlayer.y,
        mouseX: data.mouseX,
        mouseY: data.mouseY,
        angle: data.angle,
        distance: data.distance,
        shooterId: data.id
    };

    // First check if bullet hits any boxes
    const boxHit = boxManager.getBoxes().some(box => {
        const bulletPath = {
            x1: bulletData.startX,
            y1: bulletData.startY,
            x2: bulletData.startX + Math.cos(bulletData.angle) * bulletData.distance,
            y2: bulletData.startY + Math.sin(bulletData.angle) * bulletData.distance
        };
        
        return lineIntersectsBox(bulletPath, box);
    });

    if (!boxHit) {
        // Check if mouse position directly hits any player
        const hitPlayer = allPlayers.getPlayers().find(player => {
            if (player.id === data.id) return false;
            
            const dx = (player.x + player.radius) - data.mouseX;
            const dy = (player.y + player.radius) - data.mouseY;
            const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
            
            return distanceToPlayer <= player.radius;
        });

        if (hitPlayer) {
            hitPlayer.health -= 50;
            io.emit('playerHit', {
                id: hitPlayer.id,
                health: hitPlayer.health
            });
            
            if (hitPlayer.health <= 0) {
                const killer = allPlayers.getPlayers().find(p => p.id === data.id);
                if (!killer.kills) killer.kills = 0;
                killer.kills++;
                
                io.emit('playerDeath', {
                    killed: hitPlayer.id,
                    killer: data.id,
                    kills: ((killer.kills % 6) === 0 ? ++killer.kills % 6 : killer.kills % 6),
                });
                
                hitPlayer.health = 100;
                hitPlayer.x = Math.random() * 800;
                hitPlayer.y = Math.random() * 600;
                
                io.emit('playerUpdate', {
                    id: hitPlayer.id,
                    x: hitPlayer.x,
                    y: hitPlayer.y,
                    health: hitPlayer.health
                });
            }

            io.emit("shoot", {
                player: currentPlayer,
                mouseX: data.mouseX,
                mouseY: data.mouseY,
                angle: data.angle,
                hits: [{ id: hitPlayer.id, health: hitPlayer.health }]
            });
        } else {
            io.emit("shoot", {
                player: currentPlayer,
                mouseX: data.mouseX,
                mouseY: data.mouseY,
                angle: data.angle,
                hits: []
            });
        }
    } else {
        io.emit("shoot", {
            player: currentPlayer,
            mouseX: data.mouseX,
            mouseY: data.mouseY,
            angle: data.angle,
            blocked: true
        });
    }
}

function lineIntersectsBox(line, box) {
    const left = box.x;
    const right = box.x + box.width;
    const top = box.y;
    const bottom = box.y + box.height;

    // Check if line intersects any of the box's edges
    return (
        lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, left, top, right, top) ||
        lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, right, top, right, bottom) ||
        lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, right, bottom, left, bottom) ||
        lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, left, bottom, left, top)
    );
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denominator = ((x2 - x1) * (y4 - y3)) - ((y2 - y1) * (x4 - x3));
    if (denominator === 0) return false;

    const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
    const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}



module.exports = {
    playerShoot
}
