document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const videoElement = document.getElementById('video-player');
    const playerControls = document.getElementById('player-controls');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    let hls;
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

    // --- Fungsi Format Waktu ---
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${paddedSeconds}`;
    };

    // --- Inisialisasi Player ---
    if (videoLink && videoElement) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
        }
        
        // Cek dukungan HLS
        if (Hls.isSupported() && videoLink.endsWith('.m3u8')) {
            hls = new Hls();
            hls.loadSource(videoLink);
            hls.attachMedia(videoElement);
            
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                console.log("HLS Manifest dimuat.");
                videoElement.play();
            });
            
            // Penanganan error HLS
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Fatal network error detected, mencoba memuat ulang.", data);
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Fatal media error detected, mencoba memulihkan.", data);
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error("Error HLS fatal lain:", data);
                            hls.destroy();
                            // Fallback to native video if HLS fails entirely (optional)
                            videoElement.src = videoLink;
                            break;
                    }
                }
            });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl') || videoElement.canPlayType('application/x-mpegurl') || !videoLink.endsWith('.m3u8')) {
            // Native HLS support (iOS/Safari) atau file non-HLS (MP4)
            videoElement.src = videoLink;
            videoElement.load();
        } else {
            console.error('Browser tidak mendukung HLS.');
        }

        // Tampilkan kontrol saat player siap
        videoElement.addEventListener('loadedmetadata', () => {
             console.log("Metadata video dimuat.");
             if (playerControls) playerControls.style.display = 'flex';
             resetControlsTimeout();
        });

        // --- Event Video HTML5 ---
        
        videoElement.addEventListener('play', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        });

        videoElement.addEventListener('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        });

        videoElement.addEventListener('ended', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
        });

        videoElement.addEventListener('timeupdate', () => {
            if (progressBar && videoElement.duration > 0 && !isNaN(videoElement.duration)) {
                const progressPercentage = (videoElement.currentTime / videoElement.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(videoElement.currentTime);
                const totalDuration = formatTime(videoElement.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });
        
        // Tampilkan loading saat buffering
        videoElement.addEventListener('waiting', () => {
            console.log("Video sedang menunggu (buffering).");
            loadingSpinner.style.display = 'block';
        });

        videoElement.addEventListener('playing', () => {
            console.log("Video sedang diputar.");
            loadingSpinner.style.display = 'none';
        });

        // --- Kontrol Klik Tengah ---
        playPauseCenter.addEventListener('click', () => {
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        });
        
        // --- Kontrol Seek pada Progress Bar ---
        progressBarContainer.addEventListener('click', (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            
            if (videoElement.duration) {
                const newTime = videoElement.duration * percentage;
                videoElement.currentTime = newTime;
            }
            resetControlsTimeout();
        });

        // --- Fungsi Kontrol Remote/Keyboard ---
        document.addEventListener('keydown', (event) => {
            if (videoElement) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        if (videoElement.paused) {
                            videoElement.play();
                        } else {
                            videoElement.pause();
                        }
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

        // --- Fungsi Sembunyikan/Tampilkan Kontrol ---
        const hideControls = () => {
            if (playerControls && !videoElement.paused) {
                playerControls.classList.add('hidden');
                videoTitleContainer.style.opacity = '0';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) {
                playerControls.classList.remove('hidden');
                videoTitleContainer.style.opacity = videoElement.paused ? '1' : '0';
            }
            controlsTimeout = setTimeout(hideControls, 3000);
        };

        // Event untuk memicu tampilan kontrol
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        videoElement.addEventListener('click', resetControlsTimeout);

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});