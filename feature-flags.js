// Feature flag system for "coming soon" features
class FeatureFlags {
    constructor() {
        this.flags = {
            newsletter: false,
            comments: false,
            darkMode: false,
            analytics: true,
            search: true
        };
        
        // Load from localStorage or server
        this.loadFlags();
    }
    
    loadFlags() {
        const stored = localStorage.getItem('featureFlags');
        if (stored) {
            this.flags = { ...this.flags, ...JSON.parse(stored) };
        }
    }
    
    saveFlags() {
        localStorage.setItem('featureFlags', JSON.stringify(this.flags));
    }
    
    isEnabled(feature) {
        return this.flags[feature] === true;
    }
    
    enable(feature) {
        this.flags[feature] = true;
        this.saveFlags();
        console.log(`✅ Feature '${feature}' enabled`);
    }
    
    disable(feature) {
        this.flags[feature] = false;
        this.saveFlags();
        console.log(`❌ Feature '${feature}' disabled`);
    }
    
    toggle(feature) {
        this.flags[feature] = !this.flags[feature];
        this.saveFlags();
        console.log(`🔄 Feature '${feature}' toggled to ${this.flags[feature]}`);
    }
    
    // Redirect to coming soon if feature is disabled
    requireFeature(feature, redirectUrl = '/coming-soon.html') {
        if (!this.isEnabled(feature)) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// Initialize feature flags
const featureFlags = new FeatureFlags();
window.featureFlags = featureFlags;