import Phaser from 'phaser';

/**
 * GameScene — Core gameplay (v4 — with bosses).
 *
 * Boss encounters: survival-based. Appear at score milestones,
 * hover in place, unleash attacks. Survive → bonus feathers.
 *   Aeolus  (50)  → Wind Gust + Vortex
 *   Medusa  (120) → Stone Gaze + Serpent Volley
 *   Zeus    (200) → Lightning Bolt + Storm Cloud
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // ── Core state ──────────────────────────────────────
    this.score = 0;
    this.wingHealth = 100;
    this.isGameOver = false;
    this.baseSpeed = 80;
    this.collectibles = [];
    this.monsters = [];
    this.waveOffset = 0;
    this.introducedMonsters = new Set();
    this.nextFeatherTime = 0;
    this.nextMonsterTime = 3000;
    this.SUN_ZONE = 100;
    this.SEA_ZONE = 640;
    this.lastDamageSource = '';

    // Single life (1 chance mode)
    this.maxLives = 1;
    this.lives = 1;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;

    // Petrification (Medusa)
    this.petrified = false;
    this.petrifyTimer = 0;

    // ── Monster definitions ─────────────────────────────
    this.MONSTER_TYPES = [
      { key: 'griffin', name: 'Griffin', minScore: 0, speedMul: 1.1, animSpeed: 350, sineAmp: () => 0, sineSpeed: () => 0, bob: true },
      { key: 'stymphalian', name: 'Stymphalian Bird', minScore: 5, speedMul: 2.0, animSpeed: 150, sineAmp: () => 0, sineSpeed: () => 0, bob: false },
      { key: 'harpy', name: 'Harpy', minScore: 12, speedMul: 1.8, animSpeed: 200, sineAmp: () => Phaser.Math.Between(35, 65), sineSpeed: () => Phaser.Math.FloatBetween(2.0, 3.5), bob: false },
    ];

    // ── Boss definitions & repeating rounds ─────────────
    this.BOSS_BASE_DEFS = [
      { key: 'aeolus', name: 'Aeolus', title: 'KEEPER OF THE WINDS', triggerOffset: 50, duration: 15, bonus: 10, x: 400, y: 360, animSpeed: 400, color: 0xc0d8e8 },
      { key: 'medusa', name: 'Medusa', title: 'THE GORGON', triggerOffset: 120, duration: 18, bonus: 15, x: 390, y: 360, animSpeed: 300, color: 0xaaff44 },
      { key: 'zeus', name: 'Zeus', title: 'KING OF OLYMPUS', triggerOffset: 200, duration: 22, bonus: 25, x: 380, y: 180, animSpeed: 250, color: 0x44aaff },
    ];
    this.bossRound = 1;
    this.currentBossIndex = 0;
    this.nextBossTriggerScore = 50;
    this.boss = { phase: 'none', timer: 0, def: null, sprite: null, projectiles: [], attackTimer: 2, attackIndex: 0, animTimer: 0, animFrame: 0, introElements: [], speedMultiplier: 1.0 };

    // ── Build world ─────────────────────────────────────
    this.createBackground();
    this.createIcarus();
    this.createUI();

    // ── Particles ───────────────────────────────────────
    this.featherParticles = this.add.particles(0, 0, 'feather', {
      speed: { min: 20, max: 80 }, angle: { min: 180, max: 360 },
      scale: { start: 2, end: 0 }, lifespan: 900, gravityY: 40,
      rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(20);
    this.goldenParticles = this.add.particles(0, 0, 'golden_feather', {
      speed: { min: 40, max: 120 }, angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 }, lifespan: 500,
      rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(20);

    this.dangerOverlay = this.add.graphics().setDepth(15);
    this.input.on('pointerdown', () => this.flap());
    this.input.keyboard.on('keydown-SPACE', () => this.flap());
  }

  // ════════════════════════════════════════════════════════
  // Background
  // ════════════════════════════════════════════════════════

  createBackground() {
    const bg = this.add.graphics().setDepth(0);
    for (let y = 0; y < 720; y++) {
      const t = y / 720;
      let r, g, b;
      if (t < 0.14) { const l = t / 0.14; r = 255 - l * 30 | 0; g = 185 - l * 45 | 0; b = 60 + l * 50 | 0; }
      else if (t < 0.88) { const l = (t - 0.14) / 0.74; r = 225 - l * 100 | 0; g = 140 + l * 60 | 0; b = 110 + l * 80 | 0; }
      else { const l = (t - 0.88) / 0.12; r = 125 - l * 80 | 0; g = 200 - l * 80 | 0; b = 190 - l * 10 | 0; }
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b)); bg.fillRect(0, y, 480, 1);
    }
    this.add.image(400, 40, 'sun').setScale(4).setDepth(1).setAlpha(0.9);
    const glow = this.add.graphics().setDepth(1); glow.fillStyle(0xffd700, 0.1); glow.fillCircle(400, 40, 70);
    this.clouds = [];
    [{ x: 60, y: 160, s: 3, a: 0.4 }, { x: 250, y: 200, s: 2.5, a: 0.35 }, { x: 420, y: 300, s: 2, a: 0.3 }, { x: 150, y: 400, s: 3.5, a: 0.25 }, { x: 350, y: 480, s: 2, a: 0.2 }]
      .forEach(({ x, y, s, a }) => this.clouds.push(this.add.image(x, y, 'cloud').setScale(s).setAlpha(a).setDepth(1)));
    this.seaGfx = this.add.graphics().setDepth(2);
    const m = this.add.graphics().setDepth(3);
    m.lineStyle(1, 0xff6633, 0.2); for (let x = 0; x < 480; x += 8) m.lineBetween(x, this.SUN_ZONE, x + 4, this.SUN_ZONE);
    m.lineStyle(1, 0x3366ff, 0.2); for (let x = 0; x < 480; x += 8) m.lineBetween(x, this.SEA_ZONE, x + 4, this.SEA_ZONE);
  }

  // ════════════════════════════════════════════════════════
  // Icarus
  // ════════════════════════════════════════════════════════

  createIcarus() {
    this.icarus = this.physics.add.sprite(100, 360, 'icarus').setScale(3).setDepth(10).setCollideWorldBounds(false);
  }

  flap() {
    if (this.isGameOver || this.petrified) return;
    this.icarus.setVelocityY(-280);
    this.icarus.setTexture('icarus_flap');
    this.time.delayedCall(150, () => { if (!this.isGameOver) this.icarus.setTexture('icarus'); });
  }

  // ════════════════════════════════════════════════════════
  // Feather Collectibles
  // ════════════════════════════════════════════════════════

  spawnFeathers() {
    if (this.isGameOver) return;
    const count = Math.random() < 0.25 ? 3 : Math.random() < 0.45 ? 2 : 1;
    const bx = 520, by = Phaser.Math.Between(this.SUN_ZONE + 50, this.SEA_ZONE - 50);
    for (let i = 0; i < count; i++) {
      const x = bx + i * 40;
      const y = Phaser.Math.Clamp(by + Phaser.Math.Between(-25, 25), this.SUN_ZONE + 30, this.SEA_ZONE - 30);
      const f = this.add.image(x, y, 'golden_feather').setScale(3).setDepth(8);
      f.baseY = y; f.bobOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.tweens.add({ targets: f, alpha: 0.5, duration: 400 + Phaser.Math.Between(0, 200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.collectibles.push(f);
    }
  }

  collectEffect(x, y) {
    const p = this.add.text(x, y, '+1', { fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#FFD700', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: p, y: y - 35, alpha: 0, duration: 700, ease: 'Power2', onComplete: () => p.destroy() });
    this.goldenParticles.explode(4, x, y);
  }

  // ════════════════════════════════════════════════════════
  // Regular Monsters
  // ════════════════════════════════════════════════════════

  getAvailableMonsterTypes() { return this.MONSTER_TYPES.filter(t => this.score >= t.minScore); }

  spawnMonster() {
    if (this.isGameOver) return;
    const avail = this.getAvailableMonsterTypes();
    const cfg = avail[Phaser.Math.Between(0, avail.length - 1)];
    const x = 540, y = Phaser.Math.Between(this.SUN_ZONE + 60, this.SEA_ZONE - 60);
    const flash = this.add.rectangle(500, y, 12, 40, 0xffffff, 0.6).setDepth(8);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 0.3, duration: 300, onComplete: () => flash.destroy() });
    const mon = this.add.image(x, y, cfg.key).setScale(3).setFlipX(true).setDepth(9);
    mon.monsterName = cfg.name; mon.speed = this.baseSpeed * cfg.speedMul; mon.baseY = y;
    mon.sineAmp = cfg.sineAmp(); mon.sineSpeed = cfg.sineSpeed();
    mon.sineOffset = Phaser.Math.FloatBetween(0, Math.PI * 2); mon.gentleBob = cfg.bob;
    mon.texA = cfg.key; mon.texB = cfg.key + '_flap'; mon.animSpeed = cfg.animSpeed;
    mon.animTimer = Phaser.Math.Between(0, cfg.animSpeed); mon.currentFrame = 0;
    this.monsters.push(mon);
    if (!this.introducedMonsters.has(cfg.key)) {
      this.introducedMonsters.add(cfg.key);
      if (cfg.minScore > 0) this.showNewThreat(cfg.name);
    }
  }

  showNewThreat(name) {
    const bg = this.add.rectangle(240, 360, 320, 80, 0x000000, 0.75).setDepth(28).setStrokeStyle(2, 0xff4444);
    const w = this.add.text(240, 345, '⚠ NEW THREAT ⚠', { fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#ff4444', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5).setDepth(29);
    const l = this.add.text(240, 370, name.toUpperCase(), { fontFamily: '"Press Start 2P", monospace', fontSize: '13px', color: '#FFD700', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(29);
    this.cameras.main.flash(200, 255, 100, 100);
    this.tweens.add({ targets: [bg, w, l], alpha: 0, delay: 1800, duration: 500, onComplete: () => { bg.destroy(); w.destroy(); l.destroy(); } });
  }

  // ════════════════════════════════════════════════════════
  // Boss System — State Machine
  // ════════════════════════════════════════════════════════

  checkBossTrigger() {
    if (this.boss.phase !== 'none') return;
    if (this.score >= this.nextBossTriggerScore) {
      const baseDef = this.BOSS_BASE_DEFS[this.currentBossIndex];
      this.startBossEncounter(baseDef, this.bossRound);
    }
  }

  startBossEncounter(baseDef, round) {
    // Speed multiplier scales up with each new round (e.g. +20% per round: 1.0, 1.2, 1.4...)
    const speedMultiplier = 1.0 + (round - 1) * 0.2;

    this.boss.def = { ...baseDef };
    this.boss.speedMultiplier = speedMultiplier;
    this.boss.phase = 'warning';
    this.boss.timer = 2.0;
    this.boss.projectiles = [];
    this.boss.attackTimer = 2.5 / speedMultiplier;
    this.boss.attackIndex = 0;
    this.boss.animTimer = 0;
    this.boss.animFrame = 0;

    this.bossWarningText = this.add.text(240, 350, '⚠ WARNING ⚠', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px',
      color: '#ff4444', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(29);
    this.tweens.add({ targets: this.bossWarningText, alpha: 0.3, duration: 300, yoyo: true, repeat: -1 });
    this.bossEdgePulse = this.add.graphics().setDepth(28);
  }

  enterBossIntro() {
    if (this.bossWarningText) { this.bossWarningText.destroy(); this.bossWarningText = null; }
    if (this.bossEdgePulse) { this.bossEdgePulse.clear(); }
    const def = this.boss.def;
    this.boss.sprite = this.add.image(580, def.y, def.key).setScale(3).setDepth(11);
    this.tweens.add({ targets: this.boss.sprite, x: def.x, duration: 1200, ease: 'Power2' });

    const roundText = this.bossRound > 1 ? ` (ROUND ${this.bossRound})` : '';
    const nt = this.add.text(240, 275, `${def.name.toUpperCase()}${roundText}`, {
      fontFamily: '"Press Start 2P", monospace', fontSize: this.bossRound > 1 ? '16px' : '20px', color: '#FFD700', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(29);
    const tt = this.add.text(240, 305, def.title, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ff4444', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(29);
    this.boss.introElements = [nt, tt];
    this.cameras.main.shake(400, 0.015);
    this.tweens.add({ targets: [nt, tt], alpha: 0, delay: 2000, duration: 500, onComplete: () => { nt.destroy(); tt.destroy(); } });
  }

  updateBoss(time, delta) {
    if (this.boss.phase === 'none') return;
    const dt = delta / 1000;
    this.boss.timer -= dt;

    switch (this.boss.phase) {
      case 'warning':
        if (this.bossEdgePulse) {
          const a = 0.08 + 0.12 * Math.sin(time / 1000 * 8);
          this.bossEdgePulse.clear();
          this.bossEdgePulse.fillStyle(this.boss.def.color, a);
          this.bossEdgePulse.fillRect(0, 0, 12, 720); this.bossEdgePulse.fillRect(468, 0, 12, 720);
          this.bossEdgePulse.fillRect(0, 0, 480, 12); this.bossEdgePulse.fillRect(0, 708, 480, 12);
        }
        if (this.boss.timer <= 0) { this.boss.phase = 'intro'; this.boss.timer = 1.8; this.enterBossIntro(); }
        break;

      case 'intro':
        if (this.boss.timer <= 0) { this.boss.phase = 'battle'; this.boss.timer = this.boss.def.duration; }
        break;

      case 'battle':
        this.updateBossBattle(time, delta);
        if (this.boss.timer <= 0) { this.boss.phase = 'retreat'; this.boss.timer = 2.0; this.bossSurvived(); }
        break;

      case 'retreat':
        if (this.boss.timer <= 0) this.cleanupBoss();
        break;
    }

    this.updateBossProjectiles(time, dt);
  }

  updateBossBattle(time, delta) {
    const dt = delta / 1000;
    const def = this.boss.def;
    const spdMul = this.boss.speedMultiplier || 1.0;

    // Animation
    this.boss.animTimer += delta;
    if (this.boss.animTimer >= (def.animSpeed / spdMul)) {
      this.boss.animTimer -= (def.animSpeed / spdMul);
      this.boss.animFrame = 1 - this.boss.animFrame;
      if (this.boss.sprite) this.boss.sprite.setTexture(this.boss.animFrame === 0 ? def.key : def.key + '_flap');
    }

    // Idle movement
    if (this.boss.sprite) {
      if (def.key === 'aeolus') this.boss.sprite.y = def.y + Math.sin(time / 1000 * 0.8 * spdMul) * 30;
      else if (def.key === 'medusa') this.boss.sprite.x = def.x + Math.sin(time / 1000 * 0.6 * spdMul) * 15;
    }

    // Attack scheduling (faster attacks with speedMultiplier)
    this.boss.attackTimer -= dt;
    if (this.boss.attackTimer <= 0) {
      const idx = this.boss.attackIndex;
      this.boss.attackIndex = 1 - idx;
      switch (def.key) {
        case 'aeolus':
          if (idx === 0) { this.atkAeolusGust(); this.boss.attackTimer = 3.5 / spdMul; }
          else { this.atkAeolusVortex(); this.boss.attackTimer = 5.0 / spdMul; }
          break;
        case 'medusa':
          if (idx === 0) { this.atkMedusaGaze(); this.boss.attackTimer = 6.0 / spdMul; }
          else { this.atkMedusaSerpents(); this.boss.attackTimer = 4.5 / spdMul; }
          break;
        case 'zeus':
          if (idx === 0) { this.atkZeusLightning(); this.boss.attackTimer = 4.5 / spdMul; }
          else { this.atkZeusStorm(); this.boss.attackTimer = 7.0 / spdMul; }
          break;
      }
    }

    // Timer bar
    const pct = this.boss.timer / def.duration;
    this.bossTimerBg.clear(); this.bossTimerBg.fillStyle(0x000000, 0.5); this.bossTimerBg.fillRect(40, 693, 400, 14);
    this.bossTimerBar.clear(); this.bossTimerBar.fillStyle(0xff4444); this.bossTimerBar.fillRect(42, 695, 396 * pct, 10);
    this.bossTimerBar.lineStyle(1, 0xffffff, 0.5); this.bossTimerBar.strokeRect(40, 693, 400, 14);
  }

  bossSurvived() {
    this.score += this.boss.def.bonus;
    this.disperseBossPowers();

    // Advance to next boss in sequence and handle repeating rounds
    this.currentBossIndex++;
    if (this.currentBossIndex >= this.BOSS_BASE_DEFS.length) {
      this.currentBossIndex = 0;
      this.bossRound++;
    }
    // Schedule next boss trigger maintaining the exact same cadence
    const baseOffset = this.BOSS_BASE_DEFS[this.currentBossIndex].triggerOffset;
    this.nextBossTriggerScore = (this.bossRound - 1) * 200 + baseOffset;

    const t1 = this.add.text(240, 280, 'SURVIVED!', { fontFamily: '"Press Start 2P", monospace', fontSize: '24px', color: '#44dd44', stroke: '#000000', strokeThickness: 5 }).setOrigin(0.5).setDepth(29);
    const t2 = this.add.text(240, 318, `+${this.boss.def.bonus} FEATHERS`, { fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#FFD700', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(29);
    this.goldenParticles.explode(20, 240, 350);
    this.tweens.add({ targets: [t1, t2], alpha: 0, delay: 1500, duration: 500, onComplete: () => { t1.destroy(); t2.destroy(); } });
    if (this.boss.sprite) {
      this.tweens.add({ targets: this.boss.sprite, x: 600, duration: 1000, ease: 'Power2', onComplete: () => { if (this.boss.sprite) { this.boss.sprite.destroy(); this.boss.sprite = null; } } });
    }
  }

  disperseBossPowers() {
    // Break petrification immediately if Medusa was active
    if (this.petrified) {
      this.petrified = false;
      this.petrifyTimer = 0;
      this.icarus.x = 100;
      this.icarus.body.allowGravity = true;
      this.icarus.clearTint();
      this.featherParticles.explode(8, this.icarus.x, this.icarus.y);
    }

    // Animate removal of all boss projectiles
    const activeProjectiles = [...this.boss.projectiles];
    this.boss.projectiles = [];

    activeProjectiles.forEach(p => {
      p.dead = true; // Neutralize collision immediately

      // Sprite projectile (e.g. Medusa's serpents)
      if (p.sprite && p.sprite.active) {
        this.goldenParticles.explode(5, p.sprite.x, p.sprite.y);
        this.tweens.add({
          targets: p.sprite,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          angle: p.sprite.angle + 180,
          duration: 350,
          ease: 'Back.easeIn',
          onComplete: () => {
            if (p.sprite) p.sprite.destroy();
          }
        });
      }

      // Storm cloud (Zeus)
      if (p.type === 'storm_cloud' && p.gfx && p.gfx.active) {
        this.goldenParticles.explode(14, p.x, p.y);
        p.rainDrops = [];
        this.tweens.add({
          targets: p.gfx,
          alpha: 0,
          duration: 450,
          ease: 'Power2',
          onComplete: () => {
            if (p.gfx) p.gfx.destroy();
          }
        });
      }

      // Vortex / Tornado (Aeolus)
      else if (p.type === 'vortex' && p.gfx && p.gfx.active) {
        this.goldenParticles.explode(10, p.x, p.y);
        p.debris = [];
        this.tweens.add({
          targets: p.gfx,
          alpha: 0,
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            if (p.gfx) p.gfx.destroy();
          }
        });
      }

      // Lightning, Stone Gaze, Wind Gust (other gfx effects)
      else if (p.gfx && p.gfx.active) {
        if (p.cx && p.cy) {
          this.goldenParticles.explode(6, p.cx, p.cy);
        }
        this.tweens.add({
          targets: p.gfx,
          alpha: 0,
          duration: 300,
          ease: 'Linear',
          onComplete: () => {
            if (p.gfx) p.gfx.destroy();
          }
        });
      }
    });

    // Fade out boss timer bar
    if (this.bossTimerBar && this.bossTimerBg) {
      this.tweens.add({
        targets: [this.bossTimerBar, this.bossTimerBg],
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.bossTimerBar.clear();
          this.bossTimerBg.clear();
          this.bossTimerBar.setAlpha(1);
          this.bossTimerBg.setAlpha(1);
        }
      });
    }
  }

  cleanupBoss() {
    this.boss.projectiles.forEach(p => {
      if (p.gfx && p.gfx.active) p.gfx.destroy();
      if (p.sprite && p.sprite.active) p.sprite.destroy();
      if (p.sparks) p.sparks.forEach(s => { if (s && s.active) s.destroy(); });
      if (p.rainDrops) p.rainDrops = [];
      if (p.debris) p.debris = [];
    });
    this.boss.projectiles = [];
    if (this.boss.sprite && this.boss.sprite.active) { this.boss.sprite.destroy(); this.boss.sprite = null; }
    if (this.bossWarningText && this.bossWarningText.active) { this.bossWarningText.destroy(); this.bossWarningText = null; }
    if (this.bossEdgePulse && this.bossEdgePulse.active) { this.bossEdgePulse.destroy(); this.bossEdgePulse = null; }
    if (this.boss.introElements) { this.boss.introElements.forEach(e => { if (e && e.active) e.destroy(); }); this.boss.introElements = []; }
    this.bossTimerBar.clear(); this.bossTimerBg.clear();
    this.boss.phase = 'none'; this.boss.def = null;
    this.petrified = false; this.petrifyTimer = 0; this.icarus.x = 100; this.icarus.body.allowGravity = true; this.icarus.clearTint();
  }

  // ════════════════════════════════════════════════════════
  // Boss Attacks — Creation
  // ════════════════════════════════════════════════════════

  /** Aeolus: horizontal wind band that pushes Icarus and batters his wings */
  atkAeolusGust() {
    const spdMul = this.boss.speedMultiplier || 1.0;
    this.boss.projectiles.push({
      type: 'wind_gust',
      y: Phaser.Math.Between(180, 520),
      height: 190,
      pushDir: Math.random() < 0.5 ? -1 : 1,
      pushForce: 420 * spdMul,
      wingDamage: 22 * spdMul, // Directly wears down wing health!
      age: 0,
      gfx: this.add.graphics().setDepth(12),
    });
  }

  /** Aeolus: tornado that spawns horizontally aligned with Icarus, varies in size, launches player, and explodes monsters */
  atkAeolusVortex() {
    const spdMul = this.boss.speedMultiplier || 1.0;
    // Always horizontal aligned with Icarus (x ≈ 100), varying size (height 180 to 320, width 45 to 80)
    const tWidth = Phaser.Math.Between(50, 80);
    const tHeight = Phaser.Math.Between(180, 320);
    const targetY = Phaser.Math.Clamp(this.icarus.y + Phaser.Math.Between(-40, 40), this.SUN_ZONE + 90, this.SEA_ZONE - 90);
    // Launch direction: either up (-1) or down (1)
    const launchDir = Math.random() < 0.5 ? -1 : 1;

    this.boss.projectiles.push({
      type: 'vortex',
      x: this.icarus.x, // horizontally aligned with character
      y: targetY,
      width: tWidth,
      height: tHeight,
      launchDir,
      launchedPlayer: false,
      debris: [],
      age: 0,
      gfx: this.add.graphics().setDepth(12),
    });
  }

  /** Medusa: sweeping petrification gaze beam shortly followed by serpent missiles */
  atkMedusaGaze() {
    const down = Math.random() < 0.5;
    this.boss.projectiles.push({
      type: 'stone_gaze',
      startY: down ? 50 : 690, endY: down ? 690 : 50,
      beamHeight: 24, age: 0,
      gfx: this.add.graphics().setDepth(12),
    });

    // Shortly followed by the serpent missiles!
    const spdMul = this.boss.speedMultiplier || 1.0;
    this.time.delayedCall(1500 / spdMul, () => {
      if (this.isGameOver || this.boss.phase !== 'battle') return;
      this.atkMedusaSerpents();
    });
  }

  /** Medusa: fan of snake projectiles */
  atkMedusaSerpents() {
    const spdMul = this.boss.speedMultiplier || 1.0;
    const count = Phaser.Math.Between(3, 5);
    const cx = this.boss.sprite ? this.boss.sprite.x - 20 : 380;
    const cy = this.boss.sprite ? this.boss.sprite.y : 360;
    for (let i = 0; i < count; i++) {
      const frac = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
      const rad = Phaser.Math.DegToRad(180 + frac * 25);
      const spd = 180 * spdMul;
      this.boss.projectiles.push({
        type: 'snake',
        sprite: this.add.image(cx, cy, 'snake').setScale(3).setDepth(12),
        vx: Math.cos(rad) * spd, baseVy: Math.sin(rad) * spd,
        wiggleAmp: 25, wiggleSpeed: Phaser.Math.FloatBetween(3, 5) * spdMul,
        wiggleOffset: Phaser.Math.FloatBetween(0, Math.PI * 2), age: 0,
      });
    }
  }

  /** Zeus: radial straight lightning bolts angled by 30 degrees from his center */
  atkZeusLightning() {
    const spdMul = this.boss.speedMultiplier || 1.0;
    const salvos = [
      { delay: 0, angles: [90, 120, 150, 180, 210, 240] },
      { delay: 1400 / spdMul, angles: [105, 135, 165, 195, 225] },
    ];

    salvos.forEach((s) => {
      this.time.delayedCall(s.delay, () => {
        if (this.isGameOver || this.boss.phase !== 'battle') return;
        const cx = this.boss.sprite ? this.boss.sprite.x : 380;
        const cy = this.boss.sprite ? this.boss.sprite.y : 180;
        this.boss.projectiles.push({
          type: 'lightning',
          cx,
          cy,
          angles: s.angles,
          len: 900,
          age: 0,
          flashed: false,
          gfx: this.add.graphics().setDepth(12),
        });
      });
    });
  }

  /** Zeus: drifting thunderstorm cloud with rain that drenches wings and deadly lightning inside */
  atkZeusStorm() {
    const spdMul = this.boss.speedMultiplier || 1.0;
    this.boss.projectiles.push({
      type: 'storm_cloud',
      x: 540,
      y: Phaser.Math.Between(this.SUN_ZONE + 80, this.SEA_ZONE - 120),
      speed: 65 * spdMul,
      rainDrops: [],
      rainTimer: 0,
      age: 0,
      lifetime: 11 / spdMul,
      gfx: this.add.graphics().setDepth(13),
    });
  }

  /** Apply petrification stun (Medusa gaze hit) — freezes in place, does not drop */
  petrifyIcarus() {
    if (this.petrified || this.isInvulnerable || this.isGameOver) return;
    this.petrified = true;
    this.petrifyTimer = 1.4;
    this.icarus.body.allowGravity = false;
    this.icarus.setVelocity(0, 0);
    this.icarus.setTint(0x888888);
    this.cameras.main.flash(120, 120, 220, 120);

    // Floating text "STUNNED!"
    const stunText = this.add.text(this.icarus.x, this.icarus.y - 25, 'STUNNED!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#aaff44',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(26);
    this.tweens.add({
      targets: stunText,
      y: stunText.y - 20,
      alpha: 0,
      duration: 800,
      onComplete: () => stunText.destroy(),
    });
  }

  // ════════════════════════════════════════════════════════
  // Boss Attacks — Projectile Updates
  // ════════════════════════════════════════════════════════

  updateBossProjectiles(time, dt) {
    for (let i = this.boss.projectiles.length - 1; i >= 0; i--) {
      const p = this.boss.projectiles[i];
      p.age += dt;
      if (p.dead) { this.boss.projectiles.splice(i, 1); continue; }

      switch (p.type) {
        case 'wind_gust': this._updWindGust(p, time, dt); break;
        case 'vortex': this._updVortex(p, time, dt); break;
        case 'stone_gaze': this._updGaze(p, time, dt); break;
        case 'snake': this._updSnake(p, time, dt); break;
        case 'lightning': this._updLightning(p, time, dt); break;
        case 'storm_cloud': this._updStorm(p, time, dt); break;
      }
      if (this.isGameOver) return;
    }
  }

  _updWindGust(p, time, dt) {
    const TELE = 0.8, ACTIVE = 1.5;
    if (p.age < TELE) {
      p.gfx.clear();
      const a = 0.06 + 0.06 * Math.sin(p.age * 15);
      p.gfx.fillStyle(0xc0d8e8, a);
      p.gfx.fillRect(0, p.y - p.height / 2, 480, p.height);
    } else if (p.age < TELE + ACTIVE) {
      p.gfx.clear();
      p.gfx.fillStyle(0xc0d8e8, 0.12);
      p.gfx.fillRect(0, p.y - p.height / 2, 480, p.height);
      const off = ((p.age - TELE) * 500) % 60;
      p.gfx.fillStyle(0xe0f0ff, 0.35);
      for (let j = 0; j < 6; j++) {
        const ly = p.y - p.height / 2 + j * (p.height / 6);
        for (let x = -off + (j % 2) * 30; x < 480; x += 60) p.gfx.fillRect(x, ly, 35, 2);
      }
      if (this.icarus.y > p.y - p.height / 2 && this.icarus.y < p.y + p.height / 2) {
        this.icarus.body.velocity.y += p.pushDir * p.pushForce * dt;
        // The wind also batters and reduces wings!
        if (!this.isInvulnerable) {
          this.wingHealth -= (p.wingDamage || 22) * dt;
          this.lastDamageSource = 'wind';
          if (Math.random() < 0.25) {
            this.featherParticles.explode(1, this.icarus.x + Phaser.Math.Between(-10, 10), this.icarus.y);
          }
        }
      }
    } else { p.gfx.destroy(); p.dead = true; }
  }

  _updVortex(p, time, dt) {
    const TELE = 0.85, ACTIVE = 2.4;
    const topY = p.y - p.height / 2;
    const botY = p.y + p.height / 2;

    // Update any existing monster explosion debris
    if (p.debris && p.debris.length > 0) {
      for (let dIdx = p.debris.length - 1; dIdx >= 0; dIdx--) {
        const d = p.debris[dIdx];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.age += dt;

        // Check fatal collision with Icarus
        if (!this.isInvulnerable && !this.isGameOver) {
          const distToIcarus = Phaser.Math.Distance.Between(d.x, d.y, this.icarus.x, this.icarus.y);
          if (distToIcarus < 18) {
            this.takeHit('Struck by flying monster debris from the tornado!');
            return;
          }
        }

        if (d.x < -40 || d.x > 520 || d.y < -40 || d.y > 760 || d.age > 3.0) {
          p.debris.splice(dIdx, 1);
        }
      }
    }

    if (p.age < TELE) {
      // ── Telegraph: rising air currents & swirling funnel outline ──
      p.gfx.clear();
      const progress = p.age / TELE;
      const alpha = 0.15 + 0.15 * Math.sin(p.age * 16);

      // Draw faint forming tornado silhouette
      const steps = 12;
      for (let s = 0; s < steps; s++) {
        const frac = s / (steps - 1);
        const curY = Phaser.Math.Linear(topY, botY, frac);
        const curW = Phaser.Math.Linear(p.width * 1.2, p.width * 0.35, frac) * progress;
        p.gfx.lineStyle(1.5, 0xc0d8e8, alpha * (0.5 + 0.5 * frac));
        p.gfx.strokeEllipse(p.x, curY, curW, 10);
      }
    } else if (p.age < TELE + ACTIVE) {
      // ── Active Tornado: Violent spinning funnel ──
      p.gfx.clear();
      const activeAge = p.age - TELE;
      const spinSpeed = 14;
      const steps = 22;

      for (let s = 0; s < steps; s++) {
        const frac = s / (steps - 1);
        const curY = Phaser.Math.Linear(topY, botY, frac);
        // Funnel shape: wide top, narrow twisting base
        const baseW = Phaser.Math.Linear(p.width * 1.3, p.width * 0.3, frac);
        const wave = Math.sin(activeAge * spinSpeed + s * 0.45) * (baseW * 0.35);
        const ringAlpha = 0.25 + 0.15 * Math.sin(activeAge * 8 + s * 0.5);

        // Funnel bands
        p.gfx.lineStyle(2.5, 0xe0f0ff, ringAlpha);
        p.gfx.strokeEllipse(p.x + wave, curY, baseW, 12);

        // Core wind fill
        p.gfx.fillStyle(0xc0d8e8, ringAlpha * 0.4);
        p.gfx.fillEllipse(p.x + wave, curY, baseW * 0.8, 8);
      }

      // ── Check if any Monster enters the tornado → EXPLODES INTO LETHAL PIECES! ──
      for (let mIdx = this.monsters.length - 1; mIdx >= 0; mIdx--) {
        const m = this.monsters[mIdx];
        if (!m || !m.active) continue;

        // Check if monster intersects tornado vertical funnel
        if (Math.abs(m.x - p.x) < p.width * 0.75 && m.y >= topY - 20 && m.y <= botY + 20) {
          // MONSTER EXPLODES!
          const mx = m.x, my = m.y;
          const monName = m.monsterName || 'creature';
          m.destroy();
          this.monsters.splice(mIdx, 1);

          this.cameras.main.shake(200, 0.018);
          this.cameras.main.flash(100, 255, 180, 180);

          // Feather and gore particle explosion
          this.featherParticles.explode(15, mx, my);
          this.goldenParticles.explode(8, mx, my);

          // Floating text "OBLITERATED!"
          const oblTxt = this.add.text(mx, my - 20, 'OBLITERATED!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 3,
          }).setOrigin(0.5).setDepth(28);
          this.tweens.add({
            targets: oblTxt,
            y: oblTxt.y - 25,
            alpha: 0,
            duration: 800,
            onComplete: () => oblTxt.destroy(),
          });

          // Spawn lethal monster shrapnel flying out in all directions
          const shardCount = 8;
          for (let k = 0; k < shardCount; k++) {
            const angle = (k / shardCount) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.3, 0.3);
            const speed = Phaser.Math.Between(200, 360);
            p.debris.push({
              x: mx,
              y: my,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              age: 0,
              rot: Phaser.Math.FloatBetween(0, Math.PI * 2),
            });
          }
        }
      }

      // ── Render lethal monster debris shards ──
      if (p.debris && p.debris.length > 0) {
        p.debris.forEach(d => {
          p.gfx.fillStyle(0x8b0000, 0.95); // dark blood red/bone
          p.gfx.fillRect(d.x - 4, d.y - 4, 8, 8);
          p.gfx.fillStyle(0xffaa44, 0.9); // bone/feather fragment highlight
          p.gfx.fillRect(d.x - 2, d.y - 2, 4, 4);
        });
      }

      // ── Check if Icarus is caught by the tornado → Launch super close to top or bottom! ──
      const dx = Math.abs(this.icarus.x - p.x);
      const inTornadoY = this.icarus.y >= topY - 25 && this.icarus.y <= botY + 25;

      if (dx < p.width * 0.7 && inTornadoY && !p.launchedPlayer && !this.isGameOver) {
        p.launchedPlayer = true;
        this.cameras.main.shake(250, 0.02);

        // Launch by percentage of screen size (e.g. 50-65% screen height displacement)
        // making Icarus super close to top (SUN_ZONE) or bottom (SEA_ZONE)
        const targetLaunchY = p.launchDir === -1
          ? Phaser.Math.Between(this.SUN_ZONE + 12, this.SUN_ZONE + 35)  // close to top sun zone
          : Phaser.Math.Between(this.SEA_ZONE - 35, this.SEA_ZONE - 15); // close to bottom sea zone

        const launchVelocityY = p.launchDir === -1 ? -520 : 460;
        this.icarus.setVelocityY(launchVelocityY);

        // Smoothly tween/propel Icarus close to the threshold
        this.tweens.add({
          targets: this.icarus,
          y: targetLaunchY,
          duration: 350,
          ease: 'Cubic.easeOut',
        });

        // Whirlwind feedback
        this.featherParticles.explode(8, this.icarus.x, this.icarus.y);
        const launchText = this.add.text(this.icarus.x, this.icarus.y - 20, p.launchDir === -1 ? 'UPRAFT!' : 'DOWNBURST!', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#c0d8e8',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(27);
        this.tweens.add({
          targets: launchText,
          y: launchText.y + (p.launchDir === -1 ? -30 : 30),
          alpha: 0,
          duration: 700,
          onComplete: () => launchText.destroy(),
        });
      }
    } else {
      // Finished tornado
      p.gfx.destroy();
      p.dead = true;
    }
  }

  _updGaze(p, time, dt) {
    const TELE = 1.0, SWEEP = 1.5;
    if (p.age < TELE) {
      p.gfx.clear();
      const a = 0.12 + 0.18 * Math.sin(p.age * 12);
      p.gfx.fillStyle(0xaaff44, a);
      p.gfx.fillRect(0, p.startY - 1, 480, 3);
    } else if (p.age < TELE + SWEEP) {
      const t = (p.age - TELE) / SWEEP;
      const beamY = Phaser.Math.Linear(p.startY, p.endY, t);
      p.gfx.clear();
      p.gfx.fillStyle(0xaaff44, 0.35);
      p.gfx.fillRect(0, beamY - p.beamHeight / 2, 480, p.beamHeight);
      p.gfx.fillStyle(0xccff66, 0.55);
      p.gfx.fillRect(0, beamY - 2, 480, 4);
      if (Math.abs(this.icarus.y - beamY) < p.beamHeight / 2 + 12) this.petrifyIcarus();
    } else { p.gfx.destroy(); p.dead = true; }
  }

  _updSnake(p, time, dt) {
    p.sprite.x += p.vx * dt;
    p.sprite.y += (p.baseVy + Math.sin(time / 1000 * p.wiggleSpeed + p.wiggleOffset) * p.wiggleAmp) * dt;
    p.sprite.rotation = Math.atan2(p.baseVy, p.vx);
    if (!this.isInvulnerable && this.checkOverlap(this.icarus, p.sprite)) {
      this.takeHit("Struck by Medusa's serpents!");
      p.sprite.destroy();
      p.dead = true;
      return;
    }
    if (p.sprite.x < -50 || p.sprite.y < -50 || p.sprite.y > 770 || p.age > 6) { p.sprite.destroy(); p.dead = true; }
  }

  _updLightning(p, time, dt) {
    const TELE = 0.75, STRIKE = 0.35;
    const len = p.len || 900;

    if (p.age < TELE) {
      // ── Telegraph: warning laser lines radiating from Zeus center ──
      p.gfx.clear();
      const pulse = 0.25 + 0.25 * Math.sin(p.age * 20);

      // Center charge glow
      p.gfx.fillStyle(0xffff44, pulse * 0.8);
      p.gfx.fillCircle(p.cx, p.cy, 18);
      p.gfx.fillStyle(0xffffff, pulse);
      p.gfx.fillCircle(p.cx, p.cy, 8);

      // Warning rays angled by 30 degrees each
      for (const deg of p.angles) {
        const rad = Phaser.Math.DegToRad(deg);
        const ex = p.cx + Math.cos(rad) * len;
        const ey = p.cy + Math.sin(rad) * len;

        // Thin pulsing aim line
        p.gfx.lineStyle(2, 0xffff44, pulse);
        p.gfx.lineBetween(p.cx, p.cy, ex, ey);

        // Subtle electric halo
        p.gfx.lineStyle(5, 0x44aaff, pulse * 0.3);
        p.gfx.lineBetween(p.cx, p.cy, ex, ey);
      }
    } else if (p.age < TELE + STRIKE) {
      // ── Strike: full crackling straight lightning beams ──
      p.gfx.clear();

      if (!p.flashed) {
        this.cameras.main.flash(90, 255, 255, 220);
        this.cameras.main.shake(120, 0.012);
        p.flashed = true;
      }

      // Center discharge
      p.gfx.fillStyle(0xffffff, 0.95);
      p.gfx.fillCircle(p.cx, p.cy, 24);
      p.gfx.fillStyle(0xffffaa, 0.6);
      p.gfx.fillCircle(p.cx, p.cy, 36);

      for (const deg of p.angles) {
        const rad = Phaser.Math.DegToRad(deg);
        const dx = Math.cos(rad);
        const dy = Math.sin(rad);
        const ex = p.cx + dx * len;
        const ey = p.cy + dy * len;

        // Outer cyan electric glow
        p.gfx.lineStyle(12, 0x44aaff, 0.35);
        p.gfx.lineBetween(p.cx, p.cy, ex, ey);

        // Mid golden lightning beam
        p.gfx.lineStyle(5, 0xffffaa, 0.85);
        p.gfx.lineBetween(p.cx, p.cy, ex, ey);

        // Core brilliant white beam
        p.gfx.lineStyle(2, 0xffffff, 1.0);
        p.gfx.lineBetween(p.cx, p.cy, ex, ey);

        // Electric sparks along the beam
        p.gfx.lineStyle(1.5, 0xffffff, 0.8);
        const segments = 10;
        let lastX = p.cx, lastY = p.cy;
        for (let s = 1; s <= segments; s++) {
          const t = s / segments;
          const baseX = p.cx + dx * len * t;
          const baseY = p.cy + dy * len * t;
          const perpX = -dy * Phaser.Math.Between(-6, 6);
          const perpY = dx * Phaser.Math.Between(-6, 6);
          p.gfx.lineBetween(lastX, lastY, baseX + perpX, baseY + perpY);
          lastX = baseX + perpX;
          lastY = baseY + perpY;
        }
      }

      // ── Collision detection: point-to-line-segment distance ──
      const px = this.icarus.x;
      const py = this.icarus.y;
      const hitRadius = 16;

      for (const deg of p.angles) {
        const rad = Phaser.Math.DegToRad(deg);
        const dx = Math.cos(rad);
        const dy = Math.sin(rad);

        const vx = px - p.cx;
        const vy = py - p.cy;
        const proj = vx * dx + vy * dy;

        if (proj > 0 && proj < len) {
          const closeX = p.cx + proj * dx;
          const closeY = p.cy + proj * dy;
          const distSq = (px - closeX) * (px - closeX) + (py - closeY) * (py - closeY);
          if (distSq < hitRadius * hitRadius) {
            this.takeHit("Struck down by Zeus's thunderbolt!");
            return;
          }
        }
      }
    } else {
      p.gfx.destroy();
      p.dead = true;
    }
  }

  _updStorm(p, time, dt) {
    p.x -= p.speed * dt;
    p.gfx.clear();

    const ix = this.icarus.x;
    const iy = this.icarus.y;
    const icarusRadius = 14;

    // ── Puffy cloud lobe definitions ──
    const puffs = [
      { dx: -45, dy: 6, r: 18 },  // left base
      { dx: -25, dy: -8, r: 22 }, // top left
      { dx: 4, dy: -14, r: 25 },  // top center peak
      { dx: 30, dy: -6, r: 21 },  // top right
      { dx: 48, dy: 7, r: 17 },   // right base
      { dx: 0, dy: 6, r: 24 },    // center mass
      { dx: -22, dy: 8, r: 20 },  // bottom left
      { dx: 24, dy: 8, r: 20 },   // bottom right
    ];

    // ── Check if Icarus enters the cloud (instant lightning death) ──
    for (const pf of puffs) {
      const cx = p.x + pf.dx;
      const cy = p.y + pf.dy;
      const distSq = (ix - cx) * (ix - cx) + (iy - cy) * (iy - cy);
      const combinedR = pf.r + icarusRadius;
      if (distSq < combinedR * combinedR) {
        this.cameras.main.flash(200, 255, 255, 240);
        this.cameras.main.shake(250, 0.02);
        for (let b = 0; b < 16; b++) {
          this.featherParticles.explode(1, ix + Phaser.Math.Between(-15, 15), iy + Phaser.Math.Between(-15, 15));
        }
        this.takeHit("Struck by lightning inside Zeus's cloud!");
        return;
      }
    }

    // ── Draw the billowing storm cloud ──
    const isFlashing = (Math.sin(time / 1000 * 14 + p.age * 2) > 0.82);

    // 1. Shadow silhouette (dark storm outline)
    p.gfx.fillStyle(0x181826, 0.95);
    for (const pf of puffs) {
      p.gfx.fillCircle(p.x + pf.dx, p.y + pf.dy + 3, pf.r + 3);
    }

    // 2. Main cloud body (dark stormy purple-slate)
    p.gfx.fillStyle(isFlashing ? 0x3d3858 : 0x28263a, 0.95);
    for (const pf of puffs) {
      p.gfx.fillCircle(p.x + pf.dx, p.y + pf.dy, pf.r);
    }

    // 3. Volumetric upper highlight
    p.gfx.fillStyle(isFlashing ? 0x58527a : 0x3e3b52, 0.9);
    for (const pf of puffs) {
      if (pf.dy <= 6) {
        p.gfx.fillCircle(p.x + pf.dx, p.y + pf.dy - 3, pf.r * 0.75);
      }
    }

    // 4. Puffy top rims
    p.gfx.fillStyle(isFlashing ? 0x99ddff : 0x64607c, 0.8);
    p.gfx.fillCircle(p.x - 25, p.y - 12, 12);
    p.gfx.fillCircle(p.x + 4, p.y - 18, 14);
    p.gfx.fillCircle(p.x + 30, p.y - 10, 11);

    // 5. Internal lightning crackles
    if (isFlashing) {
      p.gfx.fillStyle(0xfffaaa, 0.75);
      p.gfx.fillCircle(p.x + 2, p.y - 2, 15);
      p.gfx.lineStyle(2, 0xffffff, 0.9);
      p.gfx.lineBetween(p.x - 20, p.y - 4, p.x - 5, p.y + 6);
      p.gfx.lineBetween(p.x - 5, p.y + 6, p.x + 12, p.y - 8);
      p.gfx.lineBetween(p.x + 12, p.y - 8, p.x + 26, p.y + 2);
    }

    // ── Generate Rain beneath the cloud ──
    p.rainTimer += dt;
    if (p.rainTimer >= 0.04) {
      p.rainTimer = 0;
      for (let k = 0; k < 2; k++) {
        p.rainDrops.push({
          x: p.x + Phaser.Math.Between(-48, 48),
          y: p.y + 16,
          vx: Phaser.Math.Between(-35, -15),
          vy: Phaser.Math.Between(320, 420),
          len: Phaser.Math.Between(10, 16),
          alpha: Phaser.Math.FloatBetween(0.5, 0.85),
        });
      }
    }

    // ── Update and Render Rain Streaks ──
    for (let j = p.rainDrops.length - 1; j >= 0; j--) {
      const d = p.rainDrops[j];
      d.x += d.vx * dt;
      d.y += d.vy * dt;

      // Draw angled rain streak
      p.gfx.lineStyle(2, 0x66bbff, d.alpha);
      p.gfx.lineBetween(d.x, d.y, d.x + (d.vx / d.vy) * d.len, d.y + d.len);

      // Rain reduces wing health when hitting Icarus
      if (Math.abs(d.x - ix) < 18 && Math.abs(d.y - iy) < 20) {
        this.wingHealth -= 5;
        this.lastDamageSource = 'rain';
        this.featherParticles.explode(1, ix, iy);
        p.rainDrops.splice(j, 1);
        continue;
      }

      // Splash at sea level (y >= 640)
      if (d.y >= 640) {
        p.gfx.lineStyle(1, 0x88ccff, 0.4);
        p.gfx.strokeCircle(d.x, 642, 2.5);
        p.rainDrops.splice(j, 1);
      }
    }

    // Cloud leaves screen
    if (p.x < -100 || p.age > p.lifetime) {
      p.rainDrops = [];
      p.gfx.destroy();
      p.dead = true;
    }
  }

  // ════════════════════════════════════════════════════════
  // UI
  // ════════════════════════════════════════════════════════

  createUI() {
    this.scoreText = this.add.text(240, 48, '0', { fontFamily: '"Press Start 2P", monospace', fontSize: '28px', color: '#FFD700', stroke: '#000000', strokeThickness: 5 }).setOrigin(0.5).setDepth(30);
    this.add.text(240, 74, 'FEATHERS', { fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ccaa44' }).setOrigin(0.5).setDepth(30);
    this.healthBarBg = this.add.graphics().setDepth(30); this.healthBarBg.fillStyle(0x000000, 0.5); this.healthBarBg.fillRect(14, 14, 154, 20);
    this.healthBar = this.add.graphics().setDepth(31);
    this.add.text(18, 36, 'WINGS', { fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff' }).setDepth(31);

    this.warningText = this.add.text(240, 360, '', { fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ff4444', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(30).setAlpha(0);
    // Boss timer bar (drawn during battle)
    this.bossTimerBar = this.add.graphics().setDepth(31);
    this.bossTimerBg = this.add.graphics().setDepth(30);
  }

  // ════════════════════════════════════════════════════════
  // Collision & Damage (Single Chance / 1 Life)
  // ════════════════════════════════════════════════════════

  takeHit(reason) {
    if (this.isGameOver || this.isInvulnerable) return;

    this.lives = 0;
    this.triggerGameOver(reason);
  }

  checkOverlap(a, b) {
    const ax = a.x - a.displayWidth * a.originX, ay = a.y - a.displayHeight * a.originY;
    const bx = b.x - b.displayWidth * b.originX, by = b.y - b.displayHeight * b.originY;
    return ax < bx + b.displayWidth && ax + a.displayWidth > bx && ay < by + b.displayHeight && ay + a.displayHeight > by;
  }

  triggerGameOver(reason) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    if (this.boss.phase !== 'none') this.cleanupBoss();
    this.icarus.body.allowGravity = false;
    this.icarus.setVelocity(0, 0);
    this.cameras.main.flash(300, 255, 200, 200);
    this.cameras.main.shake(250, 0.015);
    for (let i = 0; i < 12; i++) {
      this.featherParticles.explode(1, this.icarus.x + Phaser.Math.Between(-15, 15), this.icarus.y + Phaser.Math.Between(-15, 15));
    }
    this.time.delayedCall(1500, () => this.scene.start('GameOverScene', { score: this.score, reason }));
  }

  // ════════════════════════════════════════════════════════
  // Main Update Loop
  // ════════════════════════════════════════════════════════

  update(time, delta) {
    if (this.isGameOver) return;
    const dt = delta / 1000;
    const tier = Math.floor(this.score / 100);
    this.baseSpeed = 80 + tier * 15;

    // ── Petrification / Stun (Medusa) ───────────────────
    if (this.petrified) {
      this.petrifyTimer -= dt;
      // Stunned: freeze in place, no gravity, does NOT drop
      this.icarus.body.allowGravity = false;
      this.icarus.setVelocity(0, 0);
      this.icarus.x = 100 + (Math.random() - 0.5) * 2; // subtle stone tremble

      if (this.petrifyTimer <= 0) {
        this.petrified = false;
        this.icarus.x = 100;
        this.icarus.body.allowGravity = true;
        this.icarus.clearTint();
        this.featherParticles.explode(6, this.icarus.x, this.icarus.y);
      }
    }

    // ── Invulnerability / i-frames ──────────────────────
    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      this.icarus.setAlpha(Math.sin(time / 1000 * 30) > 0 ? 0.25 : 1.0);
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.icarus.setAlpha(1.0);
      }
    }

    // ── Icarus rotation ─────────────────────────────────
    this.icarus.angle = Phaser.Math.Linear(this.icarus.angle, Phaser.Math.Clamp(this.icarus.body.velocity.y / 8, -35, 70), 0.15);

    // ── Danger zones ────────────────────────────────────
    let inDanger = false;
    if (!this.isInvulnerable) {
      if (this.icarus.y < this.SUN_ZONE) {
        this.wingHealth -= 35 * dt; inDanger = true;
        this.warningText.setText('TOO HIGH!').setAlpha(0.9).setColor('#ff6633');
        this.dangerOverlay.clear(); this.dangerOverlay.fillStyle(0xff6633, 0.15); this.dangerOverlay.fillRect(0, 0, 480, 720);
        if (Math.random() < 0.3) this.featherParticles.explode(1, this.icarus.x + Phaser.Math.Between(-10, 10), this.icarus.y + Phaser.Math.Between(-5, 5));
      } else if (this.icarus.y > this.SEA_ZONE) {
        this.wingHealth -= 40 * dt; inDanger = true;
        this.warningText.setText('TOO LOW!').setAlpha(0.9).setColor('#3366ff');
        this.dangerOverlay.clear(); this.dangerOverlay.fillStyle(0x3366ff, 0.2); this.dangerOverlay.fillRect(0, 0, 480, 720);
      }
    }
    if (!inDanger) { this.dangerOverlay.clear(); if (this.warningText.alpha > 0) this.warningText.setAlpha(Math.max(0, this.warningText.alpha - dt * 4)); }
    if (this.wingHealth <= 0) {
      this.wingHealth = 0;
      let reason = 'You drowned in the sea!';
      if (this.icarus.y < this.SUN_ZONE) {
        reason = 'The sun melted your wings!';
      } else if (this.lastDamageSource === 'rain') {
        reason = 'The heavy storm rain soaked your wings!';
      } else if (this.lastDamageSource === 'wind') {
        reason = 'Torn apart by howling gales!';
      }
      this.takeHit(reason);
      if (this.isGameOver) return;
    }
    if (this.icarus.y > 750) { this.takeHit('Lost to the sea!'); if (this.isGameOver) return; }
    if (this.icarus.y < -40) { this.takeHit('Flew too close to the sun!'); if (this.isGameOver) return; }

    // ── Feathers (spawn even during boss) ───────────────
    if (time > this.nextFeatherTime) {
      this.spawnFeathers();
      this.nextFeatherTime = time + Math.max(750, 1200 - tier * 100);
    }

    // ── Monsters (paused during boss) ───────────────────
    if (this.boss.phase === 'none' && time > this.nextMonsterTime) {
      this.spawnMonster();
      this.nextMonsterTime = time + Math.max(2200, 3600 - tier * 350);
    }

    // ── Update collectibles ─────────────────────────────
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const f = this.collectibles[i];
      f.x -= this.baseSpeed * dt;
      f.y = f.baseY + Math.sin(time / 1000 * 2 + f.bobOffset) * 10;
      if (this.checkOverlap(this.icarus, f)) { this.score += 1; this.collectEffect(f.x, f.y); f.destroy(); this.collectibles.splice(i, 1); continue; }
      if (f.x < -40) { f.destroy(); this.collectibles.splice(i, 1); }
    }

    // ── Update monsters ─────────────────────────────────
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      m.x -= m.speed * dt;
      if (m.sineAmp > 0) m.y = m.baseY + Math.sin(time / 1000 * m.sineSpeed + m.sineOffset) * m.sineAmp;
      if (m.gentleBob) m.y = m.baseY + Math.sin(time / 1000 * 1.2 + m.sineOffset) * 8;
      m.animTimer += delta;
      if (m.animTimer >= m.animSpeed) { m.animTimer -= m.animSpeed; m.currentFrame = 1 - m.currentFrame; m.setTexture(m.currentFrame === 0 ? m.texA : m.texB); }
      if (!this.isInvulnerable && this.checkOverlap(this.icarus, m)) {
        this.takeHit(`Caught by a ${m.monsterName}!`);
        if (this.isGameOver) return;
      }
      if (m.x < -80) { m.destroy(); this.monsters.splice(i, 1); }
    }

    // ── Boss system ─────────────────────────────────────
    this.checkBossTrigger();
    this.updateBoss(time, delta);
    if (this.isGameOver) return;

    // ── Clouds ──────────────────────────────────────────
    this.clouds.forEach(c => { c.x -= this.baseSpeed * dt * 0.15; if (c.x < -60) { c.x = 540; c.y = Phaser.Math.Between(130, 520); } });

    // ── UI ──────────────────────────────────────────────
    this.scoreText.setText(String(this.score));
    this.healthBar.clear();
    const hp = this.wingHealth / 100;
    this.healthBar.fillStyle(hp > 0.5 ? 0x44dd44 : hp > 0.25 ? 0xdddd44 : 0xdd4444);
    this.healthBar.fillRect(16, 16, 150 * hp, 16);
    this.healthBar.lineStyle(2, 0xffffff, 0.7); this.healthBar.strokeRect(16, 16, 150, 16);

    // ── Sea waves ───────────────────────────────────────
    this.waveOffset += dt * 50;
    this.seaGfx.clear();
    this.seaGfx.fillStyle(0x1a5276); this.seaGfx.fillRect(0, this.SEA_ZONE + 10, 480, 80);
    this.seaGfx.fillStyle(0x2e86c1);
    for (let wx = 0; wx < 480; wx += 4) { const wy = Math.sin((wx + this.waveOffset) * 0.06) * 4; this.seaGfx.fillRect(wx, this.SEA_ZONE + wy, 4, 12); }
    this.seaGfx.fillStyle(0xaed6f1);
    for (let wx = 0; wx < 480; wx += 8) { const wy = Math.sin((wx + this.waveOffset) * 0.06) * 4; this.seaGfx.fillRect(wx, this.SEA_ZONE + wy, 4, 2); }
  }
}
