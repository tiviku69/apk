const atas = document.getElementById('atas');
atas.innerHTML = ''; 

const APP_VERSION = 'v1.2.0'; 

// Konfigurasi URL
const directFiles = [
    'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/cmpr.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/mp4.json'
];
const collectionListUrl = 'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/koleksi.json';
const liveTVUrl = 'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/tvlive.json';

const container = document.getElementById('container');
const pengaturanMenu = document.getElementById('pengaturan-menu'); 
let currentItems = []; 
let saveTimeout; // Untuk debouncing simpan posisi

// --- FUNGSI TEMA ---
function applyTheme(themeName) {
    const body = document.body;
    body.classList.remove('theme-blue-dark', 'theme-red-dark');
    if (themeName !== 'default') {
        body.classList.add(`theme-${themeName}`);
    }
    localStorage.setItem('currentTheme', themeName);
}

function loadSavedTheme() {
    const saved = localStorage.getItem('currentTheme') || 'default';
    applyTheme(saved);
}

// --- FUNGSI NAVIGASI OPTIMAL ---
document.addEventListener('keydown', (e) => {
    const focusedElement = document.activeElement;
    
    // 1. Navigasi Sidebar (Nav Item)
    if (focusedElement.classList.contains('nav-item')) {
        handleSidebarNavigation(e, focusedElement);
    } 
    // 2. Navigasi Grid Film (Responsive Div)
    else if (focusedElement.classList.contains('responsive-div')) {
        handleGridNavigation(e, focusedElement);
    }
    // 3. Navigasi Input Cari
    else if (focusedElement.id === 'cari') {
        handleSearchNavigation(e);
    }
    // 4. Navigasi Menu Pengaturan
    else if (focusedElement.classList.contains('theme-button')) {
        handleSettingsNavigation(e, focusedElement);
    }
});

function handleGridNavigation(e, focusedElement) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return;
    e.preventDefault();

    // Optimasi: Gunakan offsetParent (sangat cepat) daripada getComputedStyle
    const allDivs = Array.from(document.querySelectorAll('.responsive-div'))
                         .filter(div => div.offsetParent !== null);
    
    const currentIndex = allDivs.indexOf(focusedElement);
    const itemsPerRow = Math.floor(container.offsetWidth / 290) || 1;
    let nextIndex = -1;

    switch (e.key) {
        case 'ArrowRight': nextIndex = Math.min(currentIndex + 1, allDivs.length - 1); break;
        case 'ArrowLeft': 
            if (currentIndex % itemsPerRow === 0) {
                focusToActiveSidebar();
                return;
            }
            nextIndex = Math.max(currentIndex - 1, 0); 
            break;
        case 'ArrowDown': nextIndex = Math.min(currentIndex + itemsPerRow, allDivs.length - 1); break;
        case 'ArrowUp': 
            nextIndex = currentIndex - itemsPerRow;
            if (nextIndex < 0) {
                document.getElementById('cari').focus();
                return;
            }
            break;
        case 'Enter': focusedElement.click(); return;
    }

    if (nextIndex !== -1 && allDivs[nextIndex]) {
        allDivs.forEach(d => d.classList.remove('highlight'));
        const target = allDivs[nextIndex];
        target.classList.add('highlight');
        target.focus();
        target.scrollIntoView({ behavior: 'instant', block: 'center' });

        // OPTIMASI: Simpan data secara asynchronous agar navigasi tidak berat
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            sessionStorage.setItem('lastFocusedCardTitle', target.querySelector('.re')?.innerText || '');
            sessionStorage.setItem('scrollPosition', container.scrollTop);
        }, 150);
    }
}

function handleSidebarNavigation(e, focusedElement) {
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    const index = navItems.indexOf(focusedElement);

    if (e.key === 'ArrowDown') {
        if (index < navItems.length - 1) navItems[index + 1].focus();
    } else if (e.key === 'ArrowUp') {
        if (index > 0) navItems[index - 1].focus();
        else document.getElementById('cari').focus();
    } else if (e.key === 'ArrowRight') {
        restoreFocusOnContent();
    } else if (e.key === 'Enter') {
        focusedElement.click();
    }
}

function handleSearchNavigation(e) {
    if (e.key === 'ArrowDown') {
        document.querySelector('.nav-item').focus();
    } else if (e.key === 'ArrowRight') {
        restoreFocusOnContent();
    }
}

