import * as THREE from 'three';
import { rng } from './utils.js';
const ROUTES = [[[-8,25],[-6,13],[0,4],[-4,-9],[-8,-23]],[[8,25],[5,13],[0,4],[5,-9],[8,-23]],[[-15,20],[-15,0],[-15,-18],[-8,-23]],[[15,20],[15,0],[15,-18],[8,-23]],[[0,25],[0,12],[0,0],[0,-12],[0,-25]]];
export function createBots(scene,map,seed=1) {
  const rand=rng(seed), bots=[], bodyMat=new THREE.MeshStandardMaterial({color:'#4e7580',roughness:.74}), enemyMat=new THREE.MeshStandardMaterial({color:'#d87549',roughness:.68}), dark=new THREE.MeshStandardMaterial({color:'#263942'});
  for(let i=0;i<9;i++){const g=new THREE.Group(), enemy=i>=4, torso=new THREE.Mesh(new THREE.BoxGeometry(.66,.88,.36),enemy?enemyMat:bodyMat), head=new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),dark);torso.position.y=1.03;head.position.y=1.62;g.add(torso,head);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.bot=i;}});scene.add(g);bots.push({g,torso,head,enemy,alive:true,hp:100,route:i%5,leg:rand()*6,aim:.018+rand()*.055,reaction:.25+rand()*.6,cool:rand(),target:null});}
  function step(dt,s,player,weapons){for(let i=0;i<bots.length;i++){const b=bots[i];if(!b.alive)continue;b.cool-=dt;const r=ROUTES[b.route],idx=Math.min(r.length-1,Math.floor((s.left/17+b.route)%r.length));let x=r[idx][0],z=r[idx][1];if(!b.enemy&&i===6){x=player.x+2;z=player.z-3;}if(s.planted&&b.enemy){x=-8;z=-23;}const dx=x-b.g.position.x,dz=z-b.g.position.z,d=Math.hypot(dx,dz);if(d>.75){const vx=dx/d, vz=dz/d,nx=b.g.position.x+vx*dt*2.5,nz=b.g.position.z+vz*dt*2.5;if(!map.colliders.some(c=>nx>c.min.x-.5&&nx<c.max.x+.5&&nz>c.min.z-.5&&nz<c.max.z+.5)){b.g.position.x=nx;b.g.position.z=nz;}b.g.rotation.y=Math.atan2(-vx,-vz);}b.leg+=dt*5;b.g.position.y=Math.abs(Math.sin(b.leg))*.04;
      if(b.enemy&&b.cool<=0&&Math.hypot(player.x-b.g.position.x,player.z-b.g.position.z)<28){b.cool=b.reaction+rand()*.3;if(rand()>.66)player.health=Math.max(0,player.health-(rand()>.82?16:7));}
    }}
  function setupDemo(name,p){for(let i=0;i<bots.length;i++){const b=bots[i],places=name==='fight'?[[-4,-11],[4,-13],[-11,-18],[2,-20],[0,-25]]:name==='plant'?[[-8,-18],[-13,-18],[0,-20],[7,-17],[8,-9]]:[[-3,-14],[4,-17],[-8,-20],[11,-18],[2,-24]];const q=places[i%places.length];b.g.position.set(q[0],0,q[1]);b.g.rotation.y=Math.atan2(p.x-q[0],p.z-q[1]);b.alive=true;b.torso.visible=b.head.visible=true;}}
  function resetRound(){for(const b of bots){b.alive=true;b.hp=100;b.g.visible=true;}}
  function endRound(){}
  function animate(t){for(const b of bots)if(b.alive)b.g.rotation.x=Math.sin(t*1.8+b.leg)*.015;}
  return {bots,step,setupDemo,resetRound,endRound,animate,hitMeshes:bots.flatMap(b=>[b.torso,b.head]), damage(mesh,amount){const b=bots[mesh.userData.bot];if(!b||!b.alive)return false;b.hp-=amount;if(b.hp<=0){b.alive=false;b.g.visible=false;return true;}return false;}};
}
