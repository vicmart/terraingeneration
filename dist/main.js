/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/perlin-noise/index.js":
/*!********************************************!*\
  !*** ./node_modules/perlin-noise/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.generatePerlinNoise = generatePerlinNoise;
exports.generateWhiteNoise = generateWhiteNoise;

function generatePerlinNoise(width, height, options) {
  options = options || {};
  var octaveCount = options.octaveCount || 4;
  var amplitude = options.amplitude || 0.1;
  var persistence = options.persistence || 0.2;
  var whiteNoise = generateWhiteNoise(width, height);

  var smoothNoiseList = new Array(octaveCount);
  var i;
  for (i = 0; i < octaveCount; ++i) {
    smoothNoiseList[i] = generateSmoothNoise(i);
  }
  var perlinNoise = new Array(width * height);
  var totalAmplitude = 0;
  // blend noise together
  for (i = octaveCount - 1; i >= 0; --i) {
    amplitude *= persistence;
    totalAmplitude += amplitude;

    for (var j = 0; j < perlinNoise.length; ++j) {
      perlinNoise[j] = perlinNoise[j] || 0;
      perlinNoise[j] += smoothNoiseList[i][j] * amplitude;
    }
  }
  // normalization
  for (i = 0; i < perlinNoise.length; ++i) {
      perlinNoise[i] /= totalAmplitude;
  }

  return perlinNoise;

  function generateSmoothNoise(octave) {
    var noise = new Array(width * height);
    var samplePeriod = Math.pow(2, octave);
    var sampleFrequency = 1 / samplePeriod;
    var noiseIndex = 0;
    for (var y = 0; y < height; ++y) {
      var sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
      var sampleY1 = (sampleY0 + samplePeriod) % height;
      var vertBlend = (y - sampleY0) * sampleFrequency;
      for (var x = 0; x < width; ++x) {
        var sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
        var sampleX1 = (sampleX0 + samplePeriod) % width;
        var horizBlend = (x - sampleX0) * sampleFrequency;

        // blend top two corners
        var top = interpolate(whiteNoise[sampleY0 * width + sampleX0], whiteNoise[sampleY1 * width + sampleX0], vertBlend);
        // blend bottom two corners
        var bottom = interpolate(whiteNoise[sampleY0 * width + sampleX1], whiteNoise[sampleY1 * width + sampleX1], vertBlend);
        // final blend
        noise[noiseIndex] = interpolate(top, bottom, horizBlend);
        noiseIndex += 1;
      }
    }
    return noise;
  }
}
function generateWhiteNoise(width, height) {
  var noise = new Array(width * height);
  for (var i = 0; i < noise.length; ++i) {
    noise[i] = Math.random();
  }
  return noise;
}
function interpolate(x0, x1, alpha) {
  return x0 * (1 - alpha) + alpha * x1;
}


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var perlin_noise__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! perlin-noise */ "./node_modules/perlin-noise/index.js");
/* harmony import */ var perlin_noise__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(perlin_noise__WEBPACK_IMPORTED_MODULE_0__);


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
		let heightMap = perlin_noise__WEBPACK_IMPORTED_MODULE_0___default.a.generatePerlinNoise(width, height, {octaveCount: 6, persistence: 0.3});
		// Normalize for distance from center
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				let distanceFromCenter = 0.25 - Math.sqrt(Math.pow((width/2) - x, 2) + Math.pow((height/2) - y, 2)) / (Math.min(height/2, width/2));
				heightMap[(y * width) + x] = Math.max(0, Math.min(1, heightMap[(y * width) + x] + distanceFromCenter));
			}
		}

		let newHeightMap = Array(width * height).fill(0);

		// Blur
		let range = 20;
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				let totalHeight = 0;
				let count = 0;

				for (let xi = Math.max(0, x - range); xi < Math.min(width, 1 + x + range); xi++) {
					for (let yi = Math.max(0, y - range); yi < Math.min(height, 1 + y + range); yi++) {
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

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Blcmxpbi1ub2lzZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLGlCQUFpQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLFFBQVE7QUFDbkM7QUFDQTs7QUFFQSxtQkFBbUIsd0JBQXdCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLHdCQUF3QjtBQUNyQztBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsWUFBWTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsV0FBVztBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixrQkFBa0I7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNyRUE7QUFBQTtBQUFBO0FBQWtDOztBQUVsQztBQUNBO0FBQ0E7QUFDQSxrRDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBa0IsbURBQU0scUNBQXFDLGlDQUFpQztBQUM5RjtBQUNBLGlCQUFpQixXQUFXO0FBQzVCLGtCQUFrQixZQUFZO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxpQkFBaUIsV0FBVztBQUM1QixrQkFBa0IsWUFBWTtBQUM5QjtBQUNBOztBQUVBLHlDQUF5QyxxQ0FBcUM7QUFDOUUsMENBQTBDLHNDQUFzQztBQUNoRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBLG1DQUFtQztBQUNuQzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4QkFBOEIsa0JBQWtCO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0IsZ0JBQWdCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFdBQVc7QUFDNUIsa0JBQWtCLFlBQVk7QUFDOUI7QUFDQTtBQUNBOztBQUVBLHFCQUFxQiw0QkFBNEI7QUFDakQsYUFBYSxnQ0FBZ0M7QUFDN0MsYUFBYSw4QkFBOEI7QUFDM0MsYUFBYSwrQkFBK0I7QUFDNUMsYUFBYSwrQkFBK0I7QUFDNUMsYUFBYSw2QkFBNkI7O0FBRTFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSwwQ0FBMEM7QUFDMUMsNENBQTRDO0FBQzVDLDRDQUE0QztBQUM1Qyx1Q0FBdUM7QUFDdkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImV4cG9ydHMuZ2VuZXJhdGVQZXJsaW5Ob2lzZSA9IGdlbmVyYXRlUGVybGluTm9pc2U7XG5leHBvcnRzLmdlbmVyYXRlV2hpdGVOb2lzZSA9IGdlbmVyYXRlV2hpdGVOb2lzZTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVQZXJsaW5Ob2lzZSh3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgb2N0YXZlQ291bnQgPSBvcHRpb25zLm9jdGF2ZUNvdW50IHx8IDQ7XG4gIHZhciBhbXBsaXR1ZGUgPSBvcHRpb25zLmFtcGxpdHVkZSB8fCAwLjE7XG4gIHZhciBwZXJzaXN0ZW5jZSA9IG9wdGlvbnMucGVyc2lzdGVuY2UgfHwgMC4yO1xuICB2YXIgd2hpdGVOb2lzZSA9IGdlbmVyYXRlV2hpdGVOb2lzZSh3aWR0aCwgaGVpZ2h0KTtcblxuICB2YXIgc21vb3RoTm9pc2VMaXN0ID0gbmV3IEFycmF5KG9jdGF2ZUNvdW50KTtcbiAgdmFyIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBvY3RhdmVDb3VudDsgKytpKSB7XG4gICAgc21vb3RoTm9pc2VMaXN0W2ldID0gZ2VuZXJhdGVTbW9vdGhOb2lzZShpKTtcbiAgfVxuICB2YXIgcGVybGluTm9pc2UgPSBuZXcgQXJyYXkod2lkdGggKiBoZWlnaHQpO1xuICB2YXIgdG90YWxBbXBsaXR1ZGUgPSAwO1xuICAvLyBibGVuZCBub2lzZSB0b2dldGhlclxuICBmb3IgKGkgPSBvY3RhdmVDb3VudCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgYW1wbGl0dWRlICo9IHBlcnNpc3RlbmNlO1xuICAgIHRvdGFsQW1wbGl0dWRlICs9IGFtcGxpdHVkZTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGVybGluTm9pc2UubGVuZ3RoOyArK2opIHtcbiAgICAgIHBlcmxpbk5vaXNlW2pdID0gcGVybGluTm9pc2Vbal0gfHwgMDtcbiAgICAgIHBlcmxpbk5vaXNlW2pdICs9IHNtb290aE5vaXNlTGlzdFtpXVtqXSAqIGFtcGxpdHVkZTtcbiAgICB9XG4gIH1cbiAgLy8gbm9ybWFsaXphdGlvblxuICBmb3IgKGkgPSAwOyBpIDwgcGVybGluTm9pc2UubGVuZ3RoOyArK2kpIHtcbiAgICAgIHBlcmxpbk5vaXNlW2ldIC89IHRvdGFsQW1wbGl0dWRlO1xuICB9XG5cbiAgcmV0dXJuIHBlcmxpbk5vaXNlO1xuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlU21vb3RoTm9pc2Uob2N0YXZlKSB7XG4gICAgdmFyIG5vaXNlID0gbmV3IEFycmF5KHdpZHRoICogaGVpZ2h0KTtcbiAgICB2YXIgc2FtcGxlUGVyaW9kID0gTWF0aC5wb3coMiwgb2N0YXZlKTtcbiAgICB2YXIgc2FtcGxlRnJlcXVlbmN5ID0gMSAvIHNhbXBsZVBlcmlvZDtcbiAgICB2YXIgbm9pc2VJbmRleCA9IDA7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7ICsreSkge1xuICAgICAgdmFyIHNhbXBsZVkwID0gTWF0aC5mbG9vcih5IC8gc2FtcGxlUGVyaW9kKSAqIHNhbXBsZVBlcmlvZDtcbiAgICAgIHZhciBzYW1wbGVZMSA9IChzYW1wbGVZMCArIHNhbXBsZVBlcmlvZCkgJSBoZWlnaHQ7XG4gICAgICB2YXIgdmVydEJsZW5kID0gKHkgLSBzYW1wbGVZMCkgKiBzYW1wbGVGcmVxdWVuY3k7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyArK3gpIHtcbiAgICAgICAgdmFyIHNhbXBsZVgwID0gTWF0aC5mbG9vcih4IC8gc2FtcGxlUGVyaW9kKSAqIHNhbXBsZVBlcmlvZDtcbiAgICAgICAgdmFyIHNhbXBsZVgxID0gKHNhbXBsZVgwICsgc2FtcGxlUGVyaW9kKSAlIHdpZHRoO1xuICAgICAgICB2YXIgaG9yaXpCbGVuZCA9ICh4IC0gc2FtcGxlWDApICogc2FtcGxlRnJlcXVlbmN5O1xuXG4gICAgICAgIC8vIGJsZW5kIHRvcCB0d28gY29ybmVyc1xuICAgICAgICB2YXIgdG9wID0gaW50ZXJwb2xhdGUod2hpdGVOb2lzZVtzYW1wbGVZMCAqIHdpZHRoICsgc2FtcGxlWDBdLCB3aGl0ZU5vaXNlW3NhbXBsZVkxICogd2lkdGggKyBzYW1wbGVYMF0sIHZlcnRCbGVuZCk7XG4gICAgICAgIC8vIGJsZW5kIGJvdHRvbSB0d28gY29ybmVyc1xuICAgICAgICB2YXIgYm90dG9tID0gaW50ZXJwb2xhdGUod2hpdGVOb2lzZVtzYW1wbGVZMCAqIHdpZHRoICsgc2FtcGxlWDFdLCB3aGl0ZU5vaXNlW3NhbXBsZVkxICogd2lkdGggKyBzYW1wbGVYMV0sIHZlcnRCbGVuZCk7XG4gICAgICAgIC8vIGZpbmFsIGJsZW5kXG4gICAgICAgIG5vaXNlW25vaXNlSW5kZXhdID0gaW50ZXJwb2xhdGUodG9wLCBib3R0b20sIGhvcml6QmxlbmQpO1xuICAgICAgICBub2lzZUluZGV4ICs9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2lzZTtcbiAgfVxufVxuZnVuY3Rpb24gZ2VuZXJhdGVXaGl0ZU5vaXNlKHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIG5vaXNlID0gbmV3IEFycmF5KHdpZHRoICogaGVpZ2h0KTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2lzZS5sZW5ndGg7ICsraSkge1xuICAgIG5vaXNlW2ldID0gTWF0aC5yYW5kb20oKTtcbiAgfVxuICByZXR1cm4gbm9pc2U7XG59XG5mdW5jdGlvbiBpbnRlcnBvbGF0ZSh4MCwgeDEsIGFscGhhKSB7XG4gIHJldHVybiB4MCAqICgxIC0gYWxwaGEpICsgYWxwaGEgKiB4MTtcbn1cbiIsImltcG9ydCBwZXJsaW4gZnJvbSAncGVybGluLW5vaXNlJztcblxuLy8gVGhlIGZ1bmN0aW9uIGdldHMgY2FsbGVkIHdoZW4gdGhlIHdpbmRvdyBpcyBmdWxseSBsb2FkZWRcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0Ly8gR2V0IHRoZSBjYW52YXMgYW5kIGNvbnRleHRcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlld3BvcnRcIik7IFxuXHR2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cblx0Y2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cblx0Ly8gRGVmaW5lIHRoZSBpbWFnZSBkaW1lbnNpb25zXG5cdHZhciB3aWR0aCA9IGNhbnZhcy53aWR0aDtcblx0dmFyIGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG5cblx0Ly8gQ3JlYXRlIGFuIEltYWdlRGF0YSBvYmplY3Rcblx0dmFyIGltYWdlZGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuXG5cdGZ1bmN0aW9uIGdlbmVyYXRlTm9pc2UoKSB7XG5cdFx0bGV0IGhlaWdodE1hcCA9IHBlcmxpbi5nZW5lcmF0ZVBlcmxpbk5vaXNlKHdpZHRoLCBoZWlnaHQsIHtvY3RhdmVDb3VudDogNiwgcGVyc2lzdGVuY2U6IDAuM30pO1xuXHRcdC8vIE5vcm1hbGl6ZSBmb3IgZGlzdGFuY2UgZnJvbSBjZW50ZXJcblx0XHRmb3IgKGxldCB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcblx0XHRcdGZvciAobGV0IHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcblx0XHRcdFx0bGV0IGRpc3RhbmNlRnJvbUNlbnRlciA9IDAuMjUgLSBNYXRoLnNxcnQoTWF0aC5wb3coKHdpZHRoLzIpIC0geCwgMikgKyBNYXRoLnBvdygoaGVpZ2h0LzIpIC0geSwgMikpIC8gKE1hdGgubWluKGhlaWdodC8yLCB3aWR0aC8yKSk7XG5cdFx0XHRcdGhlaWdodE1hcFsoeSAqIHdpZHRoKSArIHhdID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgaGVpZ2h0TWFwWyh5ICogd2lkdGgpICsgeF0gKyBkaXN0YW5jZUZyb21DZW50ZXIpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgbmV3SGVpZ2h0TWFwID0gQXJyYXkod2lkdGggKiBoZWlnaHQpLmZpbGwoMCk7XG5cblx0XHQvLyBCbHVyXG5cdFx0bGV0IHJhbmdlID0gMjA7XG5cdFx0Zm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG5cdFx0XHRmb3IgKGxldCB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG5cdFx0XHRcdGxldCB0b3RhbEhlaWdodCA9IDA7XG5cdFx0XHRcdGxldCBjb3VudCA9IDA7XG5cblx0XHRcdFx0Zm9yIChsZXQgeGkgPSBNYXRoLm1heCgwLCB4IC0gcmFuZ2UpOyB4aSA8IE1hdGgubWluKHdpZHRoLCAxICsgeCArIHJhbmdlKTsgeGkrKykge1xuXHRcdFx0XHRcdGZvciAobGV0IHlpID0gTWF0aC5tYXgoMCwgeSAtIHJhbmdlKTsgeWkgPCBNYXRoLm1pbihoZWlnaHQsIDEgKyB5ICsgcmFuZ2UpOyB5aSsrKSB7XG5cdFx0XHRcdFx0XHR0b3RhbEhlaWdodCArPSBoZWlnaHRNYXBbKHlpICogd2lkdGgpICsgeGldO1xuXHRcdFx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRuZXdIZWlnaHRNYXBbKHkgKiB3aWR0aCkgKyB4XSA9IHRvdGFsSGVpZ2h0IC8gY291bnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBuZXdIZWlnaHRNYXA7XG5cdH1cblxuXHRmdW5jdGlvbiBmaW5kTmV4dFBpeGVscyh4LCB5LCBhbmdsZSwgaXRlcmF0aW9uLCBwYXRoKSB7XG5cdFx0bGV0IHBpID0gTWF0aC5QSTtcblxuXHRcdHdoaWxlKGFuZ2xlID4gcGkgKiAyKSB7XG5cdFx0XHRhbmdsZSAtPSBwaSAqIDI7XG5cdFx0fVxuXG5cdFx0d2hpbGUgKGFuZ2xlIDwgMCkge1xuXHRcdFx0YW5nbGUgKz0gcGkgKiAyO1xuXHRcdH1cblxuXHRcdGxldCBkeCA9IE1hdGguY29zKGFuZ2xlKTtcblx0XHRsZXQgZHkgPSBNYXRoLnNpbihhbmdsZSk7XG5cblx0XHRsZXQgeGksIHlpLCBpO1xuXG5cdFx0aWYgKGFuZ2xlID09PSBwaSAvIDIgfHwgYW5nbGUgPT0gKDMgKiBwaSAvIDIpKSB7XG5cdFx0XHR4aSA9IC0xO1xuXHRcdH0gZWxzZSBpZiAoYW5nbGUgPCBwaSAvIDIgfHwgYW5nbGUgPiAoMyAqIHBpIC8gMikpIHtcblx0XHRcdHhpID0gKE1hdGguZmxvb3IoeCkgKyAxIC0geCkgLyBkeDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0eGkgPSAoTWF0aC5mbG9vcih4KSAtIHgpIC8gZHg7XG5cdFx0fVxuXG5cdFx0aWYgKGFuZ2xlID09PSAwIHx8IGFuZ2xlID09PSBwaSkge1xuXHRcdFx0eWkgPSAtMTtcblx0XHR9IGVsc2UgaWYgKGFuZ2xlIDwgcGkpIHtcblx0XHRcdHlpID0gKE1hdGguZmxvb3IoeSkgKyAxIC0geSkgLyBkeTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0eWkgPSAoTWF0aC5mbG9vcih5KSAtIHkpIC8gZHk7XG5cdFx0fVxuXG5cdFx0aWYgKHhpID09IC0xKSB7XG5cdFx0XHRpID0geWk7XG5cdFx0fSBlbHNlIGlmICh5aSA9PSAtMSkge1xuXHRcdFx0aSA9IHhpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpID0gTWF0aC5taW4oeGksIHlpKTtcblx0XHR9XG5cblx0XHR4ICs9IChkeCAqIGkpICsgKGR4ICogaSAqIDAuMDAxKTsgLy9UT0RPIGZpZ3VyZSBvdXQgYSBiZXR0ZXIgd2F5IHRoYW4gb3ZlcnNob290aW5nIHRvIGEgbG93ZXIgY29vcmRpbmF0ZVxuXHRcdHkgKz0gKGR5ICogaSkgKyAoZHkgKiBpICogMC4wMDEpO1xuXG5cdFx0aXRlcmF0aW9uLS07XG5cblx0XHRpZiAoIXBhdGgpIHtcblx0XHRcdHBhdGggPSBbW01hdGguZmxvb3IoeCksIE1hdGguZmxvb3IoeSldXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGF0aC5wdXNoKFtNYXRoLmZsb29yKHgpLCBNYXRoLmZsb29yKHkpXSk7XG5cdFx0fVxuXG5cdFx0aWYgKGl0ZXJhdGlvbiA+IDApIHtcblx0XHRcdHJldHVybiBmaW5kTmV4dFBpeGVscyh4LCB5LCBhbmdsZSwgaXRlcmF0aW9uLCBwYXRoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHBhdGg7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gdHJhdmVyc2VNYXAoeCwgeSwgYW5nbGVTdGFydCwgYW5nbGVFbmQsIGhlaWdodE1hcCwgdmlzaXRlZFBpeGVscywgbGVuZ3RoLCBzdGVwTGVuZ3RoKSB7XG5cdFx0bGV0IG1pbldlaWdodCA9IC0xO1xuXHRcdGxldCBtaW5QaXhlbHMgPSBbeCwgeV07XG5cdFx0bGV0IG1pbkFuZ2xlID0gLTE7XG5cdFx0dmlzaXRlZFBpeGVsc1soeSAqIHdpZHRoKSArIHhdID0gMTtcblx0XHRcblx0XHRmb3IgKGxldCBhbHBoYSA9IGFuZ2xlU3RhcnQ7IGFscGhhIDwgYW5nbGVFbmQ7IGFscGhhICs9IChhbmdsZUVuZCAtIGFuZ2xlU3RhcnQpIC8gMTYpIHtcblx0XHRcdGxldCBwaXhlbFBhdGggPSBmaW5kTmV4dFBpeGVscyhNYXRoLmZsb29yKHgpICsgMC41LCBNYXRoLmZsb29yKHkpICsgMC41LCBhbHBoYSwgc3RlcExlbmd0aCk7XG5cdFx0XHRsZXQgcGF0aFRvdGFsSGVpZ2h0ID0gMDtcblx0XHRcdGxldCBpbnRlcnNlY3RzV2l0aFZpc2l0ZWQgPSAwO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHN0ZXBMZW5ndGg7IGkrKykge1xuXHRcdFx0XHRsZXQgeHQgPSBwaXhlbFBhdGhbaV1bMF07XG5cdFx0XHRcdGxldCB5dCA9IHBpeGVsUGF0aFtpXVsxXTtcblx0XHRcdFx0bGV0IGluZGV4dCA9ICh5dCAqIHdpZHRoKSArIHh0O1xuXHRcdFx0XHRpZiAoeHQgPCAwIHx8IHl0IDwgMCB8fCB4dCA+IHdpZHRoIHx8IHl0ID4gaGVpZ2h0KSB7XG5cdFx0XHRcdFx0cGF0aFRvdGFsSGVpZ2h0ICs9IChzdGVwTGVuZ3RoIC0gaSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGF0aFRvdGFsSGVpZ2h0ICs9IGhlaWdodE1hcFtpbmRleHRdO1xuXHRcdFx0XHRcdGlmICh2aXNpdGVkUGl4ZWxzW2luZGV4dF0gPT0gMSkgaW50ZXJzZWN0c1dpdGhWaXNpdGVkKys7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IHdlaWdodCA9IChwYXRoVG90YWxIZWlnaHQgKiAwLjUpICsgKGludGVyc2VjdHNXaXRoVmlzaXRlZCAqIDAuNSk7XG5cblx0XHRcdGlmICh3ZWlnaHQgPCBtaW5XZWlnaHQgfHwgbWluV2VpZ2h0ID09IC0xKSB7XG5cdFx0XHRcdG1pbldlaWdodCA9IHdlaWdodDtcblx0XHRcdFx0bWluQW5nbGUgPSBhbHBoYTtcblx0XHRcdFx0bWluUGl4ZWxzID0gW3BpeGVsUGF0aFswXVswXSwgcGl4ZWxQYXRoWzBdWzFdXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIHRyYXZlcnNlTWFwKG1pblBpeGVsc1swXSwgbWluUGl4ZWxzWzFdLCBtaW5BbmdsZSAtIChNYXRoLlBJLzQpLCBtaW5BbmdsZSArIChNYXRoLlBJLzQpLCBoZWlnaHRNYXAsIHZpc2l0ZWRQaXhlbHMsIGxlbmd0aCAtIDEsIHN0ZXBMZW5ndGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdmlzaXRlZFBpeGVscztcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRDb2xvckZyb21IZWlnaHQoaGVpZ2h0LCBncmFkaWVudCkge1xuXHRcdGxldCBncmFkaWVudEluZGV4ID0gMTtcblxuXHRcdHdoaWxlIChoZWlnaHQgPiBncmFkaWVudFtncmFkaWVudEluZGV4XS5wb3MpIHtcblx0XHRcdGdyYWRpZW50SW5kZXgrKztcblx0XHR9XG5cblx0XHRsZXQgY29sb3IxID0gZ3JhZGllbnRbZ3JhZGllbnRJbmRleCAtIDFdLmNvbG9yO1xuXHRcdGxldCBwb3MxID0gZ3JhZGllbnRbZ3JhZGllbnRJbmRleCAtIDFdLnBvcztcblx0XHRsZXQgY29sb3IyID0gZ3JhZGllbnRbZ3JhZGllbnRJbmRleF0uY29sb3I7XG5cdFx0bGV0IHBvczIgPSBncmFkaWVudFtncmFkaWVudEluZGV4XS5wb3M7XG5cblx0XHRsZXQgcmVkID0gKGNvbG9yMVswXSAqICgxIC0gKGhlaWdodCAtIHBvczEpLyhwb3MyIC0gcG9zMSkpKSArIChjb2xvcjJbMF0gKiAoMSAtIChwb3MyIC0gaGVpZ2h0KS8ocG9zMiAtIHBvczEpKSk7XG5cdFx0bGV0IGdyZWVuID0gKGNvbG9yMVsxXSAqICgxIC0gKGhlaWdodCAtIHBvczEpLyhwb3MyIC0gcG9zMSkpKSArIChjb2xvcjJbMV0gKiAoMSAtIChwb3MyIC0gaGVpZ2h0KS8ocG9zMiAtIHBvczEpKSk7XG5cdFx0bGV0IGJsdWUgPSAoY29sb3IxWzJdICogKDEgLSAoaGVpZ2h0IC0gcG9zMSkvKHBvczIgLSBwb3MxKSkpICsgKGNvbG9yMlsyXSAqICgxIC0gKHBvczIgLSBoZWlnaHQpLyhwb3MyIC0gcG9zMSkpKTtcblxuXHRcdHJldHVybiBbcmVkLCBncmVlbiwgYmx1ZV07XG5cdH1cblxuXHQvLyBDcmVhdGUgdGhlIGltYWdlXG5cdGZ1bmN0aW9uIHByaW50SGVpZ2h0bWFwKGhlaWdodE1hcCwgdmlzaXRlZFBpeGVscykge1xuXHRcdC8vIExvb3Agb3ZlciBhbGwgb2YgdGhlIHBpeGVsc1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuXHRcdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuXHRcdFx0XHQvLyBHZXQgdGhlIHBpeGVsIGluZGV4XG5cdFx0XHRcdHZhciBwaXhlbEluZGV4ID0gKHkgKiB3aWR0aCArIHgpICogNDtcblx0XHRcdFx0bGV0IGhlaWdodCA9IGhlaWdodE1hcFtwaXhlbEluZGV4IC8gNF07XG5cblx0XHRcdFx0bGV0IGdyYWRpZW50ID0gW3twb3M6IDAsIGNvbG9yOiBbMzAsMTQ0LDI1NV19LCBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtwb3M6IDAuMjUsIGNvbG9yOiBbMjQyLDIwOSwxMDddfSwgXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7cG9zOiAwLjM1LCBjb2xvcjogWzc2LDE4NiwyM119LCBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtwb3M6IDAuNywgY29sb3I6IFsxMDAsMTAwLDEwMF19LCBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtwb3M6IDAuOSwgY29sb3I6IFsyNTUsMjU1LDI1NV19LCBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtwb3M6IDEsIGNvbG9yOiBbMjU1LDI1NSwyNTVdfV07XG5cblx0XHRcdFx0aWYgKHZpc2l0ZWRQaXhlbHNbcGl4ZWxJbmRleCAvIDRdID09IDEpIHtcblx0XHRcdFx0XHRncmVlbiA9IDI1NTtcblx0XHRcdFx0XHRyZWQgPSAwO1xuXHRcdFx0XHRcdGJsdWUgPSAwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGNvbG9yID0gZ2V0Q29sb3JGcm9tSGVpZ2h0KGhlaWdodCwgZ3JhZGllbnQpO1xuXG5cdFx0XHRcdC8vIFNldCB0aGUgcGl4ZWwgZGF0YVxuXHRcdFx0XHRpbWFnZWRhdGEuZGF0YVtwaXhlbEluZGV4XSA9IGNvbG9yWzBdOyAgICAgLy8gUmVkXG5cdFx0XHRcdGltYWdlZGF0YS5kYXRhW3BpeGVsSW5kZXgrMV0gPSBjb2xvclsxXTsgLy8gR3JlZW5cblx0XHRcdFx0aW1hZ2VkYXRhLmRhdGFbcGl4ZWxJbmRleCsyXSA9IGNvbG9yWzJdOyAgLy8gQmx1ZVxuXHRcdFx0XHRpbWFnZWRhdGEuZGF0YVtwaXhlbEluZGV4KzNdID0gMjU1OyAgIC8vIEFscGhhXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gTWFpbiBsb29wXG5cdGZ1bmN0aW9uIG1haW4odGZyYW1lKSB7XG5cdFx0XHQvLyBSZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZXNcblx0XHRcdC8vd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtYWluKTtcblxuXHRcdFx0Ly8gQ3JlYXRlIHRoZSBpbWFnZVxuXHRcdFx0bGV0IGhlaWdodE1hcCA9IGdlbmVyYXRlTm9pc2UoKTtcblx0XHRcdC8vbGV0IHZpc2l0ZWRQaXhlbHMgPSB0cmF2ZXJzZU1hcCh3aWR0aC8yLCBoZWlnaHQvMiwgMCwgTWF0aC5QSSAqIDIsIGhlaWdodE1hcCwgQXJyYXkod2lkdGggKiBoZWlnaHQpLmZpbGwoMCksIDEsIDE1KTtcblx0XHRcdGxldCB2aXNpdGVkUGl4ZWxzID0gQXJyYXkod2lkdGggKiBoZWlnaHQpLmZpbGwoMCk7XG5cdFx0XHRwcmludEhlaWdodG1hcChoZWlnaHRNYXAsIHZpc2l0ZWRQaXhlbHMpO1xuXG5cdFx0XHQvLyBEcmF3IHRoZSBpbWFnZSBkYXRhIHRvIHRoZSBjYW52YXNcblx0XHRcdGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlZGF0YSwgMCwgMCk7XG5cdH1cblxuXHQvLyBDYWxsIHRoZSBtYWluIGxvb3Bcblx0bWFpbigwKTtcbn07Il0sInNvdXJjZVJvb3QiOiIifQ==