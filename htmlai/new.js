document.addEventListener('DOMContentLoaded', () => {
    // Ambil data dari sessionStorage
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerControls = document.getElementById('player-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const ffBtn = document.getElementById('ff-btn');
    const rwBtn = document.getElementById('rw-btn');
    const progressBar = document.getElementById('progress-bar');
    const loadingOverlay = document.getElementById('loadingOverlay'); // Dapatkan elemen overlay buffering

    let playerInstance;
    let controlsTimeout;

    if (videoLink) {
        // Inisialisasi JW Player
        playerInstance = jwplayer("player").setup({
            file: videoLink, // URL video dari sessionStorage
            title: videoTitle || "Sedang Memutar Film",
            autostart: false, // Video otomatis diputar saat halaman dimuat
            controls: false, // Menggunakan kontrol kustom
            width: "100%",
            displaytitle: true,
            displaydescription: true,
            description: "Kamu Sedang Nonton",
            skin: {
                name: "netflix" // Menggunakan skin Netflix JW Player
            },
            captions: {
                color: "#FFF",
                fontSize: 14,
                backgroundOpacity: 0,
                edgeStyle: "raised"
            }
        });

        // --- Fungsi Helper untuk Overlay Buffering ---
        const showLoadingOverlay = () => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('active');
            }
        };

        const hideLoadingOverlay = () => {
            if (loadingOverlay) {
                loadingOverlay.classList.remove('active');
            }
        };

        // --- Event Listener JW Player ---
        playerInstance.on('ready', () => {
            console.log("JW Player is ready.");
            // Karena autostart: true, kemungkinan akan langsung buffering, tampilkan overlay di awal
            showLoadingOverlay();
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>"; // Atur tombol ke pause
            if (playerControls) playerControls.style.display = 'flex'; // Tampilkan kontrol
            resetControlsTimeout(); // Mulai timeout untuk menyembunyikan kontrol
        });

        playerInstance.on('play', () => {
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>"; // Atur tombol ke pause
            hideLoadingOverlay(); // Sembunyikan overlay buffering saat video play
            resetControlsTimeout(); // Reset timeout kontrol
        });

        playerInstance.on('pause', () => {
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>"; // Atur tombol ke play
            clearTimeout(controlsTimeout); // Hentikan timeout menyembunyikan kontrol saat pause
        });

        playerInstance.on('buffer', () => {
            // Tampilkan overlay buffering saat JW Player sedang menunggu data
            showLoadingOverlay();
        });

        playerInstance.on('playing', () => {
            // Sembunyikan overlay buffering saat video mulai diputar setelah buffering
            hideLoadingOverlay();
        });
        
        playerInstance.on('firstFrame', () => {
            // Jika video langsung play tanpa buffer, ini bisa jadi trigger tambahan untuk hide
            hideLoadingOverlay();
        });

        playerInstance.on('complete', () => {
            console.log("Video finished playing.");
            if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>"; // Reset tombol ke play
            hideLoadingOverlay(); // Pastikan overlay tersembunyi jika video selesai
            clearTimeout(controlsTimeout); // Hentikan timeout kontrol
            if (playerControls) playerControls.style.display = 'flex'; // Tampilkan kontrol setelah selesai
        });

        playerInstance.on('error', () => {
            console.error("Terjadi kesalahan pada JW Player!");
            hideLoadingOverlay(); // Sembunyikan overlay jika ada error
            // Anda bisa menambahkan logika lain di sini, seperti menampilkan pesan error
        });

        // Event listener untuk memperbarui progress bar
        playerInstance.on('time', (data) => {
            if (progressBar && data.duration > 0) {
                const progressPercentage = (data.position / data.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
        });

        // --- Kustom Kontrol Tombol ---
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                playerInstance.playToggle(); // Toggle play/pause
                resetControlsTimeout(); // Reset timeout setelah interaksi
            });
        }

        if (ffBtn) {
            ffBtn.addEventListener('click', () => {
                playerInstance.seek(playerInstance.getPosition() + 10); // Maju 10 detik
                resetControlsTimeout();
            });
        }

        if (rwBtn) {
            rwBtn.addEventListener('click', () => {
                playerInstance.seek(playerInstance.getPosition() - 10); // Mundur 10 detik
                resetControlsTimeout();
            });
        }

        // --- Kontrol Keyboard ---
        document.addEventListener('keydown', (event) => {
            if (playerInstance) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault(); // Mencegah scrolling halaman saat menekan spasi
                        playerInstance.playToggle();
                        break;
                    case 'ArrowRight':
                        playerInstance.seek(playerInstance.getPosition() + 10);
                        break;
                    case 'ArrowLeft':
                        playerInstance.seek(playerInstance.getPosition() - 10);
                        break;
                    case 'Escape':
                        window.history.back(); // Kembali ke halaman sebelumnya
                        break;
                }
                resetControlsTimeout(); // Reset timeout kontrol setelah interaksi keyboard
            }
        });

        // --- Manajemen Tampilan Kontrol Otomatis ---
        const hideControls = () => {
            // Sembunyikan kontrol hanya jika video sedang diputar
            if (playerControls && playerInstance.getState() === 'playing') {
                playerControls.style.display = 'none';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout); // Hapus timeout sebelumnya
            if (playerControls) playerControls.style.display = 'flex'; // Tampilkan kontrol
            controlsTimeout = setTimeout(hideControls, 3000); // Atur timeout baru (3 detik)
        };

        // Event untuk mendeteksi aktivitas pengguna dan menampilkan kontrol
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        playerInstance.on('useractive', resetControlsTimeout); // Event JW Player untuk aktivitas pengguna
        playerInstance.on('userinactive', hideControls); // Event JW Player untuk tidak adanya aktivitas

        // Logika klik pada area player untuk menampilkan/menyembunyikan kontrol
        document.getElementById('player').addEventListener('click', (event) => {
            // Cek apakah klik tidak berasal dari dalam elemen kontrol kustom atau elemen internal JW Player
            const isClickOnCustomControl = event.target.closest('.custom-controls');
            const isClickOnJWPlayerElement = event.target.closest('.jw-controls') || event.target.classList.contains('jw-wrapper');
            
            if (!isClickOnCustomControl && !isClickOnJWPlayerElement) {
                if (playerControls.style.display === 'flex') {
                    hideControls();
                } else {
                    resetControlsTimeout(); // Tampilkan kontrol jika tersembunyi
                }
            }
        });

    } else {
        // Jika tidak ada data video di sessionStorage, tampilkan pesan error dan kembali
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html'; // Kembali ke index.html
        }, 3000);
    }
});