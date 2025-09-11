document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    const videoRowsContainer = document.querySelector('.video-sections');

    let currentFocusedElement = null;
    let activeRowIndex = 0;
    let activeVideoCardIndex = 0;

    let isSidebarOpen = false;

    // URL ke file JSON Anda
    // Jika file JSON ada di folder yang sama, Anda bisa gunakan nama filenya saja.
    // Contoh: const JSON_URL = 'videos.json';
    const JSON_URL = 'cmpr.json'; // Ganti dengan URL JSON Anda yang sebenarnya

    // --- Helper Functions ---

    function createVideoCard(video) {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');
        videoCard.tabIndex = 0; // Make it focusable

        // Tambahkan atribut data-lnk untuk menyimpan link video, berguna saat diklik
        videoCard.dataset.lnk = video.lnk;

        videoCard.innerHTML = `
            <img src="${video.logo}" alt="${video.ttl}">
            <div class="video-details">
                <h3>${video.ttl}</h3>
                <p>Durasi: ${video.dur}</p>
            </div>
        `;
        return videoCard;
    }

    function renderVideoRows(data) {
        const recommendedRow = document.getElementById('recommended-row');
        const otherRow = document.getElementById('other-row');

        // Clear existing content
        recommendedRow.innerHTML = '';
        otherRow.innerHTML = '';

        // Example: Distribute videos to different rows
        data.forEach((video, index) => {
            if (index < 4) { // First 4 videos to recommended
                recommendedRow.appendChild(createVideoCard(video));
            } else { // Others to 'other-row'
                otherRow.appendChild(createVideoCard(video));
            }
        });
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

        const cardWidth = videoCards[0].offsetWidth + 20; // Card width + margin-right
        const containerWidth = rowElement.offsetWidth;

        const scrollOffset = (cardIndex * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
        rowElement.scrollLeft = Math.max(0, scrollOffset);
    }

    async function initializeApp() {
        toggleSidebar(false); // Ensure sidebar is closed initially

        try {
            const response = await fetch(JSON_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const videoData = await response.json();
            renderVideoRows(videoData); // Render videos from fetched JSON
        } catch (error) {
            console.error("Error fetching video data:", error);
            // Tampilkan pesan kesalahan di UI jika perlu
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            errorDiv.textContent = 'Gagal memuat data film. Silakan coba lagi nanti.';
            videoRowsContainer.innerHTML = ''; // Clear existing content
            videoRowsContainer.appendChild(errorDiv);
        }

        // After rendering, get the updated videoRows NodeList
        const updatedVideoRows = document.querySelectorAll('.video-row');

        // Start focus on the first video card of the first rendered row
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

    // --- Event Listener for Keyboard/Remote ---

    document.addEventListener('keydown', (event) => {
        event.preventDefault();

        const focusedElement = document.activeElement;
        const videoRows = document.querySelectorAll('.video-row'); // Get updated list of rows

        // --- Sidebar Navigation ---
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
        // --- Video Rows Navigation ---
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
                case 'Enter': // Handle "Enter" or "OK" button press (simulates clicking a video)
                    if (focusedElement.classList.contains('video-card')) {
                        const videoLink = focusedElement.dataset.lnk;
                        if (videoLink) {
                            console.log("Playing video:", videoLink);
                            // Di sini Anda bisa menambahkan logika untuk memutar video
                            // Misalnya: window.location.href = videoLink; (akan mengarahkan ke link)
                            // Atau, jika Anda menggunakan video player tertanam, panggil fungsinya.
                            alert(`Memutar: ${focusedElement.querySelector('h3').textContent}\nLink: ${videoLink}`);
                        }
                    }
                    break;
            }
        } else {
            initializeApp();
        }
    });

    // --- Initial setup ---
    initializeApp(); // Call the async function to start fetching and rendering
});