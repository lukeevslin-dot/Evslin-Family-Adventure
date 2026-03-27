import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';
import { getDifficulty } from '../utils/difficulty.js';

const PAD_COLORS  = [0xFF3333, 0x3366FF, 0x33CC55, 0xFFCC00];
const PAD_LABELS  = ['Red', 'Blue', 'Green', 'Yellow'];
const PAD_TINTS   = PAD_COLORS;
const FLASH_MS    = 600;
const GAP_MS      = 200;

const PAD_POS = [
  { x: 260, y: 310 },  // red  (top-left)
  { x: 400, y: 310 },  // blue (top-right)
  { x: 260, y: 440 },  // green (bottom-left)
  { x: 400, y: 440 },  // yellow (bottom-right)
];

export default class SimonSaysScene extends Phaser.Scene {
  constructor() { super({ key: 'SimonSaysScene' }); }

  init(data) { this.callerKey = data.callerKey; }

  create() {
    const diff       = getDifficulty(this.registry);
    this.WIN_LENGTH  = diff.simonLength;
    this.sequence    = [];
    this.playerSeq   = [];
    this.lives       = diff.simonLives;
    this.maxLives    = diff.simonLives;
    this.showing     = false;
    this.hintUsed    = false;
    this.won         = false;

    // Dim overlay
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);

