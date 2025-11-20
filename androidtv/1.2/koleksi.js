// --- FUNGSI BARU UNTUK OBSERVASI (LAZY LOADING) ---
const collectionImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src; // Pindahkan URL dari data-src ke src
                img.removeAttribute('data-src');
                observer.unobserve(img); // Berhenti mengamati setelah dimuat
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
                
                // Mulai amati gambar
                collectionImageObserver.observe(img);
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
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (savedScrollPosition !== null && container) {
        container.scrollTop = parseInt(savedScrollPosition, 10);
    } else {
        const firstDiv = document.querySelector('#container-koleksi .responsive-div');
        if (firstDiv) {
             firstDiv.classList.add('highlight');
             firstDiv.focus();
        }
    }
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