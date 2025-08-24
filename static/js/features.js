/**
 * Funcionalidades específicas
 * Palavras-chave, benchmark, comparações e outras funcionalidades avançadas
 */

class Features {
  constructor() {
    this.keywords = [];
    this.comparisonResults = null;
  }

  // Funcionalidades de palavras-chave
  async addKeyword(keyword) {
    if (!keyword || keyword.trim().length === 0) {
      alert('Digite uma palavra-chave válida');
      return;
    }

    try {
        const response = await fetch('api/add-keyword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Palavra-chave adicionada com sucesso!');
        // Recarrega dados de palavras-chave
        await this.loadKeywords();
        // Re-renderiza aba de keywords
        if (AppState.currentTab === 'keywords') {
          TabRenderers.renderTable('keywords');
        }
      } else {
        alert(data.error || 'Erro ao adicionar palavra-chave');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  }

  async loadKeywords() {
    try {
        const response = await fetch('api/keywords');
      const data = await response.json();
      
      if (data.success) {
        this.keywords = data.data.keywords || [];
        // Atualiza DataStore
        (window.AppDataStore || window.DataStore).setData(12, { keywords: this.keywords }); // keywordAnalysis
      }
    } catch (error) {
      console.error('Erro ao carregar palavras-chave:', error);
    }
  }

  // Funcionalidades de benchmark
  async compareChannels(channel1, channel2) {
    if (!channel1 || !channel2) {
      alert('Digite os nomes dos dois canais');
      return;
    }

    try {
        const response = await fetch('api/benchmark/compare-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel1, channel2 })
      });

      const data = await response.json();
      
      if (data.success) {
        this.comparisonResults = data.data;
        this.showComparisonResults();
      } else {
        alert(data.error || 'Erro na comparação');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  }

  async compareGroups(group1, group2) {
    if (!group1 || !group2) {
      alert('Digite os nomes dos dois grupos');
      return;
    }

    try {
        const response = await fetch('api/benchmark/compare-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group1, group2 })
      });

      const data = await response.json();
      
      if (data.success) {
        this.comparisonResults = data.data;
        this.showComparisonResults();
      } else {
        alert(data.error || 'Erro na comparação');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  }

  showComparisonResults() {
    if (!this.comparisonResults) return;

    const html = `
      <div class="card p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold">Resultados da Comparação</h3>
          <button onclick="Features.clearComparison()" class="btn-ghost text-xs">Limpar</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>${this.comparisonResults.item1_name}</th>
                <th>${this.comparisonResults.item2_name}</th>
                <th>Diferença</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(this.comparisonResults.metrics).map(([metric, values]) => `
                <tr>
                  <td>${this.formatMetricName(metric)}</td>
                  <td>${this.formatMetricValue(values.item1)}</td>
                  <td>${this.formatMetricValue(values.item2)}</td>
                  <td class="${values.difference > 0 ? 'text-green-600' : values.difference < 0 ? 'text-red-600' : 'text-zinc-600'}">
                    ${values.difference > 0 ? '+' : ''}${this.formatMetricValue(values.difference)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Adiciona resultados ao final da aba benchmark
    const benchmarkContent = document.getElementById('tabContent');
    if (benchmarkContent) {
      const existingResults = benchmarkContent.querySelector('.comparison-results');
      if (existingResults) {
        existingResults.remove();
      }
      
      const resultsDiv = document.createElement('div');
      resultsDiv.className = 'comparison-results';
      resultsDiv.innerHTML = html;
      benchmarkContent.appendChild(resultsDiv);
    }
  }

  clearComparison() {
    this.comparisonResults = null;
    const existingResults = document.querySelector('.comparison-results');
    if (existingResults) {
      existingResults.remove();
    }
  }

  formatMetricName(metric) {
    const names = {
      'subscriber_count': 'Inscritos',
      'total_videos': 'Total de Vídeos',
      'total_views': 'Total de Views',
      'total_likes': 'Total de Likes',
      'total_comments': 'Total de Comentários',
      'engagement_rate': 'Taxa de Engajamento',
      'views_per_video': 'Views por Vídeo',
      'likes_per_video': 'Likes por Vídeo',
      'comments_per_video': 'Comentários por Vídeo',
      'avg_views_24h': 'Média Views 24h',
      'avg_likes_24h': 'Média Likes 24h',
      'avg_comments_24h': 'Média Comentários 24h'
    };
    return names[metric] || metric;
  }

  formatMetricValue(value) {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return Utils.formatCompact(value);
      } else if (value >= 1000) {
        return Utils.formatCompact(value);
      } else if (value < 1 && value > 0) {
        return Utils.formatPercentage(value * 100, 2);
      } else {
        return Utils.formatNumber(value);
      }
    }
    return value || '0';
  }

  // Renderiza seção de benchmark com funcionalidades avançadas
  renderBenchmark() {
    const benchmarkData = (window.AppDataStore || window.DataStore).getBenchmarkData();
    const channels = benchmarkData?.channels || [];
    
    const metrics = {
      avgViews: channels.reduce((sum, c) => sum + (c.total_views || 0), 0) / Math.max(1, channels.length),
      avgEngagement: channels.reduce((sum, c) => sum + (c.engagement_rate || 0), 0) / Math.max(1, channels.length),
      totalChannels: channels.length
    };

    const html = `
      <div class="space-y-6">
        <!-- Cards de métricas -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ${Utils.formatCompact(metrics.avgViews)}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Média de Views</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              ${Utils.formatPercentage(metrics.avgEngagement, 2)}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Média de Engajamento</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${Utils.formatNumber(metrics.totalChannels)}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Total de Canais</div>
          </div>
        </div>

        <!-- Comparações -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Comparação de Canais -->
          <div class="card p-4">
            <h3 class="font-semibold mb-3">Comparar Canais</h3>
            <div class="space-y-3">
              <input id="channel1" placeholder="Nome do primeiro canal" class="keyword-input">
              <input id="channel2" placeholder="Nome do segundo canal" class="keyword-input">
              <button onclick="Features.compareChannels(document.getElementById('channel1').value, document.getElementById('channel2').value)" class="btn w-full">
                Comparar Canais
              </button>
            </div>
          </div>

          <!-- Comparação de Grupos -->
          <div class="card p-4">
            <h3 class="font-semibold mb-3">Comparar Grupos</h3>
            <div class="space-y-3">
              <input id="group1" placeholder="Nome do primeiro grupo" class="keyword-input">
              <input id="group2" placeholder="Nome do segundo grupo" class="keyword-input">
              <button onclick="Features.compareGroups(document.getElementById('group1').value, document.getElementById('group2').value)" class="btn w-full">
                Comparar Grupos
              </button>
            </div>
          </div>
        </div>

        <!-- Tabela de canais -->
        <div class="card p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Canais por Performance</h3>
            <button onclick="TabRenderers.downloadCSV('benchmark')" class="btn-ghost text-xs">📥 Exportar CSV</button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-xs">
                  <th class="th sortable" onclick="TabRenderers.sortTable('benchmark', 'channel_name')">Canal<span class="arrow"></span></th>
                  <th class="th sortable" onclick="TabRenderers.sortTable('benchmark', 'tag')">Grupo<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('benchmark', 'subscriber_count')">Inscritos<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('benchmark', 'total_videos')">Vídeos<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('benchmark', 'total_views')">Total Views<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('benchmark', 'engagement_rate')">Engaj.%<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('benchmark', 'views_per_video')">Views/Vídeo<span class="arrow"></span></th>
                </tr>
              </thead>
              <tbody>
                ${channels.map(channel => `
                  <tr class="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70">
                    <td class="td truncate-cell">${channel.channel_name}</td>
                    <td class="td"><span class="chip bg-zinc-100 dark:bg-zinc-900">${channel.tag || 'sem_tag'}</span></td>
                    <td class="td text-right">${Utils.formatCompact(channel.subscriber_count || 0)}</td>
                    <td class="td text-right">${Utils.formatCompact(channel.total_videos || 0)}</td>
                    <td class="td text-right">${Utils.formatCompact(channel.total_views || 0)}</td>
                    <td class="td text-right">${Utils.formatPercentage(channel.engagement_rate || 0, 2)}</td>
                    <td class="td text-right">${Utils.formatCompact(channel.views_per_video || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('tabContent').innerHTML = html;
  }

  // Renderiza seção de palavras-chave
  renderKeywords() {
    const keywordData = (window.AppDataStore || window.DataStore).getKeywordAnalysis();
    const keywords = keywordData?.keywords || [];
    
    const metrics = {
      totalKeywords: keywords.length,
      totalMatches: keywords.reduce((sum, k) => sum + (k.total_matches || 0), 0),
      totalViews: keywords.reduce((sum, k) => sum + (k.total_views || 0), 0),
      avgViewsPerMatch: keywords.length > 0 ? 
        keywords.reduce((sum, k) => sum + (k.total_views || 0), 0) / Math.max(1, keywords.reduce((sum, k) => sum + (k.total_matches || 0), 0)) : 0
    };

    const html = `
      <div class="space-y-6">
        <!-- Métricas -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ${Utils.formatNumber(metrics.totalKeywords)}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Total Keywords</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              ${Utils.formatCompact(metrics.totalMatches)}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Matches</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${Utils.formatCompact(metrics.totalViews)}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Total Views</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${Utils.formatCompact(metrics.avgViewsPerMatch)}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Média Views/Match</div>
          </div>
        </div>

        <!-- Adicionar keyword -->
        <div class="card p-4">
          <h3 class="font-semibold mb-3">Adicionar Palavra-chave</h3>
          <div class="keyword-form">
            <input id="newKeyword" placeholder="Digite uma palavra-chave..." class="keyword-input">
            <button onclick="Features.addKeyword(document.getElementById('newKeyword').value)" class="btn">
              Adicionar
            </button>
          </div>
        </div>

        <!-- Tabela de keywords -->
        <div class="card p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Palavras-chave</h3>
            <button onclick="TabRenderers.downloadCSV('keywords')" class="btn-ghost text-xs">📥 Exportar CSV</button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-xs">
                  <th class="th sortable" onclick="TabRenderers.sortTable('keywords', 'keyword')">Palavra-chave<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('keywords', 'total_matches')">Matches<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('keywords', 'total_views')">Total Views<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('keywords', 'avg_views_per_match')">Média Views/Match<span class="arrow"></span></th>
                  <th class="th sortable text-right" onclick="TabRenderers.sortTable('keywords', 'last_search')">Última Busca<span class="arrow"></span></th>
                </tr>
              </thead>
              <tbody>
                ${keywords.map(keyword => `
                  <tr class="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70">
                    <td class="td">${keyword.keyword}</td>
                    <td class="td text-right">${Utils.formatCompact(keyword.total_matches || 0)}</td>
                    <td class="td text-right">${Utils.formatCompact(keyword.total_views || 0)}</td>
                    <td class="td text-right">${Utils.formatCompact(keyword.avg_views_per_match || 0)}</td>
                    <td class="td text-right">${Utils.formatDate(keyword.last_search)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('tabContent').innerHTML = html;
  }
}

// Cria instância global
console.log('🔧 === CRIANDO INSTÂNCIA FEATURES ===');
const featuresInstance = new Features();
console.log('🔧 Features instância criada:', typeof featuresInstance);
console.log('🔧 Features.renderBenchmark método:', typeof featuresInstance.renderBenchmark);

// Exporta para uso global
window.Features = {
  addKeyword: (keyword) => featuresInstance.addKeyword(keyword),
  loadKeywords: () => featuresInstance.loadKeywords(),
  compareChannels: (channel1, channel2) => featuresInstance.compareChannels(channel1, channel2),
  compareGroups: (group1, group2) => featuresInstance.compareGroups(group1, group2),
  clearComparison: () => featuresInstance.clearComparison(),
  renderBenchmark: () => featuresInstance.renderBenchmark(),
  renderKeywords: () => featuresInstance.renderKeywords()
};

console.log('🔧 window.Features exportado:', typeof window.Features);
console.log('🔧 window.Features.renderBenchmark:', typeof window.Features.renderBenchmark);
console.log('✅ Features configurado com sucesso!');
