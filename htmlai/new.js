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
    const videoElement = document.getElementById('video-player');
    
    let playerInstance; // Instance Plyr
    let controlsTimeout;
    const SEEK_TIME = 10; // 10 seconds for seek forward/backward

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    const formatTime = (seconds) => {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${paddedSeconds}`;
    };

    if (videoLink) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
        }
        
        // --- HLS.js INTEGRATION LOGIC with Plyr ---
        if (Hls.isSupported() && videoLink.toLowerCase().includes('.m3u8')) {
            const hls = new Hls();
            hls.loadSource(videoLink);
            hls.attachMedia(videoElement);
            
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                // Setelah manifest HLS.js selesai di-parse, inisialisasi Plyr
                playerInstance = new Plyr(videoElement, { controls: [] }); // Inisialisasi Plyr tanpa kontrol default
                initializePlayerEvents(playerInstance);
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    console.error('HLS.js Fatal Error:', data.type, data.details);
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        alert('Gagal memuat streaming (Network Error).');
                    }
                    hls.destroy();
                }
            });

        } else {
            // Jika bukan HLS, inisialisasi Plyr langsung dengan link video
            videoElement.src = videoLink;
            playerInstance = new Plyr(videoElement, { controls: [] }); // Inisialisasi Plyr tanpa kontrol default
            initializePlayerEvents(playerInstance);
        }
        
    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
    
    
    // Fungsi untuk menginisialisasi event listeners Plyr
    function initializePlayerEvents(player) {
        
        player.on('ready', () => {
            console.log("Plyr is ready.");
            if (playerControls) playerControls.style.display = 'flex';
            resetControlsTimeout();
        });

        player.on('waiting', () => { 
            console.log("Video sedang buffering (waiting).");
            loadingSpinner.style.display = 'block';
        });

        player.on('playing', () => { 
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        });

        player.on('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        });

        player.on('ended', () => { 
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        });

        player.on('timeupdate', () => { 
            const position = player.currentTime;
            const duration = player.duration;

            if (progressBar && duration > 0 && isFinite(duration)) {
                const progressPercentage = (position / duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(position);
                const totalDuration = formatTime(duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });

        // --- Custom Control Logic (Remote/Keyboard Functionality) ---

        playPauseCenter.addEventListener('click', () => {
            if (player.paused) {
                player.play();
            } else {
                player.pause();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (player && !player.destroyed) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        if (player.paused) {
                            player.play();
                        } else {
                            player.pause();
                        }
                        break;
                    case 'ArrowRight':
                        // currentTime property di Plyr adalah getter/setter
                        player.currentTime = player.currentTime + SEEK_TIME;
                        break;
                    case 'ArrowLeft':
                        player.currentTime = player.currentTime - SEEK_TIME;
                        break;
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });

        const hideControls = () => {
            if (playerControls && !player.paused && !player.ended) {
                playerControls.style.display = 'none';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) playerControls.style.display = 'flex';
            controlsTimeout = setTimeout(hideControls, 3000);
        };

        // Event DOM untuk interaksi pengguna
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        videoElement.addEventListener('mouseover', resetControlsTimeout);
        videoElement.addEventListener('mouseout', hideControls);
    }
});