var vdi1 = document.getElementById("vdi1");

var vide = document.getElementById("videoPlayer");
vide.poster = "tiviku1.png";

let tiviku = document.createElement('img');
tiviku.src="tiviku.png";
tiviku.className="tiviku";
vdi1.appendChild(tiviku);

let time = document.createElement('div');
time.id ="clock";
time.innerHTML = "<p class='date'>{{ date }}</p><p class='time'>{{ time }}</p>";
vdi1.appendChild(time);

// Mendapatkan parameter dari URL
        const params = new URLSearchParams(window.location.search);
        const videoUrl = params.get('video');
        
if (videoUrl) {
const videoSource = document.getElementById('videoSource');

const videoPlayer = document.getElementById('videoPlayer');

videoSource.src = videoUrl;
videoPlayer.load();
videoPlayer.play();
}

        document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            controls.style.display = 'block';
        }
        if (event.key === 'ArrowUp') {
            controls.style.display = 'none';
        }
    });

// Add event listeners to buttons
        const video = document.querySelector(".video");
const toggleButton = document.querySelector(".toggleButton");
const progress = document.querySelector(".progress");
const progressBar = document.querySelector(".progress__filled");
const sliders = document.querySelectorAll(".controls__slider");
const skipBtns = document.querySelectorAll("[data-skip]");

function togglePlay() {
  if (video.paused || video.ended) {
    video.play();
  } else {
    video.pause();
  }
}
function updateToggleButton() {
  toggleButton.innerHTML = video.paused ? "<b>▶</b>" : "❚ ❚";
}

function handleProgress() {
  const progressPercentage = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${progressPercentage}%`;
}
function scrub(e) {
  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
}

function handleSliderUpdate() {
  video[this.name] = this.value;
}
function handleSkip() {
  video.currentTime += +this.dataset.skip;
}
toggleButton.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);
video.addEventListener("play", updateToggleButton);
video.addEventListener("pause", updateToggleButton);
video.addEventListener("timeupdate", handleProgress);
sliders.forEach((slider) => {
  slider.addEventListener("change", handleSliderUpdate);
});
skipBtns.forEach((btn) => {
  btn.addEventListener("click", handleSkip);
});

sliders.forEach((slider) => {
  slider.addEventListener("change", handleSliderUpdate);
});
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") togglePlay();
});
