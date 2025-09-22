// Data Video (dari file JSON yang ada)
const files = [ 'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/captain.json','https://raw.githubusercontent.com/tiviku69/apk/main/avat.json','https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json','https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json','https://raw.githubusercontent.com/tiviku69/apk/main/squid.json','https://raw.githubusercontent.com/tiviku69/apk/main/journey.json','https://raw.githubusercontent.com/tiviku69/apk/main/one.json','https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json' ];

let filesProcessed = 0;
const totalFiles = files.length;
const container = document.getElementById('container');

// Fungsi untuk membuat baris video
function createVideoRow(title, data) {
    const row = document.createElement('div');
    row.className = 'video-row';

    const rowTitle = document.createElement('div');
    rowTitle.className = 'row-title';
    rowTitle.innerText = title;

    const videosWrapper = document.createElement('div');
    videosWrapper.className = 'videos-wrapper';

    data.forEach(item => {
        const dv = document.createElement('div');
        dv.className = 'responsive-div';
        dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl);

        const img = document.createElement('img');
        img.id = 'imgv';
        img.src = item.logo;

        const pp = document.createElement('p');
        pp.className = 're';
        pp.innerText = item.ttl;

        const dur = document.createElement('p');
        dur.className = 'dur';
        dur.innerText = item.dur;

        dv.appendChild(img);
        dv.appendChild(pp);
        dv.appendChild(dur);
        videosWrapper.appendChild(dv);
    });

    row.appendChild(rowTitle);
    row.appendChild(videosWrapper);
    container.appendChild(row);
}

// Ambil data dan buat baris video
files.forEach(file => {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            // Asumsi setiap file JSON mewakili satu baris/kategori
            const rowTitle = "Video " + (filesProcessed + 1); // Judul placeholder
            createVideoRow(rowTitle, data);
            
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                // Semua file telah diproses, highlight yang pertama
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
                const firstDiv = document.querySelector('.responsive-div');
                if (firstDiv) {
                    firstDiv.classList.add('highlight');
                    firstDiv.focus();
                }
            }
        });
});

// Fungsi untuk navigasi ke halaman pemutar video
function playVideo(videoFile, logoFile, textFile) {
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}

// Fungsi pencarian
function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');
    for (var i = 0; i < li.length; i++) {
        var videoTitle = li[i].querySelector('.re').innerText.toLowerCase();
        if (videoTitle.indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

document.getElementById("cari").addEventListener("input", prosesMenu);

// Fungsi navigasi sidebar (placeholder)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        // Hapus kelas 'active' dari semua item
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        // Tambahkan kelas 'active' ke item yang diklik
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        console.log("Navigasi ke kategori: " + category);
        
        // Di sini Anda bisa menambahkan logika untuk memuat konten berbeda
        // Misalnya: fetch(`api/${category}.json`) atau mengubah tampilan.
        // Untuk saat ini, fungsi ini hanya log ke konsol.
    });
});