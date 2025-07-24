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
        
window.onload = function() {
            const videoFile = sessionStorage.getItem('videoFile');
            const logoFile = sessionStorage.getItem('logoFile');
            const textFile = sessionStorage.getItem('textFile');
            
            const videoPlayer = document.getElementById('videoPlayer');
            const videoSource = document.getElementById('videoSource');
            const co = document.getElementById('txe');
            const imgg = document.getElementById('imgg');
            
if (videoFile) {

videoSource.src = videoFile;

videoPlayer.setAttribute('poster', logoFile);

imgg.src = logoFile;

co.innerText =  textFile; 


                videoPlayer.load();
            }
        };

        document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            controls.style.display = 'block';
        }
        if (event.key === 'ArrowBackspace') {
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

const videoPlayer = document.getElementById('videoPlayer');
    const coDiv = document.getElementById('co');
    const imgg = document.getElementById('imgg');
    const txe = document.getElementById('txe');

    videoPlayer.addEventListener('play', function() {
      coDiv.style.backgroundColor = 'rgb(0,0,0,0.0)';
      imgg.style.display = 'none';
      txe.style.display = 'none'; // Sembunyikan div id "co"
    });

    videoPlayer.addEventListener('pause', function() {
      coDiv.style.backgroundColor = 'rgb(0,0,0,0.6)';
      imgg.style.display = 'block';
      txe.style.display = 'block'; // Tampilkan kembali ketika video dipause
    });

    videoPlayer.addEventListener('ended', function() {
      coDiv.style.backgroundColor = 'rgb(0,0,0,0.6)';
       imgg.style.display = 'block';
       txe.style.display = 'block';// Tampilkan kembali setelah video selesai
    });
