const atas = document.getElementById('atas');
// MENGHAPUS kode injeksi logo/search ke #atas karena sudah dipindah ke tiviku.html
atas.innerHTML = ''; 

// 1. Files yang langsung ditampilkan di halaman utama (BERANDA)
const directFiles = [
'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/cmpr.json',
'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/mp4.json'
];

// 2. File JSON TUNGGAL untuk semua data koleksi klik (BERANDA)
const collectionListUrl = 'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/koleksi.json';

// 3. FILE BARU UNTUK LIVE TV
const liveTVUrl = 'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/tvlive.json'; // Asumsi live.json berada di direktori yang sama.

const totalFiles = directFiles.length + 1; // Variabel ini hanya berlaku untuk Beranda
let filesProcessedCount = 0; 
const container = document.getElementById('container');

let allItems = []; // Array untuk menampung semua item Beranda (persisten)
let currentItems = []; // Array untuk menampung item yang sedang ditampilkan (Beranda atau Live TV)


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
                    observer.unobserve(entry.target); 
                }
            }
        }
    });
}, {
    root: document.getElementById('container'), 
    rootMargin: '100px 0px', 
    threshold: 0.01
});
// --- END FUNGSI OBSERVASI ---

// Fungsi untuk membuat elemen film
function createFilmElement(item, clickAction, isCollection = false) {
    const img = document.createElement('img');
    img.id = 'imgv';
    
    img.setAttribute('data-src', item.logo); 
    img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="270" height="220" viewBox="0 0 270 220"%3E%3Crect width="100%25" height="100%25" fill="%231a1a1a"%3E%3C/rect%3E%3C/svg%3E'; 
    
    img.classList.add('lazy-img'); 

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

    return dv; 
}
// --- END FUNGSI PENCIPTAAN ELEMEN DENGAN LAZY LOADING ---

// --- FUNGSI MENGACAK DAN MENYIMPAN URUTAN BERANDA KE SESSION STORAGE ---
function shuffleAndSaveItems() {
    shuffleArray(allItems);
    try {
        sessionStorage.setItem('savedItemList', JSON.stringify(allItems));
    } catch (e) {
        console.error("Gagal menyimpan item list Beranda ke sessionStorage.", e);
    }
}

// --- FUNGSI BARU: MENGACAK DAN MENYIMPAN URUTAN LIVE TV KE SESSION STORAGE ---
function shuffleAndSaveLiveTVItems(items) {
    shuffleArray(items);
    try {
        sessionStorage.setItem('savedLiveTVList', JSON.stringify(items));
    } catch (e) {
        console.error("Gagal menyimpan Live TV list ke sessionStorage.", e);
    }
}


// --- FUNGSI UTAMA PEMUATAN DATA BERANDA (TIDAK ADA PERUBAHAN) ---
function loadAndRenderHomeContent() {
    // Hanya muat jika belum pernah dimuat
    if (filesProcessedCount === 0) {
        container.innerHTML = '<h2>Memuat Konten Beranda...</h2>';
        allItems = []; 
        
        // 1. Memproses DIRECT FILES
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

        // 2. Memproses COLLECTION FILE TUNGGAL
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
    } else {
        // Jika sudah dimuat, cukup render ulang
        checkAndRenderItems();
    }
}


// FUNGSI BARU UNTUK MEMUAT KONTEN LIVE TV (MODIFIKASI KRITIS)
function loadAndRenderLiveTVContent() {
    const savedLiveTVList = sessionStorage.getItem('savedLiveTVList');

    if (savedLiveTVList) {
        try {
            // 1. Jika data sudah ada di sessionStorage, gunakan itu (Persistensi)
            currentItems = JSON.parse(savedLiveTVList);
            // Pastikan type-nya adalah 'live' untuk aksi klik yang benar
            currentItems = currentItems.map(item => ({...item, type: 'live'})); 
            
            container.innerHTML = '<h2>Memuat Channel Live TV dari memori...</h2>';
            renderCurrentItems();
            return; // Hentikan eksekusi selanjutnya
        } catch (e) {
            console.error("Gagal parsing savedLiveTVList, melakukan fetch ulang.", e);
            sessionStorage.removeItem('savedLiveTVList'); // Hapus yang rusak
        }
    }

    // 2. Jika tidak ada di cache (pemuatan pertama atau gagal parsing), lakukan fetch
    container.innerHTML = '<h2>Memuat Channel Live TV...</h2>';
    currentItems = []; 

    fetch(liveTVUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal memuat live.json: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            let liveItems = [];
            data.forEach(item => {
                liveItems.push({...item, type: 'live'}); 
            });
            
            // Lakukan pengacakan HANYA pada pemuatan pertama, lalu simpan.
            shuffleAndSaveLiveTVItems(liveItems);
            
            currentItems = liveItems;
            renderCurrentItems(); 
        })
        .catch(error => {
            console.error('Error loading Live TV JSON:', liveTVUrl, error);
            container.innerHTML = '<h2>❌ Gagal memuat Live TV: Pastikan file live.json ada.</h2>';
        });
}


