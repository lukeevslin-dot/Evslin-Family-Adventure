// Generates all game textures procedurally using Phaser Graphics.
// Call make(scene) once in BootScene.create() before starting any other scene.

export function make(scene) {
  createGrass(scene);
  createTree(scene);
  createWall(scene);
  createDoorLocked(scene);
  createDoorUnlocked(scene);
  createCrystalItem(scene);
  createBoat(scene);
  createFrog(scene);
  createLuke(scene);
  createSokchea(scene);
  createFinley(scene);
  createLevi(scene);
  createGems(scene);
  createHeart(scene, 'heart',       0xe74c3c);
  createHeart(scene, 'heart_empty', 0x555555);
  createButton(scene);
  createCharCard(scene, 'char_card',     0x2a1f4a, 0x4a3a7a);
  createCharCard(scene, 'char_selected', 0x4a2a00, 0xFFD700);
  createHPBarBg(scene);
  createStarBg(scene);
  createSparkle(scene);
  createMagicAura(scene);
  createOcean(scene);
  // Milestone 2 additions
  createDarkGrass(scene);
  createDeadTree(scene);
  createSnow(scene);
  createPine(scene);
  createLavaRock(scene);
  createEmberRock(scene);
  createShadowFox(scene);
  createIceGolem(scene);
  createFireLizard(scene);
  createSimonPad(scene);
  createSlideTile(scene);
  createCrystalSlot(scene, 'crystal_slot',   0x333355, 0x556688);
  createCrystalSlot(scene, 'crystal_filled', 0x80DFFF, 0xFFFFFF);
  createSmashCrystal(scene);
  createCaveBg(scene);
  createHUDBar(scene);
  // Milestone 3 additions
  createHousePlot(scene);
  createHouseBuilt(scene);
  createGardenPlot(scene);
  createGardenGrown(scene);
  createVillagerNPC(scene);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function g(scene, w, h) {
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

function tex(scene, key, w, h, drawFn) {
  const gr = scene.make.graphics({ x: 0, y: 0, add: false });
  drawFn(gr);
  gr.generateTexture(key, w, h);
  gr.destroy();
}

// ─── tiles ──────────────────────────────────────────────────────────────────

function createOcean(scene) {
  tex(scene, 'ocean', 40, 40, (g) => {
    g.fillStyle(0x1A6B9A); g.fillRect(0, 0, 40, 40);
    // Wave stripes
    g.fillStyle(0x2280BB);
    g.fillRect(0, 7, 40, 3); g.fillRect(0, 20, 40, 2); g.fillRect(0, 32, 40, 2);
    // Foam highlights
    g.fillStyle(0x7BBEDD);
    g.fillRect(3, 8, 7, 1); g.fillRect(18, 21, 9, 1);
    g.fillRect(28, 8, 6, 1); g.fillRect(7, 33, 8, 1);
    // Deep shadow
    g.fillStyle(0x115580);
    g.fillRect(0, 0, 40, 4);
  });
}

function createGrass(scene) {
  tex(scene, 'grass', 40, 40, (g) => {
    g.fillStyle(0x4a9a30); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0x3d8a24);
    g.fillRect(4, 4, 4, 3); g.fillRect(22, 10, 3, 3);
    g.fillRect(12, 26, 4, 3); g.fillRect(30, 20, 3, 4);
    g.fillStyle(0x62b845);
    g.fillRect(10, 18, 2, 2); g.fillRect(28, 6, 2, 2);
  });
}

function createTree(scene) {
  tex(scene, 'tree', 40, 64, (g) => {
    // trunk
    g.fillStyle(0x7B4F2E); g.fillRect(13, 36, 14, 28);
    g.fillStyle(0x5C3820); g.fillRect(17, 38, 5, 26);
    // canopy (draws over trunk top)
    g.fillStyle(0x2d7a1a); g.fillCircle(20, 22, 20);
    g.fillStyle(0x3d9a2a); g.fillCircle(14, 18, 11); g.fillCircle(26, 16, 9);
    g.fillStyle(0x1d5a10); g.fillCircle(20, 28, 9);
    g.fillStyle(0x62b845); g.fillCircle(16, 14, 4); g.fillCircle(24, 12, 3);
  });
}

function createWall(scene) {
  tex(scene, 'wall', 40, 40, (g) => {
    g.fillStyle(0x1a4a0a); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0x2d7a1a); g.fillCircle(20, 20, 18);
    g.fillStyle(0x1d5a10); g.fillCircle(16, 16, 8); g.fillCircle(24, 24, 7);
  });
}

// ─── interactive objects ─────────────────────────────────────────────────────

function createDoorLocked(scene) {
  tex(scene, 'door_locked', 36, 56, (g) => {
    g.fillStyle(0x5C3820); g.fillRect(0, 0, 36, 56);       // frame
    g.fillStyle(0x8B5E3C); g.fillRect(3, 3, 30, 50);        // door
    g.fillStyle(0xA07040); g.fillRect(5, 5, 26, 46);        // panel
    g.fillStyle(0x5C3820); g.fillRect(5, 28, 26, 2);        // mid rail
    // lock
    g.fillStyle(0xFFD700); g.fillCircle(18, 22, 7);
    g.fillStyle(0xA07040); g.fillCircle(18, 22, 4);
    g.fillStyle(0xFFD700); g.fillRect(14, 25, 8, 7);
    g.fillStyle(0x5C3820); g.fillRect(16, 27, 4, 4);
  });
}

function createDoorUnlocked(scene) {
  tex(scene, 'door_unlocked', 36, 56, (g) => {
    g.fillStyle(0x5C3820); g.fillRect(0, 0, 36, 56);
    g.fillStyle(0x0a0520); g.fillRect(3, 3, 30, 50);        // open passage
    g.fillStyle(0xFFFFAA, 0.4); g.fillRect(5, 5, 26, 46);   // golden glow
    g.fillStyle(0xFFFFFF); g.fillRect(10, 14, 3, 3); g.fillRect(22, 20, 3, 3); g.fillRect(15, 34, 2, 2);
  });
}

