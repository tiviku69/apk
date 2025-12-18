var atas = document.getElementById('atas');
atas.innerHTML = ''; 

var APP_VERSION = 'v1.2.0'; 

var directFiles = [
    'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/cmpr.json',
    'tes.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/mp4.json'
];

var collectionListUrl = 'koleksi.json';
var liveTVUrl = 'https://raw.githubusercontent.com/tiviku69/apk/main/androidtv/1.2/json/tvlive.json';

var totalFiles = directFiles.length + 1; 
var filesProcessedCount = 0; 
var container = document.getElementById('container');
var pengaturanMenu = document.getElementById('pengaturan-menu'); 

var allItems = []; 
var currentItems = []; 

function setLocalStorage(name, value) {
    try {
        localStorage.setItem(name, value);
    } catch (e) {
        console.error("Gagal menyimpan ke LocalStorage:", e);
    }
}

function getLocalStorage(name) {
    try {
        return localStorage.getItem(name);
    } catch (e) {
        console.warn("Gagal membaca dari LocalStorage:", e);
        return null;
    }
}

function applyTheme(themeName) {
    var appWrapper = document.getElementById('app-wrapper');
    var body = document.body;
    
    body.classList.remove('theme-blue-dark', 'theme-red-dark');
    appWrapper.classList.remove('theme-blue-dark', 'theme-red-dark'); 

    if (themeName !== 'default') {
        var themeClass = 'theme-' + themeName;
        body.classList.add(themeClass);
        appWrapper.classList.add(themeClass);
    }
    
    try {
        setLocalStorage('currentTheme', themeName);
    } catch (e) {
        console.error("Gagal menyimpan tema:", e);
    }
}

function setupThemeButtons() {
    var themeButtons = document.querySelectorAll('.theme-button');
    for (var i = 0; i < themeButtons.length; i++) {
        (function(button) {
            button.onclick = function() {
                var theme = button.getAttribute('data-theme');
                applyTheme(theme);
                button.focus(); 
            };
        })(themeButtons[i]);
    }
}

function loadInitialTheme() {
    var savedTheme = getLocalStorage('currentTheme') || 'default';
    applyTheme(savedTheme);
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// Fallback untuk IntersectionObserver (KitKat tidak support)
var imageObserver;
if (window.IntersectionObserver) {
    imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var img = entry.target.querySelector('.lazy-img'); 
                if (img) {
                    var src = img.getAttribute('data-src');
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
}

function createFilmElement(item, clickAction, isCollection) {
    var img = document.createElement('img');
    img.id = 'imgv';
    img.setAttribute('data-src', item.logo); 
    img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="270" height="220" viewBox="0 0 270 220"%3E%3Crect width="100%25" height="100%25" fill="%231a1a1a"%3E%3C/rect%3E%3C/svg%3E'; 
    img.classList.add('lazy-img'); 

    var pp = document.createElement('p');
    pp.className = 're';
    pp.innerText = item.ttl;

    var dur = document.createElement('p');
    dur.className = 'dur';
    dur.innerText = isCollection ? 'Koleksi (klik)' : (item.dur || '');

    var dv = document.createElement('div');
    dv.className = 'responsive-div';
    dv.tabIndex = 0; 
    dv.onclick = clickAction;

    dv.appendChild(img);
    dv.appendChild(pp);
    dv.appendChild(dur);
    container.appendChild(dv);
    
    // Jika observer ada gunakan observer, jika tidak langsung load (KitKat)
    if (imageObserver) {
        imageObserver.observe(dv);
    } else {
        img.src = item.logo;
    }

    return dv; 
}

function shuffleAndSaveItems() {
    shuffleArray(allItems);
    try {
        sessionStorage.setItem('savedItemList', JSON.stringify(allItems));
    } catch (e) {
        console.error("Gagal simpan sessionStorage:", e);
    }
}

function shuffleAndSaveLiveTVItems(items) {
    shuffleArray(items);
    try {
        sessionStorage.setItem('savedLiveTVList', JSON.stringify(items));
    } catch (e) {
        console.error("Gagal simpan sessionStorage LiveTV:", e);
    }
}

function loadAndRenderHomeContent() {
    container.style.display = 'block';
    pengaturanMenu.style.display = 'none';
    
    if (filesProcessedCount === 0) {
        container.innerHTML = '<h2>Memuat Konten Beranda...</h2>';
        allItems = []; 
        
        directFiles.forEach(function(fileUrl) {
            fetch(fileUrl)
                .then(function(response) { return response.json(); })
                .then(function(data) {
                    data.forEach(function(item) {
                        item.type = 'direct';
                        allItems.push(item); 
                    });
                    filesProcessedCount++;
                    checkAndRenderItems();
                })
                .catch(function(error) {
                    filesProcessedCount++;
                    checkAndRenderItems();
                });
        });

        fetch(collectionListUrl)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                data.forEach(function(collectionItem) {
                    allItems.push({
                        logo: collectionItem.collectionLogo,
                        ttl: collectionItem.collectionTitle,
                        url: collectionItem.url,
                        type: 'collection'
                    });
                });
                filesProcessedCount++;
                checkAndRenderItems();
            })
            .catch(function(error) {
                filesProcessedCount++;
                checkAndRenderItems();
            });
    } else {
        checkAndRenderItems();
    }
}

