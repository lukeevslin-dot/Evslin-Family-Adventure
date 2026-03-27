import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';
import { getDifficulty } from '../utils/difficulty.js';

const COLS = 7;
const ROWS = 7;
const GEM_SIZE = 48;
const GRID_X = (800 - COLS * GEM_SIZE) / 2;   // 232
const GRID_Y = 210;
const GEM_TYPES = 5;

const PLAYER_LIVES_MAX = 3;

export default class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }); }

  init(data) { this.callerKey = data?.callerKey || 'Island1Scene'; }

  create() {
    const diff = getDifficulty(this.registry);
    this.MONSTER_HP_MAX  = diff.monsterHp;
    this.ATTACK_INTERVAL = diff.attackInterval;

    this.isAnimating = false;
    this.selected = null;
    this.monsterHp = this.MONSTER_HP_MAX;
    this.playerLives = PLAYER_LIVES_MAX;
    this.won = false;
    this.lost = false;

    // Darken island behind us
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.72);

    this.createMonsterPanel();
    this.createHearts();
    this.createHPBar();
    this.createGrid();
    this.createStatusText();

    // Monster attacks on timer
    this.attackTimer = this.time.addEvent({
      delay: this.ATTACK_INTERVAL,
      loop: true,
      callback: this.monsterAttack,
      callbackScope: this,
    });

    // Gem click
    this.input.on('pointerdown', this.onGridClick, this);

    audioManager.playTheme('battle');
    // Fade in
    this.cameras.main.fadeIn(300);
  }

  // ─── ui creation ──────────────────────────────────────────────────────────

  createMonsterPanel() {
    // Panel bg
    this.add.rectangle(400, 110, 760, 180, 0x1a0a2e, 0.9).setStrokeStyle(2, 0x664488);

    // Frog sprite
    this.frogSprite = this.add.image(680, 105, 'frog').setScale(2).setDepth(2);
    this.tweens.add({
      targets: this.frogSprite, y: 115, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // "BATTLE!" header
    this.add.text(320, 28, 'BATTLE!', {
      fontSize: '34px', fontFamily: 'Georgia, serif', color: '#FF4444',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    // Monster name
    this.add.text(680, 160, 'Grumpy Frog', {
      fontSize: '16px', fontFamily: 'Arial', color: '#FF9966',
    }).setOrigin(0.5);

    // Attack countdown hint
    this.attackHint = this.add.text(680, 178, 'attacks soon…', {
      fontSize: '13px', fontFamily: 'Arial', color: '#FF6644', alpha: 0.8,
    }).setOrigin(0.5);
  }

  createHearts() {
    this.heartImages = [];
    this.add.text(60, 30, 'Lives:', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF',
    }).setOrigin(0, 0.5);

    for (let i = 0; i < PLAYER_LIVES_MAX; i++) {
      const h = this.add.image(60 + i * 36, 60, 'heart').setScale(1.2);
      this.heartImages.push(h);
    }
  }

  createHPBar() {
    // Label
    this.add.text(50, 110, 'FROG HP', {
      fontSize: '14px', fontFamily: 'Arial', color: '#AAFFAA', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Graphics-based bar (redrawn on each update — avoids Phaser Rectangle width bugs)
    this.hpBarGfx = this.add.graphics();
    const { stars, label, color } = getDifficulty(this.registry);
    this.add.text(50, 170, `${stars} ${label}`, { fontSize: '13px', fontFamily: 'Arial', color });
    this.hpText = this.add.text(50, 152, `${this.MONSTER_HP_MAX}/${this.MONSTER_HP_MAX}`, {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#FFFFFF', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.drawHPBar(1);
  }

  drawHPBar(pct) {
    const BX = 10, BY = 120, BW = 180, BH = 24;
    this.hpBarGfx.clear();
    // Background
    this.hpBarGfx.fillStyle(0x333333);
    this.hpBarGfx.fillRoundedRect(BX, BY, BW, BH, 6);
    // Fill color: green → orange → red
    const color = pct > 0.5 ? 0x22CC55 : pct > 0.25 ? 0xFFAA00 : 0xFF3300;
    this.hpBarGfx.fillStyle(color);
    this.hpBarGfx.fillRoundedRect(BX + 2, BY + 2, Math.max(0, (BW - 4) * pct), BH - 4, 5);
    // Border
    this.hpBarGfx.lineStyle(2, 0x888888);
    this.hpBarGfx.strokeRoundedRect(BX, BY, BW, BH, 6);
  }

  createGrid() {
    // Grid background
    this.add.rectangle(
      GRID_X + (COLS * GEM_SIZE) / 2,
      GRID_Y + (ROWS * GEM_SIZE) / 2,
      COLS * GEM_SIZE + 8,
      ROWS * GEM_SIZE + 8,
      0x1a0a2e,
    ).setStrokeStyle(2, 0x4444AA);

    // Grid lines
    const gridGfx = this.add.graphics();
    gridGfx.lineStyle(1, 0x334466, 0.5);
    for (let c = 0; c <= COLS; c++) {
      const x = GRID_X + c * GEM_SIZE;
      gridGfx.strokeLineShape(new Phaser.Geom.Line(x, GRID_Y, x, GRID_Y + ROWS * GEM_SIZE));
    }
    for (let r = 0; r <= ROWS; r++) {
      const y = GRID_Y + r * GEM_SIZE;
      gridGfx.strokeLineShape(new Phaser.Geom.Line(GRID_X, y, GRID_X + COLS * GEM_SIZE, y));
    }

    // Highlight sprite (for selected gem)
    this.highlightRect = this.add.rectangle(0, 0, GEM_SIZE - 4, GEM_SIZE - 4, 0xFFFFFF, 0)
      .setStrokeStyle(3, 0xFFFFFF).setDepth(5).setVisible(false);

    // Init data grid
    this.grid = [];
    this.gems = [];
    for (let r = 0; r < ROWS; r++) {
      this.grid[r] = [];
      this.gems[r] = [];
    }
    this.initGrid();
  }

  createStatusText() {
    this.statusText = this.add.text(400, 582, 'Match 3 gems to attack!', {
      fontSize: '18px', fontFamily: 'Arial', color: '#CCCCFF',
    }).setOrigin(0.5).setDepth(10);
  }

  // ─── grid logic ───────────────────────────────────────────────────────────

  initGrid() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const type = this.safeRandomGem(r, c);
        this.grid[r][c] = type;
        this.gems[r][c] = this.spawnGem(r, c, type);
      }
    }
  }

  safeRandomGem(r, c) {
    // Avoid creating a match on initial board
    const excluded = new Set();
    if (c >= 2 && this.grid[r][c-1] === this.grid[r][c-2]) excluded.add(this.grid[r][c-1]);
    if (r >= 2 && this.grid[r-1]?.[c] === this.grid[r-2]?.[c])  excluded.add(this.grid[r-1][c]);

    let type;
    let attempts = 0;
    do {
      type = Phaser.Math.Between(0, GEM_TYPES - 1);
      attempts++;
    } while (excluded.has(type) && attempts < 20);
    return type;
  }

  spawnGem(r, c, type) {
    const x = GRID_X + c * GEM_SIZE + GEM_SIZE / 2;
    const y = GRID_Y + r * GEM_SIZE + GEM_SIZE / 2;
    const gem = this.add.image(x, y, `gem_${type}`).setDepth(3);
    return gem;
  }

  gemPos(r, c) {
    return {
      x: GRID_X + c * GEM_SIZE + GEM_SIZE / 2,
      y: GRID_Y + r * GEM_SIZE + GEM_SIZE / 2,
    };
  }

  // ─── input ────────────────────────────────────────────────────────────────

  onGridClick(pointer) {
    if (this.isAnimating || this.won || this.lost) return;

    const col = Math.floor((pointer.x - GRID_X) / GEM_SIZE);
    const row = Math.floor((pointer.y - GRID_Y) / GEM_SIZE);

    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
      this.clearSelection();
      return;
    }

    if (this.selected === null) {
      this.selected = { row, col };
      this.showHighlight(row, col);
      return;
    }

    const { row: sr, col: sc } = this.selected;

    if (sr === row && sc === col) {
      this.clearSelection();
      return;
    }

    const adjacent = (Math.abs(sr - row) + Math.abs(sc - col)) === 1;
    if (!adjacent) {
      // Re-select
      this.clearSelection();
      this.selected = { row, col };
      this.showHighlight(row, col);
      return;
    }

    this.clearSelection();
    this.trySwap(sr, sc, row, col);
  }

  showHighlight(r, c) {
    const pos = this.gemPos(r, c);
    this.highlightRect.setPosition(pos.x, pos.y).setVisible(true);
    this.tweens.add({
      targets: this.highlightRect, alpha: 0.8, duration: 200, yoyo: true, repeat: -1,
    });
  }

  clearSelection() {
    this.selected = null;
    this.tweens.killTweensOf(this.highlightRect);
    this.highlightRect.setVisible(false).setAlpha(1);
  }

  // ─── swap & match ─────────────────────────────────────────────────────────

  async trySwap(r1, c1, r2, c2) {
    this.isAnimating = true;

    // 1. Visually swap gems (and update this.gems references)
    await this.animateSwap(r1, c1, r2, c2);

    // 2. Swap grid data to match visual state
    const tmp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = tmp;

    const matches = this.findMatches();

    if (matches.size === 0) {
      // No match — swap gems back visually (and gems refs) then data
      await this.animateSwap(r1, c1, r2, c2);
      const t2 = this.grid[r1][c1];
      this.grid[r1][c1] = this.grid[r2][c2];
      this.grid[r2][c2] = t2;
      this.statusText.setText('No match! Try again.');
    } else {
      await this.processMatches(matches);
    }

    this.isAnimating = false;
  }

  animateSwap(r1, c1, r2, c2) {
    const pos1 = this.gemPos(r1, c1);
    const pos2 = this.gemPos(r2, c2);
    const gem1 = this.gems[r1][c1];
    const gem2 = this.gems[r2][c2];

    return new Promise((resolve) => {
      let done = 0;
      const check = () => { if (++done === 2) resolve(); };
      this.tweens.add({ targets: gem1, x: pos2.x, y: pos2.y, duration: 150, ease: 'Quad.easeOut', onComplete: check });
      this.tweens.add({ targets: gem2, x: pos1.x, y: pos1.y, duration: 150, ease: 'Quad.easeOut', onComplete: check });
    }).then(() => {
      // Swap gem references
      const tmp = this.gems[r1][c1];
      this.gems[r1][c1] = this.gems[r2][c2];
      this.gems[r2][c2] = tmp;
    });
  }

  findMatches() {
    const matched = new Set();

    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      let c = 0;
      while (c < COLS - 2) {
        const t = this.grid[r][c];
        if (t !== null && t === this.grid[r][c+1] && t === this.grid[r][c+2]) {
          let end = c + 2;
          while (end + 1 < COLS && this.grid[r][end+1] === t) end++;
          for (let i = c; i <= end; i++) matched.add(`${r},${i}`);
          c = end + 1;
        } else {
          c++;
        }
      }
    }

    // Vertical
    for (let c = 0; c < COLS; c++) {
      let r = 0;
      while (r < ROWS - 2) {
        const t = this.grid[r][c];
        if (t !== null && t === this.grid[r+1]?.[c] && t === this.grid[r+2]?.[c]) {
          let end = r + 2;
          while (end + 1 < ROWS && this.grid[end+1]?.[c] === t) end++;
          for (let i = r; i <= end; i++) matched.add(`${i},${c}`);
          r = end + 1;
        } else {
          r++;
        }
      }
    }

    return matched;
  }

  async processMatches(matches) {
    const damage = this.calcDamage(matches);
    this.statusText.setText(`Match! ${damage} damage!`);

    await this.removeMatches(matches);

    this.damageMonster(damage);
    if (this.won) return;

    await this.applyGravity();
    await this.fillEmpty();

    // Cascade check
    await this.delay(100);
    const cascade = this.findMatches();
    if (cascade.size > 0) {
      this.statusText.setText('Combo!');
      await this.processMatches(cascade);
    }
  }

  calcDamage(matches) {
    if (matches.size >= 5) return 3;
    if (matches.size === 4) return 2;
    return 1;  // 3 matches = 1 damage, monster has 5 HP total
  }

  removeMatches(matches) {
    return new Promise((resolve) => {
      let pending = matches.size;
      if (pending === 0) { resolve(); return; }

      for (const key of matches) {
        const [r, c] = key.split(',').map(Number);
        const gem = this.gems[r][c];
        this.grid[r][c] = null;
        this.gems[r][c] = null;

        if (gem) {
          this.tweens.add({
            targets: gem,
            alpha: 0, scaleX: 0, scaleY: 0,
            duration: 220, ease: 'Back.easeIn',
            onComplete: () => {
              gem.destroy();
              if (--pending === 0) resolve();
            },
          });
        } else {
          if (--pending === 0) resolve();
        }
      }
    });
  }

  async applyGravity() {
    const promises = [];

    for (let c = 0; c < COLS; c++) {
      let writeRow = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (writeRow !== r) {
            // Move gem data
            this.grid[writeRow][c] = this.grid[r][c];
            this.grid[r][c] = null;
            this.gems[writeRow][c] = this.gems[r][c];
            this.gems[r][c] = null;

            const pos = this.gemPos(writeRow, c);
            const gem = this.gems[writeRow][c];
            promises.push(new Promise((res) => {
              this.tweens.add({ targets: gem, x: pos.x, y: pos.y, duration: 200, ease: 'Bounce.easeOut', onComplete: res });
            }));
          }
          writeRow--;
        }
      }
      // Clear remaining top rows
      for (let r = writeRow; r >= 0; r--) {
        this.grid[r][c] = null;
        this.gems[r][c] = null;
      }
    }

    await Promise.all(promises);
  }

  async fillEmpty() {
    const promises = [];

    for (let c = 0; c < COLS; c++) {
      let dropCount = 0;
      for (let r = 0; r < ROWS; r++) {
        if (this.grid[r][c] === null) {
          const type = Phaser.Math.Between(0, GEM_TYPES - 1);
          this.grid[r][c] = type;

          const pos = this.gemPos(r, c);
          const startY = GRID_Y - (++dropCount) * GEM_SIZE;
          const gem = this.add.image(pos.x, startY, `gem_${type}`).setDepth(3);
          this.gems[r][c] = gem;

          promises.push(new Promise((res) => {
            this.tweens.add({ targets: gem, y: pos.y, duration: 250, ease: 'Quad.easeIn', onComplete: res });
          }));
        }
      }
    }

    await Promise.all(promises);
  }

  // ─── hp & lives ───────────────────────────────────────────────────────────

  damageMonster(amount) {
    if (this.won) return;
    this.monsterHp = Math.max(0, this.monsterHp - amount);

    const pct = this.monsterHp / this.MONSTER_HP_MAX;
    this.drawHPBar(pct);
    this.hpText.setText(`${this.monsterHp} / ${this.MONSTER_HP_MAX}`);

    // Frog hurt flash
    this.tweens.add({
      targets: this.frogSprite, alpha: 0.3, duration: 80, yoyo: true, repeat: 2,
    });
    // Camera shake on hit
    this.cameras.main.shake(120, 0.005);

    if (this.monsterHp <= 0) this.winBattle();
  }

  monsterAttack() {
    if (this.won || this.lost) return;

    // Flash attack
    this.cameras.main.flash(200, 255, 50, 50);
    this.frogSprite.setTint(0xFF4444);
    this.time.delayedCall(200, () => this.frogSprite.clearTint());

    this.playerLives = Math.max(0, this.playerLives - 1);
    this.updateHearts();
    this.statusText.setText('The frog attacked!');

    if (this.playerLives <= 0) this.loseBattle();
  }

  updateHearts() {
    for (let i = 0; i < PLAYER_LIVES_MAX; i++) {
      this.heartImages[i].setTexture(i < this.playerLives ? 'heart' : 'heart_empty');
    }
  }

  // ─── win / lose ───────────────────────────────────────────────────────────

  winBattle() {
    if (this.won) return;
    this.won = true;
    this.attackTimer.remove();
    this.input.off('pointerdown', this.onGridClick, this);

    this.statusText.setText('🎉 You defeated the Grumpy Frog!').setColor('#FFD700');

    // Victory sparkles
    for (let i = 0; i < 12; i++) {
      this.time.delayedCall(i * 80, () => {
        const sp = this.add.image(
          Phaser.Math.Between(100, 700),
          Phaser.Math.Between(100, 500),
          'sparkle',
        ).setScale(1.5).setDepth(10);
        this.tweens.add({
          targets: sp, alpha: 0, y: sp.y - 50, duration: 700,
          onComplete: () => sp.destroy(),
        });
      });
    }

    this.time.delayedCall(1200, () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        // Tell Island1Scene
        const island = this.scene.get(this.callerKey);
        this.scene.stop('BattleScene');
        island.onBattleWon();
      });
    });
  }

  loseBattle() {
    if (this.lost) return;
    this.lost = true;

    this.statusText.setText('Oh no! Try again...').setColor('#FF4444');
    this.cameras.main.shake(400, 0.01);

    this.time.delayedCall(1200, () => {
      // Reset
      this.monsterHp = this.MONSTER_HP_MAX;
      this.playerLives = PLAYER_LIVES_MAX;
      this.won = false;
      this.lost = false;

      this.damageMonster(0);  // refresh bar
      this.updateHearts();
      this.statusText.setText('Match 3 gems to attack!').setColor('#CCCCFF');

      // Clear and rebuild grid
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          this.gems[r][c]?.destroy();
          this.gems[r][c] = null;
          this.grid[r][c] = null;
        }
      }
      this.initGrid();

      // Restart attack timer
      this.attackTimer = this.time.addEvent({
        delay: this.ATTACK_INTERVAL, loop: true,
        callback: this.monsterAttack, callbackScope: this,
      });

      this.input.on('pointerdown', this.onGridClick, this);
    });
  }

  // ─── util ─────────────────────────────────────────────────────────────────

  delay(ms) {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }
}
