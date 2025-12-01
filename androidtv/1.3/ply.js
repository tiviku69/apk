document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const logoFile = sessionStorage.getItem('logoFile'); 
    
    // START MODIFIKASI KRITIS: Ambil 3 variabel crop
    const cropMode = sessionStorage.getItem('videoCropMode') || 'fill'; // Default 'fill'
    const cropPosition = sessionStorage.getItem('videoCropPosition') || '50% 50%'; 
    const cropScale = parseFloat(sessionStorage.getItem('videoCropScale')) || 1.2; // Nilai skala default 1.2
    // END MODIFIKASI KRITIS
    
    const playerElement = document.getElementById('player');
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    const posterGradientOverlay = document.getElementById('poster-gradient-overlay'); 
    
    const videoOverlayEffect = document.getElementById('video-overlay-effect');
    
    // Hapus: const iklan2 = document.getElementById('iklan2');
    let iklan2; // Didefinisikan sebagai variabel untuk diisi nanti
    
    let adShown = false; 
    let adHideTimeout; 

    let controlsTimeout;
    
    const initialFontSizeVW = 2.0; 
    
    // === START: FUNGSI MEMBUAT DAN MENYISIPKAN IKLAN OLEH JS ===
    const createAdElement = () => {
        // Kontainer terluar: .iklan-container
        const iklanContainer = document.createElement('div');
        iklanContainer.className = 'iklan-container';
        
        // Kontainer Iklan 1: #iklan
        const iklan = document.createElement('div');
        iklan.id = 'iklan';
        
        // Kontainer Iklan 2: #iklan2 (Element yang digeser)
        iklan2 = document.createElement('div'); // Menetapkan ke variabel global iklan2
        iklan2.id = 'iklan2';
        iklan2.innerHTML = 'INFO TERBARU<br>GABUNG DI SINI<br>( https://t.me/tiviku )'; // Isi teks iklan
        
        // Membangun struktur
        iklan.appendChild(iklan2);
        iklanContainer.appendChild(iklan);
        
        // Menyisipkan ke dalam body
        document.body.appendChild(iklanContainer);
        console.log("Elemen iklan berhasil dibuat dan disisipkan.");
    };
    // === END: FUNGSI MEMBUAT DAN MENYISIPKAN IKLAN OLEH JS ===

    const adjustTitleFontSize = () => {
        let currentSize = initialFontSizeVW;
        
        const maxLinesHeight = window.innerHeight * 0.2; 
        
        videoTitleContainer.style.fontSize = `${initialFontSizeVW}vw`;
        
        videoTitleContainer.style.maxHeight = 'none'; 
        videoTitleContainer.style.overflowY = 'visible'; 
        
        while (videoTitleContainer.offsetHeight > maxLinesHeight && currentSize > 1.0) {
            currentSize -= 0.1; 
            videoTitleContainer.style.fontSize = `${currentSize}vw`;
            if (currentSize <= 1.0) break; 
        }
        
        videoTitleContainer.style.maxHeight = `${maxLinesHeight}px`;
        videoTitleContainer.style.overflowY = 'hidden'; 
    };

    const posterImage = document.createElement('img');
    posterImage.id = 'video-poster';
    posterImage.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        object-fit: fill; 
        z-index: 1000; 
        display: none; 
    `;
    document.body.insertBefore(posterImage, playerElement); 

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // START MODIFIKASI: FUNGSI BARU UNTUK MEMUAT VIDEO (Mendukung HLS)
    const loadVideo = (link) => {
        if (Hls.isSupported() && link.endsWith('.m3u8')) {
            // Gunakan hls.js untuk HLS stream
            const hls = new Hls();
            hls.loadSource(link);
            hls.attachMedia(playerElement);
            console.log("Memuat video menggunakan HLS.js");

            // Tambahkan event listener untuk error HLS
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Kesalahan Jaringan fatal, mencoba memuat ulang:", data);
                            hls.recoverMediaError();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Kesalahan Media fatal, mencoba memuat ulang:", data);
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error("Kesalahan HLS fatal yang tidak tertangani:", data);
                            hls.destroy();
                            break;
                    }
                }
            });

        } else if (playerElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Jika browser mendukung HLS secara native (misalnya Safari di iOS/macOS)
            playerElement.src = link;
            console.log("Memuat video menggunakan dukungan HLS native.");
        } 
        else {
            // Default: Asumsikan MP4 atau format yang didukung HTML5 lainnya
            playerElement.src = link;
            console.log("Memuat video menggunakan HTML5 Video standar.");
        }
    }
    // END MODIFIKASI

    if (videoLink) {
        // Panggil fungsi untuk membuat iklan setelah DOMContentLoaded
        createAdElement(); 
        
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
            adjustTitleFontSize(); 
        }
        
        // **MODIFIKASI KRITIS:** Panggil fungsi baru untuk memuat video
        loadVideo(videoLink);
        // playerElement.src = videoLink; // DIHAPUS/DIGANTI dengan loadVideo

        // **START LOGIKA PENGATURAN TAMPILAN VIDEO (KRITIS)**
        // 1. Reset semua properti custom (penting!)
        playerElement.style.objectFit = 'fill'; 
        playerElement.style.objectPosition = '50% 50%';
        playerElement.style.transform = 'none'; 

        if (cropMode === 'cover') {
            // MODE 1: Zoom/Crop Standar (Tidak ada peregangan/distorsi, potong bisa di samping)
            playerElement.style.objectFit = 'cover'; 
            playerElement.style.objectPosition = cropPosition; 
            console.log("Mode Video: COVER (Zoom/Crop Standar)");

        } else if (cropMode === 'stretch_crop') { 
            // MODE 2: BARU - Potong Atas/Bawah + Meregangkan Horizontal (ADA DISTORSI)
            playerElement.style.objectFit = 'fill'; 
            playerElement.style.transform = `scaleY(${cropScale})`; 
            playerElement.style.objectPosition = '50% 50%';
            console.log(`Mode Video: STRETCH_CROP (Peregangan + Potong Vertikal, Skala: ${cropScale})`);

        } else if (cropMode === 'fill_width') { 
            // MODE 3: Potong Atas/Bawah saja, lebar terisi (TIDAK ADA DISTORSI)
            playerElement.style.objectFit = 'contain'; 
            playerElement.style.transform = `scaleY(${cropScale})`; 
            playerElement.style.objectPosition = '50% 50%';
            console.log(`Mode Video: FILL_WIDTH (Potong Vertikal, Skala: ${cropScale})`);

        } else {
            // MODE 4: Default - 'fill' (Hanya Meregang Penuh, TIDAK ADA POTONGAN)
            playerElement.style.objectFit = 'fill'; 
            console.log("Mode Video: FILL (Melebar/Meregang Penuh)");
        }
        // **END LOGIKA PENGATURAN TAMPILAN VIDEO**

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(adjustTitleFontSize, 100);
        });
        
        if (logoFile) {
            posterImage.src = logoFile;
            posterImage.style.display = 'block'; 
            posterGradientOverlay.style.display = 'block'; 
            playerElement.style.display = 'none'; 
            videoOverlayEffect.style.display = 'none'; 
        } else {
            playerElement.style.display = 'block';
            playPauseCenter.style.opacity = '0';
            videoOverlayEffect.style.display = 'none'; 
        }

        // START MODIFIKASI FUNGSI formatTime
        const formatTime = (seconds) => {
            if (isNaN(seconds) || seconds < 0) return '0:00';
            
            let hours = Math.floor(seconds / 3600);
            let minutes = Math.floor((seconds % 3600) / 60);
            let remainingSeconds = Math.floor(seconds % 60);

            let timeString = '';

            // Jika durasi >= 1 jam, atau jika total durasi mencapai 1 jam, tampilkan jam
            if (hours > 0 || playerElement.duration >= 3600) {
                timeString += hours + ':';
                minutes = String(minutes).padStart(2, '0'); // Pad minutes jika jam ditampilkan
            }
            
            // Minutes (dipad 2 digit jika jam ditampilkan, 1 digit jika tidak)
            timeString += minutes + ':';
            
            // Seconds (selalu dipad 2 digit)
            timeString += String(remainingSeconds).padStart(2, '0');
            
            return timeString;
        };
        // END MODIFIKASI FUNGSI formatTime

        const playToggle = () => {
            if (playerElement.paused) {
                posterImage.style.display = 'none';
                posterGradientOverlay.style.display = 'none'; 
                playerElement.style.display = 'block';

                videoOverlayEffect.style.opacity = '0';
                setTimeout(() => { videoOverlayEffect.style.display = 'none'; }, 300); 
                
                playerElement.play().catch(error => {
                    console.error("Gagal memutar video:", error);
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                    playPauseCenter.style.opacity = '1';
                    
                    if (logoFile) {
                        posterImage.style.display = 'block';
                        posterGradientOverlay.style.display = 'block';
                        playerElement.style.display = 'none';
                    }
                    else {
                        videoOverlayEffect.style.display = 'block';
                        videoOverlayEffect.style.opacity = '1';
                    }
                });
            } else {
                playerElement.pause();
            }
        };

        const hideControls = () => {
            if (playerControls && !playerElement.paused) {
                playerControls.style.display = 'none';
                videoTitleContainer.style.opacity = '0';
            }
        };

        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            if (playerControls) playerControls.style.display = 'flex';
            videoTitleContainer.style.opacity = '1';
            
            if (!playerElement.paused) {
                controlsTimeout = setTimeout(hideControls, 3000);
            }
        };

        playerElement.addEventListener('canplay', () => {
            console.log("Video siap diputar.");
            if (playerControls) playerControls.style.display = 'flex';
            resetControlsTimeout();
        });

        playerElement.addEventListener('play', () => {
            console.log("Video mulai diputar.");
            posterImage.style.display = 'none'; 
            posterGradientOverlay.style.display = 'none'; 
            playerElement.style.display = 'block'; 

            videoOverlayEffect.style.opacity = '0';
            setTimeout(() => { videoOverlayEffect.style.display = 'none'; }, 300); 

            playPauseCenter.style.opacity = '0';
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            videoTitleContainer.style.opacity = '0';
            resetControlsTimeout();
        });

        playerElement.addEventListener('pause', () => {
            console.log("Video dijeda.");
            clearTimeout(controlsTimeout);
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
            
            videoOverlayEffect.style.display = 'block';
            setTimeout(() => { videoOverlayEffect.style.opacity = '1'; }, 10); 

            posterImage.style.display = 'none';
            posterGradientOverlay.style.display = 'none';
            playerElement.style.display = 'block'; 

            adjustTitleFontSize(); 
        });

        playerElement.addEventListener('ended', () => {
            console.log("Video selesai diputar.");
            clearTimeout(controlsTimeout);
            clearTimeout(adHideTimeout); 
            
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            videoTitleContainer.style.opacity = '1';
            playerControls.style.display = 'flex';
            
            videoOverlayEffect.style.display = 'block';
            setTimeout(() => { videoOverlayEffect.style.opacity = '1'; }, 10); 

            if (logoFile) {
                posterImage.style.display = 'block';
                posterGradientOverlay.style.display = 'block';
                playerElement.style.display = 'none'; 
            } else {
                playerElement.style.display = 'block'; 
            }
            adShown = false; 
            if (iklan2) { // Cek apakah iklan2 ada sebelum menggunakannya
                 iklan2.style.visibility = 'hidden'; 
                 iklan2.style.animation = 'none'; 
                 iklan2.style.transform = 'translateX(100%)'; 
            }
            adjustTitleFontSize(); 
        });

        playerElement.addEventListener('timeupdate', () => {
            if (progressBar && !isNaN(playerElement.duration) && playerElement.duration > 0) {
                const progressPercentage = (playerElement.currentTime / playerElement.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                const currentTime = formatTime(playerElement.currentTime);
                const totalDuration = formatTime(playerElement.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
                
                if (!adShown && playerElement.currentTime >= 20) {
                    adShown = true;
                    if (iklan2) { // Cek apakah iklan2 ada sebelum menggunakannya
                        iklan2.style.visibility = 'visible'; 
                        iklan2.style.animation = 'slide-in-ad 1s ease-out forwards'; 
                        console.log("Iklan 2 muncul setelah 20 detik!");

                        adHideTimeout = setTimeout(() => {
                            iklan2.style.animation = 'slide-out-ad 1s ease-out forwards'; 
                            iklan2.addEventListener('animationend', function handler() {
                                iklan2.style.visibility = 'hidden'; 
                                iklan2.style.animation = 'none'; 
                                iklan2.style.transform = 'translateX(100%)'; 
                                iklan2.removeEventListener('animationend', handler); 
                            });
                            console.log("Iklan 2 menghilang setelah 10 detik.");
                        }, 30000); 
                    }
                }
            }
        });

        playPauseCenter.addEventListener('click', playToggle);
        
        progressBarContainer.addEventListener('click', (event) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickPosition = event.clientX - rect.left;
            const percentage = clickPosition / rect.width;
            
            if (!isNaN(playerElement.duration)) {
                playerElement.currentTime = playerElement.duration * percentage;
            }
            resetControlsTimeout();
        });

        document.addEventListener('keydown', (event) => {
            if (playerElement) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        playToggle();
                        break;
                    case 'ArrowRight':
                        playerElement.currentTime += 10;
                        break;
                    case 'ArrowLeft':
                        playerElement.currentTime -= 10;
                        break;
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });

        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'tiviku.html';
        }, 3000);
    }
});