function loadAndRenderLiveTVContent() {
    container.style.display = 'block';
    pengaturanMenu.style.display = 'none';
    
    var savedLiveTVList = sessionStorage.getItem('savedLiveTVList');

    if (savedLiveTVList) {
        try {
            currentItems = JSON.parse(savedLiveTVList);
            currentItems = currentItems.map(function(item) { 
                item.type = 'live'; 
                return item; 
            }); 
            container.innerHTML = '<h2>Memuat Channel Live TV...</h2>';
            renderCurrentItems();
            return; 
        } catch (e) {
            sessionStorage.removeItem('savedLiveTVList'); 
        }
    }

    container.innerHTML = '<h2>Memuat Channel Live TV...</h2>';
    fetch(liveTVUrl)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            var liveItems = data.map(function(item) {
                item.type = 'live';
                return item;
            });
            shuffleAndSaveLiveTVItems(liveItems);
            currentItems = liveItems;
            renderCurrentItems(); 
        })
        .catch(function(error) {
            container.innerHTML = '<h2>❌ Gagal memuat Live TV</h2>';
        });
}

function showPengaturanMenu() {
    container.style.display = 'none';
    pengaturanMenu.style.display = 'flex'; 
    var versionInfo = document.getElementById('app-version-info');
    if (versionInfo) {
        versionInfo.innerHTML = 'Versi Aplikasi: <b>' + APP_VERSION + '</b>';
    }
    sessionStorage.removeItem('lastFocusedCardTitle');
    var firstThemeButton = document.querySelector('.theme-button');
    if (firstThemeButton) firstThemeButton.focus();
}

function renderCurrentItems() {
    container.innerHTML = ''; 
    currentItems.forEach(function(item) {
        var action;
        var isCollection = false;
        if (item.type === 'collection') {
            action = function() { openCollection(item.url, item.ttl); };
            isCollection = true;
        } else {
            action = function() {
                sessionStorage.setItem('lastActiveMenuPage', item.type === 'live' ? 'live' : 'beranda');
                playVideo(item.lnk, item.logo, item.ttl, item.crop_mode, item.crop_position, item.crop_scale);
            };
        }
        createFilmElement(item, action, isCollection);
    });
    restoreFocusOnContent(); 
}

function checkAndRenderItems() {
    if (filesProcessedCount < totalFiles) return; 
    var savedItems = sessionStorage.getItem('savedItemList');
    if (savedItems) {
        try { allItems = JSON.parse(savedItems); } catch (e) { shuffleAndSaveItems(); }
    } else {
        shuffleAndSaveItems();
    }
    currentItems = allItems;
    renderCurrentItems(); 
}

