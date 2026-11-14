import * as THREE from 'three';
const GUN={Pistol:[12,36,.24,1.9],SMG:[25,100,.085,1.45],Rifle:[30,90,.105,2.15],Sniper:[5,15,.9,3.2]};
export function createWeapons(scene,camera,map,bots,hud,audio){
  const state={name:'Rifle',mag:30,reserve:90,cool:0,reload:0,recoil:0,smoke:0,flash:0,scoped:false};
  const model=new THREE.Group(),metal=new THREE.MeshStandardMaterial({color:'#26343b',metalness:.55,roughness:.38}),accent=new THREE.MeshStandardMaterial({color:'#c47a47',roughness:.56});
  const rec=new THREE.Mesh(new THREE.BoxGeometry(.13,.13,.52),metal),bar=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.6,8),metal);bar.rotation.x=Math.PI/2;bar.position.z=-.47;const stock=new THREE.Mesh(new THREE.BoxGeometry(.1,.11,.24),accent);stock.position.z=.32;model.add(rec,bar,stock);model.position.set(.28,-.25,-.52);camera.add(model);
  const tracers=[], sparks=[];const lineMat=new THREE.LineBasicMaterial({color:'#ffcf8a',transparent:true,opacity:.9});
  function step(dt,s,p){state.cool=Math.max(0,state.cool-dt);state.recoil=Math.max(0,state.recoil-dt*1.7);if(state.reload>0){state.reload-=dt;if(state.reload<=0){const n=Math.min(GUN[state.name][0]-state.mag,state.reserve);state.mag+=n;state.reserve-=n;}}if(p.input?.firing)fire(s,p);if(p.input?.pressed('KeyR'))reload();model.position.y=-.25+Math.sin(performance.now()*.012)*.006;for(let i=tracers.length-1;i>=0;i--){tracers[i].life-=dt;if(tracers[i].life<=0){scene.remove(tracers[i].line);tracers.splice(i,1);}}}
  let clock=0;
  function fire(s,p){if(state.cool||state.reload||!state.mag)return;state.mag--;state.cool=GUN[state.name][2];state.recoil=Math.min(1,state.recoil+.22);audio.play('shot');hud.shot();clock=0;const spread=(p.speed>1?0.018:0.004)+state.recoil*.018+(p.crouch?-.002:0);const dir=new THREE.Vector3(-Math.sin(p.yaw),Math.tan(p.pitch),-Math.cos(p.yaw)).normalize();dir.x+=(Math.random()-.5)*spread;dir.y+=(Math.random()-.5)*spread;dir.z+=(Math.random()-.5)*spread;dir.normalize();const origin=new THREE.Vector3(p.x,p.y+p.eye,p.z),ray=new THREE.Raycaster(origin,dir,0,80);const targets=ray.intersectObjects(bots.hitMeshes,false);const walls=ray.intersectObjects(mapObjects(),false);const hit=targets[0]&&(!walls[0]||targets[0].distance<walls[0].distance)?targets[0]:null;let end=origin.clone().addScaledVector(dir,65);if(walls[0])end.copy(walls[0].point);if(hit){end.copy(hit.point);const dead=bots.damage(hit.object,(hit.object===bots.bots[hit.object.userData.bot].head?100:34)*(state.name==='Sniper'?2:1));hud.hit(dead);if(dead){s.kills++;p.money=(p.money||0)+300;}}addTracer(origin,end);}
  function mapObjects(){return scene.children.filter(o=>o.isMesh&&o.geometry.type==='BoxGeometry'&&o!==rec&&o!==bar&&o!==stock);}
  function addTracer(a,b){const geo=new THREE.BufferGeometry().setFromPoints([a,b]),line=new THREE.Line(geo,lineMat);scene.add(line);tracers.push({line,life:.075});}
  function reload(){if(state.mag<GUN[state.name][0]&&state.reserve>0&&!state.reload){state.reload=1.65;audio.play('reload');}}
  function demo(name){if(name==='fight'){state.mag=9;hud.hit(false, true);}if(name==='buy'){state.mag=GUN[state.name][0];}}
  function buy(item){if(GUN[item]){state.name=item;state.mag=GUN[item][0];state.reserve=GUN[item][1];}}
  function animate(){state.scoped=state.name==='Sniper';model.visible=!state.scoped;}
  return {state,step,fire,reload,demo,buy,animate,throwGrenade(kind){audio.play(kind);state[kind]=12;}};
}
