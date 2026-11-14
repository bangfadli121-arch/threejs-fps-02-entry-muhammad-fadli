import { clamp } from './utils.js';
export function createPlayer(colliders) {
  const p = { x: 0, y: 0, z: 28, vx: 0, vz: 0, yaw: 0, pitch: 0, eye: 1.62, health: 100, armor: 0, speed: 0, onGround: true, crouch: false, jump: 0 };
  function step(dt, input) {
    p.yaw -= input.dx * .0021; p.pitch = clamp(p.pitch - input.dy * .0021, -1.45, 1.45);
    const k = input.keys, fw = (k.has('KeyW') ? 1 : 0) - (k.has('KeyS') ? 1 : 0), side = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0);
    p.crouch = k.has('ControlLeft') || k.has('ControlRight'); p.eye += ((p.crouch ? 1.05 : 1.62) - p.eye) * Math.min(1, dt * 12);
    const sprint = k.has('ShiftLeft') ? .6 : p.crouch ? .42 : 1, sn = Math.sin(p.yaw), cs = Math.cos(p.yaw);
    const tx = (-sn * fw + cs * side) * 6.4 * sprint, tz = (-cs * fw - sn * side) * 6.4 * sprint;
    p.vx += (tx - p.vx) * Math.min(1, dt * (fw || side ? 9 : 12)); p.vz += (tz - p.vz) * Math.min(1, dt * (fw || side ? 9 : 12));
    p.speed = Math.hypot(p.vx, p.vz); if (k.has('Space') && p.onGround) { p.jump = 5.2; p.onGround = false; }
    p.jump -= 15 * dt; p.y = Math.max(0, p.y + p.jump * dt); if (!p.y) { p.jump = 0; p.onGround = true; }
    const nx = p.x + p.vx * dt, nz = p.z + p.vz * dt;
    if (!colliders.some(b => nx > b.min.x - .3 && nx < b.max.x + .3 && p.y < b.max.y && p.y + 1.7 > b.min.y && p.z > b.min.z - .3 && p.z < b.max.z + .3)) p.x = nx; else p.vx = 0;
    if (!colliders.some(b => p.x > b.min.x - .3 && p.x < b.max.x + .3 && p.y < b.max.y && p.y + 1.7 > b.min.y && nz > b.min.z - .3 && nz < b.max.z + .3)) p.z = nz; else p.vz = 0;
    p.x = clamp(p.x, -43, 43); p.z = clamp(p.z, -43, 43);
  }
  p.step = step;
  p.state = p;
  return p;
}
