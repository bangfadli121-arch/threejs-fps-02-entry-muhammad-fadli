export function createInput(canvas) {
  const keys = new Set(), edges = new Set();
  const api = { keys, dx: 0, dy: 0, firing: false, pressed: (k) => edges.has(k), clear() { edges.clear(); this.dx = this.dy = 0; } };
  addEventListener('keydown', e => { if (!keys.has(e.code)) edges.add(e.code); keys.add(e.code); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  addEventListener('mousemove', e => { if (document.pointerLockElement === canvas) { api.dx += e.movementX; api.dy += e.movementY; } });
  addEventListener('mousedown', e => { if (e.button === 0) api.firing = true; });
  addEventListener('mouseup', e => { if (e.button === 0) api.firing = false; });
  return api;
}
