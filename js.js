var vdi1 = document.getElementById("vdi1");

var vide = document.getElementById("myvideo");
vide.src ='https://tiviku69.github.io/apk/m3u/cpts1.m3u8';
vide.preload = "metadata";

let tiviku = document.createElement('img');
tiviku.src="https://github.com/filmovie/tiviku/blob/main/gambar/tiviku.png?raw=true";
tiviku.className="tiviku";
vdi1.appendChild(tiviku);

let time = document.createElement('div');
time.id ="clock";
time.innerHTML = "<p class='date'>{{ date }}</p><p class='time'>{{ time }}</p>";
vdi1.appendChild(time);

const video = document.querySelector(".video");
const toggleButton = document.querySelector(".toggleButton");
const progress = document.querySelector(".progress");
const progressBar = document.querySelector(".progress__filled");
const sliders = document.querySelectorAll(".controls__slider");
const videt = document.getElementById('myvideo');
    const buttn = document.getElementById('ppk');
videt.addEventListener('play', function() {
            buttn.style.display = 'none'; // Menghilangkan tombol saat video diputar
        });
    videt.addEventListener('touchstart', () => {
        setTimeout(() => {
            buttn.style.display = 'block'; // Tampilkan tombol setelah 2 detik
            setTimeout(() => {
                buttn.style.display = 'none'; // Sembunyikan tombol setelah 3 detik
            }, 2540); // 2540 ms = 3 detik
        }, 430); // 430 ms = 2 detik untuk delay sebelum menampilkan tombol
    });
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
