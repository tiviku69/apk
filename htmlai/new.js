document.addEventListener('DOMContentLoaded', () => {
    // Ambil data dari sessionStorage
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    
    // Ambil elemen HTML
    const playerControls = document.getElementById('player-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const ffBtn = document.getElementById('ff-btn');
    const rwBtn = document.getElementById('rw-btn');
    const progressBar = document.getElementById('progress-bar');
    const bufferedBar = document.getElementById('buffered-bar'); // Elemen untuk buffering
    const loadingSpinner = document.getElementById('loading-spinner');

    let playerInstance;
    let controlsTimeout;

    if (videoLink) {
        // Inisialisasi JW Player
        playerInstance = jwplayer("player").setup({
            file: videoLink,
            title: videoTitle || "Sedang Memutar Film",
            autostart: true, // Ubah agar video otomatis diputar saat halaman dimuat
            controls: false, // Gunakan kontrol kustom
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
        playerInstance.on('ready', () => {
            console.log("JW Player is ready.");
            if (playerControls) playerControls.style.display = 'flex';
            resetControlsTimeout();
        });

        playerInstance.on('buffer', () => {
            // Tampilkan spinner loading saat buffering
            loadingSpinner.style.display = 'block';
        });

        playerInstance.on('play', () => {
            // Sembunyikan spinner saat video mulai diputar
            loadingSpinner.style.display = 'none';
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>";
            resetControlsTimeout();
        });

        playerInstance.on('pause', () => {
            // Sembunyikan spinner saat video dijeda
            loadingSpinner.style.display = 'none';
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>";
            clearTimeout(controlsTimeout);
        });
        
        // Event untuk memperbarui progress bar waktu dan buffering
        playerInstance.on('time', (data) => {
            const duration = data.duration;
            const position = data.position;
            const buffered = playerInstance.getBuffered();

            if (duration > 0) {
                // Perbarui progress bar pemutaran (merah)
                const progressPercentage = (position / duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;

                // Perbarui progress bar buffering (putih)
                const bufferedPercentage = (buffered / duration) * 100;
                bufferedBar.style.width = `${bufferedPercentage}%`;
            }
        });

        // ... (kode event listener lainnya, seperti seek, complete, dll., tetap sama) ...
        
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
        
        // ... (kode kontrol keyboard dan manajemen tampilan kontrol otomatis tetap sama) ...
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