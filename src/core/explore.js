// Single-world, route-guided free exploration.
// The generated worlds are built around authored flight corridors, not walkable terrain.
// Constraining translations to a corridor preserves their framing and avoids empty geometry.
import * as THREE from 'three';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const right = new THREE.Vector3(), up = new THREE.Vector3();
const rotation = new THREE.Quaternion();
const euler = new THREE.Euler(0, 0, 0, 'YXZ');

export class Explorer {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.yaw = 0; this.pitch = 0; this.lateral = 0; this.vertical = 0;
    this.auto = false; this.autoDir = 1; this.speedScale = 1;
    this.dragging = null;
    this.buttons = [...document.querySelectorAll('[data-move]')];
    const keyNames = new Set(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
    window.addEventListener('keydown', e => {
      if (!keyNames.has(e.code)) return;
      if (e.target?.closest?.('input, textarea, select, [contenteditable="true"], #atlas, #panel')) return;
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow')) e.preventDefault();
      if (this.auto && !e.code.startsWith('Shift')) this.auto = false;
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
    canvas.addEventListener('pointerdown', e => {
      if (e.button !== 0 || this.dragging != null) return;
      this.dragging = e.pointerId;
      this.lastX = e.clientX; this.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (this.dragging !== e.pointerId) return;
      const dx = e.clientX - this.lastX, dy = e.clientY - this.lastY;
      this.lastX = e.clientX; this.lastY = e.clientY;
      this.yaw = clamp(this.yaw - dx * 0.0034, -Math.PI * 0.98, Math.PI * 0.98);
      this.pitch = clamp(this.pitch - dy * 0.0034, -1.1, 1.1);
    });
    const release = e => { if (e.pointerId === this.dragging) this.dragging = null; };
    canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
    for (const b of this.buttons) {
      const code = b.dataset.move;
      b.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        b.setPointerCapture(e.pointerId); this.keys.add(code);
        this.auto = false;
      });
      for (const event of ['pointerup','pointercancel','lostpointercapture']) b.addEventListener(event, () => this.keys.delete(code));
    }
    canvas.addEventListener('wheel', e => {
      if (e.ctrlKey) return;
      e.preventDefault();
      this.speedScale = clamp(this.speedScale * (e.deltaY > 0 ? 0.9 : 1.1), 0.3, 4);
    }, { passive:false });
  }
  attach(world) {
    this.world = world;
    this.yaw = 0; this.pitch = 0; this.lateral = 0; this.vertical = 0;
    this.auto = false; this.autoDir = 1;
    world.dist = world.path.length * 0.12;
  }
  reset() { if (this.world) this.attach(this.world); }
  toggleAuto() { this.auto = !this.auto; this.autoDir = 1; return this.auto; }
  advance(world, dt) {
    if (!dt) return;
    const L = world.path.length;
    // The viewer may fly backwards, but does not cross either portal into another world.
    const base = clamp(L / Math.max(20, world.duration), 1.3, 18);
    const sprint = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const v = base * (sprint ? 2.5 : 1.15) * this.speedScale * dt;
    const has = (a,b) => this.keys.has(a) || this.keys.has(b);
    let forward = (has('KeyW','ArrowUp') ? 1 : 0) - (has('KeyS','ArrowDown') ? 1 : 0);
    if (this.auto) {
      if (world.dist >= L * 0.87) this.autoDir = -1;
      if (world.dist <= L * 0.10) this.autoDir = 1;
      forward = this.autoDir * 0.7;
    }
    world.dist = clamp(world.dist + forward * v, L * 0.04, L * 0.92);
    const corridor = clamp(L * 0.012, 2, 9);
    const side = (has('KeyD','ArrowRight') ? 1 : 0) - (has('KeyA','ArrowLeft') ? 1 : 0);
    const rise = (this.keys.has('KeyE') ? 1 : 0) - (this.keys.has('KeyQ') ? 1 : 0);
    this.lateral = clamp(this.lateral + side * v * 0.65, -corridor, corridor);
    this.vertical = clamp(this.vertical + rise * v * 0.55, -corridor * 0.6, corridor * 0.6);
  }
  apply(camera, baseQuaternion) {
    right.set(1, 0, 0).applyQuaternion(baseQuaternion);
    up.set(0, 1, 0).applyQuaternion(baseQuaternion);
    camera.position.addScaledVector(right, this.lateral).addScaledVector(up, this.vertical);
    euler.set(this.pitch, this.yaw, 0, 'YXZ');
    rotation.setFromEuler(euler);
    camera.quaternion.copy(baseQuaternion).multiply(rotation);
  }
}