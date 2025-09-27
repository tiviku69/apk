document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const videoElement = document.getElementById('video-player'); // Elemen Video HTML5
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-bar-container'); // Tambahkan container
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    
    let hls; // Variabel untuk instance Hls.js
    let controlsTimeout;

    // --- Fungsi Jam Digital ---
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- Fungsi Pemutar Video dan HLS.js ---
    if (videoLink) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
        }

        // 1. Inisialisasi HLS.js
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(videoLink);
            hls.attachMedia(videoElement);
            
            // Tampilkan kontrol setelah HLS siap
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                console.log("HLS Manifest Parsed. Video siap diputar.");
                if (playerControls) playerControls.style.display = 'flex';
                resetControlsTimeout();
            });

            // Logika HLS untuk menangani error (opsional: bisa lebih canggih)
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Fatal network error encountered, trying to recover");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Fatal media error encountered, trying to recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error("Fatal error. Destroying HLS instance.");
                            hls.destroy();
                            break;
                    }
                }
            });

        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Untuk browser yang mendukung HLS native (mis. Safari)
            videoElement.src = videoLink;
            videoElement.addEventListener('loadedmetadata', function() {
                if (playerControls) playerControls.style.display = 'flex';
                resetControlsTimeout();
            });
        } else {
            console.error('HLS is not supported by your browser.');
            document.body.innerHTML = '<h1>Browser Anda tidak mendukung pemutaran HLS.</h1>';
            return;
        }

        // 2. Fungsi Pembantu
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
            return `${minutes}:${paddedSeconds}`;
        };

        const updatePlayPauseIcon = () => {
            if (videoElement.paused || videoElement.ended) {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                playPauseCenter.style.opacity = '1';
                videoTitleContainer.style.opacity = '1';
            } else {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                playPauseCenter.style.opacity = '0';
                videoTitleContainer.style.opacity = '0';
            }
        };

        const togglePlayPause = () => {
            if (videoElement.paused || videoElement.ended) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
            // Update ikon di tengah akan dilakukan oleh event listener 'play' dan 'pause'
            resetControlsTimeout();
        };

        // 3. Event Listener Video
        videoElement.addEventListener('play', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            updatePlayPauseIcon();
            resetControlsTimeout();
        });

        videoElement.addEventListener('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            updatePlayPauseIcon();
        });

        videoElement.addEventListener('ended', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            updatePlayPauseIcon();
        });

        videoElement.addEventListener('timeupdate', () => {
            if (progressBar && videoElement.duration > 0) {
                const progressPercentage = (videoElement.currentTime / videoElement.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(videoElement.currentTime);
                const totalDuration = formatTime(videoElement.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });

        videoElement.addEventListener('waiting', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block';
        });

        videoElement.addEventListener('playing', () => {
            console.log("Video melanjutkan pemutaran setelah buffering.");
            loadingSpinner.style.display = 'none';
        });

        // 4. Kontrol Kustom
        playPauseCenter.addEventListener('click', togglePlayPause);
        
        progressBarContainer.addEventListener('click', (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            videoElement.currentTime = pos * videoElement.duration;
            resetControlsTimeout();
        });

        // 5. Keyboard Shortcuts
        document.addEventListener('keydown', (event) => {
            if (videoElement) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        togglePlayPause();
                        event.preventDefault(); // Mencegah scrolling spasi
                        break;
                    case 'ArrowRight':
                        videoElement.currentTime += 10;
                        break;
                    case 'ArrowLeft':
                        videoElement.currentTime -= 10;
                        break;
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });
        
        // 6. Menyembunyikan Kontrol
        const hideControls = () => {
            if (playerControls && !videoElement.paused) {
                playerControls.style.display = 'none';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) playerControls.style.display = 'flex';
            controlsTimeout = setTimeout(hideControls, 3000);
        };
        
        // Event untuk menampilkan/menyembunyikan kontrol
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        videoElement.addEventListener('click', resetControlsTimeout);

        // Pastikan ikon awal benar
        updatePlayPauseIcon();

    } else {
        // Jika tidak ada data video
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});