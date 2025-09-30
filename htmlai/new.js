document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    
    // MENGGANTI JWPLAYER INSTANCE DENGAN ELEMEN VIDEO
    const videoElement = document.getElementById('video-element'); 
    let hlsInstance; 
    let playerInstance = videoElement; // Menggunakan videoElement sebagai playerInstance
    
    // MENDAPATKAN SEMUA ELEMEN KONTROL
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    
    let controlsTimeout;

    // --- FUNGSI UTILITY ---
    
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${paddedSeconds}`;
    };

    // --- FUNGSI KONTROL ---

    const hideControls = () => {
        if (playerControls && !playerInstance.paused && !playerInstance.seeking) {
            playerControls.style.display = 'none';
        }
    };
    
    const resetControlsTimeout = () => {
        clearTimeout(controlsTimeout);
        if (playerControls) playerControls.style.display = 'flex';
        controlsTimeout = setTimeout(hideControls, 3000);
        // Pastikan judul juga terlihat saat kontrol muncul
        videoTitleContainer.style.opacity = '1';
    };

    // --- INISIALISASI PLAYER ---

    if (videoLink) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
        }
        
        // --- HLS.JS SETUP ---
        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(videoLink);
            hlsInstance.attachMedia(videoElement);
            
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                // Video siap, tampilkan kontrol
                console.log("HLS Manifest Parsed. Video siap.");
                playerControls.style.display = 'flex';
                resetControlsTimeout();
            });
            
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    console.error('HLS Fatal Error:', data.details);
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Kesalahan jaringan, mencoba memuat ulang.");
                            hlsInstance.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Kesalahan media, mencoba pemulihan.");
                            hlsInstance.recoverMediaError();
                            break;
                        default:
                            // Kesalahan fatal lainnya, hancurkan hls.js dan coba fallback ke HTML5 native
                            hlsInstance.destroy();
                            videoElement.src = videoLink; // Fallback
                            console.log("Menggunakan fallback HTML5 native.");
                            break;
                    }
                }
            });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl') || videoElement.canPlayType('application/x-mpegurl')) {
            // Browser native mendukung HLS (e.g., Safari di iOS/macOS)
            videoElement.src = videoLink;
            videoElement.addEventListener('loadedmetadata', () => {
                 playerControls.style.display = 'flex';
                 resetControlsTimeout();
            });
        } else {
            console.error('Browser tidak mendukung HLS.');
            document.body.innerHTML = '<h1>Browser Anda tidak mendukung streaming HLS.</h1>';
            return; // Hentikan eksekusi script
        }
        
        // --- EVENT LISTENER UNTUK ELEMEN VIDEO HTML5 ---

        // Mengganti playerInstance.playToggle()
        const playToggle = () => {
            if (playerInstance.paused || playerInstance.ended) {
                playerInstance.play().catch(e => console.error("Error playing video:", e));
            } else {
                playerInstance.pause();
            }
        };

        // EVENT: Memuat / Buffering
        playerInstance.addEventListener('waiting', () => {
            console.log("Video sedang buffering.");
            loadingSpinner.style.display = 'block';
        });

        // EVENT: Mulai Diputar (atau sudah cukup buffer)
        playerInstance.addEventListener('playing', () => {
            console.log("Video mulai diputar.");
            loadingSpinner.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0'; // Sembunyikan judul
            resetControlsTimeout();
        });
        
        // EVENT: Dijeda
        playerInstance.addEventListener('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
        });

        // EVENT: Selesai
        playerInstance.addEventListener('ended', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
            playIcon.style.display = 'block'; // Tampilkan ikon play
            pauseIcon.style.display = 'none';
        });

        // EVENT: Update Waktu (Time)
        playerInstance.addEventListener('timeupdate', () => {
            const data = {
                position: playerInstance.currentTime,
                duration: playerInstance.duration
            };
            
            if (progressBar && data.duration && isFinite(data.duration) && data.duration > 0) {
                const progressPercentage = (data.position / data.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(data.position);
                const totalDuration = formatTime(data.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });
        
        // --- KONTROL MANUAL DAN KEYBOARD ---

        // Klik Play/Pause di tengah
        playPauseCenter.addEventListener('click', playToggle);
        
        // Klik di Progress Bar Container (Belum diimplementasikan dari kode lama, tetapi harusnya berfungsi)
        const progressBarContainer = document.getElementById('progress-bar-container');
        progressBarContainer.addEventListener('click', (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const newTime = pos * playerInstance.duration;
            
            if (newTime >= 0 && newTime <= playerInstance.duration) {
                playerInstance.currentTime = newTime;
                resetControlsTimeout();
            }
        });
        

        // Kontrol Keyboard
        document.addEventListener('keydown', (event) => {
            if (playerInstance) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault(); // Mencegah scroll saat menekan spasi
                        playToggle();
                        break;
                    case 'ArrowRight':
                        playerInstance.currentTime += 10;
                        break;
                    case 'ArrowLeft':
                        playerInstance.currentTime -= 10;
                        break;
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });

        // Kontrol Mouse/Sentuh (untuk menampilkan/menyembunyikan kontrol)
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        
    } else {
        // Jika tidak ada data video
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});