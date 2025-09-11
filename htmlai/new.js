window.onload = function() {
    // Ambil data dari sessionStorage
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const playerControls = document.getElementById('player-controls'); // Ambil elemen kontrol

    if (videoLink) {
        // Inisialisasi JW Player
        const playerInstance = jwplayer("player").setup({
            file: videoLink,
            title: videoTitle || "Sedang Memutar Film",
            autostart: true, // Ubah agar video otomatis diputar saat halaman dimuat
            controls: false, // Kita akan menggunakan kontrol kustom
            width: "100%",
            aspectratio: "16:9",
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
            events: {
                onReady: function() {
                    console.log("JW Player is ready.");
                    playerInstance.play(); // Pastikan mulai memutar
                },
                onPlay: function() {
                    if (playPauseBtn) playPauseBtn.innerHTML = "<b>❚❚</b>";
                },
                onPause: function() {
                    if (playPauseBtn) playPauseBtn.innerHTML = "<b>▶</b>";
                },
                onComplete: function() {
                    console.log("Video finished playing.");
                    // Anda bisa tambahkan logika untuk kembali ke halaman sebelumnya
                    // window.location.href = 'index.html';
                }
            }
        });
        
        // --- Kustom Kontrol ---
        const playPauseBtn = document.getElementById('play-pause-btn');
        const ffBtn = document.getElementById('ff-btn');
        const rwBtn = document.getElementById('rw-btn');
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (playerInstance.getState() === 'playing') {
                    playerInstance.pause();
                } else {
                    playerInstance.play();
                }
            });
        }

        if (ffBtn) {
            ffBtn.addEventListener('click', () => {
                playerInstance.seek(playerInstance.getPosition() + 10);
            });
        }

        if (rwBtn) {
            rwBtn.addEventListener('click', () => {
                playerInstance.seek(playerInstance.getPosition() - 10);
            });
        }

        // Keydown listener untuk kontrol remote
        document.addEventListener('keydown', (event) => {
            if (playerControls) {
                // Tampilkan kontrol saat tombol remote ditekan
                playerControls.style.display = 'flex';

                switch (event.key) {
                    case 'Enter':
                    case 'Space': // Spasi juga sering digunakan untuk play/pause
                        if (playerInstance.getState() === 'playing') {
                            playerInstance.pause();
                        } else {
                            playerInstance.play();
                        }
                        break;
                    case 'ArrowRight':
                        playerInstance.seek(playerInstance.getPosition() + 10); // Maju 10 detik
                        break;
                    case 'ArrowLeft':
                        playerInstance.seek(playerInstance.getPosition() - 10); // Mundur 10 detik
                        break;
                    case 'Backspace': // Atau tombol "Back" pada remote TV
                    case 'Escape': // Untuk keluar dari pemutar
                        // Kembali ke halaman sebelumnya
                        window.history.back(); 
                        // Atau secara spesifik ke index.html
                        // window.location.href = 'index.html';
                        break;
                }
            }
        });

        // Sembunyikan kontrol setelah beberapa waktu tidak aktif
        let controlsTimeout;
        const hideControls = () => {
            if (playerControls && playerInstance.getState() === 'playing') { // Hanya sembunyikan jika sedang memutar
                playerControls.style.display = 'none';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) playerControls.style.display = 'flex'; // Tampilkan kontrol
            controlsTimeout = setTimeout(hideControls, 3000); // Sembunyikan setelah 3 detik
        };

        // Reset timeout setiap kali ada interaksi
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('keydown', resetControlsTimeout);
        playerInstance.on('useractive', resetControlsTimeout); // JW Player event untuk interaksi user
        playerInstance.on('userinactive', hideControls); // JW Player event untuk user tidak aktif

        // Mulai timeout saat player siap
        playerInstance.onReady(resetControlsTimeout);

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        // Arahkan kembali setelah beberapa detik
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
};