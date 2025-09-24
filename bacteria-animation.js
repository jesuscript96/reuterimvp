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
        this.isMobile = this.detectMobile();

        // Configuration based on screen size
        this.config = this.getConfig();

        this.init();
        this.setupIntersectionObserver();
        this.setupResizeHandler();
    }

    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    getConfig() {
        const width = window.innerWidth;

        if (width < 768) {
            // Mobile
            return {
                videoCount: Math.floor(Math.random() * 6) + 8, // 8-13 videos (reducido)
                minSize: 20,
                maxSize: 45,
                minOpacity: 0.15,
                maxOpacity: 0.25
            };
        } else if (width < 1024) {
            // Tablet
            return {
                videoCount: Math.floor(Math.random() * 10) + 15, // 15-24 videos
                minSize: 25,
                maxSize: 60,
                minOpacity: 0.2,
                maxOpacity: 0.35
            };
        } else {
            // Desktop
            return {
                videoCount: Math.floor(Math.random() * 16) + 25, // 25-40 videos
                minSize: 30,
                maxSize: 85,
                minOpacity: 0.25,
                maxOpacity: 0.45
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
        video.autoplay = false; // Cambiado a false inicialmente
        video.playsInline = true;
        video.setAttribute('playsinline', ''); // Para iOS
        video.setAttribute('webkit-playsinline', ''); // Para iOS antiguo
        video.preload = 'metadata';

        // Add CSS class
        video.classList.add('bacteria-video');

        // Random positioning (avoid center area)
        const position = this.getRandomPosition();
        const size = this.getRandomSize();
        const opacity = this.getRandomOpacity();
        const rotation = Math.random() * 360;
        const animationDelay = Math.random() * 8; // 0-8 seconds delay
        const animationDuration = 12 + Math.random() * 16; // 12-28 seconds

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
                drift ${animationDuration * 1.2}s ease-in-out infinite ${animationDelay * 0.3}s
            `,
            zIndex: 0,
            filter: `blur(${this.isMobile ? '1px' : '0.5px'})` // Más blur en móvil
        });

        // Add video load event listeners with mobile optimization
        video.addEventListener('canplaythrough', () => {
            if (this.isVisible && !this.isMobile) {
                // Solo autoplay automático en desktop
                this.playVideo(video);
            }
        });

        video.addEventListener('loadedmetadata', () => {
            // En móvil, intentar reproducir después de interacción del usuario
            if (this.isMobile && this.isVisible) {
                this.attemptMobilePlay(video);
            }
        });

        // Error handling
        video.addEventListener('error', (e) => {
            console.warn('Video failed to load:', video.src, e);
            // Remover video fallido
            if (video.parentNode) {
                video.parentNode.removeChild(video);
            }
            this.removeVideoFromArray(video);
        });

        // Add to container and track
        this.container.appendChild(video);
        this.videos.push(video);
    }

    async playVideo(video) {
        try {
            await video.play();
        } catch (error) {
            // Silently handle autoplay failures
            console.debug('Video autoplay failed:', error);
        }
    }

    async attemptMobilePlay(video) {
        // En móvil, esperar un poco más y luego intentar reproducir
        setTimeout(async () => {
            try {
                await video.play();
            } catch (error) {
                // Si falla, ocultar el video o mostrar imagen estática
                video.style.opacity = '0';
                console.debug('Mobile video play failed:', error);
            }
        }, Math.random() * 2000 + 1000); // 1-3 segundos de delay
    }

    removeVideoFromArray(video) {
        const index = this.videos.indexOf(video);
        if (index > -1) {
            this.videos.splice(index, 1);
        }
    }

    getRandomPosition() {
        let x, y;
        let attempts = 0;
        const maxAttempts = 30; // Reducido para mejor performance

        do {
            x = Math.random() * 85; // 0-85% (más margen)
            y = Math.random() * 85; // 0-85%
            attempts++;
        } while (this.isInCenterArea(x, y) && attempts < maxAttempts);

        return { x, y };
    }

    isInCenterArea(x, y) {
        // Área de centro más grande para móvil
        const centerMargin = this.isMobile ? 35 : 25;
        const centerX = 50;
        const centerY = 50;
        
        return (Math.abs(x - centerX) < centerMargin && Math.abs(y - centerY) < centerMargin);
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
            rootMargin: '100px', // Margen más grande
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

    async playAllVideos() {
        const playPromises = this.videos.map(async (video) => {
            if (video.readyState >= 3) { // HAVE_FUTURE_DATA
                try {
                    await this.playVideo(video);
                } catch (error) {
                    // Silently handle failures
                }
            }
        });

        // En móvil, no esperar a que todos se reproduzcan
        if (!this.isMobile) {
            await Promise.allSettled(playPromises);
        }
    }

    pauseAllVideos() {
        this.videos.forEach(video => {
            try {
                video.pause();
            } catch (error) {
                // Silently handle errors
            }
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasDesktop = !this.isMobile;
                this.isMobile = this.detectMobile();
                const newConfig = this.getConfig();

                // Recrear si cambió significativamente o cambió de móvil a desktop
                if (Math.abs(newConfig.videoCount - this.config.videoCount) > 5 || 
                    wasDesktop !== !this.isMobile) {
                    this.config = newConfig;
                    this.destroy();
                    this.createBacteriaVideos();
                }
            }, 500); // Delay más largo para evitar múltiples recreaciones
        });
    }

    // Method to pause all animations (for performance)
    pauseAnimations() {
        this.videos.forEach(video => {
            try {
                video.style.animationPlayState = 'paused';
            } catch (error) {
                // Handle errors silently
            }
        });
    }

    // Method to resume all animations
    resumeAnimations() {
        this.videos.forEach(video => {
            try {
                video.style.animationPlayState = 'running';
            } catch (error) {
                // Handle errors silently
            }
        });
    }

    // Cleanup method
    destroy() {
        this.videos.forEach(video => {
            try {
                video.pause();
                video.src = '';
                if (video.parentNode) {
                    video.parentNode.removeChild(video);
                }
            } catch (error) {
                // Handle errors silently
            }
        });
        this.videos = [];
    }

    // Method to enable videos after user interaction (for mobile)
    enableAfterInteraction() {
        if (this.isMobile && this.videos.length > 0) {
            this.videos.forEach(async (video) => {
                try {
                    await this.playVideo(video);
                } catch (error) {
                    // Hide failed videos
                    video.style.opacity = '0';
                }
            });
        }
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

    // Enable videos after first user interaction (mobile optimization)
    const enableInteraction = () => {
        bacteriaAnimation.enableAfterInteraction();
        // Remove listeners after first interaction
        document.removeEventListener('touchstart', enableInteraction);
        document.removeEventListener('click', enableInteraction);
    };

    document.addEventListener('touchstart', enableInteraction, { once: true, passive: true });
    document.addEventListener('click', enableInteraction, { once: true });

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

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        bacteriaAnimation.destroy();
    });
});

// Preload videos for better performance (only on desktop)
const preloadVideos = () => {
    // Skip preloading on mobile to save bandwidth
    if (window.innerWidth <= 768 || 
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return;
    }

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

        // Remove after loading or timeout
        const cleanup = () => {
            try {
                if (video.parentNode) {
                    document.body.removeChild(video);
                }
            } catch (error) {
                // Silently handle cleanup errors
            }
        };

        video.addEventListener('loadedmetadata', cleanup);
        video.addEventListener('error', cleanup);
        
        // Timeout cleanup after 10 seconds
        setTimeout(cleanup, 10000);
    });
};

// Preload videos when page starts loading (desktop only)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadVideos);
} else {
    preloadVideos();
}