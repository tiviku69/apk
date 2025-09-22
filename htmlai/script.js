document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const cards = document.querySelectorAll('.card');
    let activeElement = document.querySelector('.nav-item.active');

    function setActive(element) {
        // Hapus kelas 'active' dari elemen sebelumnya
        document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        // Tambahkan kelas 'active' ke elemen yang baru
        element.classList.add('active');
        activeElement = element;
        // Scroll ke elemen yang aktif jika diperlukan
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    // Fungsi untuk mengelola navigasi
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        let nextElement = null;

        if (activeElement.classList.contains('nav-item')) {
            // Navigasi di sidebar
            const currentIndex = Array.from(navItems).indexOf(activeElement);
            if (key === 'ArrowDown' && currentIndex < navItems.length - 1) {
                nextElement = navItems[currentIndex + 1];
            } else if (key === 'ArrowUp' && currentIndex > 0) {
                nextElement = navItems[currentIndex - 1];
            } else if (key === 'ArrowRight') {
                // Pindah ke konten utama
                nextElement = cards[0];
            }
        } else if (activeElement.classList.contains('card')) {
            // Navigasi di konten utama (kartu/video)
            const parentRow = activeElement.closest('.row');
            const rowCards = Array.from(parentRow.querySelectorAll('.card'));
            const currentIndex = rowCards.indexOf(activeElement);

            if (key === 'ArrowRight' && currentIndex < rowCards.length - 1) {
                nextElement = rowCards[currentIndex + 1];
            } else if (key === 'ArrowLeft' && currentIndex > 0) {
                nextElement = rowCards[currentIndex - 1];
            } else if (key === 'ArrowLeft' && currentIndex === 0) {
                // Pindah kembali ke sidebar
                nextElement = navItems[0];
            } else if (key === 'ArrowDown') {
                // Pindah ke baris konten berikutnya
                const nextRow = parentRow.nextElementSibling;
                if (nextRow) {
                    nextElement = nextRow.querySelector('.card');
                }
            } else if (key === 'ArrowUp') {
                // Pindah ke baris konten sebelumnya
                const prevRow = parentRow.previousElementSibling;
                if (prevRow) {
                    const prevRowCards = prevRow.querySelectorAll('.card');
                    nextElement = prevRowCards[0];
                }
            }
        }

        // Jika elemen baru ditemukan, set sebagai aktif
        if (nextElement) {
            setActive(nextElement);
            e.preventDefault(); // Mencegah aksi default browser
        }

        // Aksi saat tombol "Enter" ditekan
        if (key === 'Enter') {
            if (activeElement.classList.contains('card')) {
                const videoId = activeElement.dataset.id;
                console.log(`Memutar video dengan ID: ${videoId}`);
                // Di sini kamu bisa tambahin logika untuk memutar video
                // Misalnya: window.location.href = `play.html?id=${videoId}`;
            } else if (activeElement.classList.contains('nav-item')) {
                const targetId = activeElement.dataset.target;
                console.log(`Membuka halaman: ${targetId}`);
                // Di sini kamu bisa tambahin logika untuk pindah halaman
                // Misalnya: showPage(targetId);
            }
        }
    });

    // Menambahkan event listener untuk klik mouse sebagai fallback
    navItems.forEach(item => item.addEventListener('click', () => setActive(item)));
    cards.forEach(card => card.addEventListener('click', () => setActive(card)));
});