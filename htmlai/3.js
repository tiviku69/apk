document.addEventListener('DOMContentLoaded', () => {

    const rekomendasiRow = document.getElementById('rekomendasi-row');
    const untukAndaRow = document.getElementById('untuk-anda-row');
    
    // Fungsi untuk membuat kartu video
    const createVideoCard = (video) => {
        const card = document.createElement('div');
        card.classList.add('video-card', 'focusable');
        
        card.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail">
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-channel">${video.channel}</p>
                <p class="video-meta">${video.views} &bull; ${video.duration}</p>
            </div>
        `;
        return card;
    };

    // Fungsi untuk merender video ke dalam baris yang sesuai
    const renderVideos = (videos, container) => {
        container.innerHTML = '';
        videos.forEach(video => {
            const card = createVideoCard(video);
            container.appendChild(card);
        });
    };

    // Fungsi untuk mengambil data dari file JSON
    const fetchData = async () => {
        try {
            const response = await fetch('3.json');
            const data = await response.json();
            
            renderVideos(data.rekomendasi, rekomendasiRow);
            renderVideos(data.untukAnda, untukAndaRow);
            
            // Inisialisasi navigasi setelah konten dimuat
            setupNavigation();

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Bagian Navigasi Remote
    let focusableElements = [];
    let currentFocusIndex = 0;

    const setupNavigation = () => {
        // Gabungkan semua elemen yang dapat difokuskan
        focusableElements = Array.from(document.querySelectorAll('.focusable'));
        
        // Atur fokus awal pada elemen pertama
        if (focusableElements.length > 0) {
            focusableElements[currentFocusIndex].classList.add('focused');
        }
    };

    // Event listener untuk tombol panah
    document.addEventListener('keydown', (e) => {
        if (focusableElements.length === 0) return;

        let nextIndex = currentFocusIndex;
        const totalElements = focusableElements.length;
        const focusedElement = focusableElements[currentFocusIndex];
        const currentRow = focusedElement.dataset.row;

        // Mendapatkan elemen di baris yang sama untuk navigasi Kiri/Kanan
        const currentElementsInRow = focusableElements.filter(el => el.dataset.row === currentRow);
        const currentElementIndexInRow = currentElementsInRow.indexOf(focusedElement);
        
        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                // Navigasi Kanan dalam satu baris
                if (currentElementIndexInRow < currentElementsInRow.length - 1) {
                    const nextElement = currentElementsInRow[currentElementIndexInRow + 1];
                    nextIndex = focusableElements.indexOf(nextElement);
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                // Navigasi Kiri dalam satu baris
                if (currentElementIndexInRow > 0) {
                    const prevElement = currentElementsInRow[currentElementIndexInRow - 1];
                    nextIndex = focusableElements.indexOf(prevElement);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                // Navigasi ke bawah ke baris berikutnya
                const nextRow = parseInt(currentRow) + 1;
                const nextRowElements = focusableElements.filter(el => parseInt(el.dataset.row) === nextRow);
                if (nextRowElements.length > 0) {
                    const nextElement = nextRowElements[0]; // Pindah ke elemen pertama di baris bawah
                    nextIndex = focusableElements.indexOf(nextElement);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                // Navigasi ke atas ke baris sebelumnya
                const prevRow = parseInt(currentRow) - 1;
                const prevRowElements = focusableElements.filter(el => parseInt(el.dataset.row) === prevRow);
                if (prevRowElements.length > 0) {
                    const prevElement = prevRowElements[0]; // Pindah ke elemen pertama di baris atas
                    nextIndex = focusableElements.indexOf(prevElement);
                }
                break;
            case 'Enter':
                e.preventDefault();
                // Simulasi klik saat tombol Enter ditekan
                console.log('Clicked:', focusedElement);
                // Tambahkan logika untuk membuka video, dll.
                break;
        }

        if (nextIndex !== currentFocusIndex) {
            // Hapus fokus dari elemen saat ini
            focusableElements[currentFocusIndex].classList.remove('focused');
            // Tambahkan fokus ke elemen baru
            currentFocusIndex = nextIndex;
            focusableElements[currentFocusIndex].classList.add('focused');
            // Scroll ke elemen yang difokuskan (opsional)
            focusableElements[currentFocusIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Panggil fungsi utama saat halaman dimuat
    fetchData();
});