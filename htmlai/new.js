document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerControls = document.getElementById('player-controls');
    const playPauseBtn = document.getElementById('play-pause-btn'); // Pastikan ID ini ada di HTML
    const ffBtn = document.getElementById('ff-btn'); // Pastikan ID ini ada di HTML
    const rwBtn = document.getElementById('rw-btn'); // Pastikan ID ini ada di HTML
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner'); // Ambil elemen spinner

    let playerInstance;
    let controlsTimeout;

    if (videoLink) {
        playerInstance = jwplayer("player").setup({
            file: videoLink,
            title: videoTitle || "Sedang Memutar Film",
            autostart: false, // Mengubah menjadi true agar video otomatis diputar
            controls: false,
            width: "100%",
            displaytitle: true,
            displaydescription: true,
            description: "Kamu Sedang Nonton",
            skin: {
                name: "seven" // Mengganti skin ke 'seven' atau 'glow' yang umum dan stabil
            },
            captions: {
                color: "#FFF",
                fontSize: 14,
                backgroundOpacity: 0,
                edgeStyle: "raised"
            }
        });

        // --- Event Listener JW Player ---
        playerInstance.on('ready', () => {
            console.log("JW Player is ready.");
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>";
            if (playerControls) playerControls.style.display = 'flex';
            resetControlsTimeout();
        });

        playerInstance.on('time', (data) => {
            if (progressBar && data.duration > 0) {
                const progressPercentage = (data.position / data.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
        });

        playerInstance.on('play', () => {
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>";
            loadingSpinner.style.display = 'none'; // Sembunyikan spinner saat video mulai diputar
            resetControlsTimeout();
        });

        playerInstance.on('pause', () => {
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>";
            clearTimeout(controlsTimeout);
        });

        playerInstance.on('buffering', () => {
            loadingSpinner.style.display = 'block'; // Tampilkan spinner saat buffering
            clearTimeout(controlsTimeout); // Jaga kontrol tetap terlihat saat buffering
        });

        playerInstance.on('bufferChange', (event) => {
            if (event.reason === 'complete') {
                 loadingSpinner.style.display = 'none'; // Sembunyikan spinner saat buffering selesai
                 resetControlsTimeout();
            }
        });

        playerInstance.on('complete', () => {
            console.log("Video finished playing.");
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>";
            loadingSpinner.style.display = 'none'; // Pastikan spinner hilang saat selesai
            clearTimeout(controlsTimeout);
        });

        // --- Kustom Kontrol Tombol ---
        // (Pastikan tombol-tombol ini ada di HTML Anda dengan ID yang benar)
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                playerInstance.playToggle();
            });
        }

        if (ffBtn) {
            ffBtn.addEventListener('click', () => {
                playerInstance.seek(playerInstance.getPosition() + 10);
                resetControlsTimeout();
            });
        }

        if (rwBtn) {
            rwBtn.addEventListener('click', () => {
                playerInstance.seek(playerInstance.getPosition() - 10);
                resetControlsTimeout();
            });
        }

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