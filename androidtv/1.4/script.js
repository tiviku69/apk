const atas = document.getElementById('atas');
// Menghapus elemen h1 dan input cari dari #atas, hanya menyisakan "by tiviku"
atas.innerHTML = '<div style="color:white; position:absolute; right:10px; top:10px; font-size:12px;">by tiviku</div>'; 

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
    rootMargin: '200px 0px', // Mulai memuat saat gambar 200px mendekati viewport
    threshold: 0.01
});
// --- END FUNGSI OBSERVASI ---

// Fungsi untuk membuat elemen film
function createFilmElement(item, clickAction, isCollection = false) {
    const img = document.createElement('img');
    img.id = 'imgv';
    
    // PERUBAHAN KRITIS: Gunakan data-src untuk Lazy Loading
    img.setAttribute('data-src', item.logo); 
    // Placeholder Potret 170x250
    img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="170" height="250" viewBox="0 0 170 250"%3E%3Crect width="100%25" height="100%25" fill="%231a1a1a"%3E%3C/rect%3E%3C/svg%3E'; 
    
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
    dv.appendChild(dur); // Durasi di atas gambar
    dv.appendChild(pp);  // Judul di bawah gambar
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
        // Jika tidak ada data tersimpan, fokuskan item menu pertama (Beranda)
        const firstNavItem = document.querySelector('.nav-item');
        if (firstNavItem) {
            firstNavItem.focus();
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
    
    // Ambil tinggi elemen + margin vertikal
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
        // Hanya elemen yang ditampilkan di DOM dan terlihat di container yang valid
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
function playVideo(videoFile, logoFile, textFile, cropMode, cropPosition, cropScale) { // <--- TAMBAHKAN cropScale
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

// --- FUNGSI NAVIGASI KEYBOARD/REMOTE BARU (Halaman Utama) ---
document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('cari');
    const focusedElement = document.activeElement;
    
    // Navigasi ArrowRight/ArrowLeft hanya untuk card
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (!focusedElement.classList.contains('responsive-div')) {
            // Jika fokus di menu atau search, biarkan logika di bawah yang menangani perpindahan ke card
            return;
        }
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Enter') {
        
        e.preventDefault(); 
        
        // 1. LOGIKA NAVIGASI SIDEBAR
        if (focusedElement.classList.contains('nav-item')) {
            const navItems = Array.from(document.querySelectorAll('.nav-item'));
            const currentIndex = navItems.findIndex(item => item === focusedElement);
            
            focusedElement.classList.remove('active'); // Hapus highlight yang lama

            if (e.key === 'ArrowDown') {
                const nextIndex = Math.min(currentIndex + 1, navItems.length - 1);
                navItems[nextIndex].focus();
                navItems[nextIndex].classList.add('active');
            } else if (e.key === 'ArrowUp') {
                if (currentIndex === 0) {
                     // Pindah ke Input Cari
                     searchInput.focus();
                     return;
                }
                const nextIndex = Math.max(currentIndex - 1, 0);
                navItems[nextIndex].focus();
                navItems[nextIndex].classList.add('active');
            } else if (e.key === 'ArrowRight') {
                // Pindah dari Sidebar ke Card Film Pertama
                const firstDiv = getFirstVisibleElement(container) || document.querySelector('.responsive-div:not([style*="display: none"])');
                if (firstDiv) {
                    firstDiv.classList.add('highlight');
                    firstDiv.focus();
                }
            } else if (e.key === 'Enter') {
                // Trigger action/link jika ada, saat ini hanya perubahan highlight
                // Lakukan klik untuk simulasi
                focusedElement.click(); 
            }
            return;
        }

        // 2. LOGIKA UNTUK INPUT CARI
        if (focusedElement === searchInput) {
            if (e.key === 'ArrowDown') {
                // Pindah ke Item Menu Pertama
                const firstNavItem = document.querySelector('.nav-item');
                if (firstNavItem) {
                    firstNavItem.classList.add('active');
                    firstNavItem.focus();
                }
            }
            // Biarkan ArrowLeft/Right/Enter berfungsi normal di dalam input cari jika sedang fokus
            return; 
        }
        
        // 3. LOGIKA NAVIGASI CARD FILM
        
        // FIX KRITIS: HANYA gunakan div yang terlihat untuk navigasi
        const divs = Array.from(document.querySelectorAll('.responsive-div')).filter(div => getComputedStyle(div).display !== 'none');
        
        const currentIndex = divs.findIndex(div => div === focusedElement);
        
        if (divs.length === 0) return;

        let nextIndex = -1;
        const containerRect = container.getBoundingClientRect();
        
        const divElement = divs[0];
        // Menggunakan offsetWidth + gap (gap container: 30px) <-- DIEDIT DARI 20px
        const cardWidth = divElement ? divElement.offsetWidth + 30 : 200; // 170 + 30
        
        const itemsPerRow = Math.floor(container.offsetWidth / cardWidth);
        const actualItemsPerRow = Math.max(1, itemsPerRow); 

        if (currentIndex === -1) {
            // Jika tidak ada yang fokus (misalnya, baru datang dari sidebar), fokuskan elemen pertama
            if (e.key === 'ArrowLeft') {
                // Pindah ke Sidebar jika menekan kiri dari non-card
                const currentNavItem = document.querySelector('.nav-item.active') || document.querySelector('.nav-item');
                if (currentNavItem) {
                    currentNavItem.focus();
                } else {
                    searchInput.focus();
                }
                return;
            }
            nextIndex = 0;
        } else {
            // Hapus highlight dari elemen saat ini
            focusedElement.classList.remove('highlight');
            
            switch (e.key) {
                case 'ArrowDown':
                    // Pindah ke bawah satu baris
                    nextIndex = Math.min(currentIndex + actualItemsPerRow, divs.length - 1);
                    break;
                case 'ArrowUp':
                    nextIndex = currentIndex - actualItemsPerRow;
                    
                    // JIKA nextIndex NEGATIF (berarti sudah di baris paling atas)
                    if (nextIndex < 0) {
                        // Tidak ada perpindahan, biarkan tetap fokus di baris paling atas
                        nextIndex = currentIndex;
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
                        const currentNavItem = document.querySelector('.nav-item.active') || document.querySelector('.nav-item');
                        if (currentNavItem) {
                            currentNavItem.focus();
                        } else {
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
    // Abaikan key lain
});
// --- END FUNGSI NAVIGASI KEYBOARD/REMOTE BARU ---