const atas = document.getElementById('atas');
// Kode Counter Visitor Online dari FreeCounterStats
const counterHtml = `
    <div id="visitor-counter" style="position: absolute; top: 10px; right: 15px; z-index: 10; text-align: right; line-height: 0;">
        <a href="https://www.freecounterstat.com" target="_blank" title="free page counter">
            <img src="https://counter1.optistats.ovh/private/freecounterstat.php?c=qygp99e2rqwwgm33bz9hqdh85js9bty4" border="0" alt="free page counter" style="height: 20px; width: auto; display: block;">
        </a>
    </div>
`;

// Menggunakan template literal untuk menyisipkan HTML counter
atas.innerHTML = `
    <h1>tiviku</h1> 
    <b>by tiviku</b> 
    <input type="text" name="" id="cari" onkeyup="prosesMenu()" placeholder="cari...">
    ${counterHtml}
`; 

// 1. Files yang langsung ditampilkan di halaman utama
const directFiles = [ 
    'cmpr.json', 
    'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/mp4.json'
];

// 2. File JSON TUNGGAL untuk semua data koleksi klik
const collectionListUrl = 'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/koleksi.json';

const totalFiles = directFiles.length + 1;
let filesProcessedCount = 0;
const container = document.getElementById('container');
let allItems = []; // Array untuk menampung semua item

// FUNGSI PENGACAKAN (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Fungsi untuk membuat elemen film
function createFilmElement(item, clickAction, isCollection = false) {
    const img = document.createElement('img');
    img.id = 'imgv';
    img.src = item.logo; 

    const pp = document.createElement('p');
    pp.className = 're';
    pp.innerText = item.ttl;

    const dur = document.createElement('p');
    dur.className = 'dur';
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

// --- FUNGSI BARU: MENGACAK DAN MENYIMPAN URUTAN KE SESSION STORAGE ---
function shuffleAndSaveItems() {
    shuffleArray(allItems);
    try {
        // Simpan seluruh array item yang sudah diacak untuk mempertahankan urutan
        sessionStorage.setItem('savedItemList', JSON.stringify(allItems));
    } catch (e) {
        console.error("Gagal menyimpan item list ke sessionStorage.", e);
    }
}
// --- END FUNGSI BARU ---


// 1. Memproses DIRECT FILES (Mengumpulkan data ke allItems)
directFiles.forEach(fileUrl => {
    fetch(fileUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Gabungkan item ke dalam array utama
            allItems.push(...data.map(item => ({ ...item, isCollection: false })));
            filesProcessedCount++;
            
            // Periksa jika semua file selesai diproses (termasuk collectionListUrl)
            if (filesProcessedCount === totalFiles) {
                displayItems();
            }
        })
        .catch(error => {
            console.error(`Gagal memuat file langsung ${fileUrl}:`, error);
            filesProcessedCount++;
            if (filesProcessedCount === totalFiles) {
                displayItems();
            }
        });
});

// 2. Memproses COLLECTION LIST FILE (Mengumpulkan data ke allItems)
fetch(collectionListUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Gabungkan item koleksi ke dalam array utama
        allItems.push(...data.map(item => ({ 
            ...item, 
            isCollection: true, 
            logo: item.collectionLogo,
            ttl: item.collectionTitle,
            url: item.url
        })));
        filesProcessedCount++;
        
        if (filesProcessedCount === totalFiles) {
            displayItems();
        }
    })
    .catch(error => {
        console.error(`Gagal memuat file koleksi ${collectionListUrl}:`, error);
        filesProcessedCount++;
        if (filesProcessedCount === totalFiles) {
            displayItems();
        }
    });

