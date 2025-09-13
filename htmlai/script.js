document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    const dynamicVideoSections = document.getElementById('dynamic-video-sections');
    const searchInput = document.getElementById('search-input');
    const searchResultsSection = document.getElementById('search-results-section');
    const searchResultsRow = document.getElementById('search-results-row');
    const noResultsMessage = document.getElementById('no-results-message');

    let currentFocusedElement = null;
    let activeRowIndex = 0;
    let activeVideoCardIndex = 0;
    let isSidebarOpen = false;
    let allVideoData = []; // Menyimpan semua data video setelah diambil

    // Definisikan daftar file JSON Anda di sini
    const JSON_SOURCES = [
        { title: "Rekomendasi", url: "https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json" },
        { title: "Captain", url: "https://raw.githubusercontent.com/tiviku69/apk/main/captain.json" },
        { title: "Avatar The Last Airbender", url: "https://raw.githubusercontent.com/tiviku69/apk/main/avat.json" },
        { title: "Ghost", url: "https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json" },
        { title: "Avatar", url: "https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json" },
        { title: "Squid Game", url: "https://raw.githubusercontent.com/tiviku69/apk/main/squid.json" },
        { title: "Journey to The West", url: "https://raw.githubusercontent.com/tiviku69/apk/main/journey.json" },
        { title: "One Punch Man", url: "https://raw.githubusercontent.com/tiviku69/apk/main/one.json" },
        { title: "Movie & Video", url: "https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json" }
    ];

    // Fungsi untuk membuat elemen video card
    function createVideoCard(video) {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');
        videoCard.tabIndex = 0;
        videoCard.dataset.lnk = video.lnk;

        const durationHtml = video.dur ? `<span class="duration-overlay">${video.dur}</span>` : '';

        videoCard.innerHTML = `
            <img src="${video.img}" alt="${video.ttl}">
            <div class="video-details">
                <h3>${video.ttl}</h3>
                <p>${video.dsc || ''}</p>
            </div>
            ${durationHtml}
        `;
        return videoCard;
    }

    // Fungsi utama untuk mengambil dan merender semua baris
    async function fetchAndRenderRows() {
        dynamicVideoSections.innerHTML = '';
        allVideoData = []; // Reset data video global

        const fetchPromises = JSON_SOURCES.map(async (source, index) => {
            try {
                const response = await fetch(source.url);
                if (!response.ok) {
                    throw new Error(`HTTP error for ${source.title}! status: ${response.status}`);
                }
                const videoData = await response.json();
                if (videoData.length > 0) {
                    // Simpan data video ke array global
                    allVideoData = allVideoData.concat(videoData.map(video => ({ ...video, sourceTitle: source.title })));

                    const rowContainer = document.createElement('div');
                    rowContainer.classList.add('video-row-container');
                    const rowTitle = document.createElement('div');
                    rowTitle.classList.add('row-title');
                    rowTitle.textContent = source.title;
                    rowContainer.appendChild(rowTitle);

                    const videoRow = document.createElement('div');
                    videoRow.classList.add('video-row');
                    videoRow.id = `video-row-${index}`;
                    videoData.forEach(video => {
                        videoRow.appendChild(createVideoCard(video));
                    });
                    rowContainer.appendChild(videoRow);
                    dynamicVideoSections.appendChild(rowContainer);
                }
            } catch (error) {
                console.error(`Error fetching data for ${source.title}:`, error);
                const errorDiv = document.createElement('div');
                errorDiv.classList.add('error-message');
                errorDiv.textContent = `Gagal memuat data untuk '${source.title}'.`;
                dynamicVideoSections.appendChild(errorDiv);
            }
        });

        await Promise.all(fetchPromises);
    }

    function setFocus(element) {
        if (currentFocusedElement) {
            currentFocusedElement.classList.remove('active');
        }
        element.focus();
        element.classList.add('active');
        currentFocusedElement = element;
    }

    function toggleSidebar(open) {
        isSidebarOpen = open;
        if (open) {
            sidebar.classList.add('open');
            mainContent.classList.add('sidebar-visible');
        } else {
            sidebar.classList.remove('open');
            mainContent.classList.remove('sidebar-visible');
        }
    }

    // Fungsi baru untuk mengelola scroll dengan mempertahankan posisi highlight
    function scrollRowToMaintainFocus(rowElement, cardIndex) {
        const videoCards = Array.from(rowElement.children);
        if (videoCards.length === 0) return;

        // Ambil margin-right dari video-card untuk perhitungan akurat
        const cardStyle = window.getComputedStyle(videoCards[0]);
        const cardMarginRight = parseFloat(cardStyle.marginRight);
        const cardWidth = videoCards[0].offsetWidth + cardMarginRight; // Termasuk margin
        const containerWidth = rowElement.offsetWidth;
        const paddingLeft = parseFloat(window.getComputedStyle(rowElement).paddingLeft || '0'); // Default to 0 if not set

        // Hitung posisi horizontal kartu relatif terhadap awal elemen row (termasuk scroll saat ini)
        const focusedCard = videoCards[cardIndex];
        const focusedCardRect = focusedCard.getBoundingClientRect();
        const rowRect = rowElement.getBoundingClientRect();
        const cardRelativeX = focusedCardRect.left - rowRect.left + rowElement.scrollLeft;

        // Kita ingin kartu berada sekitar 25% dari kiri rowElement (setelah padding)
        const targetHighlightPosition = 0.25 * (containerWidth - (2 * paddingLeft));

        // Hitung posisi scroll yang baru
        const newScrollPosition = cardRelativeX - targetHighlightPosition;

        // Pastikan tidak menggulir terlalu jauh ke kiri atau kanan
        rowElement.scrollLeft = Math.max(0, Math.min(newScrollPosition, rowElement.scrollWidth - containerWidth + (2 * paddingLeft)));
    }

    async function initializeApp() {
        toggleSidebar(false);
        await fetchAndRenderRows();
        const updatedVideoRows = document.querySelectorAll('.video-row');

        // Sembunyikan hasil pencarian saat inisialisasi
        searchResultsSection.style.display = 'none';
        dynamicVideoSections.style.display = 'block';

        if (updatedVideoRows.length > 0 && updatedVideoRows[0].children.length > 0) {
            setFocus(updatedVideoRows[0].children[0]);
            scrollRowToMaintainFocus(updatedVideoRows[0], 0);
            activeRowIndex = 0;
            activeVideoCardIndex = 0;
        } else if (sidebarItems.length > 0) {
            setFocus(sidebarItems[0]);
            toggleSidebar(true);
        }
    }

    // Fungsi untuk melakukan pencarian
    function performSearch(query) {
        searchResultsRow.innerHTML = ''; // Bersihkan hasil sebelumnya
        noResultsMessage.style.display = 'none'; // Sembunyikan pesan "tidak ada hasil"

        if (query.trim() === '') {
            searchResultsSection.style.display = 'none';
            dynamicVideoSections.style.display = 'block';
            if (dynamicVideoSections.children.length > 0) {
                const firstVideoCard = dynamicVideoSections.querySelector('.video-card');
                if (firstVideoCard) {
                    setFocus(firstVideoCard);
                    activeRowIndex = 0;
                    activeVideoCardIndex = 0;
                    scrollRowToMaintainFocus(firstVideoCard.closest('.video-row'), 0);
                }
            }
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const filteredVideos = allVideoData.filter(video =>
            video.ttl.toLowerCase().includes(lowerCaseQuery)
        );

        if (filteredVideos.length > 0) {
            dynamicVideoSections.style.display = 'none';
            searchResultsSection.style.display = 'block';
            filteredVideos.forEach(video => {
                searchResultsRow.appendChild(createVideoCard(video));
            });

            // Fokuskan pada hasil pertama jika ada
            if (searchResultsRow.children.length > 0) {
                setFocus(searchResultsRow.children[0]);
                scrollRowToMaintainFocus(searchResultsRow, 0);
                activeRowIndex = 0; // Atur indeks untuk hasil pencarian
                activeVideoCardIndex = 0;
            }
        } else {
            dynamicVideoSections.style.display = 'none';
            searchResultsSection.style.display = 'block';
            noResultsMessage.style.display = 'block';
            // Pindahkan fokus ke input pencarian
            searchInput.focus();
            currentFocusedElement = searchInput;
        }
    }

    initializeApp();
    
});