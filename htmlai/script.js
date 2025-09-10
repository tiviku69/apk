document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const videoCarousels = document.querySelectorAll('.video-carousel');

    let currentSectionIndex = 0; // 0 for Recommended, 1 for Continue Watching
    let currentVideoIndexes = Array.from(videoCarousels).map(() => 0); // Current focused video index per carousel
    let isSidebarOpen = false;
    let focusMode = 'mainContent'; // 'mainContent' or 'sidebar'

    // Initialize focus
    function initializeFocus() {
        if (videoCarousels.length > 0) {
            const firstCarouselItems = videoCarousels[currentSectionIndex].querySelectorAll('.video-item');
            if (firstCarouselItems.length > 0) {
                firstCarouselItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
                scrollToFocused(videoCarousels[currentSectionIndex], firstCarouselItems[currentVideoIndexes[currentSectionIndex]]);
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
            scrollToFocused(currentCarousel, currentItems[currentVideoIndexes[currentSectionIndex]]);
        }
    }

    function updateSidebarFocus() {
        removeAllFocus();
        navItems[currentSectionIndex].classList.add('active');
    }

    function scrollToFocused(carousel, focusedItem) {
        const itemRect = focusedItem.getBoundingClientRect();
        const carouselRect = carousel.getBoundingClientRect();

        // Calculate the scroll position to keep the focused item near the left
        const scrollLeft = focusedItem.offsetLeft - (carouselRect.width / 2) + (itemRect.width / 2);
        carousel.scrollLeft = scrollLeft;
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
                        // If sidebar is open, move focus to sidebar
                        focusMode = 'sidebar';
                        updateSidebarFocus();
                        sidebar.classList.add('open');
                        mainContent.classList.add('sidebar-open-margin'); // Add margin to main content
                    } else if (currentVideoIndexes[currentSectionIndex] > 0) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentVideoIndexes[currentSectionIndex]--;
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
                        scrollToFocused(currentCarousel, videoItems[currentVideoIndexes[currentSectionIndex]]);
                    } else {
                        // If at the first item, open sidebar
                        isSidebarOpen = true;
                        focusMode = 'sidebar';
                        updateSidebarFocus();
                        sidebar.classList.add('open');
                        mainContent.style.marginLeft = '250px'; // Shift main content
                    }
                    break;
                case 39: // Right arrow
                    if (currentVideoIndexes[currentSectionIndex] < videoItems.length - 1) {
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.remove('focused');
                        currentVideoIndexes[currentSectionIndex]++;
                        videoItems[currentVideoIndexes[currentSectionIndex]].classList.add('focused');
                        scrollToFocused(currentCarousel, videoItems[currentVideoIndexes[currentSectionIndex]]);
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
                    // Simulate clicking the focused video
                    console.log(`Playing video: ${videoItems[currentVideoIndexes[currentSectionIndex]].querySelector('.video-title').textContent}`);
                    // Add actual video playback logic here
                    break;
            }
        } else if (focusMode === 'sidebar') {
            switch (keyCode) {
                case 39: // Right arrow
                    // Close sidebar and move focus back to main content
                    isSidebarOpen = false;
                    focusMode = 'mainContent';
                    sidebar.classList.remove('open');
                    mainContent.style.marginLeft = '0'; // Reset main content position
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
                    // Simulate clicking the focused sidebar item
                    console.log(`Navigating to section: ${navItems[currentSectionIndex].dataset.section}`);
                    // Add actual navigation logic here (e.g., load different content)
                    break;
            }
        }
    });

    // Initial focus setup
    initializeFocus();
});