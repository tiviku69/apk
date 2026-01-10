const atas = document.getElementById('atas');
// MENGHAPUS kode injeksi logo/search ke #atas karena sudah dipindah ke tiviku.html
atas.innerHTML = ''; 

// BARU: Konstanta Versi Aplikasi
const APP_VERSION = 'v1.2.0'; 

// 1. Files yang langsung ditampilkan di halaman utama (BERANDA)
const directFiles = [
'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/hardsub.json','https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/mp4.json'
];

// 2. File JSON TUNGGAL untuk semua data koleksi klik (BERANDA)
const collectionListUrl = 'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/koleksi.json';

// 3. FILE BARU UNTUK LIVE TV
const liveTVUrl = 'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/tvlive.json';

const totalFiles = directFiles.length + 1; // Variabel ini hanya berlaku untuk Beranda
let filesProcessedCount = 0; 
const container = document.getElementById('container');
// MODIFIKASI: Ambil elemen pengaturan
const pengaturanMenu = document.getElementById('pengaturan-menu'); 

let allItems = []; 
let currentItems = []; 

// --- MODIFIKASI: FUNGSI BARU: MANAJEMEN LOCALSTORAGE (SOLUSI TEMA PERSISTEN) ---
/**
 * Menyimpan pasangan key-value sebagai LocalStorage.
 */
function setLocalStorage(name, value) {
    try {
        localStorage.setItem(name, value);
    } catch (e) {
        console.error("Gagal menyimpan ke LocalStorage:", e);
    }
}

/**
 * Mengambil nilai dari LocalStorage berdasarkan namanya.
 */
function getLocalStorage(name) {
    try {
        return localStorage.getItem(name);
    } catch (e) {
        console.warn("Gagal membaca dari LocalStorage:", e);
        return null;
    }
}
// --- END FUNGSI MANAJEMEN LOCALSTORAGE ---


// --- MODIFIKASI: FUNGSI TEMA (Menggunakan LocalStorage) ---

/**
 * Menerapkan tema ke seluruh aplikasi dan menyimpannya di LocalStorage.
 * @param {string} themeName - Nama tema ('default', 'blue-dark', 'red-dark').
 */
function applyTheme(themeName) {
    const appWrapper = document.getElementById('app-wrapper');
    const body = document.body;
    
    // Hapus semua kelas tema yang ada
    body.classList.remove('theme-blue-dark', 'theme-red-dark');
    appWrapper.classList.remove('theme-blue-dark', 'theme-red-dark'); 

    // Terapkan kelas tema yang baru
    if (themeName !== 'default') {
        const themeClass = `theme-${themeName}`;
        body.classList.add(themeClass);
        appWrapper.classList.add(themeClass);
    }
    
    // PERUBAHAN KRITIS: Simpan tema ke LocalStorage
    try {
        setLocalStorage('currentTheme', themeName);
    } catch (e) {
        console.error("Gagal menyimpan tema ke LocalStorage. Aplikasi mungkin tidak mengizinkan penyimpanan:", e);
    }
}

/**
 * Menyiapkan event listener untuk tombol-tombol tema.
 */
function setupThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
        button.onclick = () => {
            const theme = button.getAttribute('data-theme');
            applyTheme(theme);
            // Fokuskan kembali pada tombol yang baru diklik
            button.focus(); 
        };
    });
}

/**
 * Memuat tema dari LocalStorage saat aplikasi dimulai.
 */
function loadInitialTheme() {
    let savedTheme = 'default';
    try {
        // PERUBAHAN KRITIS: Ambil tema dari LocalStorage
        savedTheme = getLocalStorage('currentTheme') || 'default';
    } catch (e) {
        console.warn("Gagal membaca tema dari LocalStorage, menggunakan default:", e);
    }
    
    applyTheme(savedTheme);
}
// --- END MODIFIKASI FUNGSI TEMA ---

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
                    img.src = src; 
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
    
    imageObserver.observe(dv);

    return dv; 
}


// --- FUNGSI MENGACAK DAN MENYIMPAN URUTAN BERANDA KE SESSION STORAGE (TETAP SESS) ---
function shuffleAndSaveItems() {
    shuffleArray(allItems);
    try {
        sessionStorage.setItem('savedItemList', JSON.stringify(allItems));
    } catch (e) {
        console.error("Gagal menyimpan item list Beranda ke sessionStorage.", e);
    }
}

