class ParticleSystem {
    constructor(gridSize) {
        let xDivisions = floor(width / gridSize);
        let yDivisions = floor(height / gridSize);
        this.gridSize = gridSize;
        this.delete = 0;
        this.particleCount=0;
        this.grid = [];
        for (let x = 0; x < xDivisions; x++) {
            this.grid[x] = [];
            for (let y = 0; y < yDivisions; y++) {
                this.grid[x][y] = [];
            }
        }
    }
    addParticle(pos, vel) {
        let particle = new Particle(this.gridSize);
        if (pos) {
            particle.setPos(pos);
        }
        if (vel) {
            particle.setVel(vel);
        }
        // console.log("attempt to make particle at array location", particle.gridX, particle.gridY, "with position", particle.pos.x, particle.pos.y, this.grid);
        this.grid[particle.gridX][particle.gridY].push(particle);
        this.particleCount++;
    }
    // deleteParticle(){
    //     let r = floor(random(this.pList.length-1));//random number in the list of particles
    //     let x = this.pList[r].gridX;
    //     let y = this.pList[r].gridY;
    //     if (this.grid[p.gridX] && this.grid[p.gridX][p.gridY]){
    //         this.grid[x][y].splice(this.grid[x][y].indexOf(this.pList[r]), 1);
    //     }
    //     this.pList.splice(r, 1);
    // }
    update() {
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                for (let p of this.grid[x][y]) {
                    if (this.delete > 0 && random(1)>0.99) {
                        this.grid[x][y].splice(this.grid[x][y].indexOf(p), 1);
                        this.delete--;
                        this.particleCount--;
                    } else {
                        p.updateGrid();
                        if (p.gridX != x || p.gridY != y) {
                            //move to other grid container if its moved
                            if (this.grid[p.gridX] && this.grid[p.gridX][p.gridY]) {//check the new container is valid
                                this.grid[p.gridX][p.gridY].push(p);
                                this.grid[x][y].splice(this.grid[x][y].indexOf(p), 1);
                            }
                        }
                    }
                }
            }
        }
        let checkParticleCount = 0;
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                for (let p of this.grid[x][y]) {
                    checkParticleCount++;
                    p.searchGrid(this.grid);
                    p.move();
                }
            }
        }
        if(checkParticleCount!=this.particleCount){
            console.log("particle count mismatch",this.particleCount, checkParticleCount);
            this.particleCount = checkParticleCount;
        }
    }
    display() {
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                this.grid[x][y].forEach((p) => p.display());
            }
        }
    }
    resize() {
        let xDivisions = floor(width / this.gridSize);
        let yDivisions = floor(height / this.gridSize);
        if (this.grid.length > xDivisions) {//delete excess x grid containers and the particles they contain.
            this.grid.splice(xDivisions, this.grid.length - xDivisions);
        }
        for (let x = 0; x < xDivisions; x++) {
            if (x >= this.grid.length) {//add new x containers if they are missing.
                this.grid[x] = [];
            }
            if (this.grid[x].length > yDivisions) {//delete excess y grid containers and the particles they contain.
                this.grid[x].splice(yDivisions, this.grid[x].length - yDivisions);
            }
            for (let y = 0; y < yDivisions; y++) {
                if (y >= this.grid[x].length) {//add new y containers if they are missing.
                    this.grid[x][y] = [];
                }
            }
        }

    }
}

