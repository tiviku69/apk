window.onload = function() {
    const videoFile = sessionStorage.getItem('videoFile') || videoUrl;
    const logoFile = sessionStorage.getItem('logoFile');
    const textFile = sessionStorage.getItem('textFile');

    if (videoFile) {
        var playerInstance = jwplayer("player").setup({
            file: videoFile,
            width: "100%",
            height: "100%",
            controls: false,
            sharing: false,
            displaytitle: true,
            displaydescription: true,
            title: textFile || "Default Title", // Use textFile if available
            description: "Kamu Sedang Nonton", // Optional: Use textFile here if needed
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
            }
        });
        const playPauseBtn = document.getElementById('play-pause-btn');
        const progressBar = document.getElementById('progress-bar');

        // Tambahkan event listener untuk tombol play/pause
        playPauseBtn.addEventListener('click', () => {
            if (playerInstance.getState() === 'playing') {
                playerInstance.pause();
                playPauseBtn.textContent = 'Play';
            } else {
                playerInstance.play();
                playPauseBtn.textContent = 'Pause';
            }
        });

        // Tambahkan event listener untuk progress bar
        playerInstance.on('time', (data) => {
            const progress = (data.position / data.duration) * 100;
            progressBar.value = progress;
        });

        progressBar.addEventListener('input', () => {
            const seekPosition = (progressBar.value / 100) * playerInstance.getDuration();
            playerInstance.seek(seekPosition);
        });
    }
};