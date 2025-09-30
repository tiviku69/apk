document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerElement = document.getElementById('player'); // Sekarang elemen <video>
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-bar-container'); // Tambahan untuk seek
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    
    // playerInstance diganti menjadi playerElement (<video>)
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
        
        // 1. Inisialisasi Video HTML5
        playerElement.src = videoLink;
        // playerElement.load(); // Opsional, tetapi membantu memulai pemuatan

        const formatTime = (seconds) => {
            if (isNaN(seconds) || seconds < 0) return '0:00';
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
            return `${minutes}:${paddedSeconds}`;
        };

        // Fungsi Play/Pause Toggle
        const playToggle = () => {
            if (playerElement.paused) {
                playerElement.play().catch(error => {
                    console.error("Gagal memutar video:", error);
                    // Menampilkan ikon Play jika gagal play (misalnya: karena kebijakan autostart browser)
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                    playPauseCenter.style.opacity = '1';
                });
            } else {
                playerElement.pause();
            }
        };

        // Fungsi Hide/Show Controls
        const hideControls = () => {
            if (playerControls && !playerElement.paused) {
                playerControls.style.display = 'none';
                videoTitleContainer.style.opacity = '0'; // Sembunyikan judul
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) playerControls.style.display = 'flex';
            videoTitleContainer.style.opacity = '1'; // Tampilkan judul
            
            // Atur ulang timer hanya jika video sedang diputar
            if (!playerElement.paused) {
                controlsTimeout = setTimeout(hideControls, 3000);
            }
        };

        // 2. Event Listener HTML5
        
        // Event "canplay" menggantikan "ready" JW Player
        playerElement.addEventListener('canplay', () => {
            console.log("Video siap diputar.");
            if (playerControls) playerControls.style.display = 'flex';
            resetControlsTimeout();
        });

        // Event "waiting" menggantikan "buffer" JW Player
        playerElement.addEventListener('waiting', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block';
        });

        // Event "play"
        playerElement.addEventListener('play', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        });

        // Event "pause"
        playerElement.addEventListener('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        });

        // Event "ended" menggantikan "complete" JW Player
        playerElement.addEventListener('ended', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
            playerControls.style.display = 'flex';
        });

        // Event "timeupdate" menggantikan "time" JW Player
        playerElement.addEventListener('timeupdate', () => {
            if (progressBar && !isNaN(playerElement.duration) && playerElement.duration > 0) {
                const progressPercentage = (playerElement.currentTime / playerElement.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(playerElement.currentTime);
                const totalDuration = formatTime(playerElement.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });

        // 3. Kontrol dan Keyboard Shortcuts
        
        playPauseCenter.addEventListener('click', playToggle);
        
        // Logika Seek pada Progress Bar
        progressBarContainer.addEventListener('click', (event) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickPosition = event.clientX - rect.left;
            const percentage = clickPosition / rect.width;
            
            if (!isNaN(playerElement.duration)) {
                playerElement.currentTime = playerElement.duration * percentage;
            }
            resetControlsTimeout();
        });

        document.addEventListener('keydown', (event) => {
            if (playerElement) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault(); // Mencegah scrolling saat menekan Spacebar
                        playToggle();
                        break;
                    case 'ArrowRight':
                        playerElement.currentTime += 10;
                        break;
                    case 'ArrowLeft':
                        playerElement.currentTime -= 10;
                        break;
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });

        // 4. Reset Controls Timeout pada Aktivitas Pengguna
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        // Untuk HTML5 video, kita tidak memiliki event useractive/userinactive seperti JW Player, 
        // sehingga kita mengandalkan mousemove/mousedown/touchstart.

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});