// FUNGSI UMUM: MERENDER currentItems ke DOM (TIDAK ADA PERUBAHAN)
function renderCurrentItems() {
    container.innerHTML = ''; 

    currentItems.forEach(item => {
        let action;
        let isCollection = false;

        if (item.type === 'collection') {
            action = () => openCollection(item.url, item.ttl);
            isCollection = true;
        } else { // type === 'live' atau 'direct'
            // Simpan data page sebelum playVideo untuk memastikan kembali ke menu yang benar
            action = () => {
                sessionStorage.setItem('lastActiveMenuPage', item.type === 'live' ? 'live' : 'beranda');
                playVideo(item.lnk, item.logo, item.ttl, item.crop_mode, item.crop_position, item.crop_scale);
            };
            isCollection = false;
        }

        createFilmElement(item, action, isCollection);
    });
    
    // Panggil fungsi pemulihan fokus universal
    restoreFocusOnContent(); 
}


// FUNGSI UTAMA UNTUK MEMERIKSA DATA BERANDA DAN MENAMPILKAN (TIDAK ADA PERUBAHAN)
function checkAndRenderItems() {
    // Tunggu hingga semua file selesai diproses
    if (filesProcessedCount < totalFiles) {
        return; 
    }
    
    // --- LOGIKA PERSISTENSI URUTAN ---
    const savedItems = sessionStorage.getItem('savedItemList');

    if (savedItems) {
        try {
            allItems = JSON.parse(savedItems); 
        } catch (e) {
            shuffleAndSaveItems();
        }
    }
    // Jika tidak ada savedItems (pertama kali), shuffle dan simpan
    else {
        shuffleAndSaveItems();
    }
    
    // PENTING: Gunakan allItems (Beranda) untuk currentItems
    currentItems = allItems;
    
    renderCurrentItems(); 
}


// FUNGSI BARU: Memulihkan fokus konten yang sedang dimuat (Universal)
const restoreFocusOnContent = () => {
    const savedTitle = sessionStorage.getItem('lastVideoTitle'); // Dari kembali setelah Play
    const lastFocusedTitle = sessionStorage.getItem('lastFocusedCardTitle'); // Dari Navigasi Sticky
    
    const container = document.getElementById('container');
    const activePage = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
    
    let focusRestoredToCard = false; 

    // Bersihkan highlight yang mungkin tersisa
    document.querySelectorAll('.responsive-div').forEach(div => div.classList.remove('highlight'));
    
    let targetElement = null;
    
    // 1. PRIORITAS 1: Cari item terakhir yang diklik (Kembali dari Player)
    if (savedTitle) {
        const allDivs = document.querySelectorAll('.responsive-div');
        allDivs.forEach(div => {
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === savedTitle) {
                targetElement = div;
            }
        });
        
        // Jika ditemukan, hapus savedTitle agar hanya dipulihkan sekali dari player
        if(targetElement) {
             sessionStorage.removeItem('lastVideoTitle'); 
        }
    } 
    
    // 2. PRIORITAS 2: Jika tidak ditemukan dari Player, cari dari fokus terakhir (Sticky Focus)
    if (!targetElement && lastFocusedTitle) {
        const allDivs = document.querySelectorAll('.responsive-div');
        allDivs.forEach(div => {
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === lastFocusedTitle) {
                targetElement = div;
            }
        });
        // Catatan: lastFocusedCardTitle TIDAK dihapus di sini, agar "sticky"
    }

    // 3. Terapkan fokus dan scroll jika item ditemukan (dari Prioritas 1 atau 2)
    if (targetElement) {
        targetElement.classList.add('highlight');
        targetElement.focus();
        
        // Scroll hanya jika elemen tidak terlihat
        if (!isElementInView(targetElement, container)) {
             targetElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
        
        focusRestoredToCard = true; 
    } 
    
    // 4. PRIORITAS 3: Handle scroll position (Jika tidak ada target spesifik, coba dari scroll)
    if (!focusRestoredToCard && (activePage === 'beranda' || activePage === 'live')) { 
        const savedScrollPosition = sessionStorage.getItem('scrollPosition');
        if (savedScrollPosition !== null && container) {
            container.scrollTop = parseInt(savedScrollPosition, 10);
            
            // Fokus ke elemen pertama yang terlihat setelah scroll
            const firstVisible = getFirstVisibleElement(container);
            if (firstVisible) {
                 firstVisible.classList.add('highlight');
                 firstVisible.focus();
                 focusRestoredToCard = true;
            }
        }
    }
    
    // 5. Fallback: Jika TIDAK ADA fokus kartu yang berhasil, fokuskan Sidebar
    if (!focusRestoredToCard) {
        const activeNav = document.querySelector(`.nav-item[data-page="${activePage}"]`);
        if (activeNav) {
            activeNav.focus();
        } else {
             // Fallback ke Search Input jika navigasi juga gagal
             const searchInput = document.getElementById('cari');
             if (searchInput) searchInput.focus();
        }
    }
}


