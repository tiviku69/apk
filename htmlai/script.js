document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    const dynamicVideoSections = document.getElementById('dynamic-video-sections');
    const searchInput = document.getElementById('search-input');
    let allVideoData = [];

    let currentFocusedElement = null;
    let activeRowIndex = 0;
    let activeVideoCardIndex = 0;
    let isSidebarOpen = false;

    // Definisikan daftar file JSON Anda di sini
    const JSON_SOURCES = [{
        title: "Recomendasi",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json"
    }, {
        title: "Captain",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/captain.json"
    }, {
        title: "Avatar The Last Airbender",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/avat.json"
    }, {
        title: "Ghost",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json"
    }, {
        title: "Avatar",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json"
    }, {
        title: "Squid Game",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/squid.json"
    }, {
        title: "Journey to The West",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/journey.json"
    }, {
        title: "One Punch Man",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/one.json"
    }, {
        title: "Movie & Video",
        url: "https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json"
    }];

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
        // Render all data initially
        renderVideoSections(allVideoData);
    }

    // Fungsi untuk memfilter dan merender hasil pencarian
    function filterAndRender(query) {
        const lowerCaseQuery = query.toLowerCase();
        if (lowerCaseQuery.length === 0) {
            // If query is empty, show all sections again
            renderVideoSections(allVideoData);
        } else {
            const filteredData = allVideoData
                .map(row => {
                    const filteredVideos = row.videos.filter(video =>
                        video.ttl.toLowerCase().includes(lowerCaseQuery)
                    );
                    return {
                        title: row.title,
                        videos: filteredVideos
                    };
                })
                .filter(row => row.videos.length > 0); // Remove rows with no matches

            renderVideoSections(filteredData);
        }
        // After rendering, try to set initial focus
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

    // Add event listener for search input
    searchInput.addEventListener('keyup', (event) => {
        filterAndRender(event.target.value);
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
        const targetHighlightPosition = 0.25 * (containerWidth - (2 * paddingLeft));
        const newScrollPosition = cardRelativeX - targetHighlightPosition;

        rowElement.scrollLeft = Math.max(0, Math.min(newScrollPosition, rowElement.scrollWidth - containerWidth + (2 * paddingLeft)));
    }

    async function initializeApp() {
        toggleSidebar(false);
        await fetchAllData();
        const updatedVideoRows = document.querySelectorAll('.video-row');
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

    document.addEventListener('keydown', (event) => {
        event.preventDefault();
        const focusedElement = document.activeElement;
        const videoRows = document.querySelectorAll('.video-row');
        
        if (focusedElement.id === 'search-input') {
            switch (event.key) {
                case 'ArrowDown':
                    if (videoRows.length > 0 && videoRows[0].children.length > 0) {
                        toggleSidebar(false);
                        setFocus(videoRows[0].children[0]);
                        activeRowIndex = 0;
                        activeVideoCardIndex = 0;
                    }
                    break;
                case 'Enter':
                    filterAndRender(focusedElement.value);
                    break;
            }
            return;
        }

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
                            scrollRowToMaintainFocus(targetRow, activeVideoCardIndex);
                        }
                    }
                    break;
            }
        } else if (focusedElement.closest('.video-row')) {
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
                            scrollRowToMaintainFocus(nextRow, activeVideoCardIndex);
                        }
                        const targetRowElement = nextRow.closest('.video-row-container');
                        if (targetRowElement) {
                             dynamicVideoSections.scrollTo({
                                top: targetRowElement.offsetTop - (dynamicVideoSections.offsetHeight / 3),
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
                        const targetRowElement = prevRow.closest('.video-row-container');
                        if (targetRowElement) {
                            dynamicVideoSections.scrollTo({
                                top: targetRowElement.offsetTop - (dynamicVideoSections.offsetHeight / 3),
                                behavior: 'smooth'
                            });
                        }
                    }
                    break;
                case 'Enter': // Handle "Enter" or "OK" button press
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
        } else {
            initializeApp();
        }
    });

    initializeApp();
});