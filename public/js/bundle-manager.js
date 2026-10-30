/**
 * Safe Bundle Manager
 * Splits JavaScript bundles safely without affecting functionality
 */

class BundleManager {
    constructor() {
        this.bundles = new Map();
        this.loadedBundles = new Set();
        this.loadingBundles = new Set();
        this.dependencies = new Map();
        this.cache = new Map();
        
        this.init();
    }

    init() {
        // Define bundle configuration
        this.defineBundles();
        
        // Setup intelligent loading strategy
        this.setupLoadingStrategy();
        
        // Enable runtime splitting for dynamic imports
        this.enableRuntimeSplitting();
    }

    defineBundles() {
        // Core bundle - essential features loaded immediately
        this.registerBundle('core', {
            priority: 1,
            preload: true,
            critical: true,
            modules: [
                'progressive-enhancement.js',
                'basic-utilities.js'
            ]
        });

        // UI bundle - interactive elements and animations
        this.registerBundle('ui', {
            priority: 2,
            dependencies: ['core'],
            loadOn: 'interaction',
            modules: [
                'ui-components.js',
                'animations.js'
            ]
        });

        // Media bundle - image optimization and media handling
        this.registerBundle('media', {
            priority: 3,
            dependencies: ['core'],
            loadOn: 'idle',
            modules: [
                'image-optimizer.js',
                'media-handlers.js'
            ]
        });

        // Features bundle - advanced features and integrations
        this.registerBundle('features', {
            priority: 4,
            dependencies: ['core', 'ui'],
            loadOn: 'idle',
            modules: [
                'advanced-features.js',
                'integrations.js'
            ]
        });

        // Analytics bundle - tracking and analytics
        this.registerBundle('analytics', {
            priority: 5,
            dependencies: ['core'],
            loadOn: 'idle',
            defer: true,
            modules: [
                'analytics.js',
                'performance-tracking.js'
            ]
        });
    }

    registerBundle(name, config) {
        this.bundles.set(name, {
            name,
            loaded: false,
            loading: false,
            error: null,
            ...config
        });

        // Register dependencies
        if (config.dependencies) {
            this.dependencies.set(name, config.dependencies);
        }
    }

    setupLoadingStrategy() {
        // Load core bundles immediately
        this.loadCriticalBundles();
        
        // Setup interaction-based loading
        this.setupInteractionLoading();
        
        // Setup idle loading
        this.setupIdleLoading();
        
        // Setup viewport-based loading
        this.setupViewportLoading();
    }

    loadCriticalBundles() {
        const criticalBundles = Array.from(this.bundles.values())
            .filter(bundle => bundle.critical)
            .sort((a, b) => a.priority - b.priority);

        criticalBundles.forEach(bundle => {
            this.loadBundle(bundle.name);
        });
    }

    setupInteractionLoading() {
        const interactionEvents = ['click', 'keydown', 'touchstart'];
        let interactionBundlesLoaded = false;

        const loadInteractionBundles = () => {
            if (interactionBundlesLoaded) return;
            interactionBundlesLoaded = true;

            const interactionBundles = Array.from(this.bundles.values())
                .filter(bundle => bundle.loadOn === 'interaction')
                .sort((a, b) => a.priority - b.priority);

            interactionBundles.forEach(bundle => {
                this.loadBundle(bundle.name);
            });

            // Remove event listeners
            interactionEvents.forEach(event => {
                document.removeEventListener(event, loadInteractionBundles, { passive: true });
            });
        };

        interactionEvents.forEach(event => {
            document.addEventListener(event, loadInteractionBundles, { passive: true });
        });
    }

