// Shared builder for all island scenes.
// Each island scene calls these functions from create() and update().

import { setCrystal } from './SaveManager.js';

const TS = 40;
const COLS = 20;
const ROWS = 15;

export function buildMap(scene, MAP, tileKey, treeKey) {
  scene.walls = scene.physics.add.staticGroup();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TS + TS / 2;
      const y = r * TS + TS / 2;

      if (MAP[r][c] === 2) {
        scene.add.image(x, y, 'ocean');
        const w = scene.walls.create(x, y, 'wall').setAlpha(0);
        w.setDisplaySize(TS, TS).refreshBody();
      } else {
        scene.add.image(x, y, tileKey);
        if (MAP[r][c] === 1) {
          scene.add.image(x, y + TS / 2, treeKey).setOrigin(0.5, 1).setDepth(1);
          const w = scene.walls.create(x, y, 'wall').setAlpha(0);
          w.setDisplaySize(TS, TS).refreshBody();
        }
      }
    }
  }
}

export function createPlayer(scene, startX, startY) {
  const charKey = scene.registry.get('selectedCharacter') || 'luke';
  const player = scene.physics.add.sprite(startX, startY, charKey)
    .setScale(1.8).setDepth(3);
  player.body.setSize(24, 32).setOffset(6, 12);
  player.setCollideWorldBounds(true);
  return player;
}

export function createMonster(scene, cfg) {
  const monster = scene.physics.add.sprite(cfg.x, cfg.y, cfg.key)
    .setScale(cfg.scale ?? 1.4).setDepth(3);
  monster.body.setSize(cfg.bodyW ?? 44, cfg.bodyH ?? 30)
    .setOffset(cfg.bodyOX ?? 10, cfg.bodyOY ?? 14);

  const label = scene.add.text(cfg.x, cfg.y - 50, `😡 ${cfg.name}`, {
    fontSize: '15px', fontFamily: 'Arial', color: cfg.labelColor ?? '#FF6644',
  }).setOrigin(0.5).setDepth(10);

  const warning = scene.add.text(cfg.x, cfg.y - 80, '!', {
    fontSize: '28px', fontFamily: 'Arial', color: '#FF2200', fontStyle: 'bold',
  }).setOrigin(0.5).setAlpha(0).setDepth(10);

  // Patrol tweens
  scene.tweens.add({
    targets: monster, x: cfg.x + (cfg.patrolDX ?? 80),
    duration: cfg.patrolDurX ?? 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });
  scene.tweens.add({
    targets: [monster, label, warning],
    y: `+=${cfg.patrolDY ?? 60}`,
    duration: cfg.patrolDurY ?? 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });

  return { monster, label, warning };
}

export function createDoor(scene, x, y) {
  const door = scene.add.image(x, y, 'door_locked').setDepth(2);
  return door;
}

export function createCrystalPickup(scene, x, y) {
  const sprite = scene.add.image(x, y, 'crystal_item')
    .setScale(1.8).setAlpha(0).setDepth(3);
  return sprite;
}

export function setupControls(scene) {
  scene.cursors    = scene.input.keyboard.createCursorKeys();
  scene.wasd       = scene.input.keyboard.addKeys('W,A,S,D');
  scene._tapTarget = null;

  // Tap-to-move: tap/drag anywhere → character walks to that point
  scene.input.on('pointerdown', (ptr) => {
    scene._tapTarget = { x: ptr.x, y: ptr.y };
  });
  scene.input.on('pointermove', (ptr) => {
    if (ptr.isDown) scene._tapTarget = { x: ptr.x, y: ptr.y };
  });
}

export function handleMovement(scene) {
  if (!scene.player?.body) return;
  const speed = 160;
  let vx = 0, vy = 0;

  // Keyboard / WASD — clears tap target so keys take full control
  if (scene.cursors.left.isDown  || scene.wasd.A.isDown) { vx = -speed; scene._tapTarget = null; }
  if (scene.cursors.right.isDown || scene.wasd.D.isDown) { vx =  speed; scene._tapTarget = null; }
  if (scene.cursors.up.isDown    || scene.wasd.W.isDown) { vy = -speed; scene._tapTarget = null; }
  if (scene.cursors.down.isDown  || scene.wasd.S.isDown) { vy =  speed; scene._tapTarget = null; }

  // Tap-to-move — persists until character arrives
  if (vx === 0 && vy === 0 && scene._tapTarget) {
    const dx   = scene._tapTarget.x - scene.player.x;
    const dy   = scene._tapTarget.y - scene.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 12) {
      vx = (dx / dist) * speed;
      vy = (dy / dist) * speed;
    } else {
      scene._tapTarget = null; // arrived
    }
  }

  if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
  scene.player.setVelocity(vx, vy);
  scene.player.setDepth(2 + scene.player.y / 1000);
}