// Helper: Cek apakah elemen terlihat di dalam container
function isElementInView(el, container) {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const elHeight = elRect.height; 
    
    return (
        elRect.top >= containerRect.top &&
        elRect.bottom <= containerRect.bottom + elRect.height
    );
}

// Helper: Dapatkan elemen pertama yang terlihat
function getFirstVisibleElement(container) {
    const allDivs = document.querySelectorAll('.responsive-div');
    for (const div of allDivs) {
        if (getComputedStyle(div).display !== 'none' && isElementInView(div, container)) {
            return div;
        }
    }
    // Jika tidak ada yang terlihat, kembalikan elemen pertama yang tidak disembunyikan
    return document.querySelector('.responsive-div:not([style*="display: none"])');
}


// Fungsi untuk membuka Koleksi (TIDAK ADA PERUBAHAN)
function openCollection(jsonUrl, collectionTitle) {
    // Simpan judul terakhir untuk pemulihan fokus di page koleksi
    sessionStorage.setItem('lastCollectionVideoTitle', collectionTitle); 
    
    // Simpan judul koleksi juga sebagai lastVideoTitle
    sessionStorage.setItem('lastVideoTitle', collectionTitle); 

    sessionStorage.setItem('collectionJsonUrl', jsonUrl); 
    sessionStorage.setItem('collectionTitle', collectionTitle); 
    sessionStorage.removeItem('collectionScrollPosition');
    
    sessionStorage.removeItem('videoCropMode');
    sessionStorage.removeItem('videoCropPosition');
    sessionStorage.removeItem('videoCropScale'); 

    window.location.href = 'koleksi.html';
}

// Fungsi untuk memutar video (TIDAK ADA PERUBAHAN)
function playVideo(videoFile, logoFile, textFile, cropMode, cropPosition, cropScale) { 
    // Simpan judul terakhir
    sessionStorage.setItem('lastVideoTitle', textFile);
    
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    
    sessionStorage.setItem('videoCropMode', cropMode || 'fill'); 
    sessionStorage.setItem('videoCropPosition', cropPosition || '50% 50%'); 
    sessionStorage.setItem('videoCropScale', cropScale || ''); 

    window.location.href = 'ply.html';
}

// Fungsi untuk mencari (TIDAK ADA PERUBAHAN)
function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');
    for (var i = 0; i < li.length; i++) {
        var textToSearch = li[i].querySelector('.re').innerText.toLowerCase(); 
        if (textToSearch.indexOf(filter) > -1) {
            li[i].style.display = "";
            
            const img = li[i].querySelector('.lazy-img');
            if (img && img.hasAttribute('data-src')) {
                 const src = img.getAttribute('data-src');
                 img.src = src;
                 img.removeAttribute('data-src');
                 imageObserver.unobserve(li[i]); 
            }

        } else {
            li[i].style.display = "none";
        }
    }
}

document.getElementById("cari").addEventListener("input", prosesMenu);

// --- MODIFIKASI UNTUK MENYIMPAN SCROLL SAAT BERGULIR (TIDAK ADA PERUBAHAN) ---

