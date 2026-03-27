import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';
import {
  buildMap, createPlayer, createMonster, createDoor, createCrystalPickup,
  setupControls, handleMovement, handleWarning, handleCrystalPickup,
  handleDoorEntry, triggerBattle, onBattleWon, enterDoor, spawnSparkles,
} from '../utils/islandBuilder.js';

// O'ahu — elongated island with two mountain ridges (Wai'anae & Ko'olau)
const MAP = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2],
  [2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2],
  [2,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,2],
  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
  [2,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,2],
  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
  [2,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,2],
  [2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2],
  [2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

const DOOR_X = 782;
const DOOR_Y = 300;

export default class Island2Scene extends Phaser.Scene {
  constructor() { super({ key: 'Island2Scene' }); }

  create() {
    this.battleDone    = false;
    this.battleActive  = false;
    this.doorUnlocked  = false;
    this.transitioning = false;
    this.crystalActive = false;

    // Purple fog overlay for spooky feel
    this.add.rectangle(400, 300, 800, 600, 0x1a0033, 0.35).setDepth(0.5);

    buildMap(this, MAP, 'dark_grass', 'dead_tree');

    this.door = createDoor(this, DOOR_X, DOOR_Y);
    this.player = createPlayer(this, 80, 300);

    const mon = createMonster(this, {
      x: 620, y: 280,
      key: 'shadow_fox', name: 'Shadow Fox', labelColor: '#CC88FF',
      bodyW: 50, bodyH: 24, bodyOX: 7, bodyOY: 14,
      patrolDX: 100, patrolDY: 70, patrolDurX: 1800, patrolDurY: 2600,
    });
    this.monster       = mon.monster;
    this.monsterLabel  = mon.label;
    this.monsterWarning= mon.warning;

    this.crystalSprite = createCrystalPickup(this, 660, 280);

    setupControls(this);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.monster,
      () => triggerBattle(this, 'SimonSaysScene'), null, this);

    this.add.text(400, 22, "🏝  O\u02BBahu \u2014 The Gathering Place", {
      fontSize: '17px', fontFamily: 'Georgia, serif', color: '#CC88FF',
    }).setOrigin(0.5).setDepth(10);

    this.instructText = this.add.text(400, 560, 'WASD / arrows to move \u2014 find the Shadow Fox!', {
      fontSize: '15px', fontFamily: 'Arial', color: '#CCAAFF',
    }).setOrigin(0.5).setDepth(10);

    if (this.scene.isActive('HUDScene')) this.scene.get('HUDScene').setIslandName("O\u02BBahu");
    audioManager.playTheme('island');
    this.cameras.main.fadeIn(600);
  }

  onBattleWon() {
    onBattleWon(this, 1, {});
    this.instructText.setText('Crystal collected! Walk to the glowing door →');
  }

  update() {
    handleMovement(this);
    handleWarning(this);
    handleCrystalPickup(this, () => {
      this.instructText.setText('Walk to the glowing door →');
    });
    handleDoorEntry(this, DOOR_X, DOOR_Y, () => {
      enterDoor(this, {
        nextScene: 'Island3Scene',
        toIslandName: "Maui \u2014 The Valley Isle",
      });
    });
  }
}
