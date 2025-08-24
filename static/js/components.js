/**
 * Components - Renderizadores de componentes da interface
 * Contém todas as funções de renderização dos diferentes painéis
 */

const Components = {
  // Estado da paginação
  currentVideoPage: 1,
  
  // Estado de ordenação
  sortState: {
    ranking: { key: 'views_24h', dir: 'desc' },
    videos24: { key: 'views_per_hour', dir: 'desc' },
    viral: { key: 'views_per_hour', dir: 'desc' },
    top: { key: 'total_views', dir: 'desc' },
    benchmark: { key: 'total_views', dir: 'desc' },
    predictions: { key: 'performance_ratio', dir: 'desc' },
    periods: { key: 'views_change', dir: 'desc' },
    keywords: { key: 'total_views', dir: 'desc' }
  },

  // Sistema de gerenciamento de event listeners para prevenir memory leaks
  eventListeners: new Map(),

  // Adiciona event listener com controle de memória
  addEventListener(element, event, handler, options = {}) {
    if (!element) return;
    
    const key = `${element.id || 'unknown'}_${event}`;
    
    // Remove listener anterior se existir
    if (this.eventListeners.has(key)) {
      const { element: oldElement, event: oldEvent, handler: oldHandler } = this.eventListeners.get(key);
      oldElement.removeEventListener(oldEvent, oldHandler);
    }
    
    // Adiciona novo listener
    element.addEventListener(event, handler, options);
    
    // Armazena referência para limpeza posterior
    this.eventListeners.set(key, { element, event, handler });
  },

  // Remove todos os event listeners registrados
  clearEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners.clear();
  },

  // Utilitários de ordenação
  getVal(table, key, row) {
    if (table === 'ranking' && key === 'engagement') {
      return Number(((row.likes_24h || 0) + (row.comments_24h || 0)) / Math.max(1, (row.views_24h || 0)) * 100);
    }
    if (table === 'predictions') {
      if (key === 'performance_ratio') return Number(row.performance_ratio || 0);
      if (key === 'confidence_score') return Number(row.confidence_score || 0);
      if (key === 'daily_avg_views') return Number(row.daily_avg_views || 0);
      if (key === 'historical_avg_views') return Number(row.historical_avg_views || 0);
      if (key === 'performance_category') return String(row.performance_category || '').toLowerCase();
    }
    if (table === 'periods') {
      if (key === 'views_7d') return Number(row['7d']?.avg_views || 0);
      if (key === 'views_30d') return Number(row['30d']?.avg_views || 0);
      if (key === 'views_change') return Number(row.changes?.views_change || 0);
      if (key === 'engagement_7d') return Number(row['7d']?.engagement_rate || 0);
      if (key === 'engagement_30d') return Number(row['30d']?.engagement_rate || 0);
      if (key === 'engagement_change') return Number(row.changes?.engagement_change || 0);
    }
    if (table === 'top') {
      if (key === 'channel_name') return String(row.channel_name || '').toLowerCase();
      if (key === 'tag') return String(row.tag || '').toLowerCase();
      if (key === 'subscriber_count') return Number(row.subscriber_count || 0);
      if (key === 'total_videos') return Number(row.total_videos || 0);
      if (key === 'total_views') return Number(row.total_views || 0);
      if (key === 'engagement') return Number(row.engagement || 0);
    }
    if (key === 'published_at') return Date.parse(row.published_at || 0) || 0;
    
    const v = row[key];
    if (typeof v === 'number') return v;
    if (v == null) return 0;
    if (!isNaN(Number(v))) return Number(v);
    return String(v).toLowerCase();
  },

  cmp(a, b, dir) {
    const isStr = (x) => typeof x === 'string';
    const r = (isStr(a) || isStr(b)) ? String(a).localeCompare(String(b)) : ((a || 0) - (b || 0));
    return dir === 'asc' ? r : -r;
  },

  updateSortIndicators(table) {
    const st = this.sortState[table];
    if (!st) return;
    
    // Novo sistema
    Utils.qsa(`th.sort-header[data-type="${table}"]`).forEach(th => {
      const indicator = th.querySelector('.sort-indicator');
      if (indicator) {
        if (th.dataset.key === st.key) {
          indicator.textContent = st.dir === 'asc' ? '↑' : '↓';
          indicator.className = 'sort-indicator text-blue-600';
        } else {
          indicator.textContent = '';
          indicator.className = 'sort-indicator';
        }
      }
    });
    
    // Sistema antigo (compatibilidade)
    Utils.qsa(`th.sortable[data-table="${table}"]`).forEach(th => {
      const v = (th.dataset.key === st.key) ? (st.dir === 'asc' ? 'ascending' : 'descending') : 'none';
      th.setAttribute('aria-sort', v);
    });
  },

  // Renderização do header
  renderHeader() {
    console.log('🎨 [HEADER] Iniciando renderização do header...');
    
    const m = DataStore.metadata || {};
    const gen = m.generated_at || m.last_update;
    
    console.log('🎨 [HEADER] Metadata:', { 
      hasMetadata: !!m, 
      generatedAt: gen,
      metadataKeys: Object.keys(m)
    });
    
    const lastUpdateEl = Utils.qs('#lastUpdate');
    if (lastUpdateEl) {
      lastUpdateEl.textContent = gen ? ('Atualizado em ' + Utils.formatDate(gen)) : '—';
      console.log('✅ [HEADER] Elemento #lastUpdate atualizado');
    } else {
      console.warn('⚠️ [HEADER] Elemento #lastUpdate não encontrado');
    }

    const w = m.windows || {};
    const cur = w.current || {};
    const hist = w.history || {};
    
    console.log('🎨 [HEADER] Windows:', { 
      hasWindows: !!w, 
      current: cur, 
      history: hist 
    });
    
    function fmtW(x) {
      return (x.window_start && x.window_end) ? 
        (Utils.formatDate(x.window_start) + ' → ' + Utils.formatDate(x.window_end)) : '—';
    }
    
    const windowCurrentEl = Utils.qs('#windowCurrent');
    if (windowCurrentEl) {
      windowCurrentEl.textContent = fmtW(cur);
      console.log('✅ [HEADER] Elemento #windowCurrent atualizado');
    } else {
      console.warn('⚠️ [HEADER] Elemento #windowCurrent não encontrado');
    }
    
    const windowHistoryEl = Utils.qs('#windowHistory');
    if (windowHistoryEl) {
      windowHistoryEl.textContent = fmtW(hist);
      console.log('✅ [HEADER] Elemento #windowHistory atualizado');
    } else {
      console.warn('⚠️ [HEADER] Elemento #windowHistory não encontrado');
    }
    
    console.log('✅ [HEADER] Renderização do header concluída');
  },

  // Renderização dos KPIs
  renderKpis() {
    console.log('📊 [KPIS] Iniciando renderização dos KPIs...');
    
    const m = DataStore.metadata || {};
    const totChannels = (m?.totals?.channels) != null ? m.totals.channels : 
      (DataStore.channelsSummary.length || DataStore.current.length);
    const totTags = (m?.totals?.tags) != null ? m.totals.tags : DataStore.tagList.length;
    
    console.log('📊 [KPIS] Dados básicos:', { 
      totChannels, 
      totTags, 
      channelsSummaryLength: DataStore.channelsSummary.length,
      currentLength: DataStore.current.length,
      tagListLength: DataStore.tagList.length
    });
    
    const kpiChannelsEl = Utils.qs('#kpiChannels');
    if (kpiChannelsEl) {
      kpiChannelsEl.textContent = Utils.formatNumber(totChannels);
    }
    
    const kpiTagsEl = Utils.qs('#kpiTags');
    if (kpiTagsEl) {
      kpiTagsEl.textContent = Utils.formatNumber(totTags);
    }

    const totals = (DataStore.tags24?.totals_24h) || {};
    const byTagValues = Object.values(DataStore.byTag24 || {});
    const videos24 = totals.videos != null ? totals.videos : Utils.array.sum(byTagValues, 'videos');
    const views24 = totals.views != null ? totals.views : Utils.array.sum(byTagValues, 'views');
    const likes24 = totals.likes != null ? totals.likes : Utils.array.sum(byTagValues, 'likes');
    const com24 = totals.comments != null ? totals.comments : Utils.array.sum(byTagValues, 'comments');

    console.log('📊 [KPIS] Métricas 24h:', { 
      videos24, 
      views24, 
      likes24, 
      com24,
      totals24h: totals,
      byTagValuesLength: byTagValues.length
    });

    const kpiVideos24hEl = Utils.qs('#kpiVideos24h');
    if (kpiVideos24hEl) {
      kpiVideos24hEl.textContent = Utils.formatCompact(videos24);
    }
    
    const kpiViews24hEl = Utils.qs('#kpiViews24h');
    if (kpiViews24hEl) {
      kpiViews24hEl.textContent = Utils.formatCompact(views24);
    }
    
    const kpiLikes24hEl = Utils.qs('#kpiLikes24h');
    if (kpiLikes24hEl) {
      kpiLikes24hEl.textContent = Utils.formatCompact(likes24);
    }
    
    const kpiComments24hEl = Utils.qs('#kpiComments24h');
    if (kpiComments24hEl) {
      kpiComments24hEl.textContent = Utils.formatCompact(com24);
    }
    
    console.log('✅ [KPIS] KPIs renderizados com sucesso');
  },

  // Analisa as principais palavras dos títulos
  analyzeTopWords() {
    const videos = DataStore.videos24 || [];
    const wordCount = new Map();
    const wordViews = new Map();
    
    // Palavras para ignorar (stop words em português)
    const stopWords = new Set([
      'a', 'e', 'o', 'é', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
      'um', 'uma', 'uns', 'umas', 'para', 'por', 'com', 'se', 'que', 'não', 'mais', 'muito',
      'como', 'sobre', 'após', 'até', 'sem', 'seu', 'sua', 'seus', 'suas', 'ele', 'ela',
      'eles', 'elas', 'isso', 'isto', 'aqui', 'ali', 'lá', 'já', 'ainda', 'também', 'só',
      'só', 'mas', 'ou', 'quando', 'onde', 'porque', 'então', 'assim', 'bem', 'vai', 'vou',
      'ter', 'tem', 'foi', 'ser', 'são', 'está', 'estão', 'pelo', 'pela', 'pelos', 'pelas'
    ]);
    
    videos.forEach(video => {
      const title = (video.title || '').toLowerCase();
      const views = Number(video.views || 0);
      
      // Remove pontuação e divide em palavras
      const words = title
        .replace(/[^\w\sáéíóúàèìòùâêîôûãõçñ]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 3 && !stopWords.has(word));
      
      words.forEach(word => {
        const count = wordCount.get(word) || 0;
        const totalViews = wordViews.get(word) || 0;
        
        wordCount.set(word, count + 1);
        wordViews.set(word, totalViews + views);
      });
    });
    
    // Converte para array e ordena por views totais
    const wordAnalysis = Array.from(wordCount.entries()).map(([word, count]) => ({
      word,
      matches: count,
      totalViews: wordViews.get(word) || 0,
      avgViews: count > 0 ? (wordViews.get(word) || 0) / count : 0
    })).sort((a, b) => b.totalViews - a.totalViews);
    
    return wordAnalysis.slice(0, 50);
  },

  // Renderização do gráfico de participação
  renderShare() {
    console.log('📊 [SHARE] Iniciando renderização do gráfico de participação');
    const period = Utils.qs('#sharePeriodSelect')?.value || '24h';
    console.log('📊 [SHARE] Período selecionado:', period);
    let list, totalViews;
    
    if (period === '24h') {
      list = DataStore.tags24?.by_tag ? DataStore.tags24.by_tag.slice() : 
        Object.keys(DataStore.byTag24).map(tag => DataStore.byTag24[tag]);
      totalViews = (DataStore.tags24?.totals_24h?.views) != null ? 
        DataStore.tags24.totals_24h.views : (Utils.array.sum(list, 'views') || 1);
      console.log('📊 [SHARE] Dados 24h:', { listLength: list.length, totalViews, tags24: !!DataStore.tags24, byTag24Keys: Object.keys(DataStore.byTag24) });
    } else if (period === '7d') {
      // Usar dados reais de 7 dias se disponíveis
      if (DataStore.videos7d && DataStore.videos7d.length > 0) {
        // Agrupa dados de vídeos por tag para 7 dias
        const groupedData = {};
        DataStore.videos7d.forEach(video => {
          const tag = video.tag || 'Geral';
          if (!groupedData[tag]) {
            groupedData[tag] = { tag, views: 0, videos: 0 };
          }
          groupedData[tag].views += (video.views || 0);
          groupedData[tag].videos += 1;
        });
        
        list = Object.values(groupedData);
        totalViews = Utils.array.sum(list, 'views') || 1;
        console.log('📊 [SHARE] Dados 7d (reais):', { listLength: list.length, totalViews, groupedData });
      } else {
        // Fallback para simulação
        const groupedData = {};
        DataStore.current.forEach(channel => {
          const tag = channel.tag || 'Geral';
          if (!groupedData[tag]) {
            groupedData[tag] = { tag, views: 0, videos: 0 };
          }
          groupedData[tag].views += Math.round((channel.views_24h || 0) * 7 * 0.85);
          groupedData[tag].videos += Math.round((channel.videos_24h || 0) * 6.5);
        });
        
        list = Object.values(groupedData);
        totalViews = Utils.array.sum(list, 'views') || 1;
        console.log('📊 [SHARE] Dados 7d (simulados):', { listLength: list.length, totalViews, groupedData });
      }
    } else if (period === '30d') {
      // Usar dados reais de 30 dias se disponíveis
      if (DataStore.videos30d && DataStore.videos30d.length > 0) {
        // Agrupa dados de vídeos por tag para 30 dias
        const groupedData = {};
        DataStore.videos30d.forEach(video => {
          const tag = video.tag || 'Geral';
          if (!groupedData[tag]) {
            groupedData[tag] = { tag, views: 0, videos: 0 };
          }
          groupedData[tag].views += (video.views || 0);
          groupedData[tag].videos += 1;
        });
        
        list = Object.values(groupedData);
        totalViews = Utils.array.sum(list, 'views') || 1;
        console.log('📊 [SHARE] Dados 30d (reais):', { listLength: list.length, totalViews, groupedData });
      } else {
        // Fallback para simulação
        const groupedData = {};
        DataStore.current.forEach(channel => {
          const tag = channel.tag || 'Geral';
          if (!groupedData[tag]) {
            groupedData[tag] = { tag, views: 0, videos: 0 };
          }
          groupedData[tag].views += Math.round((channel.views_24h || 0) * 25 * 0.8);
          groupedData[tag].videos += Math.round((channel.videos_24h || 0) * 28);
        });
        
        list = Object.values(groupedData);
        totalViews = Utils.array.sum(list, 'views') || 1;
        console.log('📊 [SHARE] Dados 30d (simulados):', { listLength: list.length, totalViews, groupedData });
      }
    } else {
      // Fallback para 24h
      list = DataStore.tags24?.by_tag ? DataStore.tags24.by_tag.slice() : 
        Object.keys(DataStore.byTag24).map(tag => DataStore.byTag24[tag]);
      totalViews = (DataStore.tags24?.totals_24h?.views) != null ? 
        DataStore.tags24.totals_24h.views : (Utils.array.sum(list, 'views') || 1);
    }

    const labels = list.map(it => it.tag);
    const dataViews = list.map(it => it.views || 0);

    const canvas = Utils.qs('#share-chart');
    console.log('📊 [SHARE] Canvas encontrado:', !!canvas);
    if (!canvas) {
      console.warn('⚠️ [SHARE] Canvas #share-chart não encontrado - página pode não ter gráficos');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ [SHARE] Contexto 2D não disponível!');
      return;
    }
    
    console.log('📊 [SHARE] Preparando dados para Chart.js:', { labels: list.map(it => it.tag), dataLength: list.length });

    if (DataStore.charts.share) DataStore.charts.share.destroy();
    DataStore.charts.share = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: dataViews }] },
      options: {
        cutout: '60%',
        plugins: {
          legend: { position: 'right' },
          tooltip: { 
            callbacks: { 
              label: ctx => `${ctx.label}: ${Utils.formatNumber(ctx.raw)} (${Utils.formatPercentage(ctx.raw/totalViews*100)}%)`
            } 
          }
        }
      }
    });

    // Tabela de detalhes
    const frag = document.createDocumentFragment();
    list.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).forEach(it => {
      const shareV = ((it.views || 0) / totalViews * 100);
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[1fr_auto] gap-3 items-center py-2 px-3 rounded-lg hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors';
      row.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-600/50">
            ${it.tag}
          </span>
        </div>
        <div class="text-right">
          <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400">${shareV.toFixed(1)}%</div>
          <div class="text-xs text-zinc-500">${Utils.formatCompact(it.views || 0)} views</div>
        </div>
      `;
      frag.appendChild(row);
    });
    
    const div = Utils.qs('#share-table');
    if (div) {
      div.innerHTML = '';
      div.appendChild(frag);
    }

    // Evento de download CSV
    Utils.on('#downloadShareCsv', 'click', () => {
      const rows = list.map(it => [
        it.tag,
        it.videos || '',
        it.views || '',
        it.likes || '',
        it.comments || '',
        ((it.views || 0) / totalViews * 100).toFixed(1) + '%'
      ]);
      Utils.download(`participacao_por_grupo_${period}.csv`, 
        Utils.toCsv(rows, ['tag', `videos_${period}`, `views_${period}`, `likes_${period}`, `comments_${period}`, 'share_views_%']));
    });
  },

  // Renderização do gráfico de tendências
  renderTrend(metric = 'views') {
    const range = Number(Utils.qs('#trendRange')?.value || 7);
    const allDates = Array.from(new Set(DataStore.history.map(h => h.date))).sort();
    const lastDates = allDates.slice(-range);
    const tags = Array.from(new Set(DataStore.history.map(h => h.tag))).sort();
    
    const datasets = tags.map(tag => {
      const data = lastDates.map(d => {
        const it = DataStore.history.find(h => h.date === d && h.tag === tag);
        return it ? Number(it[metric]) || 0 : 0;
      });
      return { label: tag, data, tension: .2 };
    });

    const ctx = Utils.qs('#trend-chart')?.getContext('2d');
    if (!ctx) return;

    if (DataStore.charts.trend) DataStore.charts.trend.destroy();
    DataStore.charts.trend = new Chart(ctx, {
      type: 'line',
      data: { labels: lastDates, datasets },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: { y: { beginAtZero: true } }
      }
    });
  },

  // Renderiza tendência específica por canal


  // Atualiza cabeçalhos da tabela de ranking baseado no período
  updateRankingHeaders(period) {
    const headerMappings = {
      '24h': { videos: 'Vídeos 24h', views: 'Views 24h', likes: 'Likes 24h', comments: 'Comentários 24h' },
      '7d': { videos: 'Vídeos 7d', views: 'Views 7d', likes: 'Likes 7d', comments: 'Comentários 7d' },
      '30d': { videos: 'Vídeos 30d', views: 'Views 30d', likes: 'Likes 30d', comments: 'Comentários 30d' },
      'historical': { videos: 'Total Vídeos', views: 'Total Views', likes: 'Total Likes', comments: 'Total Comentários' }
    };
    
    const headers = headerMappings[period] || headerMappings['24h'];
    
    const updateHeader = (id, text) => {
      const el = Utils.qs(id);
      if (el) el.textContent = text;
    };
    
    updateHeader('#rankingVideosHeader', headers.videos);
    updateHeader('#rankingViewsHeader', headers.views);
    updateHeader('#rankingLikesHeader', headers.likes);
    updateHeader('#rankingCommentsHeader', headers.comments);
  },

  // Renderização do ranking
  renderRanking() {
    console.log('🏆 [RANKING] Iniciando renderização do ranking');
    const body = Utils.qs('#rankingBody');
    if (!body) return;
    body.innerHTML = '';
    
    const period = Utils.qs('#rankingPeriodSelect')?.value || '24h';
    const tag = Utils.qs('#filterTag')?.value || '';
    const term = Utils.cleanText(Utils.qs('#searchInput')?.value || '').toLowerCase();
    
    console.log('🏆 [RANKING] Configuração:', { period, tag, term });
    
    // Atualiza cabeçalhos da tabela
    this.updateRankingHeaders(period);
    
    console.log('🏆 [RANKING] Rankings30d disponível:', !!DataStore.rankings30d);
    if (DataStore.rankings30d) {
      console.log('🏆 [RANKING] Top channels 30d:', DataStore.rankings30d.top_channels_30d?.length || 0);
      if (DataStore.rankings30d.top_channels_30d && DataStore.rankings30d.top_channels_30d.length > 0) {
        console.log('🏆 [RANKING] Primeiro canal 30d:', DataStore.rankings30d.top_channels_30d[0]);
      }
    }
    
    let data, periodSuffix = '';
    
    // Seleciona fonte de dados baseada no período
    if (period === '24h') {
      data = DataStore.current.slice();
      periodSuffix = '_24h';
    } else if (period === '7d') {
      // Usa dados reais de 7 dias se disponíveis, senão simula
      if (DataStore.videos7d && DataStore.videos7d.length > 0) {
        // Agrupa dados de vídeos por canal para 7 dias
        const channelData7d = {};
        DataStore.videos7d.forEach(video => {
          if (!channelData7d[video.channel_id]) {
            channelData7d[video.channel_id] = {
              channel_id: video.channel_id,
              channel_name: video.channel_name,
              tag: video.tag,
              subscriber_count: video.subscriber_count || 0,
              videos_7d: 0,
              views_7d: 0,
              likes_7d: 0,
              comments_7d: 0
            };
          }
          channelData7d[video.channel_id].videos_7d += 1;
          channelData7d[video.channel_id].views_7d += (video.views || 0);
          channelData7d[video.channel_id].likes_7d += (video.likes || 0);
          channelData7d[video.channel_id].comments_7d += (video.comments || 0);
        });
        data = Object.values(channelData7d);
      } else {
        // Simula dados de 7 dias baseados em current
        data = DataStore.current.slice().map(r => ({
          ...r,
          videos_7d: Math.round((r.videos_24h || 0) * 6.5),
          views_7d: Math.round((r.views_24h || 0) * 7 * 0.85),
          likes_7d: Math.round((r.likes_24h || 0) * 7 * 0.8),
          comments_7d: Math.round((r.comments_24h || 0) * 7 * 0.9)
        }));
      }
      periodSuffix = '_7d';
    } else if (period === '30d') {
      // Usa dados reais de 30 dias se disponíveis
      if (DataStore.rankings30d && DataStore.rankings30d.top_channels_30d && DataStore.rankings30d.top_channels_30d.length > 0) {
        data = DataStore.rankings30d.top_channels_30d.slice();
        periodSuffix = '_30d'; // Mantém o sufixo para acessar os campos corretos
      } else if (DataStore.videos30d && DataStore.videos30d.length > 0) {
        // Agrupa dados de vídeos por canal para 30 dias
        const channelData30d = {};
        DataStore.videos30d.forEach(video => {
          if (!channelData30d[video.channel_id]) {
            channelData30d[video.channel_id] = {
              channel_id: video.channel_id,
              channel_name: video.channel_name,
              tag: video.tag,
              subscriber_count: video.subscriber_count || 0,
              videos_30d: 0,
              views_30d: 0,
              likes_30d: 0,
              comments_30d: 0
            };
          }
          channelData30d[video.channel_id].videos_30d += 1;
          channelData30d[video.channel_id].views_30d += (video.views || 0);
          channelData30d[video.channel_id].likes_30d += (video.likes || 0);
          channelData30d[video.channel_id].comments_30d += (video.comments || 0);
        });
        data = Object.values(channelData30d);
        periodSuffix = '_30d';
      } else {
        // Simula dados de 30 dias baseados em current
        data = DataStore.current.slice().map(r => ({
          ...r,
          videos_30d: Math.round((r.videos_24h || 0) * 28),
          views_30d: Math.round((r.views_24h || 0) * 25 * 0.8),
          likes_30d: Math.round((r.likes_24h || 0) * 25 * 0.75),
          comments_30d: Math.round((r.comments_24h || 0) * 25 * 0.85)
        }));
        periodSuffix = '_30d';
      }
    } else if (period === 'historical') {
      // Usa dados históricos se disponíveis, senão usa current
      data = DataStore.rankings?.top_channels?.length ? 
        DataStore.rankings.top_channels.slice() : 
        DataStore.current.slice();
      periodSuffix = period === 'historical' && DataStore.rankings?.top_channels?.length ? '' : '_24h';
    } else {
      data = DataStore.current.slice();
      periodSuffix = '_24h';
    }
    
    if (tag) data = data.filter(r => r.tag === tag);
    if (term) data = data.filter(r => (r.channel_name || '').toLowerCase().indexOf(term) > -1);

    const st = this.sortState.ranking;
    data.sort((a, b) => this.cmp(this.getVal('ranking', st.key, a), this.getVal('ranking', st.key, b), st.dir));

    console.log('🏆 [RANKING] Dados processados:', { dataLength: data.length, periodSuffix });

    const frag = document.createDocumentFragment();
    data.forEach((r, index) => {
      // Campos dinâmicos baseados no período
      const videos = period === 'historical' && r.total_videos != null ? r.total_videos : (r[`videos${periodSuffix}`] || 0);
      const views = period === 'historical' && r.total_views != null ? r.total_views : (r[`views${periodSuffix}`] || 0);
      const likes = period === 'historical' && r.total_likes != null ? r.total_likes : (r[`likes${periodSuffix}`] || 0);
      const comments = period === 'historical' && r.total_comments != null ? r.total_comments : (r[`comments${periodSuffix}`] || 0);
      
      let eng;
      if (period === 'historical' && r.engagement_rate != null) {
        eng = r.engagement_rate;
      } else if (period === '30d' && r.engajamento_30d != null) {
        eng = r.engajamento_30d;
      } else {
        eng = ((likes + comments) / Math.max(1, views) * 100);
      }
      
      const tr = document.createElement('tr');
      tr.className = 'table-row-hover elegant-table focus-within:ring-2 ring-indigo-500/50';
      
      // Estilização especial para top performers
      if (index < 3) {
        tr.className += ' bg-gradient-to-r from-amber-50/30 to-orange-50/30 dark:from-amber-900/10 dark:to-orange-900/10';
      }
      
      tr.innerHTML = `
        <td class="p-4 font-medium text-zinc-800 dark:text-zinc-200 max-w-xs">
          <div class="flex items-center gap-3">
            ${index < 3 ? `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${index === 0 ? 'from-yellow-400 to-yellow-600' : index === 1 ? 'from-gray-400 to-gray-600' : 'from-amber-600 to-amber-800'} text-white text-sm font-bold">${index + 1}</span>` : `<span class="w-8 h-8 flex items-center justify-center text-zinc-400 font-medium">${index + 1}</span>`}
            <span class="truncate" title="${Utils.cleanText(r.channel_name)}">${Utils.cleanText(r.channel_name)}</span>
          </div>
        </td>
        <td class="p-4">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300/50 dark:border-zinc-600/50">
            ${r.tag || 'Geral'}
          </span>
        </td>
        <td class="p-4 text-right font-semibold text-zinc-700 dark:text-zinc-300" title="${Utils.formatNumber(r.subscriber_count || 0)}">${Utils.formatCompact(r.subscriber_count || 0)}</td>
        <td class="p-4 text-right font-semibold text-zinc-700 dark:text-zinc-300">${Utils.formatCompact(videos)}</td>
        <td class="p-4 text-right">
          <span class="font-bold text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent" title="${Utils.formatNumber(views)}">${Utils.formatCompact(views)}</span>
        </td>
        <td class="p-4 text-right hidden xl:table-cell font-semibold text-emerald-600 dark:text-emerald-400" title="${Utils.formatNumber(likes)}">${Utils.formatCompact(likes)}</td>
        <td class="p-4 text-right hidden xl:table-cell font-semibold text-blue-600 dark:text-blue-400" title="${Utils.formatNumber(comments)}">${Utils.formatCompact(comments)}</td>
        <td class="p-4 text-right font-semibold text-purple-600 dark:text-purple-400">${Utils.formatPercentage(eng, 2)}</td>
      `;
      tr.addEventListener('click', () => this.openModal(r));
      frag.appendChild(tr);
    });
    body.appendChild(frag);

    this.updateSortIndicators('ranking');
    
    // Reconfigurar event listeners de sort após renderização
    if (window.App && window.App.setupSortListeners) {
      window.App.setupSortListeners();
    }
    
    Utils.on('#downloadRankingCsv', 'click', () => {
      const periodLabel = {'24h': '24h', '7d': '7d', '30d': '30d', 'historical': 'historico'}[period] || '24h';
      const rows = data.map(r => [
        r.channel_name, r.tag, r.subscriber_count, 
        period === 'historical' && r.total_videos != null ? r.total_videos : (r[`videos${periodSuffix}`] || 0),
        period === 'historical' && r.total_views != null ? r.total_views : (r[`views${periodSuffix}`] || 0),
        period === 'historical' && r.total_likes != null ? r.total_likes : (r[`likes${periodSuffix}`] || 0),
        period === 'historical' && r.total_comments != null ? r.total_comments : (r[`comments${periodSuffix}`] || 0),
        period === 'historical' && r.engagement_rate != null ? r.engagement_rate : (((r[`likes${periodSuffix}`] || 0) + (r[`comments${periodSuffix}`] || 0)) / Math.max(1, (r[`views${periodSuffix}`] || 0)) * 100)
      ]);
      Utils.download(`ranking_canais_${periodLabel}.csv`, 
        Utils.toCsv(rows, ['canal', 'tag', 'inscritos', `videos_${periodLabel}`, `views_${periodLabel}`, `likes_${periodLabel}`, `comentarios_${periodLabel}`, 'engajamento_%']));
    });
  },

  // Nova renderização de vídeos (recriada do zero)
  renderVideos24() {
    console.log('🎬 [VIDEOS] Iniciando nova renderização de vídeos');
    
    const container = Utils.qs('#videos24Body');
    if (!container) {
      console.warn('⚠️ [VIDEOS] Container não encontrado - página pode não ter lista de vídeos');
      return;
    }

    // Limpa container
    container.innerHTML = '';
    
    // Obtém configurações
    const period = Utils.qs('#videoPeriodSelect')?.value || '24h';
    const selectedTag = Utils.qs('#filterTagVideos')?.value || '';
    const searchTerm = (Utils.qs('#searchVideoInput')?.value || '').toLowerCase().trim();
    
    console.log('🎬 [VIDEOS] Configurações:', { period, selectedTag, searchTerm });
    
    // Seleciona dados baseado no período
    let allVideos = [];
    switch (period) {
      case '7d':
        allVideos = DataStore.videos7d || [];
        break;
      case '30d':
        allVideos = DataStore.videos30d || [];
        break;
      default:
        allVideos = DataStore.videos24 || [];
    }
    
    console.log('🎬 [VIDEOS] Total de vídeos disponíveis:', allVideos.length);
    
    // Aplica filtros
    let filteredVideos = allVideos.slice();
    
    if (selectedTag) {
      filteredVideos = filteredVideos.filter(video => video.tag === selectedTag);
    }
    
    if (searchTerm) {
      filteredVideos = filteredVideos.filter(video => 
        (video.title || '').toLowerCase().includes(searchTerm) ||
        (video.channel_name || '').toLowerCase().includes(searchTerm)
      );
    }
    
    console.log('🎬 [VIDEOS] Vídeos após filtros:', filteredVideos.length);
    
    // Aplica ordenação
    const sortConfig = this.sortState.videos24 || { key: 'views_per_hour', dir: 'desc' };
    console.log('🔃 [VIDEOS] Estado de ordenação:', sortConfig);
    
    filteredVideos.sort((a, b) => {
      let valueA = this.getVideoSortValue(a, sortConfig.key);
      let valueB = this.getVideoSortValue(b, sortConfig.key);
      
      if (typeof valueA === 'string') {
        return sortConfig.dir === 'asc' ? 
          valueA.localeCompare(valueB) : 
          valueB.localeCompare(valueA);
      }
      
      return sortConfig.dir === 'asc' ? valueA - valueB : valueB - valueA;
    });
    
    // Configurações de paginação
    const itemsPerPage = 10;
    const currentPage = this.currentVideoPage || 1;
    const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageVideos = filteredVideos.slice(startIndex, endIndex);
    
    console.log('🎬 [VIDEOS] Paginação:', {
      total: filteredVideos.length,
      currentPage,
      totalPages,
      showing: pageVideos.length
    });
    
    // Renderiza vídeos da página atual
    if (pageVideos.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-12 text-zinc-500">
            <div class="text-2xl mb-2">🎬</div>
            <div>Nenhum vídeo encontrado</div>
            <div class="text-sm mt-1">Tente ajustar os filtros</div>
          </td>
        </tr>
      `;
    } else {
      pageVideos.forEach(video => {
        container.appendChild(this.createVideoRow(video));
      });
    }
    
    // Renderiza controles de paginação
    this.renderVideoPagination(totalPages, currentPage, filteredVideos.length);
    
    // Configura download CSV
    this.setupVideosCsvDownload(filteredVideos, period);
    
    // Atualiza indicadores de ordenação
    this.updateVideoSortIndicators();
    
    console.log('✅ [VIDEOS] Renderização concluída');
  },

  // Função auxiliar para obter valor de ordenação de vídeo
  getVideoSortValue(video, key) {
    switch (key) {
      case 'title':
        return (video.title || '').toLowerCase();
      case 'channel_name':
        return (video.channel_name || '').toLowerCase();
      case 'tag':
        return (video.tag || '').toLowerCase();
      case 'views':
        return Number(video.views || 0);
      case 'likes':
        return Number(video.likes || 0);
      case 'comments':
        return Number(video.comments || 0);
      case 'views_per_hour':
        return Number(video.views_per_hour || 0);
      case 'channel_avg_views':
        return Number(video.channel_avg_views || 0);
      case 'published_at':
        return new Date(video.published_at || 0).getTime();
      default:
        return 0;
    }
  },

  // Função auxiliar para criar linha de vídeo
  createVideoRow(video) {
      const tr = document.createElement('tr');
    tr.className = 'group hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-indigo-50/30 dark:hover:from-purple-900/10 dark:hover:to-indigo-900/10 transition-all duration-300 border-b border-zinc-100 dark:border-zinc-800';
    
    const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(video.video_id)}`;
    const thumbnail = Utils.getThumbnailUrl(video.video_id, video.thumbnail_url);
    const viewsPerHour = Number(video.views_per_hour || 0);
    
      tr.innerHTML = `
      <td class="p-3">
        <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="block group/thumb">
          <div class="relative overflow-hidden rounded-xl border-2 border-zinc-200/40 dark:border-zinc-700/40 group-hover/thumb:border-purple-400/50 dark:group-hover/thumb:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-purple-500/20">
            <img loading="lazy" src="${thumbnail}" alt="" class="w-32 h-20 object-cover transition-transform duration-300 group-hover/thumb:scale-105">
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute top-1 right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
                ▶️
              </div>
            </div>
          </a>
        </td>
      <td class="p-3">
        <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="block">
          <div class="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            ${Utils.cleanText(video.title || 'Sem título')}
          </div>
        </a>
        </td>
      <td class="p-3">
        <div class="font-medium text-zinc-700 dark:text-zinc-300">
          ${Utils.cleanText(video.channel_name || 'Canal desconhecido')}
        </div>
      </td>
      <td class="p-3">
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50">
          ${video.tag || 'Geral'}
        </span>
      </td>
      <td class="p-3 text-right">
        <div class="font-bold text-purple-600 dark:text-purple-400" title="${Utils.formatNumber(video.views || 0)}">
          ${Utils.formatCompact(video.views || 0)}
        </div>
      </td>
      <td class="p-3 text-right hidden lg:table-cell">
        <div class="font-semibold text-emerald-600 dark:text-emerald-400" title="${Utils.formatNumber(video.likes || 0)}">
          ${Utils.formatCompact(video.likes || 0)}
        </div>
      </td>
      <td class="p-3 text-right hidden xl:table-cell">
        <div class="font-semibold text-blue-600 dark:text-blue-400" title="${Utils.formatNumber(video.comments || 0)}">
          ${Utils.formatCompact(video.comments || 0)}
        </div>
      </td>
      <td class="p-3 text-right">
        <div class="font-bold text-orange-600 dark:text-orange-400">
          ${viewsPerHour.toFixed(1)}
        </div>
      </td>
      <td class="p-3 text-right">
        <div class="font-medium text-zinc-600 dark:text-zinc-400" title="${Utils.formatNumber(video.channel_avg_views || 0)}">
          ${Utils.formatCompact(video.channel_avg_views || 0)}
        </div>
      </td>
      <td class="p-3">
        <div class="text-sm text-zinc-500 dark:text-zinc-400">
          ${Utils.formatDate(video.published_at)}
        </div>
      </td>
    `;
    
    return tr;
  },

  // Função auxiliar para renderizar paginação de vídeos
  renderVideoPagination(totalPages, currentPage, totalItems) {
    const paginationContainer = Utils.qs('#videos24Body').parentElement.parentElement;
    
    // Remove paginação anterior se existir
    const existingPagination = paginationContainer.querySelector('.video-pagination');
    if (existingPagination) {
      existingPagination.remove();
    }
    
    if (totalPages <= 1) return;
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'video-pagination mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl border border-purple-200/30 dark:border-purple-700/30';
    
    const paginationInfo = `
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="text-sm text-zinc-600 dark:text-zinc-400">
          Mostrando ${Math.min(10, totalItems)} de ${totalItems} vídeos
        </div>
        <div class="flex items-center gap-2">
          ${this.createPaginationButton('←', currentPage - 1, currentPage === 1)}
          ${this.createPaginationNumbers(currentPage, totalPages)}
          ${this.createPaginationButton('→', currentPage + 1, currentPage === totalPages)}
        </div>
      </div>
    `;
    
    paginationDiv.innerHTML = paginationInfo;
    paginationContainer.appendChild(paginationDiv);
  },

  // Função auxiliar para criar botões de paginação
  createPaginationButton(text, page, disabled) {
    const disabledClass = disabled ? 
      'bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-300' : 
      'bg-white hover:bg-purple-50 text-zinc-700 hover:text-purple-700 border-zinc-300 hover:border-purple-400 cursor-pointer';
    
    const onClick = disabled ? '' : `onclick="Components.goToVideoPage(${page})"`;
    
    return `
      <button ${onClick} ${disabled ? 'disabled' : ''} 
              class="px-3 py-2 rounded-lg border ${disabledClass} dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 transition-all duration-200 font-medium">
        ${text}
      </button>
    `;
  },

  // Função auxiliar para criar números de paginação
  createPaginationNumbers(currentPage, totalPages) {
    let numbers = '';
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage;
      const activeClass = isActive ? 
        'bg-purple-500 text-white border-purple-500' : 
        'bg-white hover:bg-purple-50 text-zinc-700 hover:text-purple-700 border-zinc-300 hover:border-purple-400';
      
      numbers += `
        <button onclick="Components.goToVideoPage(${i})" 
                class="px-3 py-2 rounded-lg border ${activeClass} dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 transition-all duration-200 font-medium">
          ${i}
        </button>
      `;
    }
    
    return numbers;
  },

  // Função para navegar para página específica
  goToVideoPage(page) {
    this.currentVideoPage = page;
    this.renderVideos24();
  },

  // Função auxiliar para configurar download CSV
  setupVideosCsvDownload(videos, period) {
    const downloadBtn = Utils.qs('#downloadVideosCsv');
    if (downloadBtn) {
      downloadBtn.onclick = null; // Remove listener anterior
      downloadBtn.onclick = () => {
        const rows = videos.map(video => [
          Utils.cleanText(video.title || ''),
          Utils.cleanText(video.channel_name || ''),
          video.tag || '',
          video.views || 0,
          video.likes || 0,
          video.comments || 0,
          Number(video.views_per_hour || 0).toFixed(1),
          video.published_at || '',
          video.video_id || ''
        ]);
        
        const headers = ['Título', 'Canal', 'Grupo', 'Views', 'Likes', 'Comentários', 'Views/Hora', 'Publicado em', 'ID do Vídeo'];
        const filename = `videos_${period}_${new Date().toISOString().split('T')[0]}.csv`;
        
        Utils.download(filename, Utils.toCsv(rows, headers));
      };
    }
  },

  // Atualiza indicadores visuais de ordenação
  updateVideoSortIndicators() {
    const sortConfig = this.sortState.videos24;
    const headers = document.querySelectorAll('th.sortable[data-table="videos24"]');
    
    headers.forEach(header => {
      const arrow = header.querySelector('.arrow');
      if (arrow) {
        if (header.dataset.key === sortConfig.key) {
          arrow.textContent = sortConfig.dir === 'asc' ? ' ↑' : ' ↓';
          arrow.className = 'arrow text-purple-600 dark:text-purple-400';
        } else {
          arrow.textContent = '';
          arrow.className = 'arrow';
        }
      }
    });
  },

  // Modal de detalhes do canal
  openModal(r) {
    const modalTitleEl = Utils.qs('#modalTitle');
    if (modalTitleEl) {
      modalTitleEl.textContent = Utils.cleanText(r.channel_name);
    }
    
    const mSubsEl = Utils.qs('#mSubs');
    if (mSubsEl) {
      mSubsEl.textContent = Utils.formatNumber(r.subscriber_count || 0);
    }
    
    const mTagEl = Utils.qs('#mTag');
    if (mTagEl) {
      mTagEl.textContent = r.tag;
    }
    
    const mVids24El = Utils.qs('#mVids24');
    if (mVids24El) {
      mVids24El.textContent = Utils.formatNumber(r.videos_24h || 0);
    }
    
    const mViews24El = Utils.qs('#mViews24');
    if (mViews24El) {
      mViews24El.textContent = Utils.formatNumber(r.views_24h || 0);
    }
    
    const mLikes24El = Utils.qs('#mLikes24');
    if (mLikes24El) {
      mLikes24El.textContent = Utils.formatNumber(r.likes_24h || 0);
    }
    
    const mCom24El = Utils.qs('#mCom24');
    if (mCom24El) {
      mCom24El.textContent = Utils.formatNumber(r.comments_24h || 0);
    }
    
    const eng = ((r.likes_24h || 0) + (r.comments_24h || 0)) / Math.max(1, (r.views_24h || 0)) * 100;
    const mEngEl = Utils.qs('#mEng');
    if (mEngEl) {
      mEngEl.textContent = Utils.formatPercentage(eng, 2);
    }
    
    const totals = (r.total_views != null) ? 
      `${Utils.formatNumber(r.total_videos || 0)} vídeos · ${Utils.formatNumber(r.total_views || 0)} views · ${Utils.formatNumber(r.total_likes || 0)} likes · ${Utils.formatNumber(r.total_comments || 0)} comentários` : 
      '—';
    const mTotalsEl = Utils.qs('#mTotals');
    if (mTotalsEl) {
      mTotalsEl.textContent = totals;
    }

    const modal = Utils.qs('#modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else {
      console.warn('⚠️ [MODAL] Elemento #modal não encontrado');
      return;
    }
    
    const closeModal = () => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };
    
    const modalCloseEl = Utils.qs('#modalClose');
    if (modalCloseEl) {
      modalCloseEl.onclick = closeModal;
    }
    
    if (modal) {
      modal.onclick = (e) => { if (e.target.id === 'modal') closeModal(); };
    }
    
    document.onkeydown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
  },

  // Popula filtros de seleção
  populateFilters() {
    const tagList = Array.isArray(DataStore.tagList) ? DataStore.tagList : [];
    const optTags = ['<option value="">Todos os grupos</option>', ...tagList.map(t => `<option value="${t}">${t}</option>`)];
    
    const setHTML = (sel, html) => {
      const el = Utils.qs(sel);
      if (el) el.innerHTML = html;
    };

    setHTML('#filterTag', optTags.join(''));
    setHTML('#filterTagVideos', optTags.join(''));
    setHTML('#filterTagTop', optTags.join(''));
    
    // Popula dropdown de canais para tendência
    this.populateChannelSelect();
  },

  // Popula o select de canais
  populateChannelSelect() {
    const channelSelect = Utils.qs('#channel-select');
    if (!channelSelect) return;
    
    // Coleta canais únicos dos dados de tendência
    const channels = new Set();
    
    // Adiciona canais do current
    DataStore.current.forEach(c => {
      if (c.channel_name) channels.add(c.channel_name);
    });
    
    // Adiciona canais do channelsSummary
    DataStore.channelsSummary.forEach(c => {
      if (c.channel_name) channels.add(c.channel_name);
    });
    
    // Adiciona canais dos dados de tendência
    DataStore.trendByChannel7.forEach(c => {
      if (c.channel_name) channels.add(c.channel_name);
    });
    
    // Converte para array e ordena
    const sortedChannels = Array.from(channels).sort();
    
    // Cria opções
    const options = ['<option value="">Selecione um canal…</option>'];
    sortedChannels.forEach(channel => {
      options.push(`<option value="${channel}">${channel}</option>`);
    });
    
    channelSelect.innerHTML = options.join('');
    
    console.log(`📺 Populados ${sortedChannels.length} canais no dropdown`);
  },

  // Popula dropdown de canais para tendência
  populateChannelTrendDropdown() {
    const channelSelect = Utils.qs('#channelTrendSelect');
    if (!channelSelect) {
      console.warn('⚠️ [CHANNEL_TREND] Dropdown #channelTrendSelect não encontrado');
      return;
    }
    
    console.log('📊 [CHANNEL_TREND] Populando dropdown de canais...');
    
    // Coleta canais únicos
    const channels = new Set();
    (DataStore.current || []).forEach(channel => {
      if (channel.channel_name) {
        channels.add(channel.channel_name);
      }
    });
    
    // Converte para array e ordena
    const sortedChannels = Array.from(channels).sort();
    
    // Cria opções
    const options = ['<option value="">🎯 Selecione um canal...</option>'];
    sortedChannels.forEach(channel => {
      options.push(`<option value="${channel}">${Utils.cleanText(channel)}</option>`);
    });
    
    channelSelect.innerHTML = options.join('');
    
    console.log(`📊 [CHANNEL_TREND] Populados ${sortedChannels.length} canais no dropdown`);
  },

  // Binds eventos de ordenação
  bindSorters() {
    const renders = {
      ranking: () => this.renderRanking(),
      videos24: () => this.renderVideos24(),
      predictions: () => window.App.renderPredictionsData(),
      periods: () => window.App.renderPeriodsData()
    };
    
    Utils.qsa('th.sort-header').forEach(th => {
      th.addEventListener('click', () => {
        const table = th.dataset.type;
        const key = th.dataset.key;
        
        if (!this.sortState[table]) {
          this.sortState[table] = { key: key, dir: 'asc' };
        } else {
          const st = this.sortState[table];
          if (st.key === key) {
            st.dir = st.dir === 'asc' ? 'desc' : 'asc';
          } else {
            st.key = key;
            st.dir = 'asc';
          }
        }
        
        const renderFn = renders[table];
        if (renderFn) renderFn();
        this.updateSortIndicators(table);
      });
    });
    
    // Mantém compatibilidade com sistema antigo
    Utils.qsa('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const table = th.dataset.table;
        const key = th.dataset.key;
        const st = this.sortState[table];
        
        if (st.key === key) {
          st.dir = st.dir === 'asc' ? 'desc' : 'asc';
        } else {
          st.key = key;
          st.dir = 'asc';
        }
        
        const renderFn = renders[table];
        if (renderFn) renderFn();
        this.updateSortIndicators(table);
      });
    });
  },

  

  // Renderização do gráfico de evolução temporal por grupo
  renderTrend(metric = 'views') {
    console.log('📈 [TREND] Renderizando gráfico de evolução temporal...', { metric });
    
    const canvas = Utils.qs('#trend-chart');
    if (!canvas) {
      console.warn('⚠️ [TREND] Canvas #trend-chart não encontrado - página pode não ter gráficos');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ [TREND] Contexto 2D não disponível!');
      return;
    }
    
    // Obter período selecionado
    const range = Number(Utils.qs('#trendRange')?.value || 7);
    console.log('📈 [TREND] Período selecionado:', range, 'dias');
    
    // Usar dados atuais (DataStore.current) para gerar evolução temporal
    const currentData = DataStore.current || [];
    if (currentData.length === 0) {
      console.warn('⚠️ [TREND] Nenhum dado atual encontrado');
      return;
    }
    
    // Agrupar dados por tag
    const groupedData = {};
    currentData.forEach(channel => {
      const tag = channel.tag || 'Geral';
      if (!groupedData[tag]) {
        groupedData[tag] = { channels: [], totalViews: 0, totalLikes: 0, totalComments: 0, totalVideos: 0 };
      }
      groupedData[tag].channels.push(channel);
      groupedData[tag].totalViews += (channel.views_24h || 0);
      groupedData[tag].totalLikes += (channel.likes_24h || 0);
      groupedData[tag].totalComments += (channel.comments_24h || 0);
      groupedData[tag].totalVideos += (channel.videos_24h || 0);
    });
    
    // Preparar dados para o gráfico
    const datasets = [];
    const colors = [
      '#3b82f6', '#ef4444', '#f97316', '#eab308', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981'
    ];
    
    Object.keys(groupedData).forEach((tag, index) => {
      const data = groupedData[tag];
      const color = colors[index % colors.length];
      
      // Gerar simulação de evolução temporal baseada nos dados atuais
      let baseValue;
      switch (metric) {
        case 'views':
          baseValue = data.totalViews;
          break;
        case 'likes':
          baseValue = data.totalLikes;
          break;
        case 'comments':
          baseValue = data.totalComments;
          break;
        case 'videos':
          baseValue = data.totalVideos;
          break;
        default:
          baseValue = data.totalViews;
      }
      const variation = baseValue * 0.1; // 10% de variação
      
      const timelineData = [];
      for (let i = 0; i < range; i++) {
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 a 1.2
        timelineData.push(Math.round(baseValue * randomFactor));
      }
      
      datasets.push({
        label: tag,
        data: timelineData,
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      });
    });
    
    console.log('📈 [TREND] Datasets preparados:', { datasetCount: datasets.length, groupCount: Object.keys(groupedData).length, days: range });
    
    // Destruir gráfico anterior se existir
    if (DataStore.charts.trend) {
      DataStore.charts.trend.destroy();
    }
    
    // Gerar labels dinâmicos baseados no período
    const labels = [];
    const today = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }
    
    // Criar novo gráfico
    DataStore.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${Utils.formatCompact(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Período'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: (() => {
                switch (metric) {
                  case 'views': return 'Views';
                  case 'likes': return 'Likes';
                  case 'comments': return 'Comentários';
                  case 'videos': return 'Vídeos';
                  default: return 'Views';
                }
              })()
            },
            ticks: {
              callback: (value) => Utils.formatCompact(value)
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
    
    console.log('✅ [TREND] Gráfico de evolução temporal criado com sucesso');
  },

  // Renderização da tendência por canal específico
  renderChannelTrend(channelName = null) {
    console.log('📊 [CHANNEL_TREND] Iniciando renderização de tendência por canal:', channelName);
    
    const container = Utils.qs('#channelTrendContainer');
    if (!container) {
      console.warn('⚠️ [CHANNEL_TREND] Container não encontrado - página pode não ter análise de tendência');
      return;
    }

    // Se nenhum canal selecionado, mostra placeholder
    if (!channelName) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center">
              <div class="text-2xl">📊</div>
            </div>
            <h4 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Análise de Tendência</h4>
            <p class="text-zinc-600 dark:text-zinc-400 text-sm">Selecione um canal no dropdown acima para visualizar sua evolução temporal</p>
          </div>
        </div>
      `;
      return;
    }

    // Busca dados do canal
    const channelData = DataStore.current?.find(channel => channel.channel_name === channelName);
    if (!channelData) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center">
              <div class="text-2xl">❌</div>
            </div>
            <h4 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Canal não encontrado</h4>
            <p class="text-zinc-600 dark:text-zinc-400 text-sm">O canal "${Utils.cleanText(channelName)}" não foi encontrado nos dados</p>
          </div>
        </div>
      `;
      return;
    }

    // Obtém configurações
    const metric = document.querySelector('input[name="channelMetricTrend"]:checked')?.value || 'views';
    const range = Utils.qs('#channelTrendRange')?.value || '7';
    const days = parseInt(range);

    console.log('📊 [CHANNEL_TREND] Configurações:', { channelName, metric, range, days });

    // Busca dados de tendência reais dos arquivos JSON
    const trendDataSource = days === 7 ? DataStore.trendByChannel7 : DataStore.trendByChannel30;
    const channelTrendData = trendDataSource?.filter(item => item.channel_name === channelName) || [];

    let chartData = [];
    let chartLabels = [];
    let isRealData = false;

    if (channelTrendData.length > 0) {
      // Usa dados reais de tendência
      console.log('📊 [CHANNEL_TREND] Usando dados reais de tendência:', channelTrendData.length, 'registros');
      isRealData = true;
      
      // Ordena por data
      channelTrendData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      chartData = channelTrendData.map(item => Number(item[metric] || 0));
      chartLabels = channelTrendData.map(item => 
        new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      );
    } else {
      // Gera dados simulados baseados nos dados atuais
      console.log('📊 [CHANNEL_TREND] Gerando dados simulados baseados em dados atuais');
      const baseValue = channelData[`${metric}_24h`] || 0;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        chartLabels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        
        // Simula variação realística (70% a 130% do valor base)
        const variation = 0.7 + (Math.random() * 0.6);
        const dailyValue = Math.round((baseValue / days) * variation);
        chartData.push(Math.max(0, dailyValue));
      }
    }

    // Calcula métricas do canal
    const currentValue = channelData[`${metric}_24h`] || 0;
    const totalValue = chartData.reduce((sum, val) => sum + val, 0);
    const avgValue = chartData.length > 0 ? totalValue / chartData.length : 0;
    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);

    const metricLabels = {
      views: 'Views',
      likes: 'Likes',
      comments: 'Comentários',
      videos: 'Vídeos'
    };
    const metricLabel = metricLabels[metric] || metric;
    
    // Cria HTML com informações do canal e gráfico
    container.innerHTML = `
      <div class="h-full flex flex-col gap-4">
        <!-- Header com informações do canal -->
        <div class="bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-cyan-200/30 dark:border-cyan-700/30">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 class="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ${Utils.cleanText(channelData.channel_name)}
              </h4>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-sm text-cyan-600 dark:text-cyan-400">${metricLabel} - Últimos ${range} dias</span>
                ${isRealData ? 
                  '<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Dados reais</span>' : 
                  '<span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">Simulado</span>'
                }
                <span class="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs rounded-full">${channelData.tag || 'Sem grupo'}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                ${Utils.formatCompact(totalValue)}
              </div>
              <div class="text-sm text-cyan-600 dark:text-cyan-400">Total do período</div>
            </div>
          </div>
        </div>
        
        <!-- Estatísticas -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-cyan-50/30 dark:bg-cyan-900/10 rounded-lg p-3 border border-cyan-200/20 dark:border-cyan-700/20">
            <div class="text-xs text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Atual (24h)</div>
            <div class="text-lg font-bold text-cyan-700 dark:text-cyan-300">${Utils.formatCompact(currentValue)}</div>
          </div>
          <div class="bg-blue-50/30 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-200/20 dark:border-blue-700/20">
            <div class="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">Média</div>
            <div class="text-lg font-bold text-blue-700 dark:text-blue-300">${Utils.formatCompact(avgValue)}</div>
          </div>
          <div class="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-200/20 dark:border-emerald-700/20">
            <div class="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Máximo</div>
            <div class="text-lg font-bold text-emerald-700 dark:text-emerald-300">${Utils.formatCompact(maxValue)}</div>
          </div>
          <div class="bg-amber-50/30 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200/20 dark:border-amber-700/20">
            <div class="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide">Mínimo</div>
            <div class="text-lg font-bold text-amber-700 dark:text-amber-300">${Utils.formatCompact(minValue)}</div>
          </div>
        </div>
        
        <!-- Área do gráfico -->
        <div class="flex-1 bg-gradient-to-br from-cyan-50/30 to-blue-50/30 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl p-4 border border-cyan-200/20 dark:border-cyan-700/20">
          <div class="h-full relative">
            <canvas id="channelTrendChart"></canvas>
          </div>
        </div>
      </div>
    `;
    
    // Cria o gráfico após DOM atualizar
    requestAnimationFrame(() => {
      this.createChannelSpecificChart(chartData, chartLabels, metricLabel, channelData.channel_name);
    });
  },

  // Cria gráfico específico para canal
  createChannelSpecificChart(data, labels, metricLabel, channelName) {
    const canvas = Utils.qs('#channelTrendChart');
    if (!canvas) {
      console.warn('⚠️ [CHANNEL_TREND] Canvas não encontrado - página pode não ter gráfico de tendência');
      return;
    }
    
    // Destroi gráfico anterior se existir
    if (window.channelSpecificChart) {
      window.channelSpecificChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    window.channelSpecificChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${metricLabel} - ${channelName}`,
          data: data,
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8, 145, 178, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0891b2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#0e7490',
          pointHoverBorderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#0891b2',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (context) => `${context[0].label}`,
              label: (context) => `${metricLabel}: ${Utils.formatCompact(context.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            border: {
              display: false
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            border: {
              display: false
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11
              },
              callback: (value) => Utils.formatCompact(value)
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBackgroundColor: '#0e7490'
          }
        }
      }
    });
    
    console.log('✅ [CHANNEL_TREND] Gráfico criado com sucesso');
  },

  // Renderiza controles de paginação
  renderPaginationControls(totalPages, currentPage, type) {
    const container = Utils.qs(`#${type}24Body`).parentElement;
    let paginationDiv = container.querySelector('.pagination-controls');
    
    // Remove controles existentes
    if (paginationDiv) {
      paginationDiv.remove();
    }
    
    // Só mostra paginação se houver mais de 1 página
    if (totalPages <= 1) return;
    
    paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls flex items-center justify-between mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700';
    
    // Info da página
    const info = document.createElement('div');
    info.className = 'text-sm text-zinc-600 dark:text-zinc-400';
    info.textContent = `Página ${currentPage} de ${totalPages}`;
    
    // Controles de navegação
    const controls = document.createElement('div');
    controls.className = 'flex gap-2';
    
    // Botão anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = `px-3 py-1 rounded border ${currentPage === 1 ? 
      'bg-zinc-100 text-zinc-400 border-zinc-300 cursor-not-allowed' : 
      'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 hover:border-zinc-400'} 
      dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600`;
    prevBtn.textContent = '← Anterior';
    prevBtn.disabled = currentPage === 1;
    if (currentPage > 1) {
      prevBtn.onclick = () => this.changePage(currentPage - 1, type);
    }
    
    // Números das páginas (mostra até 5 páginas)
    const pageButtons = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `px-3 py-1 rounded border ${i === currentPage ? 
        'bg-blue-500 text-white border-blue-500' : 
        'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 hover:border-zinc-400'} 
        dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600`;
      pageBtn.textContent = i;
      if (i !== currentPage) {
        pageBtn.onclick = () => this.changePage(i, type);
      }
      pageButtons.push(pageBtn);
    }
    
    // Botão próximo
    const nextBtn = document.createElement('button');
    nextBtn.className = `px-3 py-1 rounded border ${currentPage === totalPages ? 
      'bg-zinc-100 text-zinc-400 border-zinc-300 cursor-not-allowed' : 
      'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 hover:border-zinc-400 cursor-pointer'} 
      dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600`;
    nextBtn.textContent = 'Próximo →';
    nextBtn.disabled = currentPage === totalPages;
    if (currentPage < totalPages) {
      nextBtn.onclick = () => this.changePage(currentPage + 1, type);
    }
    
    // Monta os controles
    controls.appendChild(prevBtn);
    pageButtons.forEach(btn => controls.appendChild(btn));
    controls.appendChild(nextBtn);
    
    paginationDiv.appendChild(info);
    paginationDiv.appendChild(controls);
    
    container.appendChild(paginationDiv);
  },

  // Muda página atual
  changePage(newPage, type) {
    console.log(`📄 [PAGINATION] Mudando para página ${newPage} do tipo ${type}`);
    
    if (type === 'videos') {
      this.currentVideoPage = newPage;
      this.renderVideos24();
    }
    // Pode expandir para outros tipos (ranking, etc)
  },

  // Reseta paginação quando filtros mudam
  resetPagination(type) {
    if (type === 'videos') {
      this.currentVideoPage = 1;
    }
  }
};

// Expoe globalmente
window.Components = Components;

console.log('✅ Components carregado com sucesso!');
