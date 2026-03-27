import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';

const TOTAL_STROKES = 20;

export default class BoatScene extends Phaser.Scene {
  constructor() { super({ key: 'BoatScene' }); }

  init(data) {
    this.nextScene    = data.nextScene    || 'Island2Scene';
    this.toIslandName = data.toIslandName || 'Next Island';
  }

  create() {
    const charKey = this.registry.get('selectedCharacter') || 'luke';
    this.strokes  = 0;
    this.side     = 'left';  // alternates visually, but any tap counts
    this.done     = false;

    // Ocean background
    const gr = this.add.graphics();
    gr.fillStyle(0x1a6699); gr.fillRect(0, 0, 800, 600);
    gr.fillStyle(0x0d4466); gr.fillRect(0, 300, 800, 300);
    gr.fillStyle(0x3388BB); gr.fillRect(0, 290, 800, 30);

    // Animated waves
    for (let i = 0; i < 7; i++) {
      const w = this.add.rectangle(
        i * 130 - 60, 310 + (i % 3) * 18, 120, 10, 0x44AACC, 0.5,
      ).setOrigin(0);
      this.tweens.add({
        targets: w, x: w.x + 240, duration: 2200 + i * 250,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Clouds
    for (const [x, y] of [[120,60],[320,40],[580,80],[740,50]]) {
      const c = this.add.graphics();
      c.fillStyle(0xFFFFFF, 0.8);
      c.fillCircle(x, y, 22); c.fillCircle(x+24, y, 30); c.fillCircle(x+50, y, 22);
      c.fillRect(x-4, y, 58, 20);
      this.tweens.add({ targets: c, x: 30, duration: 8000 + x * 10, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Boat + character (start at left)
    this.boat      = this.add.image(120, 400, 'boat').setScale(1.5);
    this.character = this.add.image(120, 358, charKey).setScale(2.2);

    // Gentle bobbing
    this.tweens.add({
      targets: [this.boat, this.character], y: '+=12',
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // ── Header ──────────────────────────────────────────────────────────────
    this.add.text(400, 55, '🛶  Paddle the Waʻa!', {
      fontSize: '34px', fontFamily: 'Georgia, serif', color: '#FFFFFF',
      stroke: '#004466', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(400, 105, `Heading to: ${this.toIslandName}`, {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#AA6600', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── Progress bar ────────────────────────────────────────────────────────
    this.add.rectangle(400, 152, 500, 18, 0x002244).setOrigin(0.5);
    this.progressFill = this.add.rectangle(153, 152, 2, 14, 0x44DDFF).setOrigin(0, 0.5);
    this.strokeText   = this.add.text(400, 174, `Strokes: 0 / ${TOTAL_STROKES}`, {
      fontSize: '13px', fontFamily: 'Arial', color: '#88CCEE',
    }).setOrigin(0.5);

    // ── Tap buttons ─────────────────────────────────────────────────────────
    // Left paddle button
    const leftBtn = this.add.rectangle(200, 490, 220, 110, 0x003355, 0.7)
      .setStrokeStyle(3, 0x44AAFF)
      .setInteractive({ useHandCursor: true });
    this.leftArrow = this.add.text(200, 490, '◀', {
      fontSize: '64px', color: '#44CCFF', stroke: '#002244', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(200, 545, 'LEFT', { fontSize: '14px', fontFamily: 'Arial', color: '#88CCEE' }).setOrigin(0.5);

    // Right paddle button
    const rightBtn = this.add.rectangle(600, 490, 220, 110, 0x003355, 0.7)
      .setStrokeStyle(3, 0x44AAFF)
      .setInteractive({ useHandCursor: true });
    this.rightArrow = this.add.text(600, 490, '▶', {
      fontSize: '64px', color: '#44CCFF', stroke: '#002244', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(600, 545, 'RIGHT', { fontSize: '14px', fontFamily: 'Arial', color: '#88CCEE' }).setOrigin(0.5);

    // Dim the right side to start (showing left is next)
    this.rightArrow.setAlpha(0.3);
    rightBtn.setAlpha(0.5);

    leftBtn.on('pointerdown',  () => this.doStroke('left'));
    rightBtn.on('pointerdown', () => this.doStroke('right'));

    // Also allow tapping the middle ocean area as a fallback
    this.input.on('pointerdown', (ptr) => {
      if (this.done) return;
      // Only fire if not on a button (buttons handle themselves)
      if (ptr.y > 220 && ptr.y < 430) this.doStroke(this.side);
    });

    // Store button refs to toggle alpha
    this.leftBtn  = leftBtn;
    this.rightBtn = rightBtn;

    // Keyboard support (L/R arrows)
    this.cursors = this.input.keyboard.createCursorKeys();

    audioManager.playTheme('island');
    this.cameras.main.fadeIn(500);
  }

  update() {
    if (this.done) return;
    const leftJust  = Phaser.Input.Keyboard.JustDown(this.cursors.left);
    const rightJust = Phaser.Input.Keyboard.JustDown(this.cursors.right);
    if (leftJust)  this.doStroke('left');
    if (rightJust) this.doStroke('right');
  }

  doStroke(side) {
    if (this.done) return;
    this.strokes++;
    this.side = side === 'left' ? 'right' : 'left'; // toggle next expected side (visual only)

    // Flash pressed arrow, dim other, highlight next
    const pressed     = side === 'left' ? this.leftArrow  : this.rightArrow;
    const pressedBtn  = side === 'left' ? this.leftBtn    : this.rightBtn;
    const nextArrow   = side === 'left' ? this.rightArrow : this.leftArrow;
    const nextBtn     = side === 'left' ? this.rightBtn   : this.leftBtn;

    this.tweens.add({
      targets: pressed, alpha: 1, scaleX: 1.3, scaleY: 1.3, duration: 80,
      yoyo: true, onComplete: () => { pressed.setAlpha(0.3); pressedBtn.setAlpha(0.5); },
    });
    nextArrow.setAlpha(1);
    nextBtn.setAlpha(1);

    // Camera nudge
    this.cameras.main.shake(70, 0.003);

    // Wake particle
    const wake = this.add.graphics();
    wake.fillStyle(0xAADDFF, 0.45);
    wake.fillEllipse(this.boat.x - 55, this.boat.y + 22, 32, 9);
    this.tweens.add({ targets: wake, alpha: 0, x: wake.x - 45, duration: 700, onComplete: () => wake.destroy() });

    // Move boat rightward
    const progress = this.strokes / TOTAL_STROKES;
    const targetX  = 120 + progress * 650;
    this.tweens.add({ targets: [this.boat, this.character], x: targetX, duration: 280, ease: 'Quad.easeOut' });

    this.progressFill.width = Math.max(2, progress * 494);
    this.strokeText.setText(`Strokes: ${this.strokes} / ${TOTAL_STROKES}`);

    if (this.strokes >= TOTAL_STROKES) {
      this.done = true;
      this.leftArrow.setAlpha(0.3);
      this.rightArrow.setAlpha(0.3);
      this.time.delayedCall(500, () => {
        this.cameras.main.fade(600, 0, 0, 0);
        this.time.delayedCall(600, () => this.scene.start(this.nextScene));
      });
    }
  }
}
