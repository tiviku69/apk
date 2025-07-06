const files = [ 'captain.json','ghost.json' ]; // Array file JSON

const scrollmenu = document.createElement('div');
scrollmenu.align ="center";
scrollmenu.className = "scrollmenu";
document.body.appendChild(scrollmenu);

files.forEach(file => { fetch(file)
.then(response => response.json())
.then(data => { data.forEach(item => {
                           
const button = document.createElement('button');

const img = document.createElement('img');
img.className = "gfilm";
img.src = item.logo;
img.alt = item.ttl;

const link = document.createElement('a');
link.className = "film";
link.href = item.lnk;
link.target = "_blank"; // Buka di tab baru
                           link.appendChild(button);
                           scrollmenu.appendChild(link);
                           button.appendChild(img);
                           button.onclick = () => {
                        window.location.href = `ply.html?url=${encodeURIComponent(item.lnk)}`;
                    };
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
