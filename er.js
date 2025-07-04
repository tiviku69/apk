const video = document.getElementById('video');
const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const stopButton = document.getElementById('stop');

playButton.onclick = () => video.play();
pauseButton.onclick = () => video.pause();
stopButton.onclick = () => {
    video.pause();
    video.currentTime = 0;
};

// Handle remote control events for Android TV
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowRight':
            video.currentTime += 10; // Fast forward
            break;
        case 'ArrowLeft':
            video.currentTime -= 10; // Rewind
            break;
        case 'Enter':
            video.paused ? video.play() : video.pause();
            break;
        case 'Esc':
            video.pause();
            video.currentTime = 0;
            break;
    }
});