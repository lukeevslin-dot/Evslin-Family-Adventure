import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';
import { getDifficulty } from '../utils/difficulty.js';

// gem_0=red, gem_1=blue, gem_2=green, gem_3=yellow, gem_4=purple
const GEM_NAMES  = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];
const GEM_COLORS = ['#FF6666', '#6699FF', '#66FF88', '#FFE566', '#CC88FF'];

export default class SlidingPuzzleScene extends Phaser.Scene {
  constructor() { super({ key: 'SlidingPuzzleScene' }); }

  init(data) { this.callerKey = data.callerKey; }

  create() {
    const diff          = getDifficulty(this.registry);
    this.COLOR_COUNT    = diff.colorCount;
    this.COLOR_TARGET   = diff.colorTarget;
    this.GEM_FALL_SPEED = diff.gemFallSpeed;
    this.GEM_SPAWN_MS   = diff.gemSpawnMs;

    this.caught     = 0;
    this.lives      = 3;
    this.won        = false;
    this.activeGems = [];

    // Which gem indices are in play (always 0 = red as target to start)
    this.gemPool    = [];
    for (let i = 0; i < this.COLOR_COUNT; i++) this.gemPool.push(i);
    this.targetIndex = 0;

    // ── UI ──────────────────────────────────────────────────────────────────

    // Dim overlay
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.78);

    // Monster
    this.add.image(650, 170, 'ice_golem').setScale(1.8);
    this.add.text(650, 50, 'COLOR RUSH!', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#88CCFF',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(650, 280, 'Ice Golem', { fontSize: '16px', fontFamily: 'Arial', color: '#AADDFF' }).setOrigin(0.5);
    this.add.text(650, 300, `${diff.stars} ${diff.label}`, {
      fontSize: '13px', fontFamily: 'Arial', color: diff.color,
    }).setOrigin(0.5);

    // Target color display
    this.add.text(150, 44, 'CATCH THE', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF',
    }).setOrigin(0.5);
    this.targetGemIcon = this.add.image(225, 44, `gem_${this.targetIndex}`).setScale(1.8);
    this.targetLabel   = this.add.text(310, 44, `${GEM_NAMES[this.targetIndex]} GEMS!`, {
      fontSize: '22px', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      color: GEM_COLORS[this.targetIndex], stroke: '#000', strokeThickness: 4,
    }).setOrigin(0, 0.5);

