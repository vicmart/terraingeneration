import * as THREE from 'three';
import MapGeneration from "./mapgeneration.js";
import Stats from "stats.js";

export default class DrawThree {
  constructor(drawTwo) {
    this.drawTwo = drawTwo;

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.seaLevel = 0.15;
    this.keyDowns = [];
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x87ceeb );
    const color = 0x87ceeb;  // white
    const near = 50;
    const far = 300;
    this.scene.fog = new THREE.Fog(color, near, far);
    this.camera = new THREE.PerspectiveCamera( 60, this.windowWidth/this.windowHeight, 0.1, 300 );
    this.camera.position.z = window.innerHeight/3;
    this.camera.position.x = 0;
    this.camera.position.y = 15;
    this.drawTwo.updatePlayer(parseInt(this.camera.position.x), parseInt(this.camera.position.z));

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize( this.windowWidth, this.windowHeight );
    document.body.appendChild( this.renderer.domElement );

    this.startTime = Date.now();
    this.addLights();

    this.stats = new Stats();
    this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( this.stats.dom );

    document.addEventListener('keydown', (e) => { this.onDocumentKeyPressDown(e) });
    document.addEventListener('keyup', (e) => { this.onDocumentKeyPressUp(e) });
  }

  addLights() {
    this.sun = new THREE.PointLight( 0xffffe0, 1, 0 );
    this.sun.position.set( 0, 1000, 0 );
    this.scene.add(this.sun);

    let ambientLight = new THREE.AmbientLight( 0x404040, 0.5 );
    this.scene.add(ambientLight);
  }

  renderMap(heightMap, width, height, amplitude, scale) {
    let input = new Array(width);

    for (let i = 0; i < width; i++) {
      input[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        input[i][j] = heightMap[(j * width) + i];
      }
    }

    this.mapScale = scale;
    this.drawTwo.updatePlayer(parseInt(this.camera.position.x / this.mapScale), parseInt(this.camera.position.z / this.mapScale));

    let landGeometry = new THREE.BufferGeometry();
    let [vertices, colors] = this.geometryFromVerticies(input, amplitude, new THREE.Vector3(0, 0, 0), this.mapScale);

    landGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    landGeometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    landGeometry.computeVertexNormals();

    let material = new THREE.MeshLambertMaterial( { vertexColors: true } );
    let mesh = new THREE.Mesh( landGeometry, material );
    this.scene.add( mesh );

    /**let seaGeometry = new THREE.BufferGeometry();
    let [seaVertices, seaColors] = this.seaGeometryFromVerticies(input, amplitude, new THREE.Vector3(0, 0, 0));

    seaGeometry.setAttribute( 'position', new THREE.BufferAttribute( seaVertices, 3 ) );
    seaGeometry.setAttribute( 'color', new THREE.BufferAttribute( seaColors, 3 ) );
    seaGeometry.computeVertexNormals();
    seaGeometry.dynamic = true;

    let seaMesh = new THREE.Mesh( seaGeometry, material );
    this.scene.add( seaMesh );**/

    window.requestAnimationFrame(() => {this.animate()});
  }

  animateSea() {    
    //let verticies = this.customGeometry.attributes.position.array;

    //requestAnimationFrame(() => { this.animateSeaCall = false; this.animate(); });
  }

  animate() {
    //this.customGeometry.attributes.position.needsUpdate = true;
    //this.customGeometry.attributes.color.needsUpdate = true;

    //this.customGeometry.computeVertexNormals();

    this.stats.begin();

    let radians = -1 * (Date.now() - this.startTime) / 10000;
    //Shortened night
    //if (Math.sin(radians) < -0.92 && Math.cos(radians) > 0) this.startTime = Date.now() - ((Math.PI * (11/8)) * -10000);
    this.sun.position.x = Math.cos(radians) * 1000;
    this.sun.position.y = Math.sin(radians) * 1000;
    this.sun.color.setHex(this.getSunColor(Math.sin(radians)));
    this.scene.fog.color.setHex(this.getFogColor(Math.sin(radians)));
    this.scene.background.setHex(this.getBGColor(Math.sin(radians)));

    /**
    let speed = 0.1;

    let lookAtVector = new THREE.Vector3(0,0, -1);
    let lookUpVector = new THREE.Vector3(0,-1, 0);
    lookAtVector.applyQuaternion(this.camera.quaternion);
    lookUpVector.applyQuaternion(this.camera.quaternion);
    let lookSidewaysVector = new THREE.Vector3().crossVectors(lookAtVector, lookUpVector); 

    this.camera.position.x += lookAtVector.x * speed;
    this.camera.position.y += lookAtVector.y * speed;
    this.camera.position.z += lookAtVector.z * speed;

    this.drawTwo.updatePlayer(parseInt(this.camera.position.x), parseInt(this.camera.position.z), lookAtVector.x, lookAtVector.z); */

    this.renderer.render( this.scene, this.camera );

    this.stats.end();

    window.requestAnimationFrame(() => {this.animate()});
  }

  getSunColor(posY) {
    return this.getWeightedColor(posY, '#ffffe0', '#ff9608');
  }

  getFogColor(posY) {
    if (posY > 0) {
      return this.getWeightedColor(posY, '#87ceeb', '#ff9608');
    } else {
      return this.getWeightedColor(posY, '#000000', '#ff9608');
    }
  }

  getBGColor(posY) {
    if (posY > 0) {
      return this.getWeightedColor(posY, '#87ceeb', '#ff9608');
    } else {
      return this.getWeightedColor(posY, '#000000', '#ff9608');
    }
  }

  getWeightedColor(y, colorMax, colorMin) {
    let colorMaxRGB = this.hexToRgb(colorMax);
    let colorMinRGB = this.hexToRgb(colorMin);
    y = Math.abs(y);

    let finalRGB = {
      r: parseInt((y * colorMaxRGB.r) + ((1 - y) * colorMinRGB.r)), 
      g: parseInt((y * colorMaxRGB.g) + ((1 - y) * colorMinRGB.g)), 
      b: parseInt((y * colorMaxRGB.b) + ((1 - y) * colorMinRGB.b))
    }; 

    return this.rgbToHex(finalRGB);
  }

  geometryFromVerticies(matrix, amplitude, offset, scale = 1) {
    let color = new THREE.Color();
    let tempRGB = [];
    let tempDivider = 1;
    let vertices = new Float32Array(matrix.length * matrix[0].length * 18);
    let colors = new Float32Array(matrix.length * matrix[0].length * 18);
    
    for (let y = 0; y < matrix[0].length - 1; y++) {
      for (let x = 0; x < matrix.length - 1; x++) {
        let arrayPosition = (x * 18) + (y * matrix.length * 18);
        //if (!(matrix[x][y] < this.seaLevel && matrix[x + 1][y] < this.seaLevel && matrix[x][y + 1] < this.seaLevel && matrix[x + 1][y + 1] < this.seaLevel)) {
          // Triangle 1
          vertices[arrayPosition + 0] = ((x + 0) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 1] = Math.max(this.seaLevel, matrix[x][y]) * amplitude + offset.y;
          vertices[arrayPosition + 2] = ((y + 0) - (matrix[0].length/2.0) + offset.z) * scale;
    
          vertices[arrayPosition + 3] = ((x + 0) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 4] = Math.max(this.seaLevel, matrix[x][y + 1]) * amplitude + offset.y;
          vertices[arrayPosition + 5] = ((y + 1) - (matrix[0].length/2.0) + offset.z) * scale;
    
          vertices[arrayPosition + 6] = ((x + 1) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 7] = Math.max(this.seaLevel, matrix[x + 1][y + 1]) * amplitude + offset.y;
          vertices[arrayPosition + 8] = ((y + 1) - (matrix[0].length/2.0) + offset.z) * scale;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 0] = color.r;
          colors[arrayPosition + 1] = color.g;
          colors[arrayPosition + 2] = color.b;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 3] = color.r;
          colors[arrayPosition + 4] = color.g;
          colors[arrayPosition + 5] = color.b;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 6] = color.r;
          colors[arrayPosition + 7] = color.g;
          colors[arrayPosition + 8] = color.b;
    
          // Triangle 2
          vertices[arrayPosition + 9] = ((x + 0) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 10] = Math.max(this.seaLevel, matrix[x][y]) * amplitude + offset.y;
          vertices[arrayPosition + 11] = ((y + 0) - (matrix[0].length/2.0) + offset.z) * scale;
    
          vertices[arrayPosition + 12] = ((x + 1) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 13] = Math.max(this.seaLevel, matrix[x + 1][y + 1]) * amplitude + offset.y;
          vertices[arrayPosition + 14] = ((y + 1) - (matrix[0].length/2) + offset.z) * scale;
    
          vertices[arrayPosition + 15] = ((x + 1) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 16] = Math.max(this.seaLevel, matrix[x + 1][y]) * amplitude + offset.y;
          vertices[arrayPosition + 17] = ((y + 0) - (matrix[0].length/2) + offset.z) * scale;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 9] = color.r;
          colors[arrayPosition + 10] = color.g;
          colors[arrayPosition + 11] = color.b;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 12] = color.r;
          colors[arrayPosition + 13] = color.g;
          colors[arrayPosition + 14] = color.b;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 15] = color.r;
          colors[arrayPosition + 16] = color.g;
          colors[arrayPosition + 17] = color.b;
        //}
      }
    }

	  return [vertices, colors];
  }

  seaGeometryFromVerticies(matrix, amplitude, offset) {
    let color = new THREE.Color();
    let tempRGB = [];
    let tempDivider = 1;
    let vertices = new Float32Array(matrix.length * matrix[0].length * 18);
    let colors = new Float32Array(matrix.length * matrix[0].length * 18);
    
    for (let y = 0; y < matrix[0].length - 1; y++) {
      for (let x = 0; x < matrix.length - 1; x++) {
        let arrayPosition = (x * 18) + (y * matrix.length * 18);
        if (matrix[x][y] < this.seaLevel && matrix[x + 1][y] < this.seaLevel && matrix[x][y + 1] < this.seaLevel && matrix[x + 1][y + 1] < this.seaLevel) {
          // Triangle 1
          vertices[arrayPosition + 0] = (x + 0) - (matrix.length/2.0) + 0.5 + offset.x;
          vertices[arrayPosition + 1] = Math.max(this.seaLevel, matrix[x][y]) * amplitude + offset.y;
          vertices[arrayPosition + 2] = (y + 0) - (matrix[0].length/2.0) + offset.z;
    
          vertices[arrayPosition + 3] = (x + 0) - (matrix.length/2.0) + 0.5 + offset.x;
          vertices[arrayPosition + 4] = Math.max(this.seaLevel, matrix[x][y + 1]) * amplitude + offset.y;
          vertices[arrayPosition + 5] = (y + 1) - (matrix[0].length/2.0) + offset.z;
    
          vertices[arrayPosition + 6] = (x + 1) - (matrix.length/2.0) + 0.5 + offset.x;
          vertices[arrayPosition + 7] = Math.max(this.seaLevel, matrix[x + 1][y + 1]) * amplitude + offset.y;
          vertices[arrayPosition + 8] = (y + 1) - (matrix[0].length/2.0) + offset.z;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 0] = color.r;
          colors[arrayPosition + 1] = color.g;
          colors[arrayPosition + 2] = color.b;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 3] = color.r;
          colors[arrayPosition + 4] = color.g;
          colors[arrayPosition + 5] = color.b;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 6] = color.r;
          colors[arrayPosition + 7] = color.g;
          colors[arrayPosition + 8] = color.b;
    
          // Triangle 2
          vertices[arrayPosition + 9] = (x + 0) - (matrix.length/2.0) + 0.5 + offset.x;
          vertices[arrayPosition + 10] = Math.max(this.seaLevel, matrix[x][y]) * amplitude + offset.y;
          vertices[arrayPosition + 11] = (y + 0) - (matrix[0].length/2.0) + offset.z;
    
          vertices[arrayPosition + 12] = (x + 1) - (matrix.length/2.0) + 0.5 + offset.x;
          vertices[arrayPosition + 13] = Math.max(this.seaLevel, matrix[x + 1][y + 1]) * amplitude + offset.y;
          vertices[arrayPosition + 14] = (y + 1) - (matrix[0].length/2) + offset.z;
    
          vertices[arrayPosition + 15] = (x + 1) - (matrix.length/2.0) + 0.5 + offset.x;
          vertices[arrayPosition + 16] = Math.max(this.seaLevel, matrix[x + 1][y]) * amplitude + offset.y;
          vertices[arrayPosition + 17] = (y + 0) - (matrix[0].length/2) + offset.z;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 9] = color.r;
          colors[arrayPosition + 10] = color.g;
          colors[arrayPosition + 11] = color.b;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 12] = color.r;
          colors[arrayPosition + 13] = color.g;
          colors[arrayPosition + 14] = color.b;

          tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 15] = color.r;
          colors[arrayPosition + 16] = color.g;
          colors[arrayPosition + 17] = color.b;
        }
      }
    }

	  return [vertices, colors];
  }

  onDocumentKeyPressDown(event) {
    if (this.keyDowns.indexOf(event.keyCode) == -1) {
      this.keyDowns.push(event.keyCode);
      if (this.keyDowns.length == 1) {
        window.requestAnimationFrame(() => {this.onDocumentKeyPress()});
      }
    }
  }

  onDocumentKeyPressUp(event) {
    this.keyDowns.splice(this.keyDowns.indexOf(event.keyCode), 1);
  }

  onDocumentKeyPress(event) {
    let speed = 0.1;
    let rotationSpeedVertical = 0.01;
    let rotationSpeedHorizontal = 0.02;

    let lookAtVector = new THREE.Vector3(0,0, -1);
    let lookUpVector = new THREE.Vector3(0,-1, 0);
    lookAtVector.applyQuaternion(this.camera.quaternion);
    lookUpVector.applyQuaternion(this.camera.quaternion);
    let lookSidewaysVector = new THREE.Vector3().crossVectors(lookAtVector, lookUpVector); 

    for (let keyCode of this.keyDowns) {
      //A
      if ( keyCode == 65 ) {
        this.camera.position.x += lookSidewaysVector.x * speed;
        this.camera.position.y += lookSidewaysVector.y * speed;
        this.camera.position.z += lookSidewaysVector.z * speed;
      }
      //D
      else if ( keyCode == 68 ) {
        this.camera.position.x -= lookSidewaysVector.x * speed;
        this.camera.position.y -= lookSidewaysVector.y * speed;
        this.camera.position.z -= lookSidewaysVector.z * speed;
      }
      //W
      else if ( keyCode == 87 ) {
        this.camera.position.x += lookAtVector.x * speed;
        this.camera.position.y += lookAtVector.y * speed;
        this.camera.position.z += lookAtVector.z * speed;
      }
      //S
      else if ( keyCode == 83 ) {
        this.camera.position.x -= lookAtVector.x * speed;
        this.camera.position.y -= lookAtVector.y * speed;
        this.camera.position.z -= lookAtVector.z * speed;
      }
      //Q
      else if ( keyCode == 81 ) {
        this.camera.position.x += lookUpVector.x * speed;
        this.camera.position.y += lookUpVector.y * speed;
        this.camera.position.z += lookUpVector.z * speed;
      }
      //E
      else if ( keyCode == 69 )
      {
        this.camera.position.x -= lookUpVector.x * speed;
        this.camera.position.y -= lookUpVector.y * speed;
        this.camera.position.z -= lookUpVector.z * speed;
      }
      //Up
      else if ( keyCode == 38 )
      {
        this.camera.rotateOnWorldAxis(lookSidewaysVector, -rotationSpeedVertical);
      }
      //Down
      else if ( keyCode == 40 )
      {
        this.camera.rotateOnWorldAxis(lookSidewaysVector, rotationSpeedVertical);
      }
      //Left
      else if ( keyCode == 37 )
      {
        this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationSpeedHorizontal);
      }
      //Right
      else if ( keyCode == 39 )
      {
        this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -rotationSpeedHorizontal);
      }
    }

    this.drawTwo.updatePlayer(parseInt(this.camera.position.x / this.mapScale), parseInt(this.camera.position.z / this.mapScale), lookAtVector.x, lookAtVector.z);

    if (this.keyDowns.length > 0) {
      window.requestAnimationFrame(() => {this.onDocumentKeyPress()});
    }
  }

  componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
  rgbToHex(rgb) {
    return "0x" + this.componentToHex(rgb.r) + this.componentToHex(rgb.g) + this.componentToHex(rgb.b);
  }

  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}