// --- FUNGSI BARU: MENAMPILKAN ITEM ---
function displayItems() {
    container.innerHTML = ''; // Bersihkan kontainer
    
    const savedItems = sessionStorage.getItem('savedItemList');

    if (savedItems) {
        // Jika ada urutan tersimpan, gunakan itu
        try {
            // Mengganti allItems dengan data yang tersimpan untuk mempertahankan urutan
            allItems = JSON.parse(savedItems); 
        } catch (e) {
            // Fallback: Jika gagal, acak ulang dan simpan urutan baru
            shuffleAndSaveItems();
        }
    } else {
        // Pemuatan pertama: acak dan simpan urutan baru
        shuffleAndSaveItems();
    }
    
    let lastFocusTitle = sessionStorage.getItem('lastVideoTitle');
    let lastFocusCollectionTitle = sessionStorage.getItem('lastCollectionTitle');
    
    // Hapus variabel fokus setelah diambil
    sessionStorage.removeItem('lastVideoTitle');
    sessionStorage.removeItem('lastCollectionTitle');
    
    let focusedElement = null;

    allItems.forEach(item => {
        if (item.isCollection) {
            // Aksi untuk Koleksi
            const clickAction = () => {
                // Simpan URL JSON koleksi dan judulnya
                sessionStorage.setItem('collectionJsonUrl', item.url);
                sessionStorage.setItem('collectionTitle', item.collectionTitle);
                // Simpan judul ini sebagai fokus kembali
                sessionStorage.setItem('lastCollectionTitle', item.collectionTitle);
                // Simpan posisi scroll sebelum pindah
                saveScrollPosition();
                window.location.href = 'koleksi.html';
            };
            createFilmElement(item, clickAction, true);
        } else {
            // Aksi untuk Video Langsung
            const clickAction = () => {
                playVideo(
                    item.lnk, 
                    item.logo, 
                    item.ttl,
                    item.crop_mode, // BARU
                    item.crop_position, // BARU
                    item.crop_scale // BARU
                );
                // Simpan judul ini sebagai fokus kembali
                sessionStorage.setItem('lastVideoTitle', item.ttl); 
                // Simpan posisi scroll sebelum pindah
                saveScrollPosition();
            };
            createFilmElement(item, clickAction, false);
        }
    });
    
    // --- FUNGSI FOKUS DAN SCROLL KRITIS ---
    // Cari elemen yang harus difokuskan
    if (lastFocusTitle) {
        // Fokus ke video terakhir yang diputar
        const elements = document.querySelectorAll('.responsive-div .re');
        elements.forEach(p => {
            if (p.innerText === lastFocusTitle) {
                focusedElement = p.closest('.responsive-div');
            }
        });
    } else if (lastFocusCollectionTitle) {
        // Fokus ke koleksi terakhir yang dibuka
        const elements = document.querySelectorAll('.responsive-div .re');
        elements.forEach(p => {
            if (p.innerText === lastFocusCollectionTitle) {
                focusedElement = p.closest('.responsive-div');
            }
        });
    }


    // Terapkan fokus, highlight, dan scroll
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    
    // Hapus semua highlight sebelumnya
    document.querySelectorAll('.responsive-div').forEach(div => {
        div.classList.remove('highlight');
    });

    if (focusedElement) {
        focusedElement.classList.add('highlight');
        focusedElement.focus();
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Hapus posisi scroll yang disimpan jika berhasil fokus ke elemen
        sessionStorage.removeItem('scrollPosition'); 
    } else if (savedScrollPosition !== null && container) {
        // Jika tidak ada fokus spesifik, tapi ada posisi scroll tersimpan, gunakan itu
        container.scrollTop = parseInt(savedScrollPosition, 10);
    } else {
        // Pemuatan pertama, fokus ke elemen pertama
        const firstDiv = document.querySelector('#container .responsive-div');
        if (firstDiv) {
             firstDiv.classList.add('highlight');
             firstDiv.focus();
        }
    }
}
// --- END FUNGSI BARU: MENAMPILKAN ITEM ---


// Fungsi untuk memutar video (mirip dengan koleksi.js)
function playVideo(videoFile, logoFile, textFile, cropMode, cropPosition, cropScale) {
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    
    // BARU: Simpan mode dan posisi crop. Default adalah 'fill'.
    sessionStorage.setItem('videoCropMode', cropMode || 'fill'); 
    sessionStorage.setItem('videoCropPosition', cropPosition || '50% 50%'); 
    sessionStorage.setItem('videoCropScale', cropScale || ''); // <--- SIMPAN NILAI SKALA

    window.location.href = 'ply.html';
}

// Fungsi untuk mencari
function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');
    for (var i = 0; i < li.length; i++) {
        var textToSearch = li[i].querySelector('.re').innerText.toLowerCase(); 
        if (textToSearch.indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

document.getElementById("cari").addEventListener("input", prosesMenu);

// --- MODIFIKASI UNTUK MENYIMPAN SCROLL SAAT BERGULIR ---

const saveScrollPosition = () => {
    const container = document.getElementById('container');
    if (container) {
        // Simpan posisi scroll saat pengguna menggulir di halaman tiviku.html
        sessionStorage.setItem('scrollPosition', container.scrollTop);
    }
};

const containerScrollElement = document.getElementById('container');
if (containerScrollElement) {
    // Tambahkan event listener scroll ke elemen #container
    containerScrollElement.addEventListener('scroll', saveScrollPosition);
}

// --- END MODIFIKASI SCROLL ---