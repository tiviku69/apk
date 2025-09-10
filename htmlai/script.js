document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    let videoCarousels = document.querySelectorAll('.video-carousel');
    let allVideoData = []; // All videos loaded from JSON

    let currentSectionIndex = 0; // Current focused section index (main content rows or sidebar items)
    let currentVideoIndexes = []; // Current focused video index within its carousel

    let isSidebarOpen = false;
    let focusMode = 'mainContent'; // 'mainContent', 'sidebar', 'searchOverlay'

    // Constants for layout (MUST match CSS)
    const NUM_ITEMS_PER_VISIBLE_SCREEN = 4;
    const VIDEO_ITEM_WIDTH = 280;
    const VIDEO_ITEM_GAP = 30;
    const TOTAL_ITEM_WIDTH = VIDEO_ITEM_WIDTH + VIDEO_ITEM_GAP;

    // Player elements
    const playerOverlay = document.getElementById('playerOverlay');
    const hlsVideoPlayer = document.getElementById('hlsVideoPlayer');
    const closePlayerButton = document.getElementById('closePlayer');
    let hlsInstance = null;

    // Search elements
    const searchNavItem = document.getElementById('search-nav-item');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const closeSearchButton = document.getElementById('closeSearch');
    const searchResultsCarousel = document.getElementById('searchResults');
    const noResultsMessage = document.getElementById('noResultsMessage');
    let searchResults = []; // Filtered videos
    let currentSearchIndex = 0; // Focused index within search results

    // --- Video Loading and Rendering ---
    async function loadVideos() {
        try {
            const response = await fetch('cmpr.json');
            allVideoData = await response.json();

            const recommendedCarousel = document.getElementById('recommended-carousel');
            const continueWatchingCarousel = document.getElementById('continue-watching-carousel');

            renderVideos(allVideoData, recommendedCarousel);
            renderVideos(allVideoData.slice(2, 6), continueWatchingCarousel);

            videoCarousels = document.querySelectorAll('.video-carousel'); // Re-query after rendering
            currentVideoIndexes = Array.from(videoCarousels).map(() => 0);

            initializeFocus();

        } catch (error) {
            console.error('Error loading video data:', error);
            // Optionally, display a message to the user
        }
    }

    // Function to render video items into a given carousel element
    function renderVideos(videos, carouselElement) {
        carouselElement.innerHTML = '';
        if (videos.length === 0) {
            if (carouselElement.id === 'searchResults') {
                noResultsMessage.style.display = 'block';
            }
            return;
        } else {
             if (carouselElement.id === 'searchResults') {
                noResultsMessage.style.display = 'none';
            }
        }

        videos.forEach((video, index) => {
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');
            videoItem.dataset.link = video.lnk;

            videoItem.innerHTML = `
                <img src="${video.logo}" alt="Video Thumbnail" class="thumbnail">
                <div class="duration">${video.dur}</div>
                <div class="video-title">${video.ttl}</div>
                <div class="video-meta"></div>`;

            if (video.tiviku === 'apk') {
                 const badge = document.createElement('div');
                 badge.classList.add('badge');
                 badge.textContent = 'APK';
                 videoItem.appendChild(badge);
            }
            carouselElement.appendChild(videoItem);
        });
    }

    // --- Focus Management ---
    function initializeFocus() {
        if (videoCarousels.length > 0) {
            const firstCarouselItems = videoCarousels[currentSectionIndex].querySelectorAll('.video-item');
            if (firstCarouselItems.length > 0) {
                firstCarouselItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
                scrollToCenterFocusedItem(videoCarousels[currentSectionIndex], currentVideoIndexes[currentSectionIndex]);
            }
        }
    }

    function removeAllFocus() {
        document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
        document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
    }

    function updateMainContentFocus() {
        removeAllFocus();
        const currentCarousel = videoCarousels[currentSectionIndex];
        const currentItems = currentCarousel.querySelectorAll('.video-item');
        if (currentItems.length > 0) {
            currentItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
            scrollToCenterFocusedItem(currentCarousel, currentVideoIndexes[currentSectionIndex]);
        }
    }

    function updateSidebarFocus() {
        removeAllFocus();
        if (currentSectionIndex < navItems.length) {
            navItems[currentSectionIndex].classList.add('active');
        } else {
            // If currentSectionIndex refers to search, ensure search nav item is highlighted
            navItems[navItems.length - 1].classList.add('active'); // Last item is search
        }
    }

    function updateSearchFocus() {
        removeAllFocus();
        const searchItems = searchResultsCarousel.querySelectorAll('.video-item');
        if (searchItems.length > 0 && currentSearchIndex < searchItems.length) {
            searchItems[currentSearchIndex].classList.add('focused');
            // Scroll search results carousel
            scrollToCenterFocusedItem(searchResultsCarousel, currentSearchIndex);
        } else if (searchInput === document.activeElement) {
            // If no search results or focus is on input, do nothing or highlight input
        } else {
             // Default focus to search input if no results or first time opening
             if (searchItems.length === 0 && searchInput.value === '') {
                 searchInput.focus();
             } else if (searchInput.value !== '') {
                 // No results, keep focus on input
                 searchInput.focus();
             }
        }
    }

    // --- Scrolling Logic ---
    function scrollToCenterFocusedItem(carousel, focusedIndex) {
        const carouselRect = carousel.getBoundingClientRect();
        const itemCenterPosition = focusedIndex * TOTAL_ITEM_WIDTH + (VIDEO_ITEM_WIDTH / 2);
        const targetScrollLeft = itemCenterPosition - (carouselRect.width / 2);

        carousel.scrollLeft = Math.max(0, Math.min(targetScrollLeft, carousel.scrollWidth - carouselRect.width));
    }


    // --- Player Functions ---
    function playVideo(link) {
        playerOverlay.style.display = 'flex';

        if (hlsInstance) {
            hlsInstance.destroy();
        }

        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(link);
            hlsInstance.attachMedia(hlsVideoPlayer);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                hlsVideoPlayer.play();
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("fatal network error encountered, try to recover", data);
                            hlsInstance.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("fatal media error encountered, try to recover", data);
                            hlsInstance.recoverMediaError();
                            break;
                        default:
                            hlsInstance.destroy();
                            break;
                    }
                }
            });
        } else if (hlsVideoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            hlsVideoPlayer.src = link;
            hlsVideoPlayer.addEventListener('loadedmetadata', function() {
                hlsVideoPlayer.play();
            });
        } else {
            alert('Your browser does not support HLS video playback directly.');
            playerOverlay.style.display = 'none';
        }
    }

    function closeVideoPlayer() {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        hlsVideoPlayer.pause();
        hlsVideoPlayer.src = "";
        hlsVideoPlayer.load();
        playerOverlay.style.display = 'none';
    }

    closePlayerButton.addEventListener('click', closeVideoPlayer);


    // --- Search Functions ---
    function openSearchOverlay() {
        searchOverlay.style.display = 'flex';
        focusMode = 'searchOverlay';
        searchInput.focus(); // Focus on the input field
        currentSearchIndex = 0; // Reset search focus
        searchResults = []; // Clear previous results
        renderVideos(searchResults, searchResultsCarousel); // Clear results display
        searchInput.value = ''; // Clear search input
        noResultsMessage.style.display = 'none';
    }

    function closeSearchOverlay() {
        searchOverlay.style.display = 'none';
        focusMode = 'mainContent'; // Go back to main content
        updateMainContentFocus(); // Restore focus on main content
    }

    closeSearchButton.addEventListener('click', closeSearchOverlay);

    // Filter videos based on search input
    function filterVideos(query) {
        const lowerCaseQuery = query.toLowerCase();
        searchResults = allVideoData.filter(video =>
            video.ttl.toLowerCase().includes(lowerCaseQuery)
        );
        renderVideos(searchResults, searchResultsCarousel);
        currentSearchIndex = 0; // Reset focus to first result
        updateSearchFocus(); // Update focus based on new results
    }

    // Handle input changes in the search field
    searchInput.addEventListener('input', () => {
        filterVideos(searchInput.value);
    });

    // --- Remote Key Presses ---
    document.addEventListener('keydown', (event) => {
        const keyCode = event.keyCode;
        console.log("Key pressed:", keyCode);

        event.preventDefault(); // Prevent default browser actions

        // If player is open, only allow 'escape' or 'back' key to close it
        if (playerOverlay.style.display === 'flex') {
            if (keyCode === 27 || keyCode === 461 || keyCode === 4 || keyCode === 10009) {
                closeVideoPlayer();
            }
            return;
        }

        // If search overlay is open
        if (searchOverlay.style.display === 'flex') {
            const searchItems = searchResultsCarousel.querySelectorAll('.video-item');
            switch (keyCode) {
                case 37: // Left arrow
                    if (document.activeElement === searchInput) {
                        // If on input, do nothing or move cursor in input
                    } else if (currentSearchIndex > 0) {
                        searchItems[currentSearchIndex].classList.remove('focused');
                        currentSearchIndex--;
                        searchItems[currentSearchIndex].classList.add('focused');
                        scrollToCenterFocusedItem(searchResultsCarousel, currentSearchIndex);
                    } else {
                        // If at first item, move focus to search input
                        removeAllFocus();
                        searchInput.focus();
                    }
                    break;
                case 39: // Right arrow
                    if (document.activeElement === searchInput && searchResults.length > 0) {
                        // If on input, move focus to first search result
                        removeAllFocus();
                        currentSearchIndex = 0;
                        searchItems[currentSearchIndex].classList.add('focused');
                        scrollToCenterFocusedItem(searchResultsCarousel, currentSearchIndex);
                    } else if (currentSearchIndex < searchResults.length - 1) {
                        searchItems[currentSearchIndex].classList.remove('focused');
                        currentSearchIndex++;
                        searchItems[currentSearchIndex].classList.add('focused');
                        scrollToCenterFocusedItem(searchResultsCarousel, currentSearchIndex);
                    }
                    break;
                case 38: // Up arrow
                    if (document.activeElement !== searchInput) {
                        // If not on input, try to move up to input or previous row
                        const itemsPerRow = Math.floor(searchResultsCarousel.offsetWidth / TOTAL_ITEM_WIDTH);
                        if (currentSearchIndex - itemsPerRow >= 0) {
                            searchItems[currentSearchIndex].classList.remove('focused');
                            currentSearchIndex -= itemsPerRow;
                            searchItems[currentSearchIndex].classList.add('focused');
                            scrollToCenterFocusedItem(searchResultsCarousel, currentSearchIndex);
                        } else {
                            // Move focus to search input if not enough items above
                            removeAllFocus();
                            searchInput.focus();
                        }
                    }
                    break;
                case 40: // Down arrow
                    if (document.activeElement === searchInput) {
                        // If on input, move focus to first search result
                        if (searchResults.length > 0) {
                            removeAllFocus();
                            currentSearchIndex = 0;
                            searchItems[currentSearchIndex].classList.add('focused');
                            scrollToCenterFocusedItem(searchResultsCarousel, currentSearchIndex);
                        }
                    } else if (currentSearchIndex + NUM_ITEMS_PER_VISIBLE_SCREEN < searchResults.length) {
                        // Move down by a full row
                        searchItems[currentSearchIndex].classList.remove('focused');
                        currentSearchIndex += NUM_ITEMS_PER_VISIBLE_SCREEN;
                        searchItems[currentSearchIndex].classList.add('focused');
                        scrollToCenterFocusedItem(searchResultsCarousel, currentSearchIndex);
                    } else if (currentSearchIndex < searchResults.length - 1) {
                        // If not a full row, move to the last item in the current "visual" row
                        searchItems[currentSearchIndex].classList.remove('focused');
                        currentSearchIndex = searchResults.length - 1;
                        searchItems[currentSearchIndex].classList.add('focused');
                        scrollToCenterFocusedItem(searchResultsCarousel, currentSearchIndex);
                    }
                    break;
                case 13: // Enter/Select
                    if (document.activeElement === searchInput) {
                        filterVideos(searchInput.value); // Re-trigger search on enter
                    } else if (searchResults.length > 0 && currentSearchIndex < searchResults.length) {
                        const focusedVideoLink = searchResults[currentSearchIndex].lnk; // Use searchResults array
                        playVideo(focusedVideoLink);
                    }
                    break;
                case 27: // Escape (Android TV back button often mapped here or keyCode 461)
                case 461: // Android TV back button often mapped to 461
                case 4:   // General 'Back' key on some devices
                case 10009: // Another common back/menu key
                    closeSearchOverlay();
                    break;
            }
            return; // Don't process main content keys
        }

        // Main Content and Sidebar Navigation
        if (focusMode === 'mainContent') {
            const currentCarousel = videoCarousels[currentSectionIndex];
            const videoItems = currentCarousel.querySelectorAll('.video-item');

            if (videoItems.length === 0) return;

            switch (keyCode) {
                case 37: // Left arrow
                    if (isSidebarOpen) {
                        focusMode = 'sidebar';
                        updateSidebarFocus();
                        sidebar.classList.add('open');
                        mainContent.style.marginLeft = '250px';
                    } else if (currentVideoIndexes[currentSectionIndex] > 0) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentVideoIndexes[currentSectionIndex]--;
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
                        scrollToCenterFocusedItem(currentCarousel, currentVideoIndexes[currentSectionIndex]);
                    } else { // At the first item, open sidebar
                        isSidebarOpen = true;
                        focusMode = 'sidebar';
                        currentSectionIndex = 0; // Default to HOME
                        updateSidebarFocus();
                        sidebar.classList.add('open');
                        mainContent.style.marginLeft = '250px';
                    }
                    break;
                case 39: // Right arrow
                    if (currentVideoIndexes[currentSectionIndex] < videoItems.length - 1) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentVideoIndexes[currentSectionIndex]++;
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
                        scrollToCenterFocusedItem(currentCarousel, currentVideoIndexes[currentSectionIndex]);
                    }
                    break;
                case 38: // Up arrow
                    if (currentSectionIndex > 0) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentSectionIndex--;
                        currentVideoIndexes[currentSectionIndex] = Math.min(
                            currentVideoIndexes[currentSectionIndex],
                            videoCarousels[currentSectionIndex].querySelectorAll('.video-item').length - 1
                        );
                        updateMainContentFocus();
                    }
                    break;
                case 40: // Down arrow
                    if (currentSectionIndex < videoCarousels.length - 1) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentSectionIndex++;
                        currentVideoIndexes[currentSectionIndex] = Math.min(
                            currentVideoIndexes[currentSectionIndex],
                            videoCarousels[currentSectionIndex].querySelectorAll('.video-item').length - 1
                        );
                        updateMainContentFocus();
                    }
                    break;
                case 13: // Enter/Select
                    const focusedVideoLink = videoItems[currentVideoIndexes[currentSectionIndex]].dataset.link;
                    playVideo(focusedVideoLink);
                    break;
            }
        } else if (focusMode === 'sidebar') {
            switch (keyCode) {
                case 39: // Right arrow
                    isSidebarOpen = false;
                    focusMode = 'mainContent';
                    sidebar.classList.remove('open');
                    mainContent.style.marginLeft = '0';
                    updateMainContentFocus();
                    break;
                case 38: // Up arrow
                    if (currentSectionIndex > 0) {
                        navItems[currentSectionIndex].classList.remove('active');
                        currentSectionIndex--;
                        updateSidebarFocus(); // Call update to handle search nav item specifically
                    }
                    break;
                case 40: // Down arrow
                    if (currentSectionIndex < navItems.length -1 ) { // -1 because search is the last item
                        navItems[currentSectionIndex].classList.remove('active');
                        currentSectionIndex++;
                        updateSidebarFocus(); // Call update to handle search nav item specifically
                    } else if (currentSectionIndex === navItems.length - 1) {
                        // Loop back to the first item if at the last (search)
                        navItems[currentSectionIndex].classList.remove('active');
                        currentSectionIndex = 0;
                        updateSidebarFocus();
                    }
                    break;
                case 13: // Enter/Select
                    const selectedSection = navItems[currentSectionIndex].dataset.section;
                    if (selectedSection === 'search') {
                        closeSearchOverlay(); // Close if accidentally open
                        openSearchOverlay();
                    } else {
                        console.log(`Navigating to section: ${selectedSection}`);
                        // Implement logic to switch content for other sidebar items here
                    }
                    break;
            }
        }
    });

    // Initial load
    loadVideos();
});