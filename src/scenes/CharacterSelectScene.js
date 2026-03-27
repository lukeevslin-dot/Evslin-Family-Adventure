import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';
import { DIFFICULTY_CONFIG } from '../utils/difficulty.js';

const CHARACTERS = [
  { key: 'luke',    name: 'Luke',    desc: 'The Dad — bold & strong' },
  { key: 'sokchea', name: 'Sokchea', desc: 'The Mom — wise & kind' },
  { key: 'finley',  name: 'Finley',  desc: 'Age 9 — fast & clever' },
  { key: 'levi',    name: 'Levi',    desc: 'Age 6 — curious & brave' },
];

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'CharacterSelectScene' }); }

  create() {
    this.selected = null;
    this.cards = [];

    // Background
    this.add.image(400, 300, 'star_bg');
    const gr = this.add.graphics();
    gr.fillStyle(0x4a9a30); gr.fillRect(0, 530, 800, 70);

    // Title
    this.add.text(400, 30, 'Choose Your Adventurer!', {
      fontSize: '36px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#AA6600', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(400, 72, 'Your character determines the difficulty of each battle', {
      fontSize: '14px', fontFamily: 'Arial', color: '#AACCFF',
    }).setOrigin(0.5);

    // Layout: 2 cols × 2 rows
    const colX = [220, 580];
    const rowY = [210, 420];

    CHARACTERS.forEach((char, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = colX[col];
      const y = rowY[row];
      this.createCard(char, x, y, i);
    });

    // Start button (disabled until selection)
    this.startBtnImg = this.add.image(400, 566, 'btn').setScale(0.9).setAlpha(0.5);
    this.startBtnText = this.add.text(400, 564, 'Choose your adventurer!', {
      fontSize: '20px', fontFamily: 'Arial', color: '#5C2E0A', fontStyle: 'bold',
    }).setOrigin(0.5);

    audioManager.playTheme('title');
    this.cameras.main.fadeIn(500);
  }

  createCard(char, x, y, index) {
    const diff = DIFFICULTY_CONFIG[char.key];
    const card = this.add.image(x, y, 'char_card');
    const sprite = this.add.image(x, y - 28, char.key).setScale(2.2);
    const name = this.add.text(x, y + 44, char.name, {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#FFE0A0', fontStyle: 'bold',
    }).setOrigin(0.5);
    const desc = this.add.text(x, y + 64, char.desc, {
      fontSize: '13px', fontFamily: 'Arial', color: '#AACCFF',
    }).setOrigin(0.5);
    // Difficulty badge
    this.add.text(x, y + 84, diff.stars, {
      fontSize: '13px', fontFamily: 'Arial', color: diff.color,
    }).setOrigin(0.5);
    this.add.text(x, y + 100, diff.label, {
      fontSize: '12px', fontFamily: 'Arial', color: diff.color, fontStyle: 'bold',
    }).setOrigin(0.5);

    card.setInteractive({ useHandCursor: true });

    card.on('pointerover', () => {
      if (this.selected !== index) card.setTint(0xDDCCFF);
    });
    card.on('pointerout', () => {
      if (this.selected !== index) card.clearTint();
    });
    card.on('pointerdown', () => this.selectCharacter(index, char.key));

    this.cards.push({ card, sprite, name, desc, char, index });
  }

  selectCharacter(index, key) {
    // Deselect previous
    this.cards.forEach(({ card, sprite }, i) => {
      if (i === this.selected) {
        this.tweens.killTweensOf(sprite);
        sprite.y = this.cards[i].baseY;
        card.setTexture('char_card');
        card.clearTint();
      }
    });

    this.selected = index;
    const { card, sprite } = this.cards[index];

    // Store base Y for tween reset
    this.cards[index].baseY = this.cards[index].baseY ?? sprite.y;

    card.setTexture('char_selected');
    card.clearTint();

    // Bob animation
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 10,
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Activate start button
    this.startBtnImg.setAlpha(1);
    this.startBtnText.setText('Start Adventure!');
    this.startBtnText.setFontSize(24);

    if (!this._startListenerAdded) {
      this._startListenerAdded = true;
      this.startBtnImg.setInteractive({ useHandCursor: true });
      this.startBtnImg.on('pointerover', () => this.startBtnImg.setScale(0.95));
      this.startBtnImg.on('pointerout',  () => this.startBtnImg.setScale(0.9));
      this.startBtnImg.on('pointerdown', () => this.startGame());
    }
  }

  startGame() {
    if (this.selected === null) return;
    const charKey = this.cards[this.selected].char.key;
    this.registry.set('selectedCharacter', charKey);

    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(400, () => this.scene.start('Island1Scene'));
  }
}
