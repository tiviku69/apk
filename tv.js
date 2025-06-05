// Array of M3U URLs
const m3uUrls = [ 'https://filmovie.github.io/96/p.m3u8','https://filmovie.github.io/96/new/p2.m3u8','https://filmovie.github.io/new/p3.m3u8','https://filmovie.github.io/96/new/p4.m3u8','https://filmovie.github.io/new/p5.m3u8','https://filmovie.github.io/96/new/p6.m3u8','https://filmovie.github.io/new/p7.m3u8','https://filmovie.github.io/96/new/p8.m3u8','https://filmovie.github.io/new/p9.m3u8','https://filmovie.github.io/96/new/p10.m3u8', ];

// Function to fetch and process M3U files
function fetchM3UData(url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            const channelList = document.getElementById('channel-list');
            
            lines.forEach((line, index) => {
                if (line.startsWith('#EXTINF:')) {
                    const channelInfo = line.split(',');
                    const title = channelInfo[1].trim();
                    const logo = channelInfo[0].match(/tvg-logo="([^"]+)"/)[1];
                    const streamUrl = lines[index + 1]?.trim(); // Safely access the stream URL

                    if (streamUrl) {
                        const listItem = document.createElement('li');
                        listItem.id = 'list';
                        listItem.innerHTML = `
                            <img id="ilt" src="${logo}" alt="${title} Logo">
                            <a id="klk" href="#" data-url="${streamUrl}">${title}</a>
                        `;
                        channelList.appendChild(listItem);
                        
                        listItem.querySelector('a').onclick = (event) => {
                            event.preventDefault();
                            const player = document.getElementById('player');
                            player.src = streamUrl;
                            const imgee = document.getElementById('imgee');
                            imgee.src = logo;
                            const txtt = document.getElementById('txtt');
                            txtt.innerText = title;
                            player.play();
                        };
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching the M3U file:', error));
}

// Fetch data for each URL in the array
m3uUrls.forEach(url => fetchM3UData(url));

// Search filter functionality
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    const listItems = document.querySelectorAll('#channel-list li');

    listItems.forEach(item => {
        const title = item.querySelector('a').textContent.toLowerCase();
        if (title.includes(filter)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});
