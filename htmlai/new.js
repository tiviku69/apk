document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const loadingSpinner = document.getElementById('loading-spinner');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    const videoElement = document.getElementById('plyr-video');
    let playerInstance;
    let controlsTimeout;

    // --- FUNGSI JAM DIGITAL ---
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();
    // --------------------------

    // --- FUNGSI HLS.JS & PLYR ---
    function setupHlsAndPlyr(url, videoEl) {
        const isHls = url && url.endsWith('.m3u8');
        let player;
        
        // Opsi Plyr: controls: [] untuk menghilangkan semua kontrol bawaan Plyr
        const plyrOptions = {
            controls: [], 
            settings: ['quality', 'speed', 'captions'],
            autoplay: false,
        };

        if (isHls && Hls.isSupported()) {
            console.log("Menggunakan hls.js untuk stream HLS.");
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(videoEl);

            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                player = new Plyr(videoEl, plyrOptions);
                setupPlayerEvents(player);
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('HLS fatal error:', data);
                    videoEl.src = url;
                    player = new Plyr(videoEl, plyrOptions);
                    setupPlayerEvents(player);
                }
            });

        } else {
            console.log("Menggunakan Plyr native.");
            videoEl.src = url;
            player = new Plyr(videoEl, plyrOptions);
            setupPlayerEvents(player);
        }

        return player;
    }

    // --- SETUP EVENT PLAYER ---
    function setupPlayerEvents(player) {
        playerInstance = player;
        
        const handlePlay = () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        };

        const handlePause = () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        };

        const handleEnded = () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
        };

        const handleWaiting = () => {
            console.log("Video sedang buffering (Waiting).");
            loadingSpinner.style.display = 'block';
        };
        
        const handlePlaying = () => {
            loadingSpinner.style.display = 'none';
        };

        player.on('ready', () => {
            console.log("Plyr is ready.");
            resetControlsTimeout();
        });
        player.on('play', handlePlay);
        player.on('pause', handlePause);
        player.on('ended', handleEnded);
        player.on('waiting', handleWaiting);
        player.on('playing', handlePlaying);
    }
    // ------------------------------------

    // --- LOGIKA KONTROL KUSTOM ---
    const hideControls = () => {
        if (playerInstance && playerInstance.playing) {
            videoTitleContainer.style.opacity = '0';
            document.querySelector('.logo-container').style.opacity = '0';
            digitalClock.style.opacity = '0';
        }
    };
    
    const showControls = () => {
        videoTitleContainer.style.opacity = '1';
        document.querySelector('.logo-container').style.opacity = '1';
        digitalClock.style.opacity = '1';
    };

    const resetControlsTimeout = () => {
        clearTimeout(controlsTimeout);
        showControls();
        controlsTimeout = setTimeout(hideControls, 3000);
    };

    // --- INITIALIZATION ---
    if (videoLink) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
        }
        
        setupHlsAndPlyr(videoLink, videoElement);

        // Play/Pause Tengah
        playPauseCenter.addEventListener('click', () => {
            if (playerInstance) playerInstance.togglePlay();
        });

        // Keydown Events untuk Remote Android TV
        document.addEventListener('keydown', (event) => {
            if (playerInstance) {
                // Menggunakan event.key (standar) atau event.keyCode (kompatibilitas TV/lama)
                const key = event.key || event.keyCode; 
                let action_key = null;
                
                switch (key) {
                    // Tombol Tengah / ENTER / OK / Spacebar
                    case 'Enter':
                    case 13: // Kode Kunci ENTER/OK
                    case ' ':
                    case 32: // Kode Kunci SPACEBAR
                    case 'MediaPlayPause': 
                        playerInstance.togglePlay();
                        action_key = 'play';
                        break;
                    
                    // Tombol Kanan (Seek Forward)
                    case 'ArrowRight':
                    case 39: // Kode Kunci Right Arrow
                    case 22: // Kode Kunci D-pad Right (Android TV)
                    case 'MediaFastForward':
                        playerInstance.forward(10);
                        action_key = 'seek';
                        break;
                        
                    // Tombol Kiri (Seek Backward)
                    case 'ArrowLeft':
                    case 37: // Kode Kunci Left Arrow
                    case 21: // Kode Kunci D-pad Left (Android TV)
                    case 'MediaRewind':
                        playerInstance.rewind(10);
                        action_key = 'seek';
                        break;
                        
                    // Tombol Back (Keluar dari player)
                    case 'Escape':
                    case 4: // Kode Kunci Back (Android TV)
                    case 'Backspace': 
                        window.history.back();
                        action_key = 'back';
                        break;
                        
                    // Tombol Atas/Bawah (untuk menampilkan kontrol)
                    case 'ArrowUp':
                    case 38: // Kode Kunci Up Arrow
                    case 19: // Kode Kunci D-pad Up
                    case 'ArrowDown':
                    case 40: // Kode Kunci Down Arrow
                    case 20: // Kode Kunci D-pad Down
                        action_key = 'ui';
                        break;
                }
                
                // Jika tombol navigasi ditekan, cegah tindakan default browser dan tampilkan UI kustom
                if (action_key) {
                    event.preventDefault(); 
                    resetControlsTimeout();
                }
            }
        });

        // Event interaksi mouse/touch untuk mereset timeout UI kustom
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});