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
    this.seaMeshNormals = 0;

    this.throttle = 0.1;
    this.throttleStep = 0.001;
    this.minThrottle = 0.05;
    this.maxThrottle = 0.3;

    this.turnSpeed = 0.003;
    this.noseSpeed = 0.003;
    this.rotateSpeed = 0.005;

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
    this.camera.position.z = 400;
    this.camera.position.x = 0;
    this.camera.position.y = 15;
    this.drawTwo.updatePlayer(parseInt(this.camera.position.x), parseInt(this.camera.position.z));

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize( this.windowWidth, this.windowHeight );
    document.body.appendChild( this.renderer.domElement );

    this.startTime = Date.now() - 65000;
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

    let ambientLight = new THREE.AmbientLight( 0x404040, 0.25 );
    this.scene.add(ambientLight);

    this.spotLightRight = new THREE.SpotLight( 0xffffff, 0.5 );
    this.spotLightRight.distance = 150;
    this.spotLightRight.decay = 3;
    this.spotLightRight.angle = Math.PI/11;

    this.spotLightRight.position.set(0.075, 0.02, 0.25);
    this.camera.add(this.spotLightRight);
    this.spotLightRight.target = this.camera;

    this.spotLightLeft = new THREE.SpotLight( 0xffffff, 0.5 );
    this.spotLightLeft.distance = 150;
    this.spotLightLeft.decay = 3;
    this.spotLightLeft.angle = Math.PI/11;

    this.spotLightLeft.position.set(-0.075, 0.02, 0.25);
    this.camera.add(this.spotLightLeft);
    this.spotLightLeft.target = this.camera;

    let cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    let cubeMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
    this.player = new THREE.Mesh( cubeGeometry, cubeMaterial );
    this.player.position.set(0, -1, -1.5);
    this.camera.add( this.player );

    this.scene.add(this.camera);

    //this.scene.add(this.spotLight);
  }

  renderMap(heightMap, width, height, amplitude, scale) {
    let input = new Array(width);

    for (let i = 0; i < width; i++) {
      input[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        input[i][j] = heightMap[(j * width) + i];
      }
    }

    this.inputWidth = width;
    this.inputHeight = height;

    this.mapScale = scale;
    this.drawTwo.updatePlayer(parseInt(this.camera.position.x / this.mapScale), parseInt(this.camera.position.z / this.mapScale));

    let landGeometry = new THREE.BufferGeometry();
    let [vertices, colors] = this.geometryFromVerticies(input, amplitude, new THREE.Vector3(0, 0, 0), this.mapScale);

    landGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    landGeometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    landGeometry.computeVertexNormals();

    let material = new THREE.MeshPhongMaterial( { vertexColors: true } );
    let mesh = new THREE.Mesh( landGeometry, material );
    this.scene.add( mesh );

    let seaGeometry = new THREE.BufferGeometry();
    let [seaVertices, seaColors] = this.seaGeometryFromVerticies(input, amplitude, new THREE.Vector3(0, 0, 0), this.mapScale, 1);

    seaGeometry.setAttribute( 'position', new THREE.BufferAttribute( seaVertices, 3 ) );
    seaGeometry.setAttribute( 'color', new THREE.BufferAttribute( seaColors, 3 ) );
    seaGeometry.computeVertexNormals();
    seaGeometry.dynamic = true;
    let seaMaterial = new THREE.MeshPhongMaterial( { vertexColors: true, transparent: true, shininess: 100 } );
    seaMaterial.opacity = 0.75;

    this.seaMesh = new THREE.Mesh( seaGeometry, seaMaterial );
    this.scene.add( this.seaMesh );

    window.requestAnimationFrame(() => {this.animate()});
  }

  animate() {
    //this.customGeometry.attributes.position.needsUpdate = true;
    //this.customGeometry.attributes.color.needsUpdate = true;

    //this.customGeometry.computeVertexNormals();

    this.stats.begin();

    let radians = -1 * (Date.now() - this.startTime) / 20000;
    //Shortened night
    //if (Math.sin(radians) < -0.92 && Math.cos(radians) > 0) this.startTime = Date.now() - ((Math.PI * (11/8)) * -10000);
    let yPos = Math.sin(radians);
    this.sun.position.x = Math.cos(radians) * 1000;
    this.sun.position.y = yPos * 1000;
    this.sun.color.setHex(this.getSunColor(yPos));
    this.scene.fog.color.setHex(this.getFogColor(yPos));
    this.scene.background.setHex(this.getBGColor(yPos));

    if (yPos < -0.1) {
      this.spotLightLeft.intensity = 0.5;
      this.spotLightRight.intensity = 0.5;
    } else {
      this.spotLightLeft.intensity = 0
      this.spotLightRight.intensity = 0;
    }
    
    this.autoMove();

    this.animateSea();

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
    } else if (posY > -0.4) {
      return this.getWeightedColor(posY * 2.5, '#092936', '#ff9608');
    } else {
      return this.getWeightedColor((posY + 0.4) * 1.5, '#000000', '#092936');
    }
  }

  getBGColor(posY) {
    if (posY > 0) {
      return this.getWeightedColor(posY, '#87ceeb', '#bb6b00');
    } else if (posY > -0.4) {
      return this.getWeightedColor(posY * 2.5, '#092936', '#bb6b00');
    } else {
      return this.getWeightedColor((posY + 0.4) * 1.5, '#000000', '#092936');
    }
  }

  getWeightedColor(y, colorMax, colorMin) {
    let colorMaxRGB = this.hexToRgb(colorMax);
    let colorMinRGB = this.hexToRgb(colorMin);
    y = Math.min(1, Math.abs(y));

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
    let seaLevel = 0;
    
    for (let y = 0; y < matrix[0].length - 1; y++) {
      for (let x = 0; x < matrix.length - 1; x++) {
        let arrayPosition = (x * 18) + (y * matrix.length * 18);
        //if (!(matrix[x][y] < this.seaLevel && matrix[x + 1][y] < this.seaLevel && matrix[x][y + 1] < this.seaLevel && matrix[x + 1][y + 1] < this.seaLevel)) {
          // Triangle 1
          vertices[arrayPosition + 0] = ((x + 0) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 1] = Math.max(seaLevel, matrix[x][y]) * amplitude + offset.y;
          vertices[arrayPosition + 2] = ((y + 0) - (matrix[0].length/2.0) + offset.z) * scale;
    
          vertices[arrayPosition + 3] = ((x + 0) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 4] = Math.max(seaLevel, matrix[x][y + 1]) * amplitude + offset.y;
          vertices[arrayPosition + 5] = ((y + 1) - (matrix[0].length/2.0) + offset.z) * scale;
    
          vertices[arrayPosition + 6] = ((x + 1) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 7] = Math.max(seaLevel, matrix[x + 1][y + 1]) * amplitude + offset.y;
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
          vertices[arrayPosition + 10] = Math.max(seaLevel, matrix[x][y]) * amplitude + offset.y;
          vertices[arrayPosition + 11] = ((y + 0) - (matrix[0].length/2.0) + offset.z) * scale;
    
          vertices[arrayPosition + 12] = ((x + 1) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 13] = Math.max(seaLevel, matrix[x + 1][y + 1]) * amplitude + offset.y;
          vertices[arrayPosition + 14] = ((y + 1) - (matrix[0].length/2) + offset.z) * scale;
    
          vertices[arrayPosition + 15] = ((x + 1) - (matrix.length/2.0) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 16] = Math.max(seaLevel, matrix[x + 1][y]) * amplitude + offset.y;
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

  seaGeometryFromVerticies(matrix, amplitude, offset, scale = 1, waveHeight = 0.5) {
    let color = new THREE.Color();
    let tempRGB = [30,144,255];
    let factor = 4;
    let width = matrix.length / factor;
    let height = matrix[0].length / factor;
    let vertices = new Float32Array(width * height * 18);
    let colors = new Float32Array(width * height * 18);
    scale = scale * factor;

    this.landWidth = matrix.length;
    this.landHeight = matrix[0].length;

    this.seaAmplitude = amplitude;
    this.seaOffset = offset;
    this.seaScale = scale;
    this.waveHeight = waveHeight;
    
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        let arrayPosition = (x * 18) + (y * width * 18);
        if (matrix[x * factor][y * factor] < this.seaLevel + 0.2 && matrix[x * factor + 1][y * factor] < this.seaLevel + 0.2 && matrix[x * factor][y * factor + 1] < this.seaLevel + 0.2 && matrix[x * factor + 1][y * factor + 1] < this.seaLevel + 0.2) {
          // Triangle 1
          vertices[arrayPosition + 0] = ((x + 0) - (width/2) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 1] = this.seaLevel * amplitude + offset.y;
          vertices[arrayPosition + 2] = ((y + 0) - (height/2) + offset.z) * scale;
    
          vertices[arrayPosition + 3] = ((x + 0) - (width/2) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 4] = this.seaLevel * amplitude + offset.y;
          vertices[arrayPosition + 5] = ((y + 1) - (height/2) + offset.z) * scale;
    
          vertices[arrayPosition + 6] = ((x + 1) - (width/2) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 7] = this.seaLevel * amplitude + offset.y;
          vertices[arrayPosition + 8] = ((y + 1) - (height/2) + offset.z) * scale;

          //tempRGB = MapGeneration.getColorFromHeight(matrix[x][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 0] = color.r;
          colors[arrayPosition + 1] = color.g;
          colors[arrayPosition + 2] = color.b;

          //tempRGB = MapGeneration.getColorFromHeight(matrix[x][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 3] = color.r;
          colors[arrayPosition + 4] = color.g;
          colors[arrayPosition + 5] = color.b;

          //tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 6] = color.r;
          colors[arrayPosition + 7] = color.g;
          colors[arrayPosition + 8] = color.b;
    
          // Triangle 2
          vertices[arrayPosition + 9] = ((x + 0) - (width/2) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 10] = this.seaLevel * amplitude + offset.y
          vertices[arrayPosition + 11] = ((y + 0) - (height/2.0) + offset.z) * scale;
    
          vertices[arrayPosition + 12] = ((x + 1) - (width/2) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 13] = this.seaLevel * amplitude + offset.y;
          vertices[arrayPosition + 14] = ((y + 1) - (height/2) + offset.z) * scale;
    
          vertices[arrayPosition + 15] = ((x + 1) - (width/2) + 0.5 + offset.x) * scale;
          vertices[arrayPosition + 16] = this.seaLevel * amplitude + offset.y;
          vertices[arrayPosition + 17] = ((y + 0) - (height/2) + offset.z) * scale;

          //tempRGB = MapGeneration.getColorFromHeight(matrix[x][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 9] = color.r;
          colors[arrayPosition + 10] = color.g;
          colors[arrayPosition + 11] = color.b;

          //tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y + 1]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 12] = color.r;
          colors[arrayPosition + 13] = color.g;
          colors[arrayPosition + 14] = color.b;

          //tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y]/tempDivider);
          color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
          colors[arrayPosition + 15] = color.r;
          colors[arrayPosition + 16] = color.g;
          colors[arrayPosition + 17] = color.b;
        }
      }
    }

	  return [vertices, colors];
  }

  animateSea() {
    let seaVerticies = this.seaMesh.geometry.attributes.position.array;
    let timeOffset = (Date.now() - this.startTime)/1000;
    let waveLength = 2;
    let factor = 4;

    let playerX = parseInt((this.camera.position.x + (this.landWidth/2 * this.mapScale))/(this.mapScale));
    let playerY = parseInt((this.camera.position.z + (this.landHeight/2 * this.mapScale))/(this.mapScale));
    let yMin = parseInt(Math.max(0, playerY - 200)/factor);
    let yMax = parseInt(Math.min(this.landHeight, playerY + 200)/factor) - 1;
    let xMin = parseInt(Math.max(0, playerX - 200)/factor);
    let xMax = parseInt(Math.min(this.landWidth, playerX + 200)/factor) - 1;

    let computedValues = [];
    let precomputed = this.seaLevel * this.seaAmplitude + this.seaOffset.y;
    
    let width = this.landWidth/factor;
    let height = this.landHeight/factor;

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {

        let arrayPosition = (x * 18) + (y * width * 18);
        if (seaVerticies[arrayPosition + 1]) {
          if (!computedValues[x + y]) computedValues[x + y] = precomputed + (Math.sin((timeOffset + x + y)/waveLength) * this.waveHeight);
          seaVerticies[arrayPosition + 1] = computedValues[x + y];
        }
        if (seaVerticies[arrayPosition + 4]) {
          if (!computedValues[x + y + 1]) computedValues[x + y + 1] = precomputed + (Math.sin((timeOffset + x + y + 1)/waveLength) * this.waveHeight);
          seaVerticies[arrayPosition + 4] = computedValues[x + y + 1];
        }
        if (seaVerticies[arrayPosition + 7]) {
          if (!computedValues[x + y + 2]) computedValues[x + y + 2] = precomputed + (Math.sin((timeOffset + x + y + 2)/waveLength) * this.waveHeight);
          seaVerticies[arrayPosition + 7] = computedValues[x + y + 2];
        }
        if (seaVerticies[arrayPosition + 10]) {
          if (!computedValues[x + y]) computedValues[x + y] = precomputed + (Math.sin((timeOffset + x + y)/waveLength) * this.waveHeight);
          seaVerticies[arrayPosition + 10] = computedValues[x + y];
        }
        if (seaVerticies[arrayPosition + 13]) {
          if (!computedValues[x + y + 2]) computedValues[x + y + 2] = precomputed + (Math.sin((timeOffset + x + y + 2)/waveLength) * this.waveHeight);
          seaVerticies[arrayPosition + 13] = computedValues[x + y + 2];
        }
        if (seaVerticies[arrayPosition + 16]) {
          if (!computedValues[x + y + 1]) computedValues[x + y + 1] = precomputed + (Math.sin((timeOffset + x + y + 1)/waveLength) * this.waveHeight);
          seaVerticies[arrayPosition + 16] = computedValues[x + y + 1];
        }
      }
    }

    this.seaMeshNormals = (this.seaMeshNormals + 1) % 15;

    if (this.seaMeshNormals === 0) this.seaMesh.geometry.computeVertexNormals();
    this.seaMesh.geometry.attributes.position.needsUpdate = true;
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

    let lookAtVector = new THREE.Vector3(0,0, -1);
    let lookUpVector = new THREE.Vector3(0,-1, 0);
    lookAtVector.applyQuaternion(this.camera.quaternion);
    lookUpVector.applyQuaternion(this.camera.quaternion);
    let lookSidewaysVector = new THREE.Vector3().crossVectors(lookAtVector, lookUpVector); 

    for (let keyCode of this.keyDowns) {
      //A
      if ( keyCode == 65 ) {
        this.camera.rotateOnWorldAxis(lookAtVector, -this.rotateSpeed);

        //this.camera.position.x += lookSidewaysVector.x * speed;
        //this.camera.position.y += lookSidewaysVector.y * speed;
        //this.camera.position.z += lookSidewaysVector.z * speed;
      }
      //D
      else if ( keyCode == 68 ) {
        this.camera.rotateOnWorldAxis(lookAtVector, this.rotateSpeed);

        //this.camera.position.x -= lookSidewaysVector.x * speed;
        //this.camera.position.y -= lookSidewaysVector.y * speed;
        //this.camera.position.z -= lookSidewaysVector.z * speed;
      }
      //W
      else if ( keyCode == 87 ) {
        this.throttle = Math.min(this.throttle + this.throttleStep, this.maxThrottle);
        //this.camera.position.x += lookAtVector.x * speed;
        //this.camera.position.y += lookAtVector.y * speed;
        //this.camera.position.z += lookAtVector.z * speed;
      }
      //S
      else if ( keyCode == 83 ) {
        this.throttle = Math.max(this.throttle - this.throttleStep, this.minThrottle);
        //this.camera.position.x -= lookAtVector.x * speed;
        //this.camera.position.y -= lookAtVector.y * speed;
        //this.camera.position.z -= lookAtVector.z * speed;
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
        this.camera.rotateOnWorldAxis(lookSidewaysVector, -this.noseSpeed);
      }
      //Down
      else if ( keyCode == 40 )
      {
        this.camera.rotateOnWorldAxis(lookSidewaysVector, this.noseSpeed);
      }
      //Left
      else if ( keyCode == 37 )
      {
        this.camera.rotateOnWorldAxis(lookUpVector, -this.turnSpeed);
      }
      //Right
      else if ( keyCode == 39 )
      {
        this.camera.rotateOnWorldAxis(lookUpVector, this.turnSpeed);
      }
    }

    this.drawTwo.updatePlayer(parseInt(this.camera.position.x / this.mapScale), parseInt(this.camera.position.z / this.mapScale), lookAtVector.x, lookAtVector.z);

    if (this.keyDowns.length > 0) {
      window.requestAnimationFrame(() => {this.onDocumentKeyPress()});
    }
  }

  autoMove() {
    let lookAtVector = new THREE.Vector3(0,0, -1);
    lookAtVector.applyQuaternion(this.camera.quaternion);

    this.camera.position.x += lookAtVector.x * this.throttle;
    this.camera.position.y += lookAtVector.y * this.throttle;
    this.camera.position.z += lookAtVector.z * this.throttle;

    this.drawTwo.updatePlayer(parseInt(this.camera.position.x / this.mapScale), parseInt(this.camera.position.z / this.mapScale), lookAtVector.x, lookAtVector.z);
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