// --- FUNGSI BARU: MENGACAK DAN MENYIMPAN URUTAN LIVE TV KE SESSION STORAGE (TETAP SESS) ---
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
    container.style.display = 'block'; // Tampilkan konten film
    pengaturanMenu.style.display = 'none'; // Sembunyikan pengaturan
    
    if (filesProcessedCount === 0) {
        container.innerHTML = '<h2>Memuat Konten Beranda...</h2>';
        allItems = []; 
        
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
        checkAndRenderItems();
    }
}


// FUNGSI BARU UNTUK MEMUAT KONTEN LIVE TV (MODIFIKASI KRITIS)
function loadAndRenderLiveTVContent() {
    container.style.display = 'block'; // Tampilkan konten film
    pengaturanMenu.style.display = 'none'; // Sembunyikan pengaturan
    
    const savedLiveTVList = sessionStorage.getItem('savedLiveTVList');

    if (savedLiveTVList) {
        try {
            currentItems = JSON.parse(savedLiveTVList);
            currentItems = currentItems.map(item => ({...item, type: 'live'})); 
            
            container.innerHTML = '<h2>Memuat Channel Live TV dari memori...</h2>';
            renderCurrentItems();
            return; 
        } catch (e) {
            console.error("Gagal parsing savedLiveTVList, melakukan fetch ulang.", e);
            sessionStorage.removeItem('savedLiveTVList'); 
        }
    }

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
            
            shuffleAndSaveLiveTVItems(liveItems);
            
            currentItems = liveItems;
            renderCurrentItems(); 
        })
        .catch(error => {
            console.error('Error loading Live TV JSON:', liveTVUrl, error);
            container.innerHTML = '<h2>❌ Gagal memuat Live TV: Pastikan file live.json ada.</h2>';
        });
}

// MODIFIKASI: FUNGSI BARU UNTUK MENU PENGATURAN (TAMBAH INFORMASI VERSI)
function showPengaturanMenu() {
    container.style.display = 'none'; // Sembunyikan konten film
    pengaturanMenu.style.display = 'flex'; // Tampilkan pengaturan
    
    // BARU: Tampilkan Informasi Versi Aplikasi
    const versionInfo = document.getElementById('app-version-info');
    if (versionInfo) {
        versionInfo.innerHTML = `Versi Aplikasi: 2.0<b>${APP_VERSION}</b>`;
    }
    
    // Hapus fokus terakhir pada kartu film
    sessionStorage.removeItem('lastFocusedCardTitle');
    
    // Fokuskan pada tombol tema pertama saat menu Pengaturan dibuka
    const firstThemeButton = document.querySelector('.theme-button');
    if (firstThemeButton) {
        firstThemeButton.focus();
    }
}
// END MODIFIKASI PENGATURAN

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
            action = () => {
                sessionStorage.setItem('lastActiveMenuPage', item.type === 'live' ? 'live' : 'beranda');
                playVideo(item.lnk, item.logo, item.ttl, item.crop_mode, item.crop_position, item.crop_scale);
            };
            isCollection = false;
        }

        createFilmElement(item, action, isCollection);
    });
    
    restoreFocusOnContent(); 
}


// FUNGSI UTAMA UNTUK MEMERIKSA DATA BERANDA DAN MENAMPILKAN (TIDAK ADA PERUBAHAN)
function checkAndRenderItems() {
    if (filesProcessedCount < totalFiles) {
        return; 
    }
    
    const savedItems = sessionStorage.getItem('savedItemList');

    if (savedItems) {
        try {
            allItems = JSON.parse(savedItems); 
        } catch (e) {
            shuffleAndSaveItems();
        }
    }
    else {
        shuffleAndSaveItems();
    }
    
    currentItems = allItems;
    
    renderCurrentItems(); 
}


