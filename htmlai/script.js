document.addEventListener('DOMContentLoaded', () => {
    // Online/Offline status handler
    function updateOnlineStatus() {
        const offlineMessage = document.getElementById('offlineMessage');
        const mainContent = document.getElementById('main-content');
        if (navigator.onLine) {
            offlineMessage.style.display = 'none';
            mainContent.style.display = 'flex'; // Ensure main content is visible
            loadContent(); // Load content when online
        } else {
            offlineMessage.style.display = 'flex';
            mainContent.style.display = 'none'; // Hide main content when offline
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial status check
    updateOnlineStatus();

    const files = [
        'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json',
        'https://raw.githubusercontent.com/tiviku69/apk/main/captain.json',
        'https://raw.githubusercontent.com/tiviku69/apk/main/avat.json',
        'https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json',
        'https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json',
        'https://raw.githubusercontent.com/tiviku69/apk/main/squid.json',
        'https://raw.githubusercontent.com/tiviku69/apk/main/journey.json',
        'https://raw.githubusercontent.com/tiviku69/apk/main/one.json',
        'https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json'
    ];

    let allContent = []; // To store all loaded content for filtering
    const container = document.getElementById('container');

    async function loadContent() {
        if (!navigator.onLine) return; // Don't load if offline

        container.innerHTML = '<div class="loading-animation"></div>'; // Show loading spinner
        allContent = []; // Clear previous content

        let filesProcessed = 0;
        const totalFiles = files.length;

        for (const file of files) {
            try {
                const response = await fetch(file);
                const data = await response.json();
                allContent = allContent.concat(data); // Add to allContent array
            } catch (error) {
                console.error('Error loading JSON:', error);
            } finally {
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    displayContent(allContent); // Display all content after loading
                    // Highlight the first item after initial load
                    const firstDiv = document.querySelector('.responsive-div');
                    if (firstDiv) {
                        firstDiv.classList.add('highlight');
                        firstDiv.focus();
                    }
                }
            }
        }
    }

    function displayContent(contentArray) {
        container.innerHTML = ''; // Clear container before adding new content

        if (contentArray.length === 0) {
            container.innerHTML = '<p class="no-results">Tidak ada hasil ditemukan.</p>';
            return;
        }

        contentArray.forEach(item => {
            const dv = document.createElement('div');
            dv.className = 'responsive-div';
            dv.tabIndex = 0; // Make div focusable for keyboard navigation
            dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl);
            dv.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    playVideo(item.lnk, item.logo, item.ttl);
                }
            };

            const img = document.createElement('img');
            img.id = 'imgv';
            img.src = item.logo;
            img.alt = item.ttl;

            const cardInfo = document.createElement('div');
            cardInfo.className = 'card-info';

            const pp = document.createElement('p');
            pp.className = 're';
            pp.innerText = item.ttl;

            const dur = document.createElement('p');
            dur.className = 'dur';
            dur.innerText = item.dur;

            cardInfo.appendChild(pp);
            cardInfo.appendChild(dur);
            
            dv.appendChild(img);
            dv.appendChild(cardInfo);
            container.appendChild(dv);
        });
    }

    window.playVideo = function(videoFile, logoFile, textFile) {
        sessionStorage.setItem('videoLink', videoFile);
        sessionStorage.setItem('videoTitle', textFile);
        sessionStorage.setItem('logoFile', logoFile);
        window.location.href = 'ply.html';
    }

    window.prosesMenu = function() {
        const input = document.getElementById("cari");
        const filter = input.value.toLowerCase();
        
        const filteredContent = allContent.filter(item => {
            return item.ttl.toLowerCase().includes(filter);
        });
        displayContent(filteredContent);
    }

    document.getElementById("cari").addEventListener("input", prosesMenu);


    // Sidebar navigation logic
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const category = item.dataset.category;
            // In a real app, you'd load content based on category here.
            // For now, we'll just filter if needed or reload all.
            // If you have 'category' data in your JSON, you can filter `allContent` based on it.
            if (category === 'home') {
                displayContent(allContent);
            } else {
                // Example: Filter by category if your JSON had a 'category' field
                // const categoryFilteredContent = allContent.filter(item => item.category === category);
                // displayContent(categoryFilteredContent);
                // For now, just show all content
                displayContent(allContent);
            }
        });
    });

    // Handle keyboard navigation for content grid
    let currentFocus = 0; // Index of the currently focused div

    document.addEventListener('keydown', (event) => {
        const focusableDivs = Array.from(document.querySelectorAll('.responsive-div'));
        if (focusableDivs.length === 0) return;

        // Remove highlight from previous focused element
        focusableDivs.forEach(div => div.classList.remove('highlight'));

        if (event.key === 'ArrowRight') {
            currentFocus = (currentFocus + 1) % focusableDivs.length;
            focusableDivs[currentFocus].focus();
        } else if (event.key === 'ArrowLeft') {
            currentFocus = (currentFocus - 1 + focusableDivs.length) % focusableDivs.length;
            focusableDivs[currentFocus].focus();
        } else if (event.key === 'ArrowDown') {
            // Logic to move down in a grid. This is more complex
            // For simplicity, let's jump by a 'row' factor (e.g., 3 or 4 items per row)
            const gridStyle = getComputedStyle(container);
            const gridTemplateColumns = gridStyle.gridTemplateColumns;
            const columns = gridTemplateColumns.split(' ').length; // Number of columns

            currentFocus = Math.min(currentFocus + columns, focusableDivs.length - 1);
            focusableDivs[currentFocus].focus();
        } else if (event.key === 'ArrowUp') {
            const gridStyle = getComputedStyle(container);
            const gridTemplateColumns = gridStyle.gridTemplateColumns;
            const columns = gridTemplateColumns.split(' ').length;

            currentFocus = Math.max(currentFocus - columns, 0);
            focusableDivs[currentFocus].focus();
        }

        // Add highlight to the new focused element
        focusableDivs[currentFocus].classList.add('highlight');
    });

    // Initial content load when script is ready
    if (navigator.onLine) {
        loadContent();
    }
});