function createCrystalItem(scene) {
  tex(scene, 'crystal_item', 24, 36, (g) => {
    g.fillStyle(0x80DFFF);
    g.fillTriangle(12, 0, 0, 16, 24, 16);    // top
    g.fillTriangle(12, 36, 0, 16, 24, 16);   // bottom
    g.fillStyle(0xFFFFFF);
    g.fillTriangle(12, 4, 5, 14, 14, 14);    // highlight
    g.fillStyle(0x40AAFF);
    g.fillTriangle(12, 32, 10, 18, 20, 18);  // shadow
  });
}

function createSmashCrystal(scene) {
  tex(scene, 'crystal', 56, 72, (g) => {
    // Solid base so no transparency bleed
    g.fillStyle(0x000000, 0);
    // Main ice crystal body — hexagonal-ish faceted gem
    g.fillStyle(0x55CCFF);
    g.fillTriangle(28, 0,  4, 22, 52, 22);   // top cap
    g.fillRect(8, 22, 40, 30);               // middle body
    g.fillTriangle(8, 52, 28, 72, 48, 52);   // bottom point
    // Highlight facet (lighter blue)
    g.fillStyle(0xAAEEFF);
    g.fillTriangle(28, 4, 10, 20, 26, 20);
    g.fillRect(10, 22, 14, 18);
    // Mid-body dark seam
    g.fillStyle(0x2288CC);
    g.fillRect(8, 38, 40, 3);
    // Bottom shadow facet
    g.fillStyle(0x1166AA);
    g.fillTriangle(12, 54, 28, 70, 44, 54);
    // Inner gleam (white flash)
    g.fillStyle(0xFFFFFF);
    g.fillTriangle(20, 8, 14, 18, 26, 18);
    g.fillRect(20, 22, 6, 8);
  });
}

function createBoat(scene) {
  tex(scene, 'boat', 112, 56, (g) => {
    // ── Outrigger float (ama) — thin hull at top ──
    g.fillStyle(0x6B3E18);
    g.fillRect(20, 7, 58, 8);
    g.fillTriangle(20, 11, 28, 7, 28, 15);   // left taper
    g.fillTriangle(78, 11, 70, 7, 70, 15);   // right taper
    g.fillStyle(0xAA7040);
    g.fillRect(26, 8, 46, 3);                 // highlight

    // ── Booms (iako) — two connecting spars ──
    g.fillStyle(0xCC9955);
    g.fillRect(32, 14, 5, 18);  // front boom
    g.fillRect(62, 14, 5, 18);  // rear boom

    // ── Main hull — narrow canoe, pointed ends ──
    g.fillStyle(0x6B3E18);
    g.fillRect(10, 32, 84, 18);
    g.fillTriangle(94, 41, 84, 32, 84, 50);  // bow (right) pointed
    g.fillTriangle(10, 41, 20, 32, 20, 50);  // stern (left)
    // Interior wood grain
    g.fillStyle(0x9B6030);
    g.fillRect(16, 35, 68, 10);
    // Gunwale (top rail)
    g.fillStyle(0x4A2808);
    g.fillRect(10, 32, 84, 3);
    // Dark keel at bottom
    g.fillStyle(0x3A1A04);
    g.fillRect(10, 47, 84, 3);

    // ── Crab-claw sail (traditional Hawaiian wā'a) ──
    // Mast
    g.fillStyle(0x5C3010);
    g.fillRect(50, 4, 3, 28);
    // Upper spar (angled right and up)
    g.fillRect(51, 4, 32, 3);
    // Lower spar (angled left and down)
    g.fillRect(26, 22, 26, 3);
    // Sail fabric — golden/ochre traditional tapa
    g.fillStyle(0xF2D060);
    g.fillTriangle(51, 5, 51, 31, 83, 6);   // right panel
    g.fillStyle(0xD4A830);
    g.fillTriangle(51, 6, 51, 31, 28, 24);  // left panel
    // Sail stripe detail
    g.fillStyle(0xB88020);
    g.fillRect(51, 16, 18, 2);
  });
}

// ─── frog monster ────────────────────────────────────────────────────────────

function createFrog(scene) {
  tex(scene, 'frog', 64, 52, (g) => {
    // body
    g.fillStyle(0x2E8B22); g.fillEllipse(32, 36, 58, 32);
    // belly
    g.fillStyle(0x90EE90); g.fillEllipse(32, 38, 38, 20);
    // head
    g.fillStyle(0x2E8B22); g.fillEllipse(32, 18, 50, 30);
    // eye stalks + eyes
    g.fillStyle(0x2E8B22); g.fillCircle(16, 6, 10); g.fillCircle(48, 6, 10);
    g.fillStyle(0xFFEE00); g.fillCircle(16, 6, 8); g.fillCircle(48, 6, 8);
    g.fillStyle(0x111111); g.fillCircle(16, 6, 5); g.fillCircle(48, 6, 5);
    g.fillStyle(0xFFFFFF); g.fillCircle(18, 4, 2); g.fillCircle(50, 4, 2);
    // grumpy brow
    g.fillStyle(0x1a5a10);
    g.fillRect(9, 0, 14, 3); g.fillRect(41, 0, 14, 3);
    // mouth (grumpy frown)
    g.fillStyle(0x1a5a10);
    g.fillRect(18, 24, 28, 3);
    g.fillRect(16, 25, 4, 4); g.fillRect(44, 25, 4, 4);
    // nostrils
    g.fillCircle(26, 20, 2); g.fillCircle(38, 20, 2);
  });
}

// ─── family characters ───────────────────────────────────────────────────────

