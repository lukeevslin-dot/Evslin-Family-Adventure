import Phaser from 'phaser';
import { reset } from '../utils/SaveManager.js';
import { audioManager } from '../utils/AudioManager.js';

export default class CrystalCaveScene extends Phaser.Scene {
  constructor() { super({ key: 'CrystalCaveScene' }); }

  create() {
    const charKey = this.registry.get('selectedCharacter') || 'luke';

    this._flying  = false;
    this._flyDone = false;
    this._flyChar = null;
    this._flyAura = null;
    this._flyHint = null;

    // Cave background
    this.add.image(400, 300, 'cave_bg');

    // Ambient crystal glow (pulsing circle)
    const glow = this.add.graphics();
    glow.fillStyle(0x40DFFF, 0.08); glow.fillCircle(400, 340, 200);
    this.tweens.add({ targets: glow, alpha: 0.4, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Big central crystal
    const bigCrystal = this.add.image(400, 300, 'crystal_item').setScale(5).setDepth(2);
    this.tweens.add({ targets: bigCrystal, y: 310, scaleX: 5.2, scaleY: 5.2, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Character walks in from bottom
    const character = this.add.image(400, 680, charKey).setScale(2.5).setDepth(3);

    // Walk to cave center
    this.tweens.add({
      targets: character, y: 490, duration: 1200, ease: 'Quad.easeOut',
      onComplete: () => this.absorptionPhase(character, bigCrystal),
    });

    audioManager.playTheme('title');
    this.cameras.main.fadeIn(800);
  }

  absorptionPhase(character, bigCrystal) {
    const title = this.add.text(400, 80, 'You found it!', {
      fontSize: '42px', fontFamily: 'Georgia, serif', color: '#80DFFF',
      stroke: '#003366', strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: title, alpha: 1, duration: 800 });

    this.add.text(400, 140, 'The Crystal Cave!', {
      fontSize: '32px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#AA6600', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    // Four crystals fly in from corners
    this.time.delayedCall(1000, () => {
      const corners = [[80,80],[720,80],[80,520],[720,520]];
      corners.forEach(([x,y], i) => {
        const c = this.add.image(x, y, 'crystal_item').setScale(2).setAlpha(0).setDepth(5);
        this.tweens.add({ targets: c, alpha: 1, duration: 200 });
        this.time.delayedCall(i * 200, () => {
          this.tweens.add({
            targets: c, x: 400, y: 300, scale: 0, duration: 700, ease: 'Quad.easeIn',
            onComplete: () => { c.destroy(); this.spawnSparkleAt(400, 300); },
          });
        });
      });
    });

    // Character glows with magic
    this.time.delayedCall(2400, () => {
      const aura = this.add.image(400, 490, 'magic_aura').setScale(3).setAlpha(0).setDepth(2);
      this.tweens.add({ targets: aura, alpha: 1, scale: 4, duration: 800, ease: 'Quad.easeOut' });
      this.tweens.add({ targets: character, tint: 0x80DFFF, duration: 800 });
      this.cameras.main.flash(400, 80, 220, 255);
      this.tweens.add({ targets: bigCrystal, alpha: 0, scale: 0, duration: 600 });

      this.time.delayedCall(900, () => this.magicPhase(character, aura));
    });
  }

  magicPhase(character, aura) {
    this.add.text(400, 380, '✨ You have magical powers! ✨', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#AA6600', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(10);

    // Rise up a little, then hand control to player
    this.tweens.add({
      targets: [character, aura], y: 260, duration: 900, ease: 'Quad.easeOut',
      onComplete: () => this.startFlyingPhase(character, aura),
    });
  }

  startFlyingPhase(character, aura) {
    // Sky overlay — covers the cave below
    const sky = this.add.graphics().setDepth(12);
    // Gradient sky: deep blue at top → lighter near horizon
    sky.fillStyle(0x0A3A80); sky.fillRect(0, 0, 800, 600);
    sky.fillStyle(0x1A6AB0); sky.fillRect(0, 150, 800, 200);
    sky.fillStyle(0x2A90D0); sky.fillRect(0, 300, 800, 200);
    sky.fillStyle(0x3AAAE0); sky.fillRect(0, 420, 800, 180);

    // Stars (upper sky)
    sky.fillStyle(0xFFFFFF);
    [[60,30],[150,60],[280,20],[420,50],[560,30],[680,55],[740,25],[90,110],[350,90]].forEach(([x,y]) => {
      sky.fillRect(x, y, 2, 2);
    });

    // Drifting clouds at depth 13
    for (const [x, y, r1, r2] of [[100,160,28,22],[340,120,36,24],[600,180,30,20],[730,140,22,16]]) {
      const cl = this.add.graphics().setDepth(13);
      cl.fillStyle(0xFFFFFF, 0.7);
      cl.fillCircle(x, y, r1); cl.fillCircle(x + r1, y, r2); cl.fillCircle(x + r1 * 2, y, r1 * 0.7);
      cl.fillRect(x - 4, y, r1 * 2 + r2 + 8, r1 * 0.6);
      this.tweens.add({ targets: cl, x: 25, duration: 6000 + x * 8, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Island silhouette at far left (Kauaʻi destination)
    const isle = this.add.graphics().setDepth(13);
    isle.fillStyle(0x2A6A18); isle.fillEllipse(38, 520, 90, 60);
    isle.fillStyle(0x3A8A28); isle.fillEllipse(30, 510, 55, 40);

    // Kauaʻi label
    this.add.text(38, 480, "Kauaʻi →", {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#CCFFCC',
      stroke: '#003300', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(14);

    // Bring character and aura to sky layer depth
    character.setDepth(15);
    aura.setDepth(14);

    // Hint text
    this._flyHint = this.add.text(400, 32, '🌤  Tap and hold to fly toward Kauaʻi!', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FFFFFF',
      stroke: '#003388', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(16);

    this.add.text(400, 62, '(Reach the island on the left)', {
      fontSize: '14px', fontFamily: 'Arial', color: '#AADDFF',
    }).setOrigin(0.5).setDepth(16);

    // Enable flight
    this._flyChar = character;
    this._flyAura = aura;
    this._flying  = true;
  }

  update() {
    if (!this._flying || this._flyDone || !this._flyChar) return;

    const ptr = this.input.activePointer;
    if (ptr.isDown) {
      // Move character toward pointer at fixed speed
      const speed = 3.5;
      const dx = ptr.x - this._flyChar.x;
      const dy = ptr.y - this._flyChar.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 6) {
        this._flyChar.x += (dx / dist) * speed;
        this._flyChar.y += (dy / dist) * speed;
      }
    }

    // Keep in bounds
    this._flyChar.x = Phaser.Math.Clamp(this._flyChar.x, 30, 770);
    this._flyChar.y = Phaser.Math.Clamp(this._flyChar.y, 50, 550);

    // Aura follows
    this._flyAura.x = this._flyChar.x;
    this._flyAura.y = this._flyChar.y;

    // Sparkle trail while flying
    if (Phaser.Math.Between(0, 4) === 0) {
      this.spawnSparkleAt(
        this._flyChar.x + Phaser.Math.Between(-20, 20),
        this._flyChar.y + Phaser.Math.Between(-20, 20),
      );
    }

    // Check if player reached Kauaʻi (left side)
    if (this._flyChar.x < 80) {
      this._flyDone = true;
      this._flying  = false;
      this.cameras.main.flash(400, 80, 220, 255);
      this.time.delayedCall(600, () => this.showEndScreen());
    }
  }

  showEndScreen() {
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(20);

    this.add.text(400, 95, '✨ You found the Crystal Cave! ✨', {
      fontSize: '36px', fontFamily: 'Georgia, serif', color: '#80DFFF',
      stroke: '#003388', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(21);

    this.add.text(400, 165, 'You crossed all four Hawaiian islands,\ndefeated every challenge, and unlocked\nyour family\'s magical powers!', {
      fontSize: '20px', fontFamily: 'Arial', color: '#FFFFFF', align: 'center',
    }).setOrigin(0.5).setDepth(21);

    const crystals = this.registry.get('crystals') || [false,false,false,false];
    const count = crystals.filter(Boolean).length;
    this.add.text(400, 280, `Crystals collected: ${'💎'.repeat(count)}`, {
      fontSize: '24px', fontFamily: 'Arial', color: '#80DFFF',
    }).setOrigin(0.5).setDepth(21);

    this.add.text(400, 345, '🏡  Now use your magic to help the village!', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#AAFFAA',
      stroke: '#006600', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(21);

    this.add.text(400, 400, 'Build hale, grow taro, and lead\nyour people across the islands.', {
      fontSize: '18px', fontFamily: 'Arial', color: '#CCFFCC', align: 'center',
    }).setOrigin(0.5).setDepth(21);

    const btnImg  = this.add.image(400, 510, 'btn').setDepth(21).setScale(1.1);
    const btnText = this.add.text(400, 508, 'Go to the Village!', {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#5C2E0A', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22);

    btnImg.setInteractive({ useHandCursor: true });
    btnImg.on('pointerover', () => btnImg.setScale(1.18));
    btnImg.on('pointerout',  () => btnImg.setScale(1.1));
    btnImg.on('pointerdown', () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => this.scene.start('VillageScene'));
    });

    this.time.addEvent({
      delay: 300, loop: true,
      callback: () => this.spawnSparkleAt(Phaser.Math.Between(100, 700), Phaser.Math.Between(80, 500)),
    });
  }

  spawnSparkleAt(x, y) {
    const sp = this.add.image(x, y, 'sparkle').setDepth(25).setScale(0.8 + Math.random());
    this.tweens.add({
      targets: sp, alpha: 0, y: y - 40, duration: 700,
      onComplete: () => sp.destroy(),
    });
  }
}
