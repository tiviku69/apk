const atas = document.getElementById('atas');
// MENGHAPUS kode injeksi logo/search ke #atas karena sudah dipindah ke tiviku.html
atas.innerHTML = ''; 

// 1. Files yang langsung ditampilkan di halaman utama
const directFiles = [
'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/cmpr.json','tes.json',
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

// --- FUNGSI BARU UNTUK OBSERVASI (LAZY LOADING) ---
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target.querySelector('.lazy-img'); 
            if (img) {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src; // Pindahkan URL dari data-src ke src
                    img.removeAttribute('data-src');
                    observer.unobserve(entry.target); // Berhenti mengamati div setelah dimuat
                }
            }
        }
    });
}, {
    root: document.getElementById('container'), // Gunakan container sebagai root
    rootMargin: '100px 0px', // Mulai memuat saat gambar 100px mendekati viewport
    threshold: 0.01
});
// --- END FUNGSI OBSERVASI ---

// Fungsi untuk membuat elemen film
function createFilmElement(item, clickAction, isCollection = false) {
    const img = document.createElement('img');
    img.id = 'imgv';
    
    // PERUBAHAN KRITIS: Gunakan data-src untuk Lazy Loading
    img.setAttribute('data-src', item.logo); 
    // Placeholder abu-abu gelap (sesuai dimensi asli 270x220)
    img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="270" height="220" viewBox="0 0 270 220"%3E%3Crect width="100%25" height="100%25" fill="%231a1a1a"%3E%3C/rect%3E%3C/svg%3E'; 
    
    img.classList.add('lazy-img'); // Tambahkan kelas untuk target observer

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
    
    // Mulai amati div
    imageObserver.observe(dv);

    return dv; // Kembalikan elemen untuk penggunaan lain (opsional)
}
// --- END FUNGSI PENCIPTAAN ELEMEN DENGAN LAZY LOADING ---

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
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                allItems.push({...item, type: 'direct'}); 
            });
            filesProcessedCount++;
            checkAndRenderItems();
        })
        .catch(error => {
            console.error('Error loading DIRECT JSON:', fileUrl, error);
            filesProcessedCount++;
            checkAndRenderItems();
        });
});

// 2. Memproses COLLECTION FILE TUNGGAL (Mengambil semua koleksi dari 1 URL)
fetch(collectionListUrl)
    .then(response => response.json())
    .then(data => {
        data.forEach(collectionItem => {
            const displayItem = {
                logo: collectionItem.collectionLogo,
                ttl: collectionItem.collectionTitle,
                url: collectionItem.url,
                type: 'collection'
            };
            allItems.push(displayItem);
        });
        filesProcessedCount++;
        checkAndRenderItems();
    })
    .catch(error => {
        console.error('Error loading COLLECTION LIST JSON:', collectionListUrl, error);
        filesProcessedCount++;
        checkAndRenderItems();
    });


// FUNGSI UTAMA UNTUK MEMERIKSA DATA DAN MENAMPILKAN
function checkAndRenderItems() {
    // Tunggu hingga semua file selesai diproses
    if (filesProcessedCount < totalFiles) {
        return; 
    }
    
    // --- START LOGIKA PERSISTENSI URUTAN ---
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
    // --- END LOGIKA PERSISTENSI URUTAN ---
    
    // Kosongkan container sebelum menambahkan item
    container.innerHTML = '';

    // Render item ke DOM
    allItems.forEach(item => {
        let action;
        let isCollection = false;

        if (item.type === 'collection') {
            action = () => openCollection(item.url, item.ttl);
            isCollection = true;
        } else { // type === 'direct'
            // MODIFIKASI: Tambahkan item.crop_mode, item.crop_position, DAN item.crop_scale ke pemanggilan
            action = () => playVideo(item.lnk, item.logo, item.ttl, item.crop_mode, item.crop_position, item.crop_scale);
            isCollection = false;
        }

        createFilmElement(item, action, isCollection);
    });
    
    // Pulihkan fokus dan scroll setelah rendering selesai
    restoreFocusAndScroll();
}


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
            // Cek judul film/koleksi yang terakhir diklik
            if (pElement && pElement.innerText === savedTitle) {
                targetElement = div;
            }
        });
    }

    if (targetElement) {
        targetElement.classList.add('highlight');
        targetElement.focus();
        // Gunakan 'instant' untuk perpindahan yang cepat
        if (!isElementInView(targetElement, container)) {
             targetElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
    } else if (savedScrollPosition !== null && container) {
        container.scrollTop = parseInt(savedScrollPosition, 10);
        // Tetapkan fokus ke elemen pertama yang terlihat
        const firstVisible = getFirstVisibleElement(container);
        if (firstVisible) {
             firstVisible.classList.add('highlight');
             firstVisible.focus();
        } else {
             const firstDiv = document.querySelector('.responsive-div');
             if (firstDiv) {
                 firstDiv.classList.add('highlight');
                 firstDiv.focus();
             }
        }
    } else {
        // Jika tidak ada data tersimpan, fokuskan Search Input
        const searchInput = document.getElementById('cari');
        if (searchInput) {
            searchInput.focus();
        } else {
             const firstDiv = document.querySelector('.responsive-div');
             if (firstDiv) {
                 firstDiv.classList.add('highlight');
                 firstDiv.focus();
             }
        }
    }
}

