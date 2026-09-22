import Phaser from 'phaser';

/**
 * BootScene — Generates ALL pixel art textures procedurally.
 *
 * Player:      icarus, icarus_flap
 * Collectible: golden_feather
 * Monsters:    harpy/flap, griffin/flap, stymphalian/flap
 * Bosses:      aeolus/flap, medusa/flap, zeus/flap
 * Projectiles: snake, lightning_spark
 * Effects:     feather (particle)
 * World:       sun, cloud
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.generateTextures();
    this.scene.start('MenuScene');
  }

  generateTextures() {
    this.createIcarusTexture();
    this.createIcarusFlapTexture();
    this.createGoldenFeatherTexture();
    this.createFeatherParticleTexture();
    this.createHarpyTextures();
    this.createGriffinTextures();
    this.createStymphalianTextures();
    this.createAeolusTextures();
    this.createMedusaTextures();
    this.createZeusTextures();
    this.createSnakeTexture();
    this.createLightningSparkTexture();
    this.createSunTexture();
    this.createCloudTexture();
  }

  // ═══ Player ════════════════════════════════════════════

  createIcarusTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x5c4033); g.fillRect(4, 0, 4, 2);
    g.fillStyle(0xe8b87c); g.fillRect(4, 1, 4, 4);
    g.fillStyle(0x2a1f14); g.fillRect(6, 2, 1, 1);
    g.fillStyle(0xd4a855); g.fillRect(3, 5, 6, 5);
    g.fillStyle(0xb8923e); g.fillRect(3, 5, 6, 1);
    g.fillStyle(0xf5f0e0); g.fillRect(0, 5, 3, 3); g.fillRect(9, 5, 3, 3);
    g.fillStyle(0xe0d5c0); g.fillRect(0, 7, 2, 2); g.fillRect(10, 7, 2, 2);
    g.fillStyle(0xc69c6d); g.fillRect(4, 10, 2, 2); g.fillRect(6, 10, 2, 2);
    g.fillStyle(0x8b6c4a); g.fillRect(4, 11, 2, 1); g.fillRect(6, 11, 2, 1);
    g.generateTexture('icarus', 12, 12); g.destroy();
  }

  createIcarusFlapTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xf5f0e0); g.fillRect(0, 1, 3, 3); g.fillRect(9, 1, 3, 3);
    g.fillStyle(0xe0d5c0); g.fillRect(0, 0, 2, 2); g.fillRect(10, 0, 2, 2);
    g.fillStyle(0x5c4033); g.fillRect(4, 0, 4, 2);
    g.fillStyle(0xe8b87c); g.fillRect(4, 1, 4, 4);
    g.fillStyle(0x2a1f14); g.fillRect(6, 2, 1, 1);
    g.fillStyle(0xd4a855); g.fillRect(3, 5, 6, 5);
    g.fillStyle(0xb8923e); g.fillRect(3, 5, 6, 1);
    g.fillStyle(0xc69c6d); g.fillRect(4, 10, 2, 2); g.fillRect(6, 10, 2, 2);
    g.fillStyle(0x8b6c4a); g.fillRect(4, 11, 2, 1); g.fillRect(6, 11, 2, 1);
    g.generateTexture('icarus_flap', 12, 12); g.destroy();
  }

  // ═══ Collectible ═══════════════════════════════════════

  createGoldenFeatherTexture() {
    const g = this.make.graphics({ add: false });

    // Quill shaft (angled right from bottom-left to top-right)
    g.fillStyle(0xc99726); // dark gold stem base
    g.fillRect(1, 11, 2, 1);
    g.fillRect(2, 9, 2, 2);
    g.fillStyle(0xe5b830); // golden quill
    g.fillRect(3, 7, 2, 2);
    g.fillRect(4, 5, 2, 2);
    g.fillRect(5, 3, 2, 2);
    g.fillRect(6, 1, 2, 2);
    g.fillRect(7, 0, 1, 1); // quill tip

    // Left vane (pearl white body with golden outer edge)
    g.fillStyle(0xe5b830); // gold outer fringe
    g.fillRect(1, 8, 1, 2);
    g.fillRect(2, 6, 1, 2);
    g.fillRect(3, 4, 1, 2);
    g.fillRect(4, 2, 1, 2);

    g.fillStyle(0xf5f3ee); // pearl white
    g.fillRect(2, 8, 1, 2);
    g.fillRect(3, 6, 1, 2);
    g.fillRect(4, 4, 1, 2);
    g.fillRect(5, 2, 1, 2);

    g.fillStyle(0xffffff); // brilliant white highlight
    g.fillRect(2, 7, 1, 1);
    g.fillRect(3, 5, 1, 1);
    g.fillRect(4, 3, 1, 1);

    // Right vane (slender, trailing up-right)
    g.fillStyle(0xf5f3ee); // pearl white
    g.fillRect(5, 7, 1, 2);
    g.fillRect(6, 5, 1, 2);
    g.fillRect(7, 3, 1, 2);
    g.fillRect(8, 1, 1, 2);

    g.fillStyle(0xffffff); // brilliant white highlight
    g.fillRect(5, 6, 1, 1);
    g.fillRect(6, 4, 1, 1);
    g.fillRect(7, 2, 1, 1);

    g.fillStyle(0xe5b830); // gold outer edge
    g.fillRect(6, 8, 1, 1);
    g.fillRect(7, 6, 1, 1);
    g.fillRect(8, 4, 1, 1);
    g.fillRect(9, 2, 1, 1);

    g.generateTexture('golden_feather', 10, 12);
    g.destroy();
  }

  createFeatherParticleTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xd4af37); g.fillRect(1, 0, 1, 4);
    g.fillStyle(0xffffff); g.fillRect(0, 1, 1, 2); g.fillRect(2, 1, 1, 2);
    g.generateTexture('feather', 4, 4); g.destroy();
  }

  // ═══ Monsters (2 frames each) ═════════════════════════

  createHarpyTextures() {
    const body = (g) => {
      // Wild hair
      g.fillStyle(0x2a1040); g.fillRect(5, 2, 3, 1); g.fillRect(4, 3, 1, 1); g.fillRect(8, 3, 1, 1);
      // Head
      g.fillStyle(0x6a3880); g.fillRect(5, 3, 3, 3);
      // Eyes (glowing red)
      g.fillStyle(0xff3333); g.fillRect(5, 4, 1, 1); g.fillRect(7, 4, 1, 1);
      // Torso
      g.fillStyle(0x5a2870); g.fillRect(4, 5, 4, 5);
      // Claws
      g.fillStyle(0x999999); g.fillRect(4, 10, 2, 2); g.fillRect(6, 10, 2, 2);
      g.fillStyle(0xaaaaaa); g.fillRect(4, 11, 1, 1); g.fillRect(7, 11, 1, 1);
    };

    // Frame 1 — wings DOWN (anchored at neck/head base, angling down)
    const g1 = this.make.graphics({ add: false });
    g1.fillStyle(0x4a2060);
    g1.fillRect(1, 4, 4, 3); g1.fillRect(7, 4, 4, 3);
    g1.fillStyle(0x3a1850);
    g1.fillRect(0, 6, 3, 3); g1.fillRect(9, 6, 3, 3);
    body(g1);
    g1.generateTexture('harpy', 12, 12);
    g1.destroy();

    // Frame 2 — wings UP (arching high right over the head/ears)
    const g2 = this.make.graphics({ add: false });
    g2.fillStyle(0x4a2060);
    g2.fillRect(2, 1, 3, 4); g2.fillRect(7, 1, 3, 4);
    g2.fillStyle(0x3a1850);
    g2.fillRect(1, 0, 3, 2); g2.fillRect(8, 0, 3, 2);
    body(g2);
    g2.generateTexture('harpy_flap', 12, 12);
    g2.destroy();
  }

  createGriffinTextures() {
    const body = (g) => {
      // Body (tawny lion)
      g.fillStyle(0xa07040); g.fillRect(3, 5, 7, 5);
      // Eagle head (golden)
      g.fillStyle(0xd4a855); g.fillRect(9, 3, 3, 3);
      // Beak
      g.fillStyle(0xe8c040); g.fillRect(12, 4, 2, 1);
      // Eye
      g.fillStyle(0x2a1f14); g.fillRect(10, 4, 1, 1);
      // Mane
      g.fillStyle(0xc08040); g.fillRect(8, 4, 1, 2);
      // Lion tail
      g.fillStyle(0x7a5030); g.fillRect(0, 6, 3, 2);
      g.fillStyle(0x8a5a30); g.fillRect(0, 5, 1, 1);
      // Legs
      g.fillStyle(0xd4a855); g.fillRect(5, 10, 1, 2); g.fillRect(8, 10, 1, 2);
    };

    // Frame 1 — wings DOWN (anchored at neck behind head x=5..9, angled along flank)
    const g1 = this.make.graphics({ add: false });
    g1.fillStyle(0x8a5a30);
    g1.fillRect(5, 3, 4, 3);
    g1.fillRect(3, 4, 3, 2);
    g1.fillStyle(0x6a4020);
    g1.fillRect(2, 5, 2, 2);
    body(g1);
    g1.generateTexture('griffin', 14, 12);
    g1.destroy();

    // Frame 2 — wings UP (swept high right above eagle head/mane x=6..10, y=0..3)
    const g2 = this.make.graphics({ add: false });
    g2.fillStyle(0x8a5a30);
    g2.fillRect(6, 1, 4, 3);
    g2.fillRect(7, 0, 3, 2);
    g2.fillStyle(0x6a4020);
    g2.fillRect(5, 2, 2, 2);
    g2.fillRect(8, 0, 2, 1);
    body(g2);
    g2.generateTexture('griffin_flap', 14, 12);
    g2.destroy();
  }

  createStymphalianTextures() {
    const body = (g) => {
      // Body (dark metallic)
      g.fillStyle(0x606870); g.fillRect(3, 5, 5, 4);
      // Head
      g.fillStyle(0x707880); g.fillRect(7, 3, 3, 3);
      // Bronze beak (sharp, spear-like)
      g.fillStyle(0xb8860b); g.fillRect(9, 4, 3, 1); g.fillRect(10, 3, 1, 1);
      // Piercing yellow eye
      g.fillStyle(0xffff00); g.fillRect(8, 4, 1, 1);
      // Tail feathers (metallic)
      g.fillStyle(0x353d45); g.fillRect(0, 6, 3, 2);
      // Bronze claws
      g.fillStyle(0xb8860b); g.fillRect(4, 9, 1, 2); g.fillRect(7, 9, 1, 2);
    };

    // Frame 1 — wings LEVEL/BACK (close to neck x=4..8)
    const g1 = this.make.graphics({ add: false });
    g1.fillStyle(0x505860);
    g1.fillRect(4, 3, 4, 3);
    g1.fillStyle(0x404850);
    g1.fillRect(2, 4, 3, 2);
    g1.fillStyle(0xb8860b); // sharp bronze edge
    g1.fillRect(5, 3, 3, 1);
    body(g1);
    g1.generateTexture('stymphalian', 12, 11);
    g1.destroy();

    // Frame 2 — wings UP (rising high directly above the head x=5..9, y=0..3)
    const g2 = this.make.graphics({ add: false });
    g2.fillStyle(0x505860);
    g2.fillRect(5, 1, 4, 3);
    g2.fillRect(6, 0, 3, 2);
    g2.fillStyle(0x404850);
    g2.fillRect(4, 2, 2, 2);
    g2.fillStyle(0xb8860b); // sharp bronze wingtip at crest
    g2.fillRect(7, 0, 2, 1);
    body(g2);
    g2.generateTexture('stymphalian_flap', 12, 11);
    g2.destroy();
  }

  // ═══ Bosses (2 frames each) ═══════════════════════════

  /** Aeolus — old wind keeper with cloak and Bag of Winds (20×18) */
  createAeolusTextures() {
    const body = (g) => {
      // Robes
      g.fillStyle(0xc0c8d0); g.fillRect(7, 6, 8, 10);
      g.fillStyle(0xa0a8b0); g.fillRect(7, 8, 2, 8); g.fillRect(13, 8, 2, 8);
      g.fillStyle(0xc0c8d0); g.fillRect(6, 14, 10, 2);
      // Head
      g.fillStyle(0x8899aa); g.fillRect(9, 1, 4, 5);
      g.fillStyle(0xd0d0d0); g.fillRect(9, 4, 4, 3); g.fillRect(10, 6, 2, 1);
      g.fillStyle(0xb0b0b0); g.fillRect(9, 0, 4, 2);
      g.fillStyle(0xddeeff); g.fillRect(10, 2, 1, 1); g.fillRect(12, 2, 1, 1);
      // Bag of Winds
      g.fillStyle(0x334466); g.fillRect(2, 7, 5, 5);
      g.fillStyle(0x445577); g.fillRect(3, 7, 3, 4);
      g.fillStyle(0x887744); g.fillRect(4, 6, 2, 1);
      // Arms
      g.fillStyle(0x8899aa); g.fillRect(6, 8, 2, 2);
    };
    const g1 = this.make.graphics({ add: false });
    g1.fillStyle(0xb0b8c0); g1.fillRect(14, 5, 4, 8); g1.fillRect(16, 4, 2, 2);
    body(g1); g1.generateTexture('aeolus', 20, 18); g1.destroy();

    const g2 = this.make.graphics({ add: false });
    g2.fillStyle(0xb0b8c0); g2.fillRect(14, 4, 5, 9); g2.fillRect(17, 3, 3, 3);
    g2.fillStyle(0xa0a8b0); g2.fillRect(18, 5, 2, 5);
    body(g2); g2.generateTexture('aeolus_flap', 20, 18); g2.destroy();
  }

  /** Medusa — green gorgon with snake hair and wings (22×18) */
  createMedusaTextures() {
    const body = (g) => {
      g.fillStyle(0x4a6a4a); g.fillRect(8, 8, 6, 8);
      g.fillStyle(0x5a7a5a); g.fillRect(9, 9, 4, 6);
      g.fillStyle(0x7a9a6a); g.fillRect(8, 2, 6, 6);
      g.fillStyle(0x8aaa7a); g.fillRect(9, 3, 4, 4);
      g.fillStyle(0x3a5a3a); g.fillRect(7, 0, 8, 3); g.fillRect(6, 1, 2, 2); g.fillRect(14, 1, 2, 2);
      g.fillStyle(0xaaff44); g.fillRect(9, 4, 2, 1); g.fillRect(12, 4, 2, 1);
      g.fillStyle(0x2a3a2a); g.fillRect(10, 6, 3, 1);
      g.fillStyle(0xcccccc); g.fillRect(10, 6, 1, 1); g.fillRect(12, 6, 1, 1);
    };
    const g1 = this.make.graphics({ add: false });
    g1.fillStyle(0x404040); g1.fillRect(0, 6, 8, 4); g1.fillRect(14, 6, 8, 4);
    g1.fillStyle(0x353535); g1.fillRect(0, 9, 6, 3); g1.fillRect(16, 9, 6, 3);
    g1.fillStyle(0x3a5a3a); g1.fillRect(6, 0, 1, 2); g1.fillRect(15, 0, 1, 2);
    body(g1); g1.generateTexture('medusa', 22, 18); g1.destroy();

    const g2 = this.make.graphics({ add: false });
    g2.fillStyle(0x404040); g2.fillRect(0, 3, 8, 4); g2.fillRect(14, 3, 8, 4);
    g2.fillStyle(0x353535); g2.fillRect(0, 1, 6, 3); g2.fillRect(16, 1, 6, 3);
    g2.fillStyle(0x3a5a3a); g2.fillRect(7, 0, 1, 1); g2.fillRect(14, 0, 1, 1);
    g2.fillRect(5, 1, 1, 1); g2.fillRect(16, 1, 1, 1);
    body(g2);
    g2.fillStyle(0xccff66); g2.fillRect(9, 4, 2, 1); g2.fillRect(12, 4, 2, 1);
    g2.generateTexture('medusa_flap', 22, 18); g2.destroy();
  }

  /** Zeus — king on golden clouds, thunderbolt raised (24×20) */
  createZeusTextures() {
    const body = (g) => {
      // Cloud base
      g.fillStyle(0xe8d8a0); g.fillRect(4, 16, 18, 4);
      g.fillStyle(0xd4c888); g.fillRect(6, 15, 14, 2);
      g.fillRect(2, 18, 4, 2); g.fillRect(20, 18, 4, 2);
      // Robes
      g.fillStyle(0x5a3a8a); g.fillRect(6, 8, 12, 8);
      g.fillStyle(0x4a2a7a); g.fillRect(6, 10, 2, 6); g.fillRect(16, 10, 2, 6);
      g.fillStyle(0xffd700); g.fillRect(6, 8, 12, 1); g.fillRect(6, 15, 12, 1);
      // Head
      g.fillStyle(0xd4a875); g.fillRect(9, 2, 6, 6);
      g.fillStyle(0xd0d0d0); g.fillRect(9, 5, 6, 4); g.fillRect(10, 8, 4, 1);
      g.fillStyle(0xc0c0c0); g.fillRect(9, 1, 6, 2);
      g.fillStyle(0xffd700); g.fillRect(9, 0, 6, 2); g.fillStyle(0xffee44); g.fillRect(11, 0, 2, 1);
      g.fillStyle(0x44aaff); g.fillRect(10, 3, 1, 1); g.fillRect(13, 3, 1, 1);
      g.fillStyle(0xd4a875); g.fillRect(5, 9, 2, 2);
    };
    const g1 = this.make.graphics({ add: false });
    body(g1);
    g1.fillStyle(0xffffaa);
    g1.fillRect(18, 4, 2, 1); g1.fillRect(19, 5, 2, 1); g1.fillRect(18, 6, 2, 1);
    g1.fillRect(19, 7, 2, 1); g1.fillRect(18, 8, 2, 1);
    g1.fillStyle(0xd4a875); g1.fillRect(17, 8, 2, 2);
    g1.fillStyle(0xffff88); g1.fillRect(20, 3, 1, 1); g1.fillRect(17, 5, 1, 1);
    g1.generateTexture('zeus', 24, 20); g1.destroy();

    const g2 = this.make.graphics({ add: false });
    body(g2);
    g2.fillStyle(0xffffaa);
    g2.fillRect(19, 4, 2, 1); g2.fillRect(18, 5, 2, 1); g2.fillRect(19, 6, 2, 1);
    g2.fillRect(18, 7, 2, 1); g2.fillRect(19, 8, 2, 1);
    g2.fillStyle(0xd4a875); g2.fillRect(17, 8, 2, 2);
    g2.fillStyle(0xffff88); g2.fillRect(21, 4, 1, 1); g2.fillRect(17, 6, 1, 1); g2.fillRect(20, 8, 1, 1);
    g2.generateTexture('zeus_flap', 24, 20); g2.destroy();
  }

  // ═══ Projectiles ═══════════════════════════════════════

  createSnakeTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x3a5a3a); g.fillRect(0, 1, 6, 2);
    g.fillStyle(0x5a7a5a); g.fillRect(4, 0, 2, 1); g.fillRect(4, 3, 2, 1);
    g.fillStyle(0xff0000); g.fillRect(5, 1, 1, 1);
    g.generateTexture('snake', 6, 4); g.destroy();
  }

  createLightningSparkTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffff88); g.fillRect(1, 0, 2, 1); g.fillRect(0, 1, 4, 2); g.fillRect(1, 3, 2, 1);
    g.generateTexture('lightning_spark', 4, 4); g.destroy();
  }

  // ═══ World ═════════════════════════════════════════════

  createSunTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffa500);
    g.fillRect(7, 0, 2, 2); g.fillRect(7, 14, 2, 2);
    g.fillRect(0, 7, 2, 2); g.fillRect(14, 7, 2, 2);
    g.fillRect(2, 2, 2, 2); g.fillRect(12, 2, 2, 2);
    g.fillRect(2, 12, 2, 2); g.fillRect(12, 12, 2, 2);
    g.fillStyle(0xffe44d); g.fillRect(5, 3, 6, 10); g.fillRect(4, 4, 8, 8); g.fillRect(3, 5, 10, 6);
    g.fillStyle(0xfff8dc); g.fillRect(6, 6, 4, 4);
    g.generateTexture('sun', 16, 16); g.destroy();
  }

  createCloudTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff); g.fillRect(2, 4, 12, 4); g.fillRect(4, 2, 4, 2); g.fillRect(9, 3, 3, 1);
    g.fillStyle(0xe0e8f0); g.fillRect(2, 7, 12, 1);
    g.generateTexture('cloud', 16, 8); g.destroy();
  }
}
