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
    const video = document.getElementById('player');
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
        
        const playerInstance = videojs(video, {
            autoplay: false,
            controls: false,
            preload: 'auto',
            playbackRates: [0.5, 1, 1.5, 2]
        });

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(videoLink);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("HLS Manifest parsed. Video is ready to play.");
                video.play();
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS.js error:", data);
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoLink;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        } else {
            console.error('Browser tidak mendukung HLS.');
            document.body.innerHTML = '<h1>Browser Anda tidak mendukung HLS. Kembali ke halaman utama.</h1>';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
            return;
        }

        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
            return `${minutes}:${paddedSeconds}`;
        };

        // Replikasi fungsi dari JW Player
        video.addEventListener('playing', () => {
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        });

        video.addEventListener('pause', () => {
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        });

        video.addEventListener('ended', () => {
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
        });

        video.addEventListener('waiting', () => {
            loadingSpinner.style.display = 'block';
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