class Particle {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.pos = createVector(random(width), random(height));
        this.pos = boundaries(this.pos, this.gridSize);
        let xMargin = (width % gridSize) / 2;
        let yMargin = (height % gridSize) / 2;
        this.gridX = floor((this.pos.x - xMargin) / this.gridSize);
        this.gridY = floor((this.pos.y - yMargin) / this.gridSize);
        let localX = (this.pos.x - xMargin) - this.gridX * this.gridSize;
        let localY = (this.pos.y - yMargin) - this.gridY * this.gridSize;
        this.localPos = createVector(localX, localY);
        this.radius = gridSize / 2;
        colorMode(HSB, 255);
        this.colour = color(random(255), 255, 255);
        colorMode(RGB, 255);
        this.vel = p5.Vector.random2D();
        this.target = createVector(random(width), random(height));
    }
    updateGrid() {
        let xMargin = (width % this.gridSize) / 2;
        let yMargin = (height % this.gridSize) / 2;
        this.gridX = floor((this.pos.x - xMargin) / this.gridSize);
        this.gridY = floor((this.pos.y - yMargin) / this.gridSize);
        let localX = (this.pos.x - xMargin) - this.gridX * this.gridSize;
        let localY = (this.pos.y - yMargin) - this.gridY * this.gridSize;
        this.localPos.set(localX, localY);
    }
    searchGrid(grid) {
        push();
        noStroke();
        //get the grid containers
        let searchBoxX = this.localPos.x > this.gridSize / 2 ? 1 : -1;
        let searchBoxY = this.localPos.y > this.gridSize / 2 ? 1 : -1;
        let collisionsList = [];
        for (let ix = 0; ix < 2; ix++) {
            let x = wrap(this.gridX + searchBoxX * ix, 0, grid.length);
            for (let iy = 0; iy < 2; iy++) {
                let y = wrap(this.gridY + searchBoxY * iy, 0, grid[0].length);
                if (x == this.gridX && y == this.gridY && grid[x][y].length > 1) {
                    //not alone in this grid square
                    for (let p of grid[x][y]) {
                        if (p != this && p.pos.dist(this.pos) < this.radius) {
                            if (!collisionsList.includes([p, this])) { collisionsList.push([this, p]); }
                        }
                    }
                } else if (grid[x][y].length != 0) {
                    //a particle in neighbour square
                    for (let p of grid[x][y]) {
                        if (p != this && p.pos.dist(this.pos) < this.radius) {
                            if (!collisionsList.includes([p, this])) { collisionsList.push([this, p]); }
                        }
                    }
                }
                //draw the debug squares
                // fill(255, 0, 0, 50);
                // rect(
                //     (x * this.gridSize) + xMargin,
                //     (y * this.gridSize) + yMargin,
                //     this.gridSize,
                //     this.gridSize
                // );
            }
        }

        for (let i = 0; i < collisionsList.length; i++) {
            collide(collisionsList[i][0], collisionsList[i][1]);
        }

        //draw search radius
        // fill(0, 0, 255, 50);
        // circle(this.pos.x, this.pos.y, this.gridSize);
        pop();
    }
    move() {
        this.vel.limit(50);
        if (this.vel.mag() < 0.1) {
            this.vel.setMag(0.5);
        }
        this.pos.add(this.vel);
        this.pos = boundaries(this.pos, this.gridSize);
    }
    setPos(pos) {
        this.pos = boundaries(pos, this.gridSize);
    }
    setVel(vel) {
        if (vel.mag() < 0.1) {
            vel.set(1, 1, 1);
            vel.setHeading(random(TWO_PI));
            vel.setMag(0.1);
        }
        this.vel = vel;
        // this.vel.limit(5);
    }
    display() {
        push();
        //draw particle
        imageMode(CENTER);
        image(img, this.pos.x, this.pos.y);
        // noStroke();
        // fill(this.colour);
        // circle(this.pos.x, this.pos.y, this.radius);
        pop();
    }
}

function boundaries(posVec, gridSize) {
    //wrap vectors around boundaries
    let x = wrap(posVec.x, (width % gridSize) / 2, width - (width % gridSize) / 2);
    let y = wrap(posVec.y, (height % gridSize) / 2, height - (height % gridSize) / 2);
    return createVector(x, y);
}

function collide(p1, p2) {
    //I got a lot of help from here. source: https://www.gamasutra.com/view/feature/131424/pool_hall_lessons_fast_accurate_.php?page=3
    let from1to2 = p2.pos.copy().sub(p1.pos); //vector from p1 to p2

    //move the spheres apart so they don't get stuck together
    let distance = from1to2.mag();
    p1.pos.add(from1to2.copy().setMag(distance - p1.radius + 1));
    p2.pos.add(from1to2.copy().setMag(-(distance - p2.radius + 1)));

    from1to2.normalize();//normalize the collision normal
    let dot1 = p1.vel.dot(from1to2);//velocity dot normal
    let dot2 = p2.vel.dot(from1to2);//velocity dot normal
    let dotComponentDifference = dot2 - dot1;//get the difference between the components along the normal
    from1to2.setMag(dotComponentDifference);//set the collision vectors magnitude
    p1.vel.add(from1to2);//add the collision vector to p1
    p2.vel.sub(from1to2);//subract the collision vector from p2
}

function wrap(value, lowLimit, highLimit) {
    //adapted from source: [user M2tM] https://stackoverflow.com/questions/4633177
    if (lowLimit > highLimit) {
        //swap them around
        let temp = lowLimit;
        lowLimit = highLimit;
        highLimit = temp;
    }
    value -= lowLimit; //adjust to 0
    let rangeSize = highLimit - lowLimit;
    if (rangeSize == 0) {
        return highLimit;
    } //avoid dividing by 0
    return value - rangeSize * floor(value / rangeSize) + lowLimit;
}
