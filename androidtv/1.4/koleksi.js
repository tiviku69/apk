// --- FUNGSI TEMA ---
function loadAndApplyTheme() {
    try {
        const savedTheme = localStorage.getItem('currentTheme') || 'default';
        const body = document.body;
        
        // Bersihkan tema lama
        body.classList.remove('theme-blue-dark', 'theme-red-dark');
        
        // Terapkan tema jika bukan default
        if (savedTheme !== 'default') {
            body.classList.add(`theme-${savedTheme}`);
        }
    } catch (e) {
        console.warn("Gagal memuat tema:", e);
    }
}

// Jalankan fungsi tema segera
loadAndApplyTheme();

// --- FUNGSI LAZY LOADING ---
const collectionImageObserver = new IntersectionObserver((entries, observer) => {
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
    root: document.getElementById('container-koleksi'),
    rootMargin: '100px 0px',
    threshold: 0.01
});

document.addEventListener('DOMContentLoaded', () => {
    const jsonUrl = sessionStorage.getItem('collectionJsonUrl');
    const collectionTitle = sessionStorage.getItem('collectionTitle');
    const container = document.getElementById('container-koleksi');
    const atas = document.getElementById('atas-koleksi');

    if (collectionTitle && atas) {
        const titleElement = document.createElement('h1');
        titleElement.textContent = `${collectionTitle}`;
        atas.appendChild(titleElement); 
    }

    if (!jsonUrl) {
        container.innerHTML = '<h1>URL Koleksi tidak ditemukan.</h1>';
        setTimeout(() => window.location.href = 'tiviku.html', 2000);
        return;
    }

    container.innerHTML = ''; 

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
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
                dur.innerText = item.dur;

                const dv = document.createElement('div');
                dv.className = 'responsive-div';
                dv.tabIndex = 0; 
                dv.onclick = () => playVideoInCollection(item.lnk, item.logo, item.ttl, item.crop_mode, item.crop_position, item.crop_scale);

                dv.appendChild(img);
                dv.appendChild(pp);
                dv.appendChild(dur);
                container.appendChild(dv);
                
                collectionImageObserver.observe(dv);
            });
            restoreFocusAndScrollKoleksi();
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<h1>Gagal memuat konten.</h1>';
        });
});

const restoreFocusAndScrollKoleksi = () => {
    const savedTitle = sessionStorage.getItem('lastCollectionVideoTitle');
    const container = document.getElementById('container-koleksi');
    let targetElement = null;

    if (savedTitle) {
        const allDivs = document.querySelectorAll('#container-koleksi .responsive-div');
        allDivs.forEach(div => {
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === savedTitle) targetElement = div;
        });
    }

    // Bersihkan highlight lama sebelum memberikan yang baru
    const allDivs = document.querySelectorAll('#container-koleksi .responsive-div');
    allDivs.forEach(div => div.classList.remove('highlight'));

    if (targetElement) {
        targetElement.classList.add('highlight');
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else {
        const firstDiv = document.querySelector('#container-koleksi .responsive-div');
        if (firstDiv) {
            firstDiv.classList.add('highlight');
            firstDiv.focus();
        }
    }
}

function playVideoInCollection(videoFile, logoFile, textFile, cropMode, cropPosition, cropScale) {
    const container = document.getElementById('container-koleksi');
    if (container) sessionStorage.setItem('collectionScrollPosition', container.scrollTop);
    sessionStorage.setItem('lastCollectionVideoTitle', textFile);
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    sessionStorage.setItem('videoCropMode', cropMode || 'fill'); 
    sessionStorage.setItem('videoCropPosition', cropPosition || '50% 50%'); 
    sessionStorage.setItem('videoCropScale', cropScale || ''); 
    window.location.href = 'ply.html';
}

// --- SISTEM NAVIGASI DIPERBAIKI ---
document.addEventListener('keydown', (e) => {
    const divs = Array.from(document.querySelectorAll('#container-koleksi .responsive-div'));
    const currentIndex = divs.findIndex(div => div === document.activeElement);
    const container = document.getElementById('container-koleksi');
    const itemsPerRow = Math.floor(container.offsetWidth / 300) || 1;

    let nextIndex = -1;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();

        if (currentIndex === -1) {
            nextIndex = 0;
        } else {
            if (e.key === 'ArrowDown') nextIndex = Math.min(currentIndex + itemsPerRow, divs.length - 1);
            else if (e.key === 'ArrowUp') nextIndex = Math.max(currentIndex - itemsPerRow, 0);
            else if (e.key === 'ArrowRight') nextIndex = Math.min(currentIndex + 1, divs.length - 1);
            else if (e.key === 'ArrowLeft') nextIndex = Math.max(currentIndex - 1, 0);
            else if (e.key === 'Enter') { 
                divs[currentIndex].click(); 
                return; 
            }
        }

        if (divs[nextIndex]) {
            // Hapus highlight dari semua elemen agar tidak ganda
            divs.forEach(div => div.classList.remove('highlight'));
            
            // Tambahkan highlight pada elemen baru
            divs[nextIndex].classList.add('highlight');
            divs[nextIndex].focus();
            divs[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (e.key === 'Escape') {
        window.location.href = 'tiviku.html';
    }
});
