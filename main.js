/**
 * CYBERSECURITY PORTFOLIO - MAIN JAVASCRIPT
 * ==========================================
 * 
 * Features:
 * - Theme toggle (dark/light mode)
 * - Smooth scrolling navigation
 * - Mobile menu functionality
 * - Typing animation
 * - Form handling and validation
 * - Scroll-to-top button
 * - Intersection Observer animations
 * - Security best practices
 */

// ================================
// GLOBAL VARIABLES & CONSTANTS
// ================================

const TYPING_TEXTS = [
    "Cybersecurity Expert",
    "Digital Forensics Specialist", 
    "Ethical Hacker",
    "Cloud Security Engineer",
    "Incident Response Analyst"
];

const TYPING_SPEED = 100; // ms per character
const ERASE_SPEED = 50;   // ms per character
const PAUSE_DURATION = 2000; // ms to pause between texts

let typingIndex = 0;
let charIndex = 0;
let isDeleting = false;

// DOM Elements
const navbar = document.getElementById('navbar');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.getElementById('nav-menu');
const scrollToTopBtn = document.getElementById('scroll-to-top');
const typingElement = document.getElementById('typing-text');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

// ================================
// THEME MANAGEMENT
// ================================

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.bindEvents();
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Update theme icon
        if (themeIcon) {
            themeIcon.className = theme === 'dark' 
                ? 'fas fa-sun' 
                : 'fas fa-moon';
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    bindEvents() {
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// ================================
// NAVIGATION MANAGEMENT
// ================================

class NavigationManager {
    constructor() {
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleScroll();
        this.setActiveLink();
    }

    bindEvents() {
        // Mobile menu toggle
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Scroll event
        window.addEventListener('scroll', () => {
            this.handleScroll();
            this.setActiveLink();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && !e.target.closest('.nav-container')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.toggle('active');
        }

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
        
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
        }
        
        document.body.style.overflow = '';
    }

    handleNavClick(e) {
        e.preventDefault();
        
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const navHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
        
        // Close mobile menu if open
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    handleScroll() {
        if (!navbar) return;
        
        const scrolled = window.scrollY > 50;
        navbar.classList.toggle('scrolled', scrolled);
        
        // Update navbar background opacity
        if (scrolled) {
            navbar.style.background = 'var(--bg-overlay)';
        } else {
            navbar.style.background = 'transparent';
        }
    }

    setActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        const scrollPos = window.scrollY + (navbar ? navbar.offsetHeight : 0) + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos <= sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// ================================
// TYPING ANIMATION
// ================================

class TypingAnimation {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        if (!this.element) return;
        this.type();
    }

    type() {
        const currentText = TYPING_TEXTS[typingIndex];
        
        if (isDeleting) {
            this.element.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                typingIndex = (typingIndex + 1) % TYPING_TEXTS.length;
                setTimeout(() => this.type(), 500);
                return;
            }
        } else {
            this.element.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentText.length) {
                isDeleting = true;
                setTimeout(() => this.type(), PAUSE_DURATION);
                return;
            }
        }
        
        const speed = isDeleting ? ERASE_SPEED : TYPING_SPEED;
        setTimeout(() => this.type(), speed);
    }
}

// ================================
// FORM HANDLING
// ================================

class FormHandler {
    constructor(form) {
        this.form = form;
        this.init();
    }

    init() {
        if (!this.form) return;
        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearError(e.target));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const submitBtn = this.form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            const formData = new FormData(this.form);
            
            // Security: Sanitize form data
            const sanitizedData = this.sanitizeFormData(formData);
            
            // Submit to Formspree or your backend
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: sanitizedData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                this.showStatus('success', 'Message sent successfully! I\'ll get back to you soon.');
                this.form.reset();
            } else {
                throw new Error('Network response was not ok');
            }
            
        } catch (error) {
            this.showStatus('error', 'Failed to send message. Please try again or contact me directly.');
            console.error('Form submission error:', error);
        } finally {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        // Check if required field is empty
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        }
        
        // Email validation
        else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
        }
        
        // Name validation
        else if (fieldName === 'name' && value) {
            if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters long';
                isValid = false;
            }
            // Security: Check for suspicious patterns
            if (this.containsSuspiciousContent(value)) {
                errorMessage = 'Please enter a valid name';
                isValid = false;
            }
        }
        
        // Message validation
        else if (fieldName === 'message' && value) {
            if (value.length < 10) {
                errorMessage = 'Message must be at least 10 characters long';
                isValid = false;
            }
            if (value.length > 1000) {
                errorMessage = 'Message must be less than 1000 characters';
                isValid = false;
            }
        }
        
        this.showFieldError(field, errorMessage);
        return isValid;
    }

    containsSuspiciousContent(text) {
        // Basic XSS/injection detection
        const suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /data:text\/html/gi
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(text));
    }

    sanitizeFormData(formData) {
        const sanitized = new FormData();
        
        for (let [key, value] of formData.entries()) {
            if (typeof value === 'string') {
                // Basic HTML entity encoding
                const sanitizedValue = value
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .trim();
                
                sanitized.append(key, sanitizedValue);
            } else {
                sanitized.append(key, value);
            }
        }
        
        return sanitized;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup ? formGroup.querySelector('.error-message') : null;
        
        if (formGroup) {
            formGroup.classList.toggle('error', !!message);
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearError(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
        }
    }

    showStatus(type, message) {
        if (!formStatus) return;
        
        formStatus.className = `form-status ${type}`;
        formStatus.textContent = message;
        
        // Auto-hide success message after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formStatus.classList.add('hidden');
            }, 5000);
        }
    }
}

