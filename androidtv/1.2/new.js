document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    const logoFile = sessionStorage.getItem('logoFile'); 
    
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
    
    const iklan2 = document.getElementById('iklan2');
    let adShown = false; 
    let adHideTimeout; 

    let controlsTimeout;
    
    const initialFontSizeVW = 2.0; 

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

    if (videoLink) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
            adjustTitleFontSize(); 
        }
        
        playerElement.src = videoLink;

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

        const formatTime = (seconds) => {
            if (isNaN(seconds) || seconds < 0) return '0:00';
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
            return `${minutes}:${paddedSeconds}`;
        };

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
            iklan2.style.visibility = 'hidden'; 
            iklan2.style.animation = 'none'; 
            iklan2.style.transform = 'translateX(100%)'; 
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
                    }, 10000); 
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