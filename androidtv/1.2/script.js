const atas = document.getElementById('atas');
atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b> <input type="text" name="" id=\"cari\" onkeyup=\"prosesMenu()\" placeholder=\"cari...\"> ';

// Daftar file JSON utama yang akan dimuat di tiviku.html
// File-file ini harus berisi item Direct Play dan/atau item Koleksi (seperti cmpr.json)
const allFiles = [ 
    '../json/cmprn.json','../json/mp4.json'
    // Tambahkan file lain yang ingin Anda tampilkan langsung di sini
];

let filesProcessed = 0;
const totalFiles = allFiles.length;
const container = document.getElementById('container');

// Fungsi untuk membuat elemen film/koleksi
function createFilmElement(item, clickAction, isCollection = false) {
    const img = document.createElement('img');
    img.id = 'imgv';
    img.src = item.logo;

    const pp = document.createElement('p');
    pp.className = 're';
    pp.innerText = item.ttl;

    const dur = document.createElement('p');
    dur.className = 'dur';
    // Durasi akan menunjukkan 'Koleksi (klik)' jika itu adalah tombol koleksi
    dur.innerText = isCollection ? 'Koleksi (klik)' : (item.dur || '');

    const dv = document.createElement('div');
    dv.className = 'responsive-div';
    dv.tabIndex = 0; 
    dv.onclick = clickAction;

    dv.appendChild(img);
    dv.appendChild(pp);
    dv.appendChild(dur);
    container.appendChild(dv);
}

// Memproses SEMUA FILES
allFiles.forEach(fileUrl => {
    fetch(fileUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                let action;
                // Cek properti baru: isCollection dan collectionUrl
                let isCollectionItem = item.isCollection === true && item.collectionUrl;

                if (isCollectionItem) {
                    // Item ini adalah KOLEKSI, klik akan membuka koleksi.html
                    const jsonUrl = item.collectionUrl; 
                    const collectionTitle = item.ttl;
                    action = () => openCollection(jsonUrl, collectionTitle);
                } else {
                    // Item ini adalah FILM BIASA, klik akan memutar video
                    action = () => playVideo(item.lnk, item.logo, item.ttl);
                }
                
                createFilmElement(item, action, isCollectionItem);
            });
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                restoreFocusAndScroll();
            }
        })
        .catch(error => {
            console.error('Error loading JSON:', fileUrl, error);
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                restoreFocusAndScroll();
            }
        });
});

// Fungsi untuk memulihkan fokus dan scroll di tiviku.html
const restoreFocusAndScroll = () => {
    const savedTitle = sessionStorage.getItem('lastVideoTitle');
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    const container = document.getElementById('container');
    
    let targetElement = null;

    if (savedTitle) {
        const allDivs = document.querySelectorAll('.responsive-div');
        allDivs.forEach(div => {
            div.classList.remove('highlight');
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === savedTitle) {
                targetElement = div;
            }
        });
    }

    if (targetElement) {
        targetElement.classList.add('highlight');
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (savedScrollPosition !== null && container) {
        container.scrollTop = parseInt(savedScrollPosition, 10);
    } else {
        const firstDiv = document.querySelector('.responsive-div');
        if (firstDiv) {
             firstDiv.classList.add('highlight');
             firstDiv.focus();
        }
    }
}

// Fungsi untuk membuka Koleksi (Menyimpan posisi tiviku.html sebelum navigasi)
function openCollection(jsonUrl, collectionTitle) {
    const container = document.getElementById('container');
    if (container) {
        sessionStorage.setItem('scrollPosition', container.scrollTop);
    }
    sessionStorage.setItem('lastVideoTitle', collectionTitle); 
    
    sessionStorage.setItem('collectionJsonUrl', jsonUrl); 
    sessionStorage.setItem('collectionTitle', collectionTitle); 
    
    // Reset data scroll/fokus koleksi.html agar saat pertama kali dibuka fokus ke item pertama
    sessionStorage.removeItem('collectionScrollPosition');
    sessionStorage.removeItem('lastCollectionVideoTitle');
    
    window.location.href = 'koleksi.html';
}

// Fungsi untuk memutar video (Digunakan oleh Direct Play)
function playVideo(videoFile, logoFile, textFile) {
    const container = document.getElementById('container');
    if (container) {
        sessionStorage.setItem('scrollPosition', container.scrollTop);
    }
    sessionStorage.setItem('lastVideoTitle', textFile);

    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}

// Fungsi untuk mencari
function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');
    for (var i = 0; i < li.length; i++) {
        if (li[i].innerText.toLowerCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

document.getElementById("cari").addEventListener("input", prosesMenu);