function handleSettingsNavigation(e, focusedElement) {
    const buttons = Array.from(document.querySelectorAll('.theme-button'));
    const index = buttons.indexOf(focusedElement);

    if (e.key === 'ArrowDown') {
        if (index < buttons.length - 1) buttons[index + 1].focus();
    } else if (e.key === 'ArrowUp') {
        if (index > 0) buttons[index - 1].focus();
    } else if (e.key === 'ArrowLeft') {
        focusToActiveSidebar();
    } else if (e.key === 'Enter') {
        focusedElement.click();
    }
}

function focusToActiveSidebar() {
    const activePage = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
    const nav = document.querySelector(`.nav-item[data-page="${activePage}"]`);
    if (nav) nav.focus();
}

function restoreFocusOnContent() {
    if (pengaturanMenu.style.display === 'block') {
        document.querySelector('.theme-button')?.focus();
    } else {
        const lastTitle = sessionStorage.getItem('lastFocusedCardTitle');
        const cards = Array.from(document.querySelectorAll('.responsive-div')).filter(d => d.offsetParent !== null);
        
        let target = cards[0];
        if (lastTitle) {
            const found = cards.find(c => c.querySelector('.re')?.innerText === lastTitle);
            if (found) target = found;
        }
        
        if (target) {
            target.focus();
            target.classList.add('highlight');
        }
    }
}

// --- LOGIKA RENDER & FETCH ---
async function fetchData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (err) {
        console.error("Gagal ambil data:", url);
        return [];
    }
}

function renderItems(items) {
    container.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'responsive-div focus-target';
        div.tabIndex = 0;
        
        // Cek apakah ini Koleksi atau Film Biasa
        const isCollection = !!item.jsonUrl;
        
        div.innerHTML = `
            <img class="lazy-img" data-src="${item.img}" src="placeholder.jpg">
            <div class="re">${item.re}</div>
            ${item.dur ? `<div class="dur">${item.dur}</div>` : ''}
        `;

        div.onclick = () => {
            if (isCollection) {
                sessionStorage.setItem('collectionJsonUrl', item.jsonUrl);
                sessionStorage.setItem('collectionTitle', item.re);
                window.location.href = 'koleksi.html';
            } else {
                window.location.href = item.link;
            }
        };
        container.appendChild(div);
    });
    
    // Jalankan Lazy Loading
    initLazyLoading();
}

function initLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('.lazy-img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { root: container, rootMargin: '200px' });

    document.querySelectorAll('.responsive-div').forEach(div => observer.observe(div));
}

// --- MANAJEMEN MENU ---
async function loadAndRenderHomeContent() {
    container.innerHTML = '<h2>Memuat Beranda...</h2>';
    const data = await Promise.all([
        ...directFiles.map(url => fetchData(url)),
        fetchData(collectionListUrl)
    ]);
    currentItems = data.flat();
    renderItems(currentItems);
}

async function loadAndRenderLiveTVContent() {
    container.innerHTML = '<h2>Memuat Live TV...</h2>';
    currentItems = await fetchData(liveTVUrl);
    renderItems(currentItems);
}

function showPengaturanMenu() {
    container.style.display = 'none';
    pengaturanMenu.style.display = 'block';
    document.getElementById('app-version-info').innerText = `Versi: ${APP_VERSION}`;
}

function initApp() {
    loadSavedTheme();
    
    // Event listener untuk tombol sidebar
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.addEventListener('click', () => {
            const page = nav.dataset.page;
            sessionStorage.setItem('lastActiveMenuPage', page);
            
            // Reset tampilan
            container.style.display = 'grid';
            pengaturanMenu.style.display = 'none';
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            nav.classList.add('active');

            if (page === 'beranda') loadAndRenderHomeContent();
            else if (page === 'live') loadAndRenderLiveTVContent();
            else if (page === 'pengaturan') showPengaturanMenu();
        });
    });

    // Event listener tombol tema
    document.querySelectorAll('.theme-button').forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });

    // Jalankan halaman terakhir atau beranda
    const lastPage = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
    document.querySelector(`.nav-item[data-page="${lastPage}"]`)?.click();
}

window.prosesMenu = function() {
    const keyword = document.getElementById('cari').value.toLowerCase();
    const filtered = currentItems.filter(item => item.re.toLowerCase().includes(keyword));
    renderItems(filtered);
};

// Start
initApp();
