import MapGeneration from "./components/mapgeneration";
import DrawTwo from "./components/drawtwo";
import DrawThree from "./components/drawthree";

window.onload = function() {
	let width  = 500;
	let height = 500;

	let map     = MapGeneration.generate(width, height);
	let drawTwo = new DrawTwo(width, height, "#minimap");
	drawTwo.updateImage(map);

	let drawThree = new DrawThree(drawTwo);
	drawThree.renderMap(map, width, height, 50, 2);
};
