const {allPlayers} = require("../players");
const { boxManager } = require('../boxes');

const respawnPoints = [
    { x: 100, y: 100 }, // Top-left quadrant, near spawn but away from walls
    { x: 650, y: 150 }, // Top-right quadrant, in open space near central paths
    { x: 300, y: 700 }, // Bottom quadrant, away from obstacles and collision boxes
];


function playerShoot(io, socket, data) {
    const currentPlayer = allPlayers.getPlayer(socket.id);

    // Check if the player has enough ammo to shoot

    if (currentPlayer.ammo.currentAmmo <= 0) {
        // Emit a message to the client that the player has no ammo
        socket.emit('noAmmo');
        return;
    }
    // Decrease ammo
    currentPlayer.ammo.currentAmmo--;

    
    const bulletData = {
        startX: currentPlayer.x,
        startY: currentPlayer.y,
        mouseX: data.mouseX,
        mouseY: data.mouseY,
        angle: data.angle,
        distance: data.distance,
        shooterId: data.id
    };

    // First check if mouse position directly hits any player
    const hitPlayer = allPlayers.getPlayers().find(player => {
        if (player.id === data.id) return false;
        
        const dx = (player.x + player.radius) - data.mouseX;
        const dy = (player.y + player.radius) - data.mouseY;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        
        return distanceToPlayer <= player.radius;
    });

    if (hitPlayer) {
        const rayStart = {
            x: currentPlayer.x + currentPlayer.radius,
            y: currentPlayer.y + currentPlayer.radius
        };
        const rayEnd = {
            x: hitPlayer.x + hitPlayer.radius,
            y: hitPlayer.y + hitPlayer.radius
        };
        socket.emit('raycast', { rayStart, rayEnd});
    
        // Check if either player is too close to a box
        const isNearBox = (point, box, threshold = 20) => {
            return (
                point.x >= box.x - threshold &&
                point.x <= box.x + box.width + threshold &&
                point.y >= box.y - threshold &&
                point.y <= box.y + box.height + threshold
            );
        };
    
        const boxInPath = boxManager.getBoxes().some(box => {
            // Skip box collision check if either player is very close to the box
            if (isNearBox(rayStart, box, 20) || isNearBox(rayEnd, box, 20)) {
                return false;
            }
    
            const bulletPath = {
                x1: rayStart.x,
                y1: rayStart.y,
                x2: rayEnd.x,
                y2: rayEnd.y
            };
            
            const expandedBox = {
                x: box.x +15 ,
                y: box.y +15,
                width: box.width - 15,
                height: box.height - 15
            };
            
            return lineIntersectsBox(bulletPath, expandedBox);
        });

        if (!boxInPath) {
            hitPlayer.health -= 25;
            io.emit('playerHit', {
                id: hitPlayer.id,
                ammo: currentPlayer.ammo.currentAmmo,
                health: hitPlayer.health,
                x: hitPlayer.x,
                y: hitPlayer.y,
            });
            
            if (hitPlayer.health <= 0) {
                const killer = allPlayers.getPlayers().find(p => p.id === data.id);
                if (!killer.kills) killer.kills = 0;
                killer.kills++;
                hitPlayer.health = 100;
                io.emit('playerDeath', {
                    killed: hitPlayer.id,
                    killer: data.id,
                    kills: ((killer.kills % 6) === 0 ? ++killer.kills % 6 : killer.kills % 6),
                    x: hitPlayer.x,
                    y: hitPlayer.y,
                    health: hitPlayer.health
                });
                
                
                let respawnPointIndex;
                do {
                    respawnPointIndex = Math.floor(Math.random() * respawnPoints.length);
                } while (respawnPointIndex === hitPlayer.lastRespawnIndex);
                const randomRespawnPoint = respawnPoints[respawnPointIndex];
                hitPlayer.x = randomRespawnPoint.x;
                hitPlayer.y = randomRespawnPoint.y;
                hitPlayer.lastRespawnIndex = respawnPointIndex;  
                
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
                ammo: currentPlayer.ammo.currentAmmo,
                angle: data.angle,
                blocked: true
            });
        }
    } else {
        // Check for maximum bullet range box collisions
        const boxHit = boxManager.getBoxes().some(box => {
            const bulletPath = {
                x1: bulletData.startX,
                y1: bulletData.startY,
                x2: bulletData.startX + Math.cos(bulletData.angle) * bulletData.distance,
                y2: bulletData.startY + Math.sin(bulletData.angle) * bulletData.distance
            };
            
            return lineIntersectsBox(bulletPath, box);
        });

        io.emit("shoot", {
            player: currentPlayer,
            mouseX: data.mouseX,
            mouseY: data.mouseY,
            angle: data.angle,
            ammo: currentPlayer.ammo,
            blocked: boxHit,
            hits: []
        });
    }
}


function lineIntersectsBox(line, box) {
    // Add small buffer for bullet width
    const buffer = 5;
    const left = box.x - buffer;
    const right = box.x + box.width + buffer;
    const top = box.y - buffer;
    const bottom = box.y + box.height + buffer;

    // Check if line intersects any of the box's edges
    return (
        lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, left, top, right, top) ||
        lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, right, top, right, bottom) ||
        lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, right, bottom, left, bottom) ||
        lineIntersectsLine(line.x1, line.y1, line.x2, line.y2, left, bottom, left, top)
    );
}

function hasLineOfSight(shooter, target, boxes) {
    const rayStart = {
        x: shooter.x + shooter.radius,
        y: shooter.y + shooter.radius
    };
    const rayEnd = {
        x: target.x + target.radius,
        y: target.y + target.radius
    };
    
    // Check with a slightly thinner collision box
    return !boxes.some(box => {
        const bulletPath = {
            x1: rayStart.x,
            y1: rayStart.y,
            x2: rayEnd.x,
            y2: rayEnd.y
        };
        return lineIntersectsBox(bulletPath, box);
    });
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
