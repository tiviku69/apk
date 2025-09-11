window.onload = function() {
    // Ambil data dari sessionStorage
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');

    // Pastikan data ada sebelum memutar video
    if (videoLink) {
        // 1. Inisialisasi JW Player
        const playerInstance = jwplayer("player").setup({
            file: videoLink,
            title: videoTitle || "Sedang Memutar Film",
            autostart: false,
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

// ... (Kode untuk keydown listener telah diperbarui)
document.addEventListener('keydown', (event) => {
    const controls = document.getElementById('controls-wrapper'); // Pastikan id ini benar di HTML
    const focusableElements = controls.querySelectorAll('button'); // Ambil semua elemen tombol
    let currentFocusIndex = -1;

    // Temukan elemen yang sedang fokus
    focusableElements.forEach((el, index) => {
        if (document.activeElement === el) {
            currentFocusIndex = index;
        }
    });

    // Logika navigasi remote
    if (event.key === 'ArrowDown') {
        controls.style.display = 'flex';
        // Beri fokus ke tombol pertama jika belum ada yang fokus
        if (currentFocusIndex === -1 && focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            // Pindahkan fokus ke tombol berikutnya
            let nextIndex = (currentFocusIndex + 1) % focusableElements.length;
            focusableElements[nextIndex].focus();
        }
        event.preventDefault(); // Mencegah scrolling browser
    } else if (event.key === 'ArrowUp') {
        // Sembunyikan kontrol dan hapus fokus
        controls.style.display = 'none';
        if (document.activeElement) {
            document.activeElement.blur();
        }
        event.preventDefault(); // Mencegah scrolling browser
    } else if (event.key === 'ArrowLeft') {
        if (currentFocusIndex > 0) {
            focusableElements[currentFocusIndex - 1].focus();
        }
        event.preventDefault();
    } else if (event.key === 'ArrowRight') {
        if (currentFocusIndex < focusableElements.length - 1) {
            focusableElements[currentFocusIndex + 1].focus();
        }
        event.preventDefault();
    } else if (event.key === 'Enter') {
        if (document.activeElement) {
            document.activeElement.click();
        }
        event.preventDefault();
    }
});