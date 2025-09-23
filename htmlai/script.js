document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const searchInput = document.getElementById('cari');
    const container = document.getElementById('container');
    const focusableElements = [searchInput, ...navItems, ...container.querySelectorAll('.card')];
    let activeElement = document.querySelector('.nav-item.active');

    function setActive(element) {
        document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        activeElement = element;
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

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

    files.forEach(file => {
        fetch(file)
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.dataset.id = item.lnk;
                    card.dataset.title = item.ttl;
                    card.dataset.logo = item.logo;
                    card.tabIndex = 0;

                    card.innerHTML = `
                        <img src="${item.logo}" alt="${item.ttl}">
                        <div class="info">${item.ttl}</div>
                        <div class="dur">${item.dur}</div>
                    `;

                    card.addEventListener('click', () => {
                        setActive(card);
                        playVideo(item.lnk, item.logo, item.ttl);
                    });

                    container.appendChild(card);
                });
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    const firstCard = document.querySelector('.card');
                    if (firstCard) {
                        setActive(firstCard);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    const firstCard = document.querySelector('.card');
                    if (firstCard) {
                        setActive(firstCard);
                    }
                }
            });
    });

    function playVideo(videoFile, logoFile, textFile) {
        sessionStorage.setItem('videoLink', videoFile);
        sessionStorage.setItem('videoTitle', textFile);
        sessionStorage.setItem('logoFile', logoFile);
        window.location.href = 'ply.html';
    }

    document.addEventListener('keydown', (e) => {
        const key = e.key;
        let nextElement = null;

        if (activeElement === searchInput) {
            if (key === 'ArrowUp') {
                nextElement = navItems[0];
            } else if (key === 'ArrowRight') {
                const firstCard = container.querySelector('.card');
                if (firstCard) {
                    nextElement = firstCard;
                }
            }
        } else if (activeElement.classList.contains('nav-item')) {
            const navItemsList = Array.from(navItems);
            const currentIndex = navItemsList.indexOf(activeElement);
            if (key === 'ArrowDown') {
                if (currentIndex < navItemsList.length - 1) {
                    nextElement = navItemsList[currentIndex + 1];
                } else {
                    nextElement = searchInput;
                }
            } else if (key === 'ArrowUp' && currentIndex > 0) {
                nextElement = navItemsList[currentIndex - 1];
            } else if (key === 'ArrowRight') {
                const firstCard = container.querySelector('.card');
                if (firstCard) {
                    nextElement = firstCard;
                }
            }
        } else if (activeElement.classList.contains('card')) {
            const cards = Array.from(document.querySelectorAll('.card'));
            const currentIndex = cards.indexOf(activeElement);

            if (key === 'ArrowRight' && currentIndex < cards.length - 1) {
                nextElement = cards[currentIndex + 1];
            } else if (key === 'ArrowLeft' && currentIndex > 0) {
                nextElement = cards[currentIndex - 1];
            } else if (key === 'ArrowLeft' && currentIndex === 0) {
                nextElement = searchInput;
            }
        }

        if (nextElement) {
            setActive(nextElement);
            if (nextElement === searchInput) {
                searchInput.focus();
            } else {
                searchInput.blur();
            }
            e.preventDefault();
        }

        if (key === 'Enter') {
            if (activeElement.classList.contains('card')) {
                const videoId = activeElement.dataset.id;
                const videoTitle = activeElement.dataset.title;
                const videoLogo = activeElement.dataset.logo;
                console.log(`Memutar video dengan ID: ${videoId}`);
                playVideo(videoId, videoLogo, videoTitle);
            } else if (activeElement.classList.contains('nav-item')) {
                const targetId = activeElement.dataset.target;
                console.log(`Membuka halaman: ${targetId}`);
            } else if (activeElement === searchInput) {
                // Trigger search function if Enter is pressed on the search box
                searchInput.focus();
            }
        }
    });

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll('.card');
        let firstVisibleCard = null;
        cards.forEach(card => {
            const title = card.dataset.title.toLowerCase();
            if (title.includes(filter)) {
                card.style.display = 'inline-block';
                if (!firstVisibleCard) {
                    firstVisibleCard = card;
                }
            } else {
                card.style.display = 'none';
            }
        });
        if (firstVisibleCard) {
            setActive(firstVisibleCard);
        }
    });
});