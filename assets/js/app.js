/**
 * MAIN LUCKY DRAW APPLICATION CONTROLLER
 * Orchestrates participation flow, validation, wheel mechanics,
 * countdown timer, modals, accordions, and animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State
    const state = {
        participant: JSON.parse(localStorage.getItem('aura_participant') || 'null'),
        hasSpun: localStorage.getItem('aura_has_spun') === 'true',
        lastPrizeWon: JSON.parse(localStorage.getItem('aura_last_prize') || 'null'),
        isCampaignClosed: false,
        forcedPrizeId: null // Used by test controls
    };

    // 2. DOM Elements
    const elements = {
        navHeader: document.getElementById('mainHeader'),
        navToggle: document.getElementById('navToggle'),
        navMenu: document.getElementById('navMenu'),
        soundToggleBtn: document.getElementById('soundToggleBtn'),
        soundStatusText: document.getElementById('soundStatusText'),
        soundIcon: document.getElementById('soundIcon'),
        
        // Countdown
        daysEl: document.getElementById('cdDays'),
        hoursEl: document.getElementById('cdHours'),
        minutesEl: document.getElementById('cdMinutes'),
        secondsEl: document.getElementById('cdSeconds'),
        campaignStatusBadge: document.getElementById('campaignStatusBadge'),

        // Participation Form
        participationForm: document.getElementById('participationForm'),
        fullNameInput: document.getElementById('fullName'),
        mobileInput: document.getElementById('mobileNumber'),
        couponInput: document.getElementById('couponCode'),
        termsCheckbox: document.getElementById('termsAgreement'),
        submitBtn: document.getElementById('submitBtn'),
        formAlert: document.getElementById('formAlert'),

        // Lucky Draw Game
        drawNowBtn: document.getElementById('drawNowBtn'),
        drawHubStatus: document.getElementById('drawHubStatus'),
        participantBadge: document.getElementById('participantBadge'),
        participantNameDisplay: document.getElementById('participantNameDisplay'),
        ticketNumberDisplay: document.getElementById('ticketNumberDisplay'),
        gameNotice: document.getElementById('gameNotice'),

        // Result Modal
        resultModal: document.getElementById('resultModal'),
        resultModalBackdrop: document.getElementById('resultModalBackdrop'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        modalWinnerState: document.getElementById('modalWinnerState'),
        modalNonWinnerState: document.getElementById('modalNonWinnerState'),
        modalPrizeTitle: document.getElementById('modalPrizeTitle'),
        modalPrizeBadge: document.getElementById('modalPrizeBadge'),
        modalPrizeDesc: document.getElementById('modalPrizeDesc'),
        modalPrizeIcon: document.getElementById('modalPrizeIcon'),
        modalClaimCode: document.getElementById('modalClaimCode'),
        btnClaimPrize: document.getElementById('btnClaimPrize'),
        btnBackHome: document.getElementById('btnBackHome'),
        btnNonWinnerHome: document.getElementById('btnNonWinnerHome'),

        // Claim Voucher Dialog
        claimModal: document.getElementById('claimModal'),
        claimVoucherCode: document.getElementById('claimVoucherCode'),
        claimParticipantName: document.getElementById('claimParticipantName'),
        claimPrizeName: document.getElementById('claimPrizeName'),
        btnCopyClaimCode: document.getElementById('btnCopyClaimCode'),
        btnCloseClaimModal: document.getElementById('btnCloseClaimModal'),

        // Winners Section
        winnersGrid: document.getElementById('winnersGrid'),
        winnersFallback: document.getElementById('winnersFallback'),
        btnToggleWinnersState: document.getElementById('btnToggleWinnersState'),

        // Accordions
        faqItems: document.querySelectorAll('.faq-item'),
        termsItems: document.querySelectorAll('.terms-item'),

        // Demo Drawer
        demoDrawer: document.getElementById('demoDrawer'),
        btnToggleDemo: document.getElementById('btnToggleDemo'),
        btnCloseDemo: document.getElementById('btnCloseDemo')
    };

    // 3. Initialize Background Canvas Particles
    initBackgroundParticles();

    // 4. Initialize Sound Toggle
    updateSoundUI();
    if (elements.soundToggleBtn) {
        elements.soundToggleBtn.addEventListener('click', () => {
            const isEnabled = window.soundEngine.toggle();
            updateSoundUI();
        });
    }

    function updateSoundUI() {
        const enabled = window.soundEngine ? window.soundEngine.enabled : true;
        if (elements.soundIcon) {
            elements.soundIcon.textContent = enabled ? '🔊' : '🔇';
        }
        if (elements.soundStatusText) {
            elements.soundStatusText.textContent = enabled ? 'Sound On' : 'Sound Off';
        }
    }

    // 5. Header Sticky Scroll & Mobile Navigation
    window.addEventListener('scroll', () => {
        if (elements.navHeader) {
            if (window.scrollY > 40) {
                elements.navHeader.classList.add('scrolled');
            } else {
                elements.navHeader.classList.remove('scrolled');
            }
        }
    });

    if (elements.navToggle && elements.navMenu) {
        elements.navToggle.addEventListener('click', () => {
            elements.navMenu.classList.toggle('active');
            elements.navToggle.classList.toggle('open');
        });

        // Close mobile menu on link click
        elements.navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                elements.navMenu.classList.remove('active');
                elements.navToggle.classList.remove('open');
            });
        });
    }

    // 6. Countdown Timer Logic
    initCountdownTimer();

    function initCountdownTimer() {
        const targetDate = new Date(CAMPAIGN_CONFIG.endDate).getTime();

        function updateClock() {
            const now = Date.now();
            const diff = targetDate - now;

            if (diff <= 0 || state.isCampaignClosed) {
                // Campaign Closed State
                if (elements.daysEl) elements.daysEl.textContent = '00';
                if (elements.hoursEl) elements.hoursEl.textContent = '00';
                if (elements.minutesEl) elements.minutesEl.textContent = '00';
                if (elements.secondsEl) elements.secondsEl.textContent = '00';

                if (elements.campaignStatusBadge) {
                    elements.campaignStatusBadge.innerHTML = '<span class="status-dot closed"></span> CAMPAIGN CLOSED';
                    elements.campaignStatusBadge.classList.add('badge-closed');
                }

                state.isCampaignClosed = true;
                disableParticipationAndDraw("Campaign has ended. Thank you for your interest!");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (elements.daysEl) elements.daysEl.textContent = String(days).padStart(2, '0');
            if (elements.hoursEl) elements.hoursEl.textContent = String(hours).padStart(2, '0');
            if (elements.minutesEl) elements.minutesEl.textContent = String(minutes).padStart(2, '0');
            if (elements.secondsEl) elements.secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        updateClock();
        setInterval(updateClock, 1000);
    }

    function disableParticipationAndDraw(reason) {
        if (elements.submitBtn) {
            elements.submitBtn.disabled = true;
            elements.submitBtn.textContent = 'CAMPAIGN CLOSED';
        }
        if (elements.drawNowBtn) {
            elements.drawNowBtn.disabled = true;
            elements.drawNowBtn.classList.add('disabled-btn');
        }
        if (elements.drawHubStatus) {
            elements.drawHubStatus.textContent = 'CAMPAIGN CLOSED';
        }
        if (elements.gameNotice) {
            elements.gameNotice.textContent = reason;
            elements.gameNotice.style.display = 'block';
        }
    }

    // 7. Initialize Wheel Engine
    let luckyWheel = null;
    const canvasElement = document.getElementById('luckyWheelCanvas');
    if (canvasElement) {
        luckyWheel = new LuckyWheel('luckyWheelCanvas', {
            prizes: PRIZE_CONFIG,
            onSpinStart: (prize) => {
                if (elements.drawNowBtn) {
                    elements.drawNowBtn.disabled = true;
                    elements.drawNowBtn.classList.add('spinning');
                }
                if (elements.drawHubStatus) {
                    elements.drawHubStatus.textContent = 'SPINNING...';
                }
                if (elements.gameNotice) {
                    elements.gameNotice.textContent = 'The draw is in progress. Good luck!';
                }
            },
            onSpinComplete: (prize) => {
                state.hasSpun = true;
                state.lastPrizeWon = prize;
                localStorage.setItem('aura_has_spun', 'true');
                localStorage.setItem('aura_last_prize', JSON.stringify(prize));

                if (elements.drawNowBtn) {
                    elements.drawNowBtn.classList.remove('spinning');
                    elements.drawNowBtn.disabled = true;
                    elements.drawNowBtn.textContent = 'DRAW COMPLETED';
                }
                if (elements.drawHubStatus) {
                    elements.drawHubStatus.textContent = 'COMPLETE';
                }

                // Show Result Modal with Suspense
                showResultModal(prize);
            }
        });
    }

    // 8. Update Participant Display Status on Load
    updateParticipantStatusUI();

    function updateParticipantStatusUI() {
        if (state.participant) {
            if (elements.participantBadge) {
                elements.participantBadge.style.display = 'inline-flex';
            }
            if (elements.participantNameDisplay) {
                elements.participantNameDisplay.textContent = state.participant.fullName;
            }
            if (elements.ticketNumberDisplay) {
                elements.ticketNumberDisplay.textContent = state.participant.ticketId;
            }
            if (elements.gameNotice) {
                if (state.hasSpun) {
                    elements.gameNotice.textContent = 'You have already used your campaign draw entry. View your result below.';
                } else {
                    elements.gameNotice.textContent = 'Your entry is verified! Click "DRAW NOW" in the center of the wheel to play.';
                }
            }

            if (state.hasSpun && elements.drawNowBtn) {
                elements.drawNowBtn.disabled = true;
                elements.drawNowBtn.textContent = 'DRAW COMPLETED';
            }
        } else {
            if (elements.participantBadge) {
                elements.participantBadge.style.display = 'none';
            }
            if (elements.gameNotice) {
                elements.gameNotice.textContent = 'Please enter your details in the participation form above to unlock the lucky draw.';
            }
        }
    }

    // 9. Participation Form Validation & Submission
    if (elements.participationForm) {
        elements.participationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (window.soundEngine) window.soundEngine.playClick();

            if (state.isCampaignClosed) {
                showFormAlert('The campaign has closed. Thank you for your interest!', 'error');
                return;
            }

            // Read Inputs
            const name = elements.fullNameInput.value.trim();
            const mobile = elements.mobileInput.value.trim();
            const coupon = elements.couponInput ? elements.couponInput.value.trim().toUpperCase() : '';
            const termsAgreed = elements.termsCheckbox.checked;

            // Reset field error styles
            clearInputErrors();

            // Validate Fields
            let hasError = false;

            // Name Validation (At least 2 letters)
            if (!name || name.length < 2) {
                setInputError(elements.fullNameInput, 'Please enter your full name (minimum 2 characters).');
                hasError = true;
            }

            // Mobile Validation (10 digits)
            const cleanMobile = mobile.replace(/[^0-9]/g, '');
            if (!cleanMobile || cleanMobile.length < 10) {
                setInputError(elements.mobileInput, 'Please enter a valid 10-digit mobile number.');
                hasError = true;
            }

            // Optional Coupon Validation (if entered, check against config)
            if (coupon && CAMPAIGN_CONFIG.requireEntryCode) {
                if (!CAMPAIGN_CONFIG.validEntryCodes.includes(coupon)) {
                    setInputError(elements.couponInput, `Invalid entry code. Valid codes include: ${CAMPAIGN_CONFIG.validEntryCodes.slice(0, 2).join(', ')}`);
                    hasError = true;
                }
            }

            // Terms Validation
            if (!termsAgreed) {
                const termsGroup = elements.termsCheckbox.closest('.checkbox-wrapper') || elements.termsCheckbox;
                termsGroup.classList.add('input-error-border');
                showFormAlert('You must agree to the Terms & Conditions and Privacy Policy to participate.', 'error');
                hasError = true;
            }

            if (hasError) {
                return;
            }

            // Generate Unique Participant Ticket ID
            const ticketId = 'AURA-' + Math.floor(100000 + Math.random() * 900000);
            const participantData = {
                fullName: name,
                mobile: cleanMobile,
                coupon: coupon,
                ticketId: ticketId,
                registeredAt: new Date().toISOString()
            };

            // Save to State & LocalStorage
            state.participant = participantData;
            localStorage.setItem('aura_participant', JSON.stringify(participantData));

            // Sync with SQLite Database API
            fetch('/api/participate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(participantData)
            }).then(r => r.json()).then(res => {
                if (res && res.ticketId) {
                    participantData.ticketId = res.ticketId;
                    state.participant.ticketId = res.ticketId;
                    localStorage.setItem('aura_participant', JSON.stringify(state.participant));
                    if (elements.ticketNumberDisplay) {
                        elements.ticketNumberDisplay.textContent = res.ticketId;
                    }
                }
            }).catch(e => console.warn('Database lead sync warning:', e));

            // Visual feedback on submit button
            elements.submitBtn.disabled = true;
            elements.submitBtn.innerHTML = '<span class="spinner-inline"></span> GENERATING ENTRY PASS...';

            setTimeout(() => {
                elements.submitBtn.disabled = false;
                elements.submitBtn.textContent = 'PARTICIPATE NOW';
                showFormAlert(`Registration successful! Welcome, ${name}. Your ticket #${ticketId} has been unlocked.`, 'success');

                // Update UI badge
                updateParticipantStatusUI();

                // Smooth scroll down to the Lucky Draw Game
                const gameSection = document.getElementById('drawGame');
                if (gameSection) {
                    gameSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                // Celebrate ticket unlock with micro sound
                if (window.soundEngine) {
                    window.soundEngine.playWinFanfare();
                }
            }, 800);
        });
    }

    function setInputError(inputEl, message) {
        if (!inputEl) return;
        inputEl.classList.add('error');
        const errorMsgEl = inputEl.parentElement.querySelector('.field-error');
        if (errorMsgEl) {
            errorMsgEl.textContent = message;
            errorMsgEl.style.display = 'block';
        }
    }

    function clearInputErrors() {
        document.querySelectorAll('.input-field.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.field-error').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        if (elements.formAlert) {
            elements.formAlert.style.display = 'none';
            elements.formAlert.className = 'form-alert';
        }
    }

    function showFormAlert(message, type = 'error') {
        if (!elements.formAlert) return;
        elements.formAlert.textContent = message;
        elements.formAlert.className = `form-alert alert-${type}`;
        elements.formAlert.style.display = 'flex';
    }

    // 10. Center DRAW NOW Button Handler
    if (elements.drawNowBtn) {
        elements.drawNowBtn.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();

            if (state.isCampaignClosed) {
                alert("The campaign has ended. Thank you for your participation!");
                return;
            }

            // Ensure user has registered first
            if (!state.participant) {
                // Not registered yet -> alert and scroll to participation section
                const formSection = document.getElementById('participate');
                if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const card = formSection.querySelector('.form-card');
                    if (card) {
                        card.classList.add('pulse-highlight');
                        setTimeout(() => card.classList.remove('pulse-highlight'), 1800);
                    }
                    showFormAlert('Please complete your registration first to unlock your lucky draw entry!', 'error');
                }
                return;
            }

            // Ensure user hasn't already spun (single entry rule)
            if (state.hasSpun && CAMPAIGN_CONFIG.singleEntryPerUser) {
                if (state.lastPrizeWon) {
                    showResultModal(state.lastPrizeWon);
                } else {
                    alert("You have already used your lucky draw entry. Thank you for participating!");
                }
                return;
            }

            // Start Wheel Spin
            if (luckyWheel) {
                luckyWheel.spin(state.forcedPrizeId);
                state.forcedPrizeId = null; // Reset forced state after use
            }
        });
    }

    // 11. Result Modal Presentation
    function showResultModal(prize) {
        if (!elements.resultModal) return;

        const isWinner = prize.isWinner;

        if (isWinner) {
            // WINNER STATE
            if (elements.modalWinnerState) elements.modalWinnerState.style.display = 'block';
            if (elements.modalNonWinnerState) elements.modalNonWinnerState.style.display = 'none';

            if (elements.modalPrizeTitle) elements.modalPrizeTitle.textContent = prize.name;
            if (elements.modalPrizeBadge) {
                elements.modalPrizeBadge.textContent = prize.badge || 'Official Prize';
                elements.modalPrizeBadge.style.background = prize.glowColor || 'rgba(255, 184, 0, 0.2)';
                elements.modalPrizeBadge.style.borderColor = prize.accentColor || '#FFB800';
            }
            if (elements.modalPrizeDesc) {
                elements.modalPrizeDesc.textContent = prize.congratulationText || prize.description;
            }
            if (elements.modalPrizeIcon) {
                elements.modalPrizeIcon.textContent = luckyWheel ? luckyWheel.getGlyphForIcon(prize.icon) : '🎁';
            }
            const claimCode = 'WIN-' + Math.floor(1000 + Math.random() * 9000) + '-' + prize.tier.toUpperCase();
            if (elements.modalClaimCode) {
                elements.modalClaimCode.textContent = claimCode;
            }

            // Sync Prize Won with SQLite Database
            if (state.participant && state.participant.ticketId) {
                fetch('/api/record-win', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ticketId: state.participant.ticketId,
                        prizeName: prize.name,
                        prizeTier: prize.tier,
                        claimCode: claimCode
                    })
                }).catch(e => console.warn('Record win sync warning:', e));
            }

            // Play celebratory audio & burst confetti
            if (window.soundEngine) {
                window.soundEngine.playWinFanfare();
            }
            if (window.confettiEngine) {
                window.confettiEngine.burst({ count: 280 });
                // Second mini burst for extra festive luxury
                setTimeout(() => {
                    window.confettiEngine.burst({ count: 180, x: window.innerWidth * 0.3 });
                }, 400);
                setTimeout(() => {
                    window.confettiEngine.burst({ count: 180, x: window.innerWidth * 0.7 });
                }, 750);
            }
        } else {
            // NON-WINNER STATE
            if (elements.modalWinnerState) elements.modalWinnerState.style.display = 'none';
            if (elements.modalNonWinnerState) elements.modalNonWinnerState.style.display = 'block';

            if (window.soundEngine) {
                window.soundEngine.playNonWinChime();
            }
        }

        // Open Modal
        elements.resultModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeResultModal() {
        if (!elements.resultModal) return;
        elements.resultModal.classList.remove('active');
        document.body.style.overflow = '';
        if (window.confettiEngine) {
            window.confettiEngine.clear();
        }
    }

    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', closeResultModal);
    }
    if (elements.resultModalBackdrop) {
        elements.resultModalBackdrop.addEventListener('click', closeResultModal);
    }
    if (elements.btnBackHome) {
        elements.btnBackHome.addEventListener('click', () => {
            closeResultModal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    if (elements.btnNonWinnerHome) {
        elements.btnNonWinnerHome.addEventListener('click', () => {
            closeResultModal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 12. Claim Voucher Dialog Logic
    if (elements.btnClaimPrize) {
        elements.btnClaimPrize.addEventListener('click', () => {
            closeResultModal();
            openClaimDialog();
        });
    }

    function openClaimDialog() {
        if (!elements.claimModal) return;

        const code = (elements.modalClaimCode && elements.modalClaimCode.textContent) || 'WIN-AURA-2026';
        const name = (state.participant && state.participant.fullName) || 'Lucky Participant';
        const prizeName = (state.lastPrizeWon && state.lastPrizeWon.name) || 'Official Campaign Reward';

        if (elements.claimVoucherCode) elements.claimVoucherCode.textContent = code;
        if (elements.claimParticipantName) elements.claimParticipantName.textContent = name;
        if (elements.claimPrizeName) elements.claimPrizeName.textContent = prizeName;

        elements.claimModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (window.soundEngine) window.soundEngine.playClick();
    }

    if (elements.btnCloseClaimModal) {
        elements.btnCloseClaimModal.addEventListener('click', () => {
            elements.claimModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (elements.btnCopyClaimCode) {
        elements.btnCopyClaimCode.addEventListener('click', () => {
            const code = elements.claimVoucherCode ? elements.claimVoucherCode.textContent : '';
            if (navigator.clipboard && code) {
                navigator.clipboard.writeText(code).then(() => {
                    const originalText = elements.btnCopyClaimCode.textContent;
                    elements.btnCopyClaimCode.textContent = 'COPIED TO CLIPBOARD! ✓';
                    setTimeout(() => {
                        elements.btnCopyClaimCode.textContent = originalText;
                    }, 2200);
                });
            }
        });
    }

    // 13. Populate Prizes Showcase Section
    renderPrizesShowcase();

    function renderPrizesShowcase() {
        const container = document.getElementById('prizesGrid');
        if (!container) return;

        container.innerHTML = '';
        PRIZE_CONFIG.forEach(prize => {
            const card = document.createElement('div');
            card.className = `prize-card tier-${prize.tier}`;
            
            const glyph = luckyWheel ? luckyWheel.getGlyphForIcon(prize.icon) : '💎';

            card.innerHTML = `
                <div class="prize-card-badge" style="border-color:${prize.accentColor}; color:${prize.accentColor};">
                    ${prize.badge || prize.category}
                </div>
                <div class="prize-visual-box" style="background: radial-gradient(circle, ${prize.glowColor} 0%, transparent 70%);">
                    <div class="prize-glyph-icon">${glyph}</div>
                </div>
                <div class="prize-card-content">
                    <div class="prize-value-tag">${prize.value} Value</div>
                    <h3 class="prize-card-title">${prize.name}</h3>
                    <p class="prize-card-desc">${prize.description}</p>
                </div>
                <div class="prize-card-footer">
                    <span class="prize-category-tag">${prize.category}</span>
                    <span class="prize-status-indicator">
                        <span class="dot-pulse" style="background:${prize.accentColor};"></span> Verified
                    </span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // 14. Render Winners Section & Live Updates
    renderWinnersShowcase();

    function renderWinnersShowcase(showFallback = false) {
        if (!elements.winnersGrid || !elements.winnersFallback) return;

        if (showFallback) {
            elements.winnersGrid.style.display = 'none';
            elements.winnersFallback.style.display = 'block';
            return;
        }

        elements.winnersGrid.style.display = 'grid';
        elements.winnersFallback.style.display = 'none';
        elements.winnersGrid.innerHTML = '';

        RECENT_WINNERS_DATA.forEach(w => {
            const wCard = document.createElement('div');
            wCard.className = `winner-card tier-${w.tier || 'special'}`;
            wCard.innerHTML = `
                <div class="winner-card-header">
                    <div class="winner-avatar">${w.name.charAt(0)}</div>
                    <div class="winner-meta">
                        <div class="winner-name">${w.name}</div>
                        <div class="winner-location">📍 ${w.city}</div>
                    </div>
                </div>
                <div class="winner-prize-banner">
                    <span class="winner-prize-label">Won:</span>
                    <span class="winner-prize-name">${w.prize}</span>
                </div>
                <div class="winner-timestamp">⏱️ ${w.time}</div>
            `;
            elements.winnersGrid.appendChild(wCard);
        });
    }

    if (elements.btnToggleWinnersState) {
        let isFallback = false;
        elements.btnToggleWinnersState.addEventListener('click', () => {
            isFallback = !isFallback;
            renderWinnersShowcase(isFallback);
            elements.btnToggleWinnersState.textContent = isFallback ? 'View Sample Winner Feed' : 'Simulate Empty / Pre-Draw State';
        });
    }

    // 15. Accordions Logic (Terms & Conditions and FAQs)
    initAccordions();

    function initAccordions() {
        const allAccordionTriggers = document.querySelectorAll('.accordion-trigger');
        allAccordionTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playClick();
                const item = trigger.closest('.accordion-item');
                const isOpen = item.classList.contains('active');

                // Optional: close other accordions in the same container
                const parentContainer = item.parentElement;
                parentContainer.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                        const btn = activeItem.querySelector('.accordion-trigger');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    }
                });

                if (isOpen) {
                    item.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // 16. Demo / Test Controls Drawer Logic
    initDemoControls();

    function initDemoControls() {
        if (!elements.btnToggleDemo || !elements.demoDrawer) return;

        elements.btnToggleDemo.addEventListener('click', () => {
            elements.demoDrawer.classList.toggle('active');
            if (window.soundEngine) window.soundEngine.playClick();
        });

        if (elements.btnCloseDemo) {
            elements.btnCloseDemo.addEventListener('click', () => {
                elements.demoDrawer.classList.remove('active');
            });
        }

        // Test buttons
        document.querySelectorAll('[data-force-prize]').forEach(btn => {
            btn.addEventListener('click', () => {
                const prizeId = btn.getAttribute('data-force-prize');
                state.forcedPrizeId = prizeId;
                state.hasSpun = false; // Allow spin
                localStorage.removeItem('aura_has_spun');
                updateParticipantStatusUI();

                if (!state.participant) {
                    // Seed dummy participant for quick test
                    state.participant = {
                        fullName: "Tester VIP",
                        mobile: "9988776655",
                        ticketId: "DEMO-9999",
                        registeredAt: new Date().toISOString()
                    };
                    localStorage.setItem('aura_participant', JSON.stringify(state.participant));
                    updateParticipantStatusUI();
                }

                alert(`Next spin forced to: ${prizeId.toUpperCase()}. Now click DRAW NOW on the wheel!`);
                const wheelSection = document.getElementById('drawGame');
                if (wheelSection) {
                    wheelSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                elements.demoDrawer.classList.remove('active');
            });
        });

        const btnTestConfetti = document.getElementById('btnTestConfetti');
        if (btnTestConfetti) {
            btnTestConfetti.addEventListener('click', () => {
                if (window.confettiEngine) {
                    window.confettiEngine.burst({ count: 250 });
                }
                if (window.soundEngine) {
                    window.soundEngine.playWinFanfare();
                }
            });
        }

        const btnResetParticipant = document.getElementById('btnResetParticipant');
        if (btnResetParticipant) {
            btnResetParticipant.addEventListener('click', () => {
                localStorage.removeItem('aura_participant');
                localStorage.removeItem('aura_has_spun');
                localStorage.removeItem('aura_last_prize');
                state.participant = null;
                state.hasSpun = false;
                state.lastPrizeWon = null;
                updateParticipantStatusUI();
                if (elements.participationForm) {
                    elements.participationForm.reset();
                }
                clearInputErrors();
                alert('Participant state has been reset. You can now register as a fresh participant!');
            });
        }

        const btnToggleCampaignClosed = document.getElementById('btnToggleCampaignClosed');
        if (btnToggleCampaignClosed) {
            btnToggleCampaignClosed.addEventListener('click', () => {
                state.isCampaignClosed = !state.isCampaignClosed;
                if (state.isCampaignClosed) {
                    disableParticipationAndDraw("Campaign closed via test controller.");
                    btnToggleCampaignClosed.textContent = "Re-Open Campaign";
                } else {
                    location.reload();
                }
            });
        }
    }

    // 17. Subtle Background Canvas Particle Simulation
    function initBackgroundParticles() {
        const bgCanvas = document.getElementById('bgParticlesCanvas');
        if (!bgCanvas) return;

        const ctx = bgCanvas.getContext('2d');
        let width, height;
        let particles = [];
        const numParticles = window.innerWidth > 768 ? 45 : 22;

        function resize() {
            width = bgCanvas.width = window.innerWidth;
            height = bgCanvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 1 + Math.random() * 2.5,
                color: Math.random() > 0.5 ? 'rgba(0, 242, 254, ' : 'rgba(255, 184, 0, ',
                alpha: 0.15 + Math.random() * 0.45,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4
            });
        }

        function renderBg() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.fill();
            }
            requestAnimationFrame(renderBg);
        }
        renderBg();
    }
});
