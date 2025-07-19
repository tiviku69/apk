const images = document.querySelectorAll('.image');
let currentIndex = 0;

function updateImagePosition() {
    const shift = currentIndex * -170; // Adjust based on image width + margin
    document.querySelector('.image-container').style.transform = `translateX(${shift}px)`;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % images.length;
        updateImagePosition();
    } else if (event.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImagePosition();
    }
});