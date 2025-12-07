const atas = document.getElementById('atas');
// atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b> <input type="text" name="" id="cari" onkeyup="prosesMenu()" placeholder="cari..."> '; // OLD CODE

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

// --- NEW: SIDEBAR MENU ITEMS CONFIGURATION ---
const menuItemsConfig = [
    { title: "Beranda", action: () => { document.getElementById('container').scrollTop = 0; } },
    { title: "Film Populer", action: () => filterByTag("Populer") },
    { title: "Genre Aksi", action: () => filterByTag("Aksi") },
    { title: "TV Live", action: () => console.log("TV Live Clicked") },
    { title: "Pengaturan", action: () => console.log("Pengaturan Clicked") }
];

// FUNGSI PENGACAKAN
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// FUNGSI OBSERVASI (LAZY LOADING)
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

// Fungsi untuk membuat elemen film
function createFilmElement(item, clickAction, isCollection = false) {
    const img = document.createElement('img');
    img.id = 'imgv';
    img.setAttribute('data-src', item.logo); 
    img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="170" viewBox="0 0 300 170"%3E%3Crect width="100%25" height="100%25" fill="%231a1a1a"%3E%3C/rect%3E%3C/svg%3E';
    img.classList.add('lazy-img');

    const pp = document.createElement('p');
    pp.className = 're';
    pp.innerText = item.ttl;

    const dur = document.createElement('p');
    dur.className = 'dur';
    dur.innerText = isCollection ? 'KOLEKSI' : (item.dur || '');

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

// --- FUNGSI BARU: INISIALISASI SIDEBAR ---
const initSidebar = () => {
    const menuList = document.getElementById('menu-list');
    menuList.innerHTML = '';
    
    menuItemsConfig.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'menu-item';
        li.textContent = item.title;
        li.tabIndex = 0; 
        li.setAttribute('data-index', index);
        
        li.addEventListener('click', item.action);
        
        menuList.appendChild(li);
    });
}

// FUNGSI CONTOH FILTER (Placeholder)
function filterByTag(tag) {
    console.log(`Filtering by: ${tag}`);
    // Di sini Anda bisa menyembunyikan/menampilkan item di grid berdasarkan tag
    // atau me-load JSON baru yang sesuai.
    document.getElementById('container').scrollTop = 0;
}
// --- END FUNGSI SIDEBAR ---

// FUNGSI PENGACAKAN, PENGAMBILAN DATA, DLL.
function shuffleAndSaveItems() {
    shuffleArray(allItems);
    try {
        sessionStorage.setItem('savedItemList', JSON.stringify(allItems));
    } catch (e) {
        console.error("Gagal menyimpan item list ke sessionStorage.", e);
    }
}

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


// FUNGSI UTAMA UNTUK MEMERIKSA DATA DAN MENAMPILKAN
function checkAndRenderItems() {
    if (filesProcessedCount < totalFiles) {
        return; 
    }
    
    initSidebar(); // Panggil inisialisasi Sidebar
    
    const savedItems = sessionStorage.getItem('savedItemList');

    if (savedItems) {
        try {
            allItems = JSON.parse(savedItems); 
        } catch (e) {
            shuffleAndSaveItems();
        }
    } else {
        shuffleAndSaveItems();
    }
    
    container.innerHTML = '';

    allItems.forEach(item => {
        let action;
        let isCollection = false;

        if (item.type === 'collection') {
            action = () => openCollection(item.url, item.ttl);
            isCollection = true;
        } else { // type === 'direct'
            action = () => playVideo(item.lnk, item.logo, item.ttl, item.crop_mode, item.crop_position, item.crop_scale);
            isCollection = false;
        }

        createFilmElement(item, action, isCollection);
    });

    restoreFocusAndScroll();
}

