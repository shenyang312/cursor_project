// 防刷中间件
class RateLimit {
    constructor() {
        this.requests = new Map(); // key: `${type}:${identifier}` => [timestamps]
        const isProd = (process.env.NODE_ENV === 'production');
        this.limits = {
            // 邮件发送限制：每分钟最多3次
            email: { max: isProd ? 3 : 20, window: 60 * 1000 },
            // API请求限制：每分钟最多10次
            api: { max: isProd ? 10 : 200, window: 60 * 1000 },
            // 登录限制：每分钟最多5次
            login: { max: isProd ? 5 : 100, window: 60 * 1000 }
        };
    }

    getKey(identifier, type) {
        return `${type}:${identifier}`;
    }

    // 清理过期记录
    cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const type = key.split(':')[0];
            const windowMs = (this.limits[type] ? this.limits[type].window : this.limits.api.window);
            const validRequests = requests.filter(req => now - req < windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validRequests);
            }
        }
    }

    // 检查是否超过限制
    isRateLimited(identifier, type = 'api') {
        this.cleanup();
        
        const now = Date.now();
        const limit = this.limits[type];
        const key = this.getKey(identifier, type);

        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }
        
        const requests = this.requests.get(key);
        const validRequests = requests.filter(req => now - req < limit.window);
        
        if (validRequests.length >= limit.max) {
            return true;
        }
        
        validRequests.push(now);
        this.requests.set(key, validRequests);
        return false;
    }

    // 获取客户端标识
    getClientIdentifier(req) {
        return req.ip || req.connection.remoteAddress || 'unknown';
    }

    // 邮件发送防刷中间件
    emailRateLimit() {
        return (req, res, next) => {
            const identifier = this.getClientIdentifier(req);
            
            if (this.isRateLimited(identifier, 'email')) {
                return res.status(429).json({
                    success: false,
                    message: '发送频率过高，请稍后再试'
                });
            }
            
            next();
        };
    }

    // API请求防刷中间件
    apiRateLimit() {
        return (req, res, next) => {
            const identifier = this.getClientIdentifier(req);
            
            if (this.isRateLimited(identifier, 'api')) {
                return res.status(429).json({
                    success: false,
                    message: '请求频率过高，请稍后再试'
                });
            }
            
            next();
        };
    }

    // 登录防刷中间件
    loginRateLimit() {
        return (req, res, next) => {
            if (process.env.NODE_ENV !== 'production') {
                // 开发环境不限制登录频率，避免本地调试被锁
                return next();
            }
            const identifier = this.getClientIdentifier(req);
            
            if (this.isRateLimited(identifier, 'login')) {
                return res.status(429).json({
                    success: false,
                    message: '登录尝试次数过多，请稍后再试'
                });
            }
            
            next();
        };
    }
}

module.exports = new RateLimit();
