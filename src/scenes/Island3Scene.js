import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';
import {
  buildMap, createPlayer, createMonster, createDoor, createCrystalPickup,
  setupControls, handleMovement, handleWarning, handleCrystalPickup,
  handleDoorEntry, triggerBattle, onBattleWon, enterDoor,
} from '../utils/islandBuilder.js';

// Maui — two-lobed island: West Maui (left) + Haleakalā (right) connected by isthmus
const MAP = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,2,2,2],
  [2,1,0,0,0,1,2,2,2,2,1,0,0,0,0,0,0,0,1,2],
  [2,1,0,1,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0,1],
  [2,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,2],
  [2,1,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,2,2],
  [2,1,1,0,0,1,2,2,2,2,1,0,0,0,0,0,1,1,2,2],
  [2,2,2,1,1,2,2,2,2,2,2,1,1,1,1,1,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

const DOOR_X = 782;
const DOOR_Y = 300;

export default class Island3Scene extends Phaser.Scene {
  constructor() { super({ key: 'Island3Scene' }); }

  create() {
    this.battleDone    = false;
    this.battleActive  = false;
    this.doorUnlocked  = false;
    this.transitioning = false;
    this.crystalActive = false;

    // Snowy blue tint
    this.add.rectangle(400, 300, 800, 600, 0xCCDDFF, 0.12).setDepth(0.5);

    buildMap(this, MAP, 'snow', 'pine');

    this.door = createDoor(this, DOOR_X, DOOR_Y);
    this.player = createPlayer(this, 80, 300);

    const mon = createMonster(this, {
      x: 600, y: 280,
      key: 'ice_golem', name: 'Ice Golem', labelColor: '#88CCFF',
      scale: 1.2, bodyW: 44, bodyH: 44, bodyOX: 6, bodyOY: 13,
      // Golem is slow
      patrolDX: 60, patrolDY: 40, patrolDurX: 3200, patrolDurY: 4000,
    });
    this.monster       = mon.monster;
    this.monsterLabel  = mon.label;
    this.monsterWarning= mon.warning;

    this.crystalSprite = createCrystalPickup(this, 640, 280);

    setupControls(this);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.monster,
      () => triggerBattle(this, 'SlidingPuzzleScene'), null, this);

    this.add.text(400, 22, '🏝  Maui \u2014 The Valley Isle', {
      fontSize: '17px', fontFamily: 'Georgia, serif', color: '#AADDFF',
    }).setOrigin(0.5).setDepth(10);

    this.instructText = this.add.text(400, 560, 'WASD / arrows to move \u2014 find the Ice Golem!', {
      fontSize: '15px', fontFamily: 'Arial', color: '#CCEEFF',
    }).setOrigin(0.5).setDepth(10);

    if (this.scene.isActive('HUDScene')) this.scene.get('HUDScene').setIslandName('Maui');
    audioManager.playTheme('island');
    this.cameras.main.fadeIn(600);
  }

  onBattleWon() {
    onBattleWon(this, 2, {});
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
        nextScene: 'Island4Scene',
        toIslandName: "Hawai\u02BBi \u2014 The Big Island",
      });
    });
  }
}
