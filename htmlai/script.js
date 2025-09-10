document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    let videoCarousels = document.querySelectorAll('.video-carousel'); // Make it changeable as we'll re-query
    let allVideoData = []; // To store all loaded video data

    let currentSectionIndex = 0;
    let currentVideoIndexes = []; // Initialize after data load
    let isSidebarOpen = false;
    let focusMode = 'mainContent';

    const VIDEO_ITEM_WIDTH = 300;
    const VIDEO_ITEM_GAP = 30;
    const TOTAL_ITEM_WIDTH = VIDEO_ITEM_WIDTH + VIDEO_ITEM_GAP;

    // Function to fetch video data and render it
    async function loadVideos() {
        try {
            const response = await fetch('cmpr.json'); // Path to your JSON file
            allVideoData = await response.json();

            // For demonstration, let's put all videos into both carousels for now.
            // In a real app, you'd filter/categorize them for different sections.
            const recommendedCarousel = document.getElementById('recommended-carousel');
            const continueWatchingCarousel = document.getElementById('continue-watching-carousel');

            renderVideos(allVideoData, recommendedCarousel);
            // Example: For continue watching, you might want a subset or different videos
            renderVideos(allVideoData.slice(2, 6), continueWatchingCarousel); // Just a slice for example

            // Re-query carousels after they are populated
            videoCarousels = document.querySelectorAll('.video-carousel');
            currentVideoIndexes = Array.from(videoCarousels).map(() => 0); // Re-initialize after carousels are ready

            initializeFocus();

        } catch (error) {
            console.error('Error loading video data:', error);
        }
    }

    // Function to render video items into a given carousel element
    function renderVideos(videos, carouselElement) {
        carouselElement.innerHTML = ''; // Clear existing content
        videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');
            videoItem.dataset.link = video.lnk; // Store the video link

            videoItem.innerHTML = `
                <img src="${video.logo}" alt="Video Thumbnail" class="thumbnail">
                <div class="duration">${video.dur}</div>
                <div class="video-title">${video.ttl}</div>
                <div class="video-meta"></div> `;
            // Add a badge if 'tiviku' is 'apk' or some other condition
            if (video.tiviku === 'apk') {
                 const badge = document.createElement('div');
                 badge.classList.add('badge');
                 badge.textContent = 'APK'; // Or 'New' or 'Premium'
                 videoItem.appendChild(badge);
            }
            carouselElement.appendChild(videoItem);
        });
    }

    function initializeFocus() {
        if (videoCarousels.length > 0) {
            const firstCarouselItems = videoCarousels[currentSectionIndex].querySelectorAll('.video-item');
            if (firstCarouselItems.length > 0) {
                firstCarouselItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
                scrollToCenter(videoCarousels[currentSectionIndex], currentVideoIndexes[currentSectionIndex]);
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
            scrollToCenter(currentCarousel, currentVideoIndexes[currentSectionIndex]);
        }
    }

    function updateSidebarFocus() {
        removeAllFocus();
        // Ensure currentSectionIndex is within bounds for navItems
        if (currentSectionIndex < navItems.length) {
            navItems[currentSectionIndex].classList.add('active');
        } else {
            // Fallback or adjust currentSectionIndex if it's out of bounds for sidebar
            navItems[0].classList.add('active');
            currentSectionIndex = 0; // Reset for sidebar navigation
        }
    }

    function scrollToCenter(carousel, focusedIndex) {
        const carouselRect = carousel.getBoundingClientRect();
        const centerOffset = (carouselRect.width / 2) - (VIDEO_ITEM_WIDTH / 2);

        const targetScrollLeft = (focusedIndex * TOTAL_ITEM_WIDTH) - centerOffset;

        // Ensure scrollLeft doesn't go below 0
        carousel.scrollLeft = Math.max(0, targetScrollLeft);
    }

    // Handle remote key presses
    document.addEventListener('keydown', (event) => {
        const keyCode = event.keyCode;
        console.log("Key pressed:", keyCode);

        event.preventDefault();

        if (focusMode === 'mainContent') {
            const currentCarousel = videoCarousels[currentSectionIndex];
            const videoItems = currentCarousel.querySelectorAll('.video-item');

            if (videoItems.length === 0) return; // No videos to navigate

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
                        scrollToCenter(currentCarousel, currentVideoIndexes[currentSectionIndex]);
                    } else {
                        isSidebarOpen = true;
                        focusMode = 'sidebar';
                        // When opening sidebar from first item, ensure sidebar active item is aligned
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
                        scrollToCenter(currentCarousel, currentVideoIndexes[currentSectionIndex]);
                    }
                    break;
                case 38: // Up arrow
                    if (currentSectionIndex > 0) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentSectionIndex--;
                        updateMainContentFocus();
                    }
                    break;
                case 40: // Down arrow
                    if (currentSectionIndex < videoCarousels.length - 1) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentSectionIndex++;
                        updateMainContentFocus();
                    }
                    break;
                case 13: // Enter/Select
                    const focusedVideoLink = videoItems[currentVideoIndexes[currentSectionIndex]].dataset.link;
                    console.log(`Playing video from link: ${focusedVideoLink}`);
                    // Here you would integrate a video player (e.g., HTML5 video, HLS.js for .m3u8)
                    // For example:
                    // window.location.href = focusedVideoLink; // This would navigate away
                    // Or, if you have a video player element:
                    // const player = document.getElementById('myVideoPlayer');
                    // player.src = focusedVideoLink;
                    // player.play();
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
                    // Here you'd implement logic to change the content shown based on sidebar selection
                    // For now, it just logs.
                    break;
            }
        }
    });

    // Call loadVideos to start the process
    loadVideos();
});