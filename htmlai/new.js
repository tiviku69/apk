document.addEventListener('DOMContentLoaded', () => {
    // Ambil data dari sessionStorage
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');

    let playerInstance;
    let controlsTimeout;

    if (videoLink) {
        // Inisialisasi JW Player
        playerInstance = jwplayer("player").setup({
            file: videoLink,
            title: videoTitle || "Sedang Memutar Film",
            autostart: false,
            controls: false,
            width: "100%",
            displaytitle: true,
            displaydescription: true,
            description: "Kamu Sedang Nonton",
            skin: {
                name: "netflix"
            },
            captions: {
                color: "#FFF",
                fontSize: 14,
                backgroundOpacity: 0,
                edgeStyle: "raised"
            },
            
            // Tambahkan ini untuk mengontrol kualitas video
            qualityLabels: {
                "360": "Normal",
                "480": "HD",
                "720": "Full HD",
                "1080": "Ultra HD"
            },
            
            // Tambahkan event listener untuk mendeteksi buffering
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
        
        // --- Fungsi Pembantu ---
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
            return `${minutes}:${paddedSeconds}`;
        };
        
        // --- Event Listener JW Player ---
        playerInstance.on('ready', () => {
            console.log("JW Player is ready.");
            if (playerControls) playerControls.style.display = 'flex';
            resetControlsTimeout();
        });
        
        playerInstance.on('buffer', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block';
        });
        
        playerInstance.on('play', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            resetControlsTimeout();
        });
        
        playerInstance.on('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
        });
        
        playerInstance.on('complete', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
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
        
        // --- Kontrol Keyboard ---
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
        
        // --- Manajemen Tampilan Kontrol Otomatis ---
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