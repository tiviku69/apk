const atas = document.getElementById('atas');
atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b>';

const files = [ 'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/captain.json','https://raw.githubusercontent.com/tiviku69/apk/main/avat.json','https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json','https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json','https://raw.githubusercontent.com/tiviku69/apk/main/squid.json','https://raw.githubusercontent.com/tiviku69/apk/main/journey.json','https://raw.githubusercontent.com/tiviku69/apk/main/one.json','https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json' ];

let allVideoItems = [];
let filesProcessed = 0;
const totalFiles = files.length;

function loadVideos() {
    files.forEach(file => {
        fetch(file)
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    const img = document.createElement('img');
                    img.id = 'imgv';
                    img.src = item.logo;

                    const pp = document.createElement('p');
                    pp.className = 're';
                    pp.innerText = item.ttl;

                    const dur = document.createElement('p');
                    dur.className = 'dur';
                    dur.innerText = item.dur;

                    const dv = document.createElement('div');
                    dv.className = 'responsive-div';
                    dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl);

                    dv.appendChild(img);
                    dv.appendChild(pp);
                    dv.appendChild(dur);
                    allVideoItems.push(dv);
                });
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    renderVideos(allVideoItems);
                    const firstDiv = document.querySelector('.responsive-div');
                    if (firstDiv) {
                        firstDiv.classList.add('highlight');
                        firstDiv.focus();
                    }
                }
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    renderVideos(allVideoItems);
                    const firstDiv = document.querySelector('.responsive-div');
                    if (firstDiv) {
                        firstDiv.classList.add('highlight');
                        firstDiv.focus();
                    }
                }
            });
    });
}

function renderVideos(videoItemsToRender) {
    const container = document.getElementById('container');
    container.innerHTML = '';
    videoItemsToRender.forEach(item => container.appendChild(item));
}

function playVideo(videoFile, logoFile, textFile) {
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}

function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    
    const filteredItems = allVideoItems.filter(item => {
        return item.innerHTML.toLowerCase().indexOf(filter) > -1;
    });
    renderVideos(filteredItems);
}

document.getElementById('home-menu').addEventListener('click', () => {
    document.getElementById('cari').style.display = 'none';
    document.getElementById('home-menu').classList.add('active');
    document.getElementById('search-menu').classList.remove('active');
    renderVideos(allVideoItems);
});

document.getElementById('search-menu').addEventListener('click', () => {
    document.getElementById('cari').style.display = 'block';
    document.getElementById('home-menu').classList.remove('active');
    document.getElementById('search-menu').classList.add('active');
    document.getElementById('cari').focus();
    renderVideos(allVideoItems);
});

document.getElementById("cari").addEventListener("input", prosesMenu);

loadVideos();