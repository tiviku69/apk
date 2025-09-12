document.addEventListener('DOMContentLoaded', () => {
    // Ambil data dari sessionStorage
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');

    // Ambil elemen-elemen DOM
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    let playerInstance;
    let controlsTimeout; // Timeout untuk menyembunyikan kontrol

    if (videoLink) {
        // Inisialisasi JW Player
        playerInstance = jwplayer("player").setup({
            file: videoLink,
            title: videoTitle || "Sedang Memutar Film",
            autostart: false, // Video otomatis diputar saat halaman dimuat
            controls: false, // Menggunakan kontrol kustom
            width: "100%",
            displaytitle: true,
            displaydescription: true,
            description: "Kamu Sedang Nonton",
            skin: {
                name: "seven" // Menggunakan skin bawaan yang stabil
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
            console.log("JW Player is ready and attempting to play.");
            playerControls.style.display = 'flex'; // Tampilkan kontrol (progress bar)
            resetControlsTimeout(); // Mulai timer untuk menyembunyikan kontrol
        });

        playerInstance.on('time', (data) => {
            // Perbarui progress bar
            if (data.duration > 0) {
                const progressPercentage = (data.position / data.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
        });

        playerInstance.on('buffer', () => {
            // Tampilkan spinner saat buffering
            loadingSpinner.style.display = 'block';
            console.log("Buffering...");
            clearTimeout(controlsTimeout); // Jaga kontrol (progress bar) tetap terlihat saat buffering
        });

        playerInstance.on('play', () => {
            // Sembunyikan spinner
            loadingSpinner.style.display = 'none';
            console.log("Playing.");
            resetControlsTimeout(); // Reset timer kontrol
        });

        playerInstance.on('pause', () => {
            // Sembunyikan spinner
            loadingSpinner.style.display = 'none';
            console.log("Paused.");
            clearTimeout(controlsTimeout); // Hentikan timer kontrol saat di-pause
        });

        playerInstance.on('complete', () => {
            // Sembunyikan spinner
            console.log("Video finished playing.");
            loadingSpinner.style.display = 'none';
            clearTimeout(controlsTimeout); // Hentikan timer kontrol
        });

        // --- Klik pada Progress Bar untuk Seek ---
        progressBarContainer.addEventListener('click', (event) => {
            if (playerInstance && playerInstance.getDuration() > 0) {
                const rect = progressBarContainer.getBoundingClientRect();
                const clickX = event.clientX - rect.left;
                const percentage = (clickX / rect.width);
                const seekTo = percentage * playerInstance.getDuration();
                playerInstance.seek(seekTo);
                resetControlsTimeout(); // Reset timer kontrol setelah seek
            }
        });

        // --- Kontrol Keyboard ---
        document.addEventListener('keydown', (event) => {
            if (playerInstance) {
                switch (event.key) {
                    case 'Enter':
                    case ' ': // Spasi untuk play/pause
                        playerInstance.playToggle();
                        break;
                    case 'ArrowRight': // Panah kanan untuk fast forward
                        playerInstance.seek(playerInstance.getPosition() + 10);
                        break;
                    case 'ArrowLeft': // Panah kiri untuk rewind
                        playerInstance.seek(playerInstance.getPosition() - 10);
                        break;
                    case 'Escape': // Escape untuk kembali
                        window.history.back();
                        break;
                }
                resetControlsTimeout(); // Reset timer kontrol setelah interaksi keyboard
            }
        });

        // --- Manajemen Tampilan Kontrol Otomatis ---
        const hideControls = () => {
            // Sembunyikan kontrol (progress bar) hanya jika player sedang bermain DAN tidak buffering
            if (playerControls && playerInstance.getState() === 'playing' && playerInstance.getBuffer() === 100) {
                playerControls.style.display = 'none';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout); // Hapus timeout sebelumnya
            playerControls.style.display = 'flex'; // Pastikan kontrol terlihat

            // Hanya atur timeout untuk menyembunyikan kontrol jika tidak buffering
            if (playerInstance.getState() !== 'buffering') {
                controlsTimeout = setTimeout(hideControls, 3000); // Sembunyikan setelah 3 detik
            }
        };

        // Event untuk mendeteksi aktivitas pengguna (mouse, sentuh)
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        playerInstance.on('useractive', resetControlsTimeout);
        playerInstance.on('userinactive', hideControls);

    } else {
        // Jika tidak ada video, tampilkan pesan error dan arahkan kembali
        console.error('No video data found in sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama...</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});