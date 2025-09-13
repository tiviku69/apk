document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const dynamicVideoSections = document.getElementById('dynamic-video-sections');
    let sidebarItems = []; // Akan diisi setelah DOMContentLoaded

    const highlightBoxWrapper = document.getElementById('highlight-box-wrapper');

    let currentFocusedElement = null;
    let activeRowIndex = 0;
    let activeVideoCardIndex = 0;
    let isSidebarOpen = false;

    // --- Definisi ukuran berdasarkan CSS Anda ---
    const THUMBNAIL_WIDTH = 320;
    const THUMBNAIL_GAP = 20;
    const VIDEO_ROW_HORIZ_PADDING = 50; // Total padding horizontal di video-row
    const HIGHLIGHT_TARGET_VIEW_INDEX = 1; // Indeks kartu yang ingin di-highlight (0-indexed)

    // Definisikan daftar file JSON Anda di sini
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
        console.log("Finished rendering rows. Total video rows:", document.querySelectorAll('.video-row').length);
    }
    
    function setFocus(element) {
        if (currentFocusedElement && currentFocusedElement !== element) {
            currentFocusedElement.classList.remove('active');
        }
        element.focus();
        if (element.classList.contains('nav-item')) {
            element.classList.add('active');
            hideHighlightBox();
        } else if (element.closest('header')) {
            hideHighlightBox();
        } else { // Asumsi itu adalah video-card
            showHighlightBox(element);
        }
        currentFocusedElement = element;
    }

    function showHighlightBox(targetElement) {
        if (!targetElement || !targetElement.classList.contains('video-card')) {
            hideHighlightBox();
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        
        // Atur posisi highlight box berdasarkan rect dari targetElement
        highlightBoxWrapper.style.left = `${rect.left}px`;
        highlightBoxWrapper.style.top = `${rect.top}px`;
        highlightBoxWrapper.style.width = `${rect.width}px`;
        highlightBoxWrapper.style.height = `${rect.height}px`;

        highlightBoxWrapper.classList.add('visible');
    }

    function hideHighlightBox() {
        highlightBoxWrapper.classList.remove('visible');
    }

    function toggleSidebar(open) {
        isSidebarOpen = open;
        sidebar.classList.toggle('open', open);
        mainContent.classList.toggle('sidebar-visible', open);
    }

    function updateVideoFocusAndScroll() {
        const allVideoRows = dynamicVideoSections.querySelectorAll('.video-row');
        if (allVideoRows.length === 0) {
            hideHighlightBox();
            return;
        }

        // Pastikan activeRowIndex valid
        activeRowIndex = Math.max(0, Math.min(activeRowIndex, allVideoRows.length - 1));

        const targetVideoRow = allVideoRows[activeRowIndex];
        const allVideoCardsInRow = Array.from(targetVideoRow.children);

        if (allVideoCardsInRow.length === 0) {
            hideHighlightBox();
            return;
        }

        // Pastikan activeVideoCardIndex valid untuk baris ini
        activeVideoCardIndex = Math.max(0, Math.min(activeVideoCardIndex, allVideoCardsInRow.length - 1));

        const targetCard = allVideoCardsInRow[activeVideoCardIndex];
        setFocus(targetCard);

        // --- Logika pergeseran horizontal baris video (transform translateX) ---
        // Hitung posisi horizontal yang harus dimiliki targetVideoRow
        // agar activeVideoCardIndex muncul di HIGHLIGHT_TARGET_VIEW_INDEX dari area yang terlihat.

        // Lebar total item yang akan di-highlight
        const highlightItemWidth = THUMBNAIL_WIDTH + THUMBNAIL_GAP;
        
        // Jarak dari awal baris (termasuk padding kiri) hingga tepi kiri kartu aktif
        const currentCardOffsetFromRowStart = (activeVideoCardIndex * highlightItemWidth);

        // Target posisi X (dari kiri viewport video-sections) untuk kartu yang di-highlight
        // Ini adalah di mana highlight box akan muncul
        const targetHighlightXInViewport = VIDEO_ROW_HORIZ_PADDING + (HIGHLIGHT_TARGET_VIEW_INDEX * highlightItemWidth);

        // Hitung berapa banyak konten di .video-row yang perlu digeser ke kiri (translateX)
        // agar kartu aktif berada di posisi highlight target
        let translateXAmount = currentCardOffsetFromRowStart - (HIGHLIGHT_TARGET_VIEW_INDEX * highlightItemWidth);

        // Batasi translateXAmount agar tidak geser terlalu jauh ke kiri/kanan
        translateXAmount = Math.max(0, translateXAmount); // Jangan geser ke kanan melewati awal

        const rowTotalContentWidth = allVideoCardsInRow.length * highlightItemWidth;
        const rowVisibleWidth = targetVideoRow.offsetWidth; // Lebar .video-row yang terlihat
        
        // Batas maksimal geser ke kiri agar tidak ada ruang kosong di kanan
        const maxTranslateAmount = Math.max(0, rowTotalContentWidth - rowVisibleWidth + VIDEO_ROW_HORIZ_PADDING);
        
        translateXAmount = Math.min(translateXAmount, maxTranslateAmount);
        
        targetVideoRow.style.transform = `translateX(-${translateXAmount}px)`;
        
        console.log(`Row ${activeRowIndex}, Card ${activeVideoCardIndex}: translateX(-${translateXAmount}px)`);

        // --- Logika menggulirkan `dynamicVideoSections` secara vertikal ---
        const focusedRowContainer = targetCard.closest('.video-row-container');
        if (focusedRowContainer) {
            const containerRect = dynamicVideoSections.getBoundingClientRect();
            const rowRect = focusedRowContainer.getBoundingClientRect();

            const scrollPadding = 100;

            if (rowRect.top < containerRect.top + scrollPadding) {
                dynamicVideoSections.scrollTop += (rowRect.top - (containerRect.top + scrollPadding));
            } else if (rowRect.bottom > containerRect.bottom - scrollPadding) {
                dynamicVideoSections.scrollTop += (rowRect.bottom - (containerRect.bottom - scrollPadding));
            }
        }
    }

    async function initializeApp() {
        toggleSidebar(false);
        await fetchAndRenderRows();
        sidebarItems = document.querySelectorAll('.sidebar .nav-item'); // Pastikan ini diperbarui

        const updatedVideoRows = document.querySelectorAll('.video-row');

        if (updatedVideoRows.length > 0 && updatedVideoRows[0].children.length > 0) {
            activeRowIndex = 0;
            activeVideoCardIndex = HIGHLIGHT_TARGET_VIEW_INDEX; // Mulai fokus di target highlight
            // Pastikan activeVideoCardIndex tidak melebihi jumlah kartu yang ada
            if (activeVideoCardIndex >= updatedVideoRows[0].children.length) {
                activeVideoCardIndex = updatedVideoRows[0].children.length - 1;
            }
            updateVideoFocusAndScroll();
        } else if (sidebarItems.length > 0) {
            setFocus(sidebarItems[0]);
            toggleSidebar(true);
        } else {
             hideHighlightBox();
             const firstHeaderNavItem = document.querySelector('header nav ul li');
             if (firstHeaderNavItem) {
                 setFocus(firstHeaderNavItem);
             }
        }
    }

    document.addEventListener('keydown', (event) => {
        event.preventDefault();

        const focusedElement = document.activeElement;
        const videoRows = document.querySelectorAll('.video-row');
        const allRowContainers = document.querySelectorAll('.video-row-container');
        
        sidebarItems = document.querySelectorAll('.sidebar .nav-item'); // Refresh sidebar items

        // Navigasi Sidebar
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
                    if (videoRows.length > 0) {
                        // Saat kembali dari sidebar, aktifkan kembali kartu yang terakhir difokuskan atau yang pertama
                        if (activeRowIndex === 0 && activeVideoCardIndex === 0 && videoRows[0].children.length > HIGHLIGHT_TARGET_VIEW_INDEX) {
                            activeVideoCardIndex = HIGHLIGHT_TARGET_VIEW_INDEX;
                        }
                        updateVideoFocusAndScroll();
                    } else if (document.activeElement !== document.body) {
                        document.activeElement.blur();
                        hideHighlightBox();
                    }
                    break;
                case 'Enter':
                    console.log("Sidebar Item Clicked:", focusedElement.textContent);
                    break;
            }
        } else if (focusedElement.closest('.video-row')) {
            activeRowIndex = Array.from(allRowContainers).indexOf(focusedElement.closest('.video-row-container'));
            activeVideoCardIndex = Array.from(focusedElement.closest('.video-row').children).indexOf(focusedElement);

            switch (event.key) {
                case 'ArrowRight':
                    if (activeVideoCardIndex < videoRows[activeRowIndex].children.length - 1) {
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
                        if (firstHeaderNavItem) {
                            setFocus(firstHeaderNavItem);
                        } else {
                            focusedElement.blur();
                            hideHighlightBox();
                        }
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
        else if (focusedElement.closest('header')) {
            const headerNavItems = Array.from(document.querySelectorAll('header nav ul li'));
            const userProfileImg = document.querySelector('.user-profile img');
            const allHeaderFocusable = [...headerNavItems, userProfileImg].filter(el => el);
            const currentIndexInHeader = allHeaderFocusable.indexOf(focusedElement);

            switch (event.key) {
                case 'ArrowRight':
                    if (currentIndexInHeader < allHeaderFocusable.length - 1) {
                        setFocus(allHeaderFocusable[currentIndexInHeader + 1]);
                    }
                    break;
                case 'ArrowLeft':
                    if (currentIndexInHeader > 0) {
                        setFocus(allHeaderFocusable[currentIndexInHeader - 1]);
                    }
                    break;
                case 'ArrowDown':
                    if (videoRows.length > 0) {
                        activeRowIndex = 0;
                        activeVideoCardIndex = HIGHLIGHT_TARGET_VIEW_INDEX; // Saat dari header ke video
                        if (activeVideoCardIndex >= videoRows[0].children.length) {
                            activeVideoCardIndex = videoRows[0].children.length - 1;
                        }
                        updateVideoFocusAndScroll();
                    }
                    break;
                case 'Enter':
                    console.log("Header Item Clicked:", focusedElement.textContent);
                    break;
            }
        }
        else {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter') {
                 initializeApp();
            } else {
                 hideHighlightBox();
            }
        }
    });
    
    initializeApp();
});