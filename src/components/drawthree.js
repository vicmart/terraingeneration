import * as THREE from 'three';
import MapGeneration from "./mapgeneration.js";

export default class DrawThree {
  constructor() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.keyDowns = [];
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 60, this.windowWidth/this.windowHeight, 0.1, 1000 );
    this.camera.position.z = window.innerWidth/4;
    this.camera.position.x = 0;
    this.camera.position.y = 50;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize( this.windowWidth, this.windowHeight );
    document.body.appendChild( this.renderer.domElement );

    this.addLights();

    document.addEventListener('keydown', (e) => { this.onDocumentKeyPressDown(e) });
    document.addEventListener('keyup', (e) => { this.onDocumentKeyPressUp(e) });
  }

  addLights() {
    let light = new THREE.PointLight( 0xffffff, 1, 0 );
    light.position.set( 0, 100, 0 );
    //this.scene.add(light);

    let ambientLight = new THREE.AmbientLight( 0x404040, 4 );
    this.scene.add(ambientLight);
  }

  renderMap(heightMap, width, height, amplitude) {
    let input = new Array(width);

    for (let i = 0; i < width; i++) {
      input[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        input[i][j] = heightMap[(j * width) + i];
      }
    }

    for (let x = 0; x < 1; x++) {
      for (let z = 0; z < 1; z++) {
        let customGeometry = new THREE.BufferGeometry();
        let [vertices, colors] = this.geometryFromVerticies(input, amplitude, new THREE.Vector3(x * width, 0, z * height));

        customGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        customGeometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        customGeometry.computeVertexNormals();

        let greenMaterial = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, vertexColors: true } );
        let mesh = new THREE.Mesh( customGeometry, greenMaterial );
        this.scene.add( mesh );
      }
    }

    this.animate();
  }

  animate() {
    //requestAnimationFrame( animate );
    this.renderer.render( this.scene, this.camera );
  };

  geometryFromVerticies(matrix, amplitude, offset) {
    let seaLevel = 0.2;
    let color = new THREE.Color();
    let tempRGB = [];
    let vertices = new Float32Array(matrix.length * matrix[0].length * 18);
    let colors = new Float32Array(matrix.length * matrix[0].length * 18);
    
    for (let y = 0; y < matrix[0].length - 1; y++) {
      for (let x = 0; x < matrix.length - 1; x++) {
        let arrayPosition = (x * 18) + (y * matrix.length * 18);
        // Triangle 1
        vertices[arrayPosition + 0] = (x + 0) - (matrix.length/2.0) + 0.5 + offset.x;
        vertices[arrayPosition + 1] = Math.max(seaLevel, matrix[x][y]) * amplitude + offset.y;
        vertices[arrayPosition + 2] = (y + 0) - (matrix[0].length/2.0) + offset.z;
  
        vertices[arrayPosition + 3] = (x + 0) - (matrix.length/2.0) + 0.5 + offset.x;
        vertices[arrayPosition + 4] = Math.max(seaLevel, matrix[x][y + 1]) * amplitude + offset.y;
        vertices[arrayPosition + 5] = (y + 1) - (matrix[0].length/2.0) + offset.z;
  
        vertices[arrayPosition + 6] = (x + 1) - (matrix.length/2.0) + 0.5 + offset.x;
        vertices[arrayPosition + 7] = Math.max(seaLevel, matrix[x + 1][y + 1]) * amplitude + offset.y;
        vertices[arrayPosition + 8] = (y + 1) - (matrix[0].length/2.0) + offset.z;

        tempRGB = MapGeneration.getColorFromHeight(matrix[x][y] <= seaLevel ? 0 : matrix[x][y]);
        color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
        colors[arrayPosition + 0] = color.r;
        colors[arrayPosition + 1] = color.g;
        colors[arrayPosition + 2] = color.b;

        tempRGB = MapGeneration.getColorFromHeight(matrix[x][y + 1] <= seaLevel ? 0 : matrix[x][y + 1]);
        color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
        colors[arrayPosition + 3] = color.r;
        colors[arrayPosition + 4] = color.g;
        colors[arrayPosition + 5] = color.b;

        tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y + 1] <= seaLevel ? 0 : matrix[x + 1][y + 1]);
        color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
        colors[arrayPosition + 6] = color.r;
        colors[arrayPosition + 7] = color.g;
        colors[arrayPosition + 8] = color.b;
  
        // Triangle 2
        vertices[arrayPosition + 9] = (x + 0) - (matrix.length/2.0) + 0.5 + offset.x;
        vertices[arrayPosition + 10] = Math.max(seaLevel, matrix[x][y]) * amplitude + offset.y;
        vertices[arrayPosition + 11] = (y + 0) - (matrix[0].length/2.0) + offset.z;
  
        vertices[arrayPosition + 12] = (x + 1) - (matrix.length/2.0) + 0.5 + offset.x;
        vertices[arrayPosition + 13] = Math.max(seaLevel, matrix[x + 1][y + 1]) * amplitude + offset.y;
        vertices[arrayPosition + 14] = (y + 1) - (matrix[0].length/2) + offset.z;
  
        vertices[arrayPosition + 15] = (x + 1) - (matrix.length/2.0) + 0.5 + offset.x;
        vertices[arrayPosition + 16] = Math.max(seaLevel, matrix[x + 1][y]) * amplitude + offset.y;
        vertices[arrayPosition + 17] = (y + 0) - (matrix[0].length/2) + offset.z;

        tempRGB = MapGeneration.getColorFromHeight(matrix[x][y] <= seaLevel ? 0 : matrix[x][y]);
        color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
        colors[arrayPosition + 9] = color.r;
        colors[arrayPosition + 10] = color.g;
        colors[arrayPosition + 11] = color.b;

        tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y + 1] <= seaLevel ? 0 : matrix[x + 1][y + 1]);
        color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
        colors[arrayPosition + 12] = color.r;
        colors[arrayPosition + 13] = color.g;
        colors[arrayPosition + 14] = color.b;

        tempRGB = MapGeneration.getColorFromHeight(matrix[x + 1][y] <= seaLevel ? 0 : matrix[x + 1][y]);
        color.setRGB(tempRGB[0] / 255, tempRGB[1] / 255, tempRGB[2] / 255);
        colors[arrayPosition + 15] = color.r;
        colors[arrayPosition + 16] = color.g;
        colors[arrayPosition + 17] = color.b;
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
    let speed = 0.25;
    let rotationSpeed = 0.01;

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
        this.camera.rotateOnWorldAxis(lookSidewaysVector, -rotationSpeed);
      }
      //Down
      else if ( keyCode == 40 )
      {
        this.camera.rotateOnWorldAxis(lookSidewaysVector, rotationSpeed);
      }
      //Left
      else if ( keyCode == 37 )
      {
        this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationSpeed);
      }
      //Right
      else if ( keyCode == 39 )
      {
        this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -rotationSpeed);
      }
    }


    window.requestAnimationFrame(() => {this.animate()});
    if (this.keyDowns.length > 0) {
      window.requestAnimationFrame(() => {this.onDocumentKeyPress()});
    }
  }
}