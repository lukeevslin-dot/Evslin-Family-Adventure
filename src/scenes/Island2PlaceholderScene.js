import Phaser from 'phaser';

export default class Island2PlaceholderScene extends Phaser.Scene {
  constructor() { super({ key: 'Island2PlaceholderScene' }); }

  create() {
    // Sky background
    const gr = this.add.graphics();
    gr.fillStyle(0x4488CC); gr.fillRect(0, 0, 800, 420);
    gr.fillStyle(0x2277BB); gr.fillRect(0, 420, 800, 180);  // water
    gr.fillStyle(0x3399EE); gr.fillRect(0, 410, 800, 30);    // waterline

    // Animated waves
    for (let i = 0; i < 5; i++) {
      const wave = this.add.rectangle(
        i * 180, 420 + i * 8, 160, 8, 0x55BBEE, 0.5,
      ).setOrigin(0);
      this.tweens.add({
        targets: wave, x: wave.x + 200, duration: 2000 + i * 300,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Boat on water
    const boat = this.add.image(400, 450, 'boat').setScale(1.4);
    this.tweens.add({
      targets: boat, y: 458, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Character on boat
    const charKey = this.registry.get('selectedCharacter') || 'bear';
    const charSprite = this.add.image(400, 420, charKey).setScale(2.2);
    this.tweens.add({
      targets: charSprite, y: 428, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Crystal floating above character
    const crystal = this.add.image(400, 370, 'crystal_item').setScale(2);
    this.tweens.add({
      targets: crystal, y: 360, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Victory text
    this.add.text(400, 80, '🎉 Island 1 Complete! 🎉', {
      fontSize: '36px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#AA6600', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(400, 140, 'You defeated the Grumpy Frog\nand collected your first crystal!', {
      fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF', align: 'center',
    }).setOrigin(0.5);

    this.add.text(400, 230, 'You are now sailing to Island 2…', {
      fontSize: '20px', fontFamily: 'Arial', color: '#CCEEFF',
    }).setOrigin(0.5);

    this.add.text(400, 280, '🏝  Spooky Forest Island  🏝', {
      fontSize: '24px', fontFamily: 'Georgia, serif', color: '#FFAAFF',
      stroke: '#660066', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(400, 330, 'COMING IN MILESTONE 2', {
      fontSize: '16px', fontFamily: 'Arial', color: '#AAAAFF',
    }).setOrigin(0.5);

    // Play again / back to title
    const btnImg = this.add.image(400, 545, 'btn').setScale(1.05);
    const btnText = this.add.text(400, 543, 'Play Again', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#5C2E0A', fontStyle: 'bold',
    }).setOrigin(0.5);

    btnImg.setInteractive({ useHandCursor: true });
    btnImg.on('pointerover', () => btnImg.setScale(1.1));
    btnImg.on('pointerout',  () => btnImg.setScale(1.05));
    btnImg.on('pointerdown', () => {
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('TitleScene'));
    });

    // Crystal sparkles
    this.time.addEvent({
      delay: 600, loop: true,
      callback: () => {
        const sp = this.add.image(
          crystal.x + Phaser.Math.Between(-40, 40),
          crystal.y + Phaser.Math.Between(-30, 30),
          'sparkle',
        ).setScale(0.8);
        this.tweens.add({
          targets: sp, alpha: 0, y: sp.y - 30, duration: 600,
          onComplete: () => sp.destroy(),
        });
      },
    });

    this.cameras.main.fadeIn(800);
  }
}
