import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import CharacterSelectScene from './scenes/CharacterSelectScene';
import Island1Scene from './scenes/Island1Scene';
import Island2Scene from './scenes/Island2Scene';
import Island3Scene from './scenes/Island3Scene';
import Island4Scene from './scenes/Island4Scene';
import BattleScene from './scenes/BattleScene';
import SimonSaysScene from './scenes/SimonSaysScene';
import SlidingPuzzleScene from './scenes/SlidingPuzzleScene';
import TriviaScene from './scenes/TriviaScene';
import BoatScene from './scenes/BoatScene';
import CrystalCaveScene from './scenes/CrystalCaveScene';
import VillageScene from './scenes/VillageScene';
import VillageEndScene from './scenes/VillageEndScene';
import HUDScene from './scenes/HUDScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0a0520',
  parent: 'game',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [
    BootScene,
    TitleScene,
    CharacterSelectScene,
    Island1Scene,
    Island2Scene,
    Island3Scene,
    Island4Scene,
    BattleScene,
    SimonSaysScene,
    SlidingPuzzleScene,
    TriviaScene,
    BoatScene,
    CrystalCaveScene,
    VillageScene,
    VillageEndScene,
    HUDScene,
  ],
};

export default new Phaser.Game(config);
