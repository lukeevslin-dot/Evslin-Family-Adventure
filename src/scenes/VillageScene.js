import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';

const WW = 2400;  // world width
const WH = 1200;  // world height

const BUILDING_TYPES = [
  { key: 'house',   label: 'Hale (House)',       emoji: '🏠', texture: 'house_built',   desc: 'Shelter for your ʻohana'   },
  { key: 'garden',  label: "Lo'i Kalo (Taro)",   emoji: '🌿', texture: 'garden_grown',  desc: 'Grows food for the village' },
  { key: 'fishing', label: 'Fishing Platform',   emoji: '🎣', texture: 'fishing_built', desc: 'Catch fish from the sea'    },
  { key: 'imu',     label: 'Imu (Fire Pit)',     emoji: '🔥', texture: 'imu_built',     desc: 'Cook a feast for everyone'  },
  { key: 'heiau',   label: 'Heiau (Temple)',     emoji: '🪨', texture: 'heiau_built',   desc: 'Sacred place for prayer'   },
];

// 6 plots scattered across the larger world
const PLOT_POSITIONS = [
  { x: 280,  y: 490 },   // Forest
  { x: 540,  y: 700 },   // Forest edge
  { x: 900,  y: 360 },   // Village north
  { x: 1150, y: 600 },   // Village center
  { x: 1520, y: 430 },   // Farmlands
  { x: 2050, y: 520 },   // Harbor
];

const VILLAGER_POSITIONS = [
  { x: 920,  y: 550 }, { x: 1060, y: 470 },
  { x: 1200, y: 620 }, { x: 1010, y: 690 },
];

// Screen coords for building menu (camera-fixed)
const MENU_CX   = 400;
const MENU_TOP  = 102;   // y of first button center
const BTN_H     = 52;

export default class VillageScene extends Phaser.Scene {
  constructor() { super({ key: 'VillageScene' }); }

  create() {
    this.plots           = [];
    this.builtCount      = 0;
    this.dockReady       = false;
    this.interacting     = false;
    this.transitioning   = false;
    this._tapTarget      = null;
    this._nearPlot       = null;
    this._menuOpen       = false;
    this._menuElements   = [];
    this._dockTriggering = false;

    if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');

    this.physics.world.setBounds(0, 0, WW, WH);

    this.drawWorld();
    this.createDock();
    this.createPlots();
    this.createVillagers();
    this.createPlayer();
    this.createUI();
    this.createBuildingMenu();
    this.setupControls();

    this.cameras.main.setBounds(0, 0, WW, WH);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    audioManager.playTheme('village');
    this.cameras.main.fadeIn(800);
  }

  // ── World drawing ────────────────────────────────────────────────────────────

  drawWorld() {
    const g = this.add.graphics();

    // Base grass
    g.fillStyle(0x4AAA30); g.fillRect(0, 0, WW, WH);

    // Forest zone (left 700px): dark green
    g.fillStyle(0x2D7A20); g.fillRect(0, 0, 700, WH);

    // Village sandy paths (center)
    g.fillStyle(0xD4B870, 0.4); g.fillEllipse(1050, 550, 760, 380);
    g.fillStyle(0xDDBB7A, 0.3); g.fillEllipse(1100, 640, 520, 210);

    // Farmlands (x 1400-2000): brighter green
    g.fillStyle(0x55BB38); g.fillRect(1400, 0, 600, WH);

    // Harbor zone (x 2000-2400): sandy
    g.fillStyle(0x8A9A50); g.fillRect(2000, 0, 400, 1000);

    // Beach strip
    g.fillStyle(0xF5DFA0); g.fillRect(0, 1040, WW, 80);
    g.fillStyle(0x1A6B9A); g.fillRect(0, 1090, WW, 110);
    g.fillStyle(0x3388BB, 0.5);
    for (let x = 0; x < WW; x += 140) g.fillRect(x, 1110, 90, 8);

    // Mountain ridges (top)
    g.fillStyle(0x3A6A2A);
    g.fillTriangle(0, 0, 220, 0, 110, 180);
    g.fillTriangle(180, 0, 480, 0, 330, 200);
    g.fillStyle(0x8A8A8A);
    g.fillTriangle(50, 0, 0, 100, 150, 100);
    g.fillStyle(0xFFFFFF, 0.7); g.fillTriangle(60, 0, 30, 50, 100, 50);

    // Zone label texts in world space
    const lblStyle = {
      fontSize: '22px', fontFamily: 'Georgia, serif',
      color: '#FFFFFF', stroke: '#000', strokeThickness: 4,
    };
    this.add.text(320,  80, '🌿 Forest',     lblStyle).setOrigin(0.5).setAlpha(0.75).setDepth(1);
    this.add.text(1050, 80, '🏡 Village',    lblStyle).setOrigin(0.5).setAlpha(0.75).setDepth(1);
    this.add.text(1680, 80, '🌾 Farmlands',  lblStyle).setOrigin(0.5).setAlpha(0.75).setDepth(1);
    this.add.text(2180, 80, '⚓ Harbor',     lblStyle).setOrigin(0.5).setAlpha(0.75).setDepth(1);

    // Trees — forest (dense)
    [
      [80,280],[150,430],[220,240],[300,580],[380,340],
      [100,680],[200,780],[360,730],[450,540],[520,790],
      [80,530],[260,940],[390,880],[510,940],[610,830],
      [600,290],[630,490],[560,680],[150,100],[310,100],
    ].forEach(([x,y]) => this.add.image(x,y,'tree').setOrigin(0.5,1).setDepth(2).setScale(1.2));

    // Trees — village (scattered)
    [
      [750,240],[800,690],[900,890],[1050,840],[1200,240],
      [1300,790],[1360,340],[1410,880],[1460,680],
    ].forEach(([x,y]) => this.add.image(x,y,'tree').setOrigin(0.5,1).setDepth(2));

    // Trees — farmlands & harbor (sparse)
    [
      [1500,780],[1650,280],[1710,680],[1760,880],[1810,430],
      [1910,790],[2010,280],[2110,790],[2210,340],[2310,680],
    ].forEach(([x,y]) => this.add.image(x,y,'tree').setOrigin(0.5,1).setDepth(2).setScale(0.88));

    // Palm trees — beach
    [150,400,700,1000,1320,1640,1960,2260].forEach(x =>
      this.add.image(x,1000,'tree').setOrigin(0.5,1).setDepth(2).setScale(0.82));
  }

