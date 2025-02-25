// DOM Elements
const app = {
    elements: {
        circle: null,
        breathingText: null,
        instruction: null,
        startBtn: null,
        pauseBtn: null,
        stopBtn: null,
        inhaleInput: null,
        holdInput: null,
        exhaleInput: null
    },

    state: {
        isRunning: false,
        isPaused: false,
        currentPhase: null,
        intervalId: null
    },

    init: function() {
        this.getElements();
        this.setupEventListeners();
        console.log('Breathing App Initialized');
    },

    getElements: function() {
        this.elements.circle = document.querySelector('.breathing-circle');
        this.elements.breathingText = document.querySelector('.breathing-text');
        this.elements.instruction = document.querySelector('.breathing-instruction');
        this.elements.startBtn = document.getElementById('start-btn');
        this.elements.pauseBtn = document.getElementById('pause-btn');
        this.elements.stopBtn = document.getElementById('stop-btn');
        this.elements.inhaleInput = document.getElementById('inhale-time');
        this.elements.holdInput = document.getElementById('hold-time');
        this.elements.exhaleInput = document.getElementById('exhale-time');
    },

    setupEventListeners: function() {
        this.elements.startBtn.addEventListener('click', () => this.startBreathing());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseBreathing());
        this.elements.stopBtn.addEventListener('click', () => this.stopBreathing());
    },

    getSettings: function() {
        return {
            inhaleTime: this.elements.inhaleInput.value * 1000,
            holdTime: this.elements.holdInput.value * 1000,
            exhaleTime: this.elements.exhaleInput.value * 1000
        };
    },

    startBreathing: function() {
        if (this.state.isRunning && this.state.isPaused) {
            this.state.isPaused = false;
            this.elements.pauseBtn.textContent = 'Pause';
            return;
        }

        this.state.isRunning = true;
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.stopBtn.disabled = false;
        
        this.runBreathingCycle();
    },

    pauseBreathing: function() {
        this.state.isPaused = !this.state.isPaused;
        this.elements.pauseBtn.textContent = this.state.isPaused ? 'Resume' : 'Pause';
        if (this.state.isPaused) {
            this.elements.circle.style.animationPlayState = 'paused';
        } else {
            this.elements.circle.style.animationPlayState = 'running';
        }
    },

    stopBreathing: function() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        clearTimeout(this.state.intervalId);
        
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.stopBtn.disabled = true;
        
        // Remove all animation classes
        this.elements.circle.classList.remove('inhaling', 'holding', 'exhaling');
        this.elements.breathingText.textContent = 'Breathe';
        this.elements.instruction.textContent = 'Get ready...';
    },

    runBreathingCycle: async function() {
        if (!this.state.isRunning) return;

        const settings = this.getSettings();
        
        // Inhale
        this.elements.breathingText.textContent = 'Inhale';
        this.elements.instruction.textContent = 'Breathe in slowly';
        this.elements.circle.classList.remove('holding', 'exhaling');
        this.elements.circle.classList.add('inhaling');
        this.elements.circle.style.animationDuration = `${settings.inhaleTime}ms`;
        await this.wait(settings.inhaleTime);
        if (!this.state.isRunning) return;

        // Hold
        this.elements.breathingText.textContent = 'Hold';
        this.elements.instruction.textContent = 'Hold your breath';
        this.elements.circle.classList.remove('inhaling', 'exhaling');
        this.elements.circle.classList.add('holding');
        await this.wait(settings.holdTime);
        if (!this.state.isRunning) return;

        // Exhale
        this.elements.breathingText.textContent = 'Exhale';
        this.elements.instruction.textContent = 'Breathe out slowly';
        this.elements.circle.classList.remove('inhaling', 'holding');
        this.elements.circle.classList.add('exhaling');
        this.elements.circle.style.animationDuration = `${settings.exhaleTime}ms`;
        await this.wait(settings.exhaleTime);
        if (!this.state.isRunning) return;

        // Continue cycle
        this.runBreathingCycle();
    },

    wait: function(ms) {
        return new Promise(resolve => {
            const check = () => {
                if (!this.state.isPaused) {
                    this.state.intervalId = setTimeout(resolve, ms);
                } else {
                    this.state.intervalId = setTimeout(check, 100);
                }
            };
            check();
        });
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => app.init()); 