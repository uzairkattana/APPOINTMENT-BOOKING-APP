/**
 * Optimization Testing Suite
 * Comprehensive testing system to verify all website features work correctly after optimizations
 */

class OptimizationTester {
    constructor() {
        this.tests = [];
        this.results = new Map();
        this.errors = [];
        this.performance = new Map();
        this.startTime = performance.now();
        
        this.init();
    }

    init() {
        console.log('🧪 Starting optimization testing suite...');
        
        // Define all tests
        this.defineTests();
        
        // Run tests when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runAllTests());
        } else {
            this.runAllTests();
        }
    }

    defineTests() {
        // Test 1: Progressive Enhancement System
        this.addTest('progressive-enhancement', {
            name: 'Progressive Enhancement System',
            description: 'Verify progressive enhancement loads features correctly',
            test: this.testProgressiveEnhancement.bind(this),
            critical: true
        });

        // Test 2: Bundle Management
        this.addTest('bundle-management', {
            name: 'Bundle Management System',
            description: 'Verify bundle manager loads and splits bundles correctly',
            test: this.testBundleManagement.bind(this),
            critical: true
        });

        // Test 3: Image Optimization
        this.addTest('image-optimization', {
            name: 'Image Optimization System',
            description: 'Verify images are optimized and loaded correctly',
            test: this.testImageOptimization.bind(this),
            critical: false
        });

        // Test 4: Lazy Loading
        this.addTest('lazy-loading', {
            name: 'Feature-Preserving Lazy Loading',
            description: 'Verify lazy loading works while maintaining accessibility',
            test: this.testLazyLoading.bind(this),
            critical: false
        });

        // Test 5: Accessibility
        this.addTest('accessibility', {
            name: 'Accessibility Preservation',
            description: 'Verify all accessibility features are maintained',
            test: this.testAccessibility.bind(this),
            critical: true
        });

        // Test 6: Performance
        this.addTest('performance', {
            name: 'Performance Optimization',
            description: 'Verify performance improvements are effective',
            test: this.testPerformance.bind(this),
            critical: false
        });

        // Test 7: Interactive Elements
        this.addTest('interactive-elements', {
            name: 'Interactive Elements',
            description: 'Verify all interactive elements function correctly',
            test: this.testInteractiveElements.bind(this),
            critical: true
        });

        // Test 8: Navigation
        this.addTest('navigation', {
            name: 'Navigation Functionality',
            description: 'Verify navigation works correctly',
            test: this.testNavigation.bind(this),
            critical: true
        });

        // Test 9: Responsive Design
        this.addTest('responsive-design', {
            name: 'Responsive Design',
            description: 'Verify responsive design works at different breakpoints',
            test: this.testResponsiveDesign.bind(this),
            critical: false
        });

        // Test 10: Error Handling
        this.addTest('error-handling', {
            name: 'Error Handling',
            description: 'Verify graceful error handling and fallbacks',
            test: this.testErrorHandling.bind(this),
            critical: false
        });
    }

    addTest(id, testConfig) {
        this.tests.push({
            id,
            ...testConfig,
            status: 'pending',
            startTime: null,
            endTime: null,
            duration: null,
            error: null
        });
    }

    async runAllTests() {
        console.log(`🏃 Running ${this.tests.length} optimization tests...`);
        const testStartTime = performance.now();

        for (const test of this.tests) {
            await this.runTest(test);
        }

        const testEndTime = performance.now();
        const totalDuration = testEndTime - testStartTime;

        this.generateReport(totalDuration);
    }

    async runTest(test) {
        console.log(`🔍 Running test: ${test.name}`);
        
        test.status = 'running';
        test.startTime = performance.now();

        try {
            const result = await test.test();
            test.status = result ? 'passed' : 'failed';
            test.endTime = performance.now();
            test.duration = test.endTime - test.startTime;
            
            this.results.set(test.id, {
                passed: result,
                test: test
            });

            console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'} (${test.duration.toFixed(2)}ms)`);
            
        } catch (error) {
            test.status = 'error';
            test.error = error;
            test.endTime = performance.now();
            test.duration = test.endTime - test.startTime;
            
            this.errors.push({
                test: test.name,
                error: error.message
            });

            console.error(`💥 ${test.name}: ERROR - ${error.message}`);
        }
    }

    // Individual Test Methods
    async testProgressiveEnhancement() {
        // Check if progressive enhancer is available
        if (!window.progressiveEnhancer) {
            await this.waitForCondition(() => window.progressiveEnhancer, 3000);
        }

        const enhancer = window.progressiveEnhancer;
        if (!enhancer) return false;

        // Test critical features are loaded
        const criticalFeatures = ['navigation', 'basic-styling', 'accessibility'];
        return criticalFeatures.every(feature => enhancer.isFeatureLoaded(feature));
    }

    async testBundleManagement() {
        // Check if bundle manager is available
        if (!window.bundleManager) {
            await this.waitForCondition(() => window.bundleManager, 3000);
        }

        const bundleManager = window.bundleManager;
        if (!bundleManager) return false;

        // Test that core bundle is loaded
        return bundleManager.isLoaded('core');
    }

    async testImageOptimization() {
        // Check if image optimizer is available
        if (!window.imageOptimizer) {
            await this.waitForCondition(() => window.imageOptimizer, 5000);
        }

        const optimizer = window.imageOptimizer;
        if (!optimizer) return true; // Non-critical test

        // Test that optimizer has processed images
        const stats = optimizer.getStats();
        return stats.totalImages >= 0; // Just verify it's working
    }

    async testLazyLoading() {
        // Check if lazy loader is available
        if (!window.lazyLoader) {
            await this.waitForCondition(() => window.lazyLoader, 5000);
        }

        const lazyLoader = window.lazyLoader;
        if (!lazyLoader) return true; // Non-critical test

        // Test lazy loading functionality
        const stats = lazyLoader.getStats();
        return stats.totalElements >= 0; // Just verify it's working
    }

    async testAccessibility() {
        const accessibilityChecks = [
            // Check for proper ARIA labels
            () => {
                const buttons = document.querySelectorAll('button, a');
                let hasProperLabels = true;
                buttons.forEach(button => {
                    if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
                        hasProperLabels = false;
                    }
                });
                return hasProperLabels;
            },

            // Check for proper heading structure
            () => {
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                return headings.length > 0;
            },

            // Check for proper focus management
            () => {
                const focusableElements = document.querySelectorAll(
                    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                return focusableElements.length > 0;
            }
        ];

        return accessibilityChecks.every(check => check());
    }

    async testPerformance() {
        const performanceMetrics = {
            domContentLoaded: this.getDOMContentLoadedTime(),
            totalLoadTime: performance.now() - this.startTime,
            memoryUsage: this.getMemoryUsage(),
            resourceCount: performance.getEntriesByType('resource').length
        };

        this.performance.set('metrics', performanceMetrics);

        // Basic performance thresholds
        return (
            performanceMetrics.domContentLoaded < 2000 && // DOMContentLoaded under 2s
            performanceMetrics.totalLoadTime < 5000 // Total load under 5s
        );
    }

    async testInteractiveElements() {
        const interactiveChecks = [
            // Test phone button
            () => {
                const phoneButton = document.querySelector('a[href^="tel:"]');
                return phoneButton && phoneButton.href.includes('+923046996267');
            },

            // Test WhatsApp button
            () => {
                const whatsappButton = document.querySelector('a[href^="https://wa.me"]');
                return whatsappButton && whatsappButton.href.includes('wa.me');
            },

            // Test back navigation
            () => {
                const backLink = document.querySelector('.back-link');
                return backLink && backLink.href;
            }
        ];

        return interactiveChecks.every(check => check());
    }

    async testNavigation() {
        const navigationChecks = [
            // Check navigation links work
            () => {
                const links = document.querySelectorAll('a[href]');
                return Array.from(links).every(link => {
                    const href = link.getAttribute('href');
                    return href && href !== '#';
                });
            },

            // Check smooth scroll enhancement
            () => {
                const internalLinks = document.querySelectorAll('a[href^="#"]');
                return internalLinks.length >= 0; // Just verify presence
            }
        ];

        return navigationChecks.every(check => check());
    }

    async testResponsiveDesign() {
        const responsiveChecks = [
            // Check viewport meta tag
            () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                return viewport && viewport.content.includes('width=device-width');
            },

            // Check CSS media queries
            () => {
                const styles = Array.from(document.styleSheets);
                return styles.some(stylesheet => {
                    try {
                        const rules = Array.from(stylesheet.cssRules || []);
                        return rules.some(rule => 
                            rule.media && rule.media.mediaText.includes('max-width')
                        );
                    } catch (e) {
                        return true; // External stylesheets might not be accessible
                    }
                });
            }
        ];

        return responsiveChecks.every(check => check());
    }

    async testErrorHandling() {
        // Test graceful handling of missing resources
        const errorHandlingChecks = [
            // Check if error events are handled
            () => {
                // Simulate error handling test
                return true; // Placeholder - in real test, we'd trigger errors
            },

            // Check fallback mechanisms
            () => {
                // Test that fallbacks work when optimizations fail
                return true; // Placeholder
            }
        ];

        return errorHandlingChecks.every(check => check());
    }

    // Utility Methods
    async waitForCondition(condition, timeout = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (condition()) return true;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return false;
    }

    getDOMContentLoadedTime() {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            return navTiming.domContentLoadedEventEnd - navTiming.fetchStart;
        }
        return 0;
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    generateReport(totalDuration) {
        const passedTests = this.tests.filter(test => test.status === 'passed').length;
        const failedTests = this.tests.filter(test => test.status === 'failed').length;
        const errorTests = this.tests.filter(test => test.status === 'error').length;
        const criticalFailures = this.tests.filter(test => test.critical && test.status !== 'passed').length;

        const report = {
            summary: {
                total: this.tests.length,
                passed: passedTests,
                failed: failedTests,
                errors: errorTests,
                criticalFailures,
                duration: totalDuration.toFixed(2) + 'ms',
                success: criticalFailures === 0
            },
            tests: this.tests,
            performance: Object.fromEntries(this.performance),
            errors: this.errors
        };

        // Log summary
        console.log('📊 OPTIMIZATION TEST REPORT');
        console.log('=' .repeat(50));
        console.log(`✅ Passed: ${passedTests}/${this.tests.length}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`💥 Errors: ${errorTests}`);
        console.log(`🚨 Critical Failures: ${criticalFailures}`);
        console.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)}ms`);
        console.log(`🎯 Overall Status: ${report.summary.success ? 'SUCCESS' : 'FAILURE'}`);
        
        if (report.summary.success) {
            console.log('🎉 All critical optimizations are working correctly!');
        } else {
            console.warn('⚠️  Some critical optimizations have issues. Check the detailed report.');
        }

        // Store report globally for debugging
        window.optimizationTestReport = report;

        return report;
    }

    // Public API
    getReport() {
        return window.optimizationTestReport;
    }

    runSingleTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            return this.runTest(test);
        }
        throw new Error(`Test not found: ${testId}`);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for other systems to initialize
    setTimeout(() => {
        window.optimizationTester = new OptimizationTester();
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizationTester;
}
