class BoxManager {
    constructor() {
        this.boxes = [
            { x: 100, y: 100, width: 50, height: 50 },
            { x: 300, y: 200, width: 80, height: 40 },
            { x: 150, y: 350, width: 60, height: 60 }
        ];
    }

    getBoxes() {
        return this.boxes;
    }
}

const boxManager = new BoxManager();
module.exports = { boxManager };
