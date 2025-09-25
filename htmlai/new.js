document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    const video = document.getElementById('video-player');
    
    let controlsTimeout;

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    if (videoLink) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
        }
        
        // Inisialisasi hls.js
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(videoLink);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
                console.log("HLS.js siap, video siap diputar.");
                if (playerControls) playerControls.style.display = 'flex';
                resetControlsTimeout();
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS.js error:', data);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log("Fatal network error, mencoba pemulihan.");
                            hls.recoverMediaError();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("Fatal media error, mencoba pemulihan.");
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Untuk Safari (dukungan HLS bawaan)
            video.src = videoLink;
            video.addEventListener('loadedmetadata', () => {
                video.play();
                console.log("Video siap diputar (Safari).");
                if (playerControls) playerControls.style.display = 'flex';
                resetControlsTimeout();
            });
        } else {
            console.error('Browser tidak mendukung HLS.');
            document.body.innerHTML = '<h1>Browser Anda tidak mendukung pemutaran video HLS.</h1>';
        }
        
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
            return `${minutes}:${paddedSeconds}`;
        };

        // Event listener untuk HTML5 video
        video.addEventListener('waiting', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block';
        });

        video.addEventListener('play', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        });

        video.addEventListener('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        });
        
        video.addEventListener('ended', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
        });

        video.addEventListener('timeupdate', () => {
            if (progressBar && video.duration > 0) {
                const progressPercentage = (video.currentTime / video.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(video.currentTime);
                const totalDuration = formatTime(video.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });

        playPauseCenter.addEventListener('click', () => {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (video) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        if (video.paused) {
                            video.play();
                        } else {
                            video.pause();
                        }
                        break;
                    case 'ArrowRight':
                        video.currentTime += 10;
                        break;
                    case 'ArrowLeft':
                        video.currentTime -= 10;
                        break;
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });

        const hideControls = () => {
            if (playerControls && !video.paused) {
                playerControls.style.display = 'none';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) playerControls.style.display = 'flex';
            controlsTimeout = setTimeout(hideControls, 3000);
        };
        
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});