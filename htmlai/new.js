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
    let playerInstance;
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
            },
            onBuffer: () => {
                const currentQuality = playerInstance.getQuality();
                const availableQualities = playerInstance.getQualityLevels();
                const lowestQuality = availableQualities.find(q => q.label === "Normal");
                if (currentQuality && lowestQuality && currentQuality.label !== "Normal") {
                    playerInstance.setQuality(lowestQuality.index);
                    console.log("Koneksi lambat, beralih ke kualitas terendah untuk mencegah buffering.");
                }
            }
        });

        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
            return `${minutes}:${paddedSeconds}`;
        };

        playerInstance.on('ready', () => {
            console.log("JW Player is ready.");
            playerInstance.pause();
            if (playerControls) {
                playerControls.style.display = 'flex';
                // Menampilkan durasi total video saat player siap
                const duration = playerInstance.getDuration();
                if (duration > 0) {
                    const totalDuration = formatTime(duration);
                    timeDisplay.innerHTML = `0:00 / ${totalDuration}`;
                }
            }
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
            resetControlsTimeout();
        });
        
        playerInstance.on('buffer', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block';
        });
        playerInstance.on('play', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        });
        playerInstance.on('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        });
        playerInstance.on('complete', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
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
        playPauseCenter.addEventListener('click', () => {
            playerInstance.playToggle();
        });
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
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });
        const hideControls = () => {
            if (playerControls && playerInstance.getState() === 'playing') {
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
        playerInstance.on('useractive', resetControlsTimeout);
        playerInstance.on('userinactive', hideControls);
    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});