// FUNGSI UNTUK MEMULIHKAN FOKUS DAN SCROLL
const restoreFocusAndScroll = () => {
    const savedTitle = sessionStorage.getItem('lastVideoTitle');
    const savedScrollPosition = sessionStorage.getItem('mainScrollPosition');
    const savedFocusMode = sessionStorage.getItem('lastFocusMode');
    
    const divs = container ? Array.from(container.querySelectorAll('.responsive-div')) : [];
    const menuItems = document.querySelectorAll('.menu-item');
    const searchInput = document.getElementById('cari');
    
    // Hapus semua highlight
    [...divs, ...menuItems].forEach(el => el.classList.remove('highlight'));
    searchInput.classList.remove('highlight');
    
    let targetElement = null;

    if (savedFocusMode === 'grid' && savedTitle) {
        // Pulihkan fokus ke Grid
        divs.forEach(div => {
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === savedTitle) {
                targetElement = div;
            }
        });
        
        if (targetElement) {
            targetElement.classList.add('highlight');
            targetElement.focus();
            container.scrollTop = parseInt(savedScrollPosition, 10);
        } else {
             // Fallback ke menu jika item grid hilang
             menuItems[0]?.focus();
             menuItems[0]?.classList.add('highlight');
        }
    } else if (savedFocusMode === 'search') {
        // Pulihkan fokus ke Search
        searchInput.focus();
        searchInput.classList.add('highlight');
    } else {
        // Default: Fokus ke Menu
        const firstMenuItem = menuItems[0];
        if (firstMenuItem) {
            firstMenuItem.focus();
            firstMenuItem.classList.add('highlight');
        }
    }
    
    sessionStorage.removeItem('lastCollectionVideoTitle');
    sessionStorage.removeItem('collectionScrollPosition');
};


// FUNGSI UNTUK MENYIMPAN SCROLL POSITION
const saveScrollPosition = (focusMode) => {
    sessionStorage.setItem('lastFocusMode', focusMode);
    
    const container = document.getElementById('container');
    if (focusMode === 'grid' && container) {
        sessionStorage.setItem('mainScrollPosition', container.scrollTop);
        
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.classList.contains('responsive-div')) {
            const title = focusedElement.querySelector('.re')?.innerText;
            if (title) {
                sessionStorage.setItem('lastVideoTitle', title);
            }
        } else {
             sessionStorage.removeItem('lastVideoTitle');
        }
    } else if (focusMode !== 'grid') {
        sessionStorage.removeItem('mainScrollPosition');
        sessionStorage.removeItem('lastVideoTitle');
    }
};


// FUNGSI PLAY VIDEO dan OPEN COLLECTION (tetap sama)
function playVideo(link, poster, title, cropMode = 'fill', cropPosition = '50% 50%', cropScale = 1.0) {
    sessionStorage.setItem('videoLink', link);
    sessionStorage.setItem('videoTitle', title);
    sessionStorage.setItem('logoFile', poster);
    sessionStorage.setItem('videoCropMode', cropMode);
    sessionStorage.setItem('videoCropPosition', cropPosition);
    sessionStorage.setItem('videoCropScale', cropScale.toString());
    saveScrollPosition('grid');
    window.location.href = 'ply.html';
}

function openCollection(jsonUrl, title) {
    sessionStorage.setItem('collectionJsonUrl', jsonUrl);
    sessionStorage.setItem('collectionTitle', title);
    saveScrollPosition('grid'); 
    sessionStorage.removeItem('lastCollectionVideoTitle');
    sessionStorage.removeItem('collectionScrollPosition');
    window.location.href = 'koleksi.html';
}


// --- MODIFIKASI FUNGSI PENCARIAN ---
function prosesMenu() {
    const filter = document.getElementById("cari").value.toUpperCase();
    const container = document.getElementById('container');
    const divs = container ? container.querySelectorAll('.responsive-div') : [];

    imageObserver.disconnect();
    
    divs.forEach(div => {
        const titleElement = div.querySelector('.re');
        const title = titleElement ? titleElement.innerText : '';
        
        div.classList.remove('highlight'); 

        if (title.toUpperCase().indexOf(filter) > -1) {
            div.style.display = "inline-block";
            imageObserver.observe(div);
        } else {
            div.style.display = "none";
        }
    });

    const searchInput = document.getElementById("cari");
    searchInput.classList.add('highlight');
    saveScrollPosition('search');
}

document.getElementById("cari").addEventListener("input", prosesMenu);
// --- MODIFIKASI FUNGSI PENCARIAN END ---


