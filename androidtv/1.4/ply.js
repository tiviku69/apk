document.addEventListener('DOMContentLoaded', () => {
    // ... (Variabel dan inisialisasi awal lainnya)
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
    const loadingSpinner = document.getElementById('loading-spinner');
    
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
    
    // --- FUNGSI FORMAT WAKTU ---
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


    if (videoLink) {
        // Panggil fungsi untuk membuat iklan setelah DOMContentLoaded
        createAdElement(); 
        
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
            adjustTitleFontSize(); 
        }
        
        // =========================================================
        // START MODIFIKASI KRITIS: INISIALISASI HLS.JS (Disesuaikan untuk Android TV)
        
        let hls = null; // Deklarasikan hls di luar blok if untuk akses di error handling
        
        if (videoLink.endsWith('.m3u8')) {
            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                console.log("HLS didukung. Menggunakan hls.js.");
                hls = new Hls({ // Gunakan variabel hls yang dideklarasikan di atas
                    // Nonaktifkan level cap untuk kompatibilitas lebih baik pada Android TV
                    capLevelToPlayerSize: false, 
                    // Setel batas buffer yang lebih rendah untuk mengurangi penggunaan memori
                    maxBufferLength: 15, 
                    maxMaxBufferLength: 30, 
                    // Gunakan penguraian TS bawaan JS untuk kompatibilitas yang lebih luas
                    forceLegacyAac: true 
                });
                hls.loadSource(videoLink);
                hls.attachMedia(playerElement);
                
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error("Kesalahan Jaringan. Mencoba memuat ulang.", data);
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error("Kesalahan Media. Mencoba memulihkan.", data);
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error("Kesalahan Fatal HLS. Mencoba Fallback ke pemutar native.", data);
                                
                                // --- PERBAIKAN KRITIS UNTUK FALLBACK ---
                                if (hls) {
                                    hls.stopLoad();
                                    hls.destroy(); // Bersihkan HLS sebelum fallback
                                }
                                playerElement.src = videoLink; // Gunakan tautan HLS sebagai tautan native
                                playerElement.load();
                                playerElement.play(); 
                                // ---------------------------------------
                                break;
                        }
                    }
                });
                
            } else {
                console.log("HLS tidak didukung atau hls.js tidak dimuat. Fallback ke pemutar native.");
                playerElement.src = videoLink;
            }
        } else {
            // Untuk format lain (misalnya MP4), gunakan pemutar native
            playerElement.src = videoLink;
        }

        // Terapkan properti crop
        playerElement.style.objectFit = cropMode;
        if (cropMode === 'contain' && cropScale !== 1.0) {
            // Untuk mode 'contain', kami tidak menerapkan zoom
            console.warn("Skala crop diabaikan untuk object-fit: contain.");
        } else if (cropMode === 'cover') {
            // Untuk mode 'cover', gunakan default CSS cover, tidak perlu custom
            playerElement.style.objectFit = 'cover';
        } else if (cropMode === 'fill' || cropMode === 'scale-down') {
            // Gunakan default 'fill' jika tidak ada mode lain yang ditetapkan atau jika 'fill'
            playerElement.style.objectFit = 'fill';
        } else {
            // Mode kustom yang mungkin memerlukan transformasi
            if (cropScale !== 1.0) {
                playerElement.style.transform = `scale(${cropScale})`;
                playerElement.style.transformOrigin = cropPosition;
            }
            playerElement.style.objectFit = cropMode; // Terapkan mode (jika custom)
        }
        
        // =========================================================

        // Tampilkan poster jika ada logo dan video belum dimainkan
        if (logoFile) {
            posterImage.src = logoFile;
            posterImage.style.display = 'block';
            posterGradientOverlay.style.display = 'block';
            playerElement.style.display = 'none'; // Sembunyikan player
            playPauseCenter.style.opacity = '1';
        } else {
            // Jika tidak ada poster, putar otomatis dan sembunyikan kontrol
            playerElement.play();
            hideControls();
        }


        // FUNGSI UNTUK MENYEMBUNYIKAN KONTROL
        function hideControls() {
            playerControls.style.opacity = '0';
            digitalClock.style.opacity = '0';
            videoTitleContainer.style.opacity = '0';
            playPauseCenter.style.opacity = '0'; 
            if (iklan2) iklan2.style.opacity = '0'; // Sembunyikan iklan
        }

        // FUNGSI UNTUK MENAMPILKAN KONTROL
        function showControls() {
            playerControls.style.opacity = '1';
            digitalClock.style.opacity = '1';
            videoTitleContainer.style.opacity = '1';
            playPauseCenter.style.opacity = '1';
            if (adShown && iklan2) iklan2.style.opacity = '1'; // Tampilkan iklan jika sudah ditampilkan
            resetControlsTimeout();
        }

        // FUNGSI UNTUK MERESET TIMEOUT KONTROL
        function resetControlsTimeout() {
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(hideControls, 5000); 
        }

        // Fungsi untuk mengaktifkan/menonaktifkan putar/jeda
        function playToggle() {
            if (playerElement.paused || playerElement.ended) {
                playerElement.play();
                pauseIcon.style.display = 'block';
                playIcon.style.display = 'none';
                playPauseCenter.style.opacity = '0'; // Sembunyikan segera setelah play
                resetControlsTimeout(); 
            } else {
                playerElement.pause();
                pauseIcon.style.display = 'none';
                playIcon.style.display = 'block';
                playPauseCenter.style.opacity = '1'; // Tampilkan saat pause
                clearTimeout(controlsTimeout); 
            }
        }
        playPauseCenter.onclick = playToggle;
        playerElement.onclick = showControls;


        // EVENT LISTENER
        playerElement.addEventListener('play', () => {
            pauseIcon.style.display = 'block';
            playIcon.style.display = 'none';
            playPauseCenter.style.opacity = '0';
            loadingSpinner.style.display = 'none';
            resetControlsTimeout();
            
            // Sembunyikan poster saat video mulai diputar
            posterImage.style.display = 'none';
            posterGradientOverlay.style.display = 'none';
            playerElement.style.display = 'block';
        });

        playerElement.addEventListener('pause', () => {
            pauseIcon.style.display = 'none';
            playIcon.style.display = 'block';
            playPauseCenter.style.opacity = '1';
            clearTimeout(controlsTimeout);
        });
        
        // MODIFIKASI KRITIS: Handle Buffering
        playerElement.addEventListener('waiting', () => {
            loadingSpinner.style.display = 'block';
        });
        playerElement.addEventListener('playing', () => {
            loadingSpinner.style.display = 'none';
        });


        playerElement.addEventListener('timeupdate', () => {
            updateTimeDisplayAndProgress();
        });

        // FUNGSI GABUNGAN UNTUK MEMPERBARUI WAKTU DAN PROGRES
        function updateTimeDisplayAndProgress() {
            if (!isNaN(playerElement.duration) && isFinite(playerElement.duration)) {
                const currentTime = formatTime(playerElement.currentTime);
                const duration = formatTime(playerElement.duration);
                timeDisplay.textContent = `${currentTime} / ${duration}`;
                
                const progressPercent = (playerElement.currentTime / playerElement.duration) * 100;
                progressBar.style.width = `${progressPercent}%`;
            } else {
                 // Untuk Live TV atau jika durasi tidak diketahui
                const currentTime = formatTime(playerElement.currentTime);
                timeDisplay.textContent = `${currentTime} / LIVE 🔴`;
                progressBar.style.width = `100%`; // Full bar untuk kesan streaming
            }
        }
        
        playerElement.addEventListener('loadedmetadata', updateTimeDisplayAndProgress);
        playerElement.addEventListener('durationchange', updateTimeDisplayAndProgress);


        // MODIFIKASI: Handle fokus awal saat poster ditampilkan
        playPauseCenter.addEventListener('focus', () => {
            showControls();
        });
        playPauseCenter.addEventListener('blur', () => {
            resetControlsTimeout();
        });
        
        // Event untuk menghapus poster/memulai video saat tombol putar ditekan
        playPauseCenter.addEventListener('click', () => {
            posterImage.style.display = 'none';
            posterGradientOverlay.style.display = 'none';
            playerElement.style.display = 'block';
            adjustTitleFontSize();
        });

        playerElement.addEventListener('ended', () => {
            console.log("Video selesai.");
            window.history.back(); // Kembali ke halaman sebelumnya setelah selesai
        });
        
        // --- LOGIKA IKLAN ---
        const showAd = () => {
            adShown = true;
            if (iklan2) iklan2.style.opacity = '1';
            
            // Tentukan posisi iklan (misalnya, di kanan atas)
            const iklanContainer = iklan2.closest('.iklan-container');
            if (iklanContainer) iklanContainer.style.display = 'block';
            
            // Atur timeout untuk menyembunyikan iklan setelah 10 detik
            adHideTimeout = setTimeout(hideAd, 10000); // Sembunyikan setelah 10 detik
        };
        
        const hideAd = () => {
            adShown = false;
            if (iklan2) iklan2.style.opacity = '0';
            clearTimeout(adHideTimeout);
        };
        
        // Tampilkan iklan 5 detik setelah DOM dimuat (atau segera)
        // SetTimeOut ini dapat diubah atau dihapus jika tidak diperlukan
        setTimeout(showAd, 5000); 
        
        // --- END LOGIKA IKLAN ---


        // --- FUNGSI NAVIGASI KEYBOARD/REMOTE BARU ---
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
                        // MODIFIKASI KRITIS: Panggil pembaruan progres segera setelah seek
                        updateTimeDisplayAndProgress(); 
                        break;
                    case 'ArrowLeft':
                        playerElement.currentTime -= 10;
                        // MODIFIKASI KRITIS: Panggil pembaruan progres segera setelah seek
                        updateTimeDisplayAndProgress(); 
                        break;
                    case 'Escape':
                        // Tambahkan jeda sejenak untuk memastikan player berhenti total
                        playerElement.pause();
                        setTimeout(() => window.history.back(), 100);
                        break;
                }
                showControls(); // Tampilkan kontrol setiap kali navigasi
            }
        });

        document.addEventListener('mousemove', showControls);
        document.addEventListener('mousedown', showControls);
        document.addEventListener('touchstart', showControls);

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'tiviku.html';
        }, 3000);
    }
});
