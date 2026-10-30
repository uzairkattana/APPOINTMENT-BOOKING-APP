/**
 * Feature-Preserving Lazy Loader
 * Implements comprehensive lazy loading while maintaining all accessibility and functionality
 */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.1,
            enableSections: true,
            enableImages: true,
            enableComponents: true,
            enableIframes: true,
            fallbackDelay: 100,
            retryAttempts: 3,
            ...options
        };
        
        this.observers = new Map();
        this.loadedElements = new Set();
        this.loadingElements = new Set();
        this.errorElements = new Set();
        this.retryCount = new Map();
        
        this.init();
    }

    init() {
        // Setup intersection observers
        this.setupObservers();
        
        // Process existing lazy elements
        this.processExistingElements();
        
        // Setup mutation observer for dynamic content
        this.setupMutationObserver();
        
        // Add fallback for browsers without IntersectionObserver
        this.setupFallbacks();
        
        // Add accessibility enhancements
        this.enhanceAccessibility();
    }

    setupObservers() {
        // Create observers for different types of content
        const observerConfigs = [
            {
                name: 'sections',
                selector: '[data-lazy-section], .lazy-section',
                handler: this.loadSection.bind(this)
            },
            {
                name: 'images',
                selector: '[data-lazy-src], .lazy-image',
                handler: this.loadImage.bind(this)
            },
            {
                name: 'components',
                selector: '[data-lazy-component], .lazy-component',
                handler: this.loadComponent.bind(this)
            },
            {
                name: 'iframes',
                selector: '[data-lazy-iframe], .lazy-iframe',
                handler: this.loadIframe.bind(this)
            }
        ];

        if ('IntersectionObserver' in window) {
            observerConfigs.forEach(config => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !this.isLoaded(entry.target)) {
                            config.handler(entry.target);
                        }
                    });
                }, {
                    rootMargin: this.options.rootMargin,
                    threshold: this.options.threshold
                });

                this.observers.set(config.name, observer);
            });
        }
    }

    processExistingElements() {
        const selectors = [
            '[data-lazy-section], .lazy-section',
            '[data-lazy-src], .lazy-image',
            '[data-lazy-component], .lazy-component',
            '[data-lazy-iframe], .lazy-iframe'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                this.observeElement(element);
            });
        });
    }

    setupMutationObserver() {
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            this.processNewElement(node);
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    processNewElement(element) {
        // Check if the element itself needs lazy loading
        if (this.needsLazyLoading(element)) {
            this.observeElement(element);
        }

        // Check for lazy elements within the new element
        const lazyElements = element.querySelectorAll ? 
            element.querySelectorAll('[data-lazy-section], .lazy-section, [data-lazy-src], .lazy-image, [data-lazy-component], .lazy-component, [data-lazy-iframe], .lazy-iframe') : [];
        
        lazyElements.forEach(lazyElement => {
            this.observeElement(lazyElement);
        });
    }

    needsLazyLoading(element) {
        return element.matches && element.matches(
            '[data-lazy-section], .lazy-section, [data-lazy-src], .lazy-image, [data-lazy-component], .lazy-component, [data-lazy-iframe], .lazy-iframe'
        );
    }

    observeElement(element) {
        if (this.isLoaded(element) || this.isLoading(element)) return;

        // Determine which observer to use
        let observerName = null;
        if (element.matches('[data-lazy-section], .lazy-section')) {
            observerName = 'sections';
        } else if (element.matches('[data-lazy-src], .lazy-image')) {
            observerName = 'images';
        } else if (element.matches('[data-lazy-component], .lazy-component')) {
            observerName = 'components';
        } else if (element.matches('[data-lazy-iframe], .lazy-iframe')) {
            observerName = 'iframes';
        }

        if (observerName && this.observers.has(observerName)) {
            this.observers.get(observerName).observe(element);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.setupScrollFallback(element);
        }
    }

    setupFallbacks() {
        if (!('IntersectionObserver' in window)) {
            // Use scroll-based lazy loading as fallback
            this.setupScrollBasedLazyLoading();
        }
    }

    setupScrollBasedLazyLoading() {
        const checkVisibility = () => {
            const elements = document.querySelectorAll(
                '[data-lazy-section]:not(.loaded), .lazy-section:not(.loaded), ' +
                '[data-lazy-src]:not(.loaded), .lazy-image:not(.loaded), ' +
                '[data-lazy-component]:not(.loaded), .lazy-component:not(.loaded), ' +
                '[data-lazy-iframe]:not(.loaded), .lazy-iframe:not(.loaded)'
            );

            elements.forEach(element => {
                if (this.isInViewport(element)) {
                    this.loadElementByType(element);
                }
            });
        };

        window.addEventListener('scroll', checkVisibility, { passive: true });
        window.addEventListener('resize', checkVisibility, { passive: true });
        
        // Check immediately
        checkVisibility();
    }

    setupScrollFallback(element) {
        const checkElementVisibility = () => {
            if (this.isInViewport(element)) {
                this.loadElementByType(element);
                window.removeEventListener('scroll', checkElementVisibility);
                window.removeEventListener('resize', checkElementVisibility);
            }
        };

        window.addEventListener('scroll', checkElementVisibility, { passive: true });
        window.addEventListener('resize', checkElementVisibility, { passive: true });
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const margin = parseInt(this.options.rootMargin);
        
        return rect.top < windowHeight + margin && rect.bottom > -margin;
    }

    loadElementByType(element) {
        if (element.matches('[data-lazy-section], .lazy-section')) {
            this.loadSection(element);
        } else if (element.matches('[data-lazy-src], .lazy-image')) {
            this.loadImage(element);
        } else if (element.matches('[data-lazy-component], .lazy-component')) {
            this.loadComponent(element);
        } else if (element.matches('[data-lazy-iframe], .lazy-iframe')) {
            this.loadIframe(element);
        }
    }

    // Section loading with accessibility preservation
    async loadSection(element) {
        if (this.isLoaded(element) || this.isLoading(element)) return;

        this.setLoading(element);
        element.classList.add('lazy-loading');

        try {
            // Preserve screen reader access
            this.preserveAccessibility(element);

            // Add loading animation
            this.addLoadingAnimation(element);

            // Load section content
            await this.loadSectionContent(element);

            // Mark as loaded
            this.setLoaded(element);
            element.classList.remove('lazy-loading');
            element.classList.add('lazy-loaded');

            // Trigger any post-load scripts
            this.triggerPostLoadEvents(element);

        } catch (error) {
            this.handleLoadError(element, error);
        }
    }

    async loadSectionContent(element) {
        const src = element.dataset.lazySrc;
        
        if (src) {
            // Load external content
            const response = await fetch(src);
            if (!response.ok) throw new Error(`Failed to load section: ${response.status}`);
            
            const content = await response.text();
            element.innerHTML = content;
        }

        // Load any embedded scripts
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.async = true;
                document.head.appendChild(newScript);
            }
        });
    }

    // Image loading with fallback and accessibility
    async loadImage(element) {
        if (this.isLoaded(element) || this.isLoading(element)) return;

        this.setLoading(element);
        const src = element.dataset.lazySrc || element.dataset.src;

        if (!src) {
            this.handleLoadError(element, new Error('No src specified'));
            return;
        }

        try {
            // Create a new image to preload
            const img = new Image();
            
            // Preserve accessibility
            if (element.alt) {
                img.alt = element.alt;
            } else if (element.dataset.alt) {
                img.alt = element.dataset.alt;
                element.alt = element.dataset.alt;
            }

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = src;
            });

            // Update the actual element
            if (element.tagName === 'IMG') {
                element.src = src;
            } else {
                element.style.backgroundImage = `url(${src})`;
            }

            this.setLoaded(element);
            element.classList.add('lazy-loaded');

            // Add fade-in animation
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.3s ease';
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });

        } catch (error) {
            this.handleLoadError(element, error);
        }
    }

    // Component loading with state preservation
    async loadComponent(element) {
        if (this.isLoaded(element) || this.isLoading(element)) return;

        this.setLoading(element);
        element.classList.add('lazy-loading');

        try {
            const componentType = element.dataset.lazyComponent;
            const componentSrc = element.dataset.componentSrc;

            if (componentSrc) {
                // Load external component
                const response = await fetch(componentSrc);
                if (!response.ok) throw new Error(`Failed to load component: ${response.status}`);
                
                const componentHTML = await response.text();
                element.innerHTML = componentHTML;
            }

            // Initialize component if it has a specific initializer
            if (componentType && window[`init${componentType}`]) {
                window[`init${componentType}`](element);
            }

            this.setLoaded(element);
            element.classList.remove('lazy-loading');
            element.classList.add('lazy-loaded');

            // Trigger component loaded event
            element.dispatchEvent(new CustomEvent('componentLoaded', {
                detail: { type: componentType }
            }));

        } catch (error) {
            this.handleLoadError(element, error);
        }
    }

    // Iframe loading with security considerations
    async loadIframe(element) {
        if (this.isLoaded(element) || this.isLoading(element)) return;

        this.setLoading(element);
        const src = element.dataset.lazyIframe;

        if (!src) {
            this.handleLoadError(element, new Error('No iframe src specified'));
            return;
        }

        try {
            // Create actual iframe
            const iframe = document.createElement('iframe');
            iframe.src = src;
            
            // Copy attributes
            Array.from(element.attributes).forEach(attr => {
                if (attr.name !== 'data-lazy-iframe') {
                    iframe.setAttribute(attr.name, attr.value);
                }
            });

            // Add security attributes
            iframe.sandbox = element.dataset.sandbox || 'allow-scripts allow-same-origin';
            iframe.loading = 'lazy';

            // Replace placeholder with iframe
            element.parentNode.replaceChild(iframe, element);

            this.setLoaded(iframe);
            iframe.classList.add('lazy-loaded');

        } catch (error) {
            this.handleLoadError(element, error);
        }
    }

    // Accessibility preservation methods
    preserveAccessibility(element) {
        // Ensure screen readers can still access content
        if (element.getAttribute('aria-hidden')) {
            element.setAttribute('data-original-aria-hidden', element.getAttribute('aria-hidden'));
        }
        element.removeAttribute('aria-hidden');

        // Add loading state for screen readers
        element.setAttribute('aria-busy', 'true');
        element.setAttribute('aria-live', 'polite');
    }

    enhanceAccessibility() {
        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Load any lazy content that's about to receive focus
                const focused = document.activeElement;
                const nextFocusable = this.getNextFocusableElement(focused);
                
                if (nextFocusable && this.needsLazyLoading(nextFocusable)) {
                    this.loadElementByType(nextFocusable);
                }
            }
        });
    }

    getNextFocusableElement(current) {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const currentIndex = Array.from(focusableElements).indexOf(current);
        return focusableElements[currentIndex + 1];
    }

    // Utility methods for state management
    isLoaded(element) {
        return this.loadedElements.has(element) || element.classList.contains('lazy-loaded');
    }

    isLoading(element) {
        return this.loadingElements.has(element);
    }

    setLoading(element) {
        this.loadingElements.add(element);
    }

    setLoaded(element) {
        this.loadedElements.add(element);
        this.loadingElements.delete(element);
        element.setAttribute('aria-busy', 'false');
        
        // Restore original aria-hidden if it existed
        const originalAriaHidden = element.getAttribute('data-original-aria-hidden');
        if (originalAriaHidden !== null) {
            element.setAttribute('aria-hidden', originalAriaHidden);
            element.removeAttribute('data-original-aria-hidden');
        }
    }

    addLoadingAnimation(element) {
        if (!element.classList.contains('loading-animation-added')) {
            element.classList.add('loading-animation-added');
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            
            const skeleton = document.createElement('div');
            skeleton.className = 'lazy-loading-skeleton';
            skeleton.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                z-index: 1;
            `;
            
            element.appendChild(skeleton);
            
            // Remove skeleton after loading
            element.addEventListener('lazy-loaded', () => {
                skeleton.remove();
            }, { once: true });
        }
    }

    handleLoadError(element, error) {
        this.loadingElements.delete(element);
        this.errorElements.add(element);
        element.classList.add('lazy-error');
        element.setAttribute('aria-busy', 'false');
        
        console.warn('Lazy loading failed:', error, element);

        // Retry logic
        const retryCount = this.retryCount.get(element) || 0;
        if (retryCount < this.options.retryAttempts) {
            this.retryCount.set(element, retryCount + 1);
            setTimeout(() => {
                this.errorElements.delete(element);
                element.classList.remove('lazy-error');
                this.loadElementByType(element);
            }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
        }

        // Dispatch error event
        element.dispatchEvent(new CustomEvent('lazyLoadError', {
            detail: { error, retryCount }
        }));
    }

    triggerPostLoadEvents(element) {
        // Trigger custom initialization if specified
        const initScript = element.dataset.initScript;
        if (initScript && window[initScript]) {
            window[initScript](element);
        }

        // Dispatch loaded event
        element.dispatchEvent(new CustomEvent('lazy-loaded'));
    }

    // Public API
    loadAll() {
        const allLazyElements = document.querySelectorAll(
            '[data-lazy-section], .lazy-section, [data-lazy-src], .lazy-image, ' +
            '[data-lazy-component], .lazy-component, [data-lazy-iframe], .lazy-iframe'
        );
        
        allLazyElements.forEach(element => {
            this.loadElementByType(element);
        });
    }

    getStats() {
        return {
            totalElements: this.loadedElements.size + this.loadingElements.size + this.errorElements.size,
            loaded: this.loadedElements.size,
            loading: this.loadingElements.size,
            errors: this.errorElements.size
        };
    }

    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clear state
        this.loadedElements.clear();
        this.loadingElements.clear();
        this.errorElements.clear();
        this.retryCount.clear();
    }
}

// Auto-initialize the lazy loader
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
    console.log('✓ Feature-preserving lazy loader initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}