// Helper: Cek apakah elemen terlihat di dalam container
function isElementInView(el, container) {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Ambil tinggi elemen + margin vertikal (sekitar 210px + 15px*2 = 240px)
    const elHeight = elRect.height; 
    
    return (
        elRect.top >= containerRect.top &&
        elRect.bottom <= containerRect.bottom + elHeight // Beri toleransi 1 tinggi elemen
    );
}

// Helper: Dapatkan elemen pertama yang terlihat
function getFirstVisibleElement(container) {
    // Memastikan hanya elemen yang ditampilkan yang diperiksa
    const allDivs = document.querySelectorAll('.responsive-div');
    for (const div of allDivs) {
        if (getComputedStyle(div).display !== 'none' && isElementInView(div, container)) {
            return div;
        }
    }
    return null;
}


// Fungsi untuk membuka Koleksi (Menyimpan posisi sebelum navigasi)
function openCollection(jsonUrl, collectionTitle) {
    // Scroll disimpan secara otomatis oleh event listener 'scroll' (lihat di bawah)
    sessionStorage.setItem('lastVideoTitle', collectionTitle); 
    sessionStorage.setItem('collectionJsonUrl', jsonUrl); 
    sessionStorage.setItem('collectionTitle', collectionTitle); 
    sessionStorage.removeItem('collectionScrollPosition');
    sessionStorage.removeItem('lastCollectionVideoTitle');
    
    // PENTING: Reset mode crop saat pindah koleksi
    sessionStorage.removeItem('videoCropMode');
    sessionStorage.removeItem('videoCropPosition');
    sessionStorage.removeItem('videoCropScale'); // BARU: Reset skala juga

    window.location.href = 'koleksi.html';
}

