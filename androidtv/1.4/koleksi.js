// --- FUNGSI TEMA ---
function loadAndApplyTheme() {
    try {
        const savedTheme = localStorage.getItem('currentTheme') || 'default';
        const body = document.body;
        
        body.classList.remove('theme-blue-dark', 'theme-red-dark');
        
        if (savedTheme !== 'default') {
            body.classList.add(`theme-${savedTheme}`);
        }
    } catch (e) {
        console.warn("Gagal memuat tema:", e);
    }
}

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
    const header = document.getElementById('atas-koleksi');

    if (collectionTitle) {
        header.innerHTML = `<h1 style="display:block; margin:0;">${collectionTitle}</h1>`;
    }

    if (!jsonUrl) {
        container.innerHTML = '<h1>Data tidak ditemukan.</h1>';
        return;
    }

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            container.innerHTML = ''; 
            data.forEach(item => {
                const dv = document.createElement('div');
                dv.className = 'responsive-div';
                dv.tabIndex = 0; 

                dv.innerHTML = `
                    <img class="lazy-img" data-src="${item.img}" src="placeholder.jpg" alt="${item.ttl}">
                    <div class="re">${item.ttl}</div>
                    <div class="dur">${item.dur || ''}</div>
                `;

                dv.onclick = () => playVideoInCollection(item.vid, item.ttl);
                
                container.appendChild(dv);
                collectionImageObserver.observe(dv);
            });

            // PERBAIKAN: Berikan sedikit jeda agar elemen benar-benar siap di DOM
            setTimeout(() => {
                restoreFocusAndScrollKoleksi();
            }, 100); 
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<h1>Gagal memuat konten.</h1>';
        });
});

function playVideoInCollection(url, title) {
    // Simpan judul terakhir yang diklik
    sessionStorage.setItem('lastCollectionVideoTitle', title);
    window.location.href = url;
}

function restoreFocusAndScrollKoleksi() {
    const lastTitle = sessionStorage.getItem('lastCollectionVideoTitle');
    if (!lastTitle) {
        // Jika tidak ada data terakhir, fokus ke elemen pertama
        const firstDiv = document.querySelector('.responsive-div');
        if (firstDiv) {
            firstDiv.classList.add('highlight');
            firstDiv.focus();
        }
        return;
    }

    const divs = document.querySelectorAll('.responsive-div');
    let targetElement = null;

    divs.forEach(div => {
        const titleEl = div.querySelector('.re');
        if (titleEl && titleEl.innerText === lastTitle) {
            targetElement = div;
        }
    });

    if (targetElement) {
        // Hapus highlight lama
        divs.forEach(d => d.classList.remove('highlight'));
        
        // Terapkan fokus dan highlight
        targetElement.classList.add('highlight');
        targetElement.focus();
        
        // PERBAIKAN: Gunakan 'nearest' agar elemen bawah tidak melompat ke awal
        targetElement.scrollIntoView({ behavior: 'instant', block: 'nearest' });
    }
}

// Navigasi Remote / Keyboard
document.addEventListener('keydown', (e) => {
    const divs = document.querySelectorAll('.responsive-div');
    const focusedElement = document.activeElement;
    const currentIndex = Array.from(divs).indexOf(focusedElement);
    const container = document.getElementById('container-koleksi');

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
        let nextIndex = -1;
        
        // Deteksi jumlah kolom secara dinamis
        const itemsPerRow = Math.floor(container.offsetWidth / 280) || 1; 

        if (currentIndex === -1) {
            nextIndex = 0;
        } else {
            if (e.key === 'ArrowDown') nextIndex = Math.min(currentIndex + itemsPerRow, divs.length - 1);
            else if (e.key === 'ArrowUp') nextIndex = Math.max(currentIndex - itemsPerRow, 0);
            else if (e.key === 'ArrowRight') nextIndex = Math.min(currentIndex + 1, divs.length - 1);
            else if (e.key === 'ArrowLeft') nextIndex = Math.max(currentIndex - 1, 0);
            else if (e.key === 'Enter') { focusedElement.click(); return; }
        }

        if (divs[nextIndex]) {
            divs.forEach(div => div.classList.remove('highlight'));
            divs[nextIndex].classList.add('highlight');
            divs[nextIndex].focus();
            
            // Menggunakan 'nearest' agar scroll lebih stabil untuk baris bawah
            divs[nextIndex].scrollIntoView({ behavior: 'instant', block: 'nearest' });
        }
    }
});
