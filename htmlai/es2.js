// Mendapatkan elemen DOM utama, didefinisikan di scope global agar mudah diakses
const video = document.getElementById('videoPlayer');
const coDiv = document.getElementById('co'); // Overlay
const jdl = document.getElementById('jdl');
const imgg = document.getElementById('imgg');
const toggleButton = document.querySelector(".toggleButton");
const progress = document.querySelector(".progress");
const progressBar = document.querySelector(".progress__filled");
const skipBtns = document.querySelectorAll(".skip-btn");
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const durationDisplay = document.getElementById('durationDisplay');
const controls = document.getElementById('controls');
const allButtons = document.querySelectorAll('.controls__button');
const videoSource = document.getElementById('videoSource'); // Ditambahkan agar dapat diakses untuk .src

// --- Fungsi Utilitas ---
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function showOverlay() {
    coDiv.classList.add('active');
    coDiv.style.backgroundColor = 'rgba(0,0,0,0.6)';
    imgg.style.display = 'block';
    jdl.style.display = 'block';
}

function hideOverlay() {
    coDiv.classList.remove('active');
    coDiv.style.backgroundColor = 'rgba(0,0,0,0.0)';
    imgg.style.display = 'none';
    jdl.style.display = 'none';
}

// --- Kontrol Video Kustom ---
function togglePlay() {
    if (video.paused || video.ended) {
        video.play();
    } else {
        video.pause();
    }
}

function updateToggleButton() {
    toggleButton.innerHTML = video.paused ? "<b>▶</b>" : "❚ ❚";
    if (video.paused || video.ended) {
        showOverlay();
    } else {
        setTimeout(() => {
            if (!video.paused) hideOverlay();
        }, 3000); 
    }
}

function handleProgress() {
    const progressPercentage = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    currentTimeDisplay.textContent = formatTime(video.currentTime);
}

function handleMetadata() {
    durationDisplay.textContent = formatTime(video.duration);
}

function scrub(e) {
    const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
    video.currentTime = scrubTime;
}

function handleSkip() {
    video.currentTime += +this.dataset.skip;
    showOverlay();
    if (!video.paused) {
        setTimeout(() => hideOverlay(), 1500);
    }
}

// --- Inisialisasi HLS.js ---
function initHlsPlayer(url) {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            // Video siap dimainkan
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('HLS Error:', data.details);
            jdl.innerText = "Error memuat video stream. Cek log konsol.";
            showOverlay();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
    } else {
        jdl.innerText = "Peramban Anda tidak mendukung HLS.";
        showOverlay();
    }
}

// --- Navigasi Remote TV (Key Event Listener) ---
let currentFocusIndex = 1;

function setFocus(index) {
    allButtons.forEach(btn => btn.classList.remove('active-focus'));
    
    if (index >= 0 && index < allButtons.length) {
        allButtons[index].classList.add('active-focus');
        currentFocusIndex = index;
    }
}

document.addEventListener('keydown', (e) => {
    const keyCode = e.keyCode;
    
    if (!video.paused && keyCode !== 13) {
        showOverlay();
        setTimeout(() => {
            if (!video.paused) hideOverlay();
        }, 3000);
    }

    switch (keyCode) {
        case 37: // Kiri (Left)
            setFocus(Math.max(0, currentFocusIndex - 1));
            e.preventDefault();
            break;
        case 39: // Kanan (Right)
            setFocus(Math.min(allButtons.length - 1, currentFocusIndex + 1));
            e.preventDefault();
            break;
        case 38: // Atas (Up)
        case 40: // Bawah (Down)
            if (coDiv.classList.contains('active')) {
                setFocus(currentFocusIndex);
            } else {
                showOverlay();
                setFocus(1);
            }
            e.preventDefault();
            break;
        case 13: // Tombol OK/Enter/Select
            if (coDiv.classList.contains('active')) {
                const focusedButton = allButtons[currentFocusIndex];
                if (focusedButton) {
                    focusedButton.click();
                    if (focusedButton.classList.contains('toggleButton') && !video.paused) {
                        setTimeout(() => hideOverlay(), 500);
                    }
                }
            } else {
                togglePlay();
            }
            e.preventDefault();
            break;
        case 32: // Spasi
            togglePlay();
            e.preventDefault();
            break;
    }
});


// --- Initialization on Load ---
window.onload = function() {
    // MENDAPATKAN DATA DARI SESSION STORAGE
    const videoFile = sessionStorage.getItem('videoFile');
    const logoFile = sessionStorage.getItem('logoFile');
    const textFile = sessionStorage.getItem('textFile');

    // 1. Muat Konten
    if (videoFile) {
        // Inisialisasi HLS Player
        initHlsPlayer(videoFile); 
        
        // PENTING: Gunakan variabel DOM yang sudah dideklarasikan di awal script
        video.setAttribute('poster', logoFile);
        jdl.innerText = textFile;
        imgg.src = logoFile;

        // Tampilkan overlay awal
        showOverlay();
        // Set fokus awal pada tombol Play
        setFocus(1);
        
    } else {
        jdl.innerText = "Video source tidak ditemukan di Session Storage.";
        showOverlay();
    }

    // 2. Tambahkan Event Listeners
    toggleButton.addEventListener("click", togglePlay);
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", updateToggleButton);
    video.addEventListener("pause", updateToggleButton);
    video.addEventListener("timeupdate", handleProgress);
    video.addEventListener("loadedmetadata", handleMetadata);
    
    skipBtns.forEach((btn) => {
        btn.addEventListener("click", handleSkip);
    });

    progress.addEventListener("click", scrub);
    
    // 3. Event listeners untuk mengelola overlay (Saat Play/Pause/Ended)
    video.addEventListener('play', function() {
      hideOverlay();
    });

    video.addEventListener('pause', function() {
      showOverlay();
      setFocus(1);
    });

    video.addEventListener('ended', function() {
      showOverlay();
      setFocus(1);
    });
};