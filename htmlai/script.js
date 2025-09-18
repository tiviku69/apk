const atas = document.getElementById('atas');
atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b> <input type="text" name="" id="cari" onkeyup="prosesMenu()" placeholder="cari..."> ';

const files = [ 'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/captain.json','https://raw.githubusercontent.com/tiviku69/apk/main/avat.json','https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json','https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json','https://raw.githubusercontent.com/tiviku69/apk/main/squid.json','https://raw.githubusercontent.com/tiviku69/apk/main/journey.json','https://raw.githubusercontent.com/tiviku69/apk/main/one.json','https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json' ];
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
                dv.tabIndex = 0; // Tambahkan tabindex untuk navigasi keyboard
               
                dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl);

                // Tambahkan event listener untuk navigasi keyboard
                dv.addEventListener('keydown', function(event) {
                    const allDivs = document.querySelectorAll('.responsive-div');
                    const currentIndex = Array.from(allDivs).indexOf(this);
                    
                    if (event.key === 'ArrowDown') {
                        const nextDiv = allDivs[currentIndex + 1];
                        if (nextDiv) {
                            nextDiv.focus();
                            // Menggeser tampilan ke atas jika remote sudah di bawah
                            const divHeight = this.offsetHeight + 15; // tinggi div + margin
                            const containerScrollTop = container.scrollTop;
                            const divTop = this.offsetTop - containerScrollTop;
                            if (divTop > container.clientHeight - divHeight * 2) {
                                container.scrollTop += divHeight;
                            }
                        }
                    } else if (event.key === 'ArrowUp') {
                        const prevDiv = allDivs[currentIndex - 1];
                        if (prevDiv) {
                            prevDiv.focus();
                            // Menggeser tampilan ke bawah jika remote sudah di atas
                            const divHeight = this.offsetHeight + 15; // tinggi div + margin
                            const containerScrollTop = container.scrollTop;
                            const divTop = this.offsetTop - containerScrollTop;
                            if (divTop < divHeight) {
                                container.scrollTop -= divHeight;
                            }
                        }
                    } else if (event.key === 'Enter') {
                        this.click(); // Memicu fungsi onclick saat tombol Enter ditekan
                    }
                });

                dv.appendChild(img);
                dv.appendChild(pp);
                dv.appendChild(dur);
                container.appendChild(dv);
            });
            filesProcessed++;
            if (filesProcessed === totalFiles) {
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