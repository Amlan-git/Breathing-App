// DOM Elements
const vaseElement = document.querySelector('.vase');
const waterElement = document.querySelector('.water');
const rippleElement = document.querySelector('.ripple');
const statusElement = document.querySelector('.status');
const countdownElement = document.querySelector('.countdown-display');
const bpmValueElement = document.getElementById('bpm-value');
const timerRemainingElement = document.getElementById('timer-remaining');

// Input elements
const inhaleInput = document.getElementById('inhale');
const holdInput = document.getElementById('hold');
const exhaleInput = document.getElementById('exhale');
const applyPatternButton = document.getElementById('apply-pattern');
const timerButtons = document.querySelectorAll('.timer-btn');
const themeButtons = document.querySelectorAll('.theme-btn');
const playPauseButton = document.getElementById('play-pause');
const volumeControl = document.getElementById('volume');
const soundSelect = document.getElementById('sound-select');
const backgroundAudio = document.getElementById('background-audio');
const themeBackground = document.querySelector('.theme-background');

// Add to DOM Elements section
const startPauseBtn = document.getElementById('start-pause-btn');

// State variables
let breathingState = 'inhale';
let isBreathingActive = true;
let currentCount = 0;
let currentCountInterval = null;
let sessionTimer = null;
let sessionTimeRemaining = 0;
let breathingSettings = {
    inhale: 4,
    hold: 4,
    exhale: 4
};
let isTimerSet = false;

// Initialize the app
function initApp() {
    preloadAssets();
    loadPreferences();
    updateBPMDisplay();
    
    // Set initial button state
    const icon = startPauseBtn.querySelector('i');
    if (isBreathingActive) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
    
    // Initially disable start button
    updateStartButtonState();
    
    // Check if there's a saved timer
    if (sessionTimeRemaining > 0) {
        isTimerSet = true;
        updateStartButtonState();
    }
    
    startBreathingAnimation();
    setupEventListeners();
    
    // Apply the night theme by default
    document.body.classList.add('theme-night');
    
    // Add a welcome message
    console.log('Welcome to BreatheEasy App!');
}