// FUNGSI BARU: Memulihkan fokus konten yang sedang dimuat (Universal) (Penambahan Logika Pengaturan)
const restoreFocusOnContent = () => {
    const savedTitle = sessionStorage.getItem('lastVideoTitle'); 
    const lastFocusedTitle = sessionStorage.getItem('lastFocusedCardTitle'); 
    const container = document.getElementById('container');
    const activePage = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
    
    let focusRestoredToCard = false; 

    document.querySelectorAll('.responsive-div').forEach(div => div.classList.remove('highlight'));
    
    let targetElement = null;
    
    if (savedTitle) {
        const allDivs = document.querySelectorAll('.responsive-div');
        allDivs.forEach(div => {
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === savedTitle) {
                targetElement = div;
            }
        });
        
        if(targetElement) {
             sessionStorage.removeItem('lastVideoTitle'); 
        }
    } 
    
    if (!targetElement && lastFocusedTitle) {
        const allDivs = document.querySelectorAll('.responsive-div');
        allDivs.forEach(div => {
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === lastFocusedTitle) {
                targetElement = div;
            }
        });
    }

    if (targetElement) {
        targetElement.classList.add('highlight');
        targetElement.focus();
        
        if (!isElementInView(targetElement, container)) {
             targetElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
        
        focusRestoredToCard = true; 
    } 
    
    if (!focusRestoredToCard && (activePage === 'beranda' || activePage === 'live')) { 
        const savedScrollPosition = sessionStorage.getItem('scrollPosition');
        if (savedScrollPosition !== null && container) {
            container.scrollTop = parseInt(savedScrollPosition, 10);
            
            const firstVisible = getFirstVisibleElement(container);
            if (firstVisible) {
                 firstVisible.classList.add('highlight');
                 firstVisible.focus();
                 focusRestoredToCard = true;
            }
        }
    }
    
    // MODIFIKASI: Fallback jika Pengaturan sedang aktif
    if (activePage === 'pengaturan') {
        showPengaturanMenu();
        const firstThemeButton = document.querySelector('.theme-button');
        if (firstThemeButton) {
             firstThemeButton.focus();
             focusRestoredToCard = true; // Anggap fokus dipulihkan
        }
    }
    
    // 5. Fallback: Jika TIDAK ADA fokus kartu yang berhasil, fokuskan Sidebar
    if (!focusRestoredToCard && activePage !== 'pengaturan') {
        const activeNav = document.querySelector(`.nav-item[data-page="${activePage}"]`);
        if (activeNav) {
            activeNav.focus();
        } else {
             const searchInput = document.getElementById('cari');
             if (searchInput) searchInput.focus();
        }
    }
}


// Helper: Cek apakah elemen terlihat di dalam container (TIDAK ADA PERUBAHAN)
function isElementInView(el, container) {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const elHeight = elRect.height; 
    
    return (
        elRect.top >= containerRect.top &&
        elRect.bottom <= containerRect.bottom + elRect.height
    );
}

// Helper: Dapatkan elemen pertama yang terlihat (TIDAK ADA PERUBAHAN)
function getFirstVisibleElement(container) {
    const allDivs = document.querySelectorAll('.responsive-div');
    for (const div of allDivs) {
        if (getComputedStyle(div).display !== 'none' && isElementInView(div, container)) {
            return div;
        }
    }
    return document.querySelector('.responsive-div:not([style*="display: none"])');
}


// Fungsi untuk membuka Koleksi (TIDAK ADA PERUBAHAN)
function openCollection(jsonUrl, collectionTitle) {
    sessionStorage.setItem('lastCollectionVideoTitle', collectionTitle); 
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
    
    const timeString = `${hours}:${minutes}`;
    
    const clockElement = document.getElementById('digital-clock');
    if (clockElement) {
        clockElement.innerText = timeString;
    }
}

updateClock(); 
setInterval(updateClock, 1000); 


