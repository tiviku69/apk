document.addEventListener('DOMContentLoaded', () => {
    const filmList = document.getElementById('film-list');
    let focusedIndex = 0;

    // Ambil data dari file JSON
    fetch('films.json')
        .then(response => response.json())
        .then(films => {
            if (films.length === 0) {
                filmList.innerHTML = '<p>Tidak ada film yang tersedia.</p>';
                return;
            }

            films.forEach((film, index) => {
                const filmItem = document.createElement('div');
                filmItem.classList.add('film-item');
                filmItem.setAttribute('tabindex', index);
                filmItem.innerHTML = `
                    <img src="${film.posterUrl}" alt="${film.title}">
                    <p>${film.title}</p>
                `;

                filmItem.addEventListener('click', () => playFilm(film.videoUrl));
                filmList.appendChild(filmItem);
            });

            // Fokuskan elemen pertama dan tambahkan event listener
            const items = document.querySelectorAll('.film-item');
            items[focusedIndex].classList.add('focused');
            items[focusedIndex].focus();

            document.addEventListener('keydown', (e) => {
                const totalItems = items.length;
                let newIndex = focusedIndex;

                if (e.key === 'ArrowRight' || e.key === 'MediaPlayPause') {
                    newIndex = (focusedIndex + 1) % totalItems;
                } else if (e.key === 'ArrowLeft') {
                    newIndex = (focusedIndex - 1 + totalItems) % totalItems;
                } else if (e.key === 'Enter') {
                    playFilm(films[focusedIndex].videoUrl);
                    e.preventDefault(); // Mencegah scrolling
                }

                if (newIndex !== focusedIndex) {
                    items[focusedIndex].classList.remove('focused');
                    focusedIndex = newIndex;
                    items[focusedIndex].classList.add('focused');
                    items[focusedIndex].focus();
                }
            });
        })
        .catch(error => {
            console.error('Error fetching film data:', error);
            filmList.innerHTML = '<p>Gagal memuat daftar film.</p>';
        });

    function playFilm(url) {
        window.location.href = `player.html?url=${encodeURIComponent(url)}`;
    }
});