import perlin from 'perlin-noise';

// The function gets called when the window is fully loaded
window.onload = function() {
	// Get the canvas and context
	var canvas = document.getElementById("viewport"); 
	var context = canvas.getContext("2d");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Define the image dimensions
	var width = canvas.width;
	var height = canvas.height;

	// Create an ImageData object
	var imagedata = context.createImageData(width, height);

	function generateNoise() {
		let heightMap = perlin.generatePerlinNoise(width, height, {octaveCount: 7, persistence: 0.3});
		// Normalize for distance from center
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				let distanceFromCenter = 0.25 - Math.sqrt(Math.pow((width/2) - x, 2) + Math.pow((height/2) - y, 2)) / (Math.min(height/2, width/2));
				heightMap[(y * width) + x] = Math.max(0, Math.min(1, heightMap[(y * width) + x] + distanceFromCenter));
			}
		}

		let newHeightMap = Array(width * height).fill(0);

		// Blur
		let range = 10;
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				let totalHeight = 0;
				let count = 0;

				for (let xi = Math.max(0, x - range); xi <= Math.min(width, x + range); xi++) {
					for (let yi = Math.max(0, y - range); yi <= Math.min(height, y + range); yi++) {
						totalHeight += heightMap[(yi * width) + xi];
						count++;
					}
				}

				newHeightMap[(y * width) + x] = totalHeight / count;
			}
		}
		return newHeightMap;
	}

	function findNextPixels(x, y, angle, iteration, path) {
		let pi = Math.PI;

		while(angle > pi * 2) {
			angle -= pi * 2;
		}

		while (angle < 0) {
			angle += pi * 2;
		}

		let dx = Math.cos(angle);
		let dy = Math.sin(angle);

		let xi, yi, i;

		if (angle === pi / 2 || angle == (3 * pi / 2)) {
			xi = -1;
		} else if (angle < pi / 2 || angle > (3 * pi / 2)) {
			xi = (Math.floor(x) + 1 - x) / dx;
		} else {
			xi = (Math.floor(x) - x) / dx;
		}

		if (angle === 0 || angle === pi) {
			yi = -1;
		} else if (angle < pi) {
			yi = (Math.floor(y) + 1 - y) / dy;
		} else {
			yi = (Math.floor(y) - y) / dy;
		}

		if (xi == -1) {
			i = yi;
		} else if (yi == -1) {
			i = xi;
		} else {
			i = Math.min(xi, yi);
		}

		x += (dx * i) + (dx * i * 0.001); //TODO figure out a better way than overshooting to a lower coordinate
		y += (dy * i) + (dy * i * 0.001);

		iteration--;

		if (!path) {
			path = [[Math.floor(x), Math.floor(y)]];
		} else {
			path.push([Math.floor(x), Math.floor(y)]);
		}

		if (iteration > 0) {
			return findNextPixels(x, y, angle, iteration, path);
		} else {
			return path;
		}
	}

	function traverseMap(x, y, angleStart, angleEnd, heightMap, visitedPixels, length, stepLength) {
		let minWeight = -1;
		let minPixels = [x, y];
		let minAngle = -1;
		visitedPixels[(y * width) + x] = 1;
		
		for (let alpha = angleStart; alpha < angleEnd; alpha += (angleEnd - angleStart) / 16) {
			let pixelPath = findNextPixels(Math.floor(x) + 0.5, Math.floor(y) + 0.5, alpha, stepLength);
			let pathTotalHeight = 0;
			let intersectsWithVisited = 0;

			for (let i = 0; i < stepLength; i++) {
				let xt = pixelPath[i][0];
				let yt = pixelPath[i][1];
				let indext = (yt * width) + xt;
				if (xt < 0 || yt < 0 || xt > width || yt > height) {
					pathTotalHeight += (stepLength - i);
					break;
				} else {
					pathTotalHeight += heightMap[indext];
					if (visitedPixels[indext] == 1) intersectsWithVisited++;
				}
			}

			let weight = (pathTotalHeight * 0.5) + (intersectsWithVisited * 0.5);

			if (weight < minWeight || minWeight == -1) {
				minWeight = weight;
				minAngle = alpha;
				minPixels = [pixelPath[0][0], pixelPath[0][1]];
			}
		}

		if (length > 0) {
			return traverseMap(minPixels[0], minPixels[1], minAngle - (Math.PI/4), minAngle + (Math.PI/4), heightMap, visitedPixels, length - 1, stepLength);
		} else {
			return visitedPixels;
		}
	}

	function getColorFromHeight(height, gradient) {
		let gradientIndex = 1;

		while (height > gradient[gradientIndex].pos) {
			gradientIndex++;
		}

		let color1 = gradient[gradientIndex - 1].color;
		let pos1 = gradient[gradientIndex - 1].pos;
		let color2 = gradient[gradientIndex].color;
		let pos2 = gradient[gradientIndex].pos;

		let red = (color1[0] * (1 - (height - pos1)/(pos2 - pos1))) + (color2[0] * (1 - (pos2 - height)/(pos2 - pos1)));
		let green = (color1[1] * (1 - (height - pos1)/(pos2 - pos1))) + (color2[1] * (1 - (pos2 - height)/(pos2 - pos1)));
		let blue = (color1[2] * (1 - (height - pos1)/(pos2 - pos1))) + (color2[2] * (1 - (pos2 - height)/(pos2 - pos1)));

		return [red, green, blue];
	}

	// Create the image
	function printHeightmap(heightMap, visitedPixels) {
		// Loop over all of the pixels
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				// Get the pixel index
				var pixelIndex = (y * width + x) * 4;
				let height = heightMap[pixelIndex / 4];

				let gradient = [{pos: 0, color: [30,144,255]}, 
												{pos: 0.25, color: [242,209,107]}, 
												{pos: 0.35, color: [76,186,23]}, 
												{pos: 0.7, color: [100,100,100]}, 
												{pos: 0.9, color: [255,255,255]}, 
												{pos: 1, color: [255,255,255]}];

				if (visitedPixels[pixelIndex / 4] == 1) {
					green = 255;
					red = 0;
					blue = 0;
				}

				let color = getColorFromHeight(height, gradient);

				// Set the pixel data
				imagedata.data[pixelIndex] = color[0];     // Red
				imagedata.data[pixelIndex+1] = color[1]; // Green
				imagedata.data[pixelIndex+2] = color[2];  // Blue
				imagedata.data[pixelIndex+3] = 255;   // Alpha
			}
		}
	}

	// Main loop
	function main(tframe) {
			// Request animation frames
			//window.requestAnimationFrame(main);

			// Create the image
			let heightMap = generateNoise();
			//let visitedPixels = traverseMap(width/2, height/2, 0, Math.PI * 2, heightMap, Array(width * height).fill(0), 1, 15);
			let visitedPixels = Array(width * height).fill(0);
			printHeightmap(heightMap, visitedPixels);

			// Draw the image data to the canvas
			context.putImageData(imagedata, 0, 0);
	}

	// Call the main loop
	main(0);
};