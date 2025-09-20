document.addEventListener('DOMContentLoaded', () => {
    const videoLink = sessionStorage.getItem('videoLink');
    const videoTitle = sessionStorage.getItem('videoTitle');
    
    const playerControls = document.getElementById('player-controls');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressScrubber = document.getElementById('progress-scrubber');
    const loadingSpinner = document.getElementById('loading-spinner');
    const timeDisplay = document.getElementById('time-display');
    const playPauseCenter = document.getElementById('play-pause-center');
    const playIconCenter = document.getElementById('play-icon');
    const pauseIconCenter = document.getElementById('pause-icon');
    const videoTitleContainer = document.getElementById('video-title-container');
    const digitalClock = document.getElementById('digital-clock');
    const playPauseButton = document.getElementById('play-pause-button');
    const playButtonIcon = document.getElementById('play-button-icon');
    const pauseButtonIcon = document.getElementById('pause-button-icon');
    const rewindButton = document.getElementById('rewind-button');
    const forwardButton = document.getElementById('forward-button');
    const fullscreenButton = document.getElementById('fullscreen-button');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const playerLogo = document.getElementById('player-logo');


    let playerInstance;
    let controlsTimeout;
    let isSeeking = false; // Flag to indicate if user is actively seeking

    // --- Utility Functions ---
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        // const seconds = String(now.getSeconds()).padStart(2, '0'); // Optionally add seconds
        digitalClock.textContent = `${hours}:${minutes}`; // Display HH:MM
    }

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${paddedSeconds}`;
    };

    const showControls = () => {
        clearTimeout(controlsTimeout);
        playerControls.classList.add('active');
        playPauseCenter.style.opacity = '1';
        videoTitleContainer.style.opacity = '1';
        playerLogo.style.opacity = '1';
        digitalClock.style.opacity = '1';

        // Hide after 3 seconds if playing and not seeking
        if (playerInstance && playerInstance.getState() === 'playing' && !isSeeking) {
            controlsTimeout = setTimeout(hideControls, 3000);
        }
    };

    const hideControls = () => {
        if (playerInstance && playerInstance.getState() === 'playing' && !isSeeking) {
            playerControls.classList.remove('active');
            playPauseCenter.style.opacity = '0';
            videoTitleContainer.style.opacity = '0';
            playerLogo.style.opacity = '0';
            digitalClock.style.opacity = '0';
        }
    };
    
    // --- Player Initialization ---
    if (videoLink) {
        if (videoTitleContainer) {
            videoTitleContainer.textContent = videoTitle || "Sedang Memutar Film";
        }
        
        playerInstance = jwplayer("player").setup({
            file: videoLink,
            autostart: true, // Auto-start the video
            controls: false, // Hide default JW Player controls
            width: "100%",
            aspectratio: "16:9", // Modern aspect ratio
            displaytitle: false,
            displaydescription: true,
            skin: {
                name: "seven" // A cleaner, more modern JW Player skin
            },
            captions: {
                color: "#FFF",
                fontSize: 14,
                backgroundOpacity: 0,
                edgeStyle: "raised"
            },
            qualityLabels: {
                "360": "Normal",
                "480": "HD",
                "720": "Full HD",
                "1080": "Ultra HD"
            },
            // Added adaptive streaming logic for slow connections
            onBuffer: () => {
                const currentQuality = playerInstance.getQuality();
                const availableQualities = playerInstance.getQualityLevels();
                // Find the lowest quality available (e.g., "Normal")
                const lowestQuality = availableQualities.find(q => q.label === "Normal" || q.label === availableQualities[0].label);

                if (currentQuality && lowestQuality && currentQuality.label !== lowestQuality.label) {
                    // Only switch if not already on the lowest quality
                    playerInstance.setQuality(lowestQuality.index);
                    console.log(`Koneksi lambat, beralih ke kualitas terendah (${lowestQuality.label}) untuk mencegah buffering.`);
                }
            }
        });

        // --- JW Player Event Listeners ---
        playerInstance.on('ready', () => {
            console.log("JW Player is ready.");
            showControls(); // Show controls initially

            // Add the JW Player quality selector to our custom controls
            const jwQualitySelector = document.querySelector('.jw-button-container.jw-quality');
            if (jwQualitySelector) {
                document.querySelector('.controls-right').insertBefore(jwQualitySelector, fullscreenButton.nextSibling);
            }
            updateClock();
            setInterval(updateClock, 1000); // Start clock
        });

        playerInstance.on('buffer', () => {
            loadingSpinner.style.display = 'block';
            playerControls.classList.remove('active'); // Hide controls during buffering
        });

        playerInstance.on('play', () => {
            loadingSpinner.style.display = 'none';
            playIconCenter.style.display = 'none';
            pauseIconCenter.style.display = 'block';
            playButtonIcon.style.display = 'none';
            pauseButtonIcon.style.display = 'inline-block';
            showControls(); // Show controls and set timeout to hide
        });

        playerInstance.on('pause', () => {
            clearTimeout(controlsTimeout); // Keep controls visible when paused
            playIconCenter.style.display = 'block';
            pauseIconCenter.style.display = 'none';
            playButtonIcon.style.display = 'inline-block';
            pauseButtonIcon.style.display = 'none';
            showControls(); // Ensure controls are visible
        });

        playerInstance.on('complete', () => {
            clearTimeout(controlsTimeout);
            playIconCenter.style.display = 'block';
            pauseIconCenter.style.display = 'none';
            playButtonIcon.style.display = 'inline-block';
            pauseButtonIcon.style.display = 'none';
            showControls(); // Ensure controls are visible
        });

        playerInstance.on('time', (data) => {
            if (progressBar && data.duration > 0 && !isSeeking) {
                const progressPercentage = (data.position / data.duration) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                progressScrubber.style.right = `${100 - progressPercentage}%`; // Position scrubber

                const currentTime = formatTime(data.position);
                const totalDuration = formatTime(data.duration);
                timeDisplay.innerHTML = `${currentTime} / ${totalDuration}`;
            }
        });

        playerInstance.on('volume', (data) => {
            if (data.mute) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (data.volume < 50) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
        });

        // --- Custom Control Event Listeners ---
        playPauseCenter.addEventListener('click', () => playerInstance.playToggle());
        playPauseButton.addEventListener('click', () => playerInstance.playToggle());
        rewindButton.addEventListener('click', () => playerInstance.seek(playerInstance.getPosition() - 10));
        forwardButton.addEventListener('click', () => playerInstance.seek(playerInstance.getPosition() + 10));
        muteButton.addEventListener('click', () => playerInstance.setMute(!playerInstance.getMute()));

        fullscreenButton.addEventListener('click', () => {
            if (playerInstance.getFullscreen()) {
                playerInstance.setFullscreen(false);
                fullscreenButton.querySelector('i').className = 'fas fa-expand';
            } else {
                playerInstance.setFullscreen(true);
                fullscreenButton.querySelector('i').className = 'fas fa-compress';
            }
        });

        // Progress bar seeking
        let isDraggingProgressBar = false;
        progressBarContainer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left click
            isDraggingProgressBar = true;
            isSeeking = true;
            playerInstance.pause(); // Pause while seeking

            const seekTo = (event) => {
                const rect = progressBarContainer.getBoundingClientRect();
                let clientX = event.clientX;
                if (event.touches && event.touches[0]) { // For touch events
                    clientX = event.touches[0].clientX;
                }
                const clickX = clientX - rect.left;
                const percentage = (clickX / rect.width);
                const newPosition = playerInstance.getDuration() * percentage;
                playerInstance.seek(newPosition);
                // Visually update progress bar immediately for feedback
                progressBar.style.width = `${percentage * 100}%`;
                progressScrubber.style.right = `${100 - (percentage * 100)}%`;
                timeDisplay.innerHTML = `${formatTime(newPosition)} / ${formatTime(playerInstance.getDuration())}`;
            };
            seekTo(e);
            
            document.addEventListener('mousemove', seekTo);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', seekTo);
                isDraggingProgressBar = false;
                isSeeking = false;
                playerInstance.play(); // Resume play after seeking
                showControls(); // Reset controls timeout
            }, { once: true });
        });


        // --- Global Interaction Listeners ---
        document.addEventListener('keydown', (event) => {
            if (!playerInstance) return;

            showControls(); // Show controls on any key press

            switch (event.key) {
                case ' ': // Space bar for play/pause
                    event.preventDefault(); // Prevent page scroll
                    playerInstance.playToggle();
                    break;
                case 'ArrowRight':
                    playerInstance.seek(playerInstance.getPosition() + 10); // Skip forward 10s
                    break;
                case 'ArrowLeft':
                    playerInstance.seek(playerInstance.getPosition() - 10); // Skip backward 10s
                    break;
                case 'ArrowUp': // Increase volume
                    playerInstance.setVolume(Math.min(playerInstance.getVolume() + 10, 100));
                    break;
                case 'ArrowDown': // Decrease volume
                    playerInstance.setVolume(Math.max(playerInstance.getVolume() - 10, 0));
                    break;
                case 'm': // Mute/unmute
                    playerInstance.setMute(!playerInstance.getMute());
                    break;
                case 'f': // Fullscreen
                    fullscreenButton.click(); // Trigger the button click
                    break;
                case 'Escape': // Exit fullscreen / go back
                    if (playerInstance.getFullscreen()) {
                        playerInstance.setFullscreen(false);
                        fullscreenButton.querySelector('i').className = 'fas fa-expand';
                    } else {
                        window.history.back(); // Go back to previous page
                    }
                    break;
            }
        });

        // Hide controls on inactivity
        document.addEventListener('mousemove', showControls);
        document.addEventListener('mousedown', showControls);
        document.addEventListener('touchstart', showControls);
        playerInstance.on('useractive', showControls);
        playerInstance.on('userinactive', hideControls);

    } else {
        // --- Handle No Video Selected ---
        console.error('Tidak ada data video ditemukan di sessionStorage.');
        document.body.innerHTML = '<div class="error-message"><h1>Tidak ada video yang dipilih.</h1><p>Kembali ke halaman utama...</p></div>';
        const errorMessageDiv = document.querySelector('.error-message');
        if (errorMessageDiv) {
            errorMessageDiv.style.cssText = `
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                height: 100vh; background-color: #000; color: #fff; text-align: center; font-family: 'Roboto', sans-serif;
            `;
            errorMessageDiv.querySelector('h1').style.color = '#e50914';
            errorMessageDiv.querySelector('p').style.color = '#ccc';
        }
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});