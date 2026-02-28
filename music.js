
(function () {
    const STORAGE_KEY = 'gundamMusicTime';
    const MUSIC_FLAG = 'gundamMusicStarted';
    const VIDEO_KEY = 'gundamVideoTime';
    const VOLUME_KEY = 'gundamVolume';

    let audio = null;
    if (sessionStorage.getItem(MUSIC_FLAG)) {
        audio = document.createElement('audio');
        audio.id = 'bgMusicPersist';
        audio.loop = true;
        audio.src = 'Music/RX-0.mp3';
        document.body.appendChild(audio);

        const savedVolume = parseFloat(sessionStorage.getItem(VOLUME_KEY));
        audio.volume = isNaN(savedVolume) ? 0.5 : savedVolume;

        const savedTime = parseFloat(sessionStorage.getItem(STORAGE_KEY)) || 0;
        audio.currentTime = savedTime;
        audio.play().catch(() => {
            document.addEventListener('click', function handler() {
                audio.currentTime = parseFloat(sessionStorage.getItem(STORAGE_KEY)) || 0;
                audio.play();
                document.removeEventListener('click', handler);
            });
        });

        setInterval(() => {
            if (!audio.paused) {
                sessionStorage.setItem(STORAGE_KEY, audio.currentTime);
            }
        }, 250);

        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem(STORAGE_KEY, audio.currentTime);
        });
    }

    // persistence of video
    const video = document.querySelector('.bg-video');
    if (video) {
        const savedVideoTime = parseFloat(sessionStorage.getItem(VIDEO_KEY)) || 0;

        video.addEventListener('loadedmetadata', () => {
            video.currentTime = savedVideoTime;
        });

        if (video.readyState >= 1) {
            video.currentTime = savedVideoTime;
        }

        setInterval(() => {
            if (!video.paused) {
                sessionStorage.setItem(VIDEO_KEY, video.currentTime);
            }
        }, 250);

        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem(VIDEO_KEY, video.currentTime);
        });
    }

    // volume control
    if (!audio) return;

    const savedVol = parseFloat(sessionStorage.getItem(VOLUME_KEY));
    const currentVolume = isNaN(savedVol) ? 0.5 : savedVol;

    const widget = document.createElement('div');
    widget.className = 'volume-control';
    widget.innerHTML = `
        <div class="volume-icon" id="volIcon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path class="speaker-body" d="M3 9 L3 15 L7 15 L12 19 L12 5 L7 9 Z" />
                <path class="wave-1" d="M16 9 C17.5 10.5 17.5 13.5 16 15" />
                <path class="wave-2" d="M19 6 C22 9 22 15 19 18" />
                <line class="mute-line" x1="3" y1="3" x2="21" y2="21" style="display:none; stroke:#ff003c;" />
            </svg>
        </div>
        <input type="range" class="volume-slider" id="volSlider" min="0" max="100" value="${Math.round(currentVolume * 100)}">
        <span class="volume-label" id="volLabel">${Math.round(currentVolume * 100)}%</span>
    `;
    document.body.appendChild(widget);

    const volIcon = document.getElementById('volIcon');
    const volSlider = document.getElementById('volSlider');
    const volLabel = document.getElementById('volLabel');
    const wave1 = widget.querySelector('.wave-1');
    const wave2 = widget.querySelector('.wave-2');
    const muteLine = widget.querySelector('.mute-line');
    let isMuted = false;
    let premuteVolume = currentVolume;

    volSlider.addEventListener('input', () => {
        const val = volSlider.value / 100;
        audio.volume = val;
        sessionStorage.setItem(VOLUME_KEY, val);
        volLabel.textContent = volSlider.value + '%';

        if (val === 0) {
            volIcon.classList.add('muted');
            wave1.style.display = 'none';
            wave2.style.display = 'none';
            muteLine.style.display = 'block';
        } else {
            volIcon.classList.remove('muted');
            wave1.style.display = val > 0.3 ? 'block' : 'none';
            wave2.style.display = val > 0.6 ? 'block' : 'none';
            muteLine.style.display = 'none';
            isMuted = false;
        }
    });

    volIcon.addEventListener('click', () => {
        if (isMuted) {
            isMuted = false;
            audio.volume = premuteVolume;
            volSlider.value = Math.round(premuteVolume * 100);
            volLabel.textContent = Math.round(premuteVolume * 100) + '%';
            sessionStorage.setItem(VOLUME_KEY, premuteVolume);
            volIcon.classList.remove('muted');
            wave1.style.display = premuteVolume > 0.3 ? 'block' : 'none';
            wave2.style.display = premuteVolume > 0.6 ? 'block' : 'none';
            muteLine.style.display = 'none';
        } else {
            isMuted = true;
            premuteVolume = audio.volume;
            audio.volume = 0;
            volSlider.value = 0;
            volLabel.textContent = '0%';
            sessionStorage.setItem(VOLUME_KEY, 0);
            volIcon.classList.add('muted');
            wave1.style.display = 'none';
            wave2.style.display = 'none';
            muteLine.style.display = 'block';
        }
    });

    wave1.style.display = currentVolume > 0.3 ? 'block' : 'none';
    wave2.style.display = currentVolume > 0.6 ? 'block' : 'none';
})();
