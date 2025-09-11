document.addEventListener('DOMContentLoaded', () => {
    const videoRows = document.querySelectorAll('.video-row');
    let currentRowIndex = 0; // Index of the currently focused row
    let currentItemIndexes = Array.from(videoRows).map(() => 0); // Array to store focused item index for each row

    // Set initial focus on the first item of the first row
    if (videoRows.length > 0 && videoRows[0].children.length > 0) {
        videoRows[0].children[0].focus();
        updateRowScroll(videoRows[0], 0);
    }

    // Function to scroll the row to center the focused item
    function updateRowScroll(rowElement, itemIndex) {
        const itemWidth = rowElement.children[itemIndex].offsetWidth + 20; // Item width + margin
        const containerWidth = rowElement.offsetWidth;
        const scrollPosition = (itemIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
        rowElement.scrollLeft = scrollPosition;
    }

    document.addEventListener('keydown', (event) => {
        const focusedElement = document.activeElement;
        const currentFocusedRow = focusedElement.closest('.video-row');

        if (!currentFocusedRow && !focusedElement.closest('.sidebar')) {
            // If no specific element is focused, focus on the first item of the first row
            if (videoRows.length > 0 && videoRows[0].children.length > 0) {
                videoRows[0].children[0].focus();
                updateRowScroll(videoRows[0], 0);
            }
            return;
        }

        if (focusedElement.closest('.sidebar')) {
            // Handle sidebar navigation
            const sidebarItems = document.querySelectorAll('.sidebar ul li');
            let sidebarFocusIndex = Array.from(sidebarItems).indexOf(focusedElement.closest('li'));

            switch (event.key) {
                case 'ArrowDown':
                    if (sidebarFocusIndex < sidebarItems.length - 1) {
                        sidebarItems[sidebarFocusIndex + 1].focus();
                    } else {
                        // Move to the first video item of the first row
                        if (videoRows.length > 0 && videoRows[0].children.length > 0) {
                            videoRows[0].children[0].focus();
                            currentRowIndex = 0;
                            updateRowScroll(videoRows[0], currentItemIndexes[0]);
                        }
                    }
                    event.preventDefault();
                    break;
                case 'ArrowUp':
                    if (sidebarFocusIndex > 0) {
                        sidebarItems[sidebarFocusIndex - 1].focus();
                    }
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    // Move from sidebar to the first video item of the first row
                    if (videoRows.length > 0 && videoRows[0].children.length > 0) {
                        videoRows[0].children[0].focus();
                        currentRowIndex = 0;
                        updateRowScroll(videoRows[0], currentItemIndexes[0]);
                    }
                    event.preventDefault();
                    break;
            }
            return;
        }

        // Handle video row navigation
        const itemsInCurrentRow = Array.from(currentFocusedRow.children);
        const currentItemIndex = itemsInCurrentRow.indexOf(focusedElement);
        const currentActiveRowIndex = Array.from(videoRows).indexOf(currentFocusedRow);

        switch (event.key) {
            case 'ArrowRight':
                if (currentItemIndex < itemsInCurrentRow.length - 1) {
                    itemsInCurrentRow[currentItemIndex + 1].focus();
                    currentItemIndexes[currentActiveRowIndex]++;
                    updateRowScroll(currentFocusedRow, currentItemIndexes[currentActiveRowIndex]);
                }
                event.preventDefault();
                break;
            case 'ArrowLeft':
                if (currentItemIndex > 0) {
                    itemsInCurrentRow[currentItemIndex - 1].focus();
                    currentItemIndexes[currentActiveRowIndex]--;
                    updateRowScroll(currentFocusedRow, currentItemIndexes[currentActiveRowIndex]);
                } else if (currentItemIndex === 0) {
                    // If at the first item, move to sidebar
                    const sidebarHome = document.querySelector('.sidebar ul li.active');
                    if (sidebarHome) {
                        sidebarHome.focus();
                    }
                }
                event.preventDefault();
                break;
            case 'ArrowDown':
                if (currentActiveRowIndex < videoRows.length - 1) {
                    currentRowIndex++;
                    const nextRow = videoRows[currentRowIndex];
                    let nextItemIndex = currentItemIndexes[currentRowIndex] || 0;
                    if (nextItemIndex >= nextRow.children.length) {
                        nextItemIndex = nextRow.children.length - 1;
                    }
                    if (nextRow.children.length > 0) {
                        nextRow.children[nextItemIndex].focus();
                        currentItemIndexes[currentRowIndex] = nextItemIndex;
                        updateRowScroll(nextRow, nextItemIndex);
                    }
                }
                event.preventDefault();
                break;
            case 'ArrowUp':
                if (currentActiveRowIndex > 0) {
                    currentRowIndex--;
                    const prevRow = videoRows[currentRowIndex];
                    let prevItemIndex = currentItemIndexes[currentRowIndex] || 0;
                    if (prevItemIndex >= prevRow.children.length) {
                        prevItemIndex = prevRow.children.length - 1;
                    }
                    if (prevRow.children.length > 0) {
                        prevRow.children[prevItemIndex].focus();
                        currentItemIndexes[currentRowIndex] = prevItemIndex;
                        updateRowScroll(prevRow, prevItemIndex);
                    }
                } else {
                    // If at the first row, move to sidebar (e.g., "HOME")
                    const sidebarHome = document.querySelector('.sidebar ul li.active');
                    if (sidebarHome) {
                        sidebarHome.focus();
                    }
                }
                event.preventDefault();
                break;
        }
    });

    // Initial focus for sidebar (optional, you might want to start on a video)
    const initialSidebarFocus = document.querySelector('.sidebar ul li.active');
    if (initialSidebarFocus) {
        // initialSidebarFocus.focus(); // Uncomment to start focus on sidebar
    }
});