// --- FUNGSI NAVIGASI KEYBOARD/REMOTE BARU (Hanya fokus pada Beranda, Live, Pengaturan) ---
document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('cari');
    const focusedElement = document.activeElement;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Enter') {
        
        e.preventDefault(); 
        
        // 1. LOGIKA NAVIGASI PENGATURAN
        if (focusedElement.classList.contains('theme-button')) {
            const themeButtons = Array.from(document.querySelectorAll('.theme-button'));
            const currentIndex = themeButtons.findIndex(item => item === focusedElement);
            
            if (e.key === 'ArrowRight') {
                const nextIndex = Math.min(currentIndex + 1, themeButtons.length - 1);
                themeButtons[nextIndex].focus();
            } else if (e.key === 'ArrowLeft') {
                const nextIndex = Math.max(currentIndex - 1, 0);
                themeButtons[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                // Pindah kembali ke sidebar (ke item Pengaturan)
                const settingNav = document.querySelector('.nav-item[data-page="pengaturan"]');
                if (settingNav) settingNav.focus();
            } else if (e.key === 'Enter') {
                focusedElement.click(); // Menerapkan tema
            }
            return;
        }

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
                const page = focusedElement.getAttribute('data-page');
                
                if (page === 'pengaturan') {
                    // Pindah dari Pengaturan Sidebar ke tombol tema pertama
                    const firstThemeButton = document.querySelector('.theme-button');
                    if (firstThemeButton) firstThemeButton.focus();
                    return;
                }
                
                // Pindah dari Sidebar (non-Pengaturan) ke fokus kartu terakhir
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
                    firstDiv.scrollIntoView({ behavior: 'instant', block: 'center' }); 
                }
            } else if (e.key === 'Enter') {
                const page = focusedElement.getAttribute('data-page');
                sessionStorage.setItem('lastActiveMenuPage', page);
                sessionStorage.removeItem('scrollPosition');
                sessionStorage.removeItem('lastVideoTitle'); 
                sessionStorage.removeItem('lastFocusedCardTitle'); 
                
                if (page === 'beranda') {
                    loadAndRenderHomeContent(); 
                } else if (page === 'live') {
                    loadAndRenderLiveTVContent();
                } else if (page === 'pengaturan') { // Handle Pengaturan
                    showPengaturanMenu();
                }
            }
            return;
        }

        // 3. LOGIKA UNTUK INPUT CARI (TIDAK ADA PERUBAHAN)
        if (focusedElement === searchInput) {
            if (e.key === 'ArrowDown') {
                const firstNavItem = document.querySelector('.nav-item');
                if (firstNavItem) {
                    firstNavItem.focus();
                }
            } else if (e.key === 'ArrowRight') {
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
        
        // 4. LOGIKA NAVIGASI CARD FILM (TIDAK ADA PERUBAHAN)
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
            
            const focusedTitle = divs[nextIndex].querySelector('.re').innerText;
            sessionStorage.setItem('lastFocusedCardTitle', focusedTitle); 
            
            divs[nextIndex].scrollIntoView({ behavior: 'instant', block: 'center' });
            
            saveScrollPosition();
        }
    } else if (e.key === 'Escape') {
        window.history.back();
    }
});


// --- FUNGSI INTI UNTUK MENGATUR NAVIGASI DAN PEMUATAN AWAL (MODIFIKASI) ---
function initNavigation() {
    // 1. Muat tema awal (PENTING)
    loadInitialTheme();
    
    // 2. Setup tombol tema
    setupThemeButtons();

    // 3. Setup navigasi menu
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Reset highlight pada film saat pindah menu
            document.querySelectorAll('.responsive-div').forEach(div => div.classList.remove('highlight'));
            
            const page = item.getAttribute('data-page');
            
            sessionStorage.setItem('lastActiveMenuPage', page); 
            container.innerHTML = ''; 
            
            // Logika untuk menampilkan konten/menu yang sesuai
            if (page === 'beranda') {
                loadAndRenderHomeContent();
            } else if (page === 'live') {
                loadAndRenderLiveTVContent();
            } else if (page === 'pengaturan') {
                showPengaturanMenu();
            }
            else {
                // Fallback jika ada nav-item lain yang tidak terdefinisi
                filesProcessedCount = 0; 
                currentItems = []; 
                container.style.display = 'block';
                pengaturanMenu.style.display = 'none';
                container.innerHTML = `<h2>Konten untuk ${item.innerText} belum tersedia.</h2>`; 
                restoreFocusOnContent();
            }
        });
    });
    
    // Pemicu Awal: Klik menu terakhir yang disimpan secara otomatis
    const lastPage = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
    
    // Jika terakhir kali di halaman yang sudah dihapus, paksa ke beranda
    const validPages = ['beranda', 'live', 'pengaturan'];
    const initialPage = validPages.includes(lastPage) ? lastPage : 'beranda';
    
    const initialNav = document.querySelector(`.nav-item[data-page="${initialPage}"]`);

    if (initialNav) {
        initialNav.click();
    } else {
        const homeNav = document.querySelector('.nav-item[data-page="beranda"]');
        if (homeNav) homeNav.click();
    }
}

// Jalankan inisialisasi setelah script dimuat
initNavigation();
