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
    
    let iklan2; 
    let adShown = false; 
    let adHideTimeout; 

    let controlsTimeout;
    
    const initialFontSizeVW = 2.0; 
    
    // BARU: Variabel untuk logika FF/RW yang lebih cepat (debounce)
    let jumpTimeAccumulator = 0; 
    let jumpTimeout;
    const JUMP_STEP = 10; // Lompatan 10 detik
    const JUMP_APPLY_DELAY = 300; // Delay (ms) sebelum menerapkan total lompatan
    // END BARU
    
    // Variabel untuk melacak status kontrol
    let controlsVisible = true;
    
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
        iklan2.textContent = 'IKLAN ANDA DI SINI'; // Isi teks iklan
        
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

    // Fungsi utility
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const parts = [m, s].map(v => String(v).padStart(2, '0'));

        if (h > 0) {
            parts.unshift(String(h).padStart(2, '0'));
        }
        
        return parts.join(':');
    }

    const hideControls = () => {
        playerControls.classList.add('hidden');
        playerControls.style.opacity = '0';
        videoTitleContainer.style.opacity = '0';
        digitalClock.style.opacity = '0';
        controlsVisible = false;
    };

    const showControls = () => {
        playerControls.classList.remove('hidden');
        playerControls.style.opacity = '1';
        videoTitleContainer.style.opacity = '1';
        digitalClock.style.opacity = '1';
        controlsVisible = true;
    };
    
    const resetControlsTimeout = () => {
        clearTimeout(controlsTimeout);
        showControls();
        controlsTimeout = setTimeout(hideControls, 5000); 
    };
    
    // FUNGSI BARU: Menerapkan Lompatan Waktu
    const applyJump = () => {
        if (jumpTimeAccumulator !== 0) {
            let newTime = playerElement.currentTime + jumpTimeAccumulator;
            
            // Batasi agar tidak kurang dari 0 atau lebih dari durasi
            newTime = Math.max(0, Math.min(newTime, playerElement.duration));
            
            playerElement.currentTime = newTime;
            jumpTimeAccumulator = 0; // Reset akumulator
            
            // Setelah lompatan diterapkan, reset kontrol timeout
            resetControlsTimeout(); 
        }
    };
    
    // FUNGSI BARU: Menghitung posisi progres bar sementara (saat FF/RW)
    const updateProgressDisplay = () => {
        const duration = playerElement.duration;
        const currentTime = playerElement.currentTime;
        
        // Cek apakah sedang dalam mode lompatan (jumpTimeAccumulator != 0)
        if (jumpTimeAccumulator !== 0) {
            let tempTime = currentTime + jumpTimeAccumulator;
            tempTime = Math.max(0, Math.min(tempTime, duration));
            
            // Update Progres Bar (visual, belum applied)
            if (!isNaN(duration)) {
                progressBar.style.width = (tempTime / duration) * 100 + '%';
                // Update Time Display untuk menunjukkan posisi lompatan
                timeDisplay.textContent = `${formatTime(tempTime)} / ${formatTime(duration)}`;
            }
        } else {
            // Jika tidak ada lompatan, gunakan waktu sebenarnya (perilaku normal)
             if (!isNaN(duration)) {
                progressBar.style.width = (currentTime / duration) * 100 + '%';
                timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
            }
        }
    };

    if (videoLink) {
        // Panggil fungsi untuk membuat iklan setelah DOMContentLoaded
        createAdElement(); 
        
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
            adjustTitleFontSize(); 
        }
        
        playerElement.src = videoLink;

        // **START LOGIKA PENGATURAN TAMPILAN VIDEO (KRITIS)**
        // 1. Reset semua properti custom (penting!)
        playerElement.style.objectFit = 'fill'; 
        playerElement.style.objectPosition = '50% 50%';
        playerElement.style.transform = 'none'; 

        if (cropMode === 'cover') {
            playerElement.style.objectFit = 'cover'; 
            playerElement.style.objectPosition = cropPosition; 
            console.log("Mode Video: COVER (Zoom/Crop Standar)");

        } else if (cropMode === 'stretch_crop') { 
            playerElement.style.objectFit = 'fill'; 
            playerElement.style.transform = `scaleY(${cropScale})`; 
            playerElement.style.objectPosition = '50% 50%';
            console.log(`Mode Video: STRETCH_CROP (Peregangan + Potong Vertikal, Skala: ${cropScale})`);

        } else if (cropMode === 'fill_width') { 
            playerElement.style.objectFit = 'contain'; 
            playerElement.style.width = '100vw'; 
            playerElement.style.height = '100vh'; 
            playerElement.style.objectPosition = '50% 50%';
            console.log("Mode Video: FILL_WIDTH (Potong Vertikal/Contain)");

        } else {
            playerElement.style.objectFit = 'fill'; 
            playerElement.style.objectPosition = '50% 50%';
            console.log("Mode Video: FILL (Peregangan Penuh/Default)");
        }
        // **END LOGIKA PENGATURAN TAMPILAN VIDEO**

        // Fungsi untuk menampilkan/menyembunyikan iklan
        const toggleAd = (show) => {
            if (iklan2) {
                if (show) {
                    iklan2.classList.add('show');
                    adShown = true;
                    console.log("Iklan ditampilkan.");
                    
                    clearTimeout(adHideTimeout);
                    adHideTimeout = setTimeout(() => {
                        toggleAd(false);
                        console.log("Iklan disembunyikan setelah 10 detik.");
                    }, 10000); 
                } else {
                    iklan2.classList.remove('show');
                    adShown = false;
                }
            }
        };
        
        // Panggil toggleAd(true) setelah 3 detik video mulai dimainkan
        playerElement.addEventListener('play', () => {
            if (!adShown) { 
                setTimeout(() => {
                    toggleAd(true);
                }, 3000); 
            }
        }, { once: true }); 
        
        
        playerElement.addEventListener('loadedmetadata', () => {
            updateProgressDisplay(); // Tampilkan durasi awal
        });

        playerElement.addEventListener('timeupdate', () => {
            // Gunakan fungsi updateProgressDisplay untuk memproses timeupdate
            // Ini akan memastikan progres bar tetap bergerak normal, kecuali saat ada lompatan
            if (jumpTimeAccumulator === 0) {
                 updateProgressDisplay();
            }
        });

        playerElement.addEventListener('waiting', () => {
            playPauseCenter.style.opacity = '1';
            playIcon.style.display = 'none'; 
            pauseIcon.style.display = 'none'; 
            playPauseCenter.innerHTML = '<img src="https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/img/loading.gif" style="width: 100%; height: 100%;">';
        });

        playerElement.addEventListener('playing', () => {
            playPauseCenter.style.opacity = '0';
            playPauseCenter.innerHTML = '<svg id="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><svg id="pause-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            pauseIcon.style.display = 'block'; 
            playIcon.style.display = 'none';
        });
        
        playerElement.addEventListener('pause', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            playPauseCenter.style.opacity = '1';
            playPauseCenter.innerHTML = '<svg id="play-icon" viewBox="0 0 24 24" style="display: block;"><path d="M8 5v14l11-7z"/></svg><svg id="pause-icon" viewBox="0 0 24 24" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        });

        // Set poster image jika ada
        if (logoFile) {
            posterImage.src = logoFile;
            posterImage.style.objectFit = playerElement.style.objectFit; 
            posterImage.style.objectPosition = playerElement.style.objectPosition;
            posterImage.style.transform = playerElement.style.transform;
            
            posterImage.style.display = 'block';
            posterGradientOverlay.style.display = 'block';
            playerElement.style.display = 'none'; // Sembunyikan video sampai siap diputar
        }

        playerElement.addEventListener('loadeddata', () => {
            if (logoFile) {
                // Sembunyikan poster saat video mulai dimainkan
                posterImage.style.display = 'none';
                posterGradientOverlay.style.display = 'none';
                playerElement.style.display = 'block'; 
            }
            playerElement.play();
        });

        // Inisialisasi timeout
        resetControlsTimeout();

        const playToggle = () => {
            if (playerElement.paused) {
                playerElement.play();
            } else {
                playerElement.pause();
            }
            resetControlsTimeout();
        };

        playPauseCenter.addEventListener('click', playToggle);
        playerElement.addEventListener('click', playToggle); // Juga klik pada video untuk play/pause

        progressBarContainer.addEventListener('click', (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left;
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
                        // Jika sedang dalam proses lompatan, batalkan lompatan dan play/pause
                        clearTimeout(jumpTimeout);
                        jumpTimeAccumulator = 0;
                        updateProgressDisplay(); // Reset tampilan progres bar
                        
                        playToggle();
                        break;
                        
                    case 'ArrowRight':
                    case 'ArrowLeft':
                        event.preventDefault();
                        
                        // 1. Akumulasi lompatan waktu
                        const jumpAmount = event.key === 'ArrowRight' ? JUMP_STEP : -JUMP_STEP;
                        
                        // Cek batas durasi agar akumulator tidak terus bertambah
                        let tempTime = playerElement.currentTime + jumpTimeAccumulator + jumpAmount;
                        
                        if (tempTime < 0 || tempTime > playerElement.duration) {
                            // Jangan mengakumulasi jika sudah mencapai batas
                            break; 
                        }
                        
                        jumpTimeAccumulator += jumpAmount;
                        
                        // 2. Tampilkan/Update progres bar yang dilompati
                        updateProgressDisplay(); 
                        
                        // 3. Pastikan kontrol terlihat
                        showControls(); 
                        clearTimeout(controlsTimeout); // JANGAN hide control saat remote ditekan

                        // 4. Bersihkan timeout debounce dan atur ulang
                        clearTimeout(jumpTimeout);
                        jumpTimeout = setTimeout(applyJump, JUMP_APPLY_DELAY);
                        break;
                        
                    case 'Escape':
                        window.history.back();
                        break;
                        
                    default:
                        // Jika tombol lain ditekan, reset timeout kontrol
                        resetControlsTimeout();
                }
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