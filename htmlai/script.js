document.addEventListener('DOMContentLoaded', () => {
    // ... (Semua kode helper functions dan setup awal tetap sama) ...
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    const dynamicVideoSections = document.getElementById('dynamic-video-sections');

    let currentFocusedElement = null;
    let activeRowIndex = 0;
    let activeVideoCardIndex = 0;
    let isSidebarOpen = false;

    // Definisikan daftar file JSON Anda di sini
    const JSON_SOURCES = [
        {
            title: "Recomendasi",
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json"
        },
        {
            
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/captain.json"
        },
        {
            
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/avat.json"
        },
        {
            
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json"
        },
        {
            
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json"
        },
        {
            
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/squid.json"
        },
        {
            
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/journey.json"
        },
        {
            
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/one.json"
        },
        {
            
            url: "https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json"
        }
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
                
                if (videoData.length > 0) {
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

    function scrollRowToCenter(rowElement, cardIndex) {
        const videoCards = Array.from(rowElement.children);
        if (videoCards.length === 0) return;

        const cardWidth = videoCards[0].offsetWidth + 20;
        const containerWidth = rowElement.offsetWidth;

        const scrollOffset = (cardIndex * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
        rowElement.scrollLeft = Math.max(0, scrollOffset);
    }

    async function initializeApp() {
        toggleSidebar(false);
        await fetchAndRenderRows();
        const updatedVideoRows = document.querySelectorAll('.video-row');

        if (updatedVideoRows.length > 0 && updatedVideoRows[0].children.length > 0) {
            setFocus(updatedVideoRows[0].children[0]);
            scrollRowToCenter(updatedVideoRows[0], 0);
            activeRowIndex = 0;
            activeVideoCardIndex = 0;
        } else if (sidebarItems.length > 0) {
            setFocus(sidebarItems[0]);
            toggleSidebar(true);
        }
    }

    document.addEventListener('keydown', (event) => {
        event.preventDefault();
        const focusedElement = document.activeElement;
        const videoRows = document.querySelectorAll('.video-row');

        if (isSidebarOpen && focusedElement.closest('.sidebar')) {
            const currentSidebarIndex = Array.from(sidebarItems).indexOf(focusedElement);
            switch (event.key) {
                case 'ArrowDown':
                    if (currentSidebarIndex < sidebarItems.length - 1) {
                        setFocus(sidebarItems[currentSidebarIndex + 1]);
                    }
                    break;
                case 'ArrowUp':
                    if (currentSidebarIndex > 0) {
                        setFocus(sidebarItems[currentSidebarIndex - 1]);
                    }
                    break;
                case 'ArrowRight':
                    toggleSidebar(false);
                    if (videoRows.length > 0) {
                        const targetRow = videoRows[activeRowIndex];
                        if (targetRow && targetRow.children.length > 0) {
                            activeVideoCardIndex = Math.min(activeVideoCardIndex, targetRow.children.length - 1);
                            setFocus(targetRow.children[activeVideoCardIndex]);
                            scrollRowToCenter(targetRow, activeVideoCardIndex);
                        }
                    }
                    break;
            }
        }
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
                        scrollRowToCenter(currentVideoRow, activeVideoCardIndex);
                    }
                    break;
                case 'ArrowLeft':
                    if (currentCardIndex > 0) {
                        activeVideoCardIndex = currentCardIndex - 1;
                        setFocus(videoCards[activeVideoCardIndex]);
                        scrollRowToCenter(currentVideoRow, activeVideoCardIndex);
                    } else {
                        toggleSidebar(true);
                        setFocus(sidebarItems[0]);
                    }
                    break;
                case 'ArrowDown':
                    if (currentRowIndexInSections < videoRows.length - 1) {
                        activeRowIndex = currentRowIndexInSections + 1;
                        const nextRow = videoRows[activeRowIndex];
                        activeVideoCardIndex = Math.min(activeVideoCardIndex, nextRow.children.length - 1);
                        if (nextRow.children.length > 0) {
                            setFocus(nextRow.children[activeVideoCardIndex]);
                            scrollRowToCenter(nextRow, activeVideoCardIndex);
                        }
                        nextRow.closest('.video-sections').scrollTop = nextRow.offsetTop - 100;
                    }
                    break;
                case 'ArrowUp':
                    if (currentRowIndexInSections > 0) {
                        activeRowIndex = currentRowIndexInSections - 1;
                        const prevRow = videoRows[activeRowIndex];
                        activeVideoCardIndex = Math.min(activeVideoCardIndex, prevRow.children.length - 1);
                        if (prevRow.children.length > 0) {
                            setFocus(prevRow.children[activeVideoCardIndex]);
                            scrollRowToCenter(prevRow, activeVideoCardIndex);
                        }
                        prevRow.closest('.video-sections').scrollTop = prevRow.offsetTop - 100;
                    }
                    break;
                case 'Enter': // Handle "Enter" or "OK" button press
                    if (focusedElement.classList.contains('video-card')) {
                        const videoLink = focusedElement.dataset.lnk;
                        const videoTitle = focusedElement.querySelector('h3').textContent; // Ambil judul dari H3

                        if (videoLink) {
                            // Simpan data ke sessionStorage
                            sessionStorage.setItem('videoLink', videoLink);
                            sessionStorage.setItem('videoTitle', videoTitle);

                            // Arahkan ke ply.html
                            window.location.href = 'ply.html';
                        }
                    }
                    break;
            }
        } else {
            // Jika fokus hilang atau di luar area video/sidebar, inisialisasi ulang
            // (Anda mungkin ingin mengubah perilaku ini agar lebih intuitif,
            // seperti selalu fokus ke sidebar atau video pertama)
            initializeApp();
        }
    });
    
    // Panggil fungsi utama saat halaman dimuat
    initializeApp();
});