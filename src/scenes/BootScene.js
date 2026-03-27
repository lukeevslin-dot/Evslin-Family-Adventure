import Phaser from 'phaser';
import { make } from '../TextureFactory';

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    make(this);
    this.scene.start('TitleScene');
  }
}
