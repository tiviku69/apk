document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('mainContainer');
    const offlineMessage = document.getElementById('offlineMessage');
    const searchBar = document.getElementById('cari');
    const videoContainer = document.getElementById('container');

    const files = [ 'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/captain.json','https://raw.githubusercontent.com/tiviku69/apk/main/avat.json','https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json','https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json','https://raw.githubusercontent.com/tiviku69/apk/main/squid.json','https://raw.githubusercontent.com/tiviku69/apk/main/journey.json','https://raw.githubusercontent.com/tiviku69/apk/main/one.json','https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json' ];

    function updateOnlineStatus() {
        if (navigator.onLine) {
            offlineMessage.style.display = 'none';
            mainContainer.style.display = 'flex';
        } else {
            offlineMessage.style.display = 'block';
            mainContainer.style.display = 'none';
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    let focusedElementIndex = 0;
    const focusableElements = [];

    function updateFocus() {
        const allFocusable = document.querySelectorAll('.nav-item, .search-bar, .video-card');
        allFocusable.forEach(el => el.classList.remove('highlight', 'active'));

        const currentElement = allFocusable[focusedElementIndex];
        if (currentElement) {
            currentElement.classList.add('highlight');
            if (currentElement.classList.contains('nav-item')) {
                currentElement.classList.add('active');
            }
            currentElement.focus();
        }
    }

    function renderVideos() {
        videoContainer.innerHTML = '';
        files.forEach(file => {
            fetch(file)
                .then(response => response.json())
                .then(data => {
                    data.forEach(item => {
                        const videoCard = document.createElement('div');
                        videoCard.className = 'video-card';
                        videoCard.tabIndex = 0;
                        videoCard.onclick = () => playVideo(item.lnk, item.ttl, item.logo);
                        videoCard.innerHTML = `
                            <img src="${item.logo}" alt="${item.ttl}">
                            <p class="re">${item.ttl}</p>
                            <p class="dur">${item.dur}</p>
                        `;
                        videoContainer.appendChild(videoCard);
                        focusableElements.push(videoCard);
                    });
                    updateFocus();
                })
                .catch(error => console.error('Error loading JSON:', error));
        });
    }

    function playVideo(videoFile, videoTitle, logoFile) {
        sessionStorage.setItem('videoLink', videoFile);
        sessionStorage.setItem('videoTitle', videoTitle);
        sessionStorage.setItem('logoFile', logoFile);
        window.location.href = 'ply.html';
    }

    function filterVideos() {
        const filter = searchBar.value.toLowerCase();
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            const title = card.querySelector('.re').innerText.toLowerCase();
            if (title.includes(filter)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        // Reset focus after filtering
        const visibleElements = document.querySelectorAll('.nav-item, .search-bar, .video-card[style*="block"]');
        focusedElementIndex = 0;
        updateFocus();
    }
    
    // Initial video rendering
    renderVideos();
    
    // Event listeners
    searchBar.addEventListener('input', filterVideos);

    document.querySelectorAll('.nav-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            focusedElementIndex = index;
            updateFocus();
            // Add logic here to switch content sections
        });
    });

    document.addEventListener('keydown', (e) => {
        const allFocusable = document.querySelectorAll('.nav-item, .search-bar, .video-card');
        let newIndex = focusedElementIndex;
        const currentElement = allFocusable[focusedElementIndex];

        switch (e.key) {
            case 'ArrowRight':
                newIndex++;
                break;
            case 'ArrowLeft':
                newIndex--;
                break;
            case 'ArrowDown':
                // Complex logic for grid navigation, for simplicity, we move down one row
                if (currentElement && currentElement.classList.contains('video-card')) {
                    const currentTop = currentElement.offsetTop;
                    const nextElement = Array.from(allFocusable).find(el => 
                        el.classList.contains('video-card') && el.offsetTop > currentTop
                    );
                    if (nextElement) {
                        newIndex = Array.from(allFocusable).indexOf(nextElement);
                    }
                } else if (currentElement && currentElement.classList.contains('search-bar')) {
                    const firstVideo = document.querySelector('.video-card');
                    if (firstVideo) newIndex = Array.from(allFocusable).indexOf(firstVideo);
                }
                break;
            case 'ArrowUp':
                // Complex logic for grid navigation, for simplicity, we move up one row
                if (currentElement && currentElement.classList.contains('video-card')) {
                    const currentTop = currentElement.offsetTop;
                    const prevElement = Array.from(allFocusable).reverse().find(el => 
                        el.classList.contains('video-card') && el.offsetTop < currentTop
                    );
                    if (prevElement) {
                        newIndex = Array.from(allFocusable).indexOf(prevElement);
                    } else {
                        const searchInput = document.getElementById('cari');
                        if (searchInput) newIndex = Array.from(allFocusable).indexOf(searchInput);
                    }
                } else if (currentElement && currentElement.classList.contains('search-bar')) {
                    const lastNavItem = document.querySelector('.nav-item:last-child');
                    if (lastNavItem) newIndex = Array.from(allFocusable).indexOf(lastNavItem);
                }
                break;
            case 'Enter':
                e.preventDefault();
                currentElement.click();
                break;
        }

        if (newIndex >= 0 && newIndex < allFocusable.length) {
            focusedElementIndex = newIndex;
            updateFocus();
        }
    });
});