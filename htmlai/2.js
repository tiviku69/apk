document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const movieList = document.getElementById('movieList');
    let films = [];
    let focusedElement = null; // Elemen yang sedang terfokus
    const movieCards = [];

    // Mengambil data dari films.json
    async function fetchFilms() {
        try {
            const response = await fetch('films.json');
            films = await response.json();
            renderFilms(films);
        } catch (error) {
            console.error('Error fetching films:', error);
            movieList.innerHTML = '<p>Gagal memuat daftar film.</p>';
        }
    }

    // Merender daftar film ke halaman
    function renderFilms(filmList) {
        movieList.innerHTML = ''; // Kosongkan daftar sebelumnya
        movieCards.length = 0; // Reset array kartu film

        if (filmList.length === 0) {
            movieList.innerHTML = '<p>Film tidak ditemukan.</p>';
            return;
        }

        filmList.forEach((film, index) => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.dataset.index = index; // Menambahkan index untuk navigasi
            movieCard.innerHTML = `
                <img src="${film.poster}" alt="${film.title} Poster" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${film.title}</h3>
                    <p class="movie-genre">${film.genre} (${film.year})</p>
                </div>
            `;
            movieList.appendChild(movieCard);
            movieCards.push(movieCard);
        });

        // Fokuskan elemen pertama jika ada
        if (movieCards.length > 0) {
            focusedElement = searchInput;
            focusedElement.focus();
        }
    }

    // Fungsi pencarian
    function searchFilms() {
        const query = searchInput.value.toLowerCase();
        const filteredFilms = films.filter(film =>
            film.title.toLowerCase().includes(query) ||
            film.genre.toLowerCase().includes(query)
        );
        renderFilms(filteredFilms);
    }

    searchInput.addEventListener('input', searchFilms);

    // Navigasi dengan tombol keyboard (simulasi remote)
    document.addEventListener('keydown', (e) => {
        let newFocusedElement = null;

        if (focusedElement === searchInput) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                newFocusedElement = movieCards[0];
            }
        } else {
            const currentIndex = movieCards.indexOf(focusedElement);
            if (currentIndex === -1) {
                newFocusedElement = movieCards[0] || searchInput;
            } else {
                const numColumns = Math.floor(movieList.clientWidth / movieCards[0].clientWidth);
                
                switch (e.key) {
                    case 'ArrowUp':
                        newFocusedElement = movieCards[currentIndex - numColumns] || searchInput;
                        break;
                    case 'ArrowDown':
                        newFocusedElement = movieCards[currentIndex + numColumns];
                        break;
                    case 'ArrowLeft':
                        newFocusedElement = movieCards[currentIndex - 1] || searchInput;
                        break;
                    case 'ArrowRight':
                        newFocusedElement = movieCards[currentIndex + 1];
                        break;
                    case 'Enter':
                        // Tambahkan logika untuk aksi 'pilih' film
                        console.log('Film dipilih:', focusedElement.querySelector('.movie-title').innerText);
                        break;
                }
            }
        }

        // Kelola fokus baru
        if (newFocusedElement && newFocusedElement !== focusedElement) {
            if (focusedElement) {
                focusedElement.classList.remove('focused');
                focusedElement.blur(); // Hapus fokus dari elemen sebelumnya
            }
            focusedElement = newFocusedElement;
            focusedElement.classList.add('focused');
            focusedElement.focus(); // Fokuskan elemen baru
        }
    });

    fetchFilms();
});