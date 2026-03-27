import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';
import { getDifficulty } from '../utils/difficulty.js';

// Questions scale with difficulty / character chosen.
// Each set has 5 questions, 3 answer choices, correct index.
const QUESTIONS = {
  levi: [
    { q: 'What color is the sky on a sunny day?',     a: ['Blue',      'Green',     'Red'],          correct: 0 },
    { q: 'What sound does a dog make?',               a: ['Moo',       'Woof',      'Quack'],         correct: 1 },
    { q: 'How many legs does a cat have?',            a: ['Two',       'Four',      'Six'],           correct: 1 },
    { q: 'What do bees make?',                        a: ['Honey',     'Milk',      'Jam'],           correct: 0 },
    { q: 'What comes after the number 2?',            a: ['One',       'Four',      'Three'],         correct: 2 },
  ],
  finley: [
    { q: 'What is the capital city of Hawaii?',       a: ['Honolulu',  'Hilo',      'Lahaina'],       correct: 0 },
    { q: 'How many sides does a triangle have?',      a: ['Two',       'Three',     'Four'],          correct: 1 },
    { q: 'What is 5 × 4?',                           a: ['15',        '20',        '25'],            correct: 1 },
    { q: 'Which planet is closest to the Sun?',       a: ['Venus',     'Mercury',   'Earth'],         correct: 1 },
    { q: 'Which is the largest ocean on Earth?',      a: ['Atlantic',  'Indian',    'Pacific'],       correct: 2 },
  ],
  luke: [
    { q: 'What is 12 × 12?',                         a: ['124',       '144',       '148'],           correct: 1 },
    { q: 'Which gas do plants absorb from the air?',  a: ['Oxygen',    'CO₂',       'Nitrogen'],      correct: 1 },
    { q: 'What is the largest continent on Earth?',   a: ['Africa',    'Asia',      'N. America'],    correct: 1 },
    { q: 'How many bones are in the human body?',     a: ['106',       '206',       '306'],           correct: 1 },
    { q: 'Hawaiian word for family?',                 a: ['Ohana',     'Aloha',     'Mahalo'],        correct: 0 },
  ],
  sokchea: [
    { q: 'Chemical symbol for gold?',                 a: ['Go',        'Au',        'Gd'],            correct: 1 },
    { q: 'What year did Hawaii become a US state?',   a: ['1950',      '1959',      '1962'],          correct: 1 },
    { q: 'What is the square root of 144?',           a: ['11',        '12',        '13'],            correct: 1 },
    { q: 'Longest river in the world?',               a: ['Amazon',    'Mississippi','Nile'],         correct: 2 },
    { q: 'How many islands make up Hawaii?',          a: ['6',         '8',         '10'],            correct: 1 },
  ],
};

export default class TriviaScene extends Phaser.Scene {
  constructor() { super({ key: 'TriviaScene' }); }

  init(data) { this.callerKey = data.callerKey; }

  create() {
    const diff         = getDifficulty(this.registry);
    const charKey      = this.registry.get('selectedCharacter') || 'luke';
    this.NEED_CORRECT  = diff.needCorrect;
    this.HINT_ALLOWED  = diff.hintAllowed;
    this.questions     = QUESTIONS[charKey] ?? QUESTIONS.luke;

    this.qIndex   = 0;
    this.correct  = 0;
    this.hintUsed = false;
    this.answered = false;
    this.won      = false;
    this.eliminated = -1;

    // ── Overlay ─────────────────────────────────────────────────────────────
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.78);

    // Monster
    this.add.image(660, 150, 'fire_lizard').setScale(2.0);
    this.add.text(660, 40, 'RIDDLE BATTLE!', {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#FF8844',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(660, 250, 'Fire Lizard', { fontSize: '16px', fontFamily: 'Arial', color: '#FFBB88' }).setOrigin(0.5);
    this.add.text(660, 272, `${diff.stars} ${diff.label}`, {
      fontSize: '13px', fontFamily: 'Arial', color: diff.color,
    }).setOrigin(0.5);
    this.add.text(660, 290, `Need ${this.NEED_CORRECT}/${this.questions.length} correct`, {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFEEAA',
    }).setOrigin(0.5);

    // Score
    this.scoreText = this.add.text(660, 310, `0 / ${this.questions.length} correct`, {
      fontSize: '17px', fontFamily: 'Arial', color: '#FFEEAA',
    }).setOrigin(0.5);

    // Question box
    this.add.rectangle(310, 155, 540, 90, 0x1a1a3a).setStrokeStyle(2, 0x4444AA);
    this.qText = this.add.text(310, 155, '', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FFFFFF',
      wordWrap: { width: 500 }, align: 'center',
    }).setOrigin(0.5);

    // Answer buttons
    this.answerBtns  = [];
    this.answerTexts = [];
    const btnColors  = [0x2244AA, 0x22AA44, 0xAA4422];
    for (let i = 0; i < 3; i++) {
      const by = 268 + i * 78;
      const bg = this.add.rectangle(310, by, 480, 62, btnColors[i])
        .setStrokeStyle(2, 0x888888).setInteractive({ useHandCursor: true });
      const txt = this.add.text(310, by, '', {
        fontSize: '19px', fontFamily: 'Arial', color: '#FFFFFF', wordWrap: { width: 440 },
      }).setOrigin(0.5);
      bg.on('pointerdown', () => this.onAnswer(i));
      bg.on('pointerover', () => bg.setStrokeStyle(3, 0xFFFFFF));
      bg.on('pointerout',  () => bg.setStrokeStyle(2, 0x888888));
      this.answerBtns.push(bg);
      this.answerTexts.push(txt);
    }

    // Hint button
    this.hintBtn = this.add.text(310, 545,
      this.HINT_ALLOWED
        ? '💡  Hint (1× per question — removes a wrong answer)'
        : '🚫  No hints on Expert difficulty',
      {
        fontSize: '14px', fontFamily: 'Arial',
        color:           this.HINT_ALLOWED ? '#CCFFCC' : '#FF8888',
        backgroundColor: this.HINT_ALLOWED ? '#224422' : '#440000',
        padding: { x: 8, y: 4 },
      }).setOrigin(0.5);
    if (this.HINT_ALLOWED) {
      this.hintBtn.setInteractive({ useHandCursor: true });
      this.hintBtn.on('pointerdown', () => this.useHint());
    }

    // Status
    this.statusText = this.add.text(310, 578, '', {
      fontSize: '15px', fontFamily: 'Arial', color: '#FFAAAA',
    }).setOrigin(0.5);

    audioManager.playTheme('battle');
    this.cameras.main.fadeIn(300);
    this.showQuestion();
  }

