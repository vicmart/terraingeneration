import MapGeneration from "./mapgeneration.js";
import PathFinding from "./pathfinding.js";

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
  	this.mapImageData = this.context.createImageData(this.width, this.height);
  	this.originalImageData = this.context.createImageData(this.width, this.height);
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

				// Set the pixel data
				this.mapImageData.data[pixelIndex] = color[0];     // Red
				this.mapImageData.data[pixelIndex+1] = color[1]; // Green
				this.mapImageData.data[pixelIndex+2] = color[2];  // Blue
				this.mapImageData.data[pixelIndex+3] = isPlayer ? 255 : (heightMap[pixelIndex / 4] < 0.16 ? 0 : 255);   // Alpha
				this.originalImageData.data[pixelIndex] = color[0];     // Red
				this.originalImageData.data[pixelIndex+1] = color[1]; // Green
				this.originalImageData.data[pixelIndex+2] = color[2];  // Blue
				this.originalImageData.data[pixelIndex+3] = isPlayer ? 255 : (heightMap[pixelIndex / 4] < 0.16 ? 0 : 255);   // Alpha
			}
		}
  }

	updateHeightmap(playerX, playerY, lookAngle) {
    if (this.oldPlayerX && this.oldPlayerY) {
      for (let x = this.oldPlayerX - 5; x <= this.oldPlayerX + 5; x++) {
        for (let y = this.oldPlayerY - 5; y <= this.oldPlayerY + 5; y++) {
          // Get the pixel index
          let pixelIndex = (y * this.width + x) * 4;

          // Set the pixel data
          this.mapImageData.data[pixelIndex] = this.originalImageData.data[pixelIndex];     // Red
          this.mapImageData.data[pixelIndex+1] = this.originalImageData.data[pixelIndex+1]; // Green
          this.mapImageData.data[pixelIndex+2] = this.originalImageData.data[pixelIndex+2];  // Blue
          this.mapImageData.data[pixelIndex+3] = this.originalImageData.data[pixelIndex+3];   // Alpha
        }
      }
    }

		for (let x = playerX - 5; x <= playerX + 5; x++) {
			for (let y = playerY - 5; y <= playerY + 5; y++) {
        // Get the pixel index
        let pixelIndex = (y * this.width + x) * 4;

        // Set the pixel data
				this.mapImageData.data[pixelIndex] = 255;     // Red
				this.mapImageData.data[pixelIndex+1] = 0; // Green
				this.mapImageData.data[pixelIndex+2] = 0;  // Blue
				this.mapImageData.data[pixelIndex+3] = 255;   // Alpha
			}
    }

    /**
    let lookAtPath = PathFinding.findNextPixels(playerX, playerY, lookAngle, 10);

    //console.log(lookAtPath);
    for (let pixel of lookAtPath) {
      // Get the pixel index
      let pixelIndex = (pixel[1] * this.width + pixel[0]) * 4;

      // Set the pixel data
      this.mapImageData.data[pixelIndex] = 255;     // Red
      this.mapImageData.data[pixelIndex+1] = 0; //this.originalImageData.data[pixelIndex+1]; // Green
      this.mapImageData.data[pixelIndex+2] = 0; //this.originalImageData.data[pixelIndex+2];  // Blue
      this.mapImageData.data[pixelIndex+3] = 255; //127.5;   // Alpha
    } */
    
    this.oldLookAngle = lookAngle;
    this.oldPlayerX = playerX;
    this.oldPlayerY = playerY;
  }
  
  updateImage(heightMap) {
    this.heightMap = heightMap;
    this.printHeightmap(this.heightMap);
    this.context.putImageData(this.mapImageData, 0, 0);
  }

  updatePlayer(playerX, playerY, lookX, lookY) {
    this.updateHeightmap(parseInt(playerX + (this.width/2)), parseInt(playerY + (this.height/2)), Math.atan2(lookY, lookX));
    this.context.putImageData(this.mapImageData, 0, 0);
  }
}