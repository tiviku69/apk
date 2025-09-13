document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    // AMBIL SEMUA ITEMS TERMASUK PENCARIAN BARU
    const sidebarNavItems = document.querySelectorAll('.sidebar .nav-item'); 
    const dynamicVideoSections = document.getElementById('dynamic-video-sections');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button'); // Ambil tombol pencarian

    let allVideoData = [];

    let currentFocusedElement = null;
    let activeRowIndex = 0;
    let activeVideoCardIndex = 0;
    let isSidebarOpen = false;
    let activeNavIndex = 0; // Indeks untuk navigasi sidebar

    const JSON_SOURCES = [
        { title: "Recomendasi", url: "https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json" },
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
            <img src="${video.logo}" alt="${video.ttl}">
            <div class="video-details">
                <h3>${video.ttl}</h3>
            </div>
            ${durationHtml}
        `;
        return videoCard;
    }

    // Fungsi baru untuk merender video rows dari data yang diberikan
    function renderVideoSections(data) {
        dynamicVideoSections.innerHTML = '';
        data.forEach((source, index) => {
            if (source.videos.length > 0) {
                const rowContainer = document.createElement('div');
                rowContainer.classList.add('video-row-container');

                const rowTitle = document.createElement('div');
                rowTitle.classList.add('row-title');
                rowTitle.textContent = source.title;
                rowContainer.appendChild(rowTitle);

                const videoRow = document.createElement('div');
                videoRow.classList.add('video-row');
                videoRow.id = `video-row-${index}`;

                source.videos.forEach(video => {
                    videoRow.appendChild(createVideoCard(video));
                });

                rowContainer.appendChild(videoRow);
                dynamicVideoSections.appendChild(rowContainer);
            }
        });
    }

    // Fungsi utama untuk mengambil semua data dan menyimpannya
    async function fetchAllData() {
        allVideoData = await Promise.all(
            JSON_SOURCES.map(async (source) => {
                try {
                    const response = await fetch(source.url);
                    if (!response.ok) {
                        throw new Error(`HTTP error for ${source.title}! status: ${response.status}`);
                    }
                    const videoData = await response.json();
                    return {
                        title: source.title,
                        videos: videoData
                    };
                } catch (error) {
                    console.error(`Error fetching data for ${source.title}:`, error);
                    return {
                        title: source.title,
                        videos: []
                    };
                }
            })
        );
        renderVideoSections(allVideoData); // Render all data initially
    }

    // Fungsi untuk memfilter dan merender hasil pencarian
    function filterAndRender(query) {
        const lowerCaseQuery = query.toLowerCase();
        if (lowerCaseQuery.length === 0) {
            renderVideoSections(allVideoData); // Show all sections if query is empty
        } else {
            const filteredData = allVideoData
                .map(row => {
                    const filteredVideos = row.videos.filter(video =>
                        video.ttl.toLowerCase().includes(lowerCaseQuery)
                    );
                    return { title: row.title, videos: filteredVideos };
                })
                .filter(row => row.videos.length > 0); // Remove rows with no matches

            renderVideoSections(filteredData);
        }
        // After rendering, try to set initial focus on the first video card
        const updatedVideoRows = document.querySelectorAll('.video-row');
        if (updatedVideoRows.length > 0 && updatedVideoRows[0].children.length > 0) {
            setFocus(updatedVideoRows[0].children[0]);
            scrollRowToMaintainFocus(updatedVideoRows[0], 0);
            activeRowIndex = 0;
            activeVideoCardIndex = 0;
        } else {
            currentFocusedElement = null; // Clear focus if no results
        }
    }

    // Event listener untuk input pencarian
    searchInput.addEventListener('keyup', (event) => {
        filterAndRender(event.target.value);
    });
    // Event listener untuk tombol pencarian (opsional, untuk klik mouse)
    searchButton.addEventListener('click', () => {
        filterAndRender(searchInput.value);
    });

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

    function scrollRowToMaintainFocus(rowElement, cardIndex) {
        const videoCards = Array.from(rowElement.children);
        if (videoCards.length === 0) return;

        const cardStyle = window.getComputedStyle(videoCards[0]);
        const cardMarginRight = parseFloat(cardStyle.marginRight);
        const cardWidth = videoCards[0].offsetWidth + cardMarginRight;

        const containerWidth = rowElement.offsetWidth;
        const paddingLeft = parseFloat(window.getComputedStyle(rowElement).paddingLeft);
        const focusedCard = videoCards[cardIndex];
        const focusedCardRect = focusedCard.getBoundingClientRect();
        const rowRect = rowElement.getBoundingClientRect();

        const cardRelativeX = focusedCardRect.left - rowRect.left + rowElement.scrollLeft;
        const targetHighlightPosition = 0.25 * (containerWidth - (2 * paddingLeft)); // Usahakan fokus di 25% kiri container
        const newScrollPosition = cardRelativeX - targetHighlightPosition;

        rowElement.scrollLeft = Math.max(0, Math.min(newScrollPosition, rowElement.scrollWidth - containerWidth + (2 * paddingLeft)));
    }

    // Fungsi untuk menginisialisasi aplikasi
    async function initializeApp() {
        toggleSidebar(false); // Tutup sidebar secara default
        await fetchAllData(); // Ambil semua data
        
        // Atur fokus awal ke elemen pertama di sidebar
        if (sidebarNavItems.length > 0) {
            setFocus(sidebarNavItems[0]);
            activeNavIndex = 0;
            toggleSidebar(true); // Buka sidebar
        }
    }

    // Event listener utama untuk input keyboard/remote
    document.addEventListener('keydown', (event) => {
        event.preventDefault(); // Cegah aksi default browser
        const focusedElement = document.activeElement;
        const videoRows = document.querySelectorAll('.video-row');
        
        // --- LOGIKA UNTUK INPUT PENCARIAN ---
        if (focusedElement.id === 'search-input') {
            switch (event.key) {
                case 'ArrowDown':
                    // Jika menekan panah bawah dari input pencarian, pindah ke video pertama
                    if (videoRows.length > 0 && videoRows[0].children.length > 0) {
                        toggleSidebar(false); // Pastikan sidebar tertutup
                        setFocus(videoRows[0].children[0]); // Fokus ke video pertama
                        activeRowIndex = 0; // Set index baris aktif
                        activeVideoCardIndex = 0; // Set index kartu video aktif
                    }
                    break;
                case 'Enter':
                    // Jika menekan Enter, picu pencarian
                    filterAndRender(focusedElement.value);
                    break;
            }
            return; // Hentikan eksekusi jika fokus di search input
        }

        // --- LOGIKA UNTUK SIDEBAR NAVIGASI ---
        if (isSidebarOpen && focusedElement.closest('.sidebar')) {
            switch (event.key) {
                case 'ArrowDown':
                    if (activeNavIndex < sidebarNavItems.length - 1) {
                        activeNavIndex++;
                        setFocus(sidebarNavItems[activeNavIndex]);
                    }
                    break;
                case 'ArrowUp':
                    if (activeNavIndex > 0) {
                        activeNavIndex--;
                        setFocus(sidebarNavItems[activeNavIndex]);
                    }
                    break;
                case 'ArrowRight':
                    // Jika menekan panah kanan saat di sidebar, pindah fokus ke input pencarian
                    if (searchInput) {
                        toggleSidebar(false); // Tutup sidebar
                        setFocus(searchInput); // Fokus ke search input
                    } else {
                        // Jika search input tidak ada (seharusnya ada), pindah ke video pertama
                        if (videoRows.length > 0 && videoRows[0].children.length > 0) {
                            toggleSidebar(false);
                            setFocus(videoRows[0].children[0]);
                            activeRowIndex = 0;
                            activeVideoCardIndex = 0;
                        }
                    }
                    break;
            }
        } 
        // --- LOGIKA UNTUK NAVIGASI VIDEO CARDS ---
        else if (focusedElement.closest('.video-row')) {
            const currentVideoRow = focusedElement.closest('.video-row');
            const videoCards = Array.from(currentVideoRow.children);
            const currentCardIndex = videoCards.indexOf(focusedElement);
            const currentRowContainer = focusedElement.closest('.video-row-container');
            const allRowContainers = document.querySelectorAll('.video-row-container');
            const currentRowIndexInSections = Array.from(allRowContainers).indexOf(currentRowContainer);

            switch (event.key) {
                case 'ArrowRight':
                    if (currentCardIndex < videoCards.length - 1) {
                        activeVideoCardIndex = currentCardIndex + 1;
                        setFocus(videoCards[activeVideoCardIndex]);
                        scrollRowToMaintainFocus(currentVideoRow, activeVideoCardIndex);
                    }
                    break;
                case 'ArrowLeft':
                    if (currentCardIndex > 0) {
                        activeVideoCardIndex = currentCardIndex - 1;
                        setFocus(videoCards[activeVideoCardIndex]);
                        scrollRowToMaintainFocus(currentVideoRow, activeVideoCardIndex);
                    } else {
                        // Jika panah kiri ditekan di kartu video pertama dalam baris, kembali ke sidebar
                        toggleSidebar(true);
                        setFocus(sidebarNavItems[activeNavIndex]); // Kembali ke item sidebar yang terakhir aktif
                    }
                    break;
                case 'ArrowDown':
                    if (currentRowIndexInSections < videoRows.length - 1) {
                        activeRowIndex = currentRowIndexInSections + 1;
                        const nextRow = videoRows[activeRowIndex];
                        activeVideoCardIndex = Math.min(activeVideoCardIndex, nextRow.children.length - 1);
                        if (nextRow.children.length > 0) {
                            setFocus(nextRow.children[activeVideoCardIndex]);
                            scrollRowToMaintainFocus(nextRow, activeVideoCardIndex);
                        }
                        // Scroll container utama agar baris baru terlihat
                        const targetRowElement = nextRow.closest('.video-row-container');
                        if (targetRowElement) {
                             dynamicVideoSections.scrollTo({
                                top: targetRowElement.offsetTop - (dynamicVideoSections.offsetHeight / 3), // Scroll ke sekitar 1/3 layar
                                behavior: 'smooth'
                            });
                        }
                    }
                    break;
                case 'ArrowUp':
                    if (currentRowIndexInSections > 0) {
                        activeRowIndex = currentRowIndexInSections - 1;
                        const prevRow = videoRows[activeRowIndex];
                        activeVideoCardIndex = Math.min(activeVideoCardIndex, prevRow.children.length - 1);
                        if (prevRow.children.length > 0) {
                            setFocus(prevRow.children[activeVideoCardIndex]);
                            scrollRowToMaintainFocus(prevRow, activeVideoCardIndex);
                        }
                         // Scroll container utama agar baris baru terlihat
                        const targetRowElement = prevRow.closest('.video-row-container');
                        if (targetRowElement) {
                            dynamicVideoSections.scrollTo({
                                top: targetRowElement.offsetTop - (dynamicVideoSections.offsetHeight / 3),
                                behavior: 'smooth'
                            });
                        }
                    }
                    break;
                case 'Enter': // Handle "Enter" atau "OK" button press
                    if (focusedElement.classList.contains('video-card')) {
                        const videoLink = focusedElement.dataset.lnk;
                        const videoTitle = focusedElement.querySelector('h3').textContent;

                        if (videoLink) {
                            sessionStorage.setItem('videoLink', videoLink);
                            sessionStorage.setItem('videoTitle', videoTitle);
                            window.location.href = 'ply.html'; // Ganti dengan nama file pemutar video Anda
                        }
                    }
                    break;
            }
        } else {
            // Jika tidak ada elemen yang fokus (misal: saat aplikasi pertama kali dimuat), inisialisasi ulang
            initializeApp();
        }
    });

    initializeApp(); // Inisialisasi aplikasi saat DOM siap
});