const saveScrollPosition = () => {
    const container = document.getElementById('container');
    const activePage = sessionStorage.getItem('lastActiveMenuPage');
    
    // Hanya simpan posisi scroll jika sedang di menu Beranda atau Live TV
    if (container && (activePage === 'beranda' || activePage === 'live')) { 
        sessionStorage.setItem('scrollPosition', container.scrollTop);
    }
};

const containerScrollElement = document.getElementById('container');
if (containerScrollElement) {
    containerScrollElement.addEventListener('scroll', saveScrollPosition);
}

// --- FUNGSI BARU: JAM DIGITAL (TIDAK ADA PERUBAHAN) ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    // const seconds = String(now.getSeconds()).padStart(2, '0'); // Opsional jika ingin detik
    
    const timeString = `${hours}:${minutes}`; // atau `${hours}:${minutes}:${seconds}`
    
    const clockElement = document.getElementById('digital-clock');
    if (clockElement) {
        clockElement.innerText = timeString;
    }
}

// Panggil fungsi sekali saat memuat dan kemudian setiap detik
updateClock(); 
setInterval(updateClock, 1000); 
// --- END FUNGSI BARU: JAM DIGITAL ---


// --- FUNGSI NAVIGASI KEYBOARD/REMOTE BARU (TIDAK ADA PERUBAHAN) ---
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
            
            if (e.key === 'ArrowDown') {
                const nextIndex = Math.min(currentIndex + 1, navItems.length - 1);
                navItems[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                if (currentIndex === 0) {
                     searchInput.focus();
                     return;
                }
                const nextIndex = Math.max(currentIndex - 1, 0);
                navItems[nextIndex].focus();
            } else if (e.key === 'ArrowRight') {
                // Pindah dari Sidebar ke fokus kartu terakhir (Sticky Focus)
                const lastFocusedTitle = sessionStorage.getItem('lastFocusedCardTitle');
                let targetDiv = null;
                
                if (lastFocusedTitle) {
                    // Cari kartu yang terakhir difokuskan
                    const allDivs = document.querySelectorAll('.responsive-div');
                    allDivs.forEach(div => {
                         const pElement = div.querySelector('.re');
                         if (pElement && pElement.innerText === lastFocusedTitle && getComputedStyle(div).display !== 'none') {
                             targetDiv = div;
                         }
                    });
                }
                
                // Jika ditemukan kartu fokus terakhir ATAU kartu pertama yang terlihat
                const firstDiv = targetDiv || getFirstVisibleElement(container) || document.querySelector('.responsive-div:not([style*="display: none"])');
                
                if (firstDiv) {
                    firstDiv.classList.add('highlight');
                    firstDiv.focus();
                    firstDiv.scrollIntoView({ behavior: 'instant', block: 'center' }); // Pastikan terlihat
                }
            } else if (e.key === 'Enter') {
                const page = focusedElement.getAttribute('data-page');
                
                // Simpan status menu sebelum klik
                sessionStorage.setItem('lastActiveMenuPage', page);
                
                // Reset scroll position saat pindah menu (kecuali Beranda ke Beranda)
                sessionStorage.removeItem('scrollPosition');
                sessionStorage.removeItem('lastVideoTitle'); 
                sessionStorage.removeItem('lastFocusedCardTitle'); // Clear sticky focus when switching menus
                
                if (page === 'beranda') {
                    loadAndRenderHomeContent(); 
                } else if (page === 'live') {
                    loadAndRenderLiveTVContent();
                } else {
                    filesProcessedCount = 0; 
                    currentItems = []; 
                    container.innerHTML = `<h2>Konten untuk ${focusedElement.innerText} belum tersedia.</h2>`;
                    restoreFocusOnContent();
                }
            }
            return;
        }

        // 3. LOGIKA UNTUK INPUT CARI
        if (focusedElement === searchInput) {
            if (e.key === 'ArrowDown') {
                const firstNavItem = document.querySelector('.nav-item');
                if (firstNavItem) {
                    firstNavItem.focus();
                }
            } else if (e.key === 'ArrowRight') {
                // Pindah dari Search ke fokus kartu terakhir (Sticky Focus)
                const lastFocusedTitle = sessionStorage.getItem('lastFocusedCardTitle');
                let targetDiv = null;
                
                if (lastFocusedTitle) {
                    const allDivs = document.querySelectorAll('.responsive-div');
                    allDivs.forEach(div => {
                         const pElement = div.querySelector('.re');
                         if (pElement && pElement.innerText === lastFocusedTitle && getComputedStyle(div).display !== 'none') {
                             targetDiv = div;
                         }
                    });
                }
                
                const firstDiv = targetDiv || getFirstVisibleElement(container) || document.querySelector('.responsive-div:not([style*="display: none"])');
                
                if (firstDiv) {
                    firstDiv.classList.add('highlight');
                    firstDiv.focus();
                }
            }
            return; 
        }
        
        // 4. LOGIKA NAVIGASI CARD FILM
        const divs = Array.from(document.querySelectorAll('.responsive-div')).filter(div => getComputedStyle(div).display !== 'none');
        
        const currentIndex = divs.findIndex(div => div === focusedElement);
        
        if (divs.length === 0 || currentIndex === -1) return;

        let nextIndex = -1;
        
        const containerRect = container.getBoundingClientRect();
        const firstVisibleDiv = getFirstVisibleElement(container);
        const cardWidthWithMargin = firstVisibleDiv ? firstVisibleDiv.offsetWidth + 30 : 300; 
        
        const itemsPerRow = Math.floor(containerRect.width / cardWidthWithMargin);
        const actualItemsPerRow = Math.max(1, itemsPerRow); 
        
        focusedElement.classList.remove('highlight');
            
        switch (e.key) {
            case 'ArrowDown':
                nextIndex = Math.min(currentIndex + actualItemsPerRow, divs.length - 1);
                break;
            case 'ArrowUp':
                nextIndex = currentIndex - actualItemsPerRow;
                
                if (nextIndex < 0) {
                    searchInput.focus(); 
                    return;
                }
                break;
            case 'ArrowRight':
                nextIndex = Math.min(currentIndex + 1, divs.length - 1);
                break;
            case 'ArrowLeft':
                nextIndex = currentIndex - 1;
                
                if (nextIndex < 0 || (currentIndex % actualItemsPerRow === 0)) {
                    const activePage = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
                    const activeNav = document.querySelector(`.nav-item[data-page="${activePage}"]`);
                    
                    if (activeNav) {
                        activeNav.focus();
                    } else {
                        searchInput.focus(); 
                    }
                    return;
                }
                break;
            case 'Enter':
                focusedElement.click();
                return; 
        }

        if (nextIndex !== -1 && divs[nextIndex]) {
            divs[nextIndex].classList.add('highlight');
            divs[nextIndex].focus();
            
            // Simpan posisi fokus setiap kali berpindah
            const focusedTitle = divs[nextIndex].querySelector('.re').innerText;
            sessionStorage.setItem('lastFocusedCardTitle', focusedTitle); 
            
            divs[nextIndex].scrollIntoView({ behavior: 'instant', block: 'center' });
            
            saveScrollPosition();
        }
    } else if (e.key === 'Escape') {
        window.history.back();
    }
});
// --- END FUNGSI NAVIGASI KEYBOARD/REMOTE BARU ---


