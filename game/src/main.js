import * as THREE from 'three';
import { createMap } from './map.js';
import { createInput } from './input.js';
import { createPlayer } from './player.js';
import { createBots } from './bots.js';
import { createWeapons } from './weapons.js';
import { createEconomy } from './economy.js';
import { createHud } from './hud.js';
import { createAudio } from './audio.js';
import { createSim } from './sim.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed')) || 1;
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = false;
document.querySelector('#game').appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#d8955c');
scene.fog = new THREE.Fog('#c89169', 34, 115);
const camera = new THREE.PerspectiveCamera(76, innerWidth / innerHeight, .08, 180);
scene.add(camera);
const map = createMap(scene);
const player = createPlayer(map.colliders);
const input = createInput(renderer.domElement);
const hud = createHud();
const audio = createAudio();
const economy = createEconomy();
const bots = createBots(scene, map, seed);
const weapons = createWeapons(scene, camera, map, bots, hud, audio);
const sim = createSim({ player, bots, weapons, economy, hud, audio, input, map, camera, demo: !!shot });
let previous = performance.now(), accumulator = 0;
const step = 1 / 60;
let painted = false;
function frame(now) {
  if (!shot || !painted) requestAnimationFrame(frame);
  accumulator += Math.min(.1, (now - previous) / 1000); previous = now;
  if (shot) { if (!painted) { sim.step(step); painted = true; } }
  else while (accumulator >= step) { sim.step(step); accumulator -= step; }
  sim.render(camera);
  renderer.render(scene, camera);
}
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
hud.onPlay(() => { audio.init(); if (shot) return; renderer.domElement.requestPointerLock(); });
document.addEventListener('pointerlockchange', () => sim.setLocked(document.pointerLockElement === renderer.domElement));
if (shot) sim.setupShot(shot);
else hud.showStart();
requestAnimationFrame(frame);
