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
                img.src = item.logo;

                const pp = document.createElement('p');
                pp.className = 're';
                pp.innerText = item.ttl;

                const dur = document.createElement('p');
                dur.className = 'dur';
                dur.innerText = item.dur;

                const dv = document.createElement('div');
                dv.className = 'responsive-div';
                dv.tabIndex = 0; 
                dv.onclick = () => playVideoInCollection(item.lnk, item.logo, item.ttl);

                dv.appendChild(img);
                dv.appendChild(pp);
                dv.appendChild(dur);
                container.appendChild(dv);
            });
            
            if (data.length === 0) {
                 container.innerHTML = '<h1>Tidak ada konten dalam koleksi ini.</h1>';
            }

            restoreFocusAndScrollKoleksi();

        })
        .catch(error => {
            console.error('Error loading collection JSON:', error);
            container.innerHTML = '<h1>Gagal memuat konten koleksi.</h1>';
            restoreFocusAndScrollKoleksi();
        });
});

// FUNGSI UNTUK MEMULIHKAN FOKUS DAN SCROLL di koleksi.html
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

// FUNGSI UNTUK MEMUTAR VIDEO DAN MENYIMPAN SCROLL di koleksi.html
function playVideoInCollection(videoFile, logoFile, textFile) {
    const container = document.getElementById('container-koleksi');
    if (container) {
        sessionStorage.setItem('collectionScrollPosition', container.scrollTop);
    }
    sessionStorage.setItem('lastCollectionVideoTitle', textFile);

    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}