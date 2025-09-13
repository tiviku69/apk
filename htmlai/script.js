document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    const dynamicVideoSections = document.getElementById('dynamic-video-sections');

    let currentFocusedElement = null;
    let activeRowIndex = 0;
    let activeVideoCardIndex = 0;
    let isSidebarOpen = false;

    // --- Definisi ukuran berdasarkan CSS Anda ---
    const THUMBNAIL_WIDTH = 320;
    const THUMBNAIL_GAP = 20;
    const VIDEO_ROW_PADDING_LEFT = 50;
    const HIGHLIGHT_TARGET_VIEW_INDEX = 1;

    // Definisikan daftar file JSON Anda di sini dengan judul yang relevan
    const JSON_SOURCES = [
        { title: "Rekomendasi", url: "https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json" },
        { title: "Captain", url: "https://raw.githubusercontent.com/tiviku69/apk/main/captain.json" },
        { title: "Avat", url: "https://raw.githubusercontent.com/tiviku69/apk/main/avat.json" },
        { title: "Ghost", url: "https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json" },
        { title: "Avatar", url: "https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json" },
        { title: "Squid", url: "https://raw.githubusercontent.com/tiviku69/apk/main/squid.json" },
        { title: "Journey", url: "https://raw.githubusercontent.com/tiviku69/apk/main/journey.json" },
        { title: "One Piece", url: "https://raw.githubusercontent.com/tiviku69/apk/main/one.json" },
        { title: "MP4", url: "https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json" }
    ];

    // Fungsi untuk membuat elemen video card
    function createVideoCard(video) {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');
        videoCard.tabIndex = 0; // Penting agar bisa di-fokus
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

    // Fungsi utama untuk mengambil dan merender semua baris
    async function fetchAndRenderRows() {
        dynamicVideoSections.innerHTML = '';
        const fetchPromises = JSON_SOURCES.map(async (source, index) => {
            try {
                const response = await fetch(source.url);
                if (!response.ok) {
                    throw new Error(`HTTP error for ${source.title}! status: ${response.status}`);
                }
                const videoData = await response.json();
                
                if (videoData && videoData.length > 0) {
                    const rowContainer = document.createElement('div');
                    rowContainer.classList.add('video-row-container');
                    rowContainer.setAttribute('data-row-index', index);

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
    
    // Fungsi untuk mengatur fokus
    function setFocus(element) {
        if (currentFocusedElement && currentFocusedElement !== element) {
            currentFocusedElement.classList.remove('active');
        }
        element.focus();
        if (element.classList.contains('nav-item')) {
            element.classList.add('active');
        }
        currentFocusedElement = element;
    }

    // Fungsi untuk membuka/menutup sidebar
    function toggleSidebar(open) {
        isSidebarOpen = open;
        sidebar.classList.toggle('open', open);
        mainContent.classList.toggle('sidebar-visible', open);
    }

    // Fungsi utama untuk mengelola fokus dan guliran
    function updateVideoFocusAndScroll() {
        const allVideoRows = dynamicVideoSections.querySelectorAll('.video-row');
        if (allVideoRows.length === 0) return;

        if (activeRowIndex >= allVideoRows.length) activeRowIndex = allVideoRows.length - 1;
        if (activeRowIndex < 0) activeRowIndex = 0;

        const targetVideoRow = allVideoRows[activeRowIndex];
        const allVideoCardsInRow = Array.from(targetVideoRow.children);

        if (allVideoCardsInRow.length === 0) return;

        if (activeVideoCardIndex >= allVideoCardsInRow.length) {
            activeVideoCardIndex = allVideoCardsInRow.length - 1;
        }
        if (activeVideoCardIndex < 0) {
            activeVideoCardIndex = 0;
        }

        const targetCard = allVideoCardsInRow[activeVideoCardIndex];
        setFocus(targetCard);

        // Hitung scroll position untuk baris video
        // Kita ingin elemen yang di-focus berada di posisi `HIGHLIGHT_TARGET_VIEW_INDEX` dari kiri
        const desiredScrollLeft = (activeVideoCardIndex * (THUMBNAIL_WIDTH + THUMBNAIL_GAP)) - (HIGHLIGHT_TARGET_VIEW_INDEX * (THUMBNAIL_WIDTH + THUMBNAIL_GAP));

        const maxScrollLeft = targetVideoRow.scrollWidth - targetVideoRow.offsetWidth + VIDEO_ROW_PADDING_LEFT;
        
        targetVideoRow.scrollLeft = Math.min(Math.max(0, desiredScrollLeft), maxScrollLeft);

        // Gulirkan kontainer utama secara vertikal
        const focusedRowContainer = targetCard.closest('.video-row-container');
        if (focusedRowContainer) {
            const rowTop = focusedRowContainer.offsetTop;
            const scrollContainerHeight = dynamicVideoSections.offsetHeight;
            const scrollContainerTop = dynamicVideoSections.scrollTop;
            
            // Atur posisi gulir agar baris berada di tengah vertikal (atau di posisi yang nyaman)
            dynamicVideoSections.scrollTop = rowTop - (scrollContainerHeight / 2) + (focusedRowContainer.offsetHeight / 2);
        }
    }

    async function initializeApp() {
        toggleSidebar(false);
        await fetchAndRenderRows();
        const updatedVideoRows = document.querySelectorAll('.video-row');

        if (updatedVideoRows.length > 0 && updatedVideoRows[0].children.length > 0) {
            activeRowIndex = 0;
            activeVideoCardIndex = 0;
            updateVideoFocusAndScroll();
        } else if (sidebarItems.length > 0) {
            setFocus(sidebarItems[0]);
            toggleSidebar(true);
        }
    }

    // Penanganan event keyboard utama
    document.addEventListener('keydown', (event) => {
        event.preventDefault();

        const focusedElement = document.activeElement;
        const videoRows = document.querySelectorAll('.video-row');

        if (isSidebarOpen && focusedElement.closest('.sidebar')) {
            const currentSidebarIndex = Array.from(sidebarItems).indexOf(focusedElement);
            switch (event.key) {
                case 'ArrowDown':
                    if (currentSidebarIndex < sidebarItems.length - 1) setFocus(sidebarItems[currentSidebarIndex + 1]);
                    break;
                case 'ArrowUp':
                    if (currentSidebarIndex > 0) setFocus(sidebarItems[currentSidebarIndex - 1]);
                    break;
                case 'ArrowRight':
                    toggleSidebar(false);
                    if (videoRows.length > 0) updateVideoFocusAndScroll();
                    break;
                case 'Enter':
                    console.log("Sidebar Item Clicked:", focusedElement.textContent);
                    // Aksi untuk klik sidebar item
                    break;
            }
        } else if (focusedElement.closest('.video-row')) {
            const currentVideoRow = focusedElement.closest('.video-row');
            activeRowIndex = Array.from(document.querySelectorAll('.video-row-container')).indexOf(currentVideoRow.closest('.video-row-container'));
            activeVideoCardIndex = Array.from(currentVideoRow.children).indexOf(focusedElement);

            switch (event.key) {
                case 'ArrowRight':
                    if (activeVideoCardIndex < currentVideoRow.children.length - 1) {
                        activeVideoCardIndex++;
                        updateVideoFocusAndScroll();
                    }
                    break;
                case 'ArrowLeft':
                    if (activeVideoCardIndex > 0) {
                        activeVideoCardIndex--;
                        updateVideoFocusAndScroll();
                    } else {
                        toggleSidebar(true);
                        setFocus(sidebarItems[0]);
                    }
                    break;
                case 'ArrowDown':
                    if (activeRowIndex < videoRows.length - 1) {
                        activeRowIndex++;
                        const nextRowCards = videoRows[activeRowIndex].children;
                        activeVideoCardIndex = Math.min(activeVideoCardIndex, nextRowCards.length - 1);
                        updateVideoFocusAndScroll();
                    }
                    break;
                case 'ArrowUp':
                    if (activeRowIndex > 0) {
                        activeRowIndex--;
                        const prevRowCards = videoRows[activeRowIndex].children;
                        activeVideoCardIndex = Math.min(activeVideoCardIndex, prevRowCards.length - 1);
                        updateVideoFocusAndScroll();
                    } else {
                        const firstHeaderNavItem = document.querySelector('header nav ul li');
                        if (firstHeaderNavItem) setFocus(firstHeaderNavItem);
                    }
                    break;
                case 'Enter':
                    if (focusedElement.classList.contains('video-card')) {
                        const videoLink = focusedElement.dataset.lnk;
                        const videoTitle = focusedElement.querySelector('h3').textContent;
                        if (videoLink) {
                            sessionStorage.setItem('videoLink', videoLink);
                            sessionStorage.setItem('videoTitle', videoTitle);
                            window.location.href = 'ply.html';
                        }
                    }
                    break;
            }
        }
        else {
            // Fokus tidak ada di video/sidebar, coba inisialisasi ulang
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter') {
                 initializeApp();
            }
        }
    });
    
    initializeApp();
});