// MODIFIKASI: Fungsi untuk memutar video (Digunakan oleh Direct Files)
function playVideo(videoFile, logoFile, textFile, cropMode, cropPosition, cropScale) { // <--- TAMBAKKAN cropScale
    // Scroll disimpan secara otomatis oleh event listener 'scroll' (lihat di bawah)
    sessionStorage.setItem('lastVideoTitle', textFile);
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
            
            // JIKA DICARI, PASTIKAN GAMBAR LANGSUNG DIMUAT
            const img = li[i].querySelector('.lazy-img');
            if (img && img.hasAttribute('data-src')) {
                 const src = img.getAttribute('data-src');
                 img.src = src;
                 img.removeAttribute('data-src');
                 // Hentikan pengamatan jika elemen ditemukan saat pencarian
                 imageObserver.unobserve(li[i]); 
            }

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

// --- FUNGSI NAVIGASI KEYBOARD/REMOTE BARU (Integrasi Sidebar) ---
document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('cari');
    const focusedElement = document.activeElement;
    
    // 1. Logika Navigasi Umum
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Enter') {
        
        e.preventDefault(); 
        
        // 2. LOGIKA NAVIGASI SIDEBAR
        if (focusedElement.classList.contains('nav-item')) {
            const navItems = Array.from(document.querySelectorAll('.nav-item'));
            const currentIndex = navItems.findIndex(item => item === focusedElement);
            
            // HAPUS: navItems.forEach(item => item.classList.remove('active')); 
            // HAPUS: focusedElement.classList.add('active'); 

            if (e.key === 'ArrowDown') {
                const nextIndex = Math.min(currentIndex + 1, navItems.length - 1);
                navItems[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                if (currentIndex === 0) {
                     // Pindah ke Input Cari
                     searchInput.focus();
                     return;
                }
                const nextIndex = Math.max(currentIndex - 1, 0);
                navItems[nextIndex].focus();
            } else if (e.key === 'ArrowRight') {
                // Pindah dari Sidebar ke Card Film Pertama
                const firstDiv = getFirstVisibleElement(container) || document.querySelector('.responsive-div:not([style*="display: none"])');
                if (firstDiv) {
                    firstDiv.classList.add('highlight');
                    firstDiv.focus();
                }
            } else if (e.key === 'Enter') {
                // Trigger click/action pada elemen yang sedang fokus
                // TIDAK ADA LAGI PERUBAHAN CLASS .active DI SINI
                focusedElement.click(); 
            }
            return;
        }

        // 3. LOGIKA UNTUK INPUT CARI
        if (focusedElement === searchInput) {
            if (e.key === 'ArrowDown') {
                // Pindah ke Item Menu Pertama di sidebar
                const firstNavItem = document.querySelector('.nav-item');
                if (firstNavItem) {
                    firstNavItem.focus();
                }
            } else if (e.key === 'ArrowRight') {
                // Pindah dari Search Input ke Card Film Pertama
                const firstDiv = getFirstVisibleElement(container) || document.querySelector('.responsive-div:not([style*="display: none"])');
                if (firstDiv) {
                    firstDiv.classList.add('highlight');
                    firstDiv.focus();
                }
            }
            // Biarkan ArrowLeft/Up/Enter berfungsi normal di dalam input cari jika sedang fokus
            return; 
        }
        
        // 4. LOGIKA NAVIGASI CARD FILM (Revert ke grid asli, ditambah L/R)
        
        // HANYA gunakan div yang terlihat untuk navigasi
        const divs = Array.from(document.querySelectorAll('.responsive-div')).filter(div => getComputedStyle(div).display !== 'none');
        
        const currentIndex = divs.findIndex(div => div === focusedElement);
        
        if (divs.length === 0 || currentIndex === -1) return;

        let nextIndex = -1;
        
        const divElement = divs[0];
        // Perhitungan Lebar Kartu ASLI: 260px + margin 15px*2 = 290px
        const cardWidth = divElement ? divElement.offsetWidth + 30 : 300; 
        
        const containerWidth = container.offsetWidth;
        const itemsPerRow = Math.floor(containerWidth / cardWidth);
        const actualItemsPerRow = Math.max(1, itemsPerRow); 
        
        // Hapus highlight dari elemen saat ini
        focusedElement.classList.remove('highlight');
            
        switch (e.key) {
            case 'ArrowDown':
                // Pindah ke bawah satu baris (ASLI)
                nextIndex = Math.min(currentIndex + actualItemsPerRow, divs.length - 1);
                break;
            case 'ArrowUp':
                nextIndex = currentIndex - actualItemsPerRow;
                
                // JIKA nextIndex NEGATIF (berarti sudah di baris paling atas)
                if (nextIndex < 0) {
                    searchInput.focus(); // Pindah ke searchInput di sidebar
                    return;
                }
                break;
            case 'ArrowRight':
                // Pindah ke kanan satu kolom
                nextIndex = Math.min(currentIndex + 1, divs.length - 1);
                break;
            case 'ArrowLeft':
                // Pindah ke kiri satu kolom
                nextIndex = currentIndex - 1;
                
                if (nextIndex < 0 || (currentIndex % actualItemsPerRow === 0)) {
                    // Jika di kolom pertama, pindah ke sidebar
                    const firstNavItem = document.querySelector('.nav-item');
                    if (firstNavItem) {
                        // Fokuskan item menu pertama
                        firstNavItem.focus();
                    } else {
                        // Fallback ke search
                        searchInput.focus(); 
                    }
                    return;
                }
                break;
            case 'Enter':
                // Trigger click/action pada elemen yang sedang fokus
                focusedElement.click();
                return; 
        }

        if (nextIndex !== -1 && divs[nextIndex]) {
            divs[nextIndex].classList.add('highlight');
            divs[nextIndex].focus();
            
            // Menggunakan 'instant' untuk pergeseran cepat
            divs[nextIndex].scrollIntoView({ behavior: 'instant', block: 'center' });
            
            saveScrollPosition();
        }
    } else if (e.key === 'Escape') {
        window.history.back();
    }
});
// --- END FUNGSI NAVIGASI KEYBOARD/REMOTE BARU (Integrasi Sidebar) ---