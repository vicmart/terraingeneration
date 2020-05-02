export default class PathFinding {
  constructor(width, height, startingX, startingY) {
    this.width = width;
    this.height = height;

    this.init(startingX, startingY);
  }

  init(startingX, startingY) {
    return this.traverseMap(startingX, startingY, 0, Math.PI * 2, heightMap, Array(this.width * this.height).fill(0), 1, 15);
  }

  static findNextPixels(x, y, angle, iteration, path) {
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
    
    console.log(angle);

		x += (dx * i) + 0.001; //(dx * i + 0.001); //TODO figure out a better way than overshooting to a lower coordinate
		y += (dy * i) + 0.001; //(dy * i + 0.001);

		iteration--;

		if (!path) {
			path = [[Math.floor(x), Math.floor(y)]];
		} else {
			path.push([Math.floor(x), Math.floor(y)]);
		}

		if (iteration > 0) {
			return this.findNextPixels(x, y, angle, iteration, path);
		} else {
			return path;
		}
	}

	traverseMap(x, y, angleStart, angleEnd, heightMap, visitedPixels, length, stepLength) {
		let minWeight = -1;
		let minPixels = [x, y];
		let minAngle = -1;
		visitedPixels[(y * this.width) + x] = 1;
		
		for (let alpha = angleStart; alpha < angleEnd; alpha += (angleEnd - angleStart) / 16) {
			let pixelPath = this.findNextPixels(Math.floor(x) + 0.5, Math.floor(y) + 0.5, alpha, stepLength);
			let pathTotalHeight = 0;
			let intersectsWithVisited = 0;

			for (let i = 0; i < stepLength; i++) {
				let xt = pixelPath[i][0];
				let yt = pixelPath[i][1];
				let indext = (yt * this.width) + xt;
				if (xt < 0 || yt < 0 || xt > this.width || yt > this.height) {
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
			return this.traverseMap(minPixels[0], minPixels[1], minAngle - (Math.PI/4), minAngle + (Math.PI/4), heightMap, visitedPixels, length - 1, stepLength);
		} else {
			return visitedPixels;
		}
	}
}