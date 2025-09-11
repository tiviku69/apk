document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    const videoRows = document.querySelectorAll('.video-row');

    let currentFocusedElement = null; // To keep track of the currently focused element
    let activeRowIndex = 0; // Index of the current active video row
    let activeVideoCardIndex = 0; // Index of the current active card in the row

    // --- Helper Functions ---

    function setFocus(element) {
        if (currentFocusedElement) {
            currentFocusedElement.classList.remove('active');
        }
        element.focus();
        element.classList.add('active');
        currentFocusedElement = element;
    }

    function scrollRowToCenter(rowElement, cardIndex) {
        const videoCards = Array.from(rowElement.children);
        if (videoCards.length === 0) return;

        const cardWidth = videoCards[0].offsetWidth + 20; // Card width + margin-right
        const containerWidth = rowElement.offsetWidth;

        // Calculate the scroll position to center the card
        // We want the focused card's left edge to be at (containerWidth / 2) - (cardWidth / 2)
        const scrollOffset = (cardIndex * cardWidth) - (containerWidth / 2) + (cardWidth / 2);

        rowElement.scrollLeft = Math.max(0, scrollOffset);
    }

    function initializeFocus() {
        if (sidebarItems.length > 0) {
            setFocus(sidebarItems[0]); // Start with sidebar focused
        }
        // If you prefer to start with video:
        // if (videoRows.length > 0 && videoRows[0].children.length > 0) {
        //     setFocus(videoRows[0].children[0]);
        //     scrollRowToCenter(videoRows[0], 0);
        // }
    }

    // --- Event Listener for Keyboard/Remote ---

    document.addEventListener('keydown', (event) => {
        event.preventDefault(); // Prevent default browser actions (like scrolling)

        const focusedElement = document.activeElement;

        // --- Sidebar Navigation ---
        if (focusedElement.closest('.sidebar')) {
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
                    // Move to the first video card of the current active row
                    if (videoRows.length > 0) {
                        const targetRow = videoRows[activeRowIndex];
                        if (targetRow && targetRow.children.length > 0) {
                            // Ensure activeVideoCardIndex is valid for the target row
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
                        // Move to sidebar if at the beginning of the row
                        if (sidebarItems.length > 0) {
                            setFocus(sidebarItems[0]); // You might want to focus on the active sidebar item
                        }
                    }
                    break;
                case 'ArrowDown':
                    if (currentRowIndexInSections < videoRows.length - 1) {
                        activeRowIndex = currentRowIndexInSections + 1;
                        const nextRow = videoRows[activeRowIndex];
                        // Ensure activeVideoCardIndex is valid for the next row
                        activeVideoCardIndex = Math.min(activeVideoCardIndex, nextRow.children.length - 1);
                        if (nextRow.children.length > 0) {
                            setFocus(nextRow.children[activeVideoCardIndex]);
                            scrollRowToCenter(nextRow, activeVideoCardIndex);
                        }
                        // Scroll the main content to bring the new row into view if it's far down
                        nextRow.closest('.video-sections').scrollTop = nextRow.offsetTop - 100; // Adjust offset as needed
                    }
                    break;
                case 'ArrowUp':
                    if (currentRowIndexInSections > 0) {
                        activeRowIndex = currentRowIndexInSections - 1;
                        const prevRow = videoRows[activeRowIndex];
                        // Ensure activeVideoCardIndex is valid for the previous row
                        activeVideoCardIndex = Math.min(activeVideoCardIndex, prevRow.children.length - 1);
                        if (prevRow.children.length > 0) {
                            setFocus(prevRow.children[activeVideoCardIndex]);
                            scrollRowToCenter(prevRow, activeVideoCardIndex);
                        }
                        // Scroll the main content to bring the new row into view
                        prevRow.closest('.video-sections').scrollTop = prevRow.offsetTop - 100;
                    } else {
                        // Move to sidebar if at the first row
                        if (sidebarItems.length > 0) {
                            setFocus(sidebarItems[0]); // Focus on the first sidebar item (Home)
                        }
                    }
                    break;
            }
        } else {
            // If no specific element is focused (e.g., initial load or lost focus),
            // move focus to the default starting point.
            initializeFocus();
        }
    });

    // Initial focus when the page loads
    initializeFocus();
});