document.addEventListener('keydown', function(event) {
    const items = document.querySelectorAll('.nav-item');
    let currentIndex = Array.from(items).findIndex(item => document.activeElement === item);
    
    switch(event.key) {
        case 'ArrowDown':
            if (currentIndex < items.length - 1) {
                items[currentIndex + 1].focus();
            }
            break;
        case 'ArrowUp':
            if (currentIndex > 0) {
                items[currentIndex - 1].focus();
            }
            break;
        case 'Enter':
            if (currentIndex !== -1) {
                window.location.href = items[currentIndex].href;
            }
            break;
    }
});