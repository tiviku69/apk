document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    const videoPlayer = document.getElementById('video-player');
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
        
        videoPlayer.src = videoLink;
        videoPlayer.autoplay = true;

        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
            return `${minutes}:${paddedSeconds}`;
        };

        videoPlayer.addEventListener('loadedmetadata', () => {
            console.log("Video metadata is loaded.");
            if (playerControls) playerControls.style.display = 'flex';
            resetControlsTimeout();
        });

        videoPlayer.addEventListener('waiting', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block';
        });

        videoPlayer.addEventListener('playing', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        });

        videoPlayer.addEventListener('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        });

        videoPlayer.addEventListener('ended', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
        });

        videoPlayer.addEventListener('timeupdate', () => {
            if (progressBar && videoPlayer.duration > 0) {
                const progressPercentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(videoPlayer.currentTime);
                const totalDuration = formatTime(videoPlayer.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });

        playPauseCenter.addEventListener('click', () => {
            if (videoPlayer.paused) {
                videoPlayer.play();
            } else {
                videoPlayer.pause();
            }
        });
        
        progressBarContainer.addEventListener('click', (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            videoPlayer.currentTime = percentage * videoPlayer.duration;
            resetControlsTimeout();
        });

        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Enter':
                case ' ':
                    if (videoPlayer.paused) {
                        videoPlayer.play();
                    } else {
                        videoPlayer.pause();
                    }
                    break;
                case 'ArrowRight':
                    videoPlayer.currentTime += 10;
                    break;
                case 'ArrowLeft':
                    videoPlayer.currentTime -= 10;
                    break;
                case 'Escape':
                    window.history.back();
                    break;
            }
            resetControlsTimeout();
        });

        const hideControls = () => {
            if (!videoPlayer.paused) {
                playerControls.style.display = 'none';
                videoTitleContainer.style.opacity = '0';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) {
                playerControls.style.display = 'flex';
                videoTitleContainer.style.opacity = '1';
            }
            controlsTimeout = setTimeout(hideControls, 3000);
        };
        
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        videoPlayer.addEventListener('click', resetControlsTimeout);

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});