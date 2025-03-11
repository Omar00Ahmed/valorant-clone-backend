class BoxManager {
    constructor() {
        this.boxes = [
            // Spawn areas
            { x: 0, y: 0, width: 800, height: 20 }, // Top wall
            { x: 0, y: 780, width: 800, height: 20 }, // Bottom wall
            { x: 0, y: 0, width: 20, height: 800 }, // Left wall
            { x: 780, y: 0, width: 20, height: 800 }, // Right wall
          
            // Spawn area boundaries
            { x: 50, y: 50, width: 150, height: 10 }, // Top-left horizontal
            { x: 50, y: 50, width: 10, height: 150 }, // Top-left vertical
            { x: 700, y: 700, width: 150, height: 10 }, // Bottom-right horizontal
            { x: 700, y: 550, width: 10, height: 150 }, // Bottom-right vertical
          
            // Central chokepoint obstacles
            { x: 350, y: 300, width: 50, height: 200 }, // Vertical block
            { x: 400, y: 300, width: 100, height: 50 }, // Horizontal block
          
            // Cover points
            { x: 200, y: 150, width: 50, height: 50 }, // Near corridor
            { x: 600, y: 500, width: 50, height: 50 }, // Near spawn
            { x: 300, y: 550, width: 70, height: 70 }, // Bottom area
          
            // Strategic corner blocks
            { x: 250, y: 400, width: 50, height: 80 }, // Left mid
            { x: 500, y: 200, width: 80, height: 40 }, // Right mid
        ];
    }

    getBoxes() {
        return this.boxes;
    }
}

const boxManager = new BoxManager();
module.exports = { boxManager };
