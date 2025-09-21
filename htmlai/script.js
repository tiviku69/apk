const atas = document.getElementById('atas');
atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b>';

const files = [ 'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/captain.json','https://raw.githubusercontent.com/tiviku69/apk/main/avat.json','https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json','https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json','https://raw.githubusercontent.com/tiviku69/apk/main/squid.json','https://raw.githubusercontent.com/tiviku69/apk/main/journey.json','https://raw.githubusercontent.com/tiviku69/apk/main/one.json','https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json' ];

let allVideoItems = [];
let filesProcessed = 0;
const totalFiles = files.length;
let currentIndex = 0;
let currentFocusElement = null;

function loadVideos() {
    files.forEach(file => {
        fetch(file)
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    const img = document.createElement('img');
                    img.id = 'imgv';
                    img.src = item.logo;

                    const pp = document.createElement('p');
                    pp.className = 're';
                    pp.innerText = item.ttl;

                    const dur = document.createElement('p');
                    dur.className = 'dur';
                    dur.innerText = item.dur;

                    const dv = document.createElement('div');
                    dv.className = 'responsive-div';
                    dv.tabIndex = 0;
                    dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl);
                    dv.addEventListener('focus', () => updateHighlight(dv));

                    dv.appendChild(img);
                    dv.appendChild(pp);
                    dv.appendChild(dur);
                    allVideoItems.push(dv);
                });
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    renderVideos(allVideoItems);
                    highlightInitialElement();
                }
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                filesProcessed++;
                if (filesProcessed === totalFiles) {
                    renderVideos(allVideoItems);
                    highlightInitialElement();
                }
            });
    });
}

function renderVideos(videoItemsToRender) {
    const container = document.getElementById('container');
    container.innerHTML = '';
    videoItemsToRender.forEach(item => container.appendChild(item));
}

function playVideo(videoFile, logoFile, textFile) {
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}

function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    
    const filteredItems = allVideoItems.filter(item => {
        return item.innerHTML.toLowerCase().indexOf(filter) > -1;
    });
    renderVideos(filteredItems);
}

function updateHighlight(newElement) {
    if (currentFocusElement) {
        currentFocusElement.classList.remove('highlight');
    }
    newElement.classList.add('highlight');
    currentFocusElement = newElement;
}

function highlightInitialElement() {
    const homeMenu = document.getElementById('home-menu');
    homeMenu.focus();
    updateHighlight(homeMenu);
}

document.addEventListener('keydown', (e) => {
    const focusableElements = Array.from(document.querySelectorAll('.menu-item, .responsive-div'));
    if (focusableElements.length === 0) return;

    let nextIndex;
    const currentFocusedIndex = focusableElements.indexOf(document.activeElement);

    if (currentFocusedIndex === -1) {
        focusableElements[0].focus();
        return;
    }

    const currentElement = focusableElements[currentFocusedIndex];

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            nextIndex = currentFocusedIndex + 1;
            if (nextIndex >= focusableElements.length) nextIndex = 0;
            focusableElements[nextIndex].focus();
            break;
        case 'ArrowUp':
            e.preventDefault();
            nextIndex = currentFocusedIndex - 1;
            if (nextIndex < 0) nextIndex = focusableElements.length - 1;
            focusableElements[nextIndex].focus();
            break;
        case 'ArrowRight':
            e.preventDefault();
            const currentRect = currentElement.getBoundingClientRect();
            let nearestElement = null;
            let minDistance = Infinity;

            for (let i = 0; i < focusableElements.length; i++) {
                if (i === currentFocusedIndex) continue;
                const nextElement = focusableElements[i];
                const nextRect = nextElement.getBoundingClientRect();
                
                if (nextRect.left > currentRect.left) {
                    const distance = Math.hypot(nextRect.left - currentRect.left, nextRect.top - currentRect.top);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestElement = nextElement;
                    }
                }
            }

            if (nearestElement) {
                nearestElement.focus();
            } else {
                let nextRowElement = null;
                minDistance = Infinity;
                for (let i = 0; i < focusableElements.length; i++) {
                    const nextElement = focusableElements[i];
                    if (nextElement.getBoundingClientRect().top > currentRect.top) {
                        const distance = nextElement.getBoundingClientRect().left - currentRect.left;
                        if (distance > 0 && distance < minDistance) {
                            minDistance = distance;
                            nextRowElement = nextElement;
                        }
                    }
                }
                if (nextRowElement) nextRowElement.focus();
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            const currentRectLeft = currentElement.getBoundingClientRect();
            let nearestElementLeft = null;
            let minDistanceLeft = Infinity;

            for (let i = 0; i < focusableElements.length; i++) {
                if (i === currentFocusedIndex) continue;
                const nextElement = focusableElements[i];
                const nextRect = nextElement.getBoundingClientRect();
                
                if (nextRect.left < currentRectLeft.left) {
                    const distance = Math.hypot(nextRect.left - currentRectLeft.left, nextRect.top - currentRectLeft.top);
                    if (distance < minDistanceLeft) {
                        minDistanceLeft = distance;
                        nearestElementLeft = nextElement;
                    }
                }
            }
            
            if (nearestElementLeft) {
                nearestElementLeft.focus();
            }
            break;
        case 'Enter':
            e.preventDefault();
            currentElement.click();
            break;
    }
});

document.getElementById('home-menu').addEventListener('click', () => {
    document.getElementById('cari').style.display = 'none';
    document.getElementById('home-menu').classList.add('active');
    document.getElementById('search-menu').classList.remove('active');
    renderVideos(allVideoItems);
    setTimeout(() => {
        const firstDiv = document.querySelector('.responsive-div');
        if (firstDiv) firstDiv.focus();
    }, 100);
});

document.getElementById('search-menu').addEventListener('click', () => {
    document.getElementById('cari').style.display = 'block';
    document.getElementById('home-menu').classList.remove('active');
    document.getElementById('search-menu').classList.add('active');
    document.getElementById('cari').focus();
    renderVideos(allVideoItems);
});

document.getElementById("cari").addEventListener("input", prosesMenu);

loadVideos();