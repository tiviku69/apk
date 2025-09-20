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

    const updateClock = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    };

    setInterval(updateClock, 1000);
    updateClock();

    if (!videoLink) {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }

    if (videoTitleContainer) {
        videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
    }

    videoPlayer.src = videoLink;

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${paddedSeconds}`;
    };

    const togglePlayPauseIcon = (isPaused) => {
        if (isPaused) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
    };

    const showControls = () => {
        clearTimeout(controlsTimeout);
        playerControls.style.display = 'flex';
        videoTitleContainer.style.opacity = '1';
        controlsTimeout = setTimeout(hideControls, 3000);
    };

    const hideControls = () => {
        if (!videoPlayer.paused) {
            playerControls.style.display = 'none';
            videoTitleContainer.style.opacity = '0';
        }
    };

    videoPlayer.addEventListener('loadedmetadata', () => {
        console.log("Video metadata is loaded.");
        showControls();
        videoPlayer.play();
    });

    videoPlayer.addEventListener('waiting', () => {
        console.log("Video sedang buffering.");
        loadingSpinner.style.display = 'block';
    });

    videoPlayer.addEventListener('playing', () => {
        console.log("Video mulai diputar.");
        loadingSpinner.style.display = 'none';
        playPauseCenter.style.opacity = '0';
        togglePlayPauseIcon(false);
        showControls();
    });

    videoPlayer.addEventListener('pause', () => {
        console.log("Video dijeda.");
        clearTimeout(controlsTimeout);
        playPauseCenter.style.opacity = '1';
        togglePlayPauseIcon(true);
        videoTitleContainer.style.opacity = '1';
    });

    videoPlayer.addEventListener('ended', () => {
        console.log("Video selesai diputar.");
        clearTimeout(controlsTimeout);
        playPauseCenter.style.opacity = '1';
        videoTitleContainer.style.opacity = '1';
        togglePlayPauseIcon(true);
    });

    videoPlayer.addEventListener('timeupdate', () => {
        if (videoPlayer.duration > 0) {
            const progressPercentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            timeDisplay.innerHTML = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
        }
    });

    playPauseCenter.addEventListener('click', () => {
        videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
    });

    progressBarContainer.addEventListener('click', (e) => {
        const rect = progressBarContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        videoPlayer.currentTime = percentage * videoPlayer.duration;
        showControls();
    });

    document.addEventListener('keydown', (event) => {
        if (videoPlayer) {
            switch (event.key) {
                case 'Enter':
                case ' ':
                    videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
                    break;
                case 'ArrowRight':
                    const newTimeForward = Math.min(videoPlayer.currentTime + 10, videoPlayer.duration);
                    videoPlayer.currentTime = newTimeForward;
                    // Putar ulang video setelah FF jika video dijeda sebelumnya
                    if (videoPlayer.paused) {
                         videoPlayer.play();
                    }
                    break;
                case 'ArrowLeft':
                    const newTimeBackward = Math.max(videoPlayer.currentTime - 10, 0);
                    videoPlayer.currentTime = newTimeBackward;
                    // Putar ulang video setelah RW jika video dijeda sebelumnya
                    if (videoPlayer.paused) {
                         videoPlayer.play();
                    }
                    break;
                case 'Escape':
                    window.history.back();
                    break;
            }
            showControls();
        }
    });

    document.addEventListener('mousemove', showControls);
    document.addEventListener('mousedown', showControls);
    document.addEventListener('touchstart', showControls);
    videoPlayer.addEventListener('click', showControls);
});