// script.js

// Sample video data
const recommendedVideos = [
    { title: "Lagu Kendaraan Konstruksi | Cocomelon", channel: "CoComelon Indonesia", duration: "1.03.00", thumbnail: "https://i.ytimg.com/vi/a_lWb4_jJ0g/maxresdefault.jpg" },
    { title: "Monday Morning Jazz", channel: "DooBee DooBee", duration: "1.03.00", thumbnail: "https://i.ytimg.com/vi/q_lWb4_jJ0g/maxresdefault.jpg" },
    // more videos...
];

const newVideos = [
    { title: "ARMADA FULL ALBUM", channel: "Galeri Musik", duration: "1.41.59", thumbnail: "https://i.ytimg.com/vi/b_lWb4_jJ0g/maxresdefault.jpg" },
    // more videos...
];

const mainContent = document.querySelector('.main-content');
let currentFocus = null;

function renderVideos(containerId, videos) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    videos.forEach((video, index) => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.tabIndex = 0; // Make element focusable
        videoCard.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="video-info">
                <div class="title">${video.title}</div>
                <div class="channel">${video.channel}</div>
                <div class="views">${video.duration}</div>
            </div>
        `;
        container.appendChild(videoCard);
    });
}

// Initial rendering of videos
renderVideos('recommended-videos', recommendedVideos);
renderVideos('new-videos', newVideos);

// Navigation logic for TV remote
window.addEventListener('keydown', (e) => {
    const focusableElements = document.querySelectorAll('.nav-item, .search-bar, .video-card');
    let currentIndex = Array.from(focusableElements).indexOf(document.activeElement);

    switch (e.key) {
        case 'ArrowRight':
            if (currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
            }
            break;
        case 'ArrowLeft':
            if (currentIndex > 0) {
                focusableElements[currentIndex - 1].focus();
            }
            break;
        case 'Enter':
            // Simulate a click on the focused element
            if (document.activeElement) {
                document.activeElement.click();
            }
            break;
    }
});

// Sidebar navigation click handler
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');

        // Logic to switch content based on the data-target attribute
        const target = item.getAttribute('data-target');
        // You would hide/show different sections here
    });
});

// Set initial focus to the first nav item
document.querySelector('.nav-item.active').focus();