  createDock() {
    this.dockX = 2210; this.dockY = 760;

    const dock = this.add.graphics().setDepth(3);
    dock.fillStyle(0x7B4A22);
    for (let dy = -55; dy <= 55; dy += 16) dock.fillRect(this.dockX - 30, this.dockY + dy, 210, 12);
    dock.fillStyle(0x4A2808);
    for (let dx = -20; dx <= 150; dx += 22) dock.fillRect(this.dockX + dx, this.dockY - 59, 7, 118);

    this.add.image(this.dockX + 90, this.dockY + 90, 'boat').setScale(1.1).setDepth(4);
    this.add.text(this.dockX + 90, this.dockY - 90, "Waʻa Dock", {
      fontSize: '15px', fontFamily: 'Georgia, serif',
      color: '#FFEEBB', stroke: '#333300', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);
    this.dockHintWorld = this.add.text(this.dockX + 90, this.dockY - 70, '(build all 6 first)', {
      fontSize: '12px', fontFamily: 'Arial', color: '#CCCCAA', stroke: '#222200', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);
  }

  createPlots() {
    PLOT_POSITIONS.forEach((pos, i) => {
      const sprite = this.add.image(pos.x, pos.y, 'house_plot').setScale(1.7).setDepth(5);
      this.tweens.add({
        targets: sprite, scaleX: 1.85, scaleY: 1.85,
        duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      const hint = this.add.text(pos.x, pos.y + 46, '🔨 tap to build', {
        fontSize: '13px', fontFamily: 'Arial', color: '#FFFFAA',
        stroke: '#334400', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(6);

      sprite.setInteractive({ useHandCursor: true });

      const plot = { ...pos, sprite, hint, done: false, index: i };
      sprite.on('pointerdown', () => this.openMenu(plot));
      this.plots.push(plot);
    });
  }

  createVillagers() {
    this.villagers = VILLAGER_POSITIONS.map(({ x, y }, i) => {
      const sprite = this.add.image(x, y, 'villager').setScale(1.5).setDepth(6);
      this.tweens.add({
        targets: sprite,
        x: x + Phaser.Math.Between(-30, 30), y: y + Phaser.Math.Between(-20, 20),
        duration: 1800 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      return { sprite, baseX: x, baseY: y };
    });
  }

  createPlayer() {
    const charKey = this.registry.get('selectedCharacter') || 'luke';
    this.player = this.physics.add.sprite(130, 720, charKey).setScale(2.0).setDepth(8);
    this.player.body.setSize(24, 32).setOffset(6, 12);
    this.player.setCollideWorldBounds(true);

    this.aura = this.add.image(130, 720, 'magic_aura').setScale(2.8).setAlpha(0.45).setDepth(7);
    this.tweens.add({ targets: this.aura, scale: 3.2, alpha: 0.25, duration: 900, yoyo: true, repeat: -1 });
  }

  createUI() {
    this.add.text(400, 16, '🏡  Kauaʻi Village — Use your crystal magic!', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#4A2800', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0);

    this.progressText = this.add.text(400, 42, `Built: 0 / ${PLOT_POSITIONS.length}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#CCFFCC',
      stroke: '#003300', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0);

    this.add.text(10, 590, '← tap to walk and explore the world →', {
      fontSize: '13px', fontFamily: 'Arial', color: '#CCFFAA', stroke: '#003300', strokeThickness: 2,
    }).setOrigin(0, 1).setDepth(20).setScrollFactor(0);

    this.interactPrompt = this.add.text(400, 568, '', {
      fontSize: '17px', fontFamily: 'Arial', color: '#FFFF88',
      stroke: '#333300', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0).setAlpha(0);

    const intro = this.add.text(400, 300, '✨ You have crystal magic!\nExplore the world and tap plots to build!', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FFFFFF',
      stroke: '#0044AA', strokeThickness: 5, align: 'center',
      backgroundColor: '#00000088', padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);
    this.time.delayedCall(3200, () => {
      this.tweens.add({ targets: intro, alpha: 0, duration: 600, onComplete: () => intro.destroy() });
    });
  }

  // ── Building menu (camera-fixed, no scrollFactor issues) ─────────────────────

  createBuildingMenu() {
    const totalH = BUILDING_TYPES.length * BTN_H + 110;
    const halfH  = totalH / 2;

    // Dim overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.55)
      .setScrollFactor(0).setDepth(98).setVisible(false);

    // Panel background
    const panel = this.add.rectangle(MENU_CX, 300, 440, totalH, 0x0d0d2a, 0.97)
      .setStrokeStyle(3, 0xFFD700)
      .setScrollFactor(0).setDepth(99).setVisible(false);

    const title = this.add.text(MENU_CX, 300 - halfH + 22, '✨ What will you build?', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#FFD700',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);

    const btnObjects = BUILDING_TYPES.map((bt, i) => {
      const y = 300 - halfH + 55 + i * BTN_H;
      const bg = this.add.rectangle(MENU_CX, y, 410, BTN_H - 6, 0x1e2a4a)
        .setStrokeStyle(2, 0x4466AA)
        .setScrollFactor(0).setDepth(100).setVisible(false);
      const label = this.add.text(MENU_CX - 190, y, `${bt.emoji}  ${bt.label}`, {
        fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101).setVisible(false);
      const desc = this.add.text(MENU_CX + 195, y, bt.desc, {
        fontSize: '12px', fontFamily: 'Arial', color: '#7788BB',
      }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(101).setVisible(false);
      return { bg, label, desc, y };
    });

    const cancelY = 300 - halfH + 55 + BUILDING_TYPES.length * BTN_H + 10;
    const cancelBtn = this.add.text(MENU_CX, cancelY, '✕  Cancel', {
      fontSize: '15px', fontFamily: 'Arial', color: '#FF8888',
      backgroundColor: '#440000', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);

    this._menuElements   = [overlay, panel, title, cancelBtn,
                            ...btnObjects.flatMap(b => [b.bg, b.label, b.desc])];
    this._menuBtnObjects = btnObjects;
    this._menuCancelY    = cancelY;
  }

  openMenu(plot) {
    if (this._menuOpen || plot.done || this.interacting) return;
    this._menuOpen  = true;
    this._nearPlot  = plot;
    this._tapTarget = null;
    this.player.setVelocity(0, 0);
    this._menuElements.forEach(el => el.setVisible(true));
  }

  closeMenu() {
    this._menuOpen = false;
    this._nearPlot = null;
    this._menuElements.forEach(el => el.setVisible(false));
  }

  // ── Controls ─────────────────────────────────────────────────────────────────

  setupControls() {
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.wasd     = this.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.input.on('pointerdown', (ptr) => {
      if (this._menuOpen) {
        this._handleMenuTap(ptr.x, ptr.y);
        return;
      }
      // Use worldX/worldY so tap target is in world space (camera-corrected)
      this._tapTarget = { x: ptr.worldX, y: ptr.worldY };
    });
    this.input.on('pointermove', (ptr) => {
      if (ptr.isDown && !this._menuOpen) {
        this._tapTarget = { x: ptr.worldX, y: ptr.worldY };
      }
    });
  }

  // Handle menu taps using screen coordinates (ptr.x / ptr.y)
  _handleMenuTap(sx, sy) {
    // Check cancel
    if (Math.abs(sx - MENU_CX) < 80 && Math.abs(sy - this._menuCancelY) < 18) {
      this.closeMenu();
      return;
    }
    // Check each building button
    this._menuBtnObjects.forEach((btn, i) => {
      if (Math.abs(sx - MENU_CX) < 205 && Math.abs(sy - btn.y) < BTN_H / 2) {
        // Highlight flash
        btn.bg.setFillStyle(0x3a5a9a);
        this.time.delayedCall(120, () => btn.bg.setFillStyle(0x1e2a4a));
        this.onBuildChoice(BUILDING_TYPES[i]);
      }
    });
  }

  onBuildChoice(bt) {
    const plot = this._nearPlot;
    this.closeMenu();
    if (plot) this.doTask(plot, bt);
  }

  doTask(plot, bt) {
    if (plot.done || this.interacting) return;
    this.interacting = true;
    plot.done      = true;
    this.tweens.killTweensOf(plot.sprite);
    this.cameras.main.flash(300, 80, 220, 255);

    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 55, () => {
        const sp = this.add.image(
          plot.x + Phaser.Math.Between(-36, 36),
          plot.y + Phaser.Math.Between(-36, 36),
          'sparkle',
        ).setDepth(12).setScale(1.3);
        this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 35, duration: 550, onComplete: () => sp.destroy() });
      });
    }

    this.time.delayedCall(420, () => {
      plot.sprite.setTexture(bt.texture).setScale(1.7);
      plot.hint?.destroy();
      this.builtCount++;
      this.progressText.setText(`Built: ${this.builtCount} / ${PLOT_POSITIONS.length}`);
      if (this.builtCount >= PLOT_POSITIONS.length) this.onAllDone();
      this.interacting = false;
    });
  }

  onAllDone() {
    this.dockReady = true;
    this.dockHintWorld.setText('→ board the canoe now!').setColor('#FFD700');
    this.cameras.main.flash(500, 255, 220, 80);
    this.progressText.setText('✨ Village complete! Walk to the Waʻa Dock →').setColor('#FFD700');

    this.villagers.forEach((v, i) => {
      this.tweens.killTweensOf(v.sprite);
      this.time.delayedCall(i * 280, () => {
        this.tweens.add({
          targets: v.sprite,
          x: 2160 + (i % 2) * 26, y: 750 + Math.floor(i / 2) * 28,
          duration: 2000, ease: 'Quad.easeInOut',
        });
      });
    });
  }

  // ── Update loop ──────────────────────────────────────────────────────────────

  update() {
    if (!this.player?.body) return;

    const speed = 160;
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown  || this.wasd.A.isDown) { vx = -speed; this._tapTarget = null; }
    if (this.cursors.right.isDown || this.wasd.D.isDown) { vx =  speed; this._tapTarget = null; }
    if (this.cursors.up.isDown    || this.wasd.W.isDown) { vy = -speed; this._tapTarget = null; }
    if (this.cursors.down.isDown  || this.wasd.S.isDown) { vy =  speed; this._tapTarget = null; }

    if (!this._menuOpen && vx === 0 && vy === 0 && this._tapTarget) {
      const dx   = this._tapTarget.x - this.player.x;
      const dy   = this._tapTarget.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 12) {
        vx = (dx / dist) * speed;
        vy = (dy / dist) * speed;
      } else {
        this._tapTarget = null;
      }
    }

    if (this._menuOpen) { vx = 0; vy = 0; }
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    this.player.setVelocity(vx, vy);
    this.player.setDepth(2 + this.player.y / 1000);
    this.aura.x = this.player.x;
    this.aura.y = this.player.y;

    if (this._menuOpen) return;

    // Plot proximity — open menu on SPACE or proximity auto-prompt
    if (!this.interacting) {
      let nearest = null, nearestDist = Infinity;
      for (const plot of this.plots) {
        if (plot.done) continue;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, plot.x, plot.y);
        if (d < 70 && d < nearestDist) { nearest = plot; nearestDist = d; }
      }
      if (nearest) {
        this.interactPrompt.setText('🔨 Tap the plot or press SPACE to choose what to build!').setAlpha(1);
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.openMenu(nearest);
        return;
      }

      // Dock
      if (this.dockReady) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.dockX, this.dockY);
        if (d < 100) {
          this.interactPrompt.setText('🛶  Walk to the Waʻa to set sail!').setAlpha(1);
          if (!this._dockTriggering) {
            this._dockTriggering = true;
            this._tapTarget = null;
            this.time.delayedCall(600, () => this.launchCanoes());
          }
          return;
        } else {
          this._dockTriggering = false;
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
