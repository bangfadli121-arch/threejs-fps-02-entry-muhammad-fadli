import * as THREE from 'three';
import { COLORS as C } from './palette.js';
export function createMap(scene) {
  const colliders = [], mats = {};
  for (const [k, v] of Object.entries(C)) mats[k] = new THREE.MeshStandardMaterial({ color: v, roughness: k === 'steel' ? .62 : .9, metalness: k === 'steel' ? .32 : .02 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), mats.sand); ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; ground.receiveShadow = true; scene.add(ground);
  function box(w, h, d, x, y, z, mat = 'steel', solid = true) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats[mat]); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); if (solid) colliders.push(new THREE.Box3().setFromObject(m)); return m; }
  // Site A west, B east, with a connected mid lane and outer flank corridors.
  box(38, 4.4, .8, 0, 2.2, -32, 'dune'); box(38, 4.4, .8, 0, 2.2, 32, 'dune'); box(.8, 4.4, 64, -19, 2.2, 0, 'dune'); box(.8, 4.4, 64, 19, 2.2, 0, 'dune');
  for (const x of [-13, 13]) box(.5, 3.3, 21, x, 1.65, 0, 'dark');
  box(6, 2.7, 1.4, -8, 1.35, -10, 'steel'); box(7, 2.7, 1.4, 8, 1.35, -9, 'steel');
  box(5.4, 2.8, 1.5, -8, 1.4, 10, 'steel'); box(6, 2.8, 1.4, 8, 1.4, 11, 'steel');
  for (const [x,z] of [[-13,-23],[13,-23],[-13,23],[13,23],[-4,-2],[4,2]]) box(2.2, 1.4, 2.2, x, .7, z, 'orange');
  // Stacked containers, reinforced site walls, pipework and floodlight standards.
  for (const [x,z,mat] of [[-8,-25,'orange'],[8,-25,'steel'],[-8,25,'steel'],[8,25,'orange']]) { box(7.5, 2.8, 3.2, x, 1.4, z, mat); for (let i=-3;i<=3;i++) box(.07,2.55,.04,x+i,z===25||z===-25?1.4:1.4,z+(z>0?-1.63:1.63),'dark',false); }
  for (const x of [-17,17]) { box(.32, 8, .32, x, 4, -6, 'dark'); box(2.4,.22,.45,x,7.8,-6,'orange',false); box(.7,.13,.35,x,7.62,-6,'pale',false); }
  for (let i=0;i<5;i++) { const z=-28+i*14; box(8,.55,2,-22,Math.sin(i)*.3,z,'dune',false); box(8,.6,2,22,Math.cos(i)*.25,z,'dune',false); }
  for (const [x,z,label] of [[-8,-23,'A'],[8,23,'B']]) { const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.7,.08,32),new THREE.MeshStandardMaterial({color:label==='A'?C.orange:C.blue,roughness:.8,emissive:label==='A'?C.orange:C.blue,emissiveIntensity:.18})); pad.position.set(x,.02,z); scene.add(pad); }
  const sky = new THREE.HemisphereLight('#aec6d0','#785239',1.15); scene.add(sky);
  const sun = new THREE.DirectionalLight('#ffb46f',2.5); sun.position.set(-28,24,-38); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
  const fill = new THREE.DirectionalLight('#8dbbd0',.95); fill.position.set(22,13,28); scene.add(fill);
  for (const x of [-17,17]) { const l=new THREE.PointLight('#ffc07d',95,30,2); l.position.set(x,7.4,-6); scene.add(l); }
  return { colliders, box, animate(t) {} };
}
