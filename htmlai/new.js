document.addEventListener('DOMContentLoaded', () => {
    // Ambil data dari sessionStorage
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerControls = document.getElementById('player-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const ffBtn = document.getElementById('ff-btn');
    const rwBtn = document.getElementById('rw-btn');
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner'); // Tambahan: Ambil elemen spinner

    let playerInstance;
    let controlsTimeout;

    if (videoLink) {
        // Inisialisasi JW Player
        playerInstance = jwplayer("player").setup({
            file: videoLink,
            title: videoTitle || "Sedang Memutar Film",
            autostart: false, // Ubah agar video otomatis diputar saat halaman dimuat
            controls: false, // Kita akan menggunakan kontrol kustom
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
            }
        });

        // --- Event Listener JW Player ---

        // Event saat JW Player siap
        playerInstance.on('ready', () => {
            console.log("JW Player is ready.");
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>";
            if (playerControls) playerControls.style.display = 'flex';
            resetControlsTimeout();
        });

        // Event saat video mulai buffering
        playerInstance.on('buffer', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block'; // Tampilkan spinner
        });

        // Event saat video mulai diputar
        playerInstance.on('play', () => {
            console.log("Video mulai diputar.");
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>";
            loadingSpinner.style.display = 'none'; // Sembunyikan spinner
            resetControlsTimeout();
        });

        // Event saat video dijeda
        playerInstance.on('pause', () => {
            console.log("Video dijeda.");
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>";
            clearTimeout(controlsTimeout);
        });

        // Event saat video selesai
        playerInstance.on('complete', () => {
            console.log("Video selesai diputar.");
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>";
            clearTimeout(controlsTimeout);
        });

        // Event untuk memperbarui progress bar
        playerInstance.on('time', (data) => {
            if (progressBar && data.duration > 0) {
                const progressPercentage = (data.position / data.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
        });

        // --- Kustom Kontrol Tombol ---
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