    // Progress bar
    this.add.rectangle(300, 82, 360, 20, 0x1a1a3a).setStrokeStyle(2, 0x4444AA);
    this.progressBar  = this.add.rectangle(300 - 180, 82, 0, 16, 0x44CCFF).setOrigin(0, 0.5);
    this.progressText = this.add.text(300, 82, `0 / ${this.COLOR_TARGET}`, {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(2);

    // Lives (hearts)
    this.heartImages = [];
    this.add.text(60, 106, 'Lives:', { fontSize: '16px', fontFamily: 'Arial', color: '#FFF' }).setOrigin(0, 0.5);
    for (let i = 0; i < this.lives; i++) {
      this.heartImages.push(this.add.image(110 + i * 30, 106, 'heart').setScale(0.9));
    }

    this.PLAY_X1 = 40;
    this.PLAY_X2 = 560;
    this.PLAY_TOP = 124;
    this.PLAY_BOT = 570;

    // Bottom line
    this.add.rectangle(300, this.PLAY_BOT, 530, 3, 0xFF4444, 0.5);

    // Status
    this.statusText = this.add.text(300, 545, `Tap the ${GEM_NAMES[this.targetIndex].toLowerCase()} gems!`, {
      fontSize: '17px', fontFamily: 'Arial', color: '#FFCCAA',
    }).setOrigin(0.5);

    audioManager.playTheme('battle');
    this.cameras.main.fadeIn(300);

    this.spawnGem();
    this.spawnTimer = this.time.addEvent({
      delay: this.GEM_SPAWN_MS, loop: true,
      callback: this.spawnGem, callbackScope: this,
    });
  }

  spawnGem() {
    if (this.won) return;
    const gemIndex = this.gemPool[Phaser.Math.Between(0, this.gemPool.length - 1)];
    const isTarget = gemIndex === this.targetIndex;
    const x        = Phaser.Math.Between(this.PLAY_X1 + 20, this.PLAY_X2 - 20);

    const gem = this.add.image(x, this.PLAY_TOP, `gem_${gemIndex}`)
      .setScale(1.4).setInteractive({ useHandCursor: true });
    gem.gemIndex = gemIndex;
    gem.isTarget = isTarget;
    gem.alive    = true;

    const dist     = this.PLAY_BOT - this.PLAY_TOP;
    const duration = (dist / this.GEM_FALL_SPEED) * 1000;
    const tween    = this.tweens.add({
      targets: gem, y: this.PLAY_BOT, duration, ease: 'Linear',
      onComplete: () => this.onGemReachBottom(gem),
    });

    gem.on('pointerdown', () => this.onGemClick(gem, tween));
    gem.on('pointerover', () => { if (gem.alive) gem.setScale(1.7); });
    gem.on('pointerout',  () => { if (gem.alive) gem.setScale(1.4); });

    this.activeGems.push(gem);
  }

  onGemClick(gem, tween) {
    if (!gem.alive || this.won) return;
    gem.alive = false;
    tween.stop();
    this.activeGems = this.activeGems.filter(g => g !== gem);

    if (gem.isTarget) {
      this.caught++;
      this.updateProgress();
      this.burstEffect(gem.x, gem.y, true);
      gem.destroy();
      if (this.caught >= this.COLOR_TARGET) {
        this.winBattle();
      } else {
        this.statusText.setText(`${this.COLOR_TARGET - this.caught} more to go!`).setColor('#FFCCAA');
      }
    } else {
      this.burstEffect(gem.x, gem.y, false);
      this.cameras.main.shake(180, 0.005);
      this.statusText.setText(`Oops! Catch the ${GEM_NAMES[this.targetIndex].toLowerCase()} ones!`).setColor('#FF8888');
      this.time.delayedCall(800, () => { if (!this.won) this.statusText.setColor('#FFCCAA'); });
      gem.destroy();
    }
  }

  onGemReachBottom(gem) {
    if (!gem.alive || this.won) return;
    gem.alive = false;
    this.activeGems = this.activeGems.filter(g => g !== gem);

    if (gem.isTarget) {
      this.lives = Math.max(0, this.lives - 1);
      this.updateHearts();
      this.cameras.main.shake(200, 0.006);
      this.statusText.setText('Missed one! Don\'t let them fall!').setColor('#FF8888');
      this.time.delayedCall(600, () => { if (!this.won) this.statusText.setColor('#FFCCAA'); });
      if (this.lives <= 0) this.resetRound();
    }
    gem.destroy();
  }

  resetRound() {
    [...this.activeGems].forEach(g => { g.alive = false; g.destroy(); });
    this.activeGems = [];
    this.lives  = 3;
    this.caught = 0;
    this.updateHearts();
    this.updateProgress();
    this.statusText.setText(`Starting over! Catch the ${GEM_NAMES[this.targetIndex].toLowerCase()} gems!`).setColor('#FFAAAA');
  }

  burstEffect(x, y, success) {
    const count = success ? 6 : 3;
    for (let i = 0; i < count; i++) {
      const sp = this.add.image(x, y, 'sparkle')
        .setScale(success ? 1.0 : 0.5).setTint(success ? 0xFFFFFF : 0xFF4444).setDepth(10);
      const angle = (i / count) * Math.PI * 2;
      const dist  = Phaser.Math.Between(20, 50);
      this.tweens.add({
        targets: sp,
        x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist,
        alpha: 0, scale: 0.1, duration: success ? 400 : 250,
        onComplete: () => sp.destroy(),
      });
    }
  }

  updateProgress() {
    const pct = Math.min(this.caught / this.COLOR_TARGET, 1);
    this.progressBar.width = pct * 360;
    this.progressText.setText(`${this.caught} / ${this.COLOR_TARGET}`);
  }

  updateHearts() {
    this.heartImages.forEach((h, i) => h.setTexture(i < this.lives ? 'heart' : 'heart_empty'));
  }

  winBattle() {
    if (this.won) return;
    this.won = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    [...this.activeGems].forEach(g => { g.alive = false; g.destroy(); });

    this.statusText.setText('🎉 Ice Golem defeated!').setColor('#FFD700');

    for (let i = 0; i < 14; i++) {
      this.time.delayedCall(i * 70, () => {
        const sp = this.add.image(
          Phaser.Math.Between(40, 560), Phaser.Math.Between(120, 520), 'sparkle',
        ).setScale(1.4).setDepth(10);
        this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 40, duration: 600, onComplete: () => sp.destroy() });
      });
    }

    this.time.delayedCall(1500, () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        const island = this.scene.get(this.callerKey);
        this.scene.stop('SlidingPuzzleScene');
        island.onBattleWon();
      });
    });
  }
}
