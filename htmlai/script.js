document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const searchInput = document.getElementById('search-input');
    const contentContainer = document.getElementById('content');
    const navItems = document.querySelectorAll('.nav-item');

    let allItems = [];
    let currentFocusIndex = 0;
    let sidebarOpen = false;

    // Fetches and displays content
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

    const fetchContent = async () => {
        for (const file of files) {
            try {
                const response = await fetch(file);
                const data = await response.json();
                allItems = allItems.concat(data);
            } catch (error) {
                console.error('Error fetching JSON:', error);
            }
        }
        renderItems(allItems);
    };

    const renderItems = (items) => {
        contentContainer.innerHTML = '';
        items.forEach(item => {
            const itemElement = document.createElement('a');
            itemElement.href = '#';
            itemElement.className = 'item';
            itemElement.onclick = () => playVideo(item.lnk, item.logo, item.ttl);

            itemElement.innerHTML = `
                <img src="${item.logo}" alt="${item.ttl}" class="item-thumbnail">
                <div class="item-details">
                    <p class="item-title">${item.ttl}</p>
                    <p class="item-metadata">${item.dur}</p>
                </div>
            `;
            contentContainer.appendChild(itemElement);
        });
    };

    const filterContent = (query) => {
        const filteredItems = allItems.filter(item =>
            item.ttl.toLowerCase().includes(query.toLowerCase())
        );
        renderItems(filteredItems);
    };

    function playVideo(videoLink, logoFile, title) {
        sessionStorage.setItem('videoLink', videoLink);
        sessionStorage.setItem('videoTitle', title);
        sessionStorage.setItem('logoFile', logoFile);
        window.location.href = 'ply.html';
    }
    
    // Function to handle navigation and focus
    const updateFocus = () => {
        navItems.forEach((item, index) => {
            if (index === currentFocusIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };
    
    // Keyboard navigation (remote control simulation)
    document.addEventListener('keydown', (e) => {
        if (!sidebarOpen && e.key === 'ArrowLeft') {
            sidebar.classList.add('open');
            mainContent.classList.add('shifted');
            sidebarOpen = true;
            updateFocus();
            e.preventDefault();
        } else if (sidebarOpen) {
            if (e.key === 'ArrowDown') {
                currentFocusIndex = (currentFocusIndex + 1) % navItems.length;
                updateFocus();
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                currentFocusIndex = (currentFocusIndex - 1 + navItems.length) % navItems.length;
                updateFocus();
                e.preventDefault();
            } else if (e.key === 'ArrowRight' || e.key === 'Escape') {
                sidebar.classList.remove('open');
                mainContent.classList.remove('shifted');
                sidebarOpen = false;
                navItems.forEach(item => item.classList.remove('active'));
                e.preventDefault();
            } else if (e.key === 'Enter') {
                // Simulate a click on the focused item
                navItems[currentFocusIndex].click();
                e.preventDefault();
            }
        }
    });

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        filterContent(e.target.value);
    });

    // Initial content load
    fetchContent();
});