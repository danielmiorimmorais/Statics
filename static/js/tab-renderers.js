/**
 * Renderizadores de abas otimizados
 * Gerencia a renderização de todas as abas do dashboard
 */

class TabRenderers {
  constructor() {
    this.charts = {};
    this.currentFilters = {};
    this.searchTerms = {};
  }

  // Configurações das abas
  static getTabConfig() {
    return [
      { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
      { id: 'ranking24h', label: '🏆 Ranking (24h)', icon: '🏆' },
      { id: 'videos24h', label: '🎞️ Vídeos (24h)', icon: '🎞️' },
      { id: 'viral', label: '🚀 Viral', icon: '🚀' },
      { id: 'top', label: '⭐ Top Histórico', icon: '⭐' },
      { id: 'benchmark', label: '📈 Benchmark', icon: '📈' },
      { id: 'predictions', label: '🔮 Predições', icon: '🔮' },
      { id: 'periods', label: '📅 Períodos', icon: '📅' },
      { id: 'keywords', label: '🔍 Keywords', icon: '🔍' },
      { id: 'admin', label: '⚙️ Administração', icon: '⚙️' }
    ];
  }

  // Configurações das tabelas
  static getTableConfig() {
    return {
      ranking24h: {
        data: () => (window.AppDataStore || window.DataStore).getCurrent(),
        columns: [
          { key: 'channel_name', label: 'Canal', formatter: (v) => v, class: 'truncate-cell', sortable: true },
          { key: 'tag', label: 'Grupo', formatter: (v) => `<span class="chip bg-zinc-100 dark:bg-zinc-900">${v || 'sem_tag'}</span>`, class: '', sortable: true },
          { key: 'subscriber_count', label: 'Inscritos', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'videos_24h', label: 'Vídeos 24h', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'views_24h', label: 'Views 24h', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'likes_24h', label: 'Likes 24h', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'comments_24h', label: 'Coment. 24h', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { 
            key: 'engagement', 
            label: 'Engaj.%', 
            formatter: (v, row) => {
              const engagement = ((row.likes_24h || 0) + (row.comments_24h || 0)) / Math.max(1, row.views_24h || 0) * 100;
              return Utils.formatPercentage(engagement, 2);
            }, 
            class: 'text-right', 
            sortable: true 
          }
        ],
        defaultSort: { key: 'views_24h', dir: 'desc' },
        filters: ['tag'],
        search: ['channel_name']
      },

      videos24h: {
        data: () => (window.AppDataStore || window.DataStore).getVideos24(),
        columns: [
          { 
            key: 'thumb', 
            label: '', 
            formatter: (v, row) => `<img src="${Utils.getThumbnailUrl(row.video_id)}" class="rounded-xl w-48 h-28 object-cover">`, 
            class: '', 
            sortable: false 
          },
          { 
            key: 'title', 
            label: 'Título', 
            formatter: (v, row) => `<a href="https://youtube.com/watch?v=${row.video_id}" target="_blank" class="hover:underline">${v}</a>`, 
            class: 'truncate-cell', 
            sortable: true 
          },
          { key: 'channel_name', label: 'Canal', formatter: (v) => v, class: 'truncate-cell', sortable: true },
          { key: 'tag', label: 'Grupo', formatter: (v) => `<span class="chip bg-zinc-100 dark:bg-zinc-900">${v || 'sem_tag'}</span>`, class: '', sortable: true },
          { key: 'views', label: 'Views', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'likes', label: 'Likes', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'comments', label: 'Coment.', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'views_per_hour', label: 'Views/h', formatter: (v) => v.toFixed(1), class: 'text-right', sortable: true },
          { key: 'avg_views_per_video', label: 'Média do canal', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'published_at', label: 'Publicado em', formatter: (v) => Utils.formatDate(v), class: 'text-right', sortable: true }
        ],
        defaultSort: { key: 'views_per_hour', dir: 'desc' },
        filters: ['tag'],
        search: ['title', 'channel_name']
      },

      viral: {
        data: () => (window.AppDataStore || window.DataStore).getRankings()?.viral_videos || [],
        columns: [
          { 
            key: 'thumb', 
            label: '', 
            formatter: (v, row) => `<img src="${Utils.getThumbnailUrl(row.video_id)}" class="rounded-xl w-36 h-20 object-cover">`, 
            class: '', 
            sortable: false 
          },
          { 
            key: 'title', 
            label: 'Título', 
            formatter: (v, row) => `<a href="https://youtube.com/watch?v=${row.video_id}" target="_blank" class="hover:underline">${v}</a>`, 
            class: 'truncate-cell', 
            sortable: true 
          },
          { key: 'channel_name', label: 'Canal', formatter: (v) => v, class: 'truncate-cell', sortable: true },
          { key: 'tag', label: 'Grupo', formatter: (v) => `<span class="chip bg-zinc-100 dark:bg-zinc-900">${v || 'sem_tag'}</span>`, class: '', sortable: true },
          { key: 'views', label: 'Views', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'views_per_hour', label: 'Views/h', formatter: (v) => v.toFixed(1), class: 'text-right', sortable: true },
          { key: 'published_at', label: 'Publicado', formatter: (v) => Utils.formatDate(v), class: 'text-right', sortable: true },
          { 
            key: 'hours_since', 
            label: 'H desde publicação', 
            formatter: (v, row) => Utils.hoursSince(row.published_at) + 'h', 
            class: 'text-right', 
            sortable: true 
          }
        ],
        defaultSort: { key: 'views_per_hour', dir: 'desc' },
        filters: ['tag'],
        search: ['title', 'channel_name']
      },

      top: {
        data: () => (window.AppDataStore || window.DataStore).getRankings()?.top_channels || [],
        columns: [
          { key: 'channel_name', label: 'Canal', formatter: (v) => v, class: 'truncate-cell', sortable: true },
          { key: 'tag', label: 'Grupo', formatter: (v) => `<span class="chip bg-zinc-100 dark:bg-zinc-900">${v || 'sem_tag'}</span>`, class: '', sortable: true },
          { key: 'subscriber_count', label: 'Inscritos', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'total_videos', label: 'Total vídeos', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'total_views', label: 'Total views', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { 
            key: 'engagement_rate', 
            label: 'Engaj.%', 
            formatter: (v) => Utils.formatPercentage(v, 2), 
            class: 'text-right', 
            sortable: true 
          }
        ],
        defaultSort: { key: 'total_views', dir: 'desc' },
        filters: ['tag'],
        search: ['channel_name']
      },

      benchmark: {
        data: () => (window.AppDataStore || window.DataStore).getBenchmarkData()?.channels || [],
        columns: [
          { key: 'channel_name', label: 'Canal', formatter: (v) => v, class: 'truncate-cell', sortable: true },
          { key: 'tag', label: 'Grupo', formatter: (v) => `<span class="chip bg-zinc-100 dark:bg-zinc-900">${v || 'sem_tag'}</span>`, class: '', sortable: true },
          { key: 'subscriber_count', label: 'Inscritos', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'total_videos', label: 'Vídeos', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'total_views', label: 'Total views', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'engagement_rate', label: 'Engaj.%', formatter: (v) => Utils.formatPercentage(v, 2), class: 'text-right', sortable: true },
          { key: 'views_per_video', label: 'Views/Vídeo', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true }
        ],
        defaultSort: { key: 'total_views', dir: 'desc' },
        filters: ['tag'],
        search: ['channel_name']
      },

      predictions: {
        data: () => (window.AppDataStore || window.DataStore).getPerformancePredictions()?.predictions || [],
        columns: [
          { key: 'channel_name', label: 'Canal', formatter: (v) => v, class: 'truncate-cell', sortable: true },
          { key: 'tag', label: 'Grupo', formatter: (v) => `<span class="chip bg-zinc-100 dark:bg-zinc-900">${v || 'sem_tag'}</span>`, class: '', sortable: true },
          { key: 'daily_avg', label: 'Média diária', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'historical_avg', label: 'Média histórica', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'performance_ratio', label: 'Razão', formatter: (v) => v.toFixed(2) + 'x', class: 'text-right', sortable: true },
          { 
            key: 'category', 
            label: 'Categoria', 
            formatter: (v) => {
              const colors = {
                'excellent': 'badge-success',
                'good': 'badge-warning', 
                'poor': 'badge-danger'
              };
              return `<span class="badge ${colors[v] || 'badge-warning'}">${v}</span>`;
            }, 
            class: 'text-center', 
            sortable: true 
          },
          { key: 'confidence_score', label: 'Confiança', formatter: (v) => Utils.formatPercentage(v, 1), class: 'text-right', sortable: true },
          { key: 'videos_24h', label: 'Vídeos 24h', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true }
        ],
        defaultSort: { key: 'performance_ratio', dir: 'desc' },
        filters: ['tag', 'category'],
        search: ['channel_name']
      },

      periods: {
        data: () => (window.AppDataStore || window.DataStore).getPeriodComparisons()?.channels || [],
        columns: [
          { key: 'channel_name', label: 'Canal', formatter: (v) => v, class: 'truncate-cell', sortable: true },
          { key: 'tag', label: 'Grupo', formatter: (v) => `<span class="chip bg-zinc-100 dark:bg-zinc-900">${v || 'sem_tag'}</span>`, class: '', sortable: true },
          { key: 'views_7d', label: 'Views 7d', formatter: (v) => Utils.formatCompact(v?.avg_views || 0), class: 'text-right', sortable: true },
          { key: 'views_30d', label: 'Views 30d', formatter: (v) => Utils.formatCompact(v?.avg_views || 0), class: 'text-right', sortable: true },
          { 
            key: 'views_change', 
            label: 'Variação views', 
            formatter: (v) => {
              const color = v > 0 ? 'text-green-600' : v < 0 ? 'text-red-600' : 'text-zinc-600';
              const sign = v > 0 ? '+' : '';
              return `<span class="${color}">${sign}${Utils.formatPercentage(v, 1)}</span>`;
            }, 
            class: 'text-right', 
            sortable: true 
          },
          { key: 'engagement_7d', label: 'Engaj. 7d', formatter: (v) => Utils.formatPercentage(v, 2), class: 'text-right', sortable: true },
          { key: 'engagement_30d', label: 'Engaj. 30d', formatter: (v) => Utils.formatPercentage(v, 2), class: 'text-right', sortable: true },
          { 
            key: 'engagement_change', 
            label: 'Variação engaj.', 
            formatter: (v) => {
              const color = v > 0 ? 'text-green-600' : v < 0 ? 'text-red-600' : 'text-zinc-600';
              const sign = v > 0 ? '+' : '';
              return `<span class="${color}">${sign}${Utils.formatPercentage(v, 1)}</span>`;
            }, 
            class: 'text-right', 
            sortable: true 
          }
        ],
        defaultSort: { key: 'views_change', dir: 'desc' },
        filters: ['tag'],
        search: ['channel_name']
      },

      keywords: {
        data: () => (window.AppDataStore || window.DataStore).getKeywordAnalysis()?.keywords || [],
        columns: [
          { key: 'keyword', label: 'Palavra-chave', formatter: (v) => v, class: '', sortable: true },
          { key: 'total_matches', label: 'Matches', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'total_views', label: 'Total views', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'avg_views_per_match', label: 'Média views/match', formatter: (v) => Utils.formatCompact(v), class: 'text-right', sortable: true },
          { key: 'last_search', label: 'Última busca', formatter: (v) => Utils.formatDate(v), class: 'text-right', sortable: true }
        ],
        defaultSort: { key: 'total_views', dir: 'desc' },
        filters: [],
        search: ['keyword']
      }
    };
  }

  // Renderiza dashboard
  renderDashboard() {
    const dataStore = window.AppDataStore || window.DataStore;
    const current = dataStore.getCurrent();
    const tags24 = dataStore.getTags24();
    const history = dataStore.getHistory();
    
    const totals = tags24?.totals_24h || {};
    const kpis = [
      { label: 'Canais', value: current.length, icon: '📺' },
      { label: 'Tags', value: new Set(current.map(c => c.tag)).size, icon: '🏷️' },
      { label: 'Vídeos 24h', value: totals.videos || 0, icon: '🎞️' },
      { label: 'Views 24h', value: totals.views || 0, icon: '👁️' },
      { label: 'Likes 24h', value: totals.likes || 0, icon: '👍' },
      { label: 'Comentários 24h', value: totals.comments || 0, icon: '💬' }
    ];

    const html = `
      <div class="space-y-6">
        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          ${kpis.map(kpi => `
            <div class="card p-4 text-center">
              <div class="text-2xl mb-2">${kpi.icon}</div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">${kpi.label}</p>
              <p class="mt-1 text-2xl font-bold">${Utils.formatCompact(kpi.value)}</p>
            </div>
          `).join('')}
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card p-4">
            <h3 class="font-semibold mb-4">Participação por Grupo</h3>
            <canvas id="share-chart" height="120"></canvas>
          </div>
          <div class="card p-4">
            <h3 class="font-semibold mb-4">Tendência por Grupo</h3>
            <canvas id="trend-chart" height="120"></canvas>
          </div>
        </div>

        <!-- Tendência por Canal -->
        <div class="card p-4">
          <h3 class="font-semibold mb-4">Tendência por Canal</h3>
          <div class="flex gap-4 mb-4">
            <select id="channel-selector" class="filter-select">
              <option value="">Selecione um canal...</option>
              ${current.map(c => `<option value="${c.channel_id}">${c.channel_name}</option>`).join('')}
            </select>
            <select id="metric-selector" class="filter-select">
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="comments">Comentários</option>
              <option value="videos">Vídeos</option>
            </select>
            <select id="window-selector" class="filter-select">
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
            </select>
          </div>
          <canvas id="channel-trend-chart" height="120"></canvas>
        </div>
      </div>
    `;

    document.getElementById('tabContent').innerHTML = html;
    this.initDashboardCharts();
  }

  // Inicializa gráficos do dashboard
  initDashboardCharts() {
    this.renderShareChart();
    this.renderTrendChart();
    this.initChannelTrendChart();
  }

  // Renderiza gráfico de participação
  renderShareChart() {
    const ctx = document.getElementById('share-chart')?.getContext('2d');
    if (!ctx) return;

    const dataStore = window.AppDataStore || window.DataStore;
    const tags24 = dataStore.getTags24();
    const byTag = tags24?.by_tag || [];
    
    if (byTag.length === 0) {
      // Fallback: agrega por tag a partir de current.json
      const current = dataStore.getCurrent();
      const tagStats = {};
      
      current.forEach(channel => {
        const tag = channel.tag || 'sem_tag';
        if (!tagStats[tag]) {
          tagStats[tag] = { views: 0, videos: 0, likes: 0, comments: 0 };
        }
        tagStats[tag].views += channel.views_24h || 0;
        tagStats[tag].videos += channel.videos_24h || 0;
        tagStats[tag].likes += channel.likes_24h || 0;
        tagStats[tag].comments += channel.comments_24h || 0;
      });

      byTag = Object.entries(tagStats).map(([tag, stats]) => ({
        tag,
        views: stats.views,
        videos: stats.videos,
        likes: stats.likes,
        comments: stats.comments
      }));
    }

    const labels = byTag.map(t => t.tag);
    const data = byTag.map(t => t.views || 0);

    if (this.charts.share) this.charts.share.destroy();
    
    this.charts.share = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    });
  }

  // Renderiza gráfico de tendência
  renderTrendChart() {
    const ctx = document.getElementById('trend-chart')?.getContext('2d');
    if (!ctx) return;

    const dataStore = window.AppDataStore || window.DataStore;
    const history = dataStore.getHistory();
    if (!history || history.length === 0) return;

    const dates = [...new Set(history.map(h => h.date))].sort().slice(-7);
    const tags = [...new Set(history.map(h => h.tag))];

    const datasets = tags.map((tag, index) => ({
      label: tag,
      data: dates.map(d => {
        const item = history.find(h => h.date === d && h.tag === tag);
        return item?.views || 0;
      }),
      borderColor: [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
      ][index % 10],
      backgroundColor: 'transparent',
      tension: 0.2
    }));

    if (this.charts.trend) this.charts.trend.destroy();
    
    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCompact(value);
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  // Inicializa gráfico de tendência por canal
  initChannelTrendChart() {
    const ctx = document.getElementById('channel-trend-chart')?.getContext('2d');
    if (!ctx) return;

    const channelSelector = document.getElementById('channel-selector');
    const metricSelector = document.getElementById('metric-selector');
    const windowSelector = document.getElementById('window-selector');

    const updateChart = () => {
      const channelId = channelSelector.value;
      const metric = metricSelector.value;
      const window = windowSelector.value;

      if (!channelId) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
      }

      this.renderChannelTrendChart(channelId, metric, window);
    };

    channelSelector.addEventListener('change', updateChart);
    metricSelector.addEventListener('change', updateChart);
    windowSelector.addEventListener('change', updateChart);
  }

  // Renderiza gráfico de tendência por canal
  renderChannelTrendChart(channelId, metric, window) {
    const ctx = document.getElementById('channel-trend-chart')?.getContext('2d');
    if (!ctx) return;

    const dataStore = window.AppDataStore || window.DataStore;
    const data = window === '7d' ? dataStore.getTrendByChannel7() : dataStore.getTrendByChannel30();
    const channelData = data.find(d => d.channel_id === channelId);

    if (!channelData) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      return;
    }

    const dates = channelData.data.map(d => d.date);
    const values = channelData.data.map(d => d[metric] || 0);

    if (this.charts.channelTrend) this.charts.channelTrend.destroy();
    
    this.charts.channelTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: metric.charAt(0).toUpperCase() + metric.slice(1),
          data: values,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCompact(value);
              }
            }
          }
        }
      }
    });
  }

  // Renderiza tabela genérica
  renderTable(tabId) {
    const config = TabRenderers.getTableConfig()[tabId];
    if (!config) return;

    const data = config.data();
    const filteredData = this.filterData(data, tabId);
    const sortedData = this.sortData(filteredData, tabId);

    const html = `
      <div class="space-y-4">
        <!-- Filtros e busca -->
        ${this.renderFilterBar(tabId, config)}
        
        <!-- Tabela -->
        <div class="card p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">${TabRenderers.getTabConfig().find(t => t.id === tabId)?.label}</h3>
            <button onclick="TabRenderers.downloadCSV('${tabId}')" class="btn-ghost text-xs">
              📥 Exportar CSV
            </button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm" role="table" aria-label="${TabRenderers.getTabConfig().find(t => t.id === tabId)?.label}">
              <thead>
                <tr class="text-xs">
                  ${config.columns.map(col => `
                    <th class="th ${col.sortable ? 'sortable' : ''} ${col.class || ''}" 
                        ${col.sortable ? `onclick="TabRenderers.sortTable('${tabId}', '${col.key}')"` : ''}
                        ${col.sortable ? 'role="button" tabindex="0"' : ''}
                        aria-sort="${this.getSortDirection(tabId, col.key)}">
                      ${col.label}
                      ${col.sortable ? '<span class="arrow"></span>' : ''}
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${sortedData.map((row, index) => `
                  <tr class="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70" 
                      ${tabId === 'ranking24h' ? `onclick="TabRenderers.showChannelModal(${JSON.stringify(row).replace(/"/g, '&quot;')})"` : ''}
                      role="row">
                    ${config.columns.map(col => `
                      <td class="td ${col.class || ''}">${col.formatter(row[col.key], row)}</td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            ${sortedData.length} registros encontrados
          </div>
        </div>
      </div>
    `;

    document.getElementById('tabContent').innerHTML = html;
  }

  // Renderiza barra de filtros
  renderFilterBar(tabId, config) {
    if (!config.filters && !config.search) return '';

    const currentFilters = this.currentFilters[tabId] || {};
    const searchTerm = this.searchTerms[tabId] || '';

    const data = config.data();
    const availableTags = [...new Set(data.map(d => d.tag).filter(Boolean))];
    const availableCategories = config.columns.find(col => col.key === 'category') ? 
      [...new Set(data.map(d => d.category).filter(Boolean))] : [];

    return `
      <div class="filter-bar">
        ${config.filters.includes('tag') ? `
          <select class="filter-select" onchange="TabRenderers.setFilter('${tabId}', 'tag', this.value)">
            <option value="">Todos os grupos</option>
            ${availableTags.map(tag => `
              <option value="${tag}" ${currentFilters.tag === tag ? 'selected' : ''}>${tag}</option>
            `).join('')}
          </select>
        ` : ''}
        
        ${config.filters.includes('category') ? `
          <select class="filter-select" onchange="TabRenderers.setFilter('${tabId}', 'category', this.value)">
            <option value="">Todas as categorias</option>
            ${availableCategories.map(cat => `
              <option value="${cat}" ${currentFilters.category === cat ? 'selected' : ''}>${cat}</option>
            `).join('')}
          </select>
        ` : ''}
        
        ${config.search.length > 0 ? `
          <input type="text" 
                 class="search-input" 
                 placeholder="Buscar ${config.search.join(', ')}..." 
                 value="${searchTerm}"
                 oninput="TabRenderers.setSearch('${tabId}', this.value)">
        ` : ''}
      </div>
    `;
  }

  // Filtra dados
  filterData(data, tabId) {
    const filters = this.currentFilters[tabId] || {};
    const searchTerm = this.searchTerms[tabId] || '';

    let filtered = data;

    // Aplica filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => item[key] === value);
      }
    });

    // Aplica busca
    if (searchTerm) {
      const config = TabRenderers.getTableConfig()[tabId];
      const searchFields = config.search || [];
      
      filtered = filtered.filter(item => 
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    return filtered;
  }

  // Ordena dados
  sortData(data, tabId) {
    const sortState = AppState.sortStates[tabId] || TabRenderers.getTableConfig()[tabId].defaultSort;
    const { key, dir } = sortState;

    return [...data].sort((a, b) => {
      let va = a[key];
      let vb = b[key];

      // Tratamento especial para campos calculados
      if (key === 'engagement') {
        va = ((a.likes_24h || 0) + (a.comments_24h || 0)) / Math.max(1, a.views_24h || 0) * 100;
        vb = ((b.likes_24h || 0) + (b.comments_24h || 0)) / Math.max(1, b.views_24h || 0) * 100;
      }

      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();

      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Define filtro
  setFilter(tabId, key, value) {
    if (!this.currentFilters[tabId]) this.currentFilters[tabId] = {};
    this.currentFilters[tabId][key] = value || null;
    this.renderTable(tabId);
  }

  // Define termo de busca
  setSearch(tabId, value) {
    this.searchTerms[tabId] = value;
    this.renderTable(tabId);
  }

  // Ordena tabela
  sortTable(tabId, key) {
    const sortState = AppState.sortStates[tabId] || TabRenderers.getTableConfig()[tabId].defaultSort;
    
    if (sortState.key === key) {
      sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
    } else {
      sortState.key = key;
      sortState.dir = 'asc';
    }
    
    AppState.sortStates[tabId] = sortState;
    this.renderTable(tabId);
  }

  // Obtém direção de ordenação
  getSortDirection(tabId, key) {
    const sortState = AppState.sortStates[tabId];
    if (!sortState || sortState.key !== key) return 'none';
    return sortState.dir === 'asc' ? 'ascending' : 'descending';
  }

  // Mostra modal de canal
  showChannelModal(channel) {
    const html = `
      <div class="channel-modal">
        <h2 class="text-xl font-bold mb-4">${channel.channel_name}</h2>
        
        <div class="channel-stats">
          <div class="stat-card">
            <div class="stat-value">${Utils.formatCompact(channel.subscriber_count || 0)}</div>
            <div class="stat-label">Inscritos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Utils.formatCompact(channel.videos_24h || 0)}</div>
            <div class="stat-label">Vídeos 24h</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Utils.formatCompact(channel.views_24h || 0)}</div>
            <div class="stat-label">Views 24h</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Utils.formatCompact(channel.likes_24h || 0)}</div>
            <div class="stat-label">Likes 24h</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <strong>Grupo:</strong> ${channel.tag || 'sem_tag'}
          </div>
          <div>
            <strong>Engajamento:</strong> ${Utils.formatPercentage(((channel.likes_24h || 0) + (channel.comments_24h || 0)) / Math.max(1, channel.views_24h || 0) * 100, 2)}
          </div>
        </div>
        
        ${channel.total_views != null ? `
          <div class="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
            <strong>Histórico:</strong><br>
            ${Utils.formatCompact(channel.total_videos || 0)} vídeos · 
            ${Utils.formatCompact(channel.total_views || 0)} views · 
            ${Utils.formatCompact(channel.total_likes || 0)} likes · 
            ${Utils.formatCompact(channel.total_comments || 0)} comentários
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal').classList.add('flex');
  }

  // Download CSV
  downloadCSV(tabId) {
    const config = TabRenderers.getTableConfig()[tabId];
    if (!config) return;

    const data = config.data();
    const filteredData = this.filterData(data, tabId);
    
    const headers = config.columns.filter(col => col.key !== 'thumb').map(col => col.label);
    const rows = filteredData.map(row => 
      config.columns.filter(col => col.key !== 'thumb').map(col => {
        const value = col.formatter(row[col.key], row);
        // Remove HTML tags para CSV
        return value.replace(/<[^>]*>/g, '');
      })
    );

    const csv = [headers, ...rows].map(r => 
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${tabId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  // Método estático para download CSV (para uso global)
  static downloadCSV(tabId) {
    // Cria instância temporária para usar o método de instância
    const instance = new TabRenderers();
    instance.downloadCSV(tabId);
  }
}

// Cria instância global
console.log('🔧 === CRIANDO INSTÂNCIA TABRENDERERS ===');
const tabRenderersInstance = new TabRenderers();
console.log('🔧 TabRenderers instância criada:', typeof tabRenderersInstance);
console.log('🔧 TabRenderers.renderDashboard método:', typeof tabRenderersInstance.renderDashboard);

// Exporta para uso global
window.TabRenderers = {
  // Métodos estáticos da classe
  getTabConfig: TabRenderers.getTabConfig,
  getTableConfig: TabRenderers.getTableConfig,
  
  // Métodos de instância
  renderDashboard: () => tabRenderersInstance.renderDashboard(),
  renderTable: (tabId) => tabRenderersInstance.renderTable(tabId),
  setFilter: (tabId, key, value) => tabRenderersInstance.setFilter(tabId, key, value),
  setSearch: (tabId, value) => tabRenderersInstance.setSearch(tabId, value),
  sortTable: (tabId, key) => tabRenderersInstance.sortTable(tabId, key),
  showChannelModal: (channel) => tabRenderersInstance.showChannelModal(channel),
  downloadCSV: (tabId) => tabRenderersInstance.downloadCSV(tabId)
};

console.log('🔧 window.TabRenderers exportado:', typeof window.TabRenderers);
console.log('🔧 window.TabRenderers.renderDashboard:', typeof window.TabRenderers.renderDashboard);
console.log('✅ TabRenderers configurado com sucesso!');
