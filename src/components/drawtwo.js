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
	printHeightmap(heightMap, visitedPixels) {
		// Loop over all of the pixels
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				// Get the pixel index
				let pixelIndex = (y * this.width + x) * 4;
				let height = heightMap[pixelIndex / 4];

				if (visitedPixels[pixelIndex / 4] == 1) {
					green = 255;
					red = 0;
					blue = 0;
				}

        let color = MapGeneration.getColorFromHeight(height);


				// Set the pixel data
				this.imagedata.data[pixelIndex] = color[0];     // Red
				this.imagedata.data[pixelIndex+1] = color[1]; // Green
				this.imagedata.data[pixelIndex+2] = color[2];  // Blue
				this.imagedata.data[pixelIndex+3] = heightMap[pixelIndex / 4] < 0.2 ? 0 : 255;   // Alpha
			}
		}
  }
  
  updateImage(heightMap, visitedPixels) {
    this.printHeightmap(heightMap, visitedPixels);
    this.context.putImageData(this.imagedata, 0, 0);
  }
}