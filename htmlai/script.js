// Global Variables
let currentFocus = null;
let currentCarousel = null;
let sidebarOpen = false;
let searchActive = false;
let searchResults = [];

// Sample movie data
const movies = [
    { id: 1, title: "Wonder Woman 1984", description: "Gal Gadot returns as Wonder Woman in this epic action adventure.", image: "images/movie1.jpg", category: "trending" },
    { id: 2, title: "Dune", description: "A mythic and emotionally charged hero's journey.", image: "images/movie2.jpg", category: "trending" },
    { id: 3, title: "The Matrix Resurrections", description: "Return to a world of two realities: one, everyday life; the other, what lies behind it.", image: "images/movie3.jpg", category: "trending" },
    { id: 4, title: "Spider-Man: No Way Home", description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help.", image: "images/movie4.jpg", category: "trending" },
    { id: 5, title: "Encanto", description: "The tale of an extraordinary family, the Madrigals, who live hidden in the mountains of Colombia.", image: "images/movie5.jpg", category: "trending" },
    { id: 6, title: "The Mandalorian", description: "The travels of a lone bounty hunter in the outer reaches of the galaxy.", image: "images/series1.jpg", category: "series" },
    { id: 7, title: "Stranger Things", description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments.", image: "images/series2.jpg", category: "series" },
    { id: 8, title: "The Witcher", description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.", image: "images/series3.jpg", category: "series" }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
    setInitialFocus();
});

// Initialize application
function initializeApp() {
    console.log('Initializing Sapiens AI TV App...');
    
    // Create focus indicators if they don't exist
    createFocusIndicators();
    
    // Setup keyboard navigation for TV remote
    setupTVRemoteNavigation();
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.querySelector('.nav-item[data-action="search"]');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }
    
    // Close search overlay
    const closeSearch = document.getElementById('search-overlay');
    if (closeSearch) {
        closeSearch.addEventListener('click', (e) => {
            if (e.target === closeSearch) {
                closeSearchOverlay();
            }
        });
    }
    
    // Movie card clicks
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', handleMovieClick);
    });
}

