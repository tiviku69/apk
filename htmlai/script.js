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
    // NUM_ITEMS_PER_PAGE is no longer directly used for scrolling logic, but still useful for conceptual understanding
    const NUM_ITEMS_PER_VISIBLE_SCREEN = 4; // Number of video items visible in one "page"
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
            renderVideos(allVideoData.slice(2, 6), continueWatchingCarousel);

            videoCarousels = document.querySelectorAll('.video-carousel');
            currentVideoIndexes = Array.from(videoCarousels).map(() => 0); // Initialize focus for each carousel

            initializeFocus();

        } catch (error) {
            console.error('Error loading video data:', error);
            // Consider adding dummy data or an error message to the UI here
        }
    }

    function renderVideos(videos, carouselElement) {
        carouselElement.innerHTML = '';
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
                // Use the new scrolling function
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
            // Use the new scrolling function
            scrollToCenterFocusedItem(currentCarousel, currentVideoIndexes[currentSectionIndex]);
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

    // --- Scrolling Logic (Updated) ---
    // Scrolls the carousel to keep the focused item near the center of the visible area
    function scrollToCenterFocusedItem(carousel, focusedIndex) {
        const carouselRect = carousel.getBoundingClientRect();
        // Calculate the position of the focused item's center
        const itemCenterPosition = focusedIndex * TOTAL_ITEM_WIDTH + (VIDEO_ITEM_WIDTH / 2);

        // Calculate the scroll position needed to bring this item's center to the carousel's view center
        const targetScrollLeft = itemCenterPosition - (carouselRect.width / 2);

        // Apply scroll, ensuring it doesn't go out of bounds
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


    // --- Remote Key Presses ---
    document.addEventListener('keydown', (event) => {
        const keyCode = event.keyCode;
        console.log("Key pressed:", keyCode);

        event.preventDefault();

        if (playerOverlay.style.display === 'flex') {
            if (keyCode === 27 || keyCode === 461 || keyCode === 4 || keyCode === 10009) {
                closeVideoPlayer();
            }
            return;
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
                        // Call the updated scrolling function
                        scrollToCenterFocusedItem(currentCarousel, currentVideoIndexes[currentSectionIndex]);
                    } else { // At the first item, open sidebar
                        isSidebarOpen = true;
                        focusMode = 'sidebar';
                        currentSectionIndex = 0;
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
                        // Call the updated scrolling function
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
                // ... kode lainnya
case 13: // Enter/Select
    const focusedVideoItem = videoItems[currentVideoIndexes[currentSectionIndex]];
    const focusedVideoData = focusedVideoItem.dataset;

    // Simpan data video ke sessionStorage
    sessionStorage.setItem('videoLink', focusedVideoData.link);
    sessionStorage.setItem('videoTitle', focusedVideoData.title); // Jika Anda memiliki judul
    sessionStorage.setItem('videoThumbnail', focusedVideoData.thumbnail); // Jika Anda memiliki gambar

    // Arahkan ke halaman ply.html
    window.location.href = 'ply.html';
    break;
// ... kode lainnya
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
                    break;
            }
        }
    });

    loadVideos();
});