document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    const videoRows = document.querySelectorAll('.video-row');

    let currentFocusedElement = null;
    let activeRowIndex = 0;
    let activeVideoCardIndex = 0;

    let isSidebarOpen = false; // Track sidebar state

    // --- Helper Functions ---

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

    function initializeFocus() {
        toggleSidebar(false); // Ensure sidebar is closed initially

        // Start focus on the first video card
        if (videoRows.length > 0 && videoRows[0].children.length > 0) {
            setFocus(videoRows[0].children[0]);
            scrollRowToCenter(videoRows[0], 0);
        } else if (sidebarItems.length > 0) {
            // Fallback: If no videos, focus sidebar
            setFocus(sidebarItems[0]);
            toggleSidebar(true); // Open sidebar if starting focus there
        }
    }

    // --- Event Listener for Keyboard/Remote ---

    document.addEventListener('keydown', (event) => {
        event.preventDefault();

        const focusedElement = document.activeElement;

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
                    // Close sidebar and move focus to video content
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
            const currentRowIndexInSections = Array.from(document.querySelectorAll('.video-row-container')).indexOf(currentRowContainer);

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
                        // At the first item of a row, open the sidebar
                        toggleSidebar(true);
                        setFocus(sidebarItems[0]); // Focus on the first sidebar item
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
                    } else {
                        // If at the first row and trying to go up, do nothing or focus header if desired
                    }
                    break;
            }
        } else {
            // Fallback for when focus is lost or at the very beginning
            initializeFocus();
        }
    });

    // Initial focus when the page loads
    initializeFocus();
});