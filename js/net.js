// net.js - Robust network layer with timeout, retry, caching, and concurrency control

import { CORS_PROXIES } from './constants.js';

// Configuration
const FETCH_TIMEOUT = 10000; // 10 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 1000; // 1 second base delay
const MAX_CONCURRENT = 6; // Max parallel requests
const CACHE_TTL_DEFAULT = 300000; // 5 minutes
const CACHE_TTL_SHORT = 60000; // 1 minute for frequently updated data
const CACHE_TTL_LONG = 1800000; // 30 minutes for stable data

// In-memory cache
const memoryCache = new Map();

// Concurrency control
let activeRequests = 0;
const requestQueue = [];

// Cache statistics (for debugging)
const cacheStats = {
    hits: 0,
    misses: 0,
    errors: 0
};

/**
 * Fetch with timeout using AbortController
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, timeout = FETCH_TIMEOUT, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
    }
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} attempts - Number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(fn, attempts = RETRY_ATTEMPTS, baseDelay = RETRY_BASE_DELAY) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === attempts - 1) throw error;
            
            const delay = baseDelay * Math.pow(2, i);
            const jitter = Math.random() * 0.3 * delay; // Add 0-30% jitter
            const totalDelay = delay + jitter;
            
            console.log(`Retry attempt ${i + 1}/${attempts} after ${Math.round(totalDelay)}ms`);
            await new Promise(resolve => setTimeout(resolve, totalDelay));
        }
    }
}

/**
 * Control concurrency of requests
 * @param {Function} fn - Async function to execute
 * @returns {Promise<any>}
 */
async function withConcurrencyLimit(fn) {
    // Wait if at max concurrent requests
    if (activeRequests >= MAX_CONCURRENT) {
        await new Promise(resolve => requestQueue.push(resolve));
    }
    
    activeRequests++;
    
    try {
        return await fn();
    } finally {
        activeRequests--;
        
        // Process next queued request
        if (requestQueue.length > 0) {
            const resolve = requestQueue.shift();
            resolve();
        }
    }
}

/**
 * Get cache key for URL and options
 */
function getCacheKey(url, options = {}) {
    return `${url}:${JSON.stringify(options)}`;
}

/**
 * Get from memory cache
 */
function getFromMemoryCache(key) {
    const cached = memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
        memoryCache.delete(key);
        return null;
    }
    
    cacheStats.hits++;
    return cached.data;
}

/**
 * Set to memory cache
 */
function setToMemoryCache(key, data, ttl = CACHE_TTL_DEFAULT) {
    // Limit cache size
    if (memoryCache.size > 100) {
        const firstKey = memoryCache.keys().next().value;
        memoryCache.delete(firstKey);
    }
    
    memoryCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
    });
}

/**
 * Get from localStorage cache
 */
function getFromLocalStorage(key) {
    try {
        const cached = localStorage.getItem(`sa-dash-cache:${key}`);
        if (!cached) return null;
        
        const { data, timestamp, ttl } = JSON.parse(cached);
        if (Date.now() - timestamp > ttl) {
            localStorage.removeItem(`sa-dash-cache:${key}`);
            return null;
        }
        
        cacheStats.hits++;
        return data;
    } catch (error) {
        console.error('localStorage cache error:', error);
        return null;
    }
}

/**
 * Set to localStorage cache
 */
function setToLocalStorage(key, data, ttl = CACHE_TTL_DEFAULT) {
    try {
        const cached = {
            data,
            timestamp: Date.now(),
            ttl
        };
        localStorage.setItem(`sa-dash-cache:${key}`, JSON.stringify(cached));
    } catch (error) {
        // localStorage might be full or unavailable
        console.warn('localStorage cache write failed:', error);
    }
}

/**
 * Clear all caches
 */
export function clearCache() {
    memoryCache.clear();
    
    // Clear localStorage cache items
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('sa-dash-cache:')) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('Cache clear error:', error);
    }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    return {
        ...cacheStats,
        hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
        memorySize: memoryCache.size,
        activeRequests
    };
}

/**
 * Fetch with full retry, caching, and timeout support
 * @param {string} url - URL to fetch
 * @param {object} options - Options
 * @returns {Promise<string>}
 */
