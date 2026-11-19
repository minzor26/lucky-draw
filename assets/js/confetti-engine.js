/**
 * HIGH-PERFORMANCE CELEBRATORY CANVAS CONFETTI ENGINE
 * Delivers realistic physics (gravity, drag, wobble, 3D tilt, rotation)
 * with zero third-party dependencies.
 */

class ConfettiEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationFrameId = null;
        this.isRunning = false;
        this.colors = [
            '#FFB800', '#FF3E6C', '#00F2FE', '#7928CA',
            '#00F5A0', '#FFE57F', '#B537F2', '#FFFFFF', '#FF8A00'
        ];
    }

    init() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'auraConfettiCanvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '99999';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }

    resize() {
        if (!this.canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        if (this.ctx) {
            this.ctx.scale(dpr, dpr);
        }
    }

    burst(options = {}) {
        this.init();
        const count = options.count || 220;
        const originX = options.x !== undefined ? options.x : window.innerWidth / 2;
        const originY = options.y !== undefined ? options.y : window.innerHeight * 0.45;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 8 + Math.random() * 24;
            const size = 6 + Math.random() * 8;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const shape = Math.random() > 0.3 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'streamer');

            this.particles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - (8 + Math.random() * 10),
                gravity: 0.38 + Math.random() * 0.2,
                drag: 0.94 + Math.random() * 0.03,
                size: size,
                color: color,
                shape: shape,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 16,
                wobble: Math.random() * Math.PI,
                wobbleSpeed: 0.08 + Math.random() * 0.1,
                alpha: 1,
                decay: 0.005 + Math.random() * 0.006,
                aspectRatio: shape === 'streamer' ? 2.8 + Math.random() * 2 : (shape === 'rect' ? 1.6 : 1)
            });
        }

        if (!this.isRunning) {
            this.isRunning = true;
            this.render();
        }
    }

    render() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.wobble += p.wobbleSpeed;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y > window.innerHeight + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            const tilt = Math.cos(p.wobble);
            const w = p.size * p.aspectRatio;
            const h = p.size * Math.abs(tilt);

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-w / 2, -h / 2, w, Math.max(1, h));
            }

            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animationFrameId = requestAnimationFrame(() => this.render());
        } else {
            this.isRunning = false;
            this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }

    clear() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.particles = [];
        this.isRunning = false;
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }
}

window.confettiEngine = new ConfettiEngine();