// Luke: tall dad, bald, fair skin, dark athletic clothes
function createLuke(scene) {
  tex(scene, 'luke', 36, 52, (g) => {
    const skin = 0xF5C8A0;
    const shirt = 0x222233;
    const pants = 0x1A1A28;
    // Legs
    g.fillStyle(pants);
    g.fillRect(8, 38, 9, 14); g.fillRect(19, 38, 9, 14);
    // Torso (broad-shouldered)
    g.fillStyle(shirt);
    g.fillRect(5, 22, 26, 17);
    // Arms
    g.fillRect(0, 22, 6, 14); g.fillRect(30, 22, 6, 14);
    // Hands
    g.fillStyle(skin);
    g.fillRect(0, 35, 6, 5); g.fillRect(30, 35, 6, 5);
    // Neck
    g.fillRect(14, 18, 8, 6);
    // Bald head (large, fair)
    g.fillCircle(18, 12, 13);
    // Slight shine on bald top
    g.fillStyle(0xFFEED8);
    g.fillEllipse(15, 6, 9, 4);
    // Eyes (blue-grey)
    g.fillStyle(0xFFFFFF); g.fillCircle(13, 12, 3); g.fillCircle(23, 12, 3);
    g.fillStyle(0x446688); g.fillCircle(13, 12, 2); g.fillCircle(23, 12, 2);
    g.fillStyle(0xFFFFFF); g.fillRect(12, 11, 1, 1); g.fillRect(22, 11, 1, 1);
    // Friendly smile
    g.fillStyle(0xCC9070);
    g.fillRect(14, 18, 8, 2); g.fillRect(13, 17, 3, 2); g.fillRect(20, 17, 3, 2);
  });
}

// Sokchea: Asian mom, long black hair, warm tan skin, dark outfit
function createSokchea(scene) {
  tex(scene, 'sokchea', 36, 52, (g) => {
    const skin = 0xD4956A;
    const hair = 0x18100A;
    const shirt = 0x1A2240;
    const pants = 0x0E1420;
    // Long hair hanging behind body (drawn first, behind everything)
    g.fillStyle(hair);
    g.fillRect(4, 10, 7, 28); g.fillRect(25, 10, 7, 28);
    // Legs
    g.fillStyle(pants);
    g.fillRect(9, 38, 8, 14); g.fillRect(19, 38, 8, 14);
    // Torso
    g.fillStyle(shirt);
    g.fillRect(8, 22, 20, 17);
    // Arms
    g.fillRect(3, 22, 6, 14); g.fillRect(27, 22, 6, 14);
    // Hands
    g.fillStyle(skin);
    g.fillRect(3, 35, 6, 5); g.fillRect(27, 35, 6, 5);
    // Neck
    g.fillRect(14, 18, 8, 6);
    // Head
    g.fillCircle(18, 12, 11);
    // Hair top (over head)
    g.fillStyle(hair);
    g.fillEllipse(18, 5, 22, 12);
    g.fillRect(7, 8, 5, 10); g.fillRect(24, 8, 5, 10);
    // Eyes (dark brown, slightly almond-shaped)
    g.fillStyle(0xFFFFFF); g.fillEllipse(13, 12, 6, 5); g.fillEllipse(23, 12, 6, 5);
    g.fillStyle(0x2A1608); g.fillCircle(13, 12, 2); g.fillCircle(23, 12, 2);
    g.fillStyle(0xFFFFFF); g.fillRect(12, 11, 1, 1); g.fillRect(22, 11, 1, 1);
    // Warm smile
    g.fillStyle(0xB07050);
    g.fillRect(14, 18, 8, 2); g.fillRect(13, 17, 3, 2); g.fillRect(20, 17, 3, 2);
  });
}

// Finley: 9yo daughter, fair skin, brown hair, pink top, jeans
function createFinley(scene) {
  tex(scene, 'finley', 36, 52, (g) => {
    const skin = 0xF5D0B0;
    const hair = 0x7B4A28;
    const shirt = 0xFFB0C8;
    const pants = 0x3A5A8A;
    // Long brown hair (behind)
    g.fillStyle(hair);
    g.fillRect(4, 10, 6, 24); g.fillRect(26, 10, 6, 24);
    // Legs
    g.fillStyle(pants);
    g.fillRect(10, 37, 7, 15); g.fillRect(19, 37, 7, 15);
    // Torso
    g.fillStyle(shirt);
    g.fillRect(9, 22, 18, 16);
    // Arms
    g.fillRect(4, 22, 6, 12); g.fillRect(26, 22, 6, 12);
    // Hands
    g.fillStyle(skin);
    g.fillRect(4, 33, 5, 5); g.fillRect(26, 33, 5, 5);
    // Neck
    g.fillRect(14, 18, 8, 5);
    // Head (slightly smaller — kid)
    g.fillCircle(18, 12, 11);
    // Brown hair on top
    g.fillStyle(hair);
    g.fillEllipse(18, 5, 22, 12);
    g.fillRect(6, 8, 5, 8); g.fillRect(25, 8, 5, 8);
    // Eyes (green-hazel)
    g.fillStyle(0xFFFFFF); g.fillCircle(13, 12, 3); g.fillCircle(23, 12, 3);
    g.fillStyle(0x4A7840); g.fillCircle(13, 12, 2); g.fillCircle(23, 12, 2);
    g.fillStyle(0xFFFFFF); g.fillRect(12, 11, 1, 1); g.fillRect(22, 11, 1, 1);
    // Big kid smile
    g.fillStyle(0xD49070);
    g.fillRect(13, 18, 10, 2); g.fillRect(12, 17, 3, 2); g.fillRect(21, 17, 3, 2);
  });
}

