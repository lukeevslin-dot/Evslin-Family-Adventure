import Phaser from 'phaser';

export default class HUDScene extends Phaser.Scene {
  constructor() { super({ key: 'HUDScene' }); }

  create() {
    this.add.image(400, 18, 'hud_bar').setDepth(20);
    this.crystalIcons = [];
    for (let i = 0; i < 4; i++) {
      const icon = this.add.image(680 + i * 34, 18, 'crystal_slot').setDepth(21);
      this.crystalIcons.push(icon);
    }
    this.add.text(640, 18, '✨', { fontSize: '16px' }).setOrigin(1, 0.5).setDepth(21);
    this.islandText = this.add.text(20, 18, '', {
      fontSize: '15px', fontFamily: 'Georgia, serif', color: '#FFFAAA',
    }).setOrigin(0, 0.5).setDepth(21);
    this.refresh();
  }

  refresh() {
    const crystals = this.registry.get('crystals') || [false, false, false, false];
    this.crystalIcons.forEach((icon, i) => {
      icon.setTexture(crystals[i] ? 'crystal_filled' : 'crystal_slot');
    });
  }

  setIslandName(name) {
    this.islandText?.setText(name);
  }
}