export async function robustFetch(url, options = {}) {
    const {
        timeout = FETCH_TIMEOUT,
        cache = true,
        cacheTTL = CACHE_TTL_DEFAULT,
        retries = RETRY_ATTEMPTS,
        parser = 'text' // 'text' or 'json'
    } = options;
    
    const cacheKey = getCacheKey(url, { parser });
    
    // Check memory cache first
    if (cache) {
        const memCached = getFromMemoryCache(cacheKey);
        if (memCached) {
            if (isDebugMode()) console.log(`Memory cache HIT: ${url.substring(0, 50)}...`);
            return memCached;
        }
        
        // Check localStorage cache
        const lsCached = getFromLocalStorage(cacheKey);
        if (lsCached) {
            if (isDebugMode()) console.log(`LocalStorage cache HIT: ${url.substring(0, 50)}...`);
            // Also populate memory cache
            setToMemoryCache(cacheKey, lsCached, cacheTTL);
            return lsCached;
        }
    }
    
    cacheStats.misses++;
    
    // Fetch with concurrency control
    return withConcurrencyLimit(async () => {
        return retryWithBackoff(async () => {
            const response = await fetchWithTimeout(url, timeout, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = parser === 'json' ? await response.json() : await response.text();
            
            // Cache successful responses
            if (cache) {
                setToMemoryCache(cacheKey, data, cacheTTL);
                setToLocalStorage(cacheKey, data, cacheTTL);
            }
            
            return data;
        }, retries);
    });
}

/**
 * Fetch with CORS proxy fallback (race multiple proxies)
 * @param {string} url - URL to fetch
 * @param {object} options - Options
 * @returns {Promise<string>}
 */
export async function fetchWithProxy(url, options = {}) {
    const {
        timeout = FETCH_TIMEOUT,
        cache = true,
        cacheTTL = CACHE_TTL_DEFAULT,
        proxies = CORS_PROXIES
    } = options;
    
    // Try direct fetch first (if same origin or CORS-enabled)
    try {
        return await robustFetch(url, { 
            timeout: timeout / 2, // Shorter timeout for direct attempt
            cache, 
            cacheTTL,
            retries: 1 
        });
    } catch (directError) {
        if (isDebugMode()) console.log('Direct fetch failed, trying proxies:', directError.message);
    }
    
    // Race all proxies against each other
    const proxyPromises = proxies.map(async (proxy) => {
        const proxyUrl = proxy + encodeURIComponent(url);
        return robustFetch(proxyUrl, {
            timeout,
            cache,
            cacheTTL,
            retries: 2
        });
    });
    
    // Return first successful response
    try {
        return await Promise.any(proxyPromises);
    } catch (error) {
        cacheStats.errors++;
        
        // All proxies failed, try to return stale cache as last resort
        if (cache) {
            const cacheKey = getCacheKey(url, { parser: 'text' });
            
            // Try to get stale data from localStorage (ignore TTL)
            try {
                const cached = localStorage.getItem(`sa-dash-cache:${cacheKey}`);
                if (cached) {
                    const { data } = JSON.parse(cached);
                    console.warn(`Using stale cache for ${url} (all fetch attempts failed)`);
                    return data;
                }
            } catch (cacheError) {
                // Ignore cache errors
            }
        }
        
        throw new Error(`All fetch attempts failed for ${url}`);
    }
}

/**
 * Fetch multiple URLs with structured error handling
 * Uses Promise.allSettled so partial failures don't block other requests
 * @param {Array<{url: string, options: object, source?: string}>} requests - Array of request configs
 * @returns {Promise<Array<{status: string, value?: any, reason?: Error, source: string}>>}
 */
export async function fetchMultiple(requests) {
    const promises = requests.map(async (req) => {
        try {
            const data = await fetchWithProxy(req.url, req.options);
            return {
                status: 'fulfilled',
                value: data,
                source: req.source || req.url
            };
        } catch (error) {
            return {
                status: 'rejected',
                reason: error,
                source: req.source || req.url
            };
        }
    });
    
    return Promise.allSettled(promises).then(results =>
        results.map(result => {
            // Extract the source from the inner result
            if (result.status === 'fulfilled' && result.value) {
                return result.value;
            } else if (result.status === 'rejected') {
                return {
                    status: 'rejected',
                    reason: result.reason,
                    source: 'unknown'
                };
            }
            return result;
        })
    );
}

/**
 * Check if debug mode is enabled
 */
function isDebugMode() {
    return localStorage.getItem('sa-dash-debug') === 'true';
}

/**
 * Log cache stats to console (for debugging)
 */
export function logCacheStats() {
    const stats = getCacheStats();
    console.log('=== Cache Statistics ===');
    console.log(`Hits: ${stats.hits}`);
    console.log(`Misses: ${stats.misses}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
    console.log(`Memory Cache Size: ${stats.memorySize} items`);
    console.log(`Active Requests: ${stats.activeRequests}/${MAX_CONCURRENT}`);
}

// Export cache TTL constants for use by other modules
export const CACHE_TTL = {
    DEFAULT: CACHE_TTL_DEFAULT,
    SHORT: CACHE_TTL_SHORT,
    LONG: CACHE_TTL_LONG
};