// Levi: 6yo son, warm tan skin, dark hair, blue shirt, green shorts
function createLevi(scene) {
  tex(scene, 'levi', 36, 52, (g) => {
    const skin = 0xDFA870;
    const hair = 0x18100A;
    const shirt = 0x2266CC;
    const shorts = 0x3A5030;
    // Legs (shorter — youngest)
    g.fillStyle(shorts);
    g.fillRect(10, 37, 7, 13); g.fillRect(19, 37, 7, 13);
    // Torso
    g.fillStyle(shirt);
    g.fillRect(9, 22, 18, 16);
    // Arms
    g.fillRect(4, 22, 6, 12); g.fillRect(26, 22, 6, 12);
    // Hands
    g.fillStyle(skin);
    g.fillRect(4, 33, 5, 5); g.fillRect(26, 33, 5, 5);
    // Neck
    g.fillRect(14, 18, 8, 5);
    // Head (big relative to body = little kid look)
    g.fillCircle(18, 12, 12);
    // Short dark hair on top
    g.fillStyle(hair);
    g.fillEllipse(18, 4, 22, 10);
    g.fillRect(6, 6, 5, 6); g.fillRect(25, 6, 5, 6);
    // Eyes (warm brown)
    g.fillStyle(0xFFFFFF); g.fillCircle(13, 12, 3); g.fillCircle(23, 12, 3);
    g.fillStyle(0x2A1608); g.fillCircle(13, 12, 2); g.fillCircle(23, 12, 2);
    g.fillStyle(0xFFFFFF); g.fillRect(12, 11, 1, 1); g.fillRect(22, 11, 1, 1);
    // Cheeky grin
    g.fillStyle(0xB07848);
    g.fillRect(13, 18, 10, 2); g.fillRect(12, 17, 3, 2); g.fillRect(21, 17, 3, 2);
  });
}

// ─── match-3 gems ────────────────────────────────────────────────────────────

function createGems(scene) {
  const defs = [
    { key: 'gem_0', base: 0xe74c3c, light: 0xff8c7a, dark: 0xaa1c0c },  // ruby
    { key: 'gem_1', base: 0x3498db, light: 0x7ec8ff, dark: 0x1466a0 },  // sapphire
    { key: 'gem_2', base: 0x2ecc71, light: 0x7fffc0, dark: 0x0e8a40 },  // emerald
    { key: 'gem_3', base: 0xf1c40f, light: 0xffef80, dark: 0xb08800 },  // amber
    { key: 'gem_4', base: 0x9b59b6, light: 0xd4a0ff, dark: 0x6a2a90 },  // amethyst
  ];

  for (const { key, base, light, dark } of defs) {
    tex(scene, key, 48, 48, (g) => {
      const cx = 24, cy = 24, r = 20;
      // main diamond body
      g.fillStyle(base);
      g.fillTriangle(cx, cy - r, cx - r, cy, cx + r, cy);  // top half
      g.fillTriangle(cx, cy + r, cx - r, cy, cx + r, cy);  // bottom half
      // top-left facet (light)
      g.fillStyle(light);
      g.fillTriangle(cx, cy - r + 5, cx - r + 4, cy - 2, cx + 2, cy - 2);
      // bottom-right facet (dark)
      g.fillStyle(dark);
      g.fillTriangle(cx, cy + r - 5, cx + r - 4, cy + 2, cx - 2, cy + 2);
      // shine dot
      g.fillStyle(0xFFFFFF);
      g.fillRect(cx - 6, cy - r + 6, 5, 3);
    });
  }
}

// ─── ui elements ─────────────────────────────────────────────────────────────

function createHeart(scene, key, color) {
  tex(scene, key, 30, 28, (g) => {
    g.fillStyle(color);
    g.fillCircle(9, 9, 9); g.fillCircle(21, 9, 9);
    g.fillTriangle(0, 9, 30, 9, 15, 28);
    g.fillRect(0, 9, 30, 12);
  });
}

function createButton(scene) {
  tex(scene, 'btn', 240, 64, (g) => {
    // shadow
    g.fillStyle(0x000000, 0.3); g.fillRoundedRect(4, 6, 240, 64, 14);
    // body
    g.fillStyle(0xF5A623); g.fillRoundedRect(0, 0, 240, 60, 14);
    // shine
    g.fillStyle(0xFFCC55); g.fillRoundedRect(4, 4, 232, 26, 10);
  });
}

function createCharCard(scene, key, bg, border) {
  tex(scene, key, 140, 170, (g) => {
    // border glow
    g.fillStyle(border); g.fillRoundedRect(0, 0, 140, 170, 12);
    // card bg
    g.fillStyle(bg); g.fillRoundedRect(4, 4, 132, 162, 10);
  });
}

function createHPBarBg(scene) {
  tex(scene, 'hp_bg', 220, 22, (g) => {
    g.fillStyle(0x222222); g.fillRoundedRect(0, 0, 220, 22, 6);
    g.fillStyle(0x444444); g.fillRoundedRect(2, 2, 216, 18, 5);
  });
}

function createStarBg(scene) {
  tex(scene, 'star_bg', 800, 600, (g) => {
    g.fillStyle(0x0a0520); g.fillRect(0, 0, 800, 600);
    // gradient band at horizon
    g.fillStyle(0x1a0540); g.fillRect(0, 300, 800, 300);
    g.fillStyle(0x0d0a30); g.fillRect(0, 400, 800, 200);
    // stars
    const stars = [
      [50,30],[120,80],[200,20],[320,60],[400,30],[500,50],[620,25],[700,70],[760,40],
      [80,150],[180,120],[280,160],[380,140],[480,100],[580,130],[680,110],[750,160],
      [30,200],[140,240],[240,210],[350,260],[450,220],[560,250],[660,230],[770,240],
      [60,280],[170,300],[270,290],[370,310],[470,285],[570,305],[670,295],[740,280],
    ];
    g.fillStyle(0xFFFFFF);
    for (const [x, y] of stars) {
      const size = Math.random() > 0.7 ? 2 : 1;
      g.fillRect(x, y, size, size);
    }
    // twinkle
    g.fillStyle(0xFFFFCC);
    [[100,50],[350,90],[600,40],[200,190],[500,170]].forEach(([x,y]) => {
      g.fillRect(x, y, 2, 2); g.fillRect(x+2, y-2, 1, 1); g.fillRect(x-2, y+2, 1, 1);
    });
  });
}

