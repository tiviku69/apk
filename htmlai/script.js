document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const pages = document.querySelectorAll('.page');
    const cards = document.querySelectorAll('.card');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    let currentFocusedElement = null;
    let focusScope = 'sidebar'; // Can be 'sidebar', 'content-row-X', 'modal'

    const videoPlayerModal = document.getElementById('video-player-modal');
    const closeButton = videoPlayerModal.querySelector('.close-button');
    const currentVideoIdSpan = document.getElementById('current-video-id');
    const placeholderVideo = document.getElementById('placeholder-video');

    function setFocus(element) {
        if (currentFocusedElement) {
            currentFocusedElement.classList.remove('focused');
        }
        currentFocusedElement = element;
        if (currentFocusedElement) {
            currentFocusedElement.classList.add('focused');
            currentFocusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }

    function switchPage(targetId) {
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        // After switching page, reset focus within the new page or sidebar
        if (targetId === 'home') {
            setFocus(document.querySelector('#home .card') || menuItems[0]);
            focusScope = 'content-row-0'; // Assume first row in home
        } else {
            setFocus(document.querySelector(`#${targetId} .focused`) || menuItems[0]);
            focusScope = 'sidebar';
        }
    }

    // Initialize: Set focus to the first menu item
    setFocus(menuItems[0]);

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.target;
            switchPage(targetId);
            setFocus(item); // Keep focus on the clicked menu item
            focusScope = 'sidebar';
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.dataset.videoId;
            if (videoId) {
                openVideoPlayer(videoId);
            }
        });
    });

    closeButton.addEventListener('click', closeVideoPlayer);
    window.addEventListener('click', (event) => {
        if (event.target == videoPlayerModal) {
            closeVideoPlayer();
        }
    });

    function openVideoPlayer(videoId) {
        currentVideoIdSpan.textContent = videoId;
        // In a real app, you would load the actual video player here
        // For now, just show the placeholder
        placeholderVideo.src = `https://via.placeholder.com/640x360?text=Playing+Video+${videoId}`;
        videoPlayerModal.classList.add('active');
        focusScope = 'modal';
        setFocus(closeButton); // Focus on close button when modal opens
    }

    function closeVideoPlayer() {
        videoPlayerModal.classList.remove('active');
        // Return focus to the element that was focused before opening the modal
        if (currentFocusedElement) {
            setFocus(currentFocusedElement);
        } else {
            setFocus(menuItems[0]);
            focusScope = 'sidebar';
        }
    }

    // --- Keyboard Navigation for Android TV Remote Simulation ---
    document.addEventListener('keydown', (event) => {
        const key = event.key; // For physical keyboard
        const keyCode = event.keyCode; // For Android TV key codes

        let handled = false;

        if (focusScope === 'modal') {
            // Handle navigation within the modal (e.g., close button)
            if (key === 'Enter' || keyCode === 66 || keyCode === 13) { // Enter or Back (Android TV)
                closeVideoPlayer();
                handled = true;
            }
        } else if (focusScope === 'sidebar') {
            const currentIndex = Array.from(menuItems).indexOf(currentFocusedElement);
            if (key === 'ArrowDown' || keyCode === 20) { // Down arrow
                if (currentIndex < menuItems.length - 1) {
                    setFocus(menuItems[currentIndex + 1]);
                    handled = true;
                }
            } else if (key === 'ArrowUp' || keyCode === 19) { // Up arrow
                if (currentIndex > 0) {
                    setFocus(menuItems[currentIndex - 1]);
                    handled = true;
                }
            } else if (key === 'ArrowRight' || keyCode === 21) { // Right arrow
                // Move focus to content area if on a page that has focusable content
                const activePage = document.querySelector('.page.active');
                if (activePage && activePage.id === 'home') {
                    const firstCard = activePage.querySelector('.card');
                    if (firstCard) {
                        setFocus(firstCard);
                        focusScope = 'content-row-0'; // Assume first row
                        handled = true;
                    }
                }
            } else if (key === 'Enter' || keyCode === 23 || keyCode === 66) { // Enter or Select (Android TV) or Back
                currentFocusedElement.click(); // Simulate click on the focused menu item
                handled = true;
            }
        } else if (focusScope.startsWith('content-row-')) {
            const currentRowIndex = parseInt(focusScope.split('-')[2]);
            const rows = document.querySelectorAll('.content .row');
            if (!rows[currentRowIndex]) return;

            const currentCardsInRow = Array.from(rows[currentRowIndex].querySelectorAll('.card'));
            const currentIndexInRow = currentCardsInRow.indexOf(currentFocusedElement);

            if (key === 'ArrowRight' || keyCode === 22) { // Right arrow
                if (currentIndexInRow < currentCardsInRow.length - 1) {
                    setFocus(currentCardsInRow[currentIndexInRow + 1]);
                    handled = true;
                }
            } else if (key === 'ArrowLeft' || keyCode === 21) { // Left arrow
                if (currentIndexInRow > 0) {
                    setFocus(currentCardsInRow[currentIndexInRow - 1]);
                    handled = true;
                } else {
                    // Move focus back to sidebar
                    setFocus(menuItems.find(item => item.dataset.target === document.querySelector('.page.active').id) || menuItems[0]);
                    focusScope = 'sidebar';
                    handled = true;
                }
            } else if (key === 'ArrowDown' || keyCode === 20) { // Down arrow
                if (currentRowIndex < rows.length - 1) {
                    const nextRow = rows[currentRowIndex + 1];
                    const firstCardInNextRow = nextRow.querySelector('.card');
                    if (firstCardInNextRow) {
                        setFocus(firstCardInNextRow);
                        focusScope = `content-row-${currentRowIndex + 1}`;
                        handled = true;
                    }
                }
            } else if (key === 'ArrowUp' || keyCode === 19) { // Up arrow
                if (currentRowIndex > 0) {
                    const prevRow = rows[currentRowIndex - 1];
                    const firstCardInPrevRow = prevRow.querySelector('.card');
                    if (firstCardInPrevRow) {
                        setFocus(firstCardInPrevRow);
                        focusScope = `content-row-${currentRowIndex - 1}`;
                        handled = true;
                    }
                } else {
                    // If at the top row, move focus back to sidebar
                    setFocus(menuItems.find(item => item.dataset.target === document.querySelector('.page.active').id) || menuItems[0]);
                    focusScope = 'sidebar';
                    handled = true;
                }
            } else if (key === 'Enter' || keyCode === 23) { // Enter or Select (Android TV)
                currentFocusedElement.click(); // Simulate click on the focused card
                handled = true;
            }
        }

        if (handled) {
            event.preventDefault(); // Prevent default browser behavior (e.g., scrolling)
        }
    });

    // Helper to identify Android TV remote key codes
    // You can find a comprehensive list online, but common ones are:
    // Up: 19, Down: 20, Left: 21, Right: 22, Enter/Select: 23, Back: 4 (or 66 on some devices), Menu: 82
});