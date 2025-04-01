class CacheService {
    constructor(expirationTime = 5 * 60 * 1000) { // 5 minutos por padrão
        this.cache = {
            timestamp: null,
            data: null,
            expirationTime
        };
    }

    set(data) {
        this.cache = {
            timestamp: Date.now(),
            data,
            expirationTime: this.cache.expirationTime
        };
    }

    get() {
        if (this.isValid()) {
            return this.cache.data;
        }
        return null;
    }

    isValid() {
        return this.cache.data && 
               this.cache.timestamp && 
               (Date.now() - this.cache.timestamp) < this.cache.expirationTime;
    }

    clear() {
        this.cache = {
            timestamp: null,
            data: null,
            expirationTime: this.cache.expirationTime
        };
    }
}

export default new CacheService(); 