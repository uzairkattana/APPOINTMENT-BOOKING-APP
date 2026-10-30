/**
 * Progressive Enhancement System
 * Loads features incrementally while maintaining full functionality
 */

class ProgressiveEnhancer {
    constructor() {
        this.features = new Map();
        this.loadedFeatures = new Set();
        this.criticalLoaded = false;
        this.intersectionObserver = null;
        
        this.init();
    }

    init() {
        // Load critical features immediately
        this.loadCriticalFeatures();
        
        // Setup lazy loading for non-critical features
        this.setupIntersectionObserver();
        
        // Load features based on user interaction
        this.setupInteractionLoading();
        
        // Load remaining features after page load
        this.setupDeferredLoading();
    }

    // Load essential features first
    loadCriticalFeatures() {
        const critical = [
            'navigation',
            'basic-styling',
            'accessibility'
        ];

        critical.forEach(feature => this.loadFeature(feature));
        this.criticalLoaded = true;
        
        // Dispatch critical loaded event
        document.dispatchEvent(new CustomEvent('criticalFeaturesLoaded'));
    }

    // Setup intersection observer for lazy loading
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const feature = entry.target.dataset.feature;
                        if (feature && !this.loadedFeatures.has(feature)) {
                            this.loadFeature(feature);
                            this.intersectionObserver.unobserve(entry.target);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
        }
    }

    // Load features on user interaction
    setupInteractionLoading() {
        // Load interactive features on first user interaction
        const events = ['click', 'keydown', 'touchstart', 'scroll'];
        const onFirstInteraction = () => {
            this.loadFeature('interactive-elements');
            events.forEach(event => 
                document.removeEventListener(event, onFirstInteraction, { passive: true })
            );
        };

        events.forEach(event => 
            document.addEventListener(event, onFirstInteraction, { passive: true })
        );
    }

    // Load remaining features after initial load
    setupDeferredLoading() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadDeferredFeatures();
            });
        } else {
            this.loadDeferredFeatures();
        }
    }

    loadDeferredFeatures() {
        // Use requestIdleCallback if available, otherwise setTimeout
        const loadWhenIdle = (callback) => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(callback, { timeout: 1000 });
            } else {
                setTimeout(callback, 100);
            }
        };

        loadWhenIdle(() => {
            this.loadFeature('animations');
            this.loadFeature('advanced-interactions');
            this.loadFeature('image-optimization');
            this.loadFeature('lazy-loading');
            this.loadFeature('analytics');
        });
    }

    // Generic feature loading method
    loadFeature(featureName) {
        if (this.loadedFeatures.has(featureName)) return;

        const loader = this.getFeatureLoader(featureName);
        if (loader) {
            try {
                loader();
                this.loadedFeatures.add(featureName);
                console.log(`✓ Feature loaded: ${featureName}`);
                
                // Dispatch feature loaded event
                document.dispatchEvent(new CustomEvent('featureLoaded', {
                    detail: { feature: featureName }
                }));
            } catch (error) {
                console.warn(`Failed to load feature: ${featureName}`, error);
            }
        }
    }

    // Get appropriate loader for each feature
    getFeatureLoader(featureName) {
        const loaders = {
            'navigation': () => this.enhanceNavigation(),
            'basic-styling': () => this.applyBasicStyling(),
            'accessibility': () => this.enhanceAccessibility(),
            'interactive-elements': () => this.enhanceInteractiveElements(),
            'animations': () => this.enableAnimations(),
            'advanced-interactions': () => this.enableAdvancedInteractions(),
            'image-optimization': () => this.loadImageOptimization(),
            'lazy-loading': () => this.loadLazyLoading(),
            'analytics': () => this.loadAnalytics()
        };

        return loaders[featureName];
    }

    // Feature enhancement methods
    enhanceNavigation() {
        // Enhance navigation without breaking existing functionality
        const navLinks = document.querySelectorAll('a[href]');
        navLinks.forEach(link => {
            if (!link.classList.contains('enhanced')) {
                link.classList.add('enhanced');
                
                // Add smooth scroll for internal links
                if (link.getAttribute('href').startsWith('#')) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const target = document.querySelector(link.getAttribute('href'));
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    });
                }
            }
        });
    }

    applyBasicStyling() {
        // Apply progressive styling enhancements
        if (!document.querySelector('#progressive-styles')) {
            const styles = document.createElement('style');
            styles.id = 'progressive-styles';
            styles.textContent = `
                .enhanced {
                    transition: all 0.2s ease;
                }
                
                .fade-in {
                    opacity: 0;
                    animation: fadeIn 0.5s ease forwards;
                }
                
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
                
                .loading-skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }
                
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    enhanceAccessibility() {
        // Enhance accessibility features
        document.querySelectorAll('button, a').forEach(element => {
            if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
                element.setAttribute('aria-label', 'Interactive element');
            }
        });

        // Add focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('click', () => {
            document.body.classList.remove('using-keyboard');
        });
    }

    enhanceInteractiveElements() {
        // Enhance form and button interactions
        const buttons = document.querySelectorAll('button, .btn-primary');
        buttons.forEach(button => {
            if (!button.classList.contains('interactive-enhanced')) {
                button.classList.add('interactive-enhanced');
                
                // Add ripple effect
                button.addEventListener('click', (e) => {
                    const ripple = document.createElement('span');
                    const rect = button.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.cssText = `
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.3);
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        pointer-events: none;
                    `;
                    
                    if (!document.querySelector('#ripple-styles')) {
                        const rippleStyles = document.createElement('style');
                        rippleStyles.id = 'ripple-styles';
                        rippleStyles.textContent = `
                            @keyframes ripple {
                                to {
                                    transform: scale(4);
                                    opacity: 0;
                                }
                            }
                            .interactive-enhanced {
                                position: relative;
                                overflow: hidden;
                            }
                        `;
                        document.head.appendChild(rippleStyles);
                    }
                    
                    button.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                });
            }
        });
    }

    enableAnimations() {
        // Enable smooth animations with performance considerations
        if ('IntersectionObserver' in window) {
            const animateOnScroll = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        animateOnScroll.unobserve(entry.target);
                    }
                });
            });

            document.querySelectorAll('.booking-card, .contact-method').forEach(el => {
                animateOnScroll.observe(el);
            });
        }
    }

    enableAdvancedInteractions() {
        // Add advanced interaction features
        this.setupKeyboardNavigation();
        this.setupGestureHandlers();
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const focused = document.activeElement;
                if (focused && focused.blur) {
                    focused.blur();
                }
            }
        });
    }

    setupGestureHandlers() {
        // Add touch gesture support where appropriate
        if ('ontouchstart' in window) {
            let touchStartX = 0;
            let touchStartY = 0;
            
            document.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });
            
            document.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const deltaX = touchStartX - touchEndX;
                const deltaY = touchStartY - touchEndY;
                
                // Handle swipe gestures if needed
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    // Horizontal swipe detected
                    document.dispatchEvent(new CustomEvent('swipe', {
                        detail: { direction: deltaX > 0 ? 'left' : 'right' }
                    }));
                }
            });
        }
    }

    loadImageOptimization() {
        // Load image optimization system
        if (!window.imageOptimizer) {
            // Dynamically load the image optimizer if not already loaded
            const script = document.createElement('script');
            script.src = 'js/image-optimizer.js';
            script.onload = () => {
                console.log('✓ Image optimization loaded via progressive enhancement');
            };
            document.head.appendChild(script);
        } else {
            console.log('✓ Image optimization already available');
        }
    }

    loadLazyLoading() {
        // Load comprehensive lazy loading system
        if (!window.lazyLoader) {
            // Dynamically load the lazy loader if not already loaded
            const script = document.createElement('script');
            script.src = 'js/lazy-loader.js';
            script.onload = () => {
                console.log('✓ Feature-preserving lazy loading loaded via progressive enhancement');
            };
            document.head.appendChild(script);
        } else {
            console.log('✓ Lazy loading already available');
        }
    }

    loadAnalytics() {
        // Load analytics in a privacy-friendly way
        if (window.location.hostname !== 'localhost') {
            // Only load analytics on production
            console.log('Analytics loaded (placeholder)');
        }
    }

    // Utility methods
    observeElement(element, feature) {
        if (this.intersectionObserver && element) {
            element.dataset.feature = feature;
            this.intersectionObserver.observe(element);
        }
    }

    // Public API
    isFeatureLoaded(featureName) {
        return this.loadedFeatures.has(featureName);
    }

    forceLoadFeature(featureName) {
        this.loadFeature(featureName);
    }
}

// Initialize progressive enhancement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.progressiveEnhancer = new ProgressiveEnhancer();
    });
} else {
    window.progressiveEnhancer = new ProgressiveEnhancer();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressiveEnhancer;
}
