document.addEventListener('DOMContentLoaded', () => {
    // ... (Variabel dan inisialisasi awal lainnya)
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const logoFile = sessionStorage.getItem('logoFile'); 
    
    // Ambil 3 variabel crop
    const cropMode = sessionStorage.getItem('videoCropMode') || 'fill'; 
    const cropPosition = sessionStorage.getItem('videoCropPosition') || '50% 50%'; 
    const cropScale = parseFloat(sessionStorage.getItem('videoCropScale')) || 1.2; 
    
    const playerElement = document.getElementById('player');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-container');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    
    let iklan2; 
    let adShown = false; 
    let adHideTimeout; 
    let controlsTimeout; 

    // === START: FUNGSI MEMBUAT DAN MENYISIPKAN IKLAN OLEH JS ===
    const createAdElement = () => {
        // ... (Logika pembuatan iklan tetap sama)
    };
    // === END: FUNGSI MEMBUAT DAN MENYISIPKAN IKLAN OLEH JS ===

    // ... (Logika Poster Image, Clock, formatTime, dan HLS inisialisasi tetap sama)

        // FUNGSI UNTUK MENAMPILKAN KONTROL
        const showControls = () => {
            document.querySelector('.custom-controls').style.opacity = '1';
            
            // Tampilkan tombol Play/Pause center jika sedang PAUSE
            if (playerElement.paused || playerElement.ended) {
                playPauseCenter.style.opacity = '1'; 
            } else {
                 playPauseCenter.style.opacity = '0'; 
            }
            
            resetControlsTimeout();
        };

        // FUNGSI UNTUK MENYEMBUNYIKAN KONTROL
        const hideControls = () => {
            document.querySelector('.custom-controls').style.opacity = '0';
            playPauseCenter.style.opacity = '0'; 
        };

        // FUNGSI RESET TIMEOUT KONTROL
        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (!playerElement.paused && !playerElement.ended) { 
                 controlsTimeout = setTimeout(hideControls, 5000); 
            }
        };
        
        // FUNGSI TOGGLE PLAY/PAUSE
        const playToggle = () => {
            if (playerElement.paused || playerElement.ended) {
                playerElement.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                hideAd();
                
            } else {
                playerElement.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                showAd();
            }
            showControls(); 
        };

        // FUNGSI IKLAN: Tampilkan Iklan
        const showAd = () => {
            // ... (Logika showAd tetap sama)
        };

        // FUNGSI IKLAN: Sembunyikan Iklan
        const hideAd = () => {
            // ... (Logika hideAd tetap sama)
        };


        // FUNGSI UPDATE PROGRESS BAR & TIME DISPLAY
        const updateTimeDisplayAndProgress = () => {
            if (!isNaN(playerElement.duration) && isFinite(playerElement.duration)) {
                const percentage = (playerElement.currentTime / playerElement.duration) * 100;
                progressBar.style.width = `${percentage}%`;
                
                timeDisplay.textContent = `${formatTime(playerElement.currentTime)} / ${formatTime(playerElement.duration)}`;
            } else {
                timeDisplay.textContent = `${formatTime(playerElement.currentTime)} / 0:00`;
                progressBar.style.width = '0%';
            }
        };


        // --- EVENT LISTENERS PLAYER ---
        playerElement.addEventListener('timeupdate', updateTimeDisplayAndProgress);
        playerElement.addEventListener('loadedmetadata', updateTimeDisplayAndProgress);
        
        playerElement.addEventListener('playing', () => {
             playIcon.style.display = 'none';
             pauseIcon.style.display = 'block';
             hideControls(); 
             hideAd();
             resetControlsTimeout();
        });

        playerElement.addEventListener('pause', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            showControls(); 
            showAd();
            clearTimeout(controlsTimeout); 
        });
        
        playerElement.addEventListener('ended', showControls);
        
        // --- EVENT LISTENER POSTER & KONTROL ---
        // ... (Logika poster, click, dan seeking tetap sama)


        // --- EVENT LISTENER KEYBOARD/REMOTE BARU ---
        document.addEventListener('keydown', (event) => {
            if (playerElement) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        playToggle();
                        break;
                    case 'ArrowRight':
                        playerElement.currentTime += 30; // 30 detik seek
                        updateTimeDisplayAndProgress(); 
                        showControls(); 
                        break;
                    case 'ArrowLeft':
                        playerElement.currentTime -= 30; // 30 detik seek
                        updateTimeDisplayAndProgress(); 
                        showControls(); 
                        break;
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });

        // ... (Event listeners mousemove, mousedown, touchstart tetap sama)

    // ... (Logika error/fallback tetap sama)
});