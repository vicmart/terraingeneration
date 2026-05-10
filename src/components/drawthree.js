import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import MapGeneration from "./mapgeneration.js";
import Stats from "stats.js";

const loader = new GLTFLoader();

export default class DrawThree {
  constructor(drawTwo) {
    this.drawTwo = drawTwo;

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.seaLevel = 0.22;
    this.keyDowns = [];
    this.seaMeshNormals = 0;

    this.throttle = 0.1;
    this.throttleStep = 0.001;
    this.minThrottle = 0.05;
    this.maxThrottle = 0.3;

    this.turnSpeed = 0;
    this.turnSpeedStep = 0.00002;
    this.maxTurnSpeed = 0.001;

    this.noseSpeed = 0;
    this.noseSpeedStep = 0.00003;
    this.maxNoseSpeed = 0.002;

    this.rotateSpeed = 0;
    this.rotateSpeedStep = 0.0001;
    this.maxRotateSpeed = 0.003;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x87ceeb );
    const color = 0x87ceeb;  // white
    const near = 200;
    const far = 300;
    this.scene.fog = new THREE.Fog(color, near, far);
    this.camera = new THREE.PerspectiveCamera( 60, this.windowWidth/this.windowHeight, 0.1, 300 );
    this.camera.position.z = 500;
    this.camera.position.x = 0;
    this.camera.position.y = 30;
    this.drawTwo.updatePlayer(parseInt(this.camera.position.x), parseInt(this.camera.position.z));

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize( this.windowWidth, this.windowHeight );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.renderSingleSided = false;
    document.body.appendChild( this.renderer.domElement );

    this.startTime = Date.now() - 85000;
    this.addLights();

    this.stats = new Stats();
    this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( this.stats.dom );

