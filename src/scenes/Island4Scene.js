import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';
import {
  buildMap, createPlayer, createMonster, createDoor, createCrystalPickup,
  setupControls, handleMovement, handleWarning, handleCrystalPickup,
  handleDoorEntry, triggerBattle, onBattleWon, enterDoor,
} from '../utils/islandBuilder.js';

// Hawai'i (Big Island) — large volcanic island with irregular coastline
const MAP = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,1,1,1,1,1,0,0,0,0,0,0,1,1,1,2,2,2],
  [2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2],
  [2,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,2],
  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],
  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
  [2,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,2],
  [2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2],
  [2,2,2,1,1,1,1,0,0,0,0,0,0,1,1,1,1,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

const DOOR_X = 782;
const DOOR_Y = 300;

export default class Island4Scene extends Phaser.Scene {
  constructor() { super({ key: 'Island4Scene' }); }

  create() {
    this.battleDone    = false;
    this.battleActive  = false;
    this.doorUnlocked  = false;
    this.transitioning = false;
    this.crystalActive = false;

    // Orange volcanic haze
    this.add.rectangle(400, 300, 800, 600, 0xFF2200, 0.10).setDepth(0.5);

    buildMap(this, MAP, 'lava_rock', 'ember_rock');

    this.door = createDoor(this, DOOR_X, DOOR_Y);
    this.player = createPlayer(this, 80, 300);

    const mon = createMonster(this, {
      x: 630, y: 260,
      key: 'fire_lizard', name: 'Fire Lizard', labelColor: '#FF8844',
      bodyW: 50, bodyH: 26, bodyOX: 7, bodyOY: 13,
      // Lizard is fast
      patrolDX: 140, patrolDY: 90, patrolDurX: 1400, patrolDurY: 2000,
    });
    this.monster       = mon.monster;
    this.monsterLabel  = mon.label;
    this.monsterWarning= mon.warning;

    this.crystalSprite = createCrystalPickup(this, 670, 260);

    setupControls(this);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.monster,
      () => triggerBattle(this, 'TriviaScene'), null, this);

    this.add.text(400, 22, "🌋  Hawai\u02BBi \u2014 The Big Island", {
      fontSize: '17px', fontFamily: 'Georgia, serif', color: '#FF8844',
    }).setOrigin(0.5).setDepth(10);

    this.instructText = this.add.text(400, 560, 'Tap to move \u2014 find the Fire Lizard!', {
      fontSize: '15px', fontFamily: 'Arial', color: '#FFBB88',
    }).setOrigin(0.5).setDepth(10);

    if (this.scene.isActive('HUDScene')) this.scene.get('HUDScene').setIslandName("Hawai\u02BBi");
    audioManager.playTheme('island');
    this.cameras.main.fadeIn(600);
  }

  onBattleWon() {
    onBattleWon(this, 3, {});
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
        nextScene: 'CrystalCaveScene',
        toIslandName: 'The Crystal Cave',
      });
    });
  }
}
