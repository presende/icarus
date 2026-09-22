import Phaser from 'phaser';

/**
 * MenuScene — Title screen with mythological lore,
 * animated Icarus sprite, and click-to-play prompt.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // ── Background gradient (warm orange → sky blue → deep blue) ──
    const bg = this.add.graphics();
    for (let y = 0; y < 720; y++) {
      const t = y / 720;
      let r, g, b;
      if (t < 0.3) {
        const lt = t / 0.3;
        r = Math.floor(255 - lt * 40);
        g = Math.floor(190 - lt * 50);
        b = Math.floor(70 + lt * 60);
      } else {
        const lt = (t - 0.3) / 0.7;
        r = Math.floor(215 - lt * 170);
        g = Math.floor(140 + lt * 40);
        b = Math.floor(130 + lt * 70);
      }
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      bg.fillRect(0, y, 480, 1);
    }

    // ── Sun ──
    const sun = this.add.image(390, 55, 'sun');
    sun.setScale(5);
    sun.setAlpha(0.85);

    // Sun glow
    const glow = this.add.graphics();
    glow.fillStyle(0xffd700, 0.1);
    glow.fillCircle(390, 55, 90);
    this.tweens.add({
      targets: glow,
      alpha: 0.4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Decorative clouds ──
    [
      { x: 80, y: 180, s: 3, a: 0.5 },
      { x: 320, y: 220, s: 2.5, a: 0.4 },
      { x: 440, y: 280, s: 2, a: 0.3 },
    ].forEach(({ x, y, s, a }) => {
      const cloud = this.add.image(x, y, 'cloud');
      cloud.setScale(s);
      cloud.setAlpha(a);
    });

    // ── Title ──
    this.add
      .text(240, 180, 'ICARUS', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '42px',
        color: '#FFD700',
        stroke: '#8B4513',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // ── Subtitle ──
    this.add
      .text(240, 235, 'Wings of Wax', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '13px',
        color: '#f0e0c0',
      })
      .setOrigin(0.5);

    // ── Lore ──
    this.add
      .text(
        240,
        330,
        'Daedalus crafted wings\nof wax and feathers\nfor his son Icarus.\n\nCollect golden feathers.\nBeware the creatures\nof the sky.\n\nFly not too high,\nnor too low.',
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#cccccc',
          align: 'center',
          lineSpacing: 5,
        }
      )
      .setOrigin(0.5);

    // ── Floating Icarus ──
    const icarus = this.add.image(240, 500, 'icarus');
    icarus.setScale(5);
    this.tweens.add({
      targets: icarus,
      y: 480,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Sea at bottom ──
    const sea = this.add.graphics();
    sea.fillStyle(0x1a5276);
    sea.fillRect(0, 650, 480, 70);
    sea.fillStyle(0x2e86c1);
    for (let wx = 0; wx < 480; wx += 6) {
      sea.fillRect(wx, 646 + Math.sin(wx * 0.08) * 3, 4, 6);
    }
    sea.fillStyle(0xaed6f1);
    for (let wx = 0; wx < 480; wx += 12) {
      sea.fillRect(wx, 644 + Math.sin(wx * 0.08) * 3, 4, 2);
    }

    // ── Play prompt ──
    const playText = this.add
      .text(240, 590, 'Click to play', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: playText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // ── Controls hint ──
    this.add
      .text(240, 625, 'Click or SPACE to flap', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // ── Input ──
    this.input.on('pointerdown', () => this.scene.start('GameScene'));
    this.input.keyboard.on('keydown-SPACE', () =>
      this.scene.start('GameScene')
    );
  }
}
