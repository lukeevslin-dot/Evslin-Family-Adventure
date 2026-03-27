import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';

export default class TitleScene extends Phaser.Scene {
  constructor() { super({ key: 'TitleScene' }); }

  create() {
    // Background
    this.add.image(400, 300, 'star_bg');

    // Ground strip
    const gr = this.add.graphics();
    gr.fillStyle(0x4a9a30);
    gr.fillRect(0, 440, 800, 160);
    gr.fillStyle(0x3d8a24);
    gr.fillRect(0, 440, 800, 20);

    // Decorative trees on sides
    for (let x of [60, 140, 660, 740]) {
      this.add.image(x, 440, 'tree').setOrigin(0.5, 1);
    }

    // Title shadow
    this.add.text(403, 113, 'Evslin Family Adventure', {
      fontSize: '44px', fontFamily: 'Georgia, serif', color: '#000000', alpha: 0.4,
    }).setOrigin(0.5);
    this.add.text(403, 163, 'A Journey to the Crystal Cave', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#000000', alpha: 0.4,
    }).setOrigin(0.5);

    // Title text
    this.add.text(400, 110, 'Evslin Family Adventure', {
      fontSize: '44px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#AA6600', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(400, 160, 'A Journey to the Crystal Cave', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#80DFFF',
      stroke: '#0044AA', strokeThickness: 4,
    }).setOrigin(0.5);

    // Floating crystal
    const crystal = this.add.image(400, 300, 'crystal_item').setScale(2.5);
    this.tweens.add({
      targets: crystal, y: 310, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Sparkle particles around crystal
    const sparkles = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const sp = this.add.image(400 + Math.cos(angle) * 50, 300 + Math.sin(angle) * 30, 'sparkle').setAlpha(0);
      sparkles.push({ obj: sp, angle, speed: 0.01 + Math.random() * 0.01 });
    }

    // Subtitle
    this.add.text(400, 380, 'An Evslin family adventure!', {
      fontSize: '22px', fontFamily: 'Arial', color: '#CCE8FF',
    }).setOrigin(0.5);

    // Play button
    const btnImg = this.add.image(400, 460, 'btn').setScale(1);
    const btnText = this.add.text(400, 458, 'PLAY', {
      fontSize: '32px', fontFamily: 'Georgia, serif', color: '#5C2E0A',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(400, 516, '📱  Tap or Click to Play', {
      fontSize: '15px', fontFamily: 'Arial', color: '#88BBDD',
    }).setOrigin(0.5);

    btnImg.setInteractive({ useHandCursor: true });
    btnImg.on('pointerover', () => { btnImg.setScale(1.05); btnText.setScale(1.05); });
    btnImg.on('pointerout',  () => { btnImg.setScale(1);    btnText.setScale(1); });
    btnImg.on('pointerdown', () => {
      audioManager.resume();
      audioManager.playTheme('title');
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('CharacterSelectScene'));
    });

    // Animate sparkles
    this.time.addEvent({
      delay: 50, loop: true,
      callback: () => {
        const t = this.time.now * 0.001;
        sparkles.forEach(({ obj, angle, speed }, i) => {
          const a = angle + t * (0.8 + i * 0.1);
          obj.x = 400 + Math.cos(a) * 55;
          obj.y = (crystal.y) + Math.sin(a) * 32;
          obj.setAlpha(0.4 + 0.4 * Math.sin(t * 3 + i));
        });
      },
    });

    this.cameras.main.fadeIn(600);
  }
}