  showQuestion() {
    if (this.qIndex >= this.questions.length) { this.endGame(); return; }
    const q = this.questions[this.qIndex];
    this.answered  = false;
    this.hintUsed  = false;
    this.eliminated = -1;
    this.hintBtn.setAlpha(1);

    this.qText.setText(q.q);
    this.answerBtns.forEach((btn, i) => {
      btn.setVisible(true).setAlpha(1);
      btn.setFillStyle([0x2244AA, 0x22AA44, 0xAA4422][i]);
      btn.setStrokeStyle(2, 0x888888);
    });
    this.answerTexts.forEach((t, i) => t.setText(q.a[i]).setVisible(true).setAlpha(1));
    this.statusText.setText(`Question ${this.qIndex + 1} of ${this.questions.length} — need ${this.NEED_CORRECT} correct`);
  }

  onAnswer(choiceIndex) {
    if (this.answered) return;
    if (this.eliminated === choiceIndex) return;
    this.answered = true;
    const q = this.questions[this.qIndex];

    if (choiceIndex === q.correct) {
      this.correct++;
      this.answerBtns[choiceIndex].setFillStyle(0x00AA44).setStrokeStyle(3, 0x00FF88);
      this.statusText.setText('✅ Correct!').setColor('#88FF88');
    } else {
      this.answerBtns[choiceIndex].setFillStyle(0xAA0000);
      this.answerBtns[q.correct].setFillStyle(0x00AA44);
      this.statusText.setText('❌ That wasn\'t it — here\'s the right answer.').setColor('#FF8888');
    }

    this.scoreText.setText(`${this.correct} / ${this.questions.length} correct`);
    this.qIndex++;
    this.time.delayedCall(1300, () => this.showQuestion());
  }

  useHint() {
    if (!this.HINT_ALLOWED || this.answered || this.hintUsed) return;
    this.hintUsed  = true;
    this.hintBtn.setAlpha(0.4);
    const q      = this.questions[this.qIndex];
    const wrongs = [0, 1, 2].filter(i => i !== q.correct);
    this.eliminated = wrongs[Phaser.Math.Between(0, wrongs.length - 1)];
    this.answerBtns[this.eliminated].setAlpha(0.3);
    this.answerTexts[this.eliminated].setAlpha(0.3);
  }

  endGame() {
    if (this.correct >= this.NEED_CORRECT) {
      this.winBattle();
    } else {
      this.statusText
        .setText(`Only ${this.correct}/${this.questions.length} — need ${this.NEED_CORRECT}! Try again!`)
        .setColor('#FF8888');
      this.time.delayedCall(1500, () => {
        this.qIndex = 0; this.correct = 0;
        this.scoreText.setText(`0 / ${this.questions.length} correct`);
        this.showQuestion();
      });
    }
  }

  winBattle() {
    if (this.won) return;
    this.won = true;
    this.statusText.setText('🎉 You outsmarted the Fire Lizard!').setColor('#FFD700');

    for (let i = 0; i < 12; i++) {
      this.time.delayedCall(i * 80, () => {
        const sp = this.add.image(
          Phaser.Math.Between(60, 620), Phaser.Math.Between(60, 500), 'sparkle',
        ).setScale(1.4).setDepth(10);
        this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 40, duration: 600, onComplete: () => sp.destroy() });
      });
    }

    this.time.delayedCall(1500, () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        const island = this.scene.get(this.callerKey);
        this.scene.stop('TriviaScene');
        island.onBattleWon();
      });
    });
  }
}