// Set up event listeners
function setupEventListeners() {
    applyPatternButton.addEventListener('click', () => {
        updateBreathingSettings();
        savePreferences();
    });
    
    timerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const duration = parseInt(button.dataset.time);
            startSessionTimer(duration);
            isTimerSet = true;
            
            // Update start button state
            updateStartButtonState();
            
            // Highlight the selected button
            timerButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    playPauseButton.addEventListener('click', toggleAudio);
    volumeControl.addEventListener('input', () => {
        updateVolume();
        savePreferences();
    });
    soundSelect.addEventListener('change', () => {
        changeSound();
        savePreferences();
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Add event listener for start/pause button
    startPauseBtn.addEventListener('click', toggleBreathing);
}

// Update breathing settings from input fields
function updateBreathingSettings() {
    breathingSettings.inhale = parseInt(inhaleInput.value) || 4;
    breathingSettings.hold = parseInt(holdInput.value) || 4;
    breathingSettings.exhale = parseInt(exhaleInput.value) || 4;
    
    // Update CSS variables for animation timing
    document.documentElement.style.setProperty('--inhale-duration', `${breathingSettings.inhale}s`);
    document.documentElement.style.setProperty('--hold-duration', `${breathingSettings.hold}s`);
    document.documentElement.style.setProperty('--exhale-duration', `${breathingSettings.exhale}s`);
    
    // Reset the animation
    resetBreathingAnimation();
    updateBPMDisplay();
}

// Calculate and update BPM display
function updateBPMDisplay() {
    const totalCycleDuration = breathingSettings.inhale + breathingSettings.hold + breathingSettings.exhale;
    const bpm = (60 / totalCycleDuration).toFixed(1);
    bpmValueElement.textContent = bpm;
}

// Start the breathing animation cycle
function startBreathingAnimation() {
    if (!isBreathingActive) return;
    
    breathingState = 'inhale';
    updateBreathingUI();
    
    // Schedule the next states
    setTimeout(() => {
        if (!isBreathingActive) return;
        breathingState = 'hold';
        triggerRippleAnimation();
        updateBreathingUI();
        
        setTimeout(() => {
            if (!isBreathingActive) return;
            breathingState = 'exhale';
            triggerRippleAnimation();
            updateBreathingUI();
            
            setTimeout(() => {
                if (isBreathingActive) {
                    startBreathingAnimation();
                }
            }, breathingSettings.exhale * 1000);
        }, breathingSettings.hold * 1000);
    }, breathingSettings.inhale * 1000);
}

// Update UI based on current breathing state
function updateBreathingUI() {
    // Remove all state classes
    waterElement.classList.remove('inhale', 'hold', 'exhale');
    
    // Add current state class
    waterElement.classList.add(breathingState);
    
    // Update status text
    switch (breathingState) {
        case 'inhale':
            statusElement.textContent = 'Breathe in...';
            startCountdown(breathingSettings.inhale);
            break;
        case 'hold':
            statusElement.textContent = 'Hold...';
            startCountdown(breathingSettings.hold);
            break;
        case 'exhale':
            statusElement.textContent = 'Breathe out...';
            startCountdown(breathingSettings.exhale);
            break;
    }
}

// Start countdown for current breathing phase
function startCountdown(duration) {
    if (currentCountInterval) {
        clearInterval(currentCountInterval);
    }
    
    currentCount = duration;
    updateCountdownDisplay();
    
    currentCountInterval = setInterval(() => {
        currentCount--;
        updateCountdownDisplay();
        
        if (currentCount <= 0) {
            clearInterval(currentCountInterval);
        }
    }, 1000);
}

// Update the countdown display
function updateCountdownDisplay() {
    countdownElement.textContent = currentCount > 0 ? currentCount : '';
}

// Trigger ripple animation
function triggerRippleAnimation() {
    rippleElement.classList.remove('active');
    // Force reflow
    void rippleElement.offsetWidth;
    rippleElement.classList.add('active');
}

// Reset the breathing animation
function resetBreathingAnimation() {
    isBreathingActive = false;
    
    if (currentCountInterval) {
        clearInterval(currentCountInterval);
    }
    
    // Clear any existing timeouts
    setTimeout(() => {
        isBreathingActive = true;
        startBreathingAnimation();
    }, 100);
}

// Start session timer
function startSessionTimer(duration) {
    // Clear any existing timer
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }
    
    sessionTimeRemaining = duration;
    updateTimerDisplay();
    
    sessionTimer = setInterval(() => {
        sessionTimeRemaining--;
        updateTimerDisplay();
        
        if (sessionTimeRemaining <= 0) {
            clearInterval(sessionTimer);
            isBreathingActive = false;
            statusElement.textContent = 'Session complete';
            waterElement.classList.remove('inhale', 'hold', 'exhale');
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(sessionTimeRemaining / 60);
    const seconds = sessionTimeRemaining % 60;
    timerRemainingElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Audio controls
function toggleAudio() {
    const icon = playPauseButton.querySelector('i');
    
    if (backgroundAudio.paused) {
        backgroundAudio.play();
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        backgroundAudio.pause();
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

function updateVolume() {
    backgroundAudio.volume = volumeControl.value / 100;
}

function changeSound() {
    const soundType = soundSelect.value;
    backgroundAudio.src = `sounds/${soundType}.mp3`;
    
    // If audio was playing, continue playing the new sound
    if (!playPauseButton.querySelector('i').classList.contains('fa-play')) {
        backgroundAudio.play();
    }
}

// Add error handling for audio and image loading
function preloadAssets() {
    // Preload only the night theme image
    const img = new Image();
    img.src = 'images/night.jpg';
    
    // Preload audio files
    const sounds = ['ocean', 'rain', 'forest'];
    sounds.forEach(sound => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.src = `sounds/${sound}.mp3`;
    });
}

// Handle audio errors
backgroundAudio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    alert('There was an issue loading the audio. Please try a different sound.');
});

// Add service worker registration for offline capability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// Save user preferences to localStorage
function savePreferences() {
    const preferences = {
        inhale: breathingSettings.inhale,
        hold: breathingSettings.hold,
        exhale: breathingSettings.exhale,
        volume: volumeControl.value,
        sound: soundSelect.value,
        timerSet: isTimerSet,
        timeRemaining: sessionTimeRemaining
    };
    
    localStorage.setItem('breathingPreferences', JSON.stringify(preferences));
}

// Load user preferences from localStorage
function loadPreferences() {
    const savedPrefs = localStorage.getItem('breathingPreferences');
    if (savedPrefs) {
        try {
            const preferences = JSON.parse(savedPrefs);
            
            // Apply saved settings
            inhaleInput.value = preferences.inhale || 4;
            holdInput.value = preferences.hold || 4;
            exhaleInput.value = preferences.exhale || 4;
            
            // Apply audio settings
            if (preferences.volume) {
                volumeControl.value = preferences.volume;
                updateVolume();
            }
            
            if (preferences.sound) {
                soundSelect.value = preferences.sound;
                changeSound();
            }
            
            // Restore timer state if available
            if (preferences.timerSet) {
                isTimerSet = true;
                if (preferences.timeRemaining > 0) {
                    sessionTimeRemaining = preferences.timeRemaining;
                    updateTimerDisplay();
                }
            }
            
            // Update breathing settings
            updateBreathingSettings();
        } catch (e) {
            console.error('Error loading preferences:', e);
        }
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Space bar to start/pause session
    if (e.code === 'Space' && !e.target.matches('input, button, select')) {
        e.preventDefault();
        toggleBreathing();
    }
    
    // M key to mute/unmute
    if (e.code === 'KeyM' && !e.target.matches('input, button, select')) {
        toggleAudio();
    }
}

// Add new function to toggle breathing
function toggleBreathing() {
    // Check if timer is set
    if (!isTimerSet) {
        showNotification("Please set a duration first");
        return;
    }
    
    const icon = startPauseBtn.querySelector('i');
    
    if (isBreathingActive) {
        // Pause breathing
        isBreathingActive = false;
        statusElement.textContent = 'Paused';
        
        // Clear any existing intervals
        if (currentCountInterval) {
            clearInterval(currentCountInterval);
        }
        
        // Change icon to play
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    } else {
        // Resume breathing
        isBreathingActive = true;
        
        // Change icon to pause
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        
        // Restart animation
        startBreathingAnimation();
    }
}

// Add function to update start button state
function updateStartButtonState() {
    startPauseBtn.disabled = !isTimerSet;
    
    if (!isTimerSet) {
        startPauseBtn.classList.add('disabled');
        startPauseBtn.title = "Please set a duration first";
    } else {
        startPauseBtn.classList.remove('disabled');
        startPauseBtn.title = "Start or pause breathing exercise";
    }
}

// Add notification function
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', initApp); 