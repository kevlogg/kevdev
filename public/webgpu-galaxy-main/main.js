import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GalaxySimulation } from './galaxy.js';

const config = {
  starCount: 750000,
  rotationSpeed: 0.1,
  spiralTightness: 1.75,
  mouseForce: 7.0,
  mouseRadius: 10.0,
  galaxyRadius: 13.0,
  galaxyThickness: 3,
  armCount: 2,
  armWidth: 2.25,
  randomness: 1.8,
  particleSize: 0.06,
  starBrightness: 0.3,
  denseStarColor: '#1885ff',
  sparseStarColor: '#ffb28a',
  bloomStrength: 0.2,
  bloomRadius: 0.2,
  bloomThreshold: 0.1,
  cloudCount: 5000,
  cloudSize: 3,
  cloudOpacity: 0.02,
  cloudTintColor: '#ffdace'
};

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 12, 17);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGPURenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 30;
controls.target.set(0, -2, 0);

const mouse3D = new THREE.Vector3(0, 0, 0);
const raycaster = new THREE.Raycaster();
const intersectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let mousePressed = false;

window.addEventListener('mousedown', () => (mousePressed = true));
window.addEventListener('mouseup', () => (mousePressed = false));
window.addEventListener('mousemove', (event) => {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(intersectionPlane, mouse3D);
});

const galaxySimulation = new GalaxySimulation(scene, config, null);
galaxySimulation.createGalaxySystem();
galaxySimulation.createClouds();

let lastFrameTime = performance.now();

async function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.033);
  lastFrameTime = currentTime;

  controls.update();
  await galaxySimulation.update(renderer, deltaTime, mouse3D, mousePressed);
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.init().then(() => {
  renderer.setClearColor(0x000000, 0);
  animate();
}).catch((err) => {
  console.error('Failed to initialize renderer:', err);
});
