// Utility script for toggling maintenance mode
// Add this to your admin panel or run in console

class MaintenanceManager {
    static enable(duration = 2) {
        localStorage.setItem('maintenanceMode', 'true');
        
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + duration);
        localStorage.setItem('maintenanceEnd', endTime.toISOString());
        
        console.log(`🚧 Maintenance mode enabled for ${duration} hours`);
        window.location.href = '/maintenance.html';
    }
    
    static disable() {
        localStorage.setItem('maintenanceMode', 'false');
        localStorage.removeItem('maintenanceEnd');
        
        console.log('✅ Maintenance mode disabled');
        window.location.href = '/';
    }
    
    static status() {
        const isEnabled = localStorage.getItem('maintenanceMode') === 'true';
        const endTime = localStorage.getItem('maintenanceEnd');
        
        console.log('Maintenance Status:', {
            enabled: isEnabled,
            endTime: endTime ? new Date(endTime) : null
        });
        
        return { enabled: isEnabled, endTime };
    }
    
    static autoDisable() {
        const endTime = localStorage.getItem('maintenanceEnd');
        if (!endTime) return;
        
        const now = new Date();
        const end = new Date(endTime);
        
        if (now >= end) {
            this.disable();
        }
    }
}

// Auto-check maintenance end time
setInterval(() => {
    MaintenanceManager.autoDisable();
}, 60000); // Check every minute

// Make it globally available for console use
window.MaintenanceManager = MaintenanceManager;