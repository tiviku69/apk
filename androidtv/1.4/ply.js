document.addEventListener('DOMContentLoaded', () => {
    // Pastikan JW Player Library sudah dimuat sebelum ini
    if (typeof jwplayer === 'undefined') {
        console.error("JW Player library tidak ditemukan. Pastikan Anda telah memasukkan script JW Player yang valid di ply.html.");
        document.body.innerHTML = '<h1>Gagal memuat player. Library JW Player tidak ditemukan.</h1>';
        return;
    }

    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const logoFile = sessionStorage.getItem('logoFile'); 
    
    // START MODIFIKASI KRITIS: Ambil 3 variabel crop
    const cropMode = sessionStorage.getItem('videoCropMode') || 'fill'; // Default 'fill'
    // const cropPosition = sessionStorage.getItem('videoCropPosition') || '50% 50%'; // TIDAK DIGUNAKAN
    // const cropScale = parseFloat(sessionStorage.getItem('videoCropScale')) || 1.2; // TIDAK DIGUNAKAN
    // END MODIFIKASI KRITIS
    
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    
    let jwPlayerInstance; // Variabel untuk menyimpan instance JW Player
    let iklan2; // Variabel untuk elemen iklan 2
    
    // --- JW PLAYER STRETCHING MAPPING (Menggantikan fungsi crop/objectFit lama) ---
    let jwStretching = 'exactfit'; // Default: Meregang Penuh (Mirip 'fill' Anda)
    
    if (cropMode === 'cover') {
        // Mode cover/zoom (mempertahankan rasio aspek, memotong, tidak ada bar hitam)
        jwStretching = 'fill'; 
        console.log("JW Player Stretching: FILL (Cover/Crop)");
    } else if (cropMode === 'fill_width' || cropMode === 'stretch_crop') { 
        // Mode uniform: mempertahankan rasio, menampilkan seluruh video (termasuk letterbox/pillarbox)
        // Ini adalah kompromi terbaik karena JW Player tidak memiliki mode 'stretch_crop' vertikal kustom.
        jwStretching = 'uniform';
        console.log("JW Player Stretching: UNIFORM (Maintain Aspect Ratio)");
    } else { 
        // Default: 'fill' Anda (Meregangkan penuh, mengabaikan rasio aspek)
        jwStretching = 'exactfit';
        console.log("JW Player Stretching: EXACTFIT (Stretch Penuh)");
    }
    // ------------------------------------

    // === START: FUNGSI MEMBUAT DAN MENYISIPKAN IKLAN OLEH JS ===
    const createAdElement = () => {
        const iklanContainer = document.createElement('div');
        iklanContainer.className = 'iklan-container';
        
        const iklan = document.createElement('div');
        iklan.id = 'iklan';
        
        iklan2 = document.createElement('div'); // Menetapkan ke variabel global iklan2
        iklan2.id = 'iklan2';
        iklan2.innerHTML = 'INFO TERBARU<br>GABUNG DI SINI<br>( https://t.me/tiviku )'; 
        
        iklan.appendChild(iklan2);
        iklanContainer.appendChild(iklan);
        
        document.body.appendChild(iklanContainer);
        console.log("Elemen iklan berhasil dibuat dan disisipkan.");

        let adShown = false; 
        let adHideTimeout; 

        if (jwPlayerInstance) {
             // Menggunakan event 'time' JW Player
             jwPlayerInstance.on('time', (event) => {
                if (!adShown && event.position >= 20) {
                    adShown = true;
                    if (iklan2) {
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
                            }, { once: true });
                            console.log("Iklan 2 menghilang setelah 30 detik.");
                        }, 30000); 
                    }
                }
            });

            // Menggunakan event 'complete' JW Player
            jwPlayerInstance.on('complete', () => {
                clearTimeout(adHideTimeout); 
                adShown = false; 
                if (iklan2) {
                    iklan2.style.visibility = 'hidden'; 
                    iklan2.style.animation = 'none'; 
                    iklan2.style.transform = 'translateX(100%)'; 
                }
            });
        }
    };
    // === END: FUNGSI MEMBUAT DAN MENYISIPKAN IKLAN OLEH JS ===

    const adjustTitleFontSize = () => {
        let currentSize = 2.0;
        const maxLinesHeight = window.innerHeight * 0.2; 
        videoTitleContainer.style.fontSize = `${2.0}vw`;
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

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    if (videoLink) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
            adjustTitleFontSize(); 
        }

        // --- INISIALISASI JW PLAYER ---
        jwPlayerInstance = jwplayer('player').setup({
            file: videoLink,
            stretching: jwStretching, // Menerapkan logika crop/fill
            width: '100%', 
            height: '100%',
            autostart: false,
            controls: true, // Biarkan JW Player yang mengontrol interface
            // Hapus semua properti video HTML5/HLS.js yang lama
        });
        
        createAdElement(); // Panggil untuk membuat elemen iklan dan mengaktifkan event listener

        // Handle Judul: Sembunyikan saat play, tampilkan saat pause
        jwPlayerInstance.on('play', () => {
             videoTitleContainer.style.opacity = '0';
        });

        jwPlayerInstance.on('pause', () => {
             videoTitleContainer.style.opacity = '1';
        });

        // Logika kontrol judul saat ada interaksi (mouse/keyboard)
        const resetControlsTimeout = () => {
            // Tampilkan judul saat ada interaksi
            videoTitleContainer.style.opacity = '1';

            // Sembunyikan judul setelah 3 detik jika player sedang play
            setTimeout(() => {
                if (jwPlayerInstance && jwPlayerInstance.getState() === 'playing') {
                    videoTitleContainer.style.opacity = '0';
                }
            }, 3000); 
        };

        // Event listener untuk interaksi global
        document.addEventListener('mousemove', resetControlsTimeout);
        document.addEventListener('mousedown', resetControlsTimeout);
        document.addEventListener('touchstart', resetControlsTimeout);
        
        // Event listener untuk tombol keyboard
        document.addEventListener('keydown', (event) => {
             if (jwPlayerInstance) {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        jwPlayerInstance.play(); // Gunakan API play/pause JW Player
                        break;
                    case 'ArrowRight':
                        jwPlayerInstance.seek(jwPlayerInstance.getPosition() + 10);
                        break;
                    case 'ArrowLeft':
                        jwPlayerInstance.seek(jwPlayerInstance.getPosition() - 10);
                        break;
                    case 'Escape':
                        window.history.back();
                        break;
                }
                resetControlsTimeout();
            }
        });

        // Sesuaikan ukuran font judul saat resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(adjustTitleFontSize, 100);
        });

    } else {
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<h1>Tidak ada video yang dipilih. Kembali ke halaman utama.</h1>';
        setTimeout(() => {
            window.location.href = 'tiviku.html';
        }, 3000);
    }
});
