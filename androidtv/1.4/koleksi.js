// tiviku.zip/koleksi.js

// --- FUNGSI BARU UNTUK OBSERVASI (LAZY LOADING) ---
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
// --- END FUNGSI OBSERVASI ---

// FUNGSI UNTUK MEMBUAT ELEMEN FILM
function createFilmElement(item, clickAction) {
    const img = document.createElement('img');
    img.id = 'imgv';
    img.setAttribute('data-src', item.logo); 
    // Placeholder SVG untuk loading cepat dan theme gelap
    img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="170" viewBox="0 0 300 170"%3E%3Crect width="100%25" height="100%25" fill="%231a1a1a"%3E%3C/rect%3E%3C/svg%3E';
    img.classList.add('lazy-img');

    const pp = document.createElement('p');
    pp.className = 're';
    pp.innerText = item.ttl;

    const dur = document.createElement('p');
    dur.className = 'dur';
    dur.innerText = item.dur || '';

    const dv = document.createElement('div');
    dv.className = 'responsive-div';
    dv.tabIndex = 0; 
    dv.onclick = clickAction;

    dv.appendChild(img);
    dv.appendChild(pp);
    dv.appendChild(dur);
    
    document.getElementById('container-koleksi').appendChild(dv);
    
    collectionImageObserver.observe(dv);

    return dv;
}


// FUNGSI UNTUK MENYIMPAN SCROLL POSITION KHUSUS KOLEKSI
const saveCollectionScrollPosition = () => {
    const container = document.getElementById('container-koleksi');
    if (container) {
        sessionStorage.setItem('collectionScrollPosition', container.scrollTop);
        
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.classList.contains('responsive-div')) {
            const title = focusedElement.querySelector('.re')?.innerText;
            if (title) {
                sessionStorage.setItem('lastCollectionVideoTitle', title);
            }
        } else {
             sessionStorage.removeItem('lastCollectionVideoTitle');
        }
    }
};

// FUNGSI UNTUK MEMULIHKAN FOKUS DAN SCROLL
const restoreFocusAndScrollKoleksi = () => {
    const savedTitle = sessionStorage.getItem('lastCollectionVideoTitle');
    const savedScrollPosition = sessionStorage.getItem('collectionScrollPosition');
    
    const container = document.getElementById('container-koleksi');
    const divs = container ? Array.from(container.querySelectorAll('.responsive-div')) : [];
    
    // Hapus semua highlight
    divs.forEach(el => el.classList.remove('highlight'));
    
    let targetElement = null;

    if (savedTitle) {
        // Pulihkan fokus
        divs.forEach(div => {
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === savedTitle) {
                targetElement = div;
            }
        });
        
        if (targetElement) {
            targetElement.classList.add('highlight');
            targetElement.focus();
            container.scrollTop = parseInt(savedScrollPosition, 10) || 0;
            return;
        }
    } 
    
    // Default: Fokus ke item pertama jika tidak ada fokus tersimpan
    if (divs[0]) {
        divs[0].classList.add('highlight');
        divs[0].focus();
    }
};

// FUNGSI PLAY VIDEO (Dipanggil saat klik di KOLEKSI)
function playVideoInCollection(link, poster, title, cropMode = 'fill', cropPosition = '50% 50%', cropScale = 1.0) {
    sessionStorage.setItem('videoLink', link);
    sessionStorage.setItem('videoTitle', title);
    sessionStorage.setItem('logoFile', poster);
    sessionStorage.setItem('videoCropMode', cropMode);
    sessionStorage.setItem('videoCropPosition', cropPosition);
    sessionStorage.setItem('videoCropScale', cropScale.toString());
    
    // Simpan posisi scroll koleksi sebelum pergi
    saveCollectionScrollPosition();

    // Hapus state halaman utama agar kembali ke koleksi
    sessionStorage.removeItem('lastVideoTitle');
    sessionStorage.removeItem('mainScrollPosition');

    window.location.href = 'ply.html';
}


