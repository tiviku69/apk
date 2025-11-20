// --- FUNGSI BARU UNTUK OBSERVASI (LAZY LOADING) ---
const collectionImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target.querySelector('.lazy-img'); // Cari img di dalam div
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
    root: document.getElementById('container-koleksi'), // Gunakan container-koleksi sebagai root
    rootMargin: '100px 0px', // Mulai memuat saat gambar 100px mendekati viewport
    threshold: 0.01
});
// --- END FUNGSI OBSERVASI ---

document.addEventListener('DOMContentLoaded', () => {
    const jsonUrl = sessionStorage.getItem('collectionJsonUrl');
    const collectionTitle = sessionStorage.getItem('collectionTitle');
    const container = document.getElementById('container-koleksi');
    const atas = document.getElementById('atas-koleksi');

    let filesLoaded = 0; 

    if (collectionTitle && atas) {
        const titleElement = document.createElement('h1');
        titleElement.textContent = `${collectionTitle}`;
        // MODIFIKASI: Judul langsung ditambahkan ke #atas-koleksi (center aligned)
        atas.appendChild(titleElement); 
    }

    if (!jsonUrl) {
        container.innerHTML = '<h1>URL Koleksi tidak ditemukan.</h1><p>Kembali ke halaman utama dalam 3 detik...</p>';
        setTimeout(() => window.location.href = 'tiviku.html', 3000);
        return;
    }

    container.innerHTML = ''; 

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                const img = document.createElement('img');
                img.id = 'imgv';
                
                // PERUBAHAN KRITIS: Gunakan data-src untuk Lazy Loading
                img.setAttribute('data-src', item.logo);
                img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="270" height="220" viewBox="0 0 270 220"%3E%3Crect width="100%25" height="100%25" fill="%231a1a1a"%3E%3C/rect%3E%3C/svg%3E'; // Placeholder abu-abu gelap
                img.classList.add('lazy-img'); // Tambahkan kelas untuk target observer

                const pp = document.createElement('p');
                pp.className = 're';
                pp.innerText = item.ttl;

                const dur = document.createElement('p');
                dur.className = 'dur';
                dur.innerText = item.dur;

                const dv = document.createElement('div');
                dv.className = 'responsive-div';
                dv.tabIndex = 0; 
                // MODIFIKASI: Tambahkan item.crop_mode, item.crop_position, DAN item.crop_scale ke pemanggilan
                dv.onclick = () => playVideoInCollection(item.lnk, item.logo, item.ttl, item.crop_mode, item.crop_position, item.crop_scale);

                dv.appendChild(img);
                dv.appendChild(pp);
                dv.appendChild(dur);
                container.appendChild(dv);
                
                // Mulai amati div, bukan hanya img
                collectionImageObserver.observe(dv);
            });
            
            if (data.length === 0) {
                 container.innerHTML = '<h1>Tidak ada konten dalam koleksi ini.</h1>';
            }

            // Panggil fungsi pemulihan setelah konten selesai dimuat
            restoreFocusAndScrollKoleksi();

        })
        .catch(error => {
            console.error('Error loading collection JSON:', error);
            container.innerHTML = '<h1>Gagal memuat konten koleksi.</h1>';
            restoreFocusAndScrollKoleksi();
        });
});

