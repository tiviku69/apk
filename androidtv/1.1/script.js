const atas = document.getElementById('atas');
atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b> <input type="text" name="" id="cari" onkeyup="prosesMenu()" placeholder="cari..."> ';

const files = [ 'json/cmpr.json','json/captain.json','json/avat.json','json/ghost.json','json/avatar.json','json/squid.json','json/journey.json','json/one.json','json/mp4.json' ];

let filesProcessed = 0;
const totalFiles = files.length;

files.forEach(file => {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                const container = document.getElementById('container');
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
                dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl);

                dv.appendChild(img);
 
                dv.appendChild(pp);
                dv.appendChild(dur);
                container.appendChild(dv);
            });
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                // All files have been processed, highlight the first one
                const firstDiv = document.querySelector('.responsive-div');
                if (firstDiv) {
                    firstDiv.classList.add('highlight');
                    firstDiv.focus(); // Set focus for keyboard navigation
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
    for (var i = 0; i < li.length; i++) {
        if (li[i].innerHTML.toLowerCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

document.getElementById("cari").addEventListener("input", prosesMenu);