document.addEventListener('DOMContentLoaded', () => {
    const jsonUrl = sessionStorage.getItem('collectionJsonUrl');
    const collectionTitle = sessionStorage.getItem('collectionTitle');
    const container = document.getElementById('container-koleksi');
    const atas = document.getElementById('atas-koleksi');

    if (collectionTitle && atas) {
        atas.innerHTML = `<h1>${collectionTitle}</h1>`;
    }
    
    // Kosongkan container dan tampilkan pesan loading sebelum fetch
    container.innerHTML = '<h1>Memuat Koleksi...</h1>';


    if (jsonUrl) {
        fetch(jsonUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                container.innerHTML = ''; 
                
                if (data.length === 0) {
                     container.innerHTML = '<h1>Tidak ada film dalam koleksi ini.</h1>';
                     return;
                }
                
                data.forEach(item => {
                    const action = () => playVideoInCollection(
                        item.lnk, 
                        item.logo, 
                        item.ttl, 
                        item.crop_mode, 
                        item.crop_position, 
                        item.crop_scale
                    );
                    createFilmElement(item, action);
                });
                
                restoreFocusAndScrollKoleksi();

            })
            .catch(error => {
                console.error('Error loading Collection JSON:', jsonUrl, error);
                container.innerHTML = `<h1>❌ Gagal memuat data koleksi: ${collectionTitle}</h1>`;
            });
    } else {
        container.innerHTML = '<h1>URL Koleksi tidak ditemukan.</h1>';
        console.error('collectionJsonUrl not found in sessionStorage.');
    }
});


// --- START FUNGSI NAVIGASI KEYBOARD/REMOTE BARU (LENGKAP) ---
document.addEventListener('keydown', (e) => {
    const container = document.getElementById('container-koleksi');
    // Ambil hanya div yang terlihat
    const divs = container ? Array.from(container.querySelectorAll('.responsive-div')).filter(d => d.style.display !== "none") : [];
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault(); 
        
        const focusedElement = document.activeElement;
        const currentIndex = divs.indexOf(focusedElement);

        if (!container || divs.length === 0) return;

        let itemsPerRow = 1;
        const divElement = divs[0];
        if (divElement) {
            // Hitung lebar area konten dikurangi padding
            const containerWidth = container.clientWidth - 80; 
            const itemWidth = divElement.offsetWidth;
            const style = window.getComputedStyle(divElement);
            // Hitung total lebar item (termasuk margin)
            const itemMargin = parseFloat(style.marginLeft) + parseFloat(style.marginRight); 
            const cardTotalWidth = itemWidth + itemMargin;
            itemsPerRow = Math.floor(containerWidth / cardTotalWidth);
        }
        
        const actualItemsPerRow = Math.max(1, itemsPerRow);

        let nextIndex = -1; 

        if (currentIndex === -1) {
            // Jika tidak ada yang fokus, fokuskan elemen pertama
            nextIndex = 0;
        } else {
            focusedElement.classList.remove('highlight');
            
            switch (e.key) {
                case 'ArrowDown':
                    nextIndex = Math.min(currentIndex + actualItemsPerRow, divs.length - 1);
                    break;
                case 'ArrowUp':
                    nextIndex = Math.max(currentIndex - actualItemsPerRow, 0);
                    break;
                case 'ArrowRight':
                    nextIndex = Math.min(currentIndex + 1, divs.length - 1);
                    break;
                case 'ArrowLeft':
                    nextIndex = Math.max(currentIndex - 1, 0);
                    break;
                case 'Enter':
                    focusedElement.click();
                    return; 
            }
        }

        if (nextIndex !== -1 && divs[nextIndex]) {
            divs[nextIndex].classList.add('highlight');
            divs[nextIndex].focus();
            
            // Menggunakan 'smooth' untuk pergeseran agar terlihat lebih baik
            divs[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            saveCollectionScrollPosition();
        }
    } else if (e.key === 'Escape') {
        // Kembali ke halaman utama
        window.location.href = 'tiviku.html';
    }
});
// --- END FUNGSI NAVIGASI KEYBOARD/REMOTE BARU ---