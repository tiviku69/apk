const videoPlayer = document.getElementById('videoPlayer');
const menu = document.getElementById('menu');
let menuVisible = false;

document.body.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowDown') {
        menu.style.display = menuVisible ? 'none' : 'flex';
        menuVisible = !menuVisible;
    }
});

function playVideo(videoSrc) {
    videoPlayer.src = videoSrc;
    videoPlayer.play();
    menu.style.display = 'none';
    menuVisible = false;
}