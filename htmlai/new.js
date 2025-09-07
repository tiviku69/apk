window.onload = function() {
    const videoFile = sessionStorage.getItem('videoFile') || 'URL_VIDEO_ANDA_DI_SINI.mp4';
    const textFile = sessionStorage.getItem('textFile') || "Default Title";

    if (videoFile) {
        // 1. Inisialisasi JW Player tanpa kontrol bawaan
        const playerInstance = jwplayer("player").setup({
            file: videoFile,
            title: textFile,
            autostart: false,
            controls: false, // Penting: ini akan menyembunyikan kontrol bawaan
            width: "100%",
            aspectratio: "16:9",
            displaytitle: true,
            displaydescription: true,
            description: "Kamu Sedang Nonton",
            skin: {
                name: "netflix"
            },
            logo: {
                file: "https://filmovie.github.io/tiviku/gambar/tiviku.png",
            },
            captions: {
                color: "#FFF",
                fontSize: 14,
                backgroundOpacity: 0,
                edgeStyle: "raised"
            },
            // Menghapus playerInstance.play() dari sini
            events: {
                onReady: function() {
                    console.log("JW Player is ready. Video will not autoplay.");
                }
            }
        });

        // 2. Hubungkan kontrol kustom dengan API JW Player
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

        // 3. Tambahkan navigasi remote Android TV
        document.addEventListener('keydown', (event) => {
            console.log("Key pressed:", event.key, "with code:", event.keyCode);
            
            if (!document.activeElement.matches('.controls__button')) {
                playPauseBtn.focus();
            }

            switch (event.key) {
                case "Enter":
                case " " :
                    document.activeElement.click();
                    break;
                case "ArrowRight":
                    if (document.activeElement === rwBtn) {
                        playPauseBtn.focus();
                    } else if (document.activeElement === playPauseBtn) {
                        ffBtn.focus();
                    }
                    break;
                case "ArrowLeft":
                    if (document.activeElement === ffBtn) {
                        playPauseBtn.focus();
                    } else if (document.activeElement === playPauseBtn) {
                        rwBtn.focus();
                    }
                    break;
            }
        });
    }
};
