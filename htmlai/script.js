// No need for 'atas' element, as header is part of content-area now.
// const atas = document.getElementById('atas');
// atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b> <input type="text" name="" id="cari" onkeyup="prosesMenu()" placeholder="cari..."> ';

const container = document.getElementById('container');

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

// Function to create a section header if needed (e.g., "Free to watch movies")
function createSectionHeader(title) {
    const header = document.createElement('h2');
    header.textContent = title;
    header.style.color = 'white';
    header.style.marginTop = '40px';
    header.style.marginBottom = '20px';
    header.style.width = '100%'; // Ensure header takes full width
    container.appendChild(header);
}

// Mimicking sections, you might need to adjust this based on your JSON structure or add more logic
createSectionHeader('Free to watch shows'); // First section title

let movieSectionAdded = false; // Flag to add movie section header only once

files.forEach(file => {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                // If a certain condition is met (e.g., specific JSON file or item property),
                // you could add a new section header.
                // For demonstration, let's say the 'mp4.json' marks the start of 'movies'.
                if (file.includes('mp4.json') && !movieSectionAdded) {
                    createSectionHeader('Free to watch movies');
                    movieSectionAdded = true;
                }

                const dv = document.createElement('div');
                dv.className = 'responsive-div';
                dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl);

                const img = document.createElement('img');
                img.src = item.logo;
                img.alt = item.ttl; // Add alt text for accessibility

                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'item-details';

                const titleP = document.createElement('p');
                titleP.className = 'item-title';
                titleP.innerText = item.ttl;

                const subtitleP = document.createElement('p');
                subtitleP.className = 'item-subtitle';
                // Combining duration and potentially other info
                // Assuming 'dur' could be '4 Seasons' or '2011' from the image
                subtitleP.innerText = item.dur || ''; // Use item.dur if available

                const metaDiv = document.createElement('div');
                metaDiv.className = 'item-meta';

                // Adding "Free with ads"
                const freeWithAdsSpan = document.createElement('span');
                freeWithAdsSpan.className = 'meta-tag free-with-ads';
                freeWithAdsSpan.innerText = 'Free with ads';
                metaDiv.appendChild(freeWithAdsSpan);

                // Adding TV rating and CC (if applicable)
                if (item.rating) { // Assuming item.rating exists in your JSON
                    const ratingSpan = document.createElement('span');
                    ratingSpan.className = 'meta-tag';
                    ratingSpan.innerText = item.rating; // e.g., "TV-14"
                    metaDiv.appendChild(ratingSpan);
                }

                if (item.audio) { // Assuming item.audio exists for language
                    const audioSpan = document.createElement('span');
                    audioSpan.className = 'meta-tag';
                    audioSpan.innerText = item.audio; // e.g., "English audio"
                    metaDiv.appendChild(audioSpan);
                }

                if (item.cc) { // Assuming item.cc for closed captions
                    const ccSpan = document.createElement('span');
                    ccSpan.className = 'meta-tag';
                    ccSpan.innerText = 'CC';
                    metaDiv.appendChild(ccSpan);
                }


                detailsDiv.appendChild(titleP);
                detailsDiv.appendChild(subtitleP);
                detailsDiv.appendChild(metaDiv);


                dv.appendChild(img);
                dv.appendChild(detailsDiv);
                container.appendChild(dv);
            });
        })
        .catch(error => console.error('Error loading JSON:', error));
});

function playVideo(videoFile, logoFile, textFile) {
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}

function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');
    var headerBars = document.querySelectorAll('#content-area h2'); // Select section headers

    li.forEach(item => {
        const title = item.querySelector('.item-title').innerText.toLowerCase();
        if (title.indexOf(filter) > -1) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    });

    // Optionally hide section headers if all items under them are hidden
    // This part can be more complex if sections are not strictly separated in DOM
    // For now, let's keep headers visible, or implement more sophisticated logic if needed.
}

document.getElementById("cari").addEventListener("input", prosesMenu);