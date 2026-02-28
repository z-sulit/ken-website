
(function () {
    const STORAGE_KEY = 'gundamMusicTime';
    const MUSIC_FLAG = 'gundamMusicStarted';
    const VIDEO_KEY = 'gundamVideoTime';
    const VOLUME_KEY = 'gundamVolume';
    const TRACK_KEY = 'gundamTrackIndex';

    const PLAYLIST = [
        { title: 'RX-0', src: 'Music/RX-0.mp3' },
        { title: 'Unicorn', src: 'Music/Unicorn.mp3' },
        { title: 'I Am Just A Boy', src: 'Music/I Am Just a boy.mp3' },
        { title: 'My Love For Her', src: 'Music/My love for her.mp3' },
    ];

    // ── Audio setup ──
    let audio = null;
    const isLoginPage = !!document.getElementById('bgMusic');

    if (isLoginPage) {
        audio = document.getElementById('bgMusic');
    } else if (sessionStorage.getItem(MUSIC_FLAG)) {
        audio = document.createElement('audio');
        audio.id = 'bgMusicPersist';
        document.body.appendChild(audio);
    }

    if (!audio) return;

    const savedVolume = parseFloat(sessionStorage.getItem(VOLUME_KEY));
    audio.volume = isNaN(savedVolume) ? 0.5 : savedVolume;

    let currentTrack = parseInt(sessionStorage.getItem(TRACK_KEY)) || 0;
    if (currentTrack >= PLAYLIST.length) currentTrack = 0;

    function loadTrack(index, autoplay) {
        currentTrack = index;
        sessionStorage.setItem(TRACK_KEY, index);
        sessionStorage.setItem(STORAGE_KEY, '0');
        audio.src = PLAYLIST[index].src;
        audio.currentTime = 0;
        highlightTrack();
        updateNowPlaying();
        if (autoplay) audio.play().catch(() => { });
    }

    function nextTrack() {
        loadTrack((currentTrack + 1) % PLAYLIST.length, true);
    }

    function prevTrack() {
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
        } else {
            loadTrack((currentTrack - 1 + PLAYLIST.length) % PLAYLIST.length, true);
        }
    }

    // On track end → play next
    audio.addEventListener('ended', nextTrack);

    // Restore position for non-login pages
    if (!isLoginPage) {
        audio.src = PLAYLIST[currentTrack].src;
        const savedTime = parseFloat(sessionStorage.getItem(STORAGE_KEY)) || 0;
        audio.currentTime = savedTime;
        audio.play().catch(() => {
            document.addEventListener('click', function handler() {
                audio.play();
                document.removeEventListener('click', handler);
            });
        });
    }

    // Save position periodically
    setInterval(() => {
        if (audio && !audio.paused) {
            sessionStorage.setItem(STORAGE_KEY, audio.currentTime);
        }
    }, 250);

    window.addEventListener('beforeunload', () => {
        if (audio) sessionStorage.setItem(STORAGE_KEY, audio.currentTime);
    });

    // ── Video persistence (main pages only) ──
    const video = document.querySelector('.bg-video');
    if (video) {
        const savedVideoTime = parseFloat(sessionStorage.getItem(VIDEO_KEY)) || 0;
        video.addEventListener('loadedmetadata', () => { video.currentTime = savedVideoTime; });
        if (video.readyState >= 1) video.currentTime = savedVideoTime;
        setInterval(() => {
            if (!video.paused) sessionStorage.setItem(VIDEO_KEY, video.currentTime);
        }, 250);
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem(VIDEO_KEY, video.currentTime);
        });
    }

    // ── Inject Playlist UI ──
    const panel = document.createElement('div');
    if (isLoginPage) {
        panel.className = 'playlist-panel';
        panel.style.display = 'none';
    } else {
        panel.className = 'playlist-panel open';
    }
    panel.innerHTML = `
        <button class="playlist-toggle" id="playlistToggle">♫</button>
        <div class="playlist-inner">
            <div class="playlist-header">PLAYLIST</div>
            <div class="playlist-now-playing" id="nowPlaying"></div>
            <div class="playlist-time">
                <span class="pl-time-current" id="plTimeCurrent">0:00</span>
                <div class="pl-progress-bar" id="plProgressBar">
                    <div class="pl-progress-fill" id="plProgressFill"></div>
                </div>
                <span class="pl-time-total" id="plTimeTotal">0:00</span>
            </div>
            <div class="playlist-controls">
                <button class="pl-btn" id="plPrev">⏮</button>
                <button class="pl-btn pl-play" id="plPlay">⏸</button>
                <button class="pl-btn" id="plNext">⏭</button>
            </div>
            <div class="playlist-volume">
                <span class="pl-vol-icon" id="plVolIcon">🔊</span>
                <input type="range" class="pl-vol-slider" id="plVolSlider" min="0" max="100" value="${Math.round(audio.volume * 100)}">
                <span class="pl-vol-label" id="plVolLabel">${Math.round(audio.volume * 100)}%</span>
            </div>
            <div class="playlist-tracks" id="playlistTracks">
                ${PLAYLIST.map((t, i) => `<div class="pl-track${i === currentTrack ? ' active' : ''}" data-index="${i}">${t.title}</div>`).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // ── DOM Refs ──
    const toggleBtn = document.getElementById('playlistToggle');
    const playBtn = document.getElementById('plPlay');
    const prevBtn = document.getElementById('plPrev');
    const nextBtn = document.getElementById('plNext');
    const volSlider = document.getElementById('plVolSlider');
    const volLabel = document.getElementById('plVolLabel');
    const volIcon = document.getElementById('plVolIcon');
    const nowPlaying = document.getElementById('nowPlaying');
    const tracksContainer = document.getElementById('playlistTracks');

    // ── Toggle panel ──
    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('open');
    });

    // ── Play/Pause ──
    function updatePlayBtn() {
        playBtn.textContent = audio.paused ? '▶' : '⏸';
    }

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            if (!audio.src || audio.src === '') loadTrack(currentTrack, false);
            audio.play().catch(() => { });
        } else {
            audio.pause();
        }
        updatePlayBtn();
    });

    audio.addEventListener('play', updatePlayBtn);
    audio.addEventListener('pause', updatePlayBtn);

    // ── Prev / Next ──
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    // ── Track click ──
    tracksContainer.addEventListener('click', (e) => {
        const track = e.target.closest('.pl-track');
        if (track) loadTrack(parseInt(track.dataset.index), true);
    });

    // ── Volume ──
    let isMuted = false;
    let premuteVol = audio.volume;

    volSlider.addEventListener('input', () => {
        const val = volSlider.value / 100;
        audio.volume = val;
        sessionStorage.setItem(VOLUME_KEY, val);
        volLabel.textContent = volSlider.value + '%';
        volIcon.textContent = val === 0 ? '🔇' : val < 0.5 ? '🔉' : '🔊';
        isMuted = false;
    });

    volIcon.addEventListener('click', () => {
        if (isMuted) {
            isMuted = false;
            audio.volume = premuteVol;
            volSlider.value = Math.round(premuteVol * 100);
            volLabel.textContent = Math.round(premuteVol * 100) + '%';
            sessionStorage.setItem(VOLUME_KEY, premuteVol);
            volIcon.textContent = premuteVol < 0.5 ? '🔉' : '🔊';
        } else {
            isMuted = true;
            premuteVol = audio.volume;
            audio.volume = 0;
            volSlider.value = 0;
            volLabel.textContent = '0%';
            sessionStorage.setItem(VOLUME_KEY, 0);
            volIcon.textContent = '🔇';
        }
    });

    // ── Highlight active track ──
    function highlightTrack() {
        tracksContainer.querySelectorAll('.pl-track').forEach((el, i) => {
            el.classList.toggle('active', i === currentTrack);
        });
    }

    function updateNowPlaying() {
        nowPlaying.textContent = PLAYLIST[currentTrack].title;
    }

    // ── Time display ──
    const timeCurrent = document.getElementById('plTimeCurrent');
    const timeTotal = document.getElementById('plTimeTotal');
    const progressBar = document.getElementById('plProgressBar');
    const progressFill = document.getElementById('plProgressFill');

    function formatTime(sec) {
        if (isNaN(sec) || !isFinite(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    audio.addEventListener('timeupdate', () => {
        timeCurrent.textContent = formatTime(audio.currentTime);
        if (audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = pct + '%';
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('durationchange', () => {
        timeTotal.textContent = formatTime(audio.duration);
    });

    // Click progress bar to seek
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (audio.duration) audio.currentTime = pct * audio.duration;
    });

    updateNowPlaying();
    updatePlayBtn();
})();
