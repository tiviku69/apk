document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const continueWatchingContainer = document.getElementById('continue-watching-container'); // New container
    const searchInput = document.getElementById('cari');
    const headerRightSearchIcon = document.querySelector('.header-right .material-icons:first-child');
    const headerCenter = document.querySelector('.header-center');
    let allVideos = []; // To store all loaded video data

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

    let filesProcessed = 0;
    const totalFiles = files.length;

    const createVideoCard = (item) => {
        const dv = document.createElement('div');
        dv.className = 'responsive-div';
        dv.tabIndex = 0; // Make div focusable for keyboard navigation

        dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl, item.chn, item.vws, item.age);

        const img = document.createElement('img');
        img.id = 'imgv';
        img.src = item.logo;
        img.alt = item.ttl;

        const dur = document.createElement('div');
        dur.className = 'dur';
        dur.innerText = item.dur;

        const videoInfo = document.createElement('div');
        videoInfo.className = 'video-info';

        const title = document.createElement('h3');
        title.className = 'video-title';
        title.innerText = item.ttl;

        const details = document.createElement('div');
        details.className = 'video-details';

        const channel = document.createElement('p');
        channel.className = 'channel-name';
        channel.innerText = item.chn || 'Channel Tidak Dikenal';

        const viewsTime = document.createElement('p');
        viewsTime.className = 'views-time';
        viewsTime.innerText = `${item.vws || 'N/A'} ditonton • ${item.age || 'N/A'}`;

        details.appendChild(channel);
        details.appendChild(viewsTime);

        videoInfo.appendChild(title);
        videoInfo.appendChild(details);

        dv.appendChild(img);
        dv.appendChild(dur); // Duration overlay on image
        dv.appendChild(videoInfo);

        // Add a play overlay icon (similar to YouTube)
        const thumbnailOverlay = document.createElement('div');
        thumbnailOverlay.className = 'thumbnail-overlay';
        const playIconOverlay = document.createElement('i');
        playIconOverlay.className = 'material-icons';
        playIconOverlay.textContent = 'play_arrow';
        thumbnailOverlay.appendChild(playIconOverlay);
        dv.appendChild(thumbnailOverlay);

        return dv;
    };

    files.forEach(file => {
        fetch(file)
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    allVideos.push(item); // Add to our master list
                    container.appendChild(createVideoCard(item));
                });
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    // All files loaded, highlight the first one
                    const firstDiv = document.querySelector('.responsive-div');
                    if (firstDiv) {
                        firstDiv.classList.add('highlight');
                        firstDiv.focus();
                    }
                }
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    const firstDiv = document.querySelector('.responsive-div');
                    if (firstDiv) {
                        firstDiv.classList.add('highlight');
                        firstDiv.focus();
                    }
                }
            });
    });

    // Function to handle video playback
    function playVideo(videoFile, logoFile, textFile, channelName, views, age) {
        sessionStorage.setItem('videoLink', videoFile);
        sessionStorage.setItem('videoTitle', textFile);
        sessionStorage.setItem('logoFile', logoFile); // If ply.html needs the logo
        sessionStorage.setItem('videoChannel', channelName);
        sessionStorage.setItem('videoViews', views);
        sessionStorage.setItem('videoAge', age);
        window.location.href = 'ply.html';
    }

    // New search function
    window.prosesMenu = function() {
        const filter = searchInput.value.toLowerCase();
        // Clear existing videos from the container
        container.innerHTML = '';

        const filteredVideos = allVideos.filter(item =>
            item.ttl.toLowerCase().includes(filter) ||
            (item.chn && item.chn.toLowerCase().includes(filter)) // Also search by channel name
        );

        if (filteredVideos.length > 0) {
            filteredVideos.forEach(item => {
                container.appendChild(createVideoCard(item));
            });
            // Re-highlight the first filtered item if any
            const firstDiv = document.querySelector('.responsive-div');
            if (firstDiv) {
                firstDiv.classList.add('highlight');
                firstDiv.focus();
            }
        } else {
            container.innerHTML = '<p style="color: grey; text-align: center; padding: 20px;">Tidak ada video yang ditemukan.</p>';
        }
    };

    // Keyboard navigation (similar to previous version, adapted for new structure)
    document.addEventListener('keydown', (event) => {
        const currentActive = document.activeElement;
        let nextElement;

        if (currentActive && currentActive.classList.contains('responsive-div')) {
            const videoElements = Array.from(document.querySelectorAll('.responsive-div:not([style*="display: none"])')); // Only visible videos
            const currentIndex = videoElements.indexOf(currentActive);

            switch (event.key) {
                case 'ArrowRight':
                    if (currentIndex < videoElements.length - 1) {
                        nextElement = videoElements[currentIndex + 1];
                    }
                    break;
                case 'ArrowLeft':
                    if (currentIndex > 0) {
                        nextElement = videoElements[currentIndex - 1];
                    }
                    break;
                case 'ArrowDown':
                case 'ArrowUp':
                    // Basic row navigation: calculate based on grid columns
                    const gridComputedStyle = window.getComputedStyle(container);
                    const gridColumns = gridComputedStyle.getPropertyValue('grid-template-columns').split(' ').length;
                    
                    if (event.key === 'ArrowDown') {
                        nextElement = videoElements[currentIndex + gridColumns];
                    } else if (event.key === 'ArrowUp') {
                        nextElement = videoElements[currentIndex - gridColumns];
                    }
                    break;
                case 'Enter':
                    currentActive.click(); // Simulate click on Enter
                    break;
            }

            if (nextElement) {
                currentActive.classList.remove('highlight');
                nextElement.classList.add('highlight');
                nextElement.focus();
                nextElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                event.preventDefault();
            }
        } else if (searchInput === currentActive) {
            // Handle search input focus
        } else {
            // If nothing is focused, try to focus the first video
            const firstDiv = document.querySelector('.responsive-div:not([style*="display: none"])');
            if (firstDiv) {
                firstDiv.classList.add('highlight');
                firstDiv.focus();
                event.preventDefault();
            }
        }
    });

    // Toggle search bar visibility on mobile
    if (headerRightSearchIcon) {
        headerRightSearchIcon.addEventListener('click', () => {
            headerCenter.style.display = headerCenter.style.display === 'flex' ? 'none' : 'flex';
            if (headerCenter.style.display === 'flex') {
                searchInput.focus();
            }
        });
    }

    // Simulating "Continue Watching" by adding a few items (e.g., first 3)
    // In a real app, this would be dynamic based on user history.
    function loadContinueWatching() {
        if (continueWatchingContainer && allVideos.length > 0) {
            // Get the first few items from the main video list
            const continueWatchingItems = allVideos.slice(0, 3); 
            continueWatchingItems.forEach(item => {
                continueWatchingContainer.appendChild(createVideoCard(item));
            });
        }
    }

    // Call this after all videos are loaded
    // This needs to be slightly delayed to ensure allVideos is populated
    setTimeout(loadContinueWatching, 1000); 
});