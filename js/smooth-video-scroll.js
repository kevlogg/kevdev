/* ==========================================================================
   KEVDEV - ULTRASMOOTH SCROLL VIDEO ENGINE (LERP + RAF + SEEK-LOCK CONTROL)
   ========================================================================== */

class SmoothVideoScrollEngine {
  constructor(options = {}) {
    this.container = document.querySelector(options.containerSelector || '#hero-scroll-container');
    this.video = document.querySelector(options.videoSelector || '#scroll-video');
    
    // Physics & Interpolation State
    this.easeFactor = options.easeFactor || 0.08; // 0.08 = silky smooth momentum
    this.isLerpEnabled = true;
    this.targetTime = 0;
    this.currentTime = 0;
    this.lastFrameTime = performance.now();
    this.fps = 60;
    
    // Video Metadata
    this.isLoaded = false;
    this.duration = 0;
    
    // HUD Metrics Elements
    this.hudFps = document.getElementById('hud-fps');
    this.hudTargetTime = document.getElementById('hud-target-time');
    this.hudCurrentTime = document.getElementById('hud-current-time');
    this.hudDelta = document.getElementById('hud-delta');
    this.hudModePill = document.getElementById('hud-mode-pill');
    
    this.init();
  }

  init() {
    if (!this.video) return;

    // Handle video metadata loading
    if (this.video.readyState >= 1) {
      this.onMetadataLoaded();
    } else {
      this.video.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
    }

    // Video error listener
    this.video.addEventListener('error', (e) => {
      console.error('[KevDev Video Engine] Error al cargar el video:', e);
    });

    // Bind Scroll Listener to calculate target position
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => this.onScroll(), { passive: true });

    // Handle tab visibility change to avoid massive frame delta spikes / 0 FPS on tab return
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.lastFrameTime = performance.now();
      }
    });

    // Start RAF Render Loop
    requestAnimationFrame((ts) => this.renderLoop(ts));

    // Bind Controls
    this.bindControls();
  }

  onMetadataLoaded() {
    if (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0) {
      this.duration = this.video.duration;
      this.isLoaded = true;
    } else {
      this.duration = 10; // Fallback safe duration
    }
    this.video.pause();
    this.onScroll(); // initial sync
    console.log(`[KevDev Video Engine] Video loaded successfully. Duration: ${this.duration.toFixed(2)}s`);
  }

  onScroll() {
    if (!this.container || !this.isLoaded || !this.duration) return;

    const rect = this.container.getBoundingClientRect();
    const totalScrollableHeight = this.container.offsetHeight - window.innerHeight;
    
    if (totalScrollableHeight <= 0) return;

    // Calculate progress fraction (0.0 to 1.0) relative to container scroll
    const scrolledPx = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolledPx / totalScrollableHeight));

    // Update target timestamp
    this.targetTime = progress * this.duration;

    // Direct mode bypass if LERP is disabled (Choppy Native Mode)
    if (!this.isLerpEnabled) {
      this.currentTime = this.targetTime;
      try {
        this.video.currentTime = this.targetTime;
      } catch (e) {}
    }
  }

  renderLoop(timestamp) {
    // 1. Calculate FPS with Tab-Switch & Spike Protection
    const delta = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Only update FPS if delta is realistic (< 1000ms and > 0) to avoid 0 FPS drops after tab change
    if (delta > 0 && delta < 1000) {
      const instantFps = 1000 / delta;
      // Exponential smoothing (85% historical, 15% instant) for stable counter
      this.fps = Math.round(this.fps * 0.85 + instantFps * 0.15);
    }

    // 2. Smooth Interpolation (LERP Engine)
    if (this.isLoaded && this.isLerpEnabled) {
      const diff = this.targetTime - this.currentTime;

      // Exponential LERP equation: current += (target - current) * ease
      this.currentTime += diff * this.easeFactor;

      // Micro-threshold to prevent endless tiny calculations
      if (Math.abs(diff) > 0.0005) {
        try {
          this.video.currentTime = this.currentTime;
        } catch (err) {}
      }
    }

    // 3. Update HUD Display Metrics
    this.updateHUD();

    // 4. Continue RAF loop
    requestAnimationFrame((ts) => this.renderLoop(ts));
  }

  updateHUD() {
    if (this.hudFps) this.hudFps.textContent = `${this.fps} FPS`;
    if (this.hudTargetTime) this.hudTargetTime.textContent = `${this.targetTime.toFixed(2)}s`;
    if (this.hudCurrentTime) this.hudCurrentTime.textContent = `${this.currentTime.toFixed(2)}s`;

    const delta = Math.abs(this.targetTime - this.currentTime);
    if (this.hudDelta) {
      this.hudDelta.textContent = `${(delta * 1000).toFixed(0)} ms`;
    }

    if (this.hudModePill) {
      if (this.isLerpEnabled) {
        this.hudModePill.textContent = 'MODO LERP SUAVE';
        this.hudModePill.className = 'hud-pill hud-pill-active';
      } else {
        this.hudModePill.textContent = 'MODO NATIVO TRABADO';
        this.hudModePill.className = 'hud-pill hud-pill-warning';
      }
    }
  }

  bindControls() {
    // Mode Switcher Toggle
    const lerpToggle = document.getElementById('toggle-lerp-mode');
    if (lerpToggle) {
      lerpToggle.addEventListener('change', (e) => {
        this.isLerpEnabled = e.target.checked;
      });
    }

    // Friction Slider
    const frictionSlider = document.getElementById('slider-friction');
    const frictionVal = document.getElementById('friction-val');
    if (frictionSlider) {
      frictionSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.easeFactor = val;
        if (frictionVal) frictionVal.textContent = val.toFixed(2);
      });
    }
  }
}

// Global initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.kevDevEngine = new SmoothVideoScrollEngine({
    containerSelector: '#hero-scroll-container',
    videoSelector: '#scroll-video',
    easeFactor: 0.08
  });
});
