import MapGeneration from "./mapgeneration.js";

export default class DrawTwo {
  constructor(width, height, selector) {
    this.width = width;
    this.height = height;

    this.canvas = document.querySelector(selector); 
    this.context = this.canvas.getContext("2d");

    this.canvas.width = width;
    this.canvas.height = height;
    
    this.init();
  }

  init() {
    this.canvas.style.width = `${parseInt(this.canvas.offsetHeight) * (this.canvas.width/this.canvas.height)}px`;
  	this.imagedata = this.context.createImageData(this.width, this.height);
  }

	// Create the image
	printHeightmap(heightMap, playerX, playerY) {
		// Loop over all of the pixels
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				// Get the pixel index
				let pixelIndex = (y * this.width + x) * 4;
				let height = heightMap[pixelIndex / 4];

        let color = MapGeneration.getColorFromHeight(height);
        let isPlayer = false;

        if (playerX && playerY && Math.abs(x - playerX) < 5 && Math.abs(y - playerY) < 5) {
          color = [255, 0, 0];
          isPlayer = true;
        }

				// Set the pixel data
				this.imagedata.data[pixelIndex] = color[0];     // Red
				this.imagedata.data[pixelIndex+1] = color[1]; // Green
				this.imagedata.data[pixelIndex+2] = color[2];  // Blue
				this.imagedata.data[pixelIndex+3] = isPlayer ? 255 : (heightMap[pixelIndex / 4] < 0.16 ? 0 : 255);   // Alpha
			}
		}
  }

	updateHeightmap(playerX, playerY) {
		for (let x = playerX - 5; x <= playerX + 5; x++) {
			for (let y = playerY - 5; y <= playerY + 5; y++) {
				// Get the pixel index
        let pixelIndex = (y * this.width + x) * 4;

        // Set the pixel data
				this.imagedata.data[pixelIndex] = 255;     // Red
				this.imagedata.data[pixelIndex+1] = 0; // Green
				this.imagedata.data[pixelIndex+2] = 0;  // Blue
				this.imagedata.data[pixelIndex+3] = 255;   // Alpha
			}
    }
    
    this.oldPlayerX = playerX;
    this.oldPlayerY = playerY;
  }
  
  updateImage(heightMap) {
    this.heightMap = heightMap;
    this.printHeightmap(this.heightMap);
    this.context.putImageData(this.imagedata, 0, 0);
  }

  updatePlayer(playerX, playerY) {
    this.updateHeightmap(playerX + this.width/2, playerY + this.height/2);
    this.context.putImageData(this.imagedata, 0, 0);
  }
}