function createSparkle(scene) {
  tex(scene, 'sparkle', 20, 20, (g) => {
    g.fillStyle(0xFFFFFF);
    g.fillRect(9, 0, 2, 20);  // vertical
    g.fillRect(0, 9, 20, 2);  // horizontal
    g.fillRect(6, 6, 2, 8);   // diagonal hints
    g.fillRect(12, 6, 2, 8);
  });
}

function createMagicAura(scene) {
  tex(scene, 'magic_aura', 60, 60, (g) => {
    g.lineStyle(3, 0x80DFFF, 0.8);
    g.strokeCircle(30, 30, 28);
    g.lineStyle(2, 0xFFFFFF, 0.4);
    g.strokeCircle(30, 30, 22);
    g.fillStyle(0x80DFFF, 0.15);
    g.fillCircle(30, 30, 28);
  });
}

// ─── Milestone 2 textures ────────────────────────────────────────────────────

function createDarkGrass(scene) {
  tex(scene, 'dark_grass', 40, 40, (g) => {
    g.fillStyle(0x1a2e10); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0x0e1e08);
    g.fillRect(4, 6, 4, 3); g.fillRect(22, 14, 3, 3); g.fillRect(10, 28, 4, 3);
    g.fillStyle(0x2a4018);
    g.fillRect(16, 10, 2, 2); g.fillRect(30, 24, 2, 2);
    // Purple fungal spots
    g.fillStyle(0x6622aa, 0.5); g.fillCircle(8, 32, 3); g.fillCircle(28, 8, 2);
  });
}

function createDeadTree(scene) {
  tex(scene, 'dead_tree', 40, 64, (g) => {
    // trunk — grey-brown
    g.fillStyle(0x4a3828); g.fillRect(14, 32, 12, 32);
    g.fillStyle(0x362818); g.fillRect(17, 34, 4, 30);
    // bare branches
    g.fillStyle(0x4a3828);
    g.fillRect(4, 24, 16, 4);   // left branch
    g.fillRect(20, 20, 16, 4);  // right branch
    g.fillRect(6, 14, 10, 3);   // upper left
    g.fillRect(24, 12, 10, 3);  // upper right
    g.fillRect(2, 10, 6, 3);    // tip left
    g.fillRect(32, 8, 6, 3);    // tip right
    // purple glow at branch tips
    g.fillStyle(0x9944dd); g.fillRect(2, 8, 3, 3); g.fillRect(33, 6, 3, 3);
  });
}

function createSnow(scene) {
  tex(scene, 'snow', 40, 40, (g) => {
    g.fillStyle(0xEEF4FF); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0xDDE8FF);
    g.fillRect(6, 8, 6, 4); g.fillRect(24, 18, 5, 4); g.fillRect(12, 28, 7, 4);
    g.fillStyle(0xCCDDFF); g.fillRect(30, 6, 4, 4); g.fillRect(2, 24, 4, 4);
  });
}

function createPine(scene) {
  tex(scene, 'pine', 40, 64, (g) => {
    // trunk
    g.fillStyle(0x5C3820); g.fillRect(15, 46, 10, 18);
    // pine layers (dark green, snow on top)
    g.fillStyle(0x1a5a20);
    g.fillTriangle(20, 4, 4, 28, 36, 28);
    g.fillTriangle(20, 16, 6, 38, 34, 38);
    g.fillTriangle(20, 28, 8, 46, 32, 46);
    // snow caps
    g.fillStyle(0xEEF4FF);
    g.fillTriangle(20, 4, 12, 18, 28, 18);
    g.fillTriangle(20, 16, 14, 26, 26, 26);
    g.fillTriangle(20, 28, 16, 36, 24, 36);
  });
}

function createLavaRock(scene) {
  tex(scene, 'lava_rock', 40, 40, (g) => {
    g.fillStyle(0x2a2020); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0x1a1010);
    g.fillRect(4, 8, 6, 4); g.fillRect(22, 18, 5, 4); g.fillRect(10, 28, 8, 4);
    // Lava cracks (orange)
    g.fillStyle(0xFF6600);
    g.fillRect(0, 14, 40, 2); g.fillRect(18, 0, 2, 40);
    g.fillRect(6, 0, 2, 14);  g.fillRect(30, 16, 2, 24);
    // glow
    g.fillStyle(0xFF4400, 0.4); g.fillRect(0, 13, 40, 4); g.fillRect(17, 0, 4, 40);
  });
}

function createEmberRock(scene) {
  tex(scene, 'ember_rock', 40, 64, (g) => {
    // rocky column
    g.fillStyle(0x3a2020); g.fillRect(8, 8, 24, 56);
    g.fillStyle(0x2a1010); g.fillRect(12, 12, 6, 52); g.fillRect(22, 8, 6, 52);
    // rough top
    g.fillStyle(0x4a3030);
    g.fillTriangle(8, 10, 20, 0, 32, 10);
    // ember glow at top
    g.fillStyle(0xFF4400); g.fillRect(10, 4, 20, 4);
    g.fillStyle(0xFF8800, 0.6); g.fillRect(12, 2, 16, 6);
    g.fillStyle(0xFFCC00); g.fillRect(18, 0, 4, 4);
  });
}

