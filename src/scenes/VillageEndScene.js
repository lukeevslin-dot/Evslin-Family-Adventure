import Phaser from 'phaser';
import { reset } from '../utils/SaveManager.js';
import { audioManager } from '../utils/AudioManager.js';

// Approximate positions and shapes of the Hawaiian island chain on the map
const ISLANDS = [
  { name: "Kauaʻi",  x: 120, y: 290, rx: 52, ry: 46, color: 0x3A9A28, hilite: 0x52BB3A },
  { name: "Oʻahu",   x: 270, y: 265, rx: 68, ry: 44, color: 0x2E8A20, hilite: 0x42A830 },
  { name: 'Maui',    x: 450, y: 280, rx: 80, ry: 48, color: 0x489A24, hilite: 0x60BB38 },
  { name: "Hawaiʻi", x: 650, y: 305, rx: 105, ry: 82, color: 0x5A7A18, hilite: 0x789A28 },
];

export default class VillageEndScene extends Phaser.Scene {
  constructor() { super({ key: 'VillageEndScene' }); }

  create() {
    // ── Ocean background ──────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(0x0A3A6A); bg.fillRect(0, 0, 800, 600);
    // Ocean shimmer bands
    bg.fillStyle(0x104A8A);
    for (let y = 20; y < 600; y += 40) bg.fillRect(0, y, 800, 18);
    bg.fillStyle(0x0E4078);
    for (let y = 38; y < 600; y += 40) bg.fillRect(0, y, 800, 4);

    // ── Island silhouettes ────────────────────────────────────────────────────
    ISLANDS.forEach(({ name, x, y, rx, ry, color, hilite }) => {
      const g = this.add.graphics().setDepth(3);
      // Shadow
      g.fillStyle(0x061828); g.fillEllipse(x + 4, y + 6, rx * 2, ry * 2);
      // Main land
      g.fillStyle(color); g.fillEllipse(x, y, rx * 2, ry * 2);
      // Highland / interior variation
      g.fillStyle(hilite); g.fillEllipse(x - 8, y - 10, rx * 1.2, ry * 1.0);
      // Volcano hint on Big Island
      if (name === "Hawaiʻi") {
        g.fillStyle(0xFF4400); g.fillCircle(x + 20, y - 20, 12);
        g.fillStyle(0xFF8800); g.fillCircle(x + 20, y - 22, 6);
      }
      // Beach fringe
      g.fillStyle(0xE8D898); g.fillEllipse(x, y + ry * 0.7, rx * 1.6, ry * 0.5);

      this.add.text(x, y + ry + 16, name, {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: '#FFFF99',
        stroke: '#0A2A4A', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(5);
    });

    // ── Village marker on Kauaʻi ─────────────────────────────────────────────
    const kauai = ISLANDS[0];
    this.add.text(kauai.x - 10, kauai.y - 16, '🏡', { fontSize: '18px' }).setOrigin(0.5).setDepth(6);

    // ── Canoes sailing to each island ─────────────────────────────────────────
    // All depart from village on Kauaʻi, fly to each island one by one
    ISLANDS.forEach(({ x, y }, i) => {
      this.time.delayedCall(600 + i * 700, () => {
        const canoe = this.add.image(kauai.x + 30, kauai.y, 'boat').setScale(0.45).setDepth(8);
        this.tweens.add({
          targets: canoe, x, y: y - 10,
          duration: 2000, ease: 'Quad.easeInOut',
          onComplete: () => {
            canoe.destroy();
            // Landing sparkles
            for (let j = 0; j < 5; j++) {
              const sp = this.add.image(
                x + Phaser.Math.Between(-22, 22),
                y + Phaser.Math.Between(-18, 18),
                'sparkle',
              ).setScale(1.1).setDepth(9);
              this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 28, duration: 550, onComplete: () => sp.destroy() });
            }
            // Village icon on each island
            this.add.text(x - 6, y - 14, '🏡', { fontSize: '16px' }).setOrigin(0.5).setDepth(6);
          },
        });
      });
    });

    // ── Header text ───────────────────────────────────────────────────────────
    this.add.text(400, 42, '🌺  Adventure Complete!  🌺', {
      fontSize: '36px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#AA6600', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(10);

    this.add.text(400, 90, 'The Evslin family united all the Hawaiian islands!', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#AAFFCC',
      stroke: '#003322', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);

    // ── Family character row ──────────────────────────────────────────────────
    const familyKeys = ['luke', 'sokchea', 'finley', 'levi'];
    const familyNames = ['Luke', 'Sokchea', 'Finley', 'Levi'];
    familyKeys.forEach((key, i) => {
      const fx = 220 + i * 120;
      const char = this.add.image(fx, 510, key).setScale(2.0).setDepth(10);
      this.tweens.add({ targets: char, y: 502, duration: 700 + i * 100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.text(fx, 542, familyNames[i], {
        fontSize: '13px', fontFamily: 'Arial', color: '#FFD700',
        stroke: '#4A2A00', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(10);
    });

    // ── Closing message ───────────────────────────────────────────────────────
    this.add.text(400, 460, 'Mahalo nui loa — thank you for playing!', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#CCFFFF',
      stroke: '#004455', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);

    // ── Play Again button ─────────────────────────────────────────────────────
    const btnImg  = this.add.image(400, 570, 'btn').setDepth(10).setScale(1.05);
    const btnText = this.add.text(400, 568, 'Play Again', {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#5C2E0A', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(11);

    btnImg.setInteractive({ useHandCursor: true });
    btnImg.on('pointerover', () => btnImg.setScale(1.12));
    btnImg.on('pointerout',  () => btnImg.setScale(1.05));
    btnImg.on('pointerdown', () => {
      reset();
      this.registry.set('crystals', [false, false, false, false]);
      this.registry.set('selectedCharacter', null);
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => this.scene.start('TitleScene'));
    });

    // ── Ongoing sparkle celebration ───────────────────────────────────────────
    this.time.addEvent({
      delay: 260, loop: true,
      callback: () => {
        const sp = this.add.image(
          Phaser.Math.Between(30, 770), Phaser.Math.Between(80, 440), 'sparkle',
        ).setDepth(12).setScale(0.7 + Math.random() * 0.8);
        this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 38, duration: 650, onComplete: () => sp.destroy() });
      },
    });

    audioManager.playTheme('village');
    this.cameras.main.fadeIn(900);
  }
}
