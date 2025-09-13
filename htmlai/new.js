document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerControls = document.getElementById('player-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const ffBtn = document.getElementById('ff-btn');
    const rwBtn = document.getElementById('rw-btn');
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
            // Karena autostart true, player akan langsung mencoba play
            // Spinner akan terlihat jika ada buffering awal
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

        // Tampilkan spinner saat player sedang buffering
        playerInstance.on('buffer', () => {
            loadingSpinner.style.display = 'block';
            console.log("Buffering...");
            clearTimeout(controlsTimeout); // Jaga kontrol tetap terlihat saat buffering
        });

        // Sembunyikan spinner saat player mulai diputar (setelah buffering selesai)
        playerInstance.on('play', () => {
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>";
            loadingSpinner.style.display = 'none'; // Sembunyikan spinner saat video mulai diputar
            console.log("Playing.");
            resetControlsTimeout();
        });

        playerInstance.on('pause', () => {
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>";
            loadingSpinner.style.display = 'none'; // Sembunyikan spinner jika di-pause
            console.log("Paused.");
            clearTimeout(controlsTimeout);
        });

        playerInstance.on('complete', () => {
            console.log("Video finished playing.");
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>";
            loadingSpinner.style.display = 'none'; // Pastikan spinner hilang saat selesai
            clearTimeout(controlsTimeout);
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
            // Sembunyikan kontrol hanya jika player sedang bermain DAN TIDAK buffering
            if (playerControls && playerInstance.getState() === 'playing' && playerInstance.getBuffer() === 100) {
                 playerControls.style.display = 'none';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) playerControls.style.display = 'flex';
            // Hanya atur timeout untuk menyembunyikan kontrol jika tidak buffering
            if (playerInstance.getState() !== 'buffering') { // Memeriksa state langsung
                controlsTimeout = setTimeout(hideControls, 3000);
            }
        };


        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        // JW Player useractive/userinactive events juga memicu resetControlsTimeout
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