function createShadowFox(scene) {
  tex(scene, 'shadow_fox', 64, 52, (g) => {
    // body — sleek, dark purple
    g.fillStyle(0x2a0055); g.fillEllipse(34, 36, 50, 26);
    // head
    g.fillStyle(0x2a0055); g.fillEllipse(24, 20, 36, 28);
    // snout (pointy)
    g.fillStyle(0x1a0033); g.fillEllipse(12, 26, 24, 16);
    // ears (triangle, tall)
    g.fillStyle(0x2a0055);
    g.fillTriangle(18, 8, 10, 8, 14, -2);
    g.fillTriangle(32, 6, 24, 6, 28, -4);
    g.fillStyle(0xFF66CC); g.fillTriangle(17, 8, 11, 8, 14, 0); g.fillTriangle(31, 6, 25, 6, 28, -2);
    // glowing yellow eyes
    g.fillStyle(0xFFEE00); g.fillCircle(22, 20, 5); g.fillCircle(34, 18, 5);
    g.fillStyle(0x000000); g.fillRect(21, 17, 2, 6); g.fillRect(33, 15, 2, 6); // slit pupils
    g.fillStyle(0xFFFF88); g.fillRect(22, 16, 1, 2); g.fillRect(34, 14, 1, 2);
    // nose
    g.fillStyle(0x110022); g.fillCircle(10, 27, 3);
    // tail (fluffy, white tip)
    g.fillStyle(0x2a0055); g.fillEllipse(56, 28, 16, 36);
    g.fillStyle(0xFFFFFF); g.fillCircle(56, 14, 8);
    // dark markings
    g.fillStyle(0x1a0033); g.fillEllipse(34, 38, 28, 14);
  });
}

function createIceGolem(scene) {
  tex(scene, 'ice_golem', 56, 70, (g) => {
    // legs
    g.fillStyle(0x6699CC); g.fillRect(10, 56, 14, 14); g.fillRect(32, 56, 14, 14);
    // body (large blocky)
    g.fillStyle(0x88BBEE); g.fillRect(6, 24, 44, 34);
    g.fillStyle(0xAADDFF); g.fillRect(10, 28, 14, 10); g.fillRect(30, 34, 12, 10);
    g.fillStyle(0x5577AA); g.fillRect(6, 46, 44, 12);
    // arms (big fists)
    g.fillStyle(0x88BBEE); g.fillRect(0, 28, 8, 22); g.fillRect(48, 28, 8, 22);
    g.fillStyle(0xAADDFF); g.fillRect(0, 40, 8, 12); g.fillRect(48, 40, 8, 12);
    // head
    g.fillStyle(0x88BBEE); g.fillRect(8, 6, 40, 20);
    // eyes (glowing cyan)
    g.fillStyle(0x00FFFF); g.fillRect(14, 10, 10, 8); g.fillRect(32, 10, 10, 8);
    g.fillStyle(0x00CCFF); g.fillRect(16, 12, 6, 4); g.fillRect(34, 12, 6, 4);
    // icy teeth
    g.fillStyle(0x4477BB); g.fillRect(14, 22, 28, 4);
    g.fillStyle(0xCCEEFF);
    g.fillTriangle(16, 22, 19, 22, 17, 28); g.fillTriangle(22, 22, 25, 22, 23, 28);
    g.fillTriangle(28, 22, 31, 22, 29, 28); g.fillTriangle(34, 22, 37, 22, 35, 28);
    // ice cracks
    g.fillStyle(0xCCEEFF, 0.5);
    g.fillRect(8, 30, 2, 18); g.fillRect(46, 36, 2, 14);
  });
}

function createFireLizard(scene) {
  tex(scene, 'fire_lizard', 64, 52, (g) => {
    // body
    g.fillStyle(0xCC2200); g.fillEllipse(32, 36, 54, 26);
    // belly
    g.fillStyle(0xFF7744); g.fillEllipse(28, 38, 34, 16);
    // head
    g.fillStyle(0xCC2200); g.fillEllipse(22, 18, 38, 28);
    // jaw (wide, snapping)
    g.fillStyle(0xAA1100); g.fillRect(4, 18, 34, 14);
    g.fillStyle(0xCC2200); g.fillRect(4, 12, 34, 10);
    // eyes (yellow-red glow)
    g.fillStyle(0xFF0000); g.fillCircle(28, 12, 7); g.fillCircle(40, 12, 7);
    g.fillStyle(0xFFCC00); g.fillCircle(28, 12, 4); g.fillCircle(40, 12, 4);
    g.fillStyle(0x000000); g.fillRect(27, 10, 2, 4); g.fillRect(39, 10, 2, 4);
    // fangs
    g.fillStyle(0xFFFFFF);
    g.fillTriangle(12, 22, 15, 22, 13, 30); g.fillTriangle(20, 22, 23, 22, 21, 30);
    // back spikes (fire-coloured)
    g.fillStyle(0xFF6600);
    g.fillTriangle(40, 24, 44, 12, 48, 24);
    g.fillTriangle(46, 28, 50, 16, 54, 28);
    // flame tip on spikes
    g.fillStyle(0xFFCC00);
    g.fillTriangle(42, 24, 44, 16, 46, 24);
    g.fillTriangle(48, 28, 50, 20, 52, 28);
    // nostrils
    g.fillStyle(0x881100); g.fillRect(8, 18, 3, 2); g.fillRect(14, 18, 3, 2);
  });
}

function createSimonPad(scene) {
  tex(scene, 'simon_pad', 110, 110, (g) => {
    // outer ring (will be tinted)
    g.fillStyle(0xFFFFFF); g.fillCircle(55, 55, 52);
    // inner highlight
    g.fillStyle(0xFFFFFF); g.fillEllipse(42, 36, 30, 20);
    // dark center dot (for visual depth)
    g.fillStyle(0x00000033); g.fillCircle(55, 65, 12);
  });
}

