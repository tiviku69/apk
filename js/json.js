const files = [ 'captain.json','ghost.json' ]; // Array file JSON

files.forEach(file => { fetch(file)
.then(response => response.json())
.then(data => { data.forEach(item => {

const scrollmenu = document.getElementById('scrollmenu');
scrollmenu.align ="center";
             
const button = document.createElement('button');
button.onclick = () => playVideo(item.lnk);
function playVideo(videoFile) {
            window.location.href = `g1.html?video=${videoFile}`;
            }

const img = document.createElement('img');
img.className = "gfilm";
img.src = item.logo;
img.alt = item.ttl;


                           scrollmenu.appendChild(button);
                           button.appendChild(img);
                           
                           });
                       })
                   
.catch(error => console.error('Error loading JSON:', error));
           });

// Menangani navigasi dengan tombol remote
        document.addEventListener('keydown', function(event) {
            const buttons = document.querySelectorAll('.button');
            let currentIndex = Array.from(buttons).findIndex(button => document.activeElement === button);
            
            if (event.key === "ArrowDown") {
                currentIndex = (currentIndex + 1) % buttons.length;
                buttons[currentIndex].focus();
            } else if (event.key === "ArrowUp") {
                currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                buttons[currentIndex].focus();
            } else if (event.key === "Enter") {
                buttons[currentIndex].click();
            }
        });
