// Simple client-side routing for utility pages
class SimpleRouter {
    constructor() {
        this.routes = {
            '/maintenance': '/maintenance.html',
            '/coming-soon': '/coming-soon.html',
            '/offline': '/offline.html'
        };
        
        this.init();
    }
    
    init() {
        // Handle page visibility for offline detection
        document.addEventListener('visibilitychange', () => {
            if (!navigator.onLine && document.visibilityState === 'visible') {
                this.navigate('/offline');
            }
        });
        
                // Handle offline/online events
        window.addEventListener('offline', () => {
            this.navigate('/offline');
        });
        
        window.addEventListener('online', () => {
            // Only redirect if currently on offline page
            if (window.location.pathname === '/offline.html') {
                this.navigate('/');
            }
        });
    }
    
    navigate(path) {
        if (this.routes[path]) {
            window.location.href = this.routes[path];
        }
    }
    
    // Check if site is in maintenance mode
    static checkMaintenanceMode() {
        // You can set this via environment variable or config
        const maintenanceMode = localStorage.getItem('maintenanceMode') === 'true';
        
        if (maintenanceMode && !window.location.pathname.includes('maintenance')) {
            window.location.href = '/maintenance.html';
        }
    }
}

// Initialize router
new SimpleRouter();

// Check maintenance mode on page load
document.addEventListener('DOMContentLoaded', () => {
    SimpleRouter.checkMaintenanceMode();
});
        