// Load sample data
function loadSampleData() {
    const trendingCarousel = document.getElementById('trending-movies');
    const seriesCarousel = document.getElementById('tv-series');
    
    if (trendingCarousel && seriesCarousel) {
        // Clear existing content
        trendingCarousel.innerHTML = '';
        seriesCarousel.innerHTML = '';
        
        // Load trending movies
        movies.filter(movie => movie.category === 'trending').forEach(movie => {
            const card = createMovieCard(movie);
            trendingCarousel.appendChild(card);
        });
        
        // Load TV series
        movies.filter(movie => movie.category === 'series').forEach(movie => {
            const card = createMovieCard(movie);
            seriesCarousel.appendChild(card);
        });
        
        // Re-attach event listeners
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', handleMovieClick);
        });
    }
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = movie.id;
    card.innerHTML =-indicator"></div>
        <img src="${movie.image}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/280x240/1a1a1a/ffffff?text=No+Image'">
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <p>${movie.description}</p>
        </div>
    `;
    return card;
}

// Set initial focus
function setInitialFocus() {
    const firstNavItem = document.querySelector('.nav-item');
    const firstMovieCard = document.querySelector('.movie-card');
    
    if (firstMovieCard) {
        setFocus(firstMovieCard);
        currentFocus = firstMovieCard;
        currentCarousel = firstMovieCard.parentElement;
    }
}

// Create focus indicators
function createFocusIndicators() {
    // Add focus indicators to nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        if (!item.querySelector('.focus-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'focus-indicator';
            item.appendChild(indicator);
        }
    });
    
    // Add focus indicators to movie cards
    document.querySelectorAll('.movie-card').forEach(card => {
        if (!card.querySelector('.focus-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'focus-indicator';
            card.insertBefore(indicator, card.firstChild);
        }
    });
}

// TV Remote Navigation Setup
function setupTVRemoteNavigation() {
    // Standard TV remote keys
    const tvKeys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        enter: 13,
        back: 8,
        home: 36,
        menu: 93 // Context menu key
    };
    
    document.addEventListener('keydown', function(e) {
        // Prevent default browser behavior for TV navigation
        if ([tvKeys.left, tvKeys.up, tvKeys.right, tvKeys.down, tvKeys.enter, tvKeys.back].includes(e.keyCode)) {
            e.preventDefault();
        }
        
        switch(e.keyCode) {
            case tvKeys.left:
                handleLeftKey();
                break;
            case tvKeys.right:
                handleRightKey();
                break;
            case tvKeys.up:
                handleUpKey();
                break;
            case tvKeys.down:
                handleDownKey();
                break;
            case tvKeys.enter:
                handleEnterKey();
                break;
            case tvKeys.back:
                handleBackKey();
                break;
            case tvKeys.menu:
                toggleSidebar();
                break;
        }
    });
    
    // D-Pad simulation for testing (WASD keys)
    document.addEventListener('keydown', function(e) {
        switch(e.key.toLowerCase()) {
            case 'a':
                e.preventDefault();
                handleLeftKey();
                break;
            case 'd':
                e.preventDefault();
                handleRightKey();
                break;
            case 'w':
                e.preventDefault();
                handleUpKey();
                break;
            case 's':
                e.preventDefault();
                handleDownKey();
                break;
            case ' ':
                e.preventDefault();
                handleEnterKey();
                break;
            case 'escape':
                e.preventDefault();
                handleBackKey();
                break;
        }
    });
}

// Navigation Handlers
function handleLeftKey() {
    if (searchActive) {
        navigateSearchResults(-1);
        return;
    }
    
    if (sidebarOpen && currentFocus && currentFocus.closest('#sidebar')) {
        // Navigate within sidebar
        navigateSidebar(-1);
    } else {
        // Open sidebar or navigate left in carousel
        if (!sidebarOpen) {
            toggleSidebar();
        } else {
            // Move left in carousel
            if (currentCarousel) {
                const currentIndex = Array.from(currentCarousel.children).indexOf(currentFocus);
                if (currentIndex > 0) {
                    const previousCard = currentCarousel.children[currentIndex - 1];
                    setFocus(previousCard);
                }
            }
        }
    }
}

function handleRightKey() {
    if (searchActive) {
        navigateSearchResults(1);
        return;
    }
    
    if (sidebarOpen && currentFocus && currentFocus.closest('#sidebar')) {
        // Navigate within sidebar
        navigateSidebar(1);
    } else {
        // Close sidebar or navigate right in carousel
        if (sidebarOpen) {
            toggleSidebar();
            // After closing sidebar, focus on first movie card
            setTimeout(() => {
                const firstCard = document.querySelector('.movie-card');
                if (firstCard) setFocus(firstCard);
            }, 300);
        } else {
            // Move right in carousel - simulate scroll
            if (currentCarousel && currentFocus) {
                const currentIndex = Array.from(currentCarousel.children).indexOf(currentFocus);
                if (currentIndex < currentCarousel.children.length - 1) {
                    const nextCard = currentCarousel.children[currentIndex + 1];
                    setFocus(nextCard);
                    
                    // Smooth scroll to show the focused card
                    nextCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        }
    }
}

function handleUpKey() {
    if (searchActive) {
        // In search, go up in results
        navigateSearchResults(-1);
        return;
    }
    
    // Move to previous row or sidebar
    if (currentFocus && currentFocus.closest('.carousel')) {
        const currentRow = currentFocus.closest('.content-row');
        const previousRow = currentRow.previousElementSibling;
        
        if (previousRow && previousRow.querySelector('.carousel')) {
            const firstCard = previousRow.querySelector('.movie-card');
            if (firstCard) {
                setFocus(firstCard);
                currentCarousel = firstCard.parentElement;
            }
        } else if (!sidebarOpen) {
            // Open sidebar if at top row
            toggleSidebar();
        }
    }
}

function handleDownKey() {
    if (searchActive) {
        // In search, go down in results
        navigateSearchResults(1);
        return;
    }
    
    // Move to next row
    if (currentFocus && currentFocus.closest('.carousel')) {
        const currentRow = currentFocus.closest('.content-row');
        const nextRow = currentRow.nextElementSibling;
        
        if (nextRow && nextRow.querySelector('.carousel')) {
            const firstCard = nextRow.querySelector('.movie-card');
            if (firstCard) {
                setFocus(firstCard);
                currentCarousel = firstCard.parentElement;
            }
        }
    }
}

function handleEnterKey() {
    if (!currentFocus) return;
    
    if (currentFocus.closest('#sidebar')) {
        const action = currentFocus.dataset.action;
        handleSidebarAction(action);
    } else if (currentFocus.classList.contains('movie-card')) {
        handleMovieClick({ currentTarget: currentFocus });
    } else if (currentFocus.classList.contains('search-result')) {
        handleSearchResultSelect(currentFocus);
    }
}

function handleBackKey() {
    if (searchActive) {
        closeSearchOverlay();
    } else if (sidebarOpen) {
        toggleSidebar();
    } else {
        // Exit app or go to home
        console.log('Exit app or return to home');
    }
}

// Sidebar Navigation
function navigateSidebar(direction) {
    if (!currentFocus || !currentFocus.closest('#sidebar')) return;
    
    const navItems = document.querySelectorAll('#sidebar .nav-item');
    const currentIndex = Array.from(navItems).indexOf(currentFocus);
    let newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < navItems.length) {
        setFocus(navItems[newIndex]);
    }
}

// Search Navigation
function navigateSearchResults(direction) {
    if (!searchActive) return;
    
    const results = document.querySelectorAll('.search-result');
    if (results.length === 0) return;
    
    let currentIndex = -1;
    results.forEach((result, index) => {
        if (result.classList.contains('focused')) {
            currentIndex = index;
        }
    });
    
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= results.length) newIndex = results.length - 1;
    
    // Remove focus from all results
    results.forEach(result => result.classList.remove('focused'));
    
    // Set focus on new result
    if (results[newIndex]) {
        setFocus(results[newIndex]);
    }
}

// Focus Management
function setFocus(element) {
    if (!element) return;
    
    // Remove focus from current element
    if (currentFocus) {
        currentFocus.classList.remove('focused', 'active');
    }
    
    // Add focus to new element
    element.classList.add('focused');
    if (element.closest('#sidebar')) {
        element.classList.add('active');
    }
    
    // Update current focus
    currentFocus = element;
    
    // Scroll into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
 // Play focus sound (optional)
    playFocusSound();
}

function removeFocus() {
    if (currentFocus) {
        currentFocus.classList.remove('focused', 'active');
        currentFocus = null;
    }
}

// Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    sidebarOpen = !sidebarOpen;
    
    if (sidebarOpen) {
        sidebar.classList.remove('sidebar-closed');
        sidebar.classList.add('sidebar-open');
        mainContent.style.marginLeft = '250px';
        
        // Focus on first sidebar item
        setTimeout(() => {
            const firstNavItem = document.querySelector('.nav-item');
            if (firstNavItem) {
                setFocus(firstNavItem);
                currentCarousel = null;
            }
        }, 100);
    } else {
        sidebar.classList.add('sidebar-closed');
        sidebar.classList.remove('sidebar-open');
        mainContent.style.marginLeft = '0';
        
        // Return focus to previous content
        setTimeout(() => {
            const firstCard = document.querySelector('.movie-card');
            if (firstCard) {
                setFocus(firstCard);
                currentCarousel = firstCard.parentElement;
            }
        }, 300);
    }
}

function handleSidebarAction(action) {
    switch(action) {
        case 'search':
            openSearchOverlay();
            break;
        case 'home':
            loadHomeContent();
            toggleSidebar();
            break;
        case 'saved':
            loadSavedContent();
            toggleSidebar();
            break;
        case 'settings':
            loadSettings();
            toggleSidebar();
            break;
    }
}

// Search Functions
function openSearchOverlay() {
    const overlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    
    if (overlay && searchInput) {
        overlay.classList.add('show');
        searchActive = true;
        sidebarOpen = false;
        
        // Close sidebar if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.add('sidebar-closed');
            sidebar.classList.remove('sidebar-open');
            document.getElementById('main-content').style.marginLeft = '0';
        }
        
        // Focus on search input
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }
}

function closeSearchOverlay() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        searchActive = false;
        removeFocus();
        
        // Return focus to previous content
        setTimeout(() => {
            const firstCard = document.querySelector('.movie-card');
            if (firstCard) {
                setFocus(firstCard);
            }
        }, 300);
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    displaySearchResults(query);
}

function handleSearchKeydown(e) {
    if (e.keyCode === 13) { // Enter key
        const focusedResult = document.querySelector('.search-result.focused');
        if (focusedResult) {
            handleSearchResultSelect(focusedResult);
        } else {
            performSearch(e.target.value);
        }
    } else if (e.keyCode === 27) { // Escape key
        closeSearchOverlay();
    } else if ([37, 38, 39, 40].includes(e.keyCode)) {
        // Allow arrow keys for navigation
        e.stopPropagation();
    }
}

function displaySearchResults(query) {
    const resultsContainer = document.querySelector('.search-results') || createSearchResultsContainer();
    resultsContainer.innerHTML = '';
    
    if (!query) {
        searchResults = [];
        return;
    }
    
    // Filter movies based on query
    searchResults = movies.filter(movie => 
        movie.title.toLowerCase().includes(query) || 
        movie.description.toLowerCase().includes(query)
    );
    
    // Display results
    searchResults.forEach((movie, index) => {
        const result = document.createElement('div');
        result.className = 'search-result';
        result.innerHTML = `
            <div style="display: flex; align-items: center;">
                <img src="${movie.image}" alt="${movie.title}" style="width: 50px; height: 70px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
                <div>
                    <h4 style="font-size: 1.1rem; margin-bottom: 5px;">${movie.title}</h4>
                    <p style="color: #aaaaaa; font-size: 0.9rem;">${movie.description.substring(0, 100)}...</p>
                </div>
            </div>
        `;
        result.addEventListener('click', () => handleSearchResultSelect(result));
        resultsContainer.appendChild(result);
        
        // Set focus on first result
        if (index === 0) {
            setFocus(result);
        }
    });
}

function createSearchResultsContainer() {
    let container = document.querySelector('.search-results');
    if (!container) {
        container = document.createElement('div');
        container.className = 'search-results';
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(container);
        }
    }
    return container;
}

function handleSearchResultSelect(resultElement) {
    const index = Array.from(resultElement.parentElement.children).indexOf(resultElement);
    const selectedMovie = searchResults[index];
    
    if (selectedMovie) {
        // Simulate movie selection
        showMovieDetails(selectedMovie);
        closeSearchOverlay();
    }
}

function performSearch(query) {
    console.log('Performing search for:', query);
    // Implement actual search functionality here
}

// Content Loading Functions
function loadHomeContent() {
    console.log('Loading home content...');
    loadSampleData();
}

function loadSavedContent() {
    console.log('Loading saved content...');
    // Implement saved content loading
}

function loadSettings() {
    console.log('Loading settings...');
    // Implement settings loading
}

// Movie Interaction
function handleMovieClick(e) {
    const movieId = e.currentTarget.dataset.id;
    const movie = movies.find(m => m.id == movieId);
    
    if (movie) {
        showMovieDetails(movie);
    }
}

function showMovieDetails(movie) {
    // Create modal or navigate to details page
    console.log('Showing details for:', movie.title);
    
    // For demo, show alert with movie info
    alert(`Now playing: ${movie.title}\n\n${movie.description}`);
    
    // In a real app, you would:
    // 1. Open a details modal
    // 2. Navigate to a details page
    // 3. Start playback
}

// Utility Functions
function playFocusSound() {
    // Create and play a subtle focus sound
    // This would typically use Web Audio API or a sound file
    console.log('Focus sound played');
}

function scrollCarousel(carousel, direction) {
    const scrollAmount = 300;
    const currentScroll = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    
    if (direction === 'left') {
        carousel.scrollTo({
            left: Math.max(0, currentScroll - scrollAmount),
            behavior: 'smooth'
        });
    } else {
        carousel.scrollTo({
            left: Math.min(maxScroll, currentScroll + scrollAmount),
            behavior: 'smooth'
        });
    }
}

// Initialize search overlay if it doesn't exist
function initializeSearchOverlay() {
    if (!document.getElementById('search-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-container">
                <h2>🔍 Search</h2>
                <input type="text" id="search-input" placeholder="Search for movies, TV shows..." autocomplete="off">
                <div class="search-results"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Re-setup event listeners after DOM update
        setupEventListeners();
    }
}

// Auto-initialize search overlay
initializeSearchOverlay();

// Debug function - press F12 to see console logs
console.log('Sapiens AI TV App initialized successfully!');
console.log('Use WASD or arrow keys to navigate');
console.log('Space/Enter to select, Escape/Back to go back');
console.log('Menu key or "A" to open sidebar');