// FUNGSI UNTUK MEMULIHKAN FOKUS DAN SCROLL
const restoreFocusAndScrollKoleksi = () => {
    const savedTitle = sessionStorage.getItem('lastCollectionVideoTitle');
    const savedScrollPosition = sessionStorage.getItem('collectionScrollPosition');
    const container = document.getElementById('container-koleksi');
    
    let targetElement = null;

    if (savedTitle) {
        const allDivs = document.querySelectorAll('#container-koleksi .responsive-div');
        allDivs.forEach(div => {
            div.classList.remove('highlight'); 
            const pElement = div.querySelector('.re');
            if (pElement && pElement.innerText === savedTitle) {
                targetElement = div;
            }
        });
    }

    if (targetElement) {
        targetElement.classList.add('highlight');
        targetElement.focus();
        // Hanya scrollIntoView jika elemen fokus tidak terlihat
        if (!isElementInViewKoleksi(targetElement, container)) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (savedScrollPosition !== null && container) {
        container.scrollTop = parseInt(savedScrollPosition, 10);
        // Tetapkan fokus ke elemen pertama yang terlihat
        const firstVisible = getFirstVisibleElementKoleksi(container);
        if (firstVisible) {
             firstVisible.classList.add('highlight');
             firstVisible.focus();
        } else {
            const firstDiv = document.querySelector('#container-koleksi .responsive-div');
            if (firstDiv) {
                 firstDiv.classList.add('highlight');
                 firstDiv.focus();
            }
        }
    } else {
        const firstDiv = document.querySelector('#container-koleksi .responsive-div');
        if (firstDiv) {
             firstDiv.classList.add('highlight');
             firstDiv.focus();
        }
    }
}

// Helper: Cek apakah elemen terlihat di dalam container (untuk Koleksi)
function isElementInViewKoleksi(el, container) {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const elHeight = elRect.height; 
    
    return (
        elRect.top >= containerRect.top &&
        elRect.bottom <= containerRect.bottom + elHeight // Beri toleransi 1 tinggi elemen
    );
}

// Helper: Dapatkan elemen pertama yang terlihat (untuk Koleksi)
function getFirstVisibleElementKoleksi(container) {
    const allDivs = document.querySelectorAll('#container-koleksi .responsive-div');
    for (const div of allDivs) {
        if (isElementInViewKoleksi(div, container)) {
            return div;
        }
    }
    return null;
}

// MODIFIKASI: FUNGSI UNTUK MEMUTAR VIDEO DAN MENYIMPAN SCROLL
function playVideoInCollection(videoFile, logoFile, textFile, cropMode, cropPosition, cropScale) { // <--- TAMBAHKAN cropScale
    const container = document.getElementById('container-koleksi');
    if (container) {
        sessionStorage.setItem('collectionScrollPosition', container.scrollTop);
    }
    sessionStorage.setItem('lastCollectionVideoTitle', textFile);

    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    
    // BARU: Simpan mode dan posisi crop. Default adalah 'fill'.
    sessionStorage.setItem('videoCropMode', cropMode || 'fill'); 
    sessionStorage.setItem('videoCropPosition', cropPosition || '50% 50%'); 
    sessionStorage.setItem('videoCropScale', cropScale || ''); // <--- SIMPAN NILAI SKALA

    window.location.href = 'ply.html';
}

// --- MODIFIKASI UNTUK MENYIMPAN SCROLL SAAT BERGULIR ---

const saveCollectionScrollPosition = () => {
    const container = document.getElementById('container-koleksi');
    if (container) {
        // Simpan posisi scroll saat pengguna menggulir di halaman koleksi.html
        sessionStorage.setItem('collectionScrollPosition', container.scrollTop);
    }
};

const containerScrollElement = document.getElementById('container-koleksi');
if (containerScrollElement) {
    // Tambahkan event listener scroll ke elemen #container-koleksi
    containerScrollElement.addEventListener('scroll', saveCollectionScrollPosition);
}

// --- FUNGSI NAVIGASI KEYBOARD/REMOTE BARU (Halaman Koleksi) ---
document.addEventListener('keydown', (e) => {
    // Hanya tangani ArrowUp, ArrowDown, dan Enter
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault(); 
        const focusedElement = document.activeElement;
        const divs = Array.from(document.querySelectorAll('#container-koleksi .responsive-div'));
        const currentIndex = divs.findIndex(div => div === focusedElement);
        const container = document.getElementById('container-koleksi');

        if (divs.length === 0) return;

        let nextIndex = -1;
        const containerRect = container.getBoundingClientRect();
        
        // Dapatkan nilai lebar yang lebih akurat
        const divElement = divs[0];
        const cardWidth = divElement ? divElement.offsetWidth + (parseFloat(window.getComputedStyle(divElement).marginLeft) * 2) : 300; 
        
        // Hitung berapa card per baris
        const itemsPerRow = Math.floor(containerRect.width / cardWidth);
        const actualItemsPerRow = Math.max(1, itemsPerRow);

        if (currentIndex === -1) {
            // Jika tidak ada yang fokus, fokuskan elemen pertama
            nextIndex = 0;
        } else {
            // Hapus highlight dari elemen saat ini
            focusedElement.classList.remove('highlight');
            
            switch (e.key) {
                case 'ArrowDown':
                    nextIndex = Math.min(currentIndex + actualItemsPerRow, divs.length - 1);
                    break;
                case 'ArrowUp':
                    nextIndex = Math.max(currentIndex - actualItemsPerRow, 0);
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
            
            // Lakukan scrollIntoView agar elemen selalu berada di tengah
            divs[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Simpan posisi scroll setelah scrollIntoView
            saveCollectionScrollPosition();
        }
    } else if (e.key === 'Escape') {
        // Kembali ke halaman sebelumnya (ke tiviku.html)
        window.location.href = 'tiviku.html';
    }
    // Abaikan ArrowRight dan ArrowLeft
});
// --- END FUNGSI NAVIGASI KEYBOARD/REMOTE BARU ---