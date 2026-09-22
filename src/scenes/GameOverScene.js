import Phaser from 'phaser';

/**
 * GameOverScene — Shows death reason, final score,
 * and options to retry or return to menu.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data) {
    const score = data.score || 0;
    const reason = data.reason || 'Game Over';

    // ── Semi-transparent overlay ──
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0e17, 0.92);
    bg.fillRect(0, 0, 480, 720);

    // ── Fallen golden feathers decoration ──
    for (let i = 0; i < 20; i++) {
      const feather = this.add.image(
        Phaser.Math.Between(40, 440),
        Phaser.Math.Between(50, 670),
        'golden_feather'
      );
      feather.setScale(Phaser.Math.FloatBetween(1.5, 3.5));
      feather.setAlpha(Phaser.Math.FloatBetween(0.08, 0.25));
      feather.setAngle(Phaser.Math.Between(0, 360));
    }

    // ── Title ──
    this.add
      .text(240, 170, 'GAME OVER', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '28px',
        color: '#ff4444',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // ── Death reason ──
    this.add
      .text(240, 240, reason, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffcc44',
        stroke: '#000000',
        strokeThickness: 3,
        wordWrap: { width: 380 },
        align: 'center',
      })
      .setOrigin(0.5);

    // ── Fallen Icarus ──
    const icarus = this.add.image(240, 340, 'icarus');
    icarus.setScale(4);
    icarus.setAngle(90); // Fallen
    icarus.setAlpha(0.7);

    // ── Score ──
    this.add
      .text(240, 415, 'FEATHERS COLLECTED', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ccaa44',
      })
      .setOrigin(0.5);

    this.add
      .text(240, 455, String(score), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '36px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // ── Retry prompt ──
    const retryText = this.add
      .text(240, 540, 'Click to retry', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: retryText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // ── Menu hint ──
    this.add
      .text(240, 580, 'Press M for menu', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#666666',
      })
      .setOrigin(0.5);

    // ── Input (delayed to prevent accidental click-through) ──
    this.time.delayedCall(600, () => {
      this.input.on('pointerdown', () => this.scene.start('GameScene'));
      this.input.keyboard.on('keydown-SPACE', () =>
        this.scene.start('GameScene')
      );
      this.input.keyboard.on('keydown-M', () =>
        this.scene.start('MenuScene')
      );
    });
  }
}
