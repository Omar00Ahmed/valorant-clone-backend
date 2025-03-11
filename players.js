 class Players{
    constructor(){
        this.players = new Map();
    }
    addPlayer(player){
        this.players.set(player.id, player);
    }
    removePlayer(playerId){
        this.players.delete(playerId);
    }
    getPlayer(playerId){
        return this.players.get(playerId);
    }
    getPlayers(){
        return [...this.players.values()];
    }
    
}


 class Player{
    constructor(id, x, y, radius, color,name,health,ammo){
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.health = 100;
        this.name = name;
        this.ammo = ammo;
    }

    getData(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            radius: this.radius,
            color: this.color,
            name: this.name
        }
    }
}

const allPlayers = new Players();

module.exports = {
    Players,
    Player,
    allPlayers
}