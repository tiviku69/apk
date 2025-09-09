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
            
            captions: {
                color: "#FFF",
                fontSize: 14,
                backgroundOpacity: 0,
                edgeStyle: "raised"
            },
            
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
    }
};

document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter') {
            controls.style.display = 'flex';
        }
        if (event.key === 'ArrowUp') {
            controls.style.display = 'none';
        }
    });