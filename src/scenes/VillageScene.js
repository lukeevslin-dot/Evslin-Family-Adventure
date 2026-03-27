import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';

// Tasks the player must complete using their crystal magic
const TASKS = [
  { type: 'house',  x: 185, y: 210, label: 'Build a hale (house)' },
  { type: 'house',  x: 420, y: 175, label: 'Build a hale (house)' },
  { type: 'house',  x: 215, y: 420, label: 'Build a hale (house)' },
  { type: 'garden', x: 560, y: 240, label: 'Grow a taro garden' },
  { type: 'garden', x: 570, y: 410, label: 'Grow a taro garden' },
];

const VILLAGER_POSITIONS = [
  { x: 310, y: 295 }, { x: 440, y: 345 },
  { x: 350, y: 390 }, { x: 480, y: 280 },
];

export default class VillageScene extends Phaser.Scene {
  constructor() { super({ key: 'VillageScene' }); }

  create() {
    // Reset task state
    this.taskObjects = [];
    this.tasksLeft   = TASKS.length;
    this.allDone     = false;
    this.dockReady   = false;
    this.interacting = false;
    this.transitioning = false;

    if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');

    // ── Background ────────────────────────────────────────────────────────────
    // Sky
    const sky = this.add.graphics();
    sky.fillStyle(0x87CEEB); sky.fillRect(0, 0, 800, 200);
    // Grass
    sky.fillStyle(0x4AAA30); sky.fillRect(0, 150, 800, 420);
    // Sandy path winding through village
    sky.fillStyle(0xD4B870); sky.fillEllipse(380, 320, 520, 200);
    sky.fillStyle(0xDDBB7A); sky.fillEllipse(360, 350, 380, 120);
    // Beach / ocean at bottom
    sky.fillStyle(0xF5DFA0); sky.fillRect(0, 530, 800, 40);
    sky.fillStyle(0x1A6B9A); sky.fillRect(0, 565, 800, 35);
    sky.fillStyle(0x2280BB); sky.fillRect(0, 575, 800, 25);

    // Palm trees scattered around edges
    const treeSpots = [
      [50,180],[130,140],[700,160],[750,200],
      [60,450],[80,500],[720,470],[740,510],
      [340,140],[460,145],
    ];
    treeSpots.forEach(([x, y]) => this.add.image(x, y, 'tree').setOrigin(0.5, 1).setDepth(2));

    // ── Dock (right side) ─────────────────────────────────────────────────────
    const dock = this.add.graphics().setDepth(3);
    dock.fillStyle(0x7B4A22);
    for (let y = 275; y <= 355; y += 16) dock.fillRect(710, y, 90, 12);
    dock.fillStyle(0x4A2808);
    for (let dx = 720; dx < 800; dx += 22) dock.fillRect(dx, 272, 7, 96);
    // Canoe waiting at dock
    this.add.image(760, 400, 'boat').setScale(0.9).setDepth(4);
    this.dockX = 755; this.dockY = 320;
    this.add.text(760, 260, 'Waʻa dock', {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFEEBB',
      stroke: '#333300', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);

    // ── Task objects ──────────────────────────────────────────────────────────
    TASKS.forEach((task, i) => {
      const emptyKey = task.type === 'house' ? 'house_plot' : 'garden_plot';
      const sprite = this.add.image(task.x, task.y, emptyKey).setScale(1.7).setDepth(5);
      // Pulse tween so kids can spot interactable objects
      this.tweens.add({
        targets: sprite, scaleX: 1.85, scaleY: 1.85,
        duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      const hint = this.add.text(task.x, task.y + 44, task.type === 'house' ? '🏠 build here' : '🌱 grow here', {
        fontSize: '12px', fontFamily: 'Arial', color: '#FFFFAA',
        stroke: '#334400', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(6);
      this.taskObjects.push({ ...task, sprite, hint, done: false, index: i });
    });

    // ── Villagers ─────────────────────────────────────────────────────────────
    this.villagers = VILLAGER_POSITIONS.map(({ x, y }, i) => {
      const sprite = this.add.image(x, y, 'villager').setScale(1.5).setDepth(6);
      this.tweens.add({
        targets: sprite,
        x: x + Phaser.Math.Between(-35, 35),
        y: y + Phaser.Math.Between(-25, 25),
        duration: 1800 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      return { sprite, baseX: x, baseY: y };
    });

    // ── Player (magical) ──────────────────────────────────────────────────────
    const charKey = this.registry.get('selectedCharacter') || 'luke';
    this.player = this.physics.add.sprite(80, 300, charKey).setScale(2.0).setDepth(8);
    this.player.body.setSize(24, 32).setOffset(6, 12);
    this.player.setCollideWorldBounds(true);

    // Magic aura that follows player
    this.aura = this.add.image(80, 300, 'magic_aura').setScale(2.8).setAlpha(0.45).setDepth(7);
    this.tweens.add({ targets: this.aura, scale: 3.2, alpha: 0.25, duration: 900, yoyo: true, repeat: -1 });

    // ── UI ────────────────────────────────────────────────────────────────────
    this.add.text(400, 16, '🏡  Kauaʻi Village — Use your magic!', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#4A2800', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);

    this.progressText = this.add.text(400, 44, `Built & grown: 0 / ${TASKS.length}`, {
      fontSize: '15px', fontFamily: 'Arial', color: '#CCFFCC',
      stroke: '#003300', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    this.interactPrompt = this.add.text(400, 568, '', {
      fontSize: '17px', fontFamily: 'Arial', color: '#FFFF88',
      stroke: '#333300', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    // Intro message
    const intro = this.add.text(400, 300, '✨ You have crystal magic!\nWalk to plots and press SPACE.', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#FFFFFF',
      stroke: '#0044AA', strokeThickness: 5, align: 'center',
      backgroundColor: '#00000088', padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(25);
    this.time.delayedCall(2600, () => {
      this.tweens.add({ targets: intro, alpha: 0, duration: 600, onComplete: () => intro.destroy() });
    });

    // ── Controls ──────────────────────────────────────────────────────────────
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.wasd     = this.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    audioManager.playTheme('village');
    this.cameras.main.fadeIn(800);
  }

  doTask(task) {
    if (task.done || this.interacting) return;
    this.interacting = true;
    task.done = true;
    this.tweens.killTweensOf(task.sprite);

    this.cameras.main.flash(300, 80, 220, 255);

    // Sparkle burst
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 55, () => {
        const sp = this.add.image(
          task.x + Phaser.Math.Between(-36, 36),
          task.y + Phaser.Math.Between(-36, 36),
          'sparkle',
        ).setDepth(12).setScale(1.3);
        this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 35, duration: 550, onComplete: () => sp.destroy() });
      });
    }

    this.time.delayedCall(420, () => {
      task.sprite.setTexture(task.type === 'house' ? 'house_built' : 'garden_grown').setScale(1.7);
      task.hint.destroy();

      this.tasksLeft--;
      const done = TASKS.length - this.tasksLeft;
      this.progressText.setText(`Built & grown: ${done} / ${TASKS.length}`);

      if (this.tasksLeft === 0) this.onAllDone();
      this.interacting = false;
    });
  }

  onAllDone() {
    this.allDone = true;
    this.dockReady = true;

    this.cameras.main.flash(500, 255, 220, 80);
    this.progressText.setText('✨ Village is ready! Lead your people to the waʻa →').setColor('#FFD700');

    // Villagers cheer and walk toward dock
    this.villagers.forEach((v, i) => {
      this.tweens.killTweensOf(v.sprite);
      this.time.delayedCall(i * 280, () => {
        this.tweens.add({
          targets: v.sprite,
          x: 695 + (i % 2) * 22,
          y: 300 + Math.floor(i / 2) * 28,
          duration: 1800, ease: 'Quad.easeInOut',
        });
      });
    });

    // Celebratory sparkles around each built object
    this.taskObjects.forEach((t, i) => {
      this.time.delayedCall(i * 120, () => {
        const sp = this.add.image(t.x, t.y - 30, 'sparkle').setDepth(10).setScale(1.1);
        this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 30, duration: 700, onComplete: () => sp.destroy() });
      });
    });
  }

  update() {
    if (!this.player?.body) return;

    const speed = 160;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown  || this.wasd.A.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx =  speed;
    if (this.cursors.up.isDown    || this.wasd.W.isDown) vy = -speed;
    if (this.cursors.down.isDown  || this.wasd.S.isDown) vy =  speed;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    this.player.setVelocity(vx, vy);
    this.player.setDepth(2 + this.player.y / 1000);

    // Aura tracks player
    this.aura.x = this.player.x;
    this.aura.y = this.player.y;

    // ── Proximity checks ──────────────────────────────────────────────────────
    if (!this.interacting) {
      // Check task zones
      if (!this.allDone) {
        let nearTask = null;
        for (const task of this.taskObjects) {
          if (task.done) continue;
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, task.x, task.y);
          if (dist < 65) { nearTask = task; break; }
        }
        if (nearTask) {
          this.interactPrompt.setText(`SPACE — Use magic: ${nearTask.label}`).setAlpha(1);
          if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.doTask(nearTask);
          return;
        }
      }

      // Check dock
      if (this.dockReady) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.dockX, this.dockY);
        if (dist < 75) {
          this.interactPrompt.setText('SPACE — Board the waʻa canoes!').setAlpha(1);
          if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.launchCanoes();
          return;
        }
      }
    }

    this.interactPrompt.setAlpha(0);
  }

  launchCanoes() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.player.setVelocity(0, 0);
    this.cameras.main.flash(400, 255, 220, 80);
    this.time.delayedCall(400, () => {
      this.cameras.main.fade(700, 0, 0, 0);
      this.time.delayedCall(700, () => this.scene.start('VillageEndScene'));
    });
  }
}