export function handleWarning(scene) {
  if (!scene.battleDone && scene.monster?.active) {
    const dist = Phaser.Math.Distance.Between(
      scene.player.x, scene.player.y, scene.monster.x, scene.monster.y,
    );
    scene.monsterWarning.setAlpha(dist < 180 ? 0.8 + 0.2 * Math.sin(scene.time.now / 120) : 0);
    scene.monsterWarning.x = scene.monster.x;
    scene.monsterWarning.y = scene.monster.y - 80;
  }
}

export function handleCrystalPickup(scene, onPickup) {
  if (!scene.crystalActive) return;
  const dist = Phaser.Math.Distance.Between(
    scene.player.x, scene.player.y, scene.crystalSprite.x, scene.crystalSprite.y,
  );
  if (dist < 48) {
    scene.crystalActive = false;
    scene.tweens.add({
      targets: scene.crystalSprite, alpha: 0, y: scene.crystalSprite.y - 40,
      scale: 0, duration: 400,
    });
    onPickup?.();
  }
}

export function handleDoorEntry(scene, doorX, doorY, onEnter) {
  if (!scene.doorUnlocked || scene.transitioning) return;
  const dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, doorX, doorY);
  if (dist < 60) onEnter();
}

export function triggerBattle(scene, battleSceneKey) {
  if (scene.battleActive || scene.battleDone) return;
  scene.battleActive = true;
  scene.cameras.main.flash(300, 255, 80, 0);
  scene.time.delayedCall(300, () => {
    scene.scene.launch(battleSceneKey, { callerKey: scene.scene.key });
    scene.scene.pause();
  });
}

export function onBattleWon(scene, crystalIndex, nextBoatData) {
  scene.battleDone = true;
  scene.battleActive = false;
  scene.scene.resume(scene.scene.key);

  // Remove monster with tween
  scene.tweens.killTweensOf(scene.monster);
  scene.tweens.killTweensOf(scene.monsterLabel);
  scene.tweens.add({
    targets: [scene.monster, scene.monsterLabel, scene.monsterWarning],
    alpha: 0, scale: 0, duration: 600, ease: 'Back.easeIn',
    onComplete: () => { scene.monster.destroy(); scene.monsterLabel.destroy(); },
  });

  // Save crystal
  setCrystal(scene.registry, crystalIndex);

  // Update HUD
  scene.events.emit('crystalEarned');
  if (scene.scene.isActive('HUDScene')) {
    scene.scene.get('HUDScene').refresh();
  }

  // Show crystal pickup
  scene.time.delayedCall(400, () => {
    scene.crystalSprite.setAlpha(1);
    scene.crystalActive = true;
    scene.tweens.add({
      targets: scene.crystalSprite, y: scene.crystalSprite.y - 8,
      duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    spawnSparkles(scene, scene.crystalSprite.x, scene.crystalSprite.y);

    scene.door.setTexture('door_unlocked');
    scene.doorUnlocked = true;
    scene.cameras.main.flash(200, 255, 220, 80);
    scene.instructText?.setText('Crystal collected! Walk to the glowing door →');
  });
}

export function spawnSparkles(scene, x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    scene.time.delayedCall(i * 100, () => {
      const sp = scene.add.image(
        x + Phaser.Math.Between(-30, 30),
        y + Phaser.Math.Between(-30, 30),
        'sparkle',
      ).setDepth(5).setScale(0.8);
      scene.tweens.add({
        targets: sp, alpha: 0, y: sp.y - 20, duration: 600,
        onComplete: () => sp.destroy(),
      });
    });
  }
}

export function enterDoor(scene, boatData) {
  if (scene.transitioning) return;
  scene.transitioning = true;
  scene.player.setVelocity(0, 0);
  scene.cameras.main.flash(200, 255, 255, 200);
  scene.time.delayedCall(200, () => {
    scene.cameras.main.fade(600, 0, 0, 0);
    scene.time.delayedCall(600, () => scene.scene.start('BoatScene', boatData));
  });
}
