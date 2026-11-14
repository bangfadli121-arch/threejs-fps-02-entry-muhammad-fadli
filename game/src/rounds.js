export function stepRounds(s, dt, bots, economy, hud, audio) {
  s.left -= dt;
  if (s.planted) { s.plant -= dt; if (s.plant <= 0) finish(s, 0, 'SITE DESTROYED', bots, economy, hud, audio); }
  else if (s.left <= 0 && s.phase === 'live') finish(s, 1, 'TIME EXPIRED', bots, economy, hud, audio);
  if (s.phase === 'freeze' && s.left <= 0) { s.phase = 'live'; s.left = 105; audio.play('horn'); hud.banner('ROUND LIVE'); }
  if (s.phase === 'end' && s.left <= 0) {
    s.round++; s.phase = 'freeze'; s.left = 12; s.planted = false; s.plant = 0; s.alive = true;
    bots.resetRound(); hud.banner('BUY PHASE');
    if (s.round > 15 || Math.max(...s.score) >= 8) hud.banner('SANDLINE — MATCH COMPLETE');
  }
}
function finish(s, winner, text, bots, economy, hud, audio) {
  s.phase = 'end'; s.left = 7; s.score[winner]++; economy.roundResult(winner === 0); hud.banner(text); audio.play(winner === 0 ? 'win' : 'loss'); bots.endRound();
}