    // Monster panel
    this.add.image(620, 170, 'shadow_fox').setScale(2.2);
    this.add.text(620, 60, 'BATTLE!', {
      fontSize: '32px', fontFamily: 'Georgia, serif', color: '#CC88FF',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(620, 270, 'Shadow Fox', { fontSize: '16px', fontFamily: 'Arial', color: '#BB66FF' }).setOrigin(0.5);

    // Instructions
    this.add.text(330, 65, 'Watch the pattern,\nthen repeat it!', {
      fontSize: '20px', fontFamily: 'Arial', color: '#FFFFFF', align: 'center',
    }).setOrigin(0.5);

    const simonDiff = getDifficulty(this.registry);
    this.add.text(330, 120, `${simonDiff.stars} ${simonDiff.label}  —  reach length ${this.WIN_LENGTH}`, {
      fontSize: '14px', fontFamily: 'Arial', color: simonDiff.color,
    }).setOrigin(0.5);

    // Hearts
    this.heartImages = [];
    this.add.text(70, 36, 'Lives:', { fontSize: '18px', fontFamily: 'Arial', color: '#FFF' }).setOrigin(0, 0.5);
    for (let i = 0; i < this.maxLives; i++) {
      this.heartImages.push(this.add.image(72 + i * 34, 66, 'heart').setScale(1.2));
    }

    // Hint button
    this.hintBtn = this.add.text(190, 570, '👁  Watch Again (1×)', {
      fontSize: '18px', fontFamily: 'Arial', color: '#CCFFCC',
      backgroundColor: '#224422', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.hintBtn.on('pointerdown', () => this.useHint());

    // Status
    this.statusText = this.add.text(330, 500, 'Watch the pattern...', {
      fontSize: '18px', fontFamily: 'Arial', color: '#CCCCFF',
    }).setOrigin(0.5).setDepth(10);

    // Pads
    this.pads = [];
    for (let i = 0; i < 4; i++) {
      const { x, y } = PAD_POS[i];
      const pad = this.add.image(x, y, 'simon_pad').setScale(1.0).setTint(PAD_COLORS[i]).setInteractive({ useHandCursor: true });
      pad.on('pointerdown', () => this.onPadPress(i));
      this.pads.push(pad);
    }

    audioManager.playTheme('battle');
    this.cameras.main.fadeIn(300);
    this.time.delayedCall(600, () => this.nextRound());
  }

  nextRound() {
    this.playerSeq = [];
    this.hintUsed  = false;
    this.hintBtn.setAlpha(1);
    this.sequence.push(Phaser.Math.Between(0, 3));
    this.statusText.setText('Watch carefully…');
    this.setInputEnabled(false);
    this.playSequence(() => {
      this.statusText.setText(`Your turn! (${this.sequence.length} step${this.sequence.length > 1 ? 's' : ''})`);
      this.setInputEnabled(true);
    });
  }

  playSequence(onDone) {
    let i = 0;
    const next = () => {
      if (i >= this.sequence.length) { this.time.delayedCall(300, onDone); return; }
      this.flashPad(this.sequence[i], () => { i++; this.time.delayedCall(GAP_MS, next); });
    };
    next();
  }

  flashPad(index, cb) {
    audioManager.playPadTone(index);
    const pad = this.pads[index];
    pad.setScale(1.12);
    pad.setTint(0xFFFFFF); // bright flash
    this.time.delayedCall(FLASH_MS, () => {
      pad.setTint(PAD_COLORS[index]);
      pad.setScale(1.0);
      cb?.();
    });
  }

  onPadPress(index) {
    if (this.showing || this.won) return;
    this.flashPad(index);
    this.playerSeq.push(index);

    const pos = this.playerSeq.length - 1;
    if (this.playerSeq[pos] !== this.sequence[pos]) {
      this.wrongAnswer();
      return;
    }

    if (this.playerSeq.length === this.sequence.length) {
      if (this.sequence.length >= this.WIN_LENGTH) {
        this.winBattle();
      } else {
        this.statusText.setText('Correct! Next round…');
        this.setInputEnabled(false);
        this.time.delayedCall(800, () => this.nextRound());
      }
    }
  }

  wrongAnswer() {
    this.setInputEnabled(false);
    this.cameras.main.shake(300, 0.008);
    this.lives = Math.max(0, this.lives - 1);
    this.updateHearts();
    this.statusText.setText('Oops! Wrong button!');

    if (this.lives <= 0) {
      this.time.delayedCall(800, () => this.resetGame());
    } else {
      // Replay current round
      this.time.delayedCall(800, () => {
        this.playerSeq = [];
        this.statusText.setText('Try again…');
        this.playSequence(() => {
          this.statusText.setText(`Your turn!`);
          this.setInputEnabled(true);
        });
      });
    }
  }

  useHint() {
    if (this.hintUsed || this.showing) return;
    this.hintUsed = true;
    this.hintBtn.setAlpha(0.4);
    this.setInputEnabled(false);
    this.statusText.setText('Replaying pattern…');
    this.playSequence(() => {
      this.statusText.setText('Your turn!');
      this.setInputEnabled(true);
    });
  }

  resetGame() {
    this.sequence = [];
    this.playerSeq = [];
    this.lives = this.maxLives;
    this.updateHearts();
    this.statusText.setText('Starting over…');
    this.time.delayedCall(600, () => this.nextRound());
  }

  winBattle() {
    if (this.won) return;
    this.won = true;
    this.setInputEnabled(false);
    this.statusText.setText('🎉 You beat the Shadow Fox!').setColor('#FFD700');

    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 80, () => {
        const sp = this.add.image(
          Phaser.Math.Between(80, 560), Phaser.Math.Between(100, 500), 'sparkle',
        ).setScale(1.4).setDepth(10);
        this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 40, duration: 600, onComplete: () => sp.destroy() });
      });
    }

    this.time.delayedCall(1500, () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        const island = this.scene.get(this.callerKey);
        this.scene.stop('SimonSaysScene');
        island.onBattleWon();
      });
    });
  }

  updateHearts() {
    this.heartImages.forEach((h, i) => h.setTexture(i < this.lives ? 'heart' : 'heart_empty'));
  }

  setInputEnabled(enabled) {
    this.showing = !enabled;
    this.pads.forEach((p, i) => {
      if (enabled) {
        p.setInteractive({ useHandCursor: true });
        p.removeAllListeners('pointerdown');
        p.on('pointerdown', () => this.onPadPress(i));
      } else {
        p.removeInteractive();
      }
    });
  }
}
