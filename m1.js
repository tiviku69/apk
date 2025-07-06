const buttons = document.querySelectorAll('.nav-button');
let currentIndex = 0;

function updateFocus() {
    buttons[currentIndex].focus();
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
        currentIndex = (currentIndex + 1) % buttons.length;
        updateFocus();
    } else if (event.key === 'ArrowUp') {
        currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        updateFocus();
    }
});

// Initialize focus
updateFocus();