var restoreFocusOnContent = function() {
    var savedTitle = sessionStorage.getItem('lastVideoTitle'); 
    var lastFocusedTitle = sessionStorage.getItem('lastFocusedCardTitle'); 
    var activePage = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
    var focusRestoredToCard = false; 
    var targetElement = null;

    var allDivs = document.querySelectorAll('.responsive-div');
    allDivs.forEach(function(div) { div.classList.remove('highlight'); });
    
    if (savedTitle || lastFocusedTitle) {
        var queryTitle = savedTitle || lastFocusedTitle;
        for (var i = 0; i < allDivs.length; i++) {
            var p = allDivs[i].querySelector('.re');
            if (p && p.innerText === queryTitle) {
                targetElement = allDivs[i];
                break;
            }
        }
    }

    if (targetElement) {
        targetElement.classList.add('highlight');
        targetElement.focus();
        targetElement.scrollIntoView(false);
        focusRestoredToCard = true; 
        if(savedTitle) sessionStorage.removeItem('lastVideoTitle');
    } 
    
    if (!focusRestoredToCard && activePage === 'pengaturan') {
        showPengaturanMenu();
        focusRestoredToCard = true;
    }
    
    if (!focusRestoredToCard) {
        var activeNav = document.querySelector('.nav-item[data-page="' + activePage + '"]');
        if (activeNav) activeNav.focus();
    }
};

function isElementInView(el, container) {
    var elRect = el.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();
    return (elRect.top >= containerRect.top && elRect.bottom <= containerRect.bottom + elRect.height);
}

function getFirstVisibleElement(container) {
    var allDivs = document.querySelectorAll('.responsive-div');
    for (var i = 0; i < allDivs.length; i++) {
        if (getComputedStyle(allDivs[i]).display !== 'none' && isElementInView(allDivs[i], container)) {
            return allDivs[i];
        }
    }
    return document.querySelector('.responsive-div:not([style*="display: none"])');
}

function openCollection(jsonUrl, collectionTitle) {
    sessionStorage.setItem('lastVideoTitle', collectionTitle); 
    sessionStorage.setItem('collectionJsonUrl', jsonUrl); 
    sessionStorage.setItem('collectionTitle', collectionTitle); 
    window.location.href = 'koleksi.html';
}

function playVideo(v, l, t, cm, cp, cs) { 
    sessionStorage.setItem('lastVideoTitle', t);
    sessionStorage.setItem('videoLink', v);
    sessionStorage.setItem('videoTitle', t);
    sessionStorage.setItem('logoFile', l);
    sessionStorage.setItem('videoCropMode', cm || 'fill'); 
    sessionStorage.setItem('videoCropPosition', cp || '50% 50%'); 
    sessionStorage.setItem('videoCropScale', cs || ''); 
    window.location.href = 'ply.html';
}

