document.addEventListener('keydown', function(event) {
    const activeElement = document.activeElement;
    const videoItems = document.querySelectorAll('.video-item');

    if (event.key === 'ArrowRight') {
        const next = activeElement.nextElementSibling;
        if (next && next.classList.contains('video-item')) {
            next.focus();
        }
    }

    if (event.key === 'ArrowLeft') {
        const previous = activeElement.previousElementSibling;
        if (previous && previous.classList.contains('video-item')) {
            previous.focus();
        }
    }

    if (event.key === 'Enter') {
        alert(`You selected: ${activeElement.querySelector('h2').innerText}`);
    }
});