// ================================
// SCROLL EFFECTS
// ================================

class ScrollEffects {
    constructor() {
        this.init();
    }

    init() {
        this.initScrollToTop();
        this.initIntersectionObserver();
        this.initSkillBars();
    }

    initScrollToTop() {
        if (!scrollToTopBtn) return;
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 500;
            scrollToTopBtn.classList.toggle('visible', scrolled);
        });
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '-50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animatedElements = document.querySelectorAll(`
            .timeline-item,
            .project-card,
            .skill-category,
            .stat-item,
            .contact-item
        `);
        
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    initSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBar = entry.target;
                    const width = skillBar.style.width;
                    
                    // Animate skill bar
                    skillBar.style.width = '0%';
                    setTimeout(() => {
                        skillBar.style.width = width;
                    }, 200);
                    
                    skillObserver.unobserve(skillBar);
                }
            });
        }, { threshold: 0.5 });
        
        skillBars.forEach(bar => {
            skillObserver.observe(bar);
        });
    }
}

// ================================
// PROJECT INTERACTIONS
// ================================

class ProjectInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.bindProjectEvents();
    }

    bindProjectEvents() {
        // Project card hover effects
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const overlay = card.querySelector('.project-overlay');
            
            if (overlay) {
                card.addEventListener('mouseenter', () => {
                    this.showProjectOverlay(overlay);
                });
                
                card.addEventListener('mouseleave', () => {
                    this.hideProjectOverlay(overlay);
                });
            }
        });
        
        // Project action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-icon[title="View Details"]')) {
                e.preventDefault();
                this.showProjectDetails(e.target.closest('.project-card'));
            }
        });
    }

    showProjectOverlay(overlay) {
        overlay.style.opacity = '1';
    }

    hideProjectOverlay(overlay) {
        overlay.style.opacity = '0';
    }

    showProjectDetails(projectCard) {
        const title = projectCard.querySelector('.project-title')?.textContent;
        const description = projectCard.querySelector('.project-description')?.textContent;
        
        // Simple modal alternative - could be enhanced with a proper modal
        alert(`${title}\n\n${description}\n\nThis feature can be enhanced with a proper modal dialog.`);
    }
}

// ================================
// SECURITY UTILITIES
// ================================

class SecurityManager {
    constructor() {
        this.init();
    }

    init() {
        this.preventXSS();
        this.setupCSP();
        this.logSecurityEvents();
    }

    preventXSS() {
        // Sanitize any dynamically inserted content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                            // Basic XSS prevention for dynamic content
                            const sanitized = node.textContent
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;');
                            
                            if (sanitized !== node.textContent) {
                                console.warn('Potential XSS attempt detected and prevented');
                                node.textContent = sanitized;
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupCSP() {
        // Log CSP violations
        document.addEventListener('securitypolicyviolation', (e) => {
            console.warn('CSP Violation:', {
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                originalPolicy: e.originalPolicy
            });
        });
    }

    logSecurityEvents() {
        // Monitor for potential security issues
        window.addEventListener('error', (e) => {
            if (e.message.includes('script') || e.message.includes('unsafe')) {
                console.warn('Potential security-related error:', e.message);
            }
        });
    }
}

// ================================
// PERFORMANCE MANAGER
// ================================

class PerformanceManager {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.optimizeAnimations();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[src*="placeholder"]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    optimizeAnimations() {
        // Reduce animations for users who prefer reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition-normal', '0ms');
            document.documentElement.style.setProperty('--transition-slow', '0ms');
        }
    }
}

// ================================
// ANALYTICS & TRACKING (Privacy-Focused)
// ================================

class PrivacyFriendlyAnalytics {
    constructor() {
        this.sessionData = {
            startTime: Date.now(),
            pageViews: 0,
            interactions: 0
        };
        this.init();
    }

    init() {
        this.trackPageLoad();
        this.trackInteractions();
    }

    trackPageLoad() {
        this.sessionData.pageViews++;
        
        // Track performance metrics (no personal data)
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            
            if (navigationTiming) {
                const loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
                console.log('Page Load Time:', loadTime + 'ms');
            }
        }
    }

    trackInteractions() {
        // Track general user interactions (no personal data)
        ['click', 'scroll', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.sessionData.interactions++;
            }, { once: true, passive: true });
        });
    }

    getSessionSummary() {
        const sessionDuration = Date.now() - this.sessionData.startTime;
        
        return {
            duration: sessionDuration,
            pageViews: this.sessionData.pageViews,
            interactions: this.sessionData.interactions,
            timestamp: new Date().toISOString()
        };
    }
}

// ================================
// MAIN APPLICATION
// ================================

class CyberSecurityPortfolio {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        try {
            // Initialize all components
            this.components.themeManager = new ThemeManager();
            this.components.navigationManager = new NavigationManager();
            this.components.typingAnimation = new TypingAnimation(typingElement);
            this.components.formHandler = new FormHandler(contactForm);
            this.components.scrollEffects = new ScrollEffects();
            this.components.projectInteractions = new ProjectInteractions();
            this.components.securityManager = new SecurityManager();
            this.components.performanceManager = new PerformanceManager();
            this.components.analytics = new PrivacyFriendlyAnalytics();
            
            console.log('🔒 Jerome Cybersecurity Portfolio initialized successfully');
            
        } catch (error) {
            console.error('Error initializing portfolio:', error);
        }
    }

    // Public method to get component instances
    getComponent(name) {
        return this.components[name];
    }
}

// ================================
// INITIALIZE APPLICATION
// ================================

// Create global app instance
const app = new CyberSecurityPortfolio();

// Export for debugging/external access
window.CyberPortfolio = app;

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ================================
// ADDITIONAL SECURITY MEASURES
// ================================

// Prevent console access in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Hide console in production
    console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers. Do not paste any code here.', 'color: red; font-size: 16px;');
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
        }
    });
}

// ================================
// ACCESSIBILITY ENHANCEMENTS
// ================================

// Keyboard navigation improvements
document.addEventListener('keydown', (e) => {
    // Skip to main content
    if (e.key === 'Enter' && e.target.classList.contains('skip-link')) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.focus();
            e.preventDefault();
        }
    }
});

// High contrast mode detection
if (window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('high-contrast');
}

// Announce page changes for screen readers
const announcePageChange = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

// Export utilities for external use
window.CyberPortfolioUtils = {
    announcePageChange,
    sanitizeText: (text) => {
        return text.replace(/[<>]/g, '');
    }
};