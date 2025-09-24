class BacteriaAnimation {
    constructor() {
        this.container = document.getElementById('bacteria-container');
        this.videoSources = [
            'img/bacteria.mp4',
            'img/bacteria (1).mp4',
            'img/bacteria (2).mp4'
        ];
        this.videos = [];
        this.isVisible = true;

        // Configuration based on screen size
        this.config = this.getConfig();

        this.init();
        this.setupIntersectionObserver();
        this.setupResizeHandler();
    }

    getConfig() {
        const width = window.innerWidth;

        if (width < 768) {
            // Mobile
            return {
                videoCount: Math.floor(Math.random() * 8) + 15, // 15-22 videos
                minSize: 25,
                maxSize: 55,
                minOpacity: 0.2,
                maxOpacity: 0.35
            };
        } else if (width < 1024) {
            // Tablet
            return {
                videoCount: Math.floor(Math.random() * 12) + 20, // 20-31 videos
                minSize: 30,
                maxSize: 70,
                minOpacity: 0.25,
                maxOpacity: 0.4
            };
        } else {
            // Desktop
            return {
                videoCount: Math.floor(Math.random() * 16) + 30, // 30-45 videos
                minSize: 35,
                maxSize: 95,
                minOpacity: 0.3,
                maxOpacity: 0.5
            };
        }
    }

    init() {
        this.createBacteriaVideos();
    }

    createBacteriaVideos() {
        // Clear existing videos
        this.container.innerHTML = '';
        this.videos = [];

        for (let i = 0; i < this.config.videoCount; i++) {
            this.createBacteriaVideo(i);
        }
    }

    createBacteriaVideo(index) {
        const video = document.createElement('video');
        const randomVideoIndex = Math.floor(Math.random() * this.videoSources.length);

        // Video attributes
        video.src = this.videoSources[randomVideoIndex];
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'metadata';

        // Add CSS class
        video.classList.add('bacteria-video');

        // Random positioning (avoid center area)
        const position = this.getRandomPosition();
        const size = this.getRandomSize();
        const opacity = this.getRandomOpacity();
        const rotation = Math.random() * 360;
        const animationDelay = Math.random() * 10; // 0-10 seconds delay
        const animationDuration = 15 + Math.random() * 20; // 15-35 seconds

        // Apply styles
        Object.assign(video.style, {
            left: position.x + '%',
            top: position.y + '%',
            width: size + 'px',
            height: size + 'px',
            opacity: opacity,
            transform: `rotate(${rotation}deg)`,
            animation: `
                float${(index % 3) + 1} ${animationDuration}s ease-in-out infinite ${animationDelay}s,
                drift ${animationDuration * 1.5}s ease-in-out infinite ${animationDelay * 0.5}s
            `,
            zIndex: 0
        });

        // Add video load event listeners
        video.addEventListener('loadeddata', () => {
            if (this.isVisible) {
                video.play().catch(() => {
                    // Silently handle autoplay failures
                });
            }
        });

        // Add to container and track
        this.container.appendChild(video);
        this.videos.push(video);

    }

    getRandomPosition() {
        let x, y;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            x = Math.random() * 90; // 0-90%
            y = Math.random() * 90; // 0-90%
            attempts++;
        } while (this.isInCenterArea(x, y) && attempts < maxAttempts);

        return { x, y };
    }

    isInCenterArea(x, y) {
        // Avoid center area where main content is (30-70% width, 20-80% height)
        return (x > 20 && x < 80 && y > 15 && y < 85);
    }

    getRandomSize() {
        return Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize;
    }

    getRandomOpacity() {
        return Math.random() * (this.config.maxOpacity - this.config.minOpacity) + this.config.minOpacity;
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.isVisible = true;
                    this.playAllVideos();
                } else {
                    this.isVisible = false;
                    this.pauseAllVideos();
                }
            });
        }, options);

        observer.observe(this.container.parentElement);
    }

    playAllVideos() {
        this.videos.forEach(video => {
            if (video.readyState >= 3) { // HAVE_FUTURE_DATA
                video.play().catch(() => {
                    // Silently handle autoplay failures
                });
            }
        });
    }

    pauseAllVideos() {
        this.videos.forEach(video => {
            video.pause();
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newConfig = this.getConfig();

                // Only recreate if significant change in video count
                if (Math.abs(newConfig.videoCount - this.config.videoCount) > 3) {
                    this.config = newConfig;
                    this.createBacteriaVideos();
                }
            }, 250);
        });
    }

    // Method to pause all animations (for performance)
    pauseAnimations() {
        this.videos.forEach(video => {
            video.style.animationPlayState = 'paused';
        });
    }

    // Method to resume all animations
    resumeAnimations() {
        this.videos.forEach(video => {
            video.style.animationPlayState = 'running';
        });
    }

    // Cleanup method
    destroy() {
        this.videos.forEach(video => {
            video.pause();
            video.src = '';
            video.remove();
        });
        this.videos = [];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bacteria-container');
    if (!container) {
        return;
    }

    const bacteriaAnimation = new BacteriaAnimation();

    // Expose globally for debugging
    window.bacteriaAnimation = bacteriaAnimation;

    // Pause animations when tab is not visible (performance optimization)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            bacteriaAnimation.pauseAnimations();
            bacteriaAnimation.pauseAllVideos();
        } else {
            bacteriaAnimation.resumeAnimations();
            bacteriaAnimation.playAllVideos();
        }
    });
});

// Preload videos for better performance
const preloadVideos = () => {
    const videoSources = [
        'img/bacteria.mp4',
        'img/bacteria (1).mp4',
        'img/bacteria (2).mp4'
    ];

    videoSources.forEach(src => {
        // Create invisible video element for preloading
        const video = document.createElement('video');
        video.src = src;
        video.preload = 'metadata';
        video.style.display = 'none';
        video.muted = true;
        document.body.appendChild(video);

        // Remove after loading
        video.addEventListener('loadedmetadata', () => {
            document.body.removeChild(video);
        });
    });
};

// Preload videos when page starts loading
preloadVideos();