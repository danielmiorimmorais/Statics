/**
 * Utilitarios do Sistema
 * Funcoes auxiliares para formatacao, validacao e manipulacao de dados
 */

// Polyfills para compatibilidade com navegadores antigos
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = parseInt(list.length) || 0;
    var thisArg = arguments[1];
    for (var i = 0; i < length; i++) {
      var element = list[i];
      if (predicate.call(thisArg, element, i, list)) {
        return element;
      }
    }
    return undefined;
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = parseInt(list.length) || 0;
    var thisArg = arguments[1];
    for (var i = 0; i < length; i++) {
      var element = list[i];
      if (predicate.call(thisArg, element, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

// Polyfill para Promise.allSettled (se não existir)
if (!Promise.allSettled) {
  Promise.allSettled = function(promises) {
    return Promise.all(promises.map(p => 
      Promise.resolve(p).then(
        value => ({ status: 'fulfilled', value }),
        reason => ({ status: 'rejected', reason })
      )
    ));
  };
}

const Utils = {
  // Formatadores pre-configurados
  formatters: {
    number: new Intl.NumberFormat('pt-BR'),
    compact: new Intl.NumberFormat('pt-BR', { 
      notation: 'compact', 
      maximumFractionDigits: 1 
    }),
    percentage1: new Intl.NumberFormat('pt-BR', { 
      maximumFractionDigits: 1 
    }),
    percentage2: new Intl.NumberFormat('pt-BR', { 
      maximumFractionDigits: 2 
    }),
    date: new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  // Selectors rapidos
  qs: function(selector, element) {
    return (element || document).querySelector(selector);
  },

  qsa: function(selector, element) {
    return Array.from((element || document).querySelectorAll(selector));
  },

  // Event binding simplificado
  on: function(selector, event, callback) {
    const el = this.qs(selector);
    if (el) el.addEventListener(event, callback);
  },

  // Formatacao de numeros
  formatNumber: function(value) {
    if (value == null || isNaN(value)) return '0';
    return this.formatters.number.format(Math.floor(value));
  },

  formatCompact: function(value) {
    if (value == null || isNaN(value)) return '0';
    return this.formatters.compact.format(value);
  },

  formatPercentage: function(value, decimals = 1) {
    if (value == null || isNaN(value)) return '0%';
    const formatter = decimals === 1 ? this.formatters.percentage1 : this.formatters.percentage2;
    return formatter.format(value) + '%';
  },

  // Formatacao de data
  formatDate: function(dateString) {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return this.formatters.date.format(date);
    } catch (error) {
      return '—';
    }
  },

  // Calcula horas desde uma data
  hoursSince: function(dateString) {
    if (!dateString) return 0;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, Math.round(diffHours));
    } catch (error) {
      return 0;
    }
  },

  // URL de thumbnail do YouTube
  getThumbnailUrl: function(videoId, customUrl = null) {
    if (customUrl) return customUrl;
    if (!videoId) return '';
    return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  },

  // Limpeza de texto
  cleanText: function(text) {
    if (!text) return '';
    return String(text).replace(/\s+/g, ' ').trim();
  },

  // Debounce para performance
  debounce: function(func, wait = 200) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle para performance
  throttle: function(func, limit = 16) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
          if (lastArgs !== args) {
            throttled.apply(this, lastArgs);
          }
        }, limit);
      }
    };
  },

  // Nova função: debounce com cancelamento
  debounceWithCancel: function(func, wait = 200) {
    let timeout;
    const debounced = function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
    
    debounced.cancel = function() {
      clearTimeout(timeout);
    };
    
    return debounced;
  },

  // Nova função: throttle com cancelamento
  throttleWithCancel: function(func, limit = 16) {
    let inThrottle;
    let lastArgs;
    
    const throttled = function(...args) {
      lastArgs = args;
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
          if (lastArgs !== args) {
            throttled.apply(this, lastArgs);
          }
        }, limit);
      }
    };
    
    throttled.cancel = function() {
      inThrottle = false;
      lastArgs = null;
    };
    
    return throttled;
  },

  // Manipulacao de arrays
  array: {
    sum(arr, key = null) {
      return arr.reduce((total, item) => {
        const value = key ? item[key] : item;
        return total + (typeof value === 'number' && !isNaN(value) ? value : 0);
      }, 0);
    },

    groupBy(arr, key) {
      return arr.reduce((groups, item) => {
        const groupKey = typeof key === 'function' ? key(item) : item[key];
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
      }, {});
    },

    unique(arr, key = null) {
      const seen = new Set();
      return arr.filter(item => {
        const value = key ? item[key] : item;
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }
  },

  // Manipulacao de strings
  string: {
    truncate(text, maxLength, suffix = '...') {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength - suffix.length) + suffix;
    },

    capitalize(text) {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Nova função para sanitização segura de HTML
    sanitizeHtml(html) {
      if (!html) return '';
      
      // Remove scripts e outros elementos perigosos
      const temp = document.createElement('div');
      temp.innerHTML = html;
      
      // Remove scripts
      const scripts = temp.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      
      // Remove event handlers
      const elements = temp.querySelectorAll('*');
      elements.forEach(el => {
        const attrs = el.attributes;
        for (let i = attrs.length - 1; i >= 0; i--) {
          const attr = attrs[i];
          if (attr.name.startsWith('on') || attr.name.startsWith('javascript:')) {
            el.removeAttribute(attr.name);
          }
        }
      });
      
      return temp.innerHTML;
    }
  },

  // CSV e downloads
  toCsv: function(rows, headers = null) {
    const escape = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const head = headers ? headers.map(escape).join(',') + '\n' : '';
    const body = rows.map(r => r.map(escape).join(',')).join('\n');
    return head + body;
  },

  download: function(filename, content, mime = 'text/csv') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  // Storage helpers
  storage: {
    set(key, value) {
      try {
        // Para valores simples como string, salva diretamente
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
        return true;
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
        return false;
      }
    },

    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        
        // Para o tema, retorna sempre como string
        if (key === 'theme') {
          return item;
        }
        
        // Para outros valores, tenta JSON parse
        try {
          return JSON.parse(item);
        } catch (parseError) {
          console.log(`Item '${key}' não é JSON válido, retornando como string:`, item);
          return item;
        }
      } catch (error) {
        console.warn('Erro ao carregar do localStorage:', error);
        return defaultValue;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn('Erro ao remover do localStorage:', error);
        return false;
      }
    }
  },

  // Sistema de monitoramento de performance
  performance: {
    metrics: {
      loadTimes: [],
      memoryUsage: [],
      errors: []
    },

    // Registra tempo de carregamento
    recordLoadTime(name, duration) {
      this.metrics.loadTimes.push({
        name,
        duration,
        timestamp: Date.now()
      });
      
      // Mantém apenas os últimos 100 registros
      if (this.metrics.loadTimes.length > 100) {
        this.metrics.loadTimes = this.metrics.loadTimes.slice(-100);
      }
      
      console.log(`⏱️ [PERF] ${name}: ${duration.toFixed(2)}ms`);
    },

    // Registra uso de memória (se disponível)
    recordMemoryUsage() {
      if (performance.memory) {
        const memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        this.metrics.memoryUsage.push(memory);
        
        // Mantém apenas os últimos 50 registros
        if (this.metrics.memoryUsage.length > 50) {
          this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-50);
        }
        
        console.log(`💾 [PERF] Memória: ${(memory.used / 1024 / 1024).toFixed(2)}MB / ${(memory.limit / 1024 / 1024).toFixed(2)}MB`);
      }
    },

    // Registra erro
    recordError(error, context = '') {
      const errorRecord = {
        message: error.message || String(error),
        stack: error.stack,
        context,
        timestamp: Date.now()
      };
      
      this.metrics.errors.push(errorRecord);
      
      // Mantém apenas os últimos 50 erros
      if (this.metrics.errors.length > 50) {
        this.metrics.errors = this.metrics.errors.slice(-50);
      }
      
      console.error(`❌ [PERF] Erro registrado: ${errorRecord.message}`, errorRecord);
    },

    // Obtém relatório de performance
    getReport() {
      const loadTimes = this.metrics.loadTimes;
      const memoryUsage = this.metrics.memoryUsage;
      const errors = this.metrics.errors;
      
      const avgLoadTime = loadTimes.length > 0 
        ? loadTimes.reduce((sum, lt) => sum + lt.duration, 0) / loadTimes.length 
        : 0;
      
      const maxLoadTime = loadTimes.length > 0 
        ? Math.max(...loadTimes.map(lt => lt.duration)) 
        : 0;
      
      const currentMemory = memoryUsage.length > 0 
        ? memoryUsage[memoryUsage.length - 1] 
        : null;
      
      return {
        loadTimes: {
          count: loadTimes.length,
          average: avgLoadTime,
          maximum: maxLoadTime,
          recent: loadTimes.slice(-10)
        },
        memory: currentMemory ? {
          used: currentMemory.used,
          total: currentMemory.total,
          limit: currentMemory.limit,
          percentage: (currentMemory.used / currentMemory.limit) * 100
        } : null,
        errors: {
          count: errors.length,
          recent: errors.slice(-10)
        },
        timestamp: Date.now()
      };
    },

    // Limpa métricas antigas
    cleanup() {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      this.metrics.loadTimes = this.metrics.loadTimes.filter(lt => now - lt.timestamp < oneHour);
      this.metrics.memoryUsage = this.metrics.memoryUsage.filter(m => now - m.timestamp < oneHour);
      this.metrics.errors = this.metrics.errors.filter(e => now - e.timestamp < oneHour);
    }
  },

  // Sistema de logging melhorado
  logger: {
    levels: {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    },
    
    currentLevel: 1, // INFO por padrão
    logs: [],
    maxLogs: 1000,
    
    // Configura nível de log
    setLevel(level) {
      if (this.levels[level] !== undefined) {
        this.currentLevel = this.levels[level];
        console.log(`🔧 [LOGGER] Nível definido para: ${level}`);
      }
    },
    
    // Função base de logging
    _log(level, message, data = null) {
      if (this.levels[level] < this.currentLevel) return;
      
      const logEntry = {
        level,
        message,
        data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      this.logs.push(logEntry);
      
      // Mantém limite de logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
      
      // Salva no localStorage periodicamente
      if (this.logs.length % 50 === 0) {
        this.persist();
      }
      
      // Console output
      const emoji = {
        DEBUG: '🔍',
        INFO: 'ℹ️',
        WARN: '⚠️',
        ERROR: '❌'
      }[level];
      
      if (data) {
        console.log(`${emoji} [${level}] ${message}`, data);
      } else {
        console.log(`${emoji} [${level}] ${message}`);
      }
    },
    
    debug(message, data = null) {
      this._log('DEBUG', message, data);
    },
    
    info(message, data = null) {
      this._log('INFO', message, data);
    },
    
    warn(message, data = null) {
      this._log('WARN', message, data);
    },
    
    error(message, data = null) {
      this._log('ERROR', message, data);
    },
    
    // Persiste logs no localStorage
    persist() {
      try {
        const logsToSave = this.logs.slice(-100); // Salva apenas os últimos 100
        Utils.storage.set('app_logs', logsToSave);
      } catch (error) {
        console.warn('Erro ao persistir logs:', error);
      }
    },
    
    // Carrega logs do localStorage
    load() {
      try {
        const savedLogs = Utils.storage.get('app_logs', []);
        this.logs = savedLogs;
        console.log(`📋 [LOGGER] ${this.logs.length} logs carregados`);
      } catch (error) {
        console.warn('Erro ao carregar logs:', error);
      }
    },
    
    // Obtém logs filtrados
    getLogs(level = null, limit = 100) {
      let filtered = this.logs;
      
      if (level && this.levels[level] !== undefined) {
        filtered = filtered.filter(log => log.level === level);
      }
      
      return filtered.slice(-limit);
    },
    
    // Limpa logs antigos
    cleanup() {
      const oneDay = 24 * 60 * 60 * 1000;
      const now = new Date();
      
      this.logs = this.logs.filter(log => {
        const logTime = new Date(log.timestamp);
        return (now - logTime) < oneDay;
      });
      
      this.persist();
    },
    
    // Exporta logs
    export() {
      return {
        logs: this.logs,
        summary: {
          total: this.logs.length,
          byLevel: this.logs.reduce((acc, log) => {
            acc[log.level] = (acc[log.level] || 0) + 1;
            return acc;
          }, {}),
          timeRange: {
            start: this.logs[0]?.timestamp,
            end: this.logs[this.logs.length - 1]?.timestamp
          }
        }
      };
    }
  }
};

// Expoe globalmente
window.Utils = Utils;

console.log('✅ Utils carregado com sucesso!');