    document.addEventListener('keydown', (e) => { this.onDocumentKeyPressDown(e) });
    document.addEventListener('keyup', (e) => { this.onDocumentKeyPressUp(e) });
  }

  addLights() {
    this.sun = new THREE.DirectionalLight( 0xffffe0, 1 );
    this.sun.position.set( 0, 100, 0 );
    this.sun.castShadow = true;
    this.sun.shadow.camera.left   = -150;
    this.sun.shadow.camera.right  =  150;
    this.sun.shadow.camera.top    =  150;
    this.sun.shadow.camera.bottom = -150;
    this.sun.shadow.camera.near   = 0.5;
    this.sun.shadow.camera.far    = 3000;
    this.sun.shadow.mapSize.width  = 4096;
    this.sun.shadow.mapSize.height = 4096;
    this.sun.shadow.bias = -0.001;

    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.hemisphereLight = new THREE.HemisphereLight( 0x87ceeb, 0x4cba17, 0.6 );
    this.scene.add(this.hemisphereLight);

    this.spotLightRight = new THREE.SpotLight( 0xffffff, 10 );
    this.spotLightRight.distance = 600;
    this.spotLightRight.decay = 3;
    this.spotLightRight.angle = Math.PI/11;
    this.spotLightRight.position.set(3, -0.5, 0);

    const targetRight = new THREE.Object3D();
    targetRight.position.set(3, -0.5, -50);
    this.camera.add(this.spotLightRight);
    this.camera.add(targetRight);
    this.spotLightRight.target = targetRight;

    this.spotLightLeft = new THREE.SpotLight( 0xffffff, 10 );
    this.spotLightLeft.distance = 600;
    this.spotLightLeft.decay = 3;
    this.spotLightLeft.angle = Math.PI/11;
    this.spotLightLeft.position.set(-3, -0.5, 0);

    const targetLeft = new THREE.Object3D();
    targetLeft.position.set(-3, -0.5, -50);
    this.camera.add(this.spotLightLeft);
    this.camera.add(targetLeft);
    this.spotLightLeft.target = targetLeft;

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

    let landMaterial = new THREE.MeshPhongMaterial( { vertexColors: true, color: 0x555555, shininess: 0 } );
    this.landMesh = new THREE.Mesh( landGeometry, landMaterial );
    this.landMesh.castShadow = true;
    this.landMesh.receiveShadow = true;
    this.scene.add( this.landMesh );

    let seaGeometry = new THREE.BufferGeometry();
    let [seaVertices, seaColors] = this.seaGeometryFromVerticies(input, amplitude, new THREE.Vector3(0, 0, 0), this.mapScale, 2.5);

    seaGeometry.setAttribute( 'position', new THREE.BufferAttribute( seaVertices, 3 ) );
    seaGeometry.setAttribute( 'color', new THREE.BufferAttribute( seaColors, 3 ) );
    seaGeometry.computeVertexNormals();
    seaGeometry.dynamic = true;
    let seaMaterial = new THREE.MeshPhongMaterial( { vertexColors: true, transparent: true, shininess: 100 } );
    seaMaterial.opacity = 0.6;

    this.seaMesh = new THREE.Mesh( seaGeometry, seaMaterial );
    this.scene.add( this.seaMesh );
    this.coastDistMap = this.buildCoastDistMap(input);

    loader.load('static/tree.glb', (gltf) => {
      const treeRoot = gltf.scene.children[0];
      this.treeBaseQuaternion = treeRoot.quaternion.clone();
      this.treeBaseScale = treeRoot.scale.clone();

      const meshNodes = [];
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          const color = (node.material && node.material.color) ? node.material.color.clone() : new THREE.Color(0x4a7c59);
          const hsl = {};
          color.getHSL(hsl);
          color.setHSL(hsl.h, hsl.s, Math.min(1, hsl.l * 3));
          meshNodes.push({ geometry: node.geometry, material: new THREE.MeshPhongMaterial({ color, shininess: 10 }) });
        }
      });

      this.treeHiddenMatrix = new THREE.Matrix4();
      this.treeHiddenMatrix.makeScale(0, 0, 0);

      this.nearTreeMeshes = meshNodes.map(({ geometry, material }) => {
        const mesh = new THREE.InstancedMesh(geometry, material, 5000);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        this.scene.add(mesh);
        return mesh;
      });

      this.treePositions = [];
      let treeCount = 0;
      let randomIndex = [0, 0];

      while (treeCount < 5000) {
        if (input[randomIndex[0]][randomIndex[1]] > 0.3 && input[randomIndex[0]][randomIndex[1]] < 0.6) {
          this.treePositions.push(new THREE.Vector3(
            (randomIndex[0] - (width/2) + 0.5) * scale,
            (input[randomIndex[0]][randomIndex[1]] * amplitude) + 1.5,
            (randomIndex[1] - (height/2)) * scale
          ));
          treeCount++;
        }
        randomIndex = [parseInt(Math.random() * width), parseInt(Math.random() * height)];
      }

      this.updateTreeLOD();
    }, null, null);

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
    this.sun.target.position.copy(this.camera.position);
    this.sun.target.updateMatrixWorld();
    this.sun.position.set(
      this.camera.position.x + Math.cos(radians) * 1000,
      this.camera.position.y + yPos * 1000,
      this.camera.position.z
    );
    this.sun.intensity = Math.max(0, yPos);
    this.sun.color.setHex(this.getSunColor(yPos));
    this.scene.fog.color.setHex(this.getFogColor(yPos));
    this.scene.background.setHex(this.getBGColor(yPos));
    this.hemisphereLight.intensity = Math.max(0, yPos) * 0.6;
    this.hemisphereLight.color.setHex(this.getBGColor(yPos));

    if (yPos < -0.1) {
      this.spotLightLeft.intensity = 0.5;
      this.spotLightRight.intensity = 0.5;
    } else {
      this.spotLightLeft.intensity = 0
      this.spotLightRight.intensity = 0;
    }
    
    this.autoMove();

    this.updateTreeLOD();

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
    let factor = 2;
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

  updateTreeLOD() {
    if (!this.treePositions || !this.nearTreeMeshes) return;

    const dummy = new THREE.Object3D();
    dummy.quaternion.copy(this.treeBaseQuaternion);
    dummy.scale.copy(this.treeBaseScale);
    const camPos = this.camera.position;
    const hidden = this.treeHiddenMatrix;

    for (let i = 0; i < this.treePositions.length; i++) {
      const pos = this.treePositions[i];
      const dist = camPos.distanceTo(pos);

      if (dist < 300) {
        dummy.position.copy(pos);
        dummy.updateMatrix();
        this.nearTreeMeshes.forEach(mesh => mesh.setMatrixAt(i, dummy.matrix));
      } else {
        this.nearTreeMeshes.forEach(mesh => mesh.setMatrixAt(i, hidden));
      }
    }

    this.nearTreeMeshes.forEach(mesh => { mesh.instanceMatrix.needsUpdate = true; });
  }

  buildCoastDistMap(matrix) {
    const factor = 2;
    const sw = Math.floor(matrix.length / factor);
    const sh = Math.floor(matrix[0].length / factor);
    const distMap = new Float32Array(sw * sh).fill(-1);

    const isSea = (x, y) => {
      if (x < 0 || x >= sw - 1 || y < 0 || y >= sh - 1) return false;
      return matrix[x*2][y*2]     < this.seaLevel + 0.2 &&
             matrix[x*2+1][y*2]   < this.seaLevel + 0.2 &&
             matrix[x*2][y*2+1]   < this.seaLevel + 0.2 &&
             matrix[x*2+1][y*2+1] < this.seaLevel + 0.2;
    };

    // returns true only for in-bounds land cells (not OOB)
    const isLand = (x, y) => {
      if (x < 0 || x >= sw - 1 || y < 0 || y >= sh - 1) return false;
      return !isSea(x, y);
    };

    // seed: sea cells adjacent to actual land (not map edges)
    const queue = [];
    for (let y = 0; y < sh - 1; y++) {
      for (let x = 0; x < sw - 1; x++) {
        if (!isSea(x, y)) continue;
        if (isLand(x-1,y) || isLand(x+1,y) || isLand(x,y-1) || isLand(x,y+1)) {
          distMap[y * sw + x] = 0;
          queue.push(x, y);
        }
      }
    }

    let head = 0;
    let maxDist = 0;
    while (head < queue.length) {
      const x = queue[head++];
      const y = queue[head++];
      const d = distMap[y * sw + x] + 1;
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      for (let i = 0; i < 4; i++) {
        const nx = x + dirs[i][0];
        const ny = y + dirs[i][1];
        if (!isSea(nx, ny)) continue;
        if (distMap[ny * sw + nx] >= 0) continue;
        distMap[ny * sw + nx] = d;
        if (d > maxDist) maxDist = d;
        queue.push(nx, ny);
      }
    }

    // box-blur the distance field to smooth staircase iso-contours
    let src = distMap;
    let dst = new Float32Array(sw * sh);
    for (let pass = 0; pass < 7; pass++) {
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          if (src[y * sw + x] < 0) { dst[y * sw + x] = -1; continue; }
          let sum = 0, count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const v = (y+dy >= 0 && y+dy < sh && x+dx >= 0 && x+dx < sw) ? src[(y+dy)*sw+(x+dx)] : -1;
              if (v >= 0) { sum += v; count++; }
            }
          }
          dst[y * sw + x] = sum / count;
        }
      }
      const tmp = src; src = dst; dst = tmp;
    }

    this.maxCoastDist = maxDist;
    this.seaSpaceWidth = sw;
    return src;
  }

  animateSea() {
    let seaVerticies = this.seaMesh.geometry.attributes.position.array;
    let seaColors    = this.seaMesh.geometry.attributes.color.array;
    let timeOffset = (Date.now() - this.startTime)/1000;
    let waveLength = 2;
    let factor = 2;

    const darkR = 0.03, darkG = 0.18, darkB = 0.45;
    const foamR = 0.92, foamG = 0.96, foamB = 1.00;
    const invWaveHeight = this.waveHeight > 0 ? 1.0 / this.waveHeight : 0;

    let playerX = parseInt((this.camera.position.x + (this.landWidth/2 * this.mapScale))/(this.mapScale));
    let playerY = parseInt((this.camera.position.z + (this.landHeight/2 * this.mapScale))/(this.mapScale));
    let yMin = parseInt(Math.max(0, playerY - 200)/factor);
    let yMax = parseInt(Math.min(this.landHeight, playerY + 200)/factor) - 1;
    let xMin = parseInt(Math.max(0, playerX - 200)/factor);
    let xMax = parseInt(Math.min(this.landWidth, playerX + 200)/factor) - 1;

    if (!this.coastDistMap) return;

    let precomputed = this.seaLevel * this.seaAmplitude + this.seaOffset.y;
    let width = this.landWidth / factor;

    const wl2 = waveLength * 1.5;

    for (let y = yMin; y < yMax; y++) {
      for (let x = xMin; x < xMax; x++) {
        let arrayPosition = (x * 18) + (y * width * 18);

        const d_xy = this.coastDistMap[y * width + x];
        if (d_xy < 0) continue;

        // per-corner coast distances (neighbouring cells give smooth per-vertex phases)
        const d_xy1  = this.coastDistMap[Math.min(y + 1, this.seaSpaceWidth - 1) * width + x];
        const d_x1y1 = this.coastDistMap[Math.min(y + 1, this.seaSpaceWidth - 1) * width + Math.min(x + 1, width - 1)];
        const d_x1y  = this.coastDistMap[y * width + Math.min(x + 1, width - 1)];

        // per-corner amplitude and height — must use each corner's own distance for both
        // phase and scale, otherwise adjacent cells compute a shared vertex differently → cracks
        const cornerHeight = (d) => {
          if (d < 0) return precomputed;
          const inv = 1 - Math.min(1, d / this.maxCoastDist);
          const s = this.waveHeight * inv * inv * inv * inv * inv * inv * inv * inv * inv * inv;
          return precomputed + (Math.sin((timeOffset + d) / waveLength) * 0.7 + Math.sin((timeOffset * 0.73 + d * 0.85) / wl2) * 0.3) * s;
        };

        const v_xy   = cornerHeight(d_xy);
        const v_xy1  = cornerHeight(d_xy1);
        const v_x1y1 = cornerHeight(d_x1y1);
        const v_x1y  = cornerHeight(d_x1y);

        const foam_xy   = Math.min(1, Math.max(0, (v_xy   - precomputed) * invWaveHeight) * 0.5);
        const foam_xy1  = Math.min(1, Math.max(0, (v_xy1  - precomputed) * invWaveHeight) * 0.5);
        const foam_x1y1 = Math.min(1, Math.max(0, (v_x1y1 - precomputed) * invWaveHeight) * 0.5);
        const foam_x1y  = Math.min(1, Math.max(0, (v_x1y  - precomputed) * invWaveHeight) * 0.5);

        if (seaVerticies[arrayPosition + 1]) {
          seaVerticies[arrayPosition + 1]  = v_xy;
          seaColors[arrayPosition + 0] = darkR + (foamR - darkR) * foam_xy;
          seaColors[arrayPosition + 1] = darkG + (foamG - darkG) * foam_xy;
          seaColors[arrayPosition + 2] = darkB + (foamB - darkB) * foam_xy;
        }
        if (seaVerticies[arrayPosition + 4]) {
          seaVerticies[arrayPosition + 4]  = v_xy1;
          seaColors[arrayPosition + 3] = darkR + (foamR - darkR) * foam_xy1;
          seaColors[arrayPosition + 4] = darkG + (foamG - darkG) * foam_xy1;
          seaColors[arrayPosition + 5] = darkB + (foamB - darkB) * foam_xy1;
        }
        if (seaVerticies[arrayPosition + 7]) {
          seaVerticies[arrayPosition + 7]  = v_x1y1;
          seaColors[arrayPosition + 6] = darkR + (foamR - darkR) * foam_x1y1;
          seaColors[arrayPosition + 7] = darkG + (foamG - darkG) * foam_x1y1;
          seaColors[arrayPosition + 8] = darkB + (foamB - darkB) * foam_x1y1;
        }
        if (seaVerticies[arrayPosition + 10]) {
          seaVerticies[arrayPosition + 10] = v_xy;
          seaColors[arrayPosition + 9]  = darkR + (foamR - darkR) * foam_xy;
          seaColors[arrayPosition + 10] = darkG + (foamG - darkG) * foam_xy;
          seaColors[arrayPosition + 11] = darkB + (foamB - darkB) * foam_xy;
        }
        if (seaVerticies[arrayPosition + 13]) {
          seaVerticies[arrayPosition + 13] = v_x1y1;
          seaColors[arrayPosition + 12] = darkR + (foamR - darkR) * foam_x1y1;
          seaColors[arrayPosition + 13] = darkG + (foamG - darkG) * foam_x1y1;
          seaColors[arrayPosition + 14] = darkB + (foamB - darkB) * foam_x1y1;
        }
        if (seaVerticies[arrayPosition + 16]) {
          seaVerticies[arrayPosition + 16] = v_x1y;
          seaColors[arrayPosition + 15] = darkR + (foamR - darkR) * foam_x1y;
          seaColors[arrayPosition + 16] = darkG + (foamG - darkG) * foam_x1y;
          seaColors[arrayPosition + 17] = darkB + (foamB - darkB) * foam_x1y;
        }
      }
    }

    this.seaMeshNormals = (this.seaMeshNormals + 1) % 15;

    if (this.seaMeshNormals === 0) this.seaMesh.geometry.computeVertexNormals();
    this.seaMesh.geometry.attributes.position.needsUpdate = true;
    this.seaMesh.geometry.attributes.color.needsUpdate = true;
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
        this.rotateSpeed = Math.max(this.maxRotateSpeed * -1, this.rotateSpeed - this.rotateSpeedStep);

        //this.camera.position.x += lookSidewaysVector.x * speed;
        //this.camera.position.y += lookSidewaysVector.y * speed;
        //this.camera.position.z += lookSidewaysVector.z * speed;
      }
      //D
      else if ( keyCode == 68 ) {
        this.rotateSpeed = Math.min(this.maxRotateSpeed, this.rotateSpeed + this.rotateSpeedStep);

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
        this.noseSpeed = Math.min(this.maxNoseSpeed, this.noseSpeed + this.noseSpeedStep);
      }
      //Down
      else if ( keyCode == 40 )
      {
        this.noseSpeed = Math.max(this.maxNoseSpeed * -1, this.noseSpeed - this.noseSpeedStep);
      }
      //Left
      else if ( keyCode == 37 )
      {
        this.turnSpeed = Math.max(this.maxTurnSpeed * -1, this.turnSpeed - this.turnSpeedStep);
        //this.camera.rotateOnWorldAxis(lookUpVector, -this.turnSpeed);
      }
      //Right
      else if ( keyCode == 39 )
      {
        this.turnSpeed = Math.min(this.maxTurnSpeed, this.turnSpeed + this.turnSpeedStep);
        //this.camera.rotateOnWorldAxis(lookUpVector, this.turnSpeed);
      }
    }

    this.drawTwo.updatePlayer(parseInt(this.camera.position.x / this.mapScale), parseInt(this.camera.position.z / this.mapScale), lookAtVector.x, lookAtVector.z);

    if (this.keyDowns.length > 0) {
      window.requestAnimationFrame(() => {this.onDocumentKeyPress()});
    }
  }

  autoMove() {
    let lookAtVector = new THREE.Vector3(0,0, -1);
    let lookUpVector = new THREE.Vector3(0,-1, 0);
    lookAtVector.applyQuaternion(this.camera.quaternion);
    lookUpVector.applyQuaternion(this.camera.quaternion);
    let lookSidewaysVector = new THREE.Vector3().crossVectors(lookAtVector, lookUpVector); 

    this.camera.position.x += lookAtVector.x * this.throttle;
    this.camera.position.y += lookAtVector.y * this.throttle;
    this.camera.position.z += lookAtVector.z * this.throttle;

    this.camera.rotateOnWorldAxis(lookUpVector, this.turnSpeed);
    this.camera.rotateOnWorldAxis(lookSidewaysVector, this.noseSpeed);
    this.camera.rotateOnWorldAxis(lookAtVector, this.rotateSpeed);

    this.turnSpeed = this.turnSpeed - (this.turnSpeed/200);
    this.noseSpeed = this.noseSpeed - (this.noseSpeed/200);
    this.rotateSpeed = this.rotateSpeed - (this.rotateSpeed/200);

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