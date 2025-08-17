// 防刷中间件
class RateLimit {
    constructor() {
        this.requests = new Map();
        this.limits = {
            // 邮件发送限制：每分钟最多3次
            email: { max: 3, window: 60 * 1000 },
            // API请求限制：每分钟最多10次
            api: { max: 10, window: 60 * 1000 },
            // 登录限制：每分钟最多5次
            login: { max: 5, window: 60 * 1000 }
        };
    }

    // 清理过期记录
    cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const validRequests = requests.filter(req => now - req < this.limits.api.window);
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
        
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }
        
        const requests = this.requests.get(identifier);
        const validRequests = requests.filter(req => now - req < limit.window);
        
        if (validRequests.length >= limit.max) {
            return true;
        }
        
        validRequests.push(now);
        this.requests.set(identifier, validRequests);
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
