document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const videoCarousels = document.querySelectorAll('.video-carousel');

    let currentSectionIndex = 0; // 0 for Recommended, 1 for Continue Watching
    let currentVideoIndexes = Array.from(videoCarousels).map(() => 0); // Current focused video index per carousel
    let isSidebarOpen = false;
    let focusMode = 'mainContent'; // 'mainContent' or 'sidebar'

    // Constants for layout
    const VIDEO_ITEM_WIDTH = 300; // Must match CSS .video-item width
    const VIDEO_ITEM_GAP = 30;    // Must match CSS .video-carousel gap
    const TOTAL_ITEM_WIDTH = VIDEO_ITEM_WIDTH + VIDEO_ITEM_GAP;

    // Initialize focus
    function initializeFocus() {
        if (videoCarousels.length > 0) {
            const firstCarouselItems = videoCarousels[currentSectionIndex].querySelectorAll('.video-item');
            if (firstCarouselItems.length > 0) {
                firstCarouselItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
                // Adjust scroll so the first item is centered (or near center) initially
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
        navItems[currentSectionIndex].classList.add('active');
    }

    // New function to scroll the carousel so the focused item is centered
    function scrollToCenter(carousel, focusedIndex) {
        const carouselRect = carousel.getBoundingClientRect();
        const centerOffset = (carouselRect.width / 2) - (VIDEO_ITEM_WIDTH / 2);

        const targetScrollLeft = (focusedIndex * TOTAL_ITEM_WIDTH) - centerOffset;

        carousel.scrollLeft = targetScrollLeft;
    }

    // Handle remote key presses
    document.addEventListener('keydown', (event) => {
        const keyCode = event.keyCode;
        console.log("Key pressed:", keyCode);

        // Prevent default browser scrolling
        event.preventDefault();

        if (focusMode === 'mainContent') {
            const currentCarousel = videoCarousels[currentSectionIndex];
            const videoItems = currentCarousel.querySelectorAll('.video-item');

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
                        // If at the first item and sidebar is not open, open sidebar
                        isSidebarOpen = true;
                        focusMode = 'sidebar';
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
                    console.log(`Playing video: ${videoItems[currentVideoIndexes[currentSectionIndex]].querySelector('.video-title').textContent}`);
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
                    console.log(`Navigating to section: ${navItems[currentSectionIndex].dataset.section}`);
                    break;
            }
        }
    });

    // Initial focus setup
    initializeFocus();
});