// --- FUNGSI INTI UNTUK MENGATUR NAVIGASI DAN PEMUATAN AWAL (TIDAK ADA PERUBAHAN) ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Reset highlight pada film saat pindah menu
            document.querySelectorAll('.responsive-div').forEach(div => div.classList.remove('highlight'));
            
            const page = item.getAttribute('data-page');
            
            // Simpan menu yang sedang aktif
            sessionStorage.setItem('lastActiveMenuPage', page); 
            
            // Hapus semua konten dari container utama
            container.innerHTML = ''; 
            
            if (page === 'beranda') {
                loadAndRenderHomeContent();
            } else if (page === 'live') {
                loadAndRenderLiveTVContent();
            } else {
                filesProcessedCount = 0; 
                currentItems = []; 
                container.innerHTML = `<h2>Konten untuk ${focusedElement.innerText} belum tersedia.</h2>`;
                restoreFocusOnContent();
            }
        });
    });
    
    // Pemicu Awal: Klik menu terakhir yang disimpan secara otomatis
    const lastPage = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
    const initialNav = document.querySelector(`.nav-item[data-page="${lastPage}"]`);

    if (initialNav) {
        // Trigger the click event to load content and save the state
        initialNav.click();
    } else {
        // Fallback ke Beranda
        const homeNav = document.querySelector('.nav-item[data-page="beranda"]');
        if (homeNav) homeNav.click();
    }
}

// Jalankan inisialisasi setelah script dimuat
initNavigation();
