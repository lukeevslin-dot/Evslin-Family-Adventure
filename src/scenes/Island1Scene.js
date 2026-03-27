import Phaser from 'phaser';
import { setCrystal } from '../utils/SaveManager.js';
import { audioManager } from '../utils/AudioManager.js';

// Kaua'i — roughly circular island (0=land, 1=tree, 2=ocean)
const MAP = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2],
  [2,2,2,1,1,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2],
  [2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2],
  [2,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,2,2],
  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // door row 1
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // door row 2
  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
  [2,2,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,2,2],
  [2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2],
  [2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

const TS = 40; // tile size
const COLS = 20;
const ROWS = 15;

export default class Island1Scene extends Phaser.Scene {
  constructor() { super({ key: 'Island1Scene' }); }

  create() {
    this.battleDone = false;
    this.doorUnlocked = false;

    this.buildMap();
    this.createDoor();
    this.createPlayer();
    this.createMonster();
    this.createCrystalPickup();
    this.createUI();
    this.setupControls();

    // Physics colliders
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.monster, this.walls);

    // Touch monster → battle
    this.physics.add.overlap(this.player, this.monster, this.triggerBattle, null, this);

    // Instruction text
    this.instructText = this.add.text(400, 560, 'Arrow keys or WASD to move — find the Grumpy Frog!', {
      fontSize: '16px', fontFamily: 'Arial', color: '#CCFFCC',
    }).setOrigin(0.5).setDepth(10);

    if (!this.scene.isActive('HUDScene')) this.scene.launch('HUDScene');
    audioManager.playTheme('island');
    this.cameras.main.fadeIn(600);
  }

  buildMap() {
    this.walls = this.physics.add.staticGroup();

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TS + TS / 2;
        const y = r * TS + TS / 2;

        if (MAP[r][c] === 2) {
          this.add.image(x, y, 'ocean');
          const w = this.walls.create(x, y, 'wall').setAlpha(0);
          w.setDisplaySize(TS, TS).refreshBody();
        } else {
          this.add.image(x, y, 'grass');
          if (MAP[r][c] === 1) {
            this.add.image(x, y + TS / 2, 'tree').setOrigin(0.5, 1).setDepth(1);
            const w = this.walls.create(x, y, 'wall').setAlpha(0);
            w.setDisplaySize(TS, TS).refreshBody();
          }
        }
      }
    }
  }

  createDoor() {
    // Door sits at right edge between rows 7-8
    this.door = this.add.image(800 - 18, 7.5 * TS, 'door_locked').setDepth(2);
    this.doorZone = this.add.zone(800 - 40, 7.5 * TS, 60, 80).setOrigin(0.5);
    this.physics.world.enable(this.doorZone);
    this.doorZone.body.allowGravity = false;
  }

  createPlayer() {
    const charKey = this.registry.get('selectedCharacter') || 'luke';
    this.player = this.physics.add.sprite(80, 7.5 * TS, charKey).setScale(1.8).setDepth(3);
    this.player.body.setSize(24, 32).setOffset(6, 12);
    this.player.setCollideWorldBounds(true);

    // Name label
    this.add.text(80, 30, '⭐ ' + charKey.charAt(0).toUpperCase() + charKey.slice(1), {
      fontSize: '16px', fontFamily: 'Arial', color: '#FFD700',
    }).setOrigin(0.5).setDepth(10);
  }

  createMonster() {
    this.monster = this.physics.add.sprite(650, 7.5 * TS, 'frog').setScale(1.4).setDepth(3);
    this.monster.body.setSize(44, 30).setOffset(10, 14);
    this.monster.setImmovable(false);

    // Monster label
    this.monsterLabel = this.add.text(650, 240, '😡 Grumpy Frog', {
      fontSize: '15px', fontFamily: 'Arial', color: '#FF6644',
    }).setOrigin(0.5).setDepth(10);

    // Simple patrol: bounce between two x positions
    this.tweens.add({
      targets: this.monster,
      x: 700, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: this.monster,
      y: 6.5 * TS, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: this.monsterLabel,
      y: 238, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Warning pulse when player is close
    this.monsterWarning = this.add.text(650, 205, '!', {
      fontSize: '28px', fontFamily: 'Arial', color: '#FF2200', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
  }

  createCrystalPickup() {
    this.crystalSprite = this.add.image(720, 7.5 * TS, 'crystal_item').setScale(1.8).setAlpha(0).setDepth(3);
    this.crystalZone = this.add.zone(720, 7.5 * TS, 60, 60).setOrigin(0.5);
    this.physics.world.enable(this.crystalZone);
    this.crystalZone.body.allowGravity = false;
    this.crystalActive = false;
  }

  createUI() {
    // Island label
    this.add.text(400, 12, '🏝  Kauaʻi — The Garden Isle', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#FFFAAA',
    }).setOrigin(0.5).setDepth(10);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
  }

  triggerBattle() {
    if (this.battleActive || this.battleDone) return;
    this.battleActive = true;

    this.cameras.main.flash(300, 255, 80, 0);
    this.time.delayedCall(300, () => {
      this.scene.launch('BattleScene', { callerKey: 'Island1Scene' });
      this.scene.pause();
    });
  }

  onBattleWon() {
    this.battleDone = true;
    this.battleActive = false;
    this.scene.resume('Island1Scene');
    setCrystal(this.registry, 0);
    if (this.scene.isActive('HUDScene')) this.scene.get('HUDScene').refresh();

    // Remove monster
    this.tweens.killTweensOf(this.monster);
    this.tweens.killTweensOf(this.monsterLabel);
    this.tweens.add({
      targets: [this.monster, this.monsterLabel, this.monsterWarning],
      alpha: 0, scale: 0, duration: 600, ease: 'Back.easeIn',
      onComplete: () => { this.monster.destroy(); this.monsterLabel.destroy(); },
    });

    // Show crystal
    this.time.delayedCall(400, () => {
      this.crystalSprite.setAlpha(1);
      this.crystalActive = true;
      this.tweens.add({
        targets: this.crystalSprite, y: this.crystalSprite.y - 8,
        duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      // Sparkles around crystal
      for (let i = 0; i < 5; i++) {
        this.time.delayedCall(i * 100, () => {
          const sp = this.add.image(
            this.crystalSprite.x + Phaser.Math.Between(-30, 30),
            this.crystalSprite.y + Phaser.Math.Between(-30, 30),
            'sparkle',
          ).setDepth(5).setScale(0.8);
          this.tweens.add({
            targets: sp, alpha: 0, y: sp.y - 20, duration: 600,
            onComplete: () => sp.destroy(),
          });
        });
      }

      // Unlock door
      this.door.setTexture('door_unlocked');
      this.doorUnlocked = true;
      this.cameras.main.flash(200, 255, 220, 80);
      this.instructText.setText('The door is open! Walk to it on the right →');
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

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    this.player.setVelocity(vx, vy);

    // Depth sort player vs trees
    this.player.setDepth(2 + this.player.y / 1000);

    // Monster warning pulse
    if (!this.battleDone && this.monster?.active) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.monster.x, this.monster.y,
      );
      this.monsterWarning.setAlpha(dist < 180 ? 0.8 + 0.2 * Math.sin(this.time.now / 120) : 0);
      this.monsterWarning.x = this.monster.x;
      this.monsterWarning.y = this.monster.y - 50;
    }

    // Crystal overlap
    if (this.crystalActive) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.crystalSprite.x, this.crystalSprite.y,
      );
      if (dist < 40) {
        this.crystalActive = false;
        this.tweens.add({
          targets: this.crystalSprite, alpha: 0, y: this.crystalSprite.y - 40,
          scale: 0, duration: 400,
        });
        this.instructText.setText('Crystal collected! Walk to the glowing door →');
      }
    }

    // Door overlap
    if (this.doorUnlocked) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 780, 7.5 * TS);
      if (dist < 60) this.enterDoor();
    }
  }

  enterDoor() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.player.setVelocity(0, 0);
    this.cameras.main.flash(200, 255, 255, 200);
    this.time.delayedCall(200, () => {
      this.cameras.main.fade(600, 0, 0, 0);
      this.time.delayedCall(600, () => this.scene.start('BoatScene', {
        nextScene: 'Island2Scene',
        toIslandName: "O\u02BBahu \u2014 The Gathering Place",
      }));
    });
  }
}
