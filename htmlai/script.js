document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    let videoCarousels = document.querySelectorAll('.video-carousel');
    let allVideoData = [];

    let currentSectionIndex = 0;
    let currentVideoIndexes = []; // Current focused video index within its carousel
    let isSidebarOpen = false;
    let focusMode = 'mainContent'; // 'mainContent' or 'sidebar'

    // Constants for layout (MUST match CSS)
    const NUM_ITEMS_PER_PAGE = 4; // Number of video items visible in one "page"
    const VIDEO_ITEM_WIDTH = 280; // Width of a single video item
    const VIDEO_ITEM_GAP = 30;    // Gap between video items
    const TOTAL_ITEM_WIDTH = VIDEO_ITEM_WIDTH + VIDEO_ITEM_GAP;

    // Player elements
    const playerOverlay = document.getElementById('playerOverlay');
    const hlsVideoPlayer = document.getElementById('hlsVideoPlayer');
    const closePlayerButton = document.getElementById('closePlayer');
    let hlsInstance = null; // To store the HLS.js instance

    // --- Video Loading and Rendering ---
    async function loadVideos() {
        try {
            const response = await fetch('cmpr.json');
            allVideoData = await response.json();

            const recommendedCarousel = document.getElementById('recommended-carousel');
            const continueWatchingCarousel = document.getElementById('continue-watching-carousel');

            renderVideos(allVideoData, recommendedCarousel);
            // Example: For continue watching, you might want a subset or different videos
            renderVideos(allVideoData.slice(2, 6), continueWatchingCarousel);

            videoCarousels = document.querySelectorAll('.video-carousel');
            currentVideoIndexes = Array.from(videoCarousels).map(() => 0); // Initialize focus for each carousel

            initializeFocus();

        } catch (error) {
            console.error('Error loading video data:', error);
            // Fallback for demonstration if JSON fails
            // renderVideos(dummyVideoData, recommendedCarousel);
            // renderVideos(dummyVideoData.slice(2, 4), continueWatchingCarousel);
            // videoCarousels = document.querySelectorAll('.video-carousel');
            // currentVideoIndexes = Array.from(videoCarousels).map(() => 0);
            // initializeFocus();
        }
    }

    function renderVideos(videos, carouselElement) {
        carouselElement.innerHTML = '';
        videos.forEach((video, index) => {
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');
            videoItem.dataset.link = video.lnk;
            // No need for video.meta directly as per JSON, but if you want to add
            // a custom meta field (e.g., "views • age"), you can add it here.
            // videoItem.dataset.meta = "Some meta info";

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
                scrollToPage(videoCarousels[currentSectionIndex], currentVideoIndexes[currentSectionIndex]);
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
            scrollToPage(currentCarousel, currentVideoIndexes[currentSectionIndex]);
        }
    }

    function updateSidebarFocus() {
        removeAllFocus();
        if (currentSectionIndex < navItems.length) {
            navItems[currentSectionIndex].classList.add('active');
        } else {
            navItems[0].classList.add('active');
            currentSectionIndex = 0;
        }
    }

    // --- Scrolling Logic ---
    // Scrolls the carousel to show the page where the focused item is
    function scrollToPage(carousel, focusedIndex) {
        const pageNumber = Math.floor(focusedIndex / NUM_ITEMS_PER_PAGE);
        const targetScrollLeft = pageNumber * (NUM_ITEMS_PER_PAGE * TOTAL_ITEM_WIDTH);
        carousel.scrollLeft = targetScrollLeft;
    }

    // --- Player Functions ---
    function playVideo(link) {
        playerOverlay.style.display = 'flex'; // Show the player overlay

        if (hlsInstance) {
            hlsInstance.destroy(); // Destroy previous HLS instance if any
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
            hlsInstance.destroy(); // Clean up HLS.js
            hlsInstance = null;
        }
        hlsVideoPlayer.pause();
        hlsVideoPlayer.src = ""; // Clear source
        hlsVideoPlayer.load(); // Reload to clear player state
        playerOverlay.style.display = 'none';
    }

    // Event listener for close button
    closePlayerButton.addEventListener('click', closeVideoPlayer);


    // --- Remote Key Presses ---
    document.addEventListener('keydown', (event) => {
        const keyCode = event.keyCode;
        console.log("Key pressed:", keyCode);

        event.preventDefault(); // Prevent default browser actions

        // If player is open, only allow 'escape' or 'back' key to close it
        if (playerOverlay.style.display === 'flex') {
            if (keyCode === 27 || keyCode === 461 || keyCode === 4 || keyCode === 10009) { // Escape, Back on Android TV, Back/Menu key on some remotes
                closeVideoPlayer();
            }
            return; // Don't process other keys while player is open
        }

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
                        scrollToPage(currentCarousel, currentVideoIndexes[currentSectionIndex]);
                    } else { // At the first item, open sidebar
                        isSidebarOpen = true;
                        focusMode = 'sidebar';
                        currentSectionIndex = 0; // Assuming 'HOME' is the first sidebar item
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
                        scrollToPage(currentCarousel, currentVideoIndexes[currentSectionIndex]);
                    }
                    break;
                case 38: // Up arrow
                    if (currentSectionIndex > 0) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentSectionIndex--;
                        // Adjust currentVideoIndexes[currentSectionIndex] to align with new row
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
                         // Adjust currentVideoIndexes[currentSectionIndex] to align with new row
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
                        navItems[currentSectionIndex].classList.add('active');
                    }
                    break;
                case 40: // Down arrow
                    if (currentSectionIndex < navItems.length - 1) {
                        navItems[currentSectionIndex].classList.remove('active');
                        currentSectionIndex++;
                        navItems[currentSectionIndex].classList.add('active');
                    }
                    break;
                case 13: // Enter/Select
                    const selectedSection = navItems[currentSectionIndex].dataset.section;
                    console.log(`Navigating to section: ${selectedSection}`);
                    // You would typically load different content here
                    break;
            }
        }
    });

    // Initial load
    loadVideos();
});