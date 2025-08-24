/**
 * Data Store - Gerenciamento centralizado de dados
 * Carrega e gerencia todos os dados JSON do sistema
 */

const DataStore = {
  // Dados principais
      current: [],
      history: [],
      metadata: null,
      rankings: null,
      channelsSummary: [],
      tags24: null,
      videos24: [],
      videos7d: [],
      videos30d: [],
      trendByChannel7: [],
      trendByChannel30: [],
  
  // Dados derivados
  byTag24: {},
  tagList: [],
  charts: {
    share: null,
    trend: null,
    channel: null
  },
  
  // Dados adicionais
      benchmarkData: null,
      performancePredictions: null,
      periodComparisons: null,
  keywordAnalysis: null,
  
  // Estado
  renderedTabs: new Set(),
  loading: false,

  // Metodos de carregamento
  async fetchMaybe(path, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 [DATASTORE] Tentativa ${attempt}/${retries} para carregar: ${path}`);
        const response = await fetch(path, { 
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ [DATASTORE] Carregado com sucesso: ${path}`);
        return data;
        
      } catch (error) {
        console.warn(`⚠️ [DATASTORE] Erro na tentativa ${attempt}/${retries} ao carregar ${path}:`, error);
        
        if (attempt === retries) {
          console.error(`❌ [DATASTORE] Falha definitiva ao carregar ${path} após ${retries} tentativas`);
          return null;
        }
        
        // Aguarda antes da próxima tentativa (backoff exponencial)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  async loadAll() {
    if (location.protocol === 'file:') {
      throw new Error('Abra via servidor local (ex.: python -m http.server).');
    }

    this.loading = true;
    
    try {
      console.log('🔄 [DATASTORE] Iniciando carregamento de dados JSON...');
      
      // Lista de todos os arquivos a carregar
      const dataFiles = [
        { path: 'data/current.json', key: 'current' },
        { path: 'data/history.json', key: 'history' },
        { path: 'data/metadata.json', key: 'metadata' },
        { path: 'data/rankings.json', key: 'rankings' },
        { path: 'data/rankings_30d.json', key: 'rankings30d' },
        { path: 'data/channels_summary.json', key: 'channelsSummary' },
        { path: 'data/tags_24h.json', key: 'tags24' },
        { path: 'data/videos_24h.json', key: 'videos24' },
        { path: 'data/videos_7d.json', key: 'videos7d' },
        { path: 'data/videos_30d.json', key: 'videos30d' },
        { path: 'data/trend_by_channel_7d.json', key: 'trendByChannel7' },
        { path: 'data/trend_by_channel_30d.json', key: 'trendByChannel30' },
        { path: 'data/benchmark_data.json', key: 'benchmarkData' },
        { path: 'data/performance_predictions.json', key: 'performancePredictions' },
        { path: 'data/period_comparisons.json', key: 'periodComparisons' },
        { path: 'data/keyword_analysis.json', key: 'keywordAnalysis' }
      ];

      // Carrega todos os arquivos em paralelo com Promise.allSettled
      const promises = dataFiles.map(async ({ path, key }) => {
        try {
          const data = await this.fetchMaybe(path);
          return { key, data, success: true };
        } catch (error) {
          console.warn(`⚠️ [DATASTORE] Falha ao carregar ${path}:`, error);
          return { key, data: null, success: false, error };
        }
      });

      const results = await Promise.allSettled(promises);
      
      // Processa resultados
      const successful = [];
      const failed = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { key, data, success, error } = result.value;
          if (success && data !== null) {
            successful.push({ key, data });
          } else {
            failed.push({ key, error });
          }
        } else {
          failed.push({ key: dataFiles[index].key, error: result.reason });
        }
      });

      // Atribui dados carregados com sucesso
      successful.forEach(({ key, data }) => {
        switch (key) {
          case 'current':
            this.current = Array.isArray(data) ? data : [];
            break;
          case 'history':
            this.history = Array.isArray(data) ? data : [];
            break;
          case 'metadata':
            this.metadata = data || {};
            break;
          case 'rankings':
            this.rankings = data || {};
            break;
          case 'rankings30d':
            this.rankings30d = data || {};
            break;
          case 'channelsSummary':
            this.channelsSummary = Array.isArray(data) ? data : [];
            break;
          case 'tags24':
            this.tags24 = data || null;
            break;
          case 'videos24':
            this.videos24 = Array.isArray(data) ? data : [];
            break;
          case 'videos7d':
            this.videos7d = Array.isArray(data) ? data : [];
            break;
          case 'videos30d':
            this.videos30d = Array.isArray(data) ? data : [];
            break;
          case 'trendByChannel7':
            this.trendByChannel7 = Array.isArray(data) ? data : [];
            break;
          case 'trendByChannel30':
            this.trendByChannel30 = Array.isArray(data) ? data : [];
            break;
          case 'benchmarkData':
            this.benchmarkData = data || null;
            break;
          case 'performancePredictions':
            this.performancePredictions = data || null;
            break;
          case 'periodComparisons':
            this.periodComparisons = data || null;
            break;
          case 'keywordAnalysis':
            this.keywordAnalysis = data || null;
            break;
        }
      });

      // Log de resultados
      console.log(`✅ [DATASTORE] Carregamento concluído: ${successful.length} arquivos carregados com sucesso`);
      if (failed.length > 0) {
        console.warn(`⚠️ [DATASTORE] ${failed.length} arquivos falharam:`, failed.map(f => f.key));
        
        // Lista específica dos arquivos que falharam
        const failedFiles = failed.map(f => {
          const filePath = dataFiles.find(df => df.key === f.key)?.path;
          return `${f.key} (${filePath})`;
        });
        
        console.error('❌ [DATASTORE] Arquivos que falharam:', failedFiles);
        
        // Se nenhum arquivo foi carregado, mostra erro detalhado
        if (successful.length === 0) {
          const error = new Error('Nenhum arquivo JSON foi carregado com sucesso');
          error.failedFiles = failedFiles;
          throw error;
        }
      }

      // Processa dados
      this.processData();
      
      console.log('✅ [DATASTORE] Dados carregados:', {
        current: this.current.length,
        history: this.history.length,
        videos24: this.videos24.length,
        videos7d: this.videos7d.length,
        videos30d: this.videos30d.length,
        tags: this.tagList.length,
        rankings30d: this.rankings30d ? Object.keys(this.rankings30d) : 'null'
      });
        
        return true;
    } catch (error) {
      console.error('❌ [DATASTORE] Erro ao carregar dados:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  },

  processData() {
    console.log('🔧 [DATASTORE] Processando dados...');
    
    // Normaliza dados numericos com validação robusta
    this.current.forEach(r => {
      if (!r || typeof r !== 'object') return;
      
      r.subscriber_count = this.safeNumber(r.subscriber_count);
      r.videos_24h = this.safeNumber(r.videos_24h);
      r.views_24h = this.safeNumber(r.views_24h);
      r.likes_24h = this.safeNumber(r.likes_24h);
      r.comments_24h = this.safeNumber(r.comments_24h);
      r.engagement_rate = this.safeNumber(r.engagement_rate);
      r.tag = this.safeString(r.tag, 'sem_tag');
      
      // Validação adicional para dados críticos
      if (r.views_24h < 0) r.views_24h = 0;
      if (r.likes_24h < 0) r.likes_24h = 0;
      if (r.comments_24h < 0) r.comments_24h = 0;
      if (r.videos_24h < 0) r.videos_24h = 0;
    });

    this.channelsSummary.forEach(r => {
      if (!r || typeof r !== 'object') return;
      
      r.subscriber_count = this.safeNumber(r.subscriber_count);
      r.videos_24h = this.safeNumber(r.videos_24h);
      r.views_24h = this.safeNumber(r.views_24h);
      r.likes_24h = this.safeNumber(r.likes_24h);
      r.comments_24h = this.safeNumber(r.comments_24h);
      r.total_videos = this.safeNumber(r.total_videos);
      r.total_views = this.safeNumber(r.total_views);
      r.total_likes = this.safeNumber(r.total_likes);
      r.total_comments = this.safeNumber(r.total_comments);
      r.engagement_rate_24h = this.safeNumber(r.engagement_rate_24h);
      r.tag = this.safeString(r.tag, 'sem_tag');
      
      // Validação adicional
      if (r.total_views < 0) r.total_views = 0;
      if (r.total_likes < 0) r.total_likes = 0;
      if (r.total_comments < 0) r.total_comments = 0;
      if (r.total_videos < 0) r.total_videos = 0;
    });

    // Gera lista de tags com validação
    const tagSource = this.channelsSummary.length ? this.channelsSummary : this.current;
    this.tagList = Array.from(new Set(
      tagSource
        .filter(r => r && r.tag)
        .map(r => this.safeString(r.tag))
    )).sort();

    // Processa dados por tag com validação
    if (this.tags24 && this.tags24.by_tag && Array.isArray(this.tags24.by_tag)) {
      const map = {};
      this.tags24.by_tag.forEach(it => { 
        if (it && it.tag) {
          map[this.safeString(it.tag)] = {
            tag: this.safeString(it.tag),
            views: this.safeNumber(it.views),
            likes: this.safeNumber(it.likes),
            comments: this.safeNumber(it.comments),
            videos: this.safeNumber(it.videos)
          };
        }
      });
      this.byTag24 = map;
    } else {
      const grouped = Utils.array.groupBy(this.current, 'tag');
      const map = {};
      Object.keys(grouped).forEach(tag => {
        const arr = grouped[tag];
        if (Array.isArray(arr)) {
          const views = Utils.array.sum(arr, 'views_24h');
          const likes = Utils.array.sum(arr, 'likes_24h');
          const comments = Utils.array.sum(arr, 'comments_24h');
          const videos = Utils.array.sum(arr, 'videos_24h');
          map[tag] = { tag, views, likes, comments, videos };
        }
      });
      this.byTag24 = map;
    }

    // Atualiza footer indicators
    this.updateFooterIndicators();
    
    console.log('✅ [DATASTORE] Dados processados com sucesso');
  },

  // Funções auxiliares para validação segura
  safeNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : Math.max(0, num);
  },

  safeString(value, defaultValue = '') {
    if (value === null || value === undefined) return defaultValue;
    return String(value).trim() || defaultValue;
  },

  updateFooterIndicators() {
    const footer30d = Utils.qs('#footer30d');
    const footerAdvanced = Utils.qs('#footerAdvanced');
    
    if (footer30d && this.trendByChannel30.length) {
      footer30d.classList.remove('hidden');
    }
    
    if (footerAdvanced && (this.benchmarkData || this.performancePredictions || this.periodComparisons || this.keywordAnalysis)) {
      footerAdvanced.classList.remove('hidden');
    }
  },

  // Getters para compatibilidade
  getCurrent() { return this.current; },
  getHistory() { return this.history; },
  getMetadata() { return this.metadata; },
  getRankings() { return this.rankings; },
  getRankings30d() { return this.rankings30d; },
  getChannelsSummary() { return this.channelsSummary; },
  getTags24() { return this.tags24; },
  getVideos24() { return this.videos24; },
  getVideos7d() { return this.videos7d; },
  getVideos30d() { return this.videos30d; },
  getTrendByChannel7() { return this.trendByChannel7; },
  getTrendByChannel30() { return this.trendByChannel30; },
  getByTag24() { return this.byTag24; },
  getTagList() { return this.tagList; },

  // Metodos para limpar dados
  clear() {
    this.current = [];
    this.history = [];
    this.metadata = null;
    this.rankings = null;
    this.channelsSummary = [];
    this.tags24 = null;
    this.videos24 = [];
    this.videos7d = [];
    this.videos30d = [];
    this.trendByChannel7 = [];
    this.trendByChannel30 = [];
    this.byTag24 = {};
    this.tagList = [];
    this.benchmarkData = null;
    this.performancePredictions = null;
    this.periodComparisons = null;
    this.keywordAnalysis = null;
    this.renderedTabs.clear();
    
    // Destroi charts se existirem
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = { share: null, trend: null, channel: null };
  },

  // Status do carregamento
  isLoading() { return this.loading; },
  hasData() { return this.current.length > 0 || this.channelsSummary.length > 0; }
};

// Expoe globalmente
window.DataStore = DataStore;

console.log('✅ DataStore carregado com sucesso!');
