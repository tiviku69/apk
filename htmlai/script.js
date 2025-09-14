const atas = document.getElementById('atas');
atas.innerHTML = `
    <div class="logo">tivi<span>ku</span></div>
    <div class="search-container">
        <input type="text" id="cari" placeholder="Cari...">
        <i class="fas fa-search search-icon" id="search-icon-toggle"></i>
    </div>
`;

// Fungsi untuk toggle search bar
const searchInput = document.getElementById('cari');
const searchIcon = document.getElementById('search-icon-toggle');
searchIcon.addEventListener('click', () => {
    searchInput.classList.toggle('active');
    if (searchInput.classList.contains('active')) {
        searchInput.focus();
    }
});

// Fungsi pencarian menggunakan event 'input'
searchInput.addEventListener('input', prosesMenu);

// Menambahkan dukungan remote/keyboard
let focusedIndex = 0;
let thumbnails = [];

// Fungsi untuk mengupdate fokus
function updateFocus() {
    if (thumbnails.length === 0) return;
    thumbnails.forEach(thumb => thumb.classList.remove('focused'));
    thumbnails[focusedIndex].classList.add('focused');
    thumbnails[focusedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function handleRemoteNavigation(e) {
    thumbnails = Array.from(document.querySelectorAll('.responsive-div'));

    if (e.key === 'ArrowRight' || e.key === 'd') {
        focusedIndex = (focusedIndex + 1) % thumbnails.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        focusedIndex = (focusedIndex - 1 + thumbnails.length) % thumbnails.length;
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        // Hitung perpindahan baris
        const itemsPerRow = Math.floor(document.getElementById('container').offsetWidth / thumbnails[0].offsetWidth);
        if (itemsPerRow > 0) {
            focusedIndex = (focusedIndex + itemsPerRow);
            if (focusedIndex >= thumbnails.length) {
                focusedIndex = thumbnails.length - 1;
            }
        }
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        // Hitung perpindahan baris
        const itemsPerRow = Math.floor(document.getElementById('container').offsetWidth / thumbnails[0].offsetWidth);
        if (itemsPerRow > 0) {
            focusedIndex = Math.max(0, focusedIndex - itemsPerRow);
        }
    } else if (e.key === 'Enter') {
        if (thumbnails.length > 0) {
            thumbnails[focusedIndex].click();
        }
        return; // Mencegah reload halaman
    }
    updateFocus();
}

document.addEventListener('keydown', handleRemoteNavigation);

const files = [ 'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/captain.json','https://raw.githubusercontent.com/tiviku69/apk/main/avat.json','https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json','https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json','https://raw.githubusercontent.com/tiviku69/apk/main/squid.json','https://raw.githubusercontent.com/tiviku69/apk/main/journey.json','https://raw.githubusercontent.com/tiviku69/apk/main/one.json','https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json' ];
files.forEach(file => {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                const container = document.getElementById('container');
                const img = document.createElement('img');
                img.id = 'imgv';
                img.src = item.logo;

                const overlay = document.createElement('div');
                overlay.className = 'overlay';

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
                dv.appendChild(overlay);
                dv.appendChild(pp);
                dv.appendChild(dur);
                container.appendChild(dv);
            });
            // Atur fokus awal setelah semua thumbnail dimuat
            thumbnails = Array.from(document.querySelectorAll('.responsive-div'));
            if (thumbnails.length > 0) {
                thumbnails[0].classList.add('focused');
            }
        })
        .catch(error => console.error('Error loading JSON:', error));
});

function playVideo(videoFile, logoFile, textFile) {
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}

function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');
    focusedIndex = -1; // Reset fokus saat pencarian dimulai

    for (var i = 0; i < li.length; i++) {
        var titleElement = li[i].querySelector('.re');
        if (titleElement.innerHTML.toLowerCase().indexOf(filter) > -1) {
            li[i].style.display = "block";
        } else {
            li[i].style.display = "none";
        }
    }
    // Atur fokus ke elemen pertama yang terlihat setelah filter
    thumbnails = Array.from(document.querySelectorAll('.responsive-div:not([style*="display: none"])'));
    if (thumbnails.length > 0) {
        focusedIndex = 0;
        updateFocus();
    }
}