// --- START FUNGSI NAVIGASI KEYBOARD/REMOTE BARU (LENGKAP DENGAN SIDEBAR) ---
document.addEventListener('keydown', (e) => {
    const container = document.getElementById('container');
    const divs = container ? Array.from(container.querySelectorAll('.responsive-div')).filter(d => d.style.display !== "none") : [];
    const searchInput = document.getElementById('cari');
    const menuItems = Array.from(document.querySelectorAll('.menu-item'));
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault(); 
        
        const focusedElement = document.activeElement;

        // --- HILANGKAN HIGHLIGHT SEBELUM PINDAH ---
        if (focusedElement.classList.contains('responsive-div')) {
            focusedElement.classList.remove('highlight');
        } else if (focusedElement.classList.contains('menu-item')) {
            focusedElement.classList.remove('highlight');
        } else if (focusedElement === searchInput) {
            searchInput.classList.remove('highlight');
        }
        // --- END HILANGKAN HIGHLIGHT ---

        
        // =========================================================
        // A. NAVIGASI DI SIDEBAR (MENU & SEARCH)
        // =========================================================
        if (menuItems.includes(focusedElement) || focusedElement === searchInput) {
            const currentMenuIndex = focusedElement === searchInput ? -1 : menuItems.indexOf(focusedElement);
            let nextElement = null;

            switch (e.key) {
                case 'ArrowDown':
                    if (focusedElement === searchInput) {
                        nextElement = menuItems[0];
                    } else if (currentMenuIndex < menuItems.length - 1) {
                        nextElement = menuItems[currentMenuIndex + 1];
                    }
                    break;
                case 'ArrowUp':
                    if (currentMenuIndex > 0) {
                        nextElement = menuItems[currentMenuIndex - 1];
                    } else if (currentMenuIndex === 0) {
                        nextElement = searchInput;
                    }
                    break;
                case 'ArrowRight':
                    if (divs.length > 0) {
                        nextElement = divs[0]; // Pindah ke item pertama di grid
                    }
                    break;
                case 'Enter':
                    focusedElement.click();
                    return;
            }

            if (nextElement) {
                nextElement.classList.add('highlight');
                nextElement.focus();
                
                if (nextElement === searchInput) {
                    saveScrollPosition('search');
                } else if (nextElement.classList.contains('responsive-div')) {
                    saveScrollPosition('grid');
                    nextElement.scrollIntoView({ behavior: 'instant', block: 'start' });
                } else {
                    saveScrollPosition('menu');
                    nextElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                return;
            }
        } 
        
        // =========================================================
        // B. NAVIGASI DI GRID UTAMA
        // =========================================================
        else if (divs.includes(focusedElement)) {
            const currentIndex = divs.indexOf(focusedElement);
            let itemsPerRow = 1;
            const divElement = divs[0];
            if (divElement) {
                const containerWidth = container.clientWidth;
                const itemWidth = divElement.offsetWidth;
                const itemMargin = parseFloat(window.getComputedStyle(divElement).marginLeft);
                const cardTotalWidth = itemWidth + (itemMargin * 2);
                itemsPerRow = Math.floor(containerWidth / cardTotalWidth);
            }
            const actualItemsPerRow = Math.max(1, itemsPerRow);

            let nextIndex = -1; 
            let nextElement = null;

            switch (e.key) {
                case 'ArrowDown':
                    nextIndex = Math.min(currentIndex + actualItemsPerRow, divs.length - 1);
                    break;
                case 'ArrowUp':
                    nextIndex = currentIndex - actualItemsPerRow;
                    nextIndex = Math.max(nextIndex, 0); 
                    break;
                case 'ArrowRight':
                    nextIndex = Math.min(currentIndex + 1, divs.length - 1);
                    break;
                case 'ArrowLeft':
                    // Pindah ke sidebar jika berada di kolom paling kiri
                    if (currentIndex % actualItemsPerRow === 0) {
                        const targetMenu = menuItems[0]; // Default ke menu pertama
                        if (targetMenu) {
                            targetMenu.classList.add('highlight');
                            targetMenu.focus();
                            saveScrollPosition('menu');
                        }
                        return;
                    } else {
                        nextIndex = Math.max(currentIndex - 1, 0);
                    }
                    break;
                case 'Enter':
                    focusedElement.click();
                    return; 
            }

            if (nextIndex !== -1 && divs[nextIndex]) {
                nextElement = divs[nextIndex];
            }
            
            if (nextElement) {
                nextElement.classList.add('highlight');
                nextElement.focus();
                nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                saveScrollPosition('grid');
            }
        }
    } else if (e.key === 'Escape') {
        window.history.back();
    }
});
// --- END FUNGSI NAVIGASI KEYBOARD/REMOTE BARU ---