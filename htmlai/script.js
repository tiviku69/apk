const atas = document.getElementById('atas');
atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b>'; // Hapus input cari dari sini

const files = [ 'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/captain.json','https://raw.githubusercontent.com/tiviku69/apk/main/avat.json','https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json','https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json','https://raw.githubusercontent.com/tiviku69/apk/main/squid.json','https://raw.githubusercontent.com/tiviku69/apk/main/journey.json','https://raw.githubusercontent.com/tiviku69/apk/main/one.json','https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json' ];

let allVideoItems = []; // Menyimpan semua item video setelah dimuat
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
                    allVideoItems.push(dv); // Simpan div ke array
                });
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    renderVideos(allVideoItems); // Tampilkan semua video setelah semua dimuat
                    // Highlight the first one
                    const firstDiv = document.querySelector('.responsive-div');
                    if (firstDiv) {
                        firstDiv.classList.add('highlight');
                        firstDiv.focus(); // Set focus for keyboard navigation
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
    container.innerHTML = ''; // Bersihkan kontainer
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

// Event listener untuk menu Home
document.getElementById('home-menu').addEventListener('click', () => {
    document.getElementById('cari').style.display = 'none'; // Sembunyikan search input
    document.getElementById('home-menu').classList.add('active');
    document.getElementById('search-menu').classList.remove('active');
    renderVideos(allVideoItems); // Tampilkan semua video
});

// Event listener untuk menu Search
document.getElementById('search-menu').addEventListener('click', () => {
    document.getElementById('cari').style.display = 'block'; // Tampilkan search input
    document.getElementById('home-menu').classList.remove('active');
    document.getElementById('search-menu').classList.add('active');
    document.getElementById('cari').focus(); // Fokuskan ke input search
    renderVideos(allVideoItems); // Tampilkan kembali semua video saat pindah ke search
});

document.getElementById("cari").addEventListener("input", prosesMenu);

// Load videos saat halaman pertama kali dimuat
loadVideos();

// Set menu Home sebagai default aktif
document.getElementById('home-menu').classList.add('active');