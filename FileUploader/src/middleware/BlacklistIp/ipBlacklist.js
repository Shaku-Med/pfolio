const fs = require('fs');
const path = require('path');

class IPBlacklist {
    constructor() {
        this.blacklistFile = path.join(__dirname, 'blacklisted_ips.json');
        this.blacklistedIPs = new Set();
        this.loadBlacklist();
    }

    loadBlacklist() {
        try {
            if (fs.existsSync(this.blacklistFile)) {
                const data = fs.readFileSync(this.blacklistFile, 'utf8');
                const ips = JSON.parse(data);
                this.blacklistedIPs = new Set(ips);
            } else {
                this.saveBlacklist();
            }
        } catch (error) {
            console.error('Error loading IP blacklist:', error);
            this.blacklistedIPs = new Set();
        }
    }

    saveBlacklist() {
        try {
            const data = JSON.stringify(Array.from(this.blacklistedIPs));
            fs.writeFileSync(this.blacklistFile, data);
        } catch (error) {
            console.error('Error saving IP blacklist:', error);
        }
    }

    addToBlacklist(ip) {
        this.blacklistedIPs.add(ip);
        this.saveBlacklist();
    }

    isBlacklisted(ip) {
        return this.blacklistedIPs.has(ip);
    }

    removeFromBlacklist(ip) {
        this.blacklistedIPs.delete(ip);
        this.saveBlacklist();
    }
}

module.exports = new IPBlacklist(); 