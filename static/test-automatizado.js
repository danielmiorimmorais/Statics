/**
 * 🧪 Script de Teste Automatizado
 * Testa todos os arquivos JavaScript e CDNs do projeto
 */

class TesteAutomatizado {
    constructor() {
        this.resultados = {
            sucessos: 0,
            erros: 0,
            avisos: 0,
            total: 0
        };
        this.logs = [];
    }

    // Sistema de logging
    log(mensagem, tipo = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${tipo.toUpperCase()}: ${mensagem}`;
        this.logs.push(logEntry);
        console.log(logEntry);
        
        // Atualizar interface se existir
        const logsElement = document.getElementById('logs-content');
        if (logsElement) {
            logsElement.innerHTML = this.logs.join('\n');
            logsElement.scrollTop = logsElement.scrollHeight;
        }
    }

    // Teste de CDNs
    async testarCDNs() {
        this.log('🌐 Iniciando teste de CDNs...');
        
        const cdns = [
            {
                nome: 'Chart.js (Cloudflare)',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
                teste: () => typeof Chart !== 'undefined'
            },
            {
                nome: 'Chart.js (jsDelivr)',
                url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
                teste: () => typeof Chart !== 'undefined'
            },
            {
                nome: 'Tailwind CSS (Cloudflare)',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css',
                teste: () => document.querySelector('link[href*="tailwindcss"]') !== null
            }
        ];

        for (const cdn of cdns) {
            try {
                this.log(`Testando ${cdn.nome}...`);
                
                if (cdn.url.includes('.css')) {
                    // Teste de CSS
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = cdn.url;
                    
                    await new Promise((resolve, reject) => {
                        link.onload = resolve;
                        link.onerror = reject;
                        document.head.appendChild(link);
                    });
                    
                    this.resultados.sucessos++;
                    this.log(`${cdn.nome}: ✅ Carregado com sucesso`, 'success');
                } else {
                    // Teste de JavaScript
                    const script = document.createElement('script');
                    script.src = cdn.url;
                    script.async = false;
                    
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                    
                    // Aguardar carregamento
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const funcionando = cdn.teste();
                    if (funcionando) {
                        this.resultados.sucessos++;
                        this.log(`${cdn.nome}: ✅ Funcionando`, 'success');
                    } else {
                        this.resultados.erros++;
                        this.log(`${cdn.nome}: ❌ Não funcionando`, 'error');
                    }
                }
                
            } catch (error) {
                this.resultados.erros++;
                this.log(`${cdn.nome}: ❌ Erro - ${error.message}`, 'error');
            }
            this.resultados.total++;
        }
    }

    // Teste de arquivos locais
    async testarArquivosLocais() {
        this.log('📁 Iniciando teste de arquivos locais...');
        
        const arquivos = [
            'js/utils.js',
            'js/data-store.js',
            'js/components.js',
            'js/features.js',
            'js/tab-renderers.js',
            'js/app.js',
            'data/current.json',
            'data/history.json',
            'data/metadata.json'
        ];

        for (const arquivo of arquivos) {
            try {
                this.log(`Testando ${arquivo}...`);
                const response = await fetch(arquivo);
                
                if (response.ok) {
                    const tamanho = response.headers.get('content-length') || 'N/A';
                    const tamanhoKB = tamanho !== 'N/A' ? Math.round(tamanho / 1024) : 'N/A';
                    
                    this.resultados.sucessos++;
                    this.log(`${arquivo}: ✅ Disponível (${tamanhoKB} KB)`, 'success');
                } else {
                    this.resultados.erros++;
                    this.log(`${arquivo}: ❌ Não encontrado (Status: ${response.status})`, 'error');
                }
                
            } catch (error) {
                this.resultados.erros++;
                this.log(`${arquivo}: ❌ Erro de rede - ${error.message}`, 'error');
            }
            this.resultados.total++;
        }
    }

    // Teste de funcionalidades do navegador
    async testarFuncionalidades() {
        this.log('⚙️ Iniciando teste de funcionalidades...');
        
        const funcionalidades = [
            {
                nome: 'Console',
                teste: () => {
                    console.log('Teste de console');
                    return true;
                }
            },
            {
                nome: 'Fetch API',
                teste: async () => {
                    const response = await fetch('js/utils.js');
                    return response.ok;
                }
            },
            {
                nome: 'LocalStorage',
                teste: () => {
                    try {
                        localStorage.setItem('teste', 'valor');
                        const valor = localStorage.getItem('teste');
                        localStorage.removeItem('teste');
                        return valor === 'valor';
                    } catch {
                        return false;
                    }
                }
            },
            {
                nome: 'JSON',
                teste: () => {
                    try {
                        JSON.parse('{"teste": "valor"}');
                        return true;
                    } catch {
                        return false;
                    }
                }
            },
            {
                nome: 'Promise',
                teste: () => {
                    return typeof Promise !== 'undefined';
                }
            },
            {
                nome: 'Async/Await',
                teste: () => {
                    return (async () => true)() instanceof Promise;
                }
            }
        ];

        for (const funcionalidade of funcionalidades) {
            try {
                this.log(`Testando ${funcionalidade.nome}...`);
                const resultado = await funcionalidade.teste();
                
                if (resultado) {
                    this.resultados.sucessos++;
                    this.log(`${funcionalidade.nome}: ✅ Funcionando`, 'success');
                } else {
                    this.resultados.erros++;
                    this.log(`${funcionalidade.nome}: ❌ Não funcionando`, 'error');
                }
                
            } catch (error) {
                this.resultados.erros++;
                this.log(`${funcionalidade.nome}: ❌ Erro - ${error.message}`, 'error');
            }
            this.resultados.total++;
        }
    }

    // Teste de performance
    async testarPerformance() {
        this.log('⚡ Iniciando teste de performance...');
        
        const metricas = [
            {
                nome: 'Tempo de Carregamento',
                teste: () => {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    return loadTime < 3000; // Menos de 3 segundos
                }
            },
            {
                nome: 'Memória Disponível',
                teste: () => {
                    if (performance.memory) {
                        const memoriaLivre = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
                        return memoriaLivre < 50; // Menos de 50MB
                    }
                    return true; // Não consegue medir
                }
            }
        ];

        for (const metrica of metricas) {
            try {
                this.log(`Testando ${metrica.nome}...`);
                const resultado = metrica.teste();
                
                if (resultado) {
                    this.resultados.sucessos++;
                    this.log(`${metrica.nome}: ✅ OK`, 'success');
                } else {
                    this.resultados.avisos++;
                    this.log(`${metrica.nome}: ⚠️ Lento`, 'warning');
                }
                
            } catch (error) {
                this.resultados.avisos++;
                this.log(`${metrica.nome}: ⚠️ Não pode medir - ${error.message}`, 'warning');
            }
            this.resultados.total++;
        }
    }

    // Gerar relatório
    gerarRelatorio() {
        this.log('📊 Gerando relatório final...');
        
        const percentualSucesso = Math.round((this.resultados.sucessos / this.resultados.total) * 100);
        const percentualErro = Math.round((this.resultados.erros / this.resultados.total) * 100);
        
        const relatorio = `
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 class="text-xl font-bold mb-4">📊 Relatório de Testes</h3>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="text-center p-4 bg-blue-100 rounded">
                        <div class="text-2xl font-bold text-blue-600">${this.resultados.total}</div>
                        <div class="text-sm">Total</div>
                    </div>
                    <div class="text-center p-4 bg-green-100 rounded">
                        <div class="text-2xl font-bold text-green-600">${this.resultados.sucessos}</div>
                        <div class="text-sm">Sucessos</div>
                    </div>
                    <div class="text-center p-4 bg-yellow-100 rounded">
                        <div class="text-2xl font-bold text-yellow-600">${this.resultados.avisos}</div>
                        <div class="text-sm">Avisos</div>
                    </div>
                    <div class="text-center p-4 bg-red-100 rounded">
                        <div class="text-2xl font-bold text-red-600">${this.resultados.erros}</div>
                        <div class="text-sm">Erros</div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between mb-2">
                        <span>Taxa de Sucesso</span>
                        <span>${percentualSucesso}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-green-600 h-2 rounded-full" style="width: ${percentualSucesso}%"></div>
                    </div>
                </div>
                
                <div class="text-center">
                    <strong class="text-lg">
                        Status: ${this.resultados.erros === 0 ? '✅ Tudo OK' : 
                                 this.resultados.erros < 3 ? '⚠️ Parcial' : '❌ Problemas'}
                    </strong>
                </div>
            </div>
        `;
        
        // Atualizar interface se existir
        const statusElement = document.getElementById('status-geral');
        if (statusElement) {
            statusElement.innerHTML = relatorio;
        }
        
        this.log(`Relatório gerado: ${percentualSucesso}% de sucesso`, 'success');
        return relatorio;
    }

    // Executar todos os testes
    async executarTodos() {
        this.log('🚀 Iniciando testes automatizados...');
        
        try {
            await Promise.all([
                this.testarCDNs(),
                this.testarArquivosLocais(),
                this.testarFuncionalidades(),
                this.testarPerformance()
            ]);
            
            this.gerarRelatorio();
            this.log('✅ Todos os testes finalizados!', 'success');
            
        } catch (error) {
            this.log(`❌ Erro durante os testes: ${error.message}`, 'error');
        }
    }
}

// Exportar para uso global
window.TesteAutomatizado = TesteAutomatizado;

// Executar automaticamente se estiver na página de teste
if (window.location.pathname.includes('test')) {
    const teste = new TesteAutomatizado();
    teste.executarTodos();
}