function prosesMenu() {
    var filter = document.getElementById("cari").value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');
    for (var i = 0; i < li.length; i++) {
        var txt = li[i].querySelector('.re').innerText.toLowerCase(); 
        if (txt.indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

document.getElementById("cari").addEventListener("input", prosesMenu);

var saveScrollPosition = function() {
    var activePage = sessionStorage.getItem('lastActiveMenuPage');
    if (container && (activePage === 'beranda' || activePage === 'live')) { 
        sessionStorage.setItem('scrollPosition', container.scrollTop);
    }
};

if (container) container.addEventListener('scroll', saveScrollPosition);

function updateClock() {
    var now = new Date();
    var h = String(now.getHours());
    var m = String(now.getMinutes());
    if(h.length < 2) h = '0' + h;
    if(m.length < 2) m = '0' + m;
    var clock = document.getElementById('digital-clock');
    if (clock) clock.innerText = h + ':' + m;
}
setInterval(updateClock, 1000); 

document.addEventListener('keydown', function(e) {
    var searchInput = document.getElementById('cari');
    var focused = document.activeElement;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Enter') {
        e.preventDefault(); 

        if (focused.classList.contains('theme-button')) {
            var btn = Array.prototype.slice.call(document.querySelectorAll('.theme-button'));
            var idx = btn.indexOf(focused);
            if (e.key === 'ArrowRight') btn[Math.min(idx+1, btn.length-1)].focus();
            else if (e.key === 'ArrowLeft') btn[Math.max(idx-1, 0)].focus();
            else if (e.key === 'ArrowUp') document.querySelector('.nav-item[data-page="pengaturan"]').focus();
            else if (e.key === 'Enter') focused.click();
            return;
        }

        if (focused.classList.contains('nav-item')) {
            var navs = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));
            var nIdx = navs.indexOf(focused);
            if (e.key === 'ArrowDown') navs[Math.min(nIdx+1, navs.length-1)].focus();
            else if (e.key === 'ArrowUp') {
                if(nIdx === 0) searchInput.focus();
                else navs[nIdx-1].focus();
            }
            else if (e.key === 'ArrowRight') {
                if (focused.getAttribute('data-page') === 'pengaturan') {
                    var fBtn = document.querySelector('.theme-button');
                    if (fBtn) fBtn.focus();
                } else {
                    var fDiv = getFirstVisibleElement(container);
                    if (fDiv) { fDiv.focus(); fDiv.classList.add('highlight'); }
                }
            } else if (e.key === 'Enter') {
                focused.click();
            }
            return;
        }

        if (focused === searchInput) {
            if (e.key === 'ArrowDown') document.querySelector('.nav-item').focus();
            return;
        }

        var divs = Array.prototype.slice.call(document.querySelectorAll('.responsive-div')).filter(function(d){
            return getComputedStyle(d).display !== 'none';
        });
        var cIdx = divs.indexOf(focused);
        if (cIdx === -1) return;

        focused.classList.remove('highlight');
        var rowItems = 3; // Estimasi untuk STB
        var next;

        if (e.key === 'ArrowDown') next = Math.min(cIdx + rowItems, divs.length - 1);
        else if (e.key === 'ArrowUp') {
            next = cIdx - rowItems;
            if (next < 0) { searchInput.focus(); return; }
        }
        else if (e.key === 'ArrowRight') next = Math.min(cIdx + 1, divs.length - 1);
        else if (e.key === 'ArrowLeft') {
            next = cIdx - 1;
            if (next < 0 || cIdx % rowItems === 0) {
                document.querySelector('.nav-item[data-page="' + (sessionStorage.getItem('lastActiveMenuPage') || 'beranda') + '"]').focus();
                return;
            }
        }
        else if (e.key === 'Enter') { focused.click(); return; }

        if (divs[next]) {
            divs[next].focus();
            divs[next].classList.add('highlight');
            divs[next].scrollIntoView(false);
            sessionStorage.setItem('lastFocusedCardTitle', divs[next].querySelector('.re').innerText);
        }
    }
});

function initNavigation() {
    loadInitialTheme();
    setupThemeButtons();
    var navs = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navs.length; i++) {
        navs[i].addEventListener('click', function() {
            var page = this.getAttribute('data-page');
            sessionStorage.setItem('lastActiveMenuPage', page);
            if (page === 'beranda') loadAndRenderHomeContent();
            else if (page === 'live') loadAndRenderLiveTVContent();
            else if (page === 'pengaturan') showPengaturanMenu();
        });
    }
    var last = sessionStorage.getItem('lastActiveMenuPage') || 'beranda';
    var initNav = document.querySelector('.nav-item[data-page="' + last + '"]') || document.querySelector('.nav-item');
    if (initNav) initNav.click();
}

initNavigation();
