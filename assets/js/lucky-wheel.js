/**
 * FUTURISTIC INTERACTIVE PRIZE WHEEL ENGINE
 * Completely original circular canvas-driven prize mechanism.
 * Features realistic rotational physics, dynamic lighting, peg deflection,
 * and audio tick synchronization.
 */

class LuckyWheel {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.prizes = options.prizes || PRIZE_CONFIG;
        this.numSegments = this.prizes.length;
        this.segmentAngle = (Math.PI * 2) / this.numSegments;

        this.currentAngle = 0; // In radians
        this.isSpinning = false;
        this.spinDuration = 4200; // ms (approx 4.2 seconds for perfect suspense)
        this.startTime = null;
        this.startAngle = 0;
        this.targetAngle = 0;
        this.selectedPrize = null;

        // Peg collision detection for audio & pointer bounce
        this.lastPegIndex = -1;
        this.pointerBounce = 0; // Deflection in radians

        this.onSpinStart = options.onSpinStart || (() => {});
        this.onSpinComplete = options.onSpinComplete || (() => {});

        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.initCanvasSize();
        window.addEventListener('resize', () => {
            this.initCanvasSize();
            this.draw();
        });

        // Initial draw
        this.draw();
    }

    initCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        const size = Math.min(rect.width || 560, window.innerWidth > 768 ? 560 : Math.min(window.innerWidth - 40, 420));
        this.canvas.width = size * this.dpr;
        this.canvas.height = size * this.dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
        this.radius = size / 2;
        this.centerX = size / 2;
        this.centerY = size / 2;
    }

    /**
     * Weighted random selection based on PRIZE_CONFIG weights
     */
    selectRandomPrize(forcedPrizeId = null) {
        if (forcedPrizeId) {
            const forced = this.prizes.find(p => p.id === forcedPrizeId);
            if (forced) return forced;
        }

        const totalWeight = this.prizes.reduce((sum, p) => sum + (p.weight || 10), 0);
        let randomNum = Math.random() * totalWeight;

        for (let i = 0; i < this.prizes.length; i++) {
            if (randomNum < this.prizes[i].weight) {
                return this.prizes[i];
            }
            randomNum -= this.prizes[i].weight;
        }
        return this.prizes[0];
    }

    /**
     * Trigger spin toward chosen prize
     */
    spin(forcedPrizeId = null) {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.selectedPrize = this.selectRandomPrize(forcedPrizeId);
        const winningIndex = this.prizes.findIndex(p => p.id === this.selectedPrize.id);

        if (window.soundEngine) {
            window.soundEngine.startSpinHum();
        }
        this.onSpinStart(this.selectedPrize);

        // Indicator is at top (270 degrees or -PI/2 radians).
        // Each segment index i spans from [i * segmentAngle, (i + 1) * segmentAngle].
        // To land at index i, pointer (-PI/2) must point to center of segment i:
        // Angle at pointer = -PI/2.
        // We want: (wheelAngle + segmentCenter) % 2PI = 3PI/2.
        // Add random jitter within 70% of segment width to avoid landing on lines.
        const segmentCenter = (winningIndex + 0.5) * this.segmentAngle;
        const jitter = (Math.random() - 0.5) * (this.segmentAngle * 0.65);
        const desiredFinalAngle = (3 * Math.PI / 2) - segmentCenter + jitter;

        // Ensure 5 to 7 full revolutions for exciting suspense
        const fullSpins = 5 + Math.floor(Math.random() * 2);
        const currentMod = this.currentAngle % (Math.PI * 2);
        let angleDelta = (desiredFinalAngle - currentMod);
        while (angleDelta < 0) {
            angleDelta += Math.PI * 2;
        }

        this.startAngle = this.currentAngle;
        this.targetAngle = this.currentAngle + (fullSpins * Math.PI * 2) + angleDelta;
        this.startTime = performance.now();

        this.animate(this.startTime);
    }

    /**
     * Easing function: Custom cubic-bezier acceleration & long suspenseful deceleration
     */
    easeOutCubicSuspense(t) {
        // t from 0 to 1
        // Smooth start, long gradual deceleration curve for dramatic suspense
        return 1 - Math.pow(1 - t, 3.8);
    }

    animate(now) {
        const elapsed = now - this.startTime;
        const progress = Math.min(elapsed / this.spinDuration, 1);
        const easedProgress = this.easeOutCubicSuspense(progress);

        this.currentAngle = this.startAngle + (this.targetAngle - this.startAngle) * easedProgress;

        // Peg hit detection for tick sound
        // Pegs are at segment boundaries
        const totalPegs = this.numSegments * 2; // 2 pegs per segment for rich tactile ticks
        const pegStep = (Math.PI * 2) / totalPegs;
        const normalizedAngle = (this.currentAngle + Math.PI / 2) % (Math.PI * 2);
        const currentPeg = Math.floor(normalizedAngle / pegStep);

        if (currentPeg !== this.lastPegIndex) {
            this.lastPegIndex = currentPeg;
            // Velocity ratio for tick pitch/volume
            const speedRatio = Math.max(0.1, 1 - progress);
            if (window.soundEngine) {
                window.soundEngine.playWheelTick(speedRatio);
            }
            // Pointer vibration bounce
            this.pointerBounce = 0.22 * speedRatio;
        }

        // Pointer bounce decays smoothly
        this.pointerBounce *= 0.82;

        this.draw();

        if (progress < 1) {
            requestAnimationFrame((time) => this.animate(time));
        } else {
            this.isSpinning = false;
            this.currentAngle = this.targetAngle;
            if (window.soundEngine) {
                window.soundEngine.stopSpinHum();
            }
            this.draw();
            setTimeout(() => {
                this.onSpinComplete(this.selectedPrize);
            }, 350);
        }
    }

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const cx = this.centerX;
        const cy = this.centerY;
        const r = this.radius - 14;

        ctx.clearRect(0, 0, cx * 2, cy * 2);

        ctx.save();
        ctx.translate(cx, cy);

        // 1. Ambient Outer Glow Ring
        const ambientGlow = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, r + 12);
        ambientGlow.addColorStop(0, 'rgba(0, 242, 254, 0)');
        ambientGlow.addColorStop(0.85, 'rgba(121, 40, 202, 0.15)');
        ambientGlow.addColorStop(1, 'rgba(255, 184, 0, 0.2)');
        ctx.fillStyle = ambientGlow;
        ctx.beginPath();
        ctx.arc(0, 0, r + 12, 0, Math.PI * 2);
        ctx.fill();

        // 2. Outer Rim Chassis
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#0B0F19';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#1F293D';
        ctx.stroke();

        // 3. Draw Rotated Wheel Body
        ctx.save();
        ctx.rotate(this.currentAngle);

        const innerRadius = 78; // Center hub radius

        for (let i = 0; i < this.numSegments; i++) {
            const startAng = i * this.segmentAngle;
            const endAng = startAng + this.segmentAngle;
            const prize = this.prizes[i];

            // Segment Wedge
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r - 4, startAng, endAng);
            ctx.closePath();

            // Distinct luxury gradients per tier
            const segGrad = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, r);
            if (prize.tier === 'grand') {
                segGrad.addColorStop(0, '#2D1B00');
                segGrad.addColorStop(0.5, '#482B00');
                segGrad.addColorStop(1, '#784600');
            } else if (prize.tier === 'premium') {
                segGrad.addColorStop(0, '#001D2E');
                segGrad.addColorStop(0.6, '#00334E');
                segGrad.addColorStop(1, '#00547A');
            } else if (prize.tier === 'special') {
                segGrad.addColorStop(0, '#1E0B36');
                segGrad.addColorStop(0.6, '#2E1153');
                segGrad.addColorStop(1, '#4A1580');
            } else if (prize.tier === 'surprise') {
                segGrad.addColorStop(0, '#052319');
                segGrad.addColorStop(0.6, '#0A3B2B');
                segGrad.addColorStop(1, '#0F573E');
            } else if (prize.tier === 'reward') {
                segGrad.addColorStop(0, '#261217');
                segGrad.addColorStop(0.6, '#3D1B24');
                segGrad.addColorStop(1, '#5C2234');
            } else {
                segGrad.addColorStop(0, '#131822');
                segGrad.addColorStop(0.7, '#1C2333');
                segGrad.addColorStop(1, '#273145');
            }
            ctx.fillStyle = segGrad;
            ctx.fill();

            // Segment Border Divider
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.stroke();

            // Outer Arc Glowing Accent Line
            ctx.beginPath();
            ctx.arc(0, 0, r - 6, startAng, endAng);
            ctx.lineWidth = 4;
            ctx.strokeStyle = prize.accentColor || '#00F2FE';
            ctx.stroke();

            // Segment Content (Text, Badge, Icon)
            ctx.save();
            ctx.rotate(startAng + this.segmentAngle / 2);

            // Prize Name
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'right';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            
            // Format short title
            const label = prize.shortName || prize.name;
            ctx.fillText(label, r - 32, 4);

            // Prize Category / Badge
            ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = prize.accentColor || '#FFE57F';
            ctx.fillText(prize.badge ? prize.badge.split('•')[0].trim() : '', r - 32, 18);

            // Render Icon / Symbol
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            const iconGlyph = this.getGlyphForIcon(prize.icon);
            ctx.fillText(iconGlyph, r - 120, 6);

            ctx.restore();
        }

        // 4. Perimeter Chrome Pegs / Nodes
        const numPegs = this.numSegments * 2;
        const pegRadius = r - 10;
        for (let p = 0; p < numPegs; p++) {
            const pegAngle = p * ((Math.PI * 2) / numPegs);
            const px = Math.cos(pegAngle) * pegRadius;
            const py = Math.sin(pegAngle) * pegRadius;

            // Outer peg glow
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#00F2FE';
            ctx.shadowBlur = 6;
            ctx.fill();

            // Inner metallic core
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = '#0A0F1D';
            ctx.shadowBlur = 0;
            ctx.fill();
        }

        ctx.restore(); // Restore wheel rotation

        // 5. Center Hub Bezel
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        const hubGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, innerRadius);
        hubGrad.addColorStop(0, '#1A2338');
        hubGrad.addColorStop(0.7, '#0C111E');
        hubGrad.addColorStop(1, '#05070D');
        ctx.fillStyle = hubGrad;
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#2A3650';
        ctx.stroke();

        // 6. Center Hub Decorative Ring
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius - 8, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.stroke();

        // 7. Top Fixed Indicator Pointer (with realistic spring deflection)
        this.drawPointer(ctx, 0, -r + 2, this.pointerBounce);

        ctx.restore(); // Restore center translate
    }

    drawPointer(ctx, x, y, bounce) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(bounce); // Spring recoil

        // Pointer Shadow
        ctx.shadowColor = 'rgba(0, 242, 254, 0.9)';
        ctx.shadowBlur = 12;

        // Aerodynamic pointer shape
        ctx.beginPath();
        ctx.moveTo(-16, -18);
        ctx.lineTo(16, -18);
        ctx.lineTo(11, 2);
        ctx.lineTo(0, 26); // Needle tip points into wheel
        ctx.lineTo(-11, 2);
        ctx.closePath();

        const pGrad = ctx.createLinearGradient(-16, -18, 16, 26);
        pGrad.addColorStop(0, '#FFE259');
        pGrad.addColorStop(0.4, '#FFA751');
        pGrad.addColorStop(1, '#FF3E6C');
        ctx.fillStyle = pGrad;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Inner glowing gem
        ctx.beginPath();
        ctx.arc(0, -6, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.restore();
    }

    getGlyphForIcon(iconType) {
        switch (iconType) {
            case 'trophy': return '🏆';
            case 'headphones': return '🎧';
            case 'watch': return '⌚';
            case 'gift': return '🎁';
            case 'tag': return '🎟️';
            case 'speaker': return '🔊';
            case 'powerbank': return '🔋';
            case 'earphones': return '🎵';
            case 'case': return '📱';
            case 'cable': return '🔌';
            case 'sparkle': return '✨';
            default: return '💎';
        }
    }
}

window.LuckyWheel = LuckyWheel;
