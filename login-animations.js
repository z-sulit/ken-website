const { animate, stagger, utils } = anime;


const screenLoading = document.getElementById('screen-loading');
const screenStatus = document.getElementById('screen-status');
const screenLogin = document.getElementById('screen-login');
const irisOverlay = document.getElementById('irisOverlay');
const bgMusic = document.getElementById('bgMusic');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const loginForm = document.getElementById('loginForm');
const shapesBox = document.getElementById('shapesContainer');


const LOADING_DURATION = 10000;  // 10 seconds
const STATUS_DURATION = 10000;  // 10 seconds
const IRIS_DURATION = 800;    // 0.8 seconds

const STATUS_MESSAGES = [
    'Kenny loading docs',
    'Kenny showering',
    'Kenny taking a dump',
    'Kenny is building',
    'Kenny is dressing',
    'Kenny is admiring her from afar',
    'Kenny is scribbling',
    'Kenny may take a while',
    'Starting\u2026'
];

//the helping hands

function switchScreen(hideEl, showEl) {
    hideEl.classList.remove('active');
    showEl.classList.add('active');
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

//music interact
function startMusic() {
    bgMusic.volume = 0.5;
    sessionStorage.setItem('gundamMusicStarted', 'true');
    sessionStorage.setItem('gundamMusicTime', '0');
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Autoplay blocked — start on first user click
            document.addEventListener('click', function handler() {
                bgMusic.play();
                document.removeEventListener('click', handler);
            });
        });
    }

    setInterval(() => {
        if (!bgMusic.paused) {
            sessionStorage.setItem('gundamMusicTime', bgMusic.currentTime);
        }
    }, 250);
}


window.addEventListener('beforeunload', () => {
    if (bgMusic) {
        sessionStorage.setItem('gundamMusicTime', bgMusic.currentTime);
    }
});

//phase1

function startPhase1() {
    startMusic();


    animate('.square', {
        rotate: 360,
        loop: true,
        duration: 1200,
        ease: 'inOutExpo',
    });


    const loadingText = document.querySelector('.loading-text');
    let dots = 0;
    const dotsInterval = setInterval(() => {
        dots = (dots + 1) % 6;
        loadingText.textContent = 'Loading' + '.'.repeat(dots);
    }, 400);

    // After 7 seconds → go to phase 2
    setTimeout(() => {
        clearInterval(dotsInterval);
        switchScreen(screenLoading, screenStatus);
        startPhase2();
    }, LOADING_DURATION);
}

//phase2

function createShapes(count) {
    for (let i = 0; i < count; i++) {
        const shape = document.createElement('div');
        shape.classList.add('shape');
        shape.style.left = randRange(5, 95) + '%';
        shape.style.top = randRange(5, 95) + '%';
        shapesBox.appendChild(shape);
    }
}

function animateShapes() {
    document.querySelectorAll('.shape').forEach((shape) => {
        const loop = () => {
            animate(shape, {
                x: randRange(-120, 120),
                y: randRange(-120, 120),
                rotate: randRange(-180, 180),
                duration: randRange(600, 1400),
                ease: 'inOutQuad',
                onComplete: loop,
                composition: 'blend',
            });
        };
        loop();
    });
}

function startPhase2() {

    createShapes(40);
    animateShapes();


    const interval = STATUS_DURATION / STATUS_MESSAGES.length;
    let messageIndex = 0;

    function showNextMessage() {
        if (messageIndex >= STATUS_MESSAGES.length) return;

        const msg = STATUS_MESSAGES[messageIndex];
        statusText.textContent = msg;
        progressBar.style.width = ((messageIndex + 1) / STATUS_MESSAGES.length * 100) + '%';
        messageIndex++;

        if (messageIndex < STATUS_MESSAGES.length) {
            setTimeout(showNextMessage, interval);
        }
    }

    showNextMessage();

    // After 10 seconds  show login
    setTimeout(() => {
        switchScreen(screenStatus, screenLogin);
        // Show playlist panel
        const playlistPanel = document.querySelector('.playlist-panel');
        if (playlistPanel) {
            playlistPanel.style.display = '';
            playlistPanel.classList.add('open');
        }
    }, STATUS_DURATION);
}

//phase3

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    //PASSSS
    const VALID_USER = 'KennyAckerjuts';
    const VALID_PASS = 'ilovebey';

    if (!username || !password) {
        document.getElementById('loginError').textContent = 'ALL FIELDS REQUIRED, PILOT.';
        return;
    }

    if (username !== VALID_USER || password !== VALID_PASS) {
        document.getElementById('loginError').textContent = 'ACCESS DENIED. INVALID CREDENTIALS.';
        return;
    }

    triggerIrisClose();
});

function triggerIrisClose() {
    // Show the overlay
    irisOverlay.classList.add('active');
    irisOverlay.style.opacity = '1';
    animate(irisOverlay, {
        clipPath: ['circle(150% at 50% 50%)', 'circle(0% at 50% 50%)'],
        duration: IRIS_DURATION,
        ease: 'inOutQuad',
        onComplete: () => {

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 400);
        }
    });
}


const screenStart = document.getElementById('screen-start');
const loginBgVideo = document.getElementById('loginBgVideo');
const blackMask = document.getElementById('blackMask');

screenStart.addEventListener('click', () => {
    switchScreen(screenStart, screenLoading);
    startPhase1();

    // Fade out black mask at 17.5s, video starts at 18s
    setTimeout(() => {
        blackMask.classList.add('fade-out');
    }, 17500);

    setTimeout(() => {
        loginBgVideo.play();
    }, 18000);
});