    setupIdleLoading() {
        const loadIdleBundles = () => {
            const idleBundles = Array.from(this.bundles.values())
                .filter(bundle => bundle.loadOn === 'idle' && !bundle.loaded)
                .sort((a, b) => a.priority - b.priority);

            idleBundles.forEach(bundle => {
                this.loadBundle(bundle.name);
            });
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadIdleBundles, { timeout: 2000 });
        } else {
            setTimeout(loadIdleBundles, 1000);
        }
    }

    setupViewportLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target.dataset.bundle) {
                        const bundleName = entry.target.dataset.bundle;
                        this.loadBundle(bundleName);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.1
            });

            // Observe elements that require specific bundles
            document.querySelectorAll('[data-bundle]').forEach(element => {
                observer.observe(element);
            });
        }
    }

    enableRuntimeSplitting() {
        // Override dynamic import for runtime splitting
        if (window.import) {
            const originalImport = window.import;
            window.import = (module) => {
                return this.loadModule(module).then(() => originalImport(module));
            };
        }
    }

    async loadBundle(bundleName) {
        const bundle = this.bundles.get(bundleName);
        if (!bundle) {
            console.warn(`Bundle not found: ${bundleName}`);
            return false;
        }

        if (bundle.loaded || bundle.loading) {
            return bundle.loaded;
        }

        // Check and load dependencies first
        if (bundle.dependencies) {
            const dependencyPromises = bundle.dependencies.map(dep => this.loadBundle(dep));
            await Promise.all(dependencyPromises);
        }

        return this.loadBundleModules(bundle);
    }

    async loadBundleModules(bundle) {
        bundle.loading = true;
        this.loadingBundles.add(bundle.name);

        try {
            // Load bundle modules
            const modulePromises = bundle.modules.map(module => this.loadModule(module));
            await Promise.all(modulePromises);

            bundle.loaded = true;
            bundle.loading = false;
            this.loadedBundles.add(bundle.name);
            this.loadingBundles.delete(bundle.name);

            console.log(`✓ Bundle loaded: ${bundle.name}`);

            // Dispatch bundle loaded event
            document.dispatchEvent(new CustomEvent('bundleLoaded', {
                detail: { bundle: bundle.name }
            }));

            return true;
        } catch (error) {
            bundle.error = error;
            bundle.loading = false;
            this.loadingBundles.delete(bundle.name);

            console.error(`Failed to load bundle: ${bundle.name}`, error);
            return false;
        }
    }

    async loadModule(modulePath) {
        // Check cache first
        if (this.cache.has(modulePath)) {
            return this.cache.get(modulePath);
        }

        // Handle different module types
        if (modulePath.endsWith('.js')) {
            return this.loadScript(modulePath);
        } else if (modulePath.endsWith('.css')) {
            return this.loadStylesheet(modulePath);
        }

        throw new Error(`Unsupported module type: ${modulePath}`);
    }

    loadScript(scriptPath) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existing = document.querySelector(`script[src="js/${scriptPath}"]`);
            if (existing) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `js/${scriptPath}`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                this.cache.set(scriptPath, true);
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${scriptPath}`));
            };

            // Add integrity check for security
            if (this.shouldAddIntegrity(scriptPath)) {
                script.crossOrigin = 'anonymous';
                // script.integrity = this.getIntegrity(scriptPath);
            }

            document.head.appendChild(script);
        });
    }

    loadStylesheet(cssPath) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existing = document.querySelector(`link[href="css/${cssPath}"]`);
            if (existing) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `css/${cssPath}`;

            link.onload = () => {
                this.cache.set(cssPath, true);
                resolve();
            };

            link.onerror = () => {
                reject(new Error(`Failed to load stylesheet: ${cssPath}`));
            };

            document.head.appendChild(link);
        });
    }

    shouldAddIntegrity(scriptPath) {
        // Add integrity checks for external or critical scripts
        return scriptPath.includes('external') || scriptPath.includes('critical');
    }

    // Preload bundles for better performance
    preloadBundle(bundleName) {
        const bundle = this.bundles.get(bundleName);
        if (!bundle) return;

        bundle.modules.forEach(module => {
            if (module.endsWith('.js')) {
                this.preloadScript(module);
            } else if (module.endsWith('.css')) {
                this.preloadStylesheet(module);
            }
        });
    }

    preloadScript(scriptPath) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = `js/${scriptPath}`;
        document.head.appendChild(link);
    }

    preloadStylesheet(cssPath) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = `css/${cssPath}`;
        document.head.appendChild(link);
    }

    // Resource hints for better loading
    addResourceHints() {
        // DNS prefetch for external resources
        this.addDnsPrefetch(['fonts.googleapis.com', 'cdnjs.cloudflare.com']);
        
        // Preconnect to critical domains
        this.addPreconnect(['fonts.googleapis.com']);
    }

    addDnsPrefetch(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });
    }

    addPreconnect(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = `https://${domain}`;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    // Public API
    isLoaded(bundleName) {
        const bundle = this.bundles.get(bundleName);
        return bundle ? bundle.loaded : false;
    }

    isLoading(bundleName) {
        return this.loadingBundles.has(bundleName);
    }

    getStats() {
        return {
            totalBundles: this.bundles.size,
            loadedBundles: this.loadedBundles.size,
            loadingBundles: this.loadingBundles.size,
            cachedModules: this.cache.size,
            bundles: Array.from(this.bundles.values()).map(bundle => ({
                name: bundle.name,
                loaded: bundle.loaded,
                priority: bundle.priority,
                moduleCount: bundle.modules.length
            }))
        };
    }

    // Force load a bundle (for debugging or manual loading)
    forceLoad(bundleName) {
        return this.loadBundle(bundleName);
    }

    // Clear cache and reset (for development)
    reset() {
        this.cache.clear();
        this.loadedBundles.clear();
        this.loadingBundles.clear();
        this.bundles.forEach(bundle => {
            bundle.loaded = false;
            bundle.loading = false;
            bundle.error = null;
        });
    }
}

// Auto-initialize the bundle manager
document.addEventListener('DOMContentLoaded', () => {
    window.bundleManager = new BundleManager();
    
    // Add resource hints
    window.bundleManager.addResourceHints();
    
    console.log('✓ Bundle manager initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BundleManager;
}
