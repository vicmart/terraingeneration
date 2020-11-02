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
	}

	let width = 500;
	let height = 500;

	let map = new MapGeneration(width, height);
	let drawTwo = new DrawTwo(width, height, "#minimap");
	drawTwo.updateImage(map, Array(width * height).fill(0));

	let drawThree = new DrawThree(drawTwo);
	drawThree.renderMap(map, width, height, 35, 2);

	// Call the main loop
	main(0);
};