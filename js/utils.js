// utils.js - Utility functions with no dependencies

// Format relative time from a date
export function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return new Date(date).toLocaleDateString();
}

// Alternative time formatter
export function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    return Math.floor(seconds / 86400) + 'd';
}

// Another time format variant
export function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

// Get date from days ago
export function getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

// Get today's date formatted
export function getToday() {
    return new Date().toISOString().split('T')[0];
}

// Escape HTML for safe display
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update status display
export function setStatus(text, loading = false) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.classList.toggle('loading', loading);
    }
}

// Convert lat/lon to map position (simple equirectangular projection)
export function latLonToXY(lat, lon, width, height) {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
}

// Setup ResizeObserver for a panel to handle visibility changes
// Calls callback when element becomes visible or changes size
export function observePanelResize(elementId, callback) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element ${elementId} not found for resize observation`);
        return null;
    }

    // Check if ResizeObserver is supported
    if (typeof ResizeObserver === 'undefined') {
        console.warn('ResizeObserver not supported in this browser');
        return null;
    }

    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            // Only trigger callback if element has non-zero size
            if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                callback(entry.contentRect);
            }
        }
    });

    observer.observe(element);
    return observer;
}

// Debounce function to limit callback rate
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function to limit callback rate (executes immediately)
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
