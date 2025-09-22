document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const searchInput = document.getElementById('cari');
    const mainContent = document.querySelector('.main-content');
    const keyboardPopup = document.querySelector('.keyboard-popup');
    const keyboardKeys = document.querySelectorAll('.keyboard-row span');
    const container = document.getElementById('container');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const offlineMessage = document.getElementById('offlineMessage');
    let focusedElement = null;
    let videoData = [];

    // Fungsi untuk memeriksa status online
    function updateOnlineStatus() {
        if (navigator.onLine) {
            offlineMessage.style.display = 'none';
            mainContent.style.display = 'block';
            loadVideos();
        } else {
            offlineMessage.style.display = 'block';
            mainContent.style.display = 'none';
        }
    }
    
    // Fungsi untuk memuat konten video dari JSON files
    function loadVideos() {
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
        
        container.innerHTML = '<h2>Memuat konten...</h2>';
        videoData = [];
        let filesProcessed = 0;
        const totalFiles = files.length;

        files.forEach(file => {
            fetch(file)
                .then(response => response.json())
                .then(data => {
                    videoData = videoData.concat(data);
                    filesProcessed++;
                    if (filesProcessed === totalFiles) {
                        displayVideos(videoData, container);
                        updateFocus(navItems[0]); // Atur fokus awal setelah konten dimuat
                    }
                })
                .catch(error => {
                    console.error('Error loading JSON:', error);
                    filesProcessed++;
                    if (filesProcessed === totalFiles) {
                         displayVideos(videoData, container);
                         updateFocus(navItems[0]);
                    }
                });
        });
    }

    // Fungsi untuk menampilkan video dalam container
    function displayVideos(videos, targetContainer) {
        targetContainer.innerHTML = ''; // Kosongkan container
        videos.forEach(item => {
            const cardHtml = `
                <div class="video-card" tabindex="0" data-link="${item.lnk}" data-title="${item.ttl}">
                    <img src="${item.logo}" alt="${item.ttl}" class="thumbnail">
                    <div class="video-info">
                        <h3 class="video-title">${item.ttl}</h3>
                        <p class="channel-name">${item.dur}</p>
                    </div>
                </div>
            `;
            targetContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
        // Tambahkan event listener untuk klik pada kartu video
        targetContainer.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const link = card.getAttribute('data-link');
                const title = card.getAttribute('data-title');
                playVideo(link, '', title);
            });
        });
    }

    // Fungsi untuk memutar video
    function playVideo(videoFile, logoFile, textFile) {
        sessionStorage.setItem('videoLink', videoFile);
        sessionStorage.setItem('videoTitle', textFile);
        window.location.href = 'ply.html';
    }

    // Fungsi untuk mengelola fokus
    function updateFocus(newFocus) {
        if (focusedElement) {
            focusedElement.classList.remove('focused-element');
        }
        if (newFocus) {
            newFocus.classList.add('focused-element');
            focusedElement = newFocus;
            newFocus.focus();
            newFocus.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }

    // Fungsi untuk mengubah section
    function changeSection(targetId) {
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        navItems.forEach(item => item.classList.remove('active'));
        const navItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (navItem) navItem.classList.add('active');
        
        // Reset fokus ke elemen pertama di section baru
        const firstFocusable = document.querySelector(`#${targetId} .video-card, #${targetId} .search-input`);
        updateFocus(firstFocusable);
    }

    // Fungsi untuk menangani pencarian
    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        const filteredVideos = videoData.filter(video => video.ttl.toLowerCase().includes(query));
        displayVideos(filteredVideos, searchResultsContainer);
        changeSection('search-results');
        keyboardPopup.style.display = 'none';
        
        // Pindahkan fokus ke hasil pencarian pertama jika ada
        const firstResult = searchResultsContainer.querySelector('.video-card');
        if (firstResult) {
            updateFocus(firstResult);
        } else {
            // Jika tidak ada hasil, kembali ke search input
            updateFocus(searchInput);
        }
    }

    // Fungsi untuk menangani navigasi remote (simulasi)
    function handleRemoteNavigation(event) {
        const key = event.key;
        const isKeyboardOpen = keyboardPopup.style.display === 'block';

        if (isKeyboardOpen) {
            // Navigasi saat keyboard virtual terbuka
            const keyboardKeys = document.querySelectorAll('.keyboard-popup span');
            let currentIndex = Array.from(keyboardKeys).indexOf(focusedElement);
            let nextIndex = currentIndex;
            const rowSize = 7;

            switch (key) {
                case 'ArrowRight':
                    nextIndex = (currentIndex + 1) % keyboardKeys.length;
                    break;
                case 'ArrowLeft':
                    nextIndex = (currentIndex - 1 + keyboardKeys.length) % keyboardKeys.length;
                    break;
                case 'ArrowDown':
                    if (currentIndex + rowSize < keyboardKeys.length) {
                        nextIndex = currentIndex + rowSize;
                    }
                    break;
                case 'ArrowUp':
                    if (currentIndex - rowSize >= 0) {
                        nextIndex = currentIndex - rowSize;
                    }
                    break;
                case 'Enter':
                case ' ':
                    if (focusedElement) {
                        focusedElement.click();
                    }
                    return;
                case 'Escape':
                    keyboardPopup.style.display = 'none';
                    updateFocus(searchInput);
                    return;
            }
            updateFocus(keyboardKeys[nextIndex]);
        } else {
            // Navigasi saat keyboard virtual tertutup
            const focusableElements = document.querySelectorAll('.nav-item, .search-input, .video-card');
            let currentIndex = Array.from(focusableElements).indexOf(focusedElement);
            let nextFocus = null;

            if (key === 'ArrowUp' && currentIndex > 0) {
                nextFocus = focusableElements[currentIndex - 1];
            } else if (key === 'ArrowDown' && currentIndex < focusableElements.length - 1) {
                nextFocus = focusableElements[currentIndex + 1];
            } else if (key === 'ArrowRight' && focusedElement && focusedElement.classList.contains('video-card')) {
                const nextCard = focusedElement.nextElementSibling;
                if (nextCard && nextCard.classList.contains('video-card')) {
                    nextFocus = nextCard;
                }
            } else if (key === 'ArrowLeft' && focusedElement && focusedElement.classList.contains('video-card')) {
                const prevCard = focusedElement.previousElementSibling;
                if (prevCard && prevCard.classList.contains('video-card')) {
                    nextFocus = prevCard;
                }
            } else if (key === 'Enter') {
                if (focusedElement) {
                    focusedElement.click(); // Simulasikan klik
                }
            }
            if (nextFocus) {
                updateFocus(nextFocus);
            }
        }
    }

    // Event listeners
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            if (targetId) {
                changeSection(targetId);
            }
        });
    });

    searchInput.addEventListener('focus', () => {
        keyboardPopup.style.display = 'block';
        updateFocus(keyboardKeys[0]); // Pindahkan fokus ke keyboard
    });

    keyboardKeys.forEach(key => {
        key.addEventListener('click', () => {
            const text = key.textContent;
            if (text === 'HAPUS') {
                searchInput.value = searchInput.value.slice(0, -1);
            } else if (text === 'SPASI') {
                searchInput.value += ' ';
            } else if (text === 'TELUSURI') {
                handleSearch();
            } else {
                searchInput.value += text.toLowerCase();
            }
        });
    });

    document.addEventListener('keydown', handleRemoteNavigation);

    // Inisialisasi: muat video dan set fokus awal
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});