function createSlideTile(scene) {
  tex(scene, 'slide_tile', 68, 68, (g) => {
    // Solid base fills the whole square so dark background never bleeds through
    g.fillStyle(0xE8D8B0); g.fillRect(0, 0, 68, 68);
    g.fillRoundedRect(2, 2, 64, 64, 10);
    g.fillStyle(0xF4E8C8); g.fillRoundedRect(4, 4, 60, 30, 8);
    g.lineStyle(2, 0xAA8844); g.strokeRoundedRect(2, 2, 64, 64, 10);
  });
}

function createCrystalSlot(scene, key, fillColor, glowColor) {
  tex(scene, key, 28, 28, (g) => {
    g.fillStyle(0x111133); g.fillRoundedRect(0, 0, 28, 28, 6);
    g.fillStyle(fillColor);
    g.fillTriangle(14, 2, 2, 14, 26, 14);
    g.fillTriangle(14, 26, 2, 14, 26, 14);
    g.fillStyle(glowColor); g.fillTriangle(14, 4, 6, 12, 16, 12);
  });
}

function createCaveBg(scene) {
  tex(scene, 'cave_bg', 800, 600, (g) => {
    // deep dark bg
    g.fillStyle(0x050218); g.fillRect(0, 0, 800, 600);
    // cave walls (dark purple-grey)
    g.fillStyle(0x0d0830); g.fillRect(0, 0, 120, 600); g.fillRect(680, 0, 120, 600);
    // stalactites
    g.fillStyle(0x1a1040);
    const stals = [[80,0,50],[160,0,70],[260,0,45],[380,0,80],[500,0,55],[620,0,65],[720,0,48]];
    for (const [x, y, h] of stals) {
      g.fillTriangle(x - 12, y, x + 12, y, x, y + h);
      g.fillStyle(0x2a1a60); g.fillTriangle(x - 4, y, x + 4, y, x, y + h * 0.4);
      g.fillStyle(0x1a1040);
    }
    // floor
    g.fillStyle(0x0d0830); g.fillRect(0, 530, 800, 70);
    // crystal formations on walls
    const drawCrystal = (cx, cy, sz, col) => {
      g.fillStyle(col);
      g.fillTriangle(cx - sz, cy, cx + sz, cy, cx, cy - sz * 2);
      g.fillStyle(0xAAEEFF, 0.3);
      g.fillTriangle(cx - sz + 2, cy, cx, cy, cx - sz + 2, cy - sz);
    };
    const leftCrystals  = [[60,520,18],[90,490,14],[40,540,10],[110,510,12]];
    const rightCrystals = [[740,520,18],[710,490,14],[760,540,10],[690,510,12]];
    for (const [cx,cy,sz] of leftCrystals)  drawCrystal(cx, cy, sz, 0x40DFFF);
    for (const [cx,cy,sz] of rightCrystals) drawCrystal(cx, cy, sz, 0x40DFFF);
    // floor crystals
    const floorCrystals = [200,300,400,500,600];
    for (const cx of floorCrystals) drawCrystal(cx, 530, 10, 0x80FFFF);
    // central glow
    g.fillStyle(0x40DFFF, 0.06); g.fillCircle(400, 360, 180);
    g.fillStyle(0x80FFFF, 0.04); g.fillCircle(400, 360, 240);
  });
}

function createHUDBar(scene) {
  tex(scene, 'hud_bar', 800, 36, (g) => {
    g.fillStyle(0x000000, 0.75); g.fillRect(0, 0, 800, 36);
    g.lineStyle(1, 0x334466); g.strokeRect(0, 35, 800, 1);
  });
}

// ─── Milestone 3 textures ────────────────────────────────────────────────────

function createHousePlot(scene) {
  tex(scene, 'house_plot', 56, 52, (g) => {
    // Sandy lot
    g.fillStyle(0xD4B070); g.fillRect(4, 12, 48, 36);
    g.fillStyle(0xDDBB78); g.fillRect(8, 16, 40, 28);
    // Corner stakes
    g.fillStyle(0x5C3010);
    g.fillRect(4, 8, 5, 18); g.fillRect(47, 8, 5, 18);
    g.fillRect(4, 38, 5, 12); g.fillRect(47, 38, 5, 12);
    // Boundary rope
    g.fillStyle(0xA88030);
    g.fillRect(9, 12, 38, 2); g.fillRect(9, 46, 38, 2);
    g.fillRect(4, 14, 2, 32); g.fillRect(50, 14, 2, 32);
    // Glowing indicator dot
    g.fillStyle(0xFFEE44); g.fillCircle(28, 30, 8);
    g.fillStyle(0xFFFF99); g.fillCircle(28, 30, 4);
  });
}

function createHouseBuilt(scene) {
  // Traditional Hawaiian hale: steep thatched A-frame roof, open sides, corner posts
  tex(scene, 'house_built', 64, 56, (g) => {
    // Ground platform / foundation
    g.fillStyle(0x6B4A20); g.fillRect(4, 46, 56, 8);
    g.fillStyle(0x8B6A38); g.fillRect(6, 44, 52, 4);

    // Corner posts (lashed wood)
    g.fillStyle(0x5C3010);
    g.fillRect(7,  26, 5, 20);  // front-left
    g.fillRect(52, 26, 5, 20);  // front-right
    g.fillRect(12, 28, 4, 18);  // back-left
    g.fillRect(48, 28, 4, 18);  // back-right

    // Side lauhala mat panels (woven pandanus)
    g.fillStyle(0xD4A860);
    g.fillRect(12, 32, 9, 14);  // left panel
    g.fillRect(43, 32, 9, 14);  // right panel
    // Woven cross-hatch
    g.fillStyle(0xB88A40);
    for (let y = 34; y < 46; y += 4) {
      g.fillRect(12, y, 9, 1);
      g.fillRect(43, y, 9, 1);
    }
    for (let x = 14; x < 21; x += 3) g.fillRect(x, 32, 1, 14);
    for (let x = 45; x < 52; x += 3) g.fillRect(x, 32, 1, 14);

    // Open interior (dark gap between panels)
    g.fillStyle(0x1A0A04); g.fillRect(21, 32, 22, 14);

    // Steep A-frame thatched roof (pandanus/pili grass — dark gold layers)
    g.fillStyle(0x7A5A18); g.fillTriangle(32, 2, 0, 30, 64, 30);
    g.fillStyle(0x9A7228); g.fillTriangle(32, 6, 4, 30, 60, 30);
    g.fillStyle(0xBA9242); g.fillTriangle(32, 12, 10, 30, 54, 30);
    // Thatch layer lines (horizontal bands)
    g.fillStyle(0x6A4A12);
    g.fillRect(8,  23, 48, 2);
    g.fillRect(14, 17, 36, 2);
    g.fillRect(20, 12, 24, 2);
    g.fillRect(26,  7, 12, 2);
    // Ridge pole
    g.fillStyle(0x4A3010); g.fillRect(30, 2, 4, 28);
    // Roof overhang tips
    g.fillStyle(0x5A4018);
    g.fillRect(0, 28, 8, 4); g.fillRect(56, 28, 8, 4);
  });
}

function createGardenPlot(scene) {
  tex(scene, 'garden_plot', 56, 44, (g) => {
    // Soil
    g.fillStyle(0x5A3A18); g.fillRect(4, 4, 48, 36);
    g.fillStyle(0x6A4A24); g.fillRect(8, 8, 40, 28);
    // Furrow lines
    g.fillStyle(0x4A2A10);
    for (let y = 10; y < 36; y += 7) g.fillRect(8, y, 40, 3);
    // Glowing indicator dot
    g.fillStyle(0x88FF44); g.fillCircle(28, 26, 8);
    g.fillStyle(0xCCFF88); g.fillCircle(28, 26, 4);
  });
}

function createGardenGrown(scene) {
  // Traditional Hawaiian lo'i kalo — flooded taro paddy with earthen berms
  tex(scene, 'garden_grown', 64, 52, (g) => {
    // Earthen berm border (lo'i walls — packed earth)
    g.fillStyle(0x6A4A20); g.fillRect(0, 0, 64, 52);
    g.fillStyle(0x5A3A14); g.fillRect(0, 0, 64, 6);   // top berm
    g.fillRect(0, 46, 64, 6);                           // bottom berm
    g.fillRect(0, 0, 6, 52);                            // left berm
    g.fillRect(58, 0, 6, 52);                           // right berm

    // Flooded paddy water (clear irrigation water — lo'i is always flooded)
    g.fillStyle(0x2A5A7A); g.fillRect(6, 6, 52, 40);
    // Water depth shimmer
    g.fillStyle(0x3A7A9A);
    g.fillRect(10, 10, 14, 2); g.fillRect(34, 16, 18, 2);
    g.fillRect(14, 24, 10, 2); g.fillRect(38, 30, 12, 2);
    g.fillStyle(0x5ABBE0, 0.3); g.fillRect(6, 34, 52, 8); // surface reflection

    // Kalo (taro) plants — 6 plants growing in flooded rows
    // Each has a corm at water line, thick petiole (stem), and large heart-shaped leaf
    const kalo = (x, y) => {
      // Corm/base at waterline
      g.fillStyle(0x4A7A30); g.fillCircle(x, y + 10, 3);
      // Petiole (stem) — thick, upright
      g.fillStyle(0x3A8A20); g.fillRect(x - 1, y - 4, 3, 14);
      // Large heart-shaped leaf (two overlapping ellipses)
      g.fillStyle(0x2E9A18); g.fillEllipse(x - 3, y - 8, 18, 12);
      g.fillStyle(0x3AAA22); g.fillEllipse(x + 3, y - 10, 14, 10);
      // Leaf midrib (central vein — characteristic of taro leaf)
      g.fillStyle(0x5ACC38); g.fillRect(x, y - 12, 1, 10);
      // Leaf sheen
      g.fillStyle(0x88FF66, 0.4); g.fillEllipse(x - 2, y - 10, 6, 4);
    };

    kalo(14, 18); kalo(28, 14); kalo(44, 18);
    kalo(18, 32); kalo(38, 30);
  });
}

function createVillagerNPC(scene) {
  tex(scene, 'villager', 28, 40, (g) => {
    const skin = 0xD4956A;
    const shirt = 0xFF6633; // aloha orange
    const pants = 0x3A5A8A;
    // Legs
    g.fillStyle(pants); g.fillRect(8, 28, 5, 12); g.fillRect(15, 28, 5, 12);
    // Shirt
    g.fillStyle(shirt);
    g.fillRect(7, 16, 14, 14);
    g.fillRect(2, 16, 6, 10); g.fillRect(20, 16, 6, 10); // arms
    // Hands
    g.fillStyle(skin); g.fillRect(2, 25, 5, 4); g.fillRect(20, 25, 5, 4);
    // Neck + head
    g.fillRect(12, 12, 5, 5);
    g.fillCircle(14, 9, 9);
    // Hair
    g.fillStyle(0x1A1008); g.fillEllipse(14, 3, 16, 9);
    // Eyes
    g.fillStyle(0xFFFFFF); g.fillCircle(10, 9, 2); g.fillCircle(18, 9, 2);
    g.fillStyle(0x2A1608); g.fillCircle(10, 9, 1); g.fillCircle(18, 9, 1);
    // Smile
    g.fillStyle(0xB07050);
    g.fillRect(10, 14, 8, 2); g.fillRect(9, 13, 3, 2); g.fillRect(16, 13, 3, 2);
    // Aloha shirt flower pattern
    g.fillStyle(0xFFCC00); g.fillCircle(11, 20, 2); g.fillCircle(17, 24, 2);
    g.fillStyle(0xFF44AA); g.fillCircle(14, 23, 2);
  });
}
