/**
 * Enhanced Responsive Scaling Handler
 * Maintains consistent element sizes during browser scaling
 */
const responsiveHandler = {
    // Original design dimensions
    designWidth: 1600,
    designHeight: 900,
    
    // Reference scale based on initial load
    baseScale: 1,
    
    // Initialize on page load
    init: function() {
        const wrapper = document.querySelector('.main-wrapper');
        
        // Store initial browser zoom level
        this.baseScale = 1;
        
        // Apply initial scaling
        this.adjustScale();
        
        // Set up event listeners
        window.addEventListener('resize', this.adjustScale.bind(this));
        
        // Detect zoom changes with polling (no direct browser zoom event available)
        this.setupZoomDetection();
        
        console.log("Responsive handler initialized");
    },
    
    // Adjust scale based on current viewport and zoom level
    adjustScale: function() {
        const wrapper = document.querySelector('.main-wrapper');
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate scale factors (accounting for browser zoom)
        const scaleX = viewportWidth / this.designWidth;
        const scaleY = viewportHeight / this.designHeight;
        
        // Use the smaller scale to ensure everything fits
        const scale = Math.min(scaleX, scaleY) * 0.95; // 95% to add small margin
        
        // Apply the transform scale to maintain proportions
        wrapper.style.transform = `scale(${scale})`;
        
        // Adjust the wrapper size and positioning to account for scaling
        wrapper.style.transformOrigin = 'center center';
        wrapper.style.height = `${this.designHeight}px`;
        wrapper.style.width = `${this.designWidth}px`;
        wrapper.style.maxWidth = 'none';
        
        // Ensure the wrapper is in the center of the viewport
        wrapper.style.position = 'absolute';
        wrapper.style.top = '50%';
        wrapper.style.left = '50%';
        wrapper.style.marginLeft = `-${this.designWidth / 2}px`;
        wrapper.style.marginTop = `-${this.designHeight / 2}px`;
        
        // Force container position consistency (make sure gap with title is preserved)
        const container = document.querySelector('.container');
        if (container) {
            container.style.position = 'absolute';
            container.style.top = '250px'; // Changed from 200px to move container much lower
        }
        
        // Scale modals to match game scale
        this.adjustModalScale(scale);
        
        // Adjust body height to account for scaled content
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        
        console.log(`Viewport: ${viewportWidth}x${viewportHeight}, Applied Scale: ${scale}`);
    },
    
    // Scale modals to match the game scale
    adjustModalScale: function(scale) {
        // Scale any visible modals
        const modalElements = [
            document.querySelector('.modal-content'),
            document.querySelector('.video-modal-content')
        ];
        
        modalElements.forEach(element => {
            if (element && element.offsetParent !== null) { // Check if visible
                element.style.transform = `scale(${scale})`;
                element.style.transformOrigin = 'center center';
                
                // Adjust hologram videos if present
                const hologramVideos = document.querySelectorAll('.hologram-video');
                hologramVideos.forEach(video => {
                    // Get position relative to button and recalculate
                    const buttonElement = document.querySelector('.sector-btn:hover') || 
                                         document.querySelector('.sector-btn:focus');
                    if (buttonElement) {
                        const buttonRect = buttonElement.getBoundingClientRect();
                        const rightPosition = buttonRect.right + 20;
                        
                        video.style.transform = `translateY(-50%) scale(${scale})`;
                        video.style.transformOrigin = 'left center';
                        video.style.left = rightPosition + 'px';
                        video.style.top = (buttonRect.top + buttonRect.height/2) + 'px';
                    }
                });
            }
        });
    },
    
    // Setup detection for browser zoom changes
    setupZoomDetection: function() {
        // Store initial device pixel ratio
        let lastPixelRatio = window.devicePixelRatio || 1;
        
        // Check for changes periodically
        setInterval(() => {
            const newPixelRatio = window.devicePixelRatio || 1;
            
            if (newPixelRatio !== lastPixelRatio) {
                console.log(`Zoom changed: ${lastPixelRatio} → ${newPixelRatio}`);
                lastPixelRatio = newPixelRatio;
                this.adjustScale();
            }
        }, 500); // Check every half second
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    responsiveHandler.init();
});

// Also handle orientation changes for mobile devices
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        responsiveHandler.adjustScale();
    }, 200); // Short delay to let orientation change complete
});
