/**
 * Lightweight Image Optimization System
 * Provides lazy loading, WebP conversion, and responsive images while maintaining all features
 */

class ImageOptimizer {
    constructor(options = {}) {
        this.options = {
            lazyOffset: '50px',
            fadeInDuration: 300,
            enableWebP: true,
            enableResponsive: true,
            placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNkZGQiLz4KPC9zdmc+',
            ...options
        };
        
        this.supportsWebP = null;
        this.intersectionObserver = null;
        this.lazyImages = new Set();
        this.loadedImages = new Set();
        
        this.init();
    }

    async init() {
        // Check WebP support
        await this.checkWebPSupport();
        
        // Setup intersection observer for lazy loading
        this.setupIntersectionObserver();
        
        // Optimize existing images
        this.optimizeExistingImages();
        
        // Setup mutation observer for new images
        this.setupMutationObserver();
        
        // Add CSS for smooth loading transitions
        this.addOptimizationStyles();
    }

    async checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                this.supportsWebP = (webP.height === 2);
                resolve(this.supportsWebP);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                    }
                });
            }, {
                rootMargin: this.options.lazyOffset,
                threshold: 0.1
            });
        }
    }

    setupMutationObserver() {
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if the node itself is an image
                            if (node.tagName === 'IMG') {
                                this.optimizeImage(node);
                            }
                            // Check for images within the added node
                            const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                            images.forEach(img => this.optimizeImage(img));
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

    optimizeExistingImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => this.optimizeImage(img));
    }

    optimizeImage(img) {
        if (img.classList.contains('optimized')) return;
        
        img.classList.add('optimized');
        
        // Store original src
        const originalSrc = img.src || img.getAttribute('data-src');
        if (!originalSrc) return;
        
        // Create optimized version
        this.createOptimizedImage(img, originalSrc);
    }

    createOptimizedImage(img, originalSrc) {
        // Don't lazy load if image is already in viewport or marked as eager
        const isEager = img.loading === 'eager' || img.hasAttribute('data-eager');
        const rect = img.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isEager || inViewport) {
            this.loadImageImmediately(img, originalSrc);
        } else {
            this.setupLazyLoading(img, originalSrc);
        }
        
        // Add responsive image support
        if (this.options.enableResponsive) {
            this.addResponsiveSupport(img);
        }
    }

    loadImageImmediately(img, src) {
        const optimizedSrc = this.getOptimizedSrc(src);
        this.loadImageWithFallback(img, optimizedSrc, src);
    }

    setupLazyLoading(img, originalSrc) {
        // Set placeholder
        if (!img.src || img.src === originalSrc) {
            img.src = this.options.placeholder;
            img.classList.add('lazy-placeholder');
        }
        
        // Store original source for loading
        img.dataset.src = originalSrc;
        img.classList.add('lazy-image');
        
        // Add to lazy images set
        this.lazyImages.add(img);
        
        // Observe for intersection
        if (this.intersectionObserver) {
            this.intersectionObserver.observe(img);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.setupScrollBasedLazyLoading(img);
        }
    }

    setupScrollBasedLazyLoading(img) {
        const checkVisibility = () => {
            const rect = img.getBoundingClientRect();
            const offset = parseInt(this.options.lazyOffset);
            
            if (rect.top < window.innerHeight + offset && rect.bottom > -offset) {
                this.loadImage(img);
                window.removeEventListener('scroll', checkVisibility);
                window.removeEventListener('resize', checkVisibility);
            }
        };
        
        window.addEventListener('scroll', checkVisibility, { passive: true });
        window.addEventListener('resize', checkVisibility, { passive: true });
        
        // Check immediately
        checkVisibility();
    }

    loadImage(img) {
        if (this.loadedImages.has(img) || !img.dataset.src) return;
        
        const originalSrc = img.dataset.src;
        const optimizedSrc = this.getOptimizedSrc(originalSrc);
        
        this.loadImageWithFallback(img, optimizedSrc, originalSrc)
            .then(() => {
                this.onImageLoaded(img);
            })
            .catch(() => {
                this.onImageError(img);
            });
        
        this.loadedImages.add(img);
        this.lazyImages.delete(img);
        
        if (this.intersectionObserver) {
            this.intersectionObserver.unobserve(img);
        }
    }

    loadImageWithFallback(img, primarySrc, fallbackSrc) {
        return new Promise((resolve, reject) => {
            const tempImg = new Image();
            
            tempImg.onload = () => {
                img.src = primarySrc;
                resolve();
            };
            
            tempImg.onerror = () => {
                if (primarySrc !== fallbackSrc) {
                    // Try fallback
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => {
                        img.src = fallbackSrc;
                        resolve();
                    };
                    fallbackImg.onerror = reject;
                    fallbackImg.src = fallbackSrc;
                } else {
                    reject();
                }
            };
            
            tempImg.src = primarySrc;
        });
    }

    getOptimizedSrc(src) {
        if (!this.options.enableWebP || !this.supportsWebP) {
            return src;
        }
        
        // Convert to WebP if supported and not already WebP
        if (src.match(/\.(jpg|jpeg|png)$/i)) {
            return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        
        return src;
    }

    onImageLoaded(img) {
        img.classList.remove('lazy-placeholder', 'lazy-image');
        img.classList.add('loaded');
        
        // Fade in effect
        if (img.classList.contains('lazy-placeholder')) {
            img.style.opacity = '0';
            img.style.transition = `opacity ${this.options.fadeInDuration}ms ease`;
            
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
        }
        
        // Dispatch loaded event
        img.dispatchEvent(new CustomEvent('imageLoaded', {
            detail: { src: img.src }
        }));
    }

    onImageError(img) {
        img.classList.add('load-error');
        console.warn('Failed to load image:', img.dataset.src);
        
        // Dispatch error event
        img.dispatchEvent(new CustomEvent('imageError', {
            detail: { src: img.dataset.src }
        }));
    }

    addResponsiveSupport(img) {
        if (!img.hasAttribute('data-responsive')) return;
        
        const breakpoints = {
            small: '(max-width: 768px)',
            medium: '(max-width: 1024px)',
            large: '(min-width: 1025px)'
        };
        
        // Create srcset if not already present
        if (!img.srcset && img.dataset.responsive) {
            const baseSrc = img.dataset.src || img.src;
            const sizes = img.dataset.responsive.split(',');
            
            const srcset = sizes.map(size => {
                const [width, suffix] = size.trim().split(':');
                const responsiveSrc = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, `${suffix}.$1`);
                return `${responsiveSrc} ${width}w`;
            }).join(', ');
            
            img.srcset = srcset;
            img.sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw';
        }
    }

    addOptimizationStyles() {
        if (document.querySelector('#image-optimization-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'image-optimization-styles';
        styles.textContent = `
            .lazy-placeholder {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                min-height: 100px;
            }
            
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .lazy-image {
                transition: opacity 0.3s ease;
            }
            
            .loaded {
                animation: fadeInImage 0.3s ease;
            }
            
            @keyframes fadeInImage {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .load-error {
                background: #f5f5f5;
                border: 2px dashed #ddd;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100px;
                position: relative;
            }
            
            .load-error::before {
                content: "🖼️ Image unavailable";
                color: #999;
                font-size: 14px;
            }
            
            /* Performance optimizations */
            img {
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
            }
            
            .optimized {
                max-width: 100%;
                height: auto;
            }
            
            /* Responsive images */
            img[data-responsive] {
                width: 100%;
                height: auto;
                object-fit: cover;
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Public API methods
    preloadImage(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = this.getOptimizedSrc(src);
        document.head.appendChild(link);
    }

    loadAllImages() {
        this.lazyImages.forEach(img => this.loadImage(img));
    }

    getStats() {
        return {
            totalImages: document.querySelectorAll('img.optimized').length,
            lazyImages: this.lazyImages.size,
            loadedImages: this.loadedImages.size,
            supportsWebP: this.supportsWebP
        };
    }
}

// Auto-initialize if not in module environment
if (typeof module === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageOptimizer = new ImageOptimizer();
        console.log('✓ Image optimization system loaded');
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageOptimizer;
}
