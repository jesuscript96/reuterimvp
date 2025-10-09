// Parallax effect for mobile devices
function initParallax() {
    const images = document.querySelectorAll('.image-placeholder');

    function updateParallax() {
        images.forEach(image => {
            const rect = image.getBoundingClientRect();
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;

            image.style.backgroundPosition = `center ${rate}px`;
        });
    }

    // Only apply on mobile devices
    if (window.innerWidth < 768) {
        window.addEventListener('scroll', updateParallax);
        updateParallax();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParallax);
} else {
    initParallax();
}
