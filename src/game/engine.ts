import { BlockEntity, CoinEntity, EnemyEntity, LevelConfig, MathQuestion, Particle } from '../types/game';
import { soundManager } from '../utils/audio';

export interface GameStateCallback {
  onQuestionTrigger: (question: MathQuestion, onResolved: (correct: boolean) => void) => void;
  onCoinCollected: (count: number) => void;
  onScoreAdded: (amount: number) => void;
  onLivesChanged: (lives: number) => void;
  onLevelComplete: (stats: { timeRemaining: number; coins: number; score: number }) => void;
  onGameOver: () => void;
}

export class PlatformerEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private level: LevelConfig;
  private callbacks: GameStateCallback;
  private questionsPool: MathQuestion[];

  // Game Loop
  private animFrameId: number | null = null;
  private lastTime = 0;
  private isRunning = false;
  private isPaused = false;

  // Player State
  public player = {
    x: 80,
    y: 300,
    width: 32,
    height: 44,
    vx: 0,
    vy: 0,
    isGrounded: false,
    facingRight: true,
    isJumping: false,
    animFrame: 0,
    animTimer: 0,
    lives: 3,
    invulnerableTimer: 0,
    isVictory: false,
    victoryTimer: 0,
  };

  // Checkpoint for respawning at last reached position
  public checkpoint = { x: 80, y: 300 };

  // World Elements
  private blocks: BlockEntity[] = [];
  private coins: CoinEntity[] = [];
  private enemies: EnemyEntity[] = [];
  private particles: Particle[] = [];
  private flagpole = { x: 3000, y: 140, height: 260, flagY: 150 };
  private castle = { x: 3120, y: 220, width: 140, height: 180 };

  // Camera & Metrics
  private cameraX = 0;
  private gravity = 0.58;
  private maxSpeed = 4.8;
  private dashMaxSpeed = 7.0;
  private jumpForce = -12.5;

  // Input
  public input = {
    left: false,
    right: false,
    jump: false,
    dash: false,
    jumpPressed: false,
  };

  // Level progress
  public coinsCollected = 0;
  public score = 0;
  public timeRemaining = 180;
  private secondTimer = 0;
  public questionsSolved = 0;

  constructor(
    canvas: HTMLCanvasElement,
    level: LevelConfig,
    questions: MathQuestion[],
    callbacks: GameStateCallback
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.level = level;
    this.questionsPool = questions;
    this.callbacks = callbacks;
    this.timeRemaining = level.timeLimit;

    this.initWorld();
  }

  private initWorld() {
    this.blocks = [];
    this.coins = [];
    this.enemies = [];
    this.particles = [];

    const groundY = 400;
    const worldLen = this.level.worldLength;
    this.flagpole.x = worldLen - 300;
    this.flagpole.y = groundY - 260;
    this.flagpole.flagY = this.flagpole.y + 10;
    this.castle.x = worldLen - 180;
    this.castle.y = groundY - 180;

    // Filter questions relevant to this level
    const levelQuestions = this.questionsPool.filter((q) => {
      if (this.level.id === 5) return q.topic === 'Volume Tabung & Kerucut';
      if (this.level.id === 1) return q.grade === 'SMP 7';
      if (this.level.id === 2) return q.grade === 'SMP 8';
      if (this.level.id === 3) return q.grade === 'SMP 7' || q.grade === 'SMP 8';
      return true; // All for level 4
    });

    let qIdx = 0;
    const getNextQuestion = () => {
      if (levelQuestions.length === 0) return this.questionsPool[0];
      const q = levelQuestions[qIdx % levelQuestions.length];
      qIdx++;
      return q;
    };

    // 1. Generate Ground segments with gaps (chasms)
    // Create gaps along the world
    const gaps = [
      { start: 650, end: 770 },
      { start: 1400, end: 1540 },
      { start: 2200, end: 2360 },
      ...(this.level.id >= 3 ? [{ start: 2900, end: 3040 }] : []),
    ];

    let currentX = 0;
    while (currentX < worldLen) {
      const inGap = gaps.find((g) => currentX >= g.start && currentX < g.end);
      if (inGap) {
        currentX = inGap.end;
        continue;
      }

      const nextGap = gaps.find((g) => g.start > currentX);
      const segmentEnd = nextGap ? Math.min(nextGap.start, worldLen) : worldLen;
      const segmentWidth = segmentEnd - currentX;

      this.blocks.push({
        id: `ground_${currentX}`,
        x: currentX,
        y: groundY,
        width: segmentWidth,
        height: 180,
        type: 'ground',
        hit: false,
        bounceOffset: 0,
      });

      currentX = segmentEnd;
    }

    // 2. Generate Floating Platforms, Mystery '?' Question Blocks, and Bricks
    const structures = [
      // Early warm-up area
      { x: 260, y: 280, type: 'brick' as const },
      { x: 300, y: 280, type: 'question' as const, question: getNextQuestion() },
      { x: 340, y: 280, type: 'brick' as const },

      // Small pipe obstacle
      { x: 480, y: 340, width: 48, height: 60, type: 'pipe' as const },

      // Platform over the first gap
      { x: 670, y: 310, width: 80, height: 24, type: 'platform' as const },

      // Question block cluster
      { x: 880, y: 280, type: 'question' as const, question: getNextQuestion() },
      { x: 920, y: 280, type: 'brick' as const },
      { x: 960, y: 280, type: 'question' as const, question: getNextQuestion() },
      { x: 920, y: 190, type: 'question' as const, question: getNextQuestion() },

      // Medium pipe obstacle
      { x: 1100, y: 320, width: 50, height: 80, type: 'pipe' as const },

      // High platform challenge
      { x: 1220, y: 270, width: 120, height: 24, type: 'platform' as const },
      { x: 1260, y: 180, type: 'question' as const, question: getNextQuestion() },

      // Platform over second gap
      { x: 1430, y: 300, width: 80, height: 24, type: 'platform' as const },

      // Staircase / Pyramid bricks
      { x: 1650, y: 360, width: 40, height: 40, type: 'brick' as const },
      { x: 1690, y: 320, width: 40, height: 80, type: 'brick' as const },
      { x: 1730, y: 280, width: 40, height: 120, type: 'brick' as const },
      { x: 1770, y: 280, width: 40, height: 120, type: 'brick' as const },
      { x: 1810, y: 320, width: 40, height: 80, type: 'brick' as const },
      { x: 1850, y: 360, width: 40, height: 40, type: 'brick' as const },

      // Tall pipe
      { x: 2000, y: 300, width: 52, height: 100, type: 'pipe' as const },

      // Platform over 3rd gap
      { x: 2230, y: 290, width: 100, height: 24, type: 'platform' as const },
      { x: 2260, y: 200, type: 'question' as const, question: getNextQuestion() },

      // Pre-flag challenge gate
      { x: 2500, y: 270, type: 'question' as const, question: getNextQuestion() },
      { x: 2540, y: 270, type: 'brick' as const },
      { x: 2580, y: 270, type: 'question' as const, question: getNextQuestion() },
      { x: 2700, y: 330, width: 50, height: 70, type: 'pipe' as const },
    ];

    structures.forEach((st, idx) => {
      this.blocks.push({
        id: `struct_${idx}`,
        x: st.x,
        y: st.y,
        width: st.width || 40,
        height: st.height || 40,
        type: st.type,
        hit: false,
        bounceOffset: 0,
        question: st.question,
      });
    });

    // 3. Generate Coins along the route
    const coinSpawns = [
      { x: 200, y: 340, count: 3 },
      { x: 300, y: 230, count: 2 },
      { x: 580, y: 340, count: 3 },
      { x: 700, y: 260, count: 2 },
      { x: 800, y: 340, count: 4 },
      { x: 1240, y: 220, count: 3 },
      { x: 1450, y: 250, count: 2 },
      { x: 1730, y: 230, count: 3 },
      { x: 1930, y: 340, count: 4 },
      { x: 2250, y: 240, count: 3 },
      { x: 2620, y: 340, count: 4 },
    ];

    coinSpawns.forEach((cs, groupIdx) => {
      for (let i = 0; i < cs.count; i++) {
        this.coins.push({
          id: `coin_${groupIdx}_${i}`,
          x: cs.x + i * 36,
          y: cs.y,
          width: 22,
          height: 22,
          collected: false,
          frame: Math.floor(Math.random() * 20),
        });
      }
    });

    // 4. Generate Cute Cartoon Enemies
    const enemySpawns = [
      { x: 400, type: 'slime' as const, dist: 120 },
      { x: 820, type: 'slime' as const, dist: 100 },
      { x: 1040, type: 'spiky' as const, dist: 80 },
      { x: 1350, type: 'flying' as const, y: 220, dist: 140 },
      { x: 1600, type: 'slime' as const, dist: 110 },
      { x: 1920, type: 'spiky' as const, dist: 90 },
      { x: 2120, type: 'flying' as const, y: 210, dist: 160 },
      { x: 2420, type: 'slime' as const, dist: 120 },
      { x: 2650, type: 'spiky' as const, dist: 100 },
    ];

    enemySpawns.forEach((es, idx) => {
      const isFlying = es.type === 'flying';
      this.enemies.push({
        id: `enemy_${idx}`,
        x: es.x,
        y: isFlying ? (es.y || 220) : groundY - 32,
        width: 32,
        height: 32,
        vx: -1.2,
        vy: 0,
        type: es.type,
        alive: true,
        squishProgress: 0,
        initialX: es.x,
        patrolDistance: es.dist,
      });
    });
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    soundManager.startBGM();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;
    if (this.isPaused) return;

    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // cap delta time
    this.lastTime = time;

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // 1. Time countdown
    if (!this.player.isVictory) {
      this.secondTimer += dt;
      if (this.secondTimer >= 1) {
        this.secondTimer -= 1;
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.handlePlayerDeath('Waktu habis!');
          return;
        }
      }
    }

    // 2. Invulnerability Timer
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }

    // 3. Victory Animation
    if (this.player.isVictory) {
      this.player.victoryTimer += dt;
      // slide down flagpole
      if (this.player.y < this.flagpole.y + this.flagpole.height - this.player.height) {
        this.player.y += 3;
        this.flagpole.flagY = Math.min(this.flagpole.y + this.flagpole.height - 40, this.player.y);
      } else {
        // Walk right towards castle
        this.player.facingRight = true;
        this.player.x += 1.8;
        this.player.animTimer += dt;
        if (this.player.animTimer > 0.1) {
          this.player.animTimer = 0;
          this.player.animFrame = (this.player.animFrame + 1) % 4;
        }
        if (this.player.x >= this.castle.x + 40) {
          // Trigger win callback once
          if (this.player.victoryTimer > 3) {
            this.stop();
            this.callbacks.onLevelComplete({
              timeRemaining: this.timeRemaining,
              coins: this.coinsCollected,
              score: this.score,
            });
            return;
          }
        }
      }
      this.updateParticles(dt);
      return;
    }

    // 4. Player Physics & Input Handling
    const targetMaxSpeed = this.input.dash ? this.dashMaxSpeed : this.maxSpeed;

    if (this.input.left) {
      this.player.vx -= 1.0;
      if (this.player.vx < -targetMaxSpeed) this.player.vx = -targetMaxSpeed;
      this.player.facingRight = false;
    } else if (this.input.right) {
      this.player.vx += 1.0;
      if (this.player.vx > targetMaxSpeed) this.player.vx = targetMaxSpeed;
      this.player.facingRight = true;
    } else {
      // Friction deceleration
      this.player.vx *= 0.82;
      if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
    }

    // Jump logic
    if (this.input.jump && this.player.isGrounded && !this.player.isJumping) {
      this.player.vy = this.jumpForce;
      this.player.isGrounded = false;
      this.player.isJumping = true;
      soundManager.playJump();
      this.createDustParticles(this.player.x + 16, this.player.y + 44);
    }

    // Variable jump height: release jump early to cut upward velocity
    if (!this.input.jump && this.player.vy < -4) {
      this.player.vy *= 0.65;
    }

    // Apply gravity
    this.player.vy += this.gravity;
    if (this.player.vy > 14) this.player.vy = 14;

    // Move X and test collisions
    this.player.x += this.player.vx;
    this.handleHorizontalCollisions();

    // Move Y and test collisions
    this.player.y += this.player.vy;
    this.handleVerticalCollisions();

    // Walking animation cycle
    if (Math.abs(this.player.vx) > 0.5 && this.player.isGrounded) {
      this.player.animTimer += dt;
      if (this.player.animTimer > (this.input.dash ? 0.08 : 0.14)) {
        this.player.animTimer = 0;
        this.player.animFrame = (this.player.animFrame + 1) % 4;
      }
    } else if (this.player.isGrounded) {
      this.player.animFrame = 0;
    }

    // Out of bounds check (falling into pit)
    if (this.player.y > 520) {
      if (this.player.lives > 1) {
        this.player.lives--;
        this.player.x = this.checkpoint.x;
        this.player.y = this.checkpoint.y;
        this.player.vx = 0;
        this.player.vy = -4;
        this.player.invulnerableTimer = 2.0;
        soundManager.playHurt();
        this.callbacks.onLivesChanged(this.player.lives);
        this.createFloatingText('LANJUT DI POSISI TERAKHIR!', this.player.x + 10, this.player.y - 20, '#f59e0b');
        return;
      } else {
        this.handlePlayerDeath('Terjatuh ke jurang!');
        return;
      }
    }

    // Flagpole Check (Victory!)
    if (
      this.player.x + this.player.width >= this.flagpole.x &&
      this.player.x <= this.flagpole.x + 20 &&
      this.player.y + this.player.height >= this.flagpole.y
    ) {
      this.triggerVictory();
      return;
    }

    // 5. Update Blocks (bounce return)
    this.blocks.forEach((b) => {
      if (b.bounceOffset > 0) {
        b.bounceOffset -= 1.5;
        if (b.bounceOffset < 0) b.bounceOffset = 0;
      }
    });

    // 6. Update Coins
    this.coins.forEach((c) => {
      if (!c.collected) {
        c.frame = (c.frame + 1) % 30;
        // Collision with player
        if (this.checkOverlap(this.player, c)) {
          c.collected = true;
          this.coinsCollected++;
          this.addScore(100);
          soundManager.playCoin();
          this.callbacks.onCoinCollected(this.coinsCollected);
          this.createCoinParticles(c.x + 11, c.y + 11);
        }
      }
    });

    // 7. Update Enemies
    this.enemies.forEach((en) => {
      if (!en.alive) {
        if (en.squishProgress < 1) {
          en.squishProgress += dt * 3;
        }
        return;
      }

      // Patrol movement
      if (en.type === 'flying') {
        en.y += Math.sin(performance.now() / 300) * 0.8;
      }

      en.x += en.vx;
      if (en.x > en.initialX + en.patrolDistance) {
        en.vx = -Math.abs(en.vx);
      } else if (en.x < en.initialX - en.patrolDistance) {
        en.vx = Math.abs(en.vx);
      }

      // Collision with player
      if (this.checkOverlap(this.player, en)) {
        // Did player stomp the enemy? (falling down and above enemy's midpoint)
        const isStomp = this.player.vy > 0 && this.player.y + this.player.height - en.y < 18;

        if (isStomp && en.type !== 'spiky') {
          // Stomp success!
          en.alive = false;
          this.player.vy = -8.5; // bounce up
          this.addScore(250);
          soundManager.playStomp();
          this.createStompParticles(en.x + 16, en.y + 16);
        } else {
          // Player hurt!
          if (this.player.invulnerableTimer <= 0) {
            this.handlePlayerHurt();
          }
        }
      }
    });

    // 8. Update Particles
    this.updateParticles(dt);

    // 9. Camera Scrolling
    // Center player slightly towards the left third so they can see ahead
    const targetCamX = this.player.x - this.canvas.width * 0.35;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    if (this.cameraX < 0) this.cameraX = 0;
    const maxCamX = this.level.worldLength - this.canvas.width;
    if (this.cameraX > maxCamX) this.cameraX = maxCamX;
  }

  private handleHorizontalCollisions() {
    this.blocks.forEach((b) => {
      if (this.checkOverlap(this.player, b)) {
        if (this.player.vx > 0) {
          this.player.x = b.x - this.player.width;
          this.player.vx = 0;
        } else if (this.player.vx < 0) {
          this.player.x = b.x + b.width;
          this.player.vx = 0;
        }
      }
    });
  }

  private handleVerticalCollisions() {
    let onGround = false;

    this.blocks.forEach((b) => {
      if (this.checkOverlap(this.player, b)) {
        if (this.player.vy > 0) {
          // Falling onto top of block
          this.player.y = b.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.isJumping = false;
          onGround = true;
        } else if (this.player.vy < 0) {
          // Hitting block from underneath!
          this.player.y = b.y + b.height;
          this.player.vy = 0;

          // Trigger block bounce
          b.bounceOffset = 8;
          soundManager.playBlockBump();

          if (b.type === 'question' && !b.hit) {
            this.hitQuestionBlock(b);
          } else if (b.type === 'brick') {
            this.createDustParticles(b.x + b.width / 2, b.y);
          }
        }
      }
    });

    if (!onGround && this.player.vy !== 0) {
      this.player.isGrounded = false;
    }
  }

  private hitQuestionBlock(block: BlockEntity) {
    block.hit = true;
    this.createCoinParticles(block.x + 20, block.y - 10);

    // Save checkpoint at this question block so player always resumes/respawns from here!
    this.checkpoint = { x: block.x - 10, y: Math.min(block.y + 40, 350) };

    if (block.question) {
      // Pause engine and trigger math popup
      this.pause();
      this.callbacks.onQuestionTrigger(block.question, (correct) => {
        if (correct) {
          this.addScore(500);
          this.coinsCollected += 5;
          this.questionsSolved++;
          soundManager.playCorrect();
          this.callbacks.onCoinCollected(this.coinsCollected);
          this.createFloatingText('+500 MATEMATIKA BENAR!', block.x + 20, block.y - 20, '#22c55e');
        } else {
          soundManager.playWrong();
          this.createFloatingText('SALAH', block.x + 20, block.y - 20, '#ef4444');
        }
        // Give invulnerability buffer so player can safely react upon modal close
        this.player.invulnerableTimer = Math.max(this.player.invulnerableTimer, 1.5);
        this.resume();
      });
    } else {
      // Just bonus coin
      this.coinsCollected++;
      this.addScore(100);
      soundManager.playCoin();
      this.callbacks.onCoinCollected(this.coinsCollected);
      this.createFloatingText('+100', block.x + 20, block.y - 15, '#fbbf24');
    }
  }

  private handlePlayerHurt() {
    this.player.lives--;
    this.player.invulnerableTimer = 1.8;
    this.player.vy = -6;
    this.player.vx = this.player.facingRight ? -4 : 4;
    soundManager.playHurt();
    this.callbacks.onLivesChanged(this.player.lives);

    if (this.player.lives <= 0) {
      this.handlePlayerDeath('Kehabisan nyawa!');
    }
  }

  private handlePlayerDeath(reason: string) {
    this.stop();
    soundManager.stopBGM();
    soundManager.playGameOver();
    this.createFloatingText(reason, this.player.x, this.player.y - 20, '#ef4444');
    setTimeout(() => {
      this.callbacks.onGameOver();
    }, 1200);
  }

  private triggerVictory() {
    this.player.isVictory = true;
    this.player.vx = 0;
    this.player.vy = 0;
    soundManager.stopBGM();
    soundManager.playVictory();
    this.createFloatingText('LEVEL SELESAI!', this.flagpole.x, this.flagpole.y - 20, '#eab308');
  }

  private addScore(amount: number) {
    this.score += amount;
    this.callbacks.onScoreAdded(this.score);
  }

  private checkOverlap(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Particle Effects
  private createCoinParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 2,
        color: '#fbbf24',
        size: Math.random() * 3 + 3,
        life: 0.5,
        maxLife: 0.5,
      });
    }
  }

  private createDustParticles(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        color: '#e2e8f0',
        size: Math.random() * 4 + 2,
        life: 0.4,
        maxLife: 0.4,
      });
    }
  }

  private createStompParticles(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: '#a855f7',
        size: Math.random() * 4 + 3,
        life: 0.5,
        maxLife: 0.5,
      });
    }
  }

  private createFloatingText(text: string, x: number, y: number, color: string) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -1.2,
      color,
      size: 16,
      life: 1.2,
      maxLife: 1.2,
      text,
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // --- RENDERING PIPELINE ---

  private render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Parallax Background
    this.drawBackground(w, h);

    // Apply Camera translation for in-world elements
    ctx.translate(-Math.floor(this.cameraX), 0);

    // 2. Draw Pipes, Ground & Blocks
    this.drawBlocks();

    // 3. Draw Coins
    this.drawCoins();

    // 4. Draw Flagpole & Castle
    this.drawFlagAndCastle();

    // 5. Draw Enemies
    this.drawEnemies();

    // 6. Draw Player (Cute original adventurer)
    this.drawPlayer();

    // 7. Draw In-World Particles
    this.drawParticles();

    ctx.restore();
  }

  private drawBackground(w: number, h: number) {
    const ctx = this.ctx;

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (this.level.theme === 'castle') {
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.7, '#1e293b');
      skyGrad.addColorStop(1, '#334155');
    } else if (this.level.theme === 'forest') {
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.6, '#38bdf8');
      skyGrad.addColorStop(1, '#bae6fd');
    } else {
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.6, '#7dd3fc');
      skyGrad.addColorStop(1, '#e0f2fe');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Cartoon Sun or Moon
    if (this.level.theme === 'castle') {
      // Crescent Moon
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w - 120, 80, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(w - 110, 75, 28, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Golden Smiling Sun
      const sunX = w - 100;
      const sunY = 70;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
      ctx.fill();

      // Cute sun face
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(sunX - 9, sunY - 4, 3, 0, Math.PI * 2);
      ctx.arc(sunX + 9, sunY - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sunX, sunY + 6, 8, 0, Math.PI);
      ctx.stroke();
    }

    // Parallax Layer 1: Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const cloudOffset = (this.cameraX * 0.2) % 400;
    for (let cx = -cloudOffset - 100; cx < w + 200; cx += 260) {
      this.drawCartoonCloud(cx, 80 + Math.sin(cx) * 20);
    }

    // Parallax Layer 2: Distant Hills
    const hillOffset = (this.cameraX * 0.4) % 600;
    ctx.fillStyle = this.level.theme === 'castle' ? '#1e293b' : (this.level.theme === 'forest' ? '#14532d' : '#86efac');
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -hillOffset - 200; x < w + 200; x += 300) {
      ctx.quadraticCurveTo(x + 150, 240, x + 300, 420);
    }
    ctx.lineTo(w, h);
    ctx.fill();

    // Parallax Layer 3: Mid-ground Hills
    const midOffset = (this.cameraX * 0.7) % 500;
    ctx.fillStyle = this.level.theme === 'castle' ? '#334155' : (this.level.theme === 'forest' ? '#166534' : '#4ade80');
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -midOffset - 200; x < w + 200; x += 240) {
      ctx.quadraticCurveTo(x + 120, 310, x + 240, 440);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  }

  private drawCartoonCloud(x: number, y: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 18, y - 12, 26, 0, Math.PI * 2);
    ctx.arc(x + 42, y - 6, 22, 0, Math.PI * 2);
    ctx.arc(x + 58, y, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawBlocks() {
    const ctx = this.ctx;

    this.blocks.forEach((b) => {
      // Culling: only draw if within camera view
      if (b.x + b.width < this.cameraX - 50 || b.x > this.cameraX + this.canvas.width + 50) {
        return;
      }

      const drawY = b.y - b.bounceOffset;

      if (b.type === 'ground') {
        // Top lush grass strip
        ctx.fillStyle = this.level.grassColor;
        ctx.fillRect(b.x, drawY, b.width, 16);

        // Ground body
        ctx.fillStyle = this.level.groundColor;
        ctx.fillRect(b.x, drawY + 16, b.width, b.height - 16);

        // Ground texture spots
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let gx = b.x + 12; gx < b.x + b.width - 12; gx += 32) {
          ctx.fillRect(gx, drawY + 28, 12, 10);
          ctx.fillRect(gx + 16, drawY + 54, 14, 12);
        }
      } else if (b.type === 'question') {
        if (b.hit) {
          // Inactive empty metallic bronze block
          ctx.fillStyle = '#78716c';
          ctx.fillRect(b.x, drawY, b.width, b.height);
          ctx.strokeStyle = '#44403c';
          ctx.lineWidth = 3;
          ctx.strokeRect(b.x, drawY, b.width, b.height);
          // 4 corner bolts
          ctx.fillStyle = '#292524';
          ctx.fillRect(b.x + 4, drawY + 4, 4, 4);
          ctx.fillRect(b.x + b.width - 8, drawY + 4, 4, 4);
          ctx.fillRect(b.x + 4, drawY + b.height - 8, 4, 4);
          ctx.fillRect(b.x + b.width - 8, drawY + b.height - 8, 4, 4);
        } else {
          // Glowing Gold Question Block
          const goldGrad = ctx.createLinearGradient(b.x, drawY, b.x, drawY + b.height);
          goldGrad.addColorStop(0, '#fef08a');
          goldGrad.addColorStop(0.5, '#f59e0b');
          goldGrad.addColorStop(1, '#d97706');
          ctx.fillStyle = goldGrad;
          ctx.fillRect(b.x, drawY, b.width, b.height);

          // Border
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 3;
          ctx.strokeRect(b.x, drawY, b.width, b.height);

          // Corner rivets
          ctx.fillStyle = '#b45309';
          ctx.fillRect(b.x + 3, drawY + 3, 3, 3);
          ctx.fillRect(b.x + b.width - 6, drawY + 3, 3, 3);
          ctx.fillRect(b.x + 3, drawY + b.height - 6, 3, 3);
          ctx.fillRect(b.x + b.width - 6, drawY + b.height - 6, 3, 3);

          // Bold '?' Mark
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', b.x + b.width / 2, drawY + b.height / 2);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1;
          ctx.strokeText('?', b.x + b.width / 2, drawY + b.height / 2);
        }
      } else if (b.type === 'brick') {
        // Orange / Red Clay Bricks
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(b.x, drawY, b.width, b.height);
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, drawY, b.width, b.height);

        // Brick mortar lines
        ctx.strokeStyle = '#431407';
        ctx.beginPath();
        ctx.moveTo(b.x, drawY + b.height / 2);
        ctx.lineTo(b.x + b.width, drawY + b.height / 2);
        ctx.moveTo(b.x + b.width / 2, drawY);
        ctx.lineTo(b.x + b.width / 2, drawY + b.height / 2);
        ctx.moveTo(b.x + b.width / 4, drawY + b.height / 2);
        ctx.lineTo(b.x + b.width / 4, drawY + b.height);
        ctx.moveTo(b.x + (b.width * 3) / 4, drawY + b.height / 2);
        ctx.lineTo(b.x + (b.width * 3) / 4, drawY + b.height);
        ctx.stroke();
      } else if (b.type === 'pipe') {
        // Classic Green Tube / Pipe
        const pipeGrad = ctx.createLinearGradient(b.x, drawY, b.x + b.width, drawY);
        pipeGrad.addColorStop(0, '#15803d');
        pipeGrad.addColorStop(0.3, '#4ade80');
        pipeGrad.addColorStop(0.7, '#22c55e');
        pipeGrad.addColorStop(1, '#166534');

        // Pipe rim top
        const rimHeight = 22;
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(b.x - 4, drawY, b.width + 8, rimHeight);
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 3;
        ctx.strokeRect(b.x - 4, drawY, b.width + 8, rimHeight);

        // Pipe main body
        ctx.fillRect(b.x, drawY + rimHeight, b.width, b.height - rimHeight);
        ctx.strokeRect(b.x, drawY + rimHeight, b.width, b.height - rimHeight);
      } else if (b.type === 'platform') {
        // Floating wooden/crystal ledge
        ctx.fillStyle = '#b45309';
        ctx.fillRect(b.x, drawY, b.width, b.height);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(b.x, drawY, b.width, 6);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, drawY, b.width, b.height);
      }
    });
  }

  private drawCoins() {
    const ctx = this.ctx;
    this.coins.forEach((c) => {
      if (c.collected) return;
      if (c.x < this.cameraX - 40 || c.x > this.cameraX + this.canvas.width + 40) return;

      // Rotating coin width scale using cosine
      const scaleX = Math.cos((c.frame / 30) * Math.PI * 2);
      const width = Math.max(Math.abs(scaleX) * c.width, 4);
      const drawX = c.x + (c.width - width) / 2;

      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(drawX + width / 2, c.y + c.height / 2, width / 2, c.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shiny center sheen
      if (width > 8) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(drawX + width / 2 - 2, c.y + 6, 4, c.height - 12);
      }
      ctx.restore();
    });
  }

  private drawFlagAndCastle() {
    const ctx = this.ctx;

    // Flagpole
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(this.flagpole.x + 8, this.flagpole.y, 6, this.flagpole.height);

    // Golden ball topper
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(this.flagpole.x + 11, this.flagpole.y - 4, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Red flag
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(this.flagpole.x + 14, this.flagpole.flagY);
    ctx.lineTo(this.flagpole.x + 64, this.flagpole.flagY + 18);
    ctx.lineTo(this.flagpole.x + 14, this.flagpole.flagY + 36);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b91c1c';
    ctx.stroke();

    // Star icon inside flag
    ctx.fillStyle = '#fef08a';
    ctx.font = '16px Fredoka, sans-serif';
    ctx.fillText('★', this.flagpole.x + 28, this.flagpole.flagY + 22);

    // Victory Castle
    const c = this.castle;
    // Main walls
    ctx.fillStyle = '#64748b';
    ctx.fillRect(c.x, c.y, c.width, c.height);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x, c.y, c.width, c.height);

    // Castle Battlements (Crenels)
    for (let bx = c.x; bx < c.x + c.width; bx += 28) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx, c.y - 18, 20, 18);
      ctx.strokeRect(bx, c.y - 18, 20, 18);
    }

    // Castle Turret in center
    ctx.fillStyle = '#475569';
    ctx.fillRect(c.x + 40, c.y - 45, 60, 45);
    ctx.strokeRect(c.x + 40, c.y - 45, 60, 45);

    // Castle Door (Arched)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(c.x + c.width / 2, c.y + c.height - 40, 24, Math.PI, 0);
    ctx.rect(c.x + c.width / 2 - 24, c.y + c.height - 40, 48, 40);
    ctx.fill();
  }

  private drawEnemies() {
    const ctx = this.ctx;

    this.enemies.forEach((en) => {
      if (en.x < this.cameraX - 50 || en.x > this.cameraX + this.canvas.width + 50) return;

      ctx.save();
      if (!en.alive) {
        // Squashed Enemy
        const scaleY = Math.max(1 - en.squishProgress, 0.2);
        ctx.translate(en.x + 16, en.y + 32);
        ctx.scale(1.3, scaleY);
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(0, -16, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      if (en.type === 'slime') {
        // Cute smiling purple mushroom / slime monster
        ctx.fillStyle = '#9333ea'; // Purple
        ctx.beginPath();
        ctx.arc(en.x + 16, en.y + 16, 15, Math.PI, 0);
        ctx.lineTo(en.x + 31, en.y + 30);
        ctx.lineTo(en.x + 1, en.y + 30);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Big cute eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(en.x + 11, en.y + 14, 4, 0, Math.PI * 2);
        ctx.arc(en.x + 21, en.y + 14, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pupils looking in moving direction
        const pupilOffset = en.vx > 0 ? 1 : -1;
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(en.x + 11 + pupilOffset, en.y + 14, 2, 0, Math.PI * 2);
        ctx.arc(en.x + 21 + pupilOffset, en.y + 14, 2, 0, Math.PI * 2);
        ctx.fill();

        // Little cute mouth
        ctx.strokeStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(en.x + 16, en.y + 22, 3, 0, Math.PI);
        ctx.stroke();
      } else if (en.type === 'spiky') {
        // Spiky orange shell monster (danger: do not jump on!)
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(en.x + 16, en.y + 22, 14, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#9a3412';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Top danger spikes
        ctx.fillStyle = '#fbbf24';
        for (let s = -1; s <= 1; s++) {
          ctx.beginPath();
          ctx.moveTo(en.x + 16 + s * 8 - 4, en.y + 12);
          ctx.lineTo(en.x + 16 + s * 8, en.y);
          ctx.lineTo(en.x + 16 + s * 8 + 4, en.y + 12);
          ctx.closePath();
          ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(en.x + 10, en.y + 18, 4, 4);
        ctx.fillRect(en.x + 18, en.y + 18, 4, 4);
      } else if (en.type === 'flying') {
        // Winged cute blue beetle
        const wingFlap = Math.sin(performance.now() / 80) * 10;
        // Wings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(en.x + 8, en.y + 10 + wingFlap / 2, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(en.x + 24, en.y + 10 - wingFlap / 2, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(en.x + 16, en.y + 18, 12, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(en.x + 12, en.y + 16, 3, 0, Math.PI * 2);
        ctx.arc(en.x + 20, en.y + 16, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private drawPlayer() {
    const p = this.player;
    const ctx = this.ctx;

    ctx.save();

    // Invulnerability flicker
    if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer * 14) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    if (!p.facingRight) {
      ctx.scale(-1, 1);
    }

    // Original Character: "Rio" The Math Adventurer
    // Dimensions relative to center: width 32, height 44 (offset -16, -22)

    // 1. Shoes / Boots (Dark Brown)
    ctx.fillStyle = '#78350f';
    if (!p.isGrounded) {
      // Jumping pose: legs tucked
      ctx.fillRect(-12, 14, 10, 7);
      ctx.fillRect(2, 12, 10, 7);
    } else if (p.animFrame % 2 === 1) {
      // Walk frame 1
      ctx.fillRect(-13, 16, 11, 6);
      ctx.fillRect(2, 15, 11, 7);
    } else {
      // Walk frame 2
      ctx.fillRect(-11, 15, 11, 7);
      ctx.fillRect(2, 16, 11, 6);
    }

    // 2. Overalls / Blue Shirt (Classic Adventurer Blue)
    ctx.fillStyle = '#2563eb'; // Vibrant Royal Blue
    ctx.fillRect(-10, -4, 20, 20);

    // Overalls yellow straps/buttons
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-5, 0, 2.5, 0, Math.PI * 2);
    ctx.arc(5, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Hands / Gloves
    ctx.fillStyle = '#ffffff';
    if (p.isVictory) {
      // Fist raised in victory!
      ctx.beginPath();
      ctx.arc(10, -18, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (!p.isGrounded) {
      ctx.beginPath();
      ctx.arc(-12, -2, 4, 0, Math.PI * 2);
      ctx.arc(12, -10, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(-11, 4, 4, 0, Math.PI * 2);
      ctx.arc(11, 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Face & Head (Warm skin tone)
    ctx.fillStyle = '#fcd34d'; // Warm friendly skin
    ctx.beginPath();
    ctx.arc(0, -10, 10, 0, Math.PI * 2);
    ctx.fill();

    // Cute blush cheeks
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.arc(4, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cheerful Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(3, -11, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(3.5, -12, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(3, -7, 3, 0, Math.PI * 0.9);
    ctx.stroke();

    // 5. Red Adventurer Cap with Math Symbol
    ctx.fillStyle = '#dc2626'; // Red Cap
    ctx.beginPath();
    ctx.arc(0, -14, 11, Math.PI, 0); // Dome of cap
    ctx.fill();

    // Cap Visor / Brim
    ctx.fillRect(1, -15, 12, 4);

    // Front Emblem: White circle with '+' Math symbol
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -16, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 7px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', 0, -16);

    ctx.restore();
  }

  private drawParticles() {
    const ctx = this.ctx;

    this.particles.forEach((p) => {
      const alpha = Math.max(p.life / p.maxLife, 0);
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.text) {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 15px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }
}
