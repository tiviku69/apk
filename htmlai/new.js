document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const videoChannel = sessionStorage.getItem('videoChannel');
    const videoViews = sessionStorage.getItem('videoViews');
    const videoAge = sessionStorage.getItem('videoAge');

    const playerControls = document.getElementById('player-controls');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const digitalClock = document.getElementById('digital-clock');

    // New controls elements
    const playPauseButton = document.getElementById('play-pause-button');
    const controlsPlayIcon = document.getElementById('controls-play-icon');
    const controlsPauseIcon = document.getElementById('controls-pause-icon');
    const muteButton = document.getElementById('mute-button');
    const volumeSlider = document.getElementById('volume-slider');
    const fullscreenButton = document.getElementById('fullscreen-button');

    // Video details overlay
    const currentVideoTitle = document.getElementById('current-video-title');
    const currentVideoChannel = document.getElementById('current-video-channel');
    const currentVideoViews = document.getElementById('current-video-views');
    const videoDetailsOverlay = document.getElementById('video-details-overlay');

    let playerInstance;
    let controlsTimeout;
    let isSeeking = false;

    // --- Utility Functions ---
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${paddedSeconds}`;
    };

    const showControls = () => {
        clearTimeout(controlsTimeout);
        playerControls.style.opacity = '1';
        playerControls.style.pointerEvents = 'auto';
        videoDetailsOverlay.style.opacity = '1';
    };

    const hideControls = () => {
        if (playerInstance && playerInstance.getState() === 'playing' && !isSeeking) {
            playerControls.style.opacity = '0';
            playerControls.style.pointerEvents = 'none';
            videoDetailsOverlay.style.opacity = '0';
        }
    };

    const resetControlsTimeout = () => {
        showControls();
        controlsTimeout = setTimeout(hideControls, 3000);
    };

    // --- Initialization ---
    updateClock();
    setInterval(updateClock, 1000);

    if (videoLink) {
        currentVideoTitle.textContent = videoTitle || "Video Sedang Diputar";
        currentVideoChannel.textContent = videoChannel || "Channel Tidak Dikenal";
        currentVideoViews.textContent = `${videoViews || 'N/A'} ditonton • ${videoAge || 'N/A'}`;

        playerInstance = jwplayer("player").setup({
            file: videoLink,
            autostart: true,
            controls: false,
            width: "100%",
            displaytitle: false,
            displaydescription: true,
            skin: {
                name: "netflix"
            },
            captions: {
                color: "#FFF",
                fontSize: 14,
                backgroundOpacity: 0,
                edgeStyle: "raised"
            },
            qualityLabels: {
                "360": "Normal",
                "480": "HD",
                "720": "Full HD",
                "1080": "Ultra HD"
            }
        });

        // --- Event Listeners for JW Player ---
        playerInstance.on('ready', () => {
            console.log("JW Player is ready.");
            volumeSlider.value = playerInstance.getVolume() / 100;
            resetControlsTimeout();
        });

        playerInstance.on('buffer', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block';
            playPauseCenter.style.opacity = '0';
            showControls();
        });

        playerInstance.on('play', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            controlsPlayIcon.style.display = 'none';
            controlsPauseIcon.style.display = 'block';
            resetControlsTimeout();
        });

        playerInstance.on('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            controlsPlayIcon.style.display = 'block';
            controlsPauseIcon.style.display = 'none';
            showControls();
        });

        playerInstance.on('complete', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            controlsPlayIcon.style.display = 'block';
            controlsPauseIcon.style.display = 'none';
            showControls();
        });

        playerInstance.on('time', (data) => {
            if (progressBar && data.duration > 0) {
                const progressPercentage = (data.position / data.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(data.position);
                const totalDuration = formatTime(data.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });

        playerInstance.on('seek', () => {
            isSeeking = true;
            showControls();
        });

        playerInstance.on('seeked', () => {
            isSeeking = false;
            resetControlsTimeout();
        });

        playerInstance.on('error', (error) => {
            console.error("JW Player error:", error);
            document.body.innerHTML = `
                <div style="text-align: center; color: white; margin-top: 50px;">
                    <h1>Terjadi Kesalahan Saat Memutar Video</h1>
                    <p>${error.message || "Video tidak dapat dimuat atau ada masalah koneksi."}</p>
                    <button onclick="window.location.href='index.html'" style="padding: 10px 20px; background-color: #f00; color: white; border: none; border-radius: 5px; cursor: pointer;">Kembali ke Beranda</button>
                </div>
            `;
        });

        // --- Custom Control Event Listeners ---
        playPauseCenter.addEventListener('click', () => {
            playerInstance.playToggle();
        });

        playPauseButton.addEventListener('click', () => {
            playerInstance.playToggle();
        });

        muteButton.addEventListener('click', () => {
            playerInstance.setMute(!playerInstance.getMute());
            if (playerInstance.getMute()) {
                muteButton.querySelector('.material-icons').textContent = 'volume_off';
            } else {
                muteButton.querySelector('.material-icons').textContent = 'volume_up';
                if (playerInstance.getVolume() === 0 && volumeSlider.value === "0") {
                    playerInstance.setVolume(50);
                    volumeSlider.value = "0.5";
                }
            }
            resetControlsTimeout();
        });

        volumeSlider.addEventListener('input', () => {
            const newVolume = parseFloat(volumeSlider.value);
            playerInstance.setVolume(newVolume * 100);
            if (newVolume === 0) {
                muteButton.querySelector('.material-icons').textContent = 'volume_off';
                playerInstance.setMute(true);
            } else {
                muteButton.querySelector('.material-icons').textContent = 'volume_up';
                playerInstance.setMute(false);
            }
            resetControlsTimeout();
        });

        fullscreenButton.addEventListener('click', () => {
            playerInstance.setFullscreen(!playerInstance.getFullscreen());
            resetControlsTimeout();
        });

        // --- Interaction Management ---
        document.addEventListener('keydown', (event) => {
            if (playerInstance) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        playerInstance.playToggle();
                        break;
                    case 'ArrowRight':
                        playerInstance.seek(playerInstance.getPosition() + 10);
                        break;
                    case 'ArrowLeft':
                        playerInstance.seek(playerInstance.getPosition() - 10);
                        break;
                    case 'ArrowUp':
                        playerInstance.setVolume(Math.min(100, playerInstance.getVolume() + 5));
                        volumeSlider.value = playerInstance.getVolume() / 100;
                        break;
                    case 'ArrowDown':
                        playerInstance.setVolume(Math.max(0, playerInstance.getVolume() - 5));
                        volumeSlider.value = playerInstance.getVolume() / 100;
                        break;
                    case 'f':
                    case 'F':
                        playerInstance.setFullscreen(!playerInstance.getFullscreen());
                        break;
                    case 'm':
                    case 'M':
                        playerInstance.setMute(!playerInstance.getMute());
                        if (playerInstance.getMute()) {
                            muteButton.querySelector('.material-icons').textContent = 'volume_off';
                        } else {
                            muteButton.querySelector('.material-icons').textContent = 'volume_up';
                        }
                        break;
                    case 'Escape':
                        if (playerInstance.getFullscreen()) {
                            playerInstance.setFullscreen(false);
                        } else {
                            window.history.back();
                        }
                        break;
                }
                resetControlsTimeout();
                event.preventDefault();
            }
        });

        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        playerInstance.on('useractive', resetControlsTimeout);
        playerInstance.on('userinactive', hideControls);

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = `
            <div style="text-align: center; color: white; margin-top: 50px;">
                <h1>Tidak ada video yang dipilih.</h1>
                <p>Silakan pilih video dari halaman utama.</p>
                <button onclick="window.location.href='index.html'" style="padding: 10px 20px; background-color: #f00; color: white; border: none; border-radius: 5px; cursor: pointer;">Kembali ke Beranda</button>
            </div>
        `;
    }
});