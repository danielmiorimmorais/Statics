/**
 * Error Handler - Tratamento de erros externos e extensões
 * Gerencia erros que não são causados pelo nosso código
 */

const ErrorHandler = {
  // Inicializa o tratamento de erros
  init() {
    console.log('🛡️ [ERROR_HANDLER] Inicializando tratamento de erros...');
    
    // Captura erros globais
    this.setupGlobalErrorHandling();
    
    // Captura erros de extensões
    this.setupExtensionErrorHandling();
    
    // Captura erros de recursos bloqueados
    this.setupResourceErrorHandling();
    
    console.log('✅ [ERROR_HANDLER] Tratamento de erros configurado');
  },

  // Configura captura de erros globais
  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      // Ignora erros de extensões
      if (this.isExtensionError(event)) {
        console.warn('⚠️ [ERROR_HANDLER] Erro de extensão ignorado:', event.error?.message);
        return;
      }
      
      // Ignora erros de recursos bloqueados
      if (this.isBlockedResourceError(event)) {
        console.warn('⚠️ [ERROR_HANDLER] Recurso bloqueado ignorado:', event.target?.src || event.target?.href);
        return;
      }
      
      // Ignora erros de elementos não encontrados
      if (event.error?.message && this.isElementNotFoundError(event.error.message)) {
        console.warn('⚠️ [ERROR_HANDLER] Elemento não encontrado (normal):', event.error.message);
        return;
      }
      
      // Log de erros reais
      console.error('❌ [ERROR_HANDLER] Erro capturado:', {
        message: event.error?.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Captura erros não capturados
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('⚠️ [ERROR_HANDLER] Promise rejeitada não tratada:', event.reason);
    });
  },

  // Configura captura de erros de extensões
  setupExtensionErrorHandling() {
    // Intercepta erros de content scripts
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Ignora erros de extensões conhecidas
      if (this.isExtensionErrorMessage(message)) {
        console.warn('⚠️ [ERROR_HANDLER] Erro de extensão ignorado:', message);
        return;
      }
      
      // Ignora erros de elementos não encontrados que são normais
      if (this.isElementNotFoundError(message)) {
        console.warn('⚠️ [ERROR_HANDLER] Elemento não encontrado (normal):', message);
        return;
      }
      
      // Ignora erros específicos de elementos que podem não existir
      if (message.includes('Canvas #') && message.includes('não encontrado')) {
        console.warn('⚠️ [ERROR_HANDLER] Canvas não encontrado (normal):', message);
        return;
      }
      
      // Chama o console.error original para erros reais
      originalConsoleError.apply(console, args);
    };
  },

  // Configura captura de erros de recursos
  setupResourceErrorHandling() {
    window.addEventListener('error', (event) => {
      if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
        console.warn('⚠️ [ERROR_HANDLER] Falha ao carregar recurso:', {
          tag: event.target.tagName,
          src: event.target.src,
          href: event.target.href,
          type: event.target.type
        });
      }
    }, true);
  },

  // Verifica se é erro de extensão
  isExtensionError(event) {
    const filename = event.filename || '';
    const message = event.error?.message || '';
    const stack = event.error?.stack || '';
    
    // Padrões de extensões conhecidas
    const extensionPatterns = [
      'content.js',
      'background.js',
      'extension',
      'chrome-extension',
      'moz-extension',
      'safari-extension',
      'runtime',
      'chrome.runtime',
      'browser.runtime',
      'Cannot read properties of null (reading \'runtime\')'
    ];
    
    return extensionPatterns.some(pattern => 
      filename.includes(pattern) || 
      message.includes(pattern) ||
      stack.includes(pattern)
    );
  },

  // Verifica se é erro de extensão por mensagem
  isExtensionErrorMessage(message) {
    const extensionMessages = [
      'Cannot read properties of null (reading \'runtime\')',
      'chrome.runtime',
      'browser.runtime',
      'extension',
      'content script'
    ];
    
    return extensionMessages.some(pattern => message.includes(pattern));
  },

  // Verifica se é erro de elemento não encontrado
  isElementNotFoundError(message) {
    const elementNotFoundPatterns = [
      'Canvas #share-chart não encontrado',
      'Canvas #trend-chart não encontrado',
      'Container não encontrado',
      'Elemento #benchmarkContent não encontrado',
      'Elementos select não encontrados',
      'Elementos de grupos não encontrados',
      'Elemento #benchmarkResults não encontrado',
      'Elemento #videos24Body não encontrado',
      'Elemento #channelTrendContainer não encontrado',
      'Elemento #channelTrendChart não encontrado',
      '#share-chart não encontrado',
      '#trend-chart não encontrado',
      'não encontrado'
    ];
    
    return elementNotFoundPatterns.some(pattern => message.includes(pattern));
  },

  // Verifica se é erro de recurso bloqueado
  isBlockedResourceError(event) {
    const target = event.target;
    if (!target) return false;
    
    // Verifica se é um script ou link bloqueado
    if (target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
      const src = target.src || target.href || '';
      
      // Padrões de recursos que podem ser bloqueados
      const blockedPatterns = [
        'beacon.min.js',
        'analytics',
        'tracking',
        'adblock',
        'cloudflareinsights'
      ];
      
      return blockedPatterns.some(pattern => src.includes(pattern));
    }
    
    return false;
  },

  // Registra erro para análise
  logError(error, context = 'unknown') {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('❌ [ERROR_HANDLER] Erro registrado:', errorInfo);
    
    // Armazena para análise posterior
    if (!window.errorLog) {
      window.errorLog = [];
    }
    window.errorLog.push(errorInfo);
    
    // Limita o log a 50 erros
    if (window.errorLog.length > 50) {
      window.errorLog = window.errorLog.slice(-50);
    }
  },

  // Obtém log de erros
  getErrorLog() {
    return window.errorLog || [];
  },

  // Limpa log de erros
  clearErrorLog() {
    window.errorLog = [];
    console.log('🧹 [ERROR_HANDLER] Log de erros limpo');
  },

  // Verifica se há erros críticos
  hasCriticalErrors() {
    const log = this.getErrorLog();
    return log.some(error => 
      !this.isExtensionError({ error }) && 
      !this.isBlockedResourceError({ target: null })
    );
  },

  // Relatório de status
  getStatus() {
    const log = this.getErrorLog();
    const extensionErrors = log.filter(error => 
      this.isExtensionErrorMessage(error.message)
    ).length;
    
    const blockedResources = log.filter(error => 
      this.isBlockedResourceError({ target: { src: error.message } })
    ).length;
    
    const criticalErrors = log.filter(error => 
      !this.isExtensionErrorMessage(error.message) &&
      !this.isBlockedResourceError({ target: { src: error.message } })
    ).length;
    
    return {
      total: log.length,
      extensionErrors,
      blockedResources,
      criticalErrors,
      hasIssues: criticalErrors > 0
    };
  }
};

// Inicializa automaticamente
if (typeof window !== 'undefined') {
  ErrorHandler.init();
}

// Expoe globalmente
window.ErrorHandler = ErrorHandler;

console.log('✅ ErrorHandler carregado com sucesso!');
