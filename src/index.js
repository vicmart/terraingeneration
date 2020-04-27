import MapGeneration from "./components/mapgeneration.js";
import PathFinding from "./components/pathfinding.js";
import DrawTwo from "./components/drawtwo.js";
import DrawThree from "./components/drawthree.js";

// The function gets called when the window is fully loaded
window.onload = function() {
	// Main loop
	function main(tframe) {
			// Request animation frames
			//window.requestAnimationFrame(main);

			/**
			// Create the image
			let heightMap = generateNoise();
			//let visitedPixels = traverseMap(width/2, height/2, 0, Math.PI * 2, heightMap, Array(width * height).fill(0), 1, 15);
			let visitedPixels = Array(width * height).fill(0);
			printHeightmap(heightMap, visitedPixels);

			// Draw the image data to the canvas
			context.putImageData(imagedata, 0, 0); */

			let width = parseInt(window.innerHeight);
			let height = parseInt(window.innerHeight);

			let map = new MapGeneration(width, height);
			let drawTwo = new DrawTwo(width, height, "#minimap");
			drawTwo.updateImage(map, Array(width * height).fill(0));

			let drawThree = new DrawThree(width, height);
			drawThree.renderMap(map, width, height, 35);

	}

	// Call the main loop
	main(0);
};