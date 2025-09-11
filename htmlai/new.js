window.onload = function() {
    // Ambil data dari sessionStorage
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');

    // Pastikan data ada sebelum memutar video
    if (videoLink) {
        // 1. Inisialisasi JW Player
        const playerInstance = jwplayer("player").setup({
            file: videoLink, // Gunakan link video dari sessionStorage
            title: videoTitle || "Sedang Memutar Film", // Gunakan judul dari sessionStorage
            autostart: true, // Ubah agar video otomatis diputar
            controls: false,
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
                }
            }
        });
        
        // ... (Kode untuk kontrol kustom tetap sama)
        const playPauseBtn = document.getElementById('play-pause-btn');
        const ffBtn = document.getElementById('ff-btn');
        const rwBtn = document.getElementById('rw-btn');
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (playerInstance.getState() === 'playing') {
                    playerInstance.pause();
                    playPauseBtn.innerHTML = "<b>▶</b>";
                } else {
                    playerInstance.play();
                    playPauseBtn.innerHTML = "<b>❚❚</b>";
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
    } else {
        // Tampilkan pesan jika tidak ada video yang dipilih
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
    }
};

// ... (Kode untuk keydown listener tetap sama)
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
        controls.style.display = 'flex';
    }
    if (event.key === 'ArrowUp') {
        controls.style.display = 'none';
    }
});