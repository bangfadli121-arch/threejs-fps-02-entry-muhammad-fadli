import { stepRounds } from './rounds.js';
export function createSim(ctx) {
  const { player, bots, weapons, economy, hud, audio, input, map, camera } = ctx;
  let locked = false, time = 0, shotSetup = false;
  const state = { round: 1, phase: 'freeze', left: 105, score: [0, 0], kills: 0, deaths: 0, planted: false, plant: 0, site: 'A', alive: true, demo: ctx.demo };
  function step(dt) {
    time += dt;
    if (!ctx.demo) {
      player.step(dt, input);
      player.input = input;
      weapons.step(dt, state, player, bots);
      bots.step(dt, state, player, weapons);
      stepRounds(state, dt, bots, economy, hud, audio);
      if (input.pressed('KeyB') && state.phase !== 'live') hud.toggleBuy(economy, weapons, state);
      if (input.pressed('Escape') && locked) document.exitPointerLock();
    } else if (!shotSetup) setupShot('cover');
    camera.position.set(player.x, player.y + player.eye, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
    hud.update(state, player, weapons, economy, bots);
    input.clear();
  }
  function setupShot(name) {
    shotSetup = true; state.phase = name === 'buy' ? 'freeze' : 'live'; state.left = name === 'buy' ? 105 : 72;
    state.planted = name === 'plant'; state.plant = state.planted ? 28 : 0; state.site = 'A';
    player.x = name === 'fight' ? 0 : name === 'plant' ? -15 : 0; player.y = 0;
    player.z = name === 'cover' || name === 'fight' ? 2 : name === 'plant' ? -18 : -4;
    player.eye = name === 'cover' || name === 'fight' || name === 'plant' ? 1.38 : 1.62;
    player.yaw = name === 'fight' ? 0 : name === 'plant' ? -.95 : 0;
    player.pitch = name === 'cover' ? .008 : name === 'fight' ? .02 : name === 'plant' ? -.15 : -.025;
    if (name === 'buy') { economy.money = 3850; hud.toggleBuy(economy, weapons, state, true); }
    bots.setupDemo(name, player);
    weapons.demo(name);
    hud.demo(name);
    if (name === 'fight') {
      const target = bots.bots[4];
      target.g.position.set(0, 0, -10);
      target.g.rotation.y = 0;
      setTimeout(() => weapons.fire(state, player), 250);
      setTimeout(() => hud.hit(false, true), 8500);
    }
    if (name === 'plant') {
      const defender = bots.bots[4];
      defender.g.position.set(-10.5, 0, -20.5);
      defender.g.rotation.y = Math.atan2(player.x - defender.g.position.x, player.z - defender.g.position.z);
    }
    hud.hideStart();
  }
  function render() { map.animate(time); bots.animate(time); weapons.animate(time); }
  return { step, render, setupShot, setLocked(v) { locked = v; if (v) { hud.hideStart(); audio.init(); } else if (!ctx.demo) hud.pause(); } };
}
