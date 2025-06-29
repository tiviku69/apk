var vdi1 = document.getElementById("vdi1");

var vide = document.getElementById("myvideo");
vide.poster = "g.jpg";
vide.src ='https://tiviku69.github.io/apk/m3u/cpts1.m3u8';
vide.preload = "metadata";

let tiviku = document.createElement('img');
tiviku.src="tiviku.png";
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

const m3uUrls = [ 'ori.m3u8', ];

// Function to fetch and process M3U files
function fetchM3UData(url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            const channelList = document.getElementById('channel-list');
            
            lines.forEach((line, index) => {
                if (line.startsWith('#EXTINF:')) {
                    const channelInfo = line.split(',');
                    const title = channelInfo[1].trim();
                    const logo = channelInfo[0].match(/tvg-logo="([^"]+)"/)[1];
                    const streamUrl = lines[index + 1]?.trim(); // Safely access the stream URL

                    if (streamUrl) {
                        const listItem = document.createElement('li');
                        listItem.id = 'list';
                        listItem.innerHTML = `
                            <img id="ilt" src="${logo}" alt="${title} Logo">
                            <a id="klk" href="#" data-url="${streamUrl}">${title}</a>
                        `;
                        channelList.appendChild(listItem);
                        
                        listItem.querySelector('a').onclick = (event) => {
                            event.preventDefault();
                            const player = document.getElementById('player');
                            player.src = streamUrl;
                            const imgee = document.getElementById('imgee');
                            imgee.src = logo;
                            const txtt = document.getElementById('txtt');
                            txtt.innerText = title;
                            player.play();
                        };
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching the M3U file:', error));
}

// Fetch data for each URL in the array
m3uUrls.forEach(url => fetchM3UData(url));

// Search filter functionality
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    const listItems = document.querySelectorAll('#channel-list li');

    listItems.forEach(item => {
        const title = item.querySelector('a').textContent.toLowerCase();
        if (title.includes(filter)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

