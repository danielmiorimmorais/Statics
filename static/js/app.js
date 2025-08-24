/**
 * App Principal - Inicializacao e controle da aplicacao
 * Coordena o carregamento dos dados e renderizacao dos componentes
 */

const App = {
  // Estado da aplicacao
  currentTab: 'tab-dashboard',
  initialized: false,

  // Inicializacao
  async init() {
    const startTime = performance.now();
    
    try {
      console.log('🚀 [APP] === INICIANDO APLICAÇÃO ===');
      console.log('🚀 [APP] Versão:', '1.0.0');
      console.log('🚀 [APP] Timestamp:', new Date().toISOString());
      
      // Configura tema
      console.log('🎨 [APP] Configurando tema...');
      const themeStart = performance.now();
      this.setupTheme();
      Utils.performance.recordLoadTime('setupTheme', performance.now() - themeStart);
      console.log('✅ [APP] Tema configurado');
      
      // Indica carregamento
      console.log('⏳ [APP] Preparando interface de carregamento...');
      const lastUpdate = Utils.qs('#lastUpdate');
      if (lastUpdate) {
        lastUpdate.textContent = 'Carregando…';
        console.log('✅ [APP] Indicador de carregamento definido');
      } else {
        console.warn('⚠️ [APP] Elemento #lastUpdate não encontrado');
      }
      
      // Limpa abas renderizadas
      console.log('🧹 [APP] Limpando cache de abas renderizadas...');
      DataStore.renderedTabs.clear();
      console.log('✅ [APP] Cache limpo');
      
      // Carrega dados
      console.log('📡 [APP] Iniciando carregamento de dados...');
      const dataStart = performance.now();
      await DataStore.loadAll();
      Utils.performance.recordLoadTime('loadData', performance.now() - dataStart);
      console.log('✅ [APP] Dados carregados com sucesso');
      
      // Renderiza interface
      console.log('🎨 [APP] Renderizando componentes...');
      const renderStart = performance.now();
      Components.renderHeader();
      console.log('✅ [APP] Header renderizado');
      
      Components.populateFilters();
      console.log('✅ [APP] Filtros populados');
      
      this.setupTabs();
      console.log('✅ [APP] Abas configuradas');
      
      this.setupEvents();
      console.log('✅ [APP] Eventos configurados');
      
      // Bind ordenacao
      Components.bindSorters();
      console.log('✅ [APP] Sistema de ordenação configurado');
      
      // Atualiza indicadores de ordenacao
      Components.updateSortIndicators('ranking');
      Components.updateSortIndicators('videos24');
      console.log('✅ [APP] Indicadores de ordenação atualizados');
      
      Utils.performance.recordLoadTime('renderInterface', performance.now() - renderStart);
      
      if (lastUpdate) {
        lastUpdate.textContent += ' · OK';
        console.log('✅ [APP] Indicador de status atualizado');
      } else {
        console.warn('⚠️ [APP] Elemento #lastUpdate não encontrado para atualização');
      }
      
      this.initialized = true;
      
      // Registra performance total
      const totalTime = performance.now() - startTime;
      Utils.performance.recordLoadTime('totalInitialization', totalTime);
      Utils.performance.recordMemoryUsage();
      
      console.log('🎉 [APP] === APLICAÇÃO INICIALIZADA COM SUCESSO ===');
      console.log('🎉 [APP] Tempo total de inicialização:', totalTime.toFixed(2), 'ms');
      
      // Configura limpeza periódica de performance
      setInterval(() => {
        Utils.performance.cleanup();
        Utils.performance.recordMemoryUsage();
      }, 5 * 60 * 1000); // A cada 5 minutos
      
    } catch (error) {
      Utils.performance.recordError(error, 'app.init');
      console.error('❌ Erro na inicializacao:', error);
      const lastUpdate = Utils.qs('#lastUpdate');
      if (lastUpdate) {
        lastUpdate.textContent = 'Falha ao carregar dados';
      } else {
        console.warn('⚠️ [APP] Elemento #lastUpdate não encontrado para exibir erro');
      }
      
      // Mensagem de erro mais específica
      let errorMessage = 'Falha ao carregar dados JSON.\n\n';
      errorMessage += 'Verifique se os seguintes arquivos estão na pasta data/:\n';
      errorMessage += '• current.json\n';
      errorMessage += '• history.json\n';
      errorMessage += '• metadata.json\n';
      errorMessage += '• rankings.json\n';
      errorMessage += '• channels_summary.json\n';
      errorMessage += '• videos_24h.json\n';
      errorMessage += '• videos_7d.json\n';
      errorMessage += '• videos_30d.json\n';
      errorMessage += '• trend_by_channel_7d.json\n';
      errorMessage += '• trend_by_channel_30d.json\n';
      errorMessage += '• benchmark_data.json\n';
      errorMessage += '• performance_predictions.json\n';
      errorMessage += '• period_comparisons.json\n';
      errorMessage += '• keyword_analysis.json\n\n';
      errorMessage += 'Erro detalhado: ' + error.message;
      
      alert(errorMessage);
    }
  },

  // Configuracao do tema
  setupTheme() {
    const savedTheme = Utils.storage.get('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  },

  // Configuracao das abas
  setupTabs() {
    const tabs = [
      { id: 'tab-dashboard', render: () => this.renderDashboard() },
      { id: 'tab-ranking24h', render: () => Components.renderRanking() },
      { id: 'tab-videos24h', render: () => Components.renderVideos24() },
      { id: 'tab-benchmark', render: () => this.renderBenchmark() },
      { id: 'tab-predictions', render: () => this.renderPredictions() },
      { id: 'tab-periods', render: () => this.renderPeriods() },
      { id: 'tab-keywords', render: () => this.renderKeywords() },
      { id: 'tab-admin', render: () => this.renderAdmin() }
    ];

    const tabButtons = Utils.qsa('[role="tab"]');
    const panels = Utils.qsa('.tab-content');

    // Funcao para renderizar aba se necessario
    const renderForTab = (id) => {
      if (DataStore.renderedTabs.has(id)) return;
      
      const tab = tabs.find(t => t.id === id);
      if (tab && tab.render) {
        console.log(`🎨 Renderizando aba: ${id}`);
        tab.render();
        DataStore.renderedTabs.add(id);
      }
    };

    // Funcao para ativar aba
    const setActiveTab = (id) => {
      this.currentTab = id;
      
      // Atualiza botoes
      tabButtons.forEach(btn => {
        const isActive = btn.getAttribute('aria-controls') === id;
        btn.setAttribute('aria-selected', String(isActive));
        btn.tabIndex = isActive ? 0 : -1;
      });

      // Atualiza paineis
      panels.forEach(p => {
        const active = (p.id === id);
        p.classList.toggle('active', active);
        p.setAttribute('aria-hidden', String(!active));
        p.tabIndex = active ? 0 : -1;
      });

      // Renderiza se necessario
      renderForTab(id);

      // Foca no heading da aba
      const heading = Utils.qsa(`#${id} h2, #${id} h3`)[0];
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    };

    // Eventos dos botoes das abas
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveTab(btn.getAttribute('aria-controls'));
      });

      btn.addEventListener('keydown', (e) => {
        // Apenas Enter e Espaço para acessibilidade
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveTab(btn.getAttribute('aria-controls'));
        }
      });
    });

    // Ativa a primeira aba
    setActiveTab('tab-dashboard');
  },

  // Configuracao dos eventos globais
  setupEvents() {
    // Tema
    Utils.on('#themeToggle', 'click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      Utils.storage.set('theme', isDark ? 'dark' : 'light');
    });

    // Refresh
    Utils.on('#refreshBtn', 'click', () => this.init());

    // Atalhos de teclado limitados (apenas quando não estiver em inputs)
    document.addEventListener('keydown', (e) => {
      // Verifica se o usuário está digitando em um input/textarea/select
      const isTyping = e.target.matches('input, textarea, select, [contenteditable="true"]');
      
      if (!isTyping) {
      if (e.key === 'R' && e.shiftKey) {
        e.preventDefault();
        this.init();
      }
        if ((e.key || '').toLowerCase() === 't') {
        e.preventDefault();
        Utils.qs('#themeToggle')?.click();
        }
      }
    });

    // Eventos de filtros
    Utils.on('#filterTag', 'change', () => Components.renderRanking());
    Utils.on('#searchInput', 'input', Utils.debounce(() => Components.renderRanking(), 200));
    Utils.on('#filterTagVideos', 'change', () => {
      Components.resetPagination('videos');
      Components.renderVideos24();
    });
    Utils.on('#searchVideoInput', 'input', Utils.debounce(() => {
      Components.resetPagination('videos');
      Components.renderVideos24();
    }, 200));
    Utils.on('#videoPeriodSelect', 'change', () => {
      Components.resetPagination('videos');
      Components.renderVideos24();
    });

    // Eventos de tendencias
    Utils.qsa('input[name="metricTrend"]').forEach(r => {
      r.addEventListener('change', e => Components.renderTrend(e.target.value));
    });
    Utils.on('#trendRange', 'change', () => {
      const checked = document.querySelector('input[name="metricTrend"]:checked');
      Components.renderTrend(checked ? checked.value : 'views');
    });

    // Evento de mudanca de periodo de participacao
    Utils.on('#sharePeriodSelect', 'change', () => Components.renderShare());
    
    

    // Evento para seletor de período de vídeos
    Utils.on('#videoPeriodSelect', 'change', () => {
      console.log('🎞️ [VIDEOS] Mudança de período');
      Components.renderVideos24();
    });

    // Evento para seletor de período de ranking
    Utils.on('#rankingPeriodSelect', 'change', () => {
      console.log('🏆 [RANKING] Mudança de período');
      Components.renderRanking();
    });

    // Sistema de sort já configurado via bindSorters()
  },



  // Renderizacao do dashboard principal
  renderDashboard() {
    console.log('🏠 [DASHBOARD] Renderizando dashboard principal...');
    Components.populateFilters();
    Components.renderKpis();
    Components.renderShare();
    Components.renderTrend('views');
    
    // Configuração da seção Tendência por Canal
    Components.populateChannelTrendDropdown();
    Components.renderChannelTrend(); // Mostra placeholder inicial
    this.setupChannelTrendListeners();
  },

  // Configura event listeners para tendência por canal
  setupChannelTrendListeners() {
    console.log('📊 [CHANNEL_TREND] Configurando event listeners...');
    
    // Listener para mudança de canal
    Utils.on('#channelTrendSelect', 'change', (e) => {
      const selectedChannel = e.target.value;
      console.log('📊 [CHANNEL_TREND] Canal selecionado:', selectedChannel);
      Components.renderChannelTrend(selectedChannel || null);
    });
    
    // Listeners para mudança de métrica
    Utils.qsa('input[name="channelMetricTrend"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const selectedChannel = Utils.qs('#channelTrendSelect')?.value;
        if (selectedChannel) {
          console.log('📊 [CHANNEL_TREND] Métrica alterada para:', e.target.value);
          Components.renderChannelTrend(selectedChannel);
        }
      });
    });
    
    // Listener para mudança de período
    Utils.on('#channelTrendRange', 'change', (e) => {
      const selectedChannel = Utils.qs('#channelTrendSelect')?.value;
      if (selectedChannel) {
        console.log('📊 [CHANNEL_TREND] Período alterado para:', e.target.value, 'dias');
        Components.renderChannelTrend(selectedChannel);
      }
    });
    
    console.log('✅ [CHANNEL_TREND] Event listeners configurados');
  },

  // Renderizacoes de abas



  renderBenchmark() {
    const content = Utils.qs('#benchmarkContent');
    if (!content) {
      console.warn('⚠️ [BENCHMARK] Elemento #benchmarkContent não encontrado - página pode não ter benchmark');
      return;
    }

    // Sanitiza o HTML antes de inserir
    const sanitizedHtml = Utils.string.sanitizeHtml(`
      <div class="space-y-8">
        <!-- Comparação de Canais -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 class="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">🔍 Comparação de Canais</h3>
          <p class="text-blue-600 dark:text-blue-300 mb-4">Compare o desempenho de até três canais simultaneamente</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label for="channel1Select" class="block text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">Canal 1</label>
              <select id="channel1Select" class="w-full p-3 border border-blue-300 rounded-xl bg-white dark:bg-zinc-800 dark:border-blue-600">
                <option value="">Selecione um canal...</option>
              </select>
            </div>
            <div>
              <label for="channel2Select" class="block text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">Canal 2</label>
              <select id="channel2Select" class="w-full p-3 border border-blue-300 rounded-xl bg-white dark:bg-zinc-800 dark:border-blue-600">
                <option value="">Selecione um canal...</option>
              </select>
            </div>
            <div>
              <label for="channel3Select" class="block text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">Canal 3</label>
              <select id="channel3Select" class="w-full p-3 border border-blue-300 rounded-xl bg-white dark:bg-zinc-800 dark:border-blue-600">
                <option value="">Selecione um canal...</option>
              </select>
            </div>
          </div>
          
          <div class="text-center">
            <button id="compareChannelsBtn" class="btn bg-blue-600 hover:bg-blue-700" disabled>
              Comparar Canais
            </button>
          </div>
        </div>

        <!-- Comparação de Grupos -->
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h3 class="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">🏷️ Comparação de Grupos</h3>
          <p class="text-green-600 dark:text-green-300 mb-4">Compare o desempenho de até três grupos simultaneamente</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label for="group1Select" class="block text-sm font-medium mb-2 text-green-700 dark:text-green-300">Grupo 1</label>
              <select id="group1Select" class="w-full p-3 border border-green-300 rounded-xl bg-white dark:bg-zinc-800 dark:border-green-600">
                <option value="">Selecione um grupo...</option>
              </select>
            </div>
            <div>
              <label for="group2Select" class="block text-sm font-medium mb-2 text-green-700 dark:text-green-300">Grupo 2</label>
              <select id="group2Select" class="w-full p-3 border border-green-300 rounded-xl bg-white dark:bg-zinc-800 dark:border-green-600">
                <option value="">Selecione um grupo...</option>
              </select>
            </div>
            <div>
              <label for="group3Select" class="block text-sm font-medium mb-2 text-green-700 dark:text-green-300">Grupo 3</label>
              <select id="group3Select" class="w-full p-3 border border-green-300 rounded-xl bg-white dark:bg-zinc-800 dark:border-green-600">
                <option value="">Selecione um grupo...</option>
              </select>
            </div>
          </div>
          
          <div class="text-center">
            <button id="compareGroupsBtn" class="btn bg-green-600 hover:bg-green-700" disabled>
              Comparar Grupos
            </button>
          </div>
        </div>
        
        <div id="benchmarkResults" class="hidden"></div>
      </div>
    `);
    
    content.innerHTML = sanitizedHtml;
    
    // Popula os dropdowns com canais
    console.log('📊 [BENCHMARK] Coletando canais do DataStore...');
    console.log('📊 [BENCHMARK] DataStore.current length:', DataStore.current.length);
    
    const channels = new Set();
    DataStore.current.forEach(c => {
      if (c.channel_name) {
        channels.add(c.channel_name);
        console.log('📺 [BENCHMARK] Canal adicionado:', c.channel_name);
      }
    });
    
    const sortedChannels = Array.from(channels).sort();
    console.log(`📊 [BENCHMARK] Total de ${sortedChannels.length} canais únicos encontrados`);
    
    const options = ['<option value="">Selecione um canal...</option>'];
    sortedChannels.forEach(channel => {
      options.push(`<option value="${channel}">${Utils.cleanText(channel)}</option>`);
    });
    
    const optionsHtml = options.join('');
    const select1 = Utils.qs('#channel1Select');
    const select2 = Utils.qs('#channel2Select');
    const select3 = Utils.qs('#channel3Select');
    
    if (select1 && select2 && select3) {
      select1.innerHTML = optionsHtml;
      select2.innerHTML = optionsHtml;
      select3.innerHTML = optionsHtml;
      console.log('✅ [BENCHMARK] Dropdowns populados com sucesso');
    } else {
      console.error('❌ [BENCHMARK] Elementos select não encontrados:', { select1: !!select1, select2: !!select2, select3: !!select3 });
    }
    
    // Eventos com logs detalhados
    console.log('🔧 [BENCHMARK] Configurando event listeners...');
    const channel1 = Utils.qs('#channel1Select');
    const channel2 = Utils.qs('#channel2Select');
    const channel3 = Utils.qs('#channel3Select');
    const compareChannelsBtn = Utils.qs('#compareChannelsBtn');
    const compareGroupsBtn = Utils.qs('#compareGroupsBtn');
    
    console.log('🔧 [BENCHMARK] Elementos encontrados:', { 
      channel1: !!channel1, 
      channel2: !!channel2, 
      channel3: !!channel3, 
      compareChannelsBtn: !!compareChannelsBtn, 
      compareGroupsBtn: !!compareGroupsBtn 
    });
    
    const updateButton = () => {
      const val1 = channel1?.value || '';
      const val2 = channel2?.value || '';
      const val3 = channel3?.value || '';
      const shouldDisable = !val1 || !val2 || !val3 || val1 === val2 || val1 === val3 || val2 === val3;
      
      if (compareChannelsBtn) {
        compareChannelsBtn.disabled = shouldDisable;
        console.log('🔧 [BENCHMARK] Botão de canais atualizado:', { 
          canal1: val1, 
          canal2: val2, 
          canal3: val3, 
          disabled: shouldDisable,
          buttonElement: !!compareChannelsBtn 
        });
      }
    };
    
    if (channel1 && channel2 && channel3 && compareChannelsBtn) {
      console.log('✅ [BENCHMARK] Adicionando event listeners...');
      
      channel1.addEventListener('change', (e) => {
        console.log('🔧 [BENCHMARK] Canal 1 alterado:', e.target.value);
        updateButton();
      });
      
      channel2.addEventListener('change', (e) => {
        console.log('🔧 [BENCHMARK] Canal 2 alterado:', e.target.value);
        updateButton();
      });
      
      channel3.addEventListener('change', (e) => {
        console.log('🔧 [BENCHMARK] Canal 3 alterado:', e.target.value);
        updateButton();
      });
      
      compareChannelsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🚀 [BENCHMARK] Botão de comparação clicado!');
        console.log('🚀 [BENCHMARK] Valores atuais:', { 
          canal1: channel1.value, 
          canal2: channel2.value, 
          canal3: channel3.value,
          disabled: compareChannelsBtn.disabled,
          event: e 
        });
        
        if (!compareChannelsBtn.disabled && channel1.value && channel2.value && channel3.value) {
          console.log('✅ [BENCHMARK] Executando comparação...');
          try {
            this.compareBenchmarkChannels(channel1.value, channel2.value, channel3.value);
          } catch (error) {
            console.error('❌ [BENCHMARK] Erro na comparação:', error);
          }
        } else {
          console.warn('⚠️ [BENCHMARK] Botão está desabilitado ou valores inválidos');
          console.warn('⚠️ [BENCHMARK] Debug:', {
            disabled: compareChannelsBtn.disabled,
            canal1: channel1.value,
            canal2: channel2.value,
            canal3: channel3.value
          });
        }
      });
      
      console.log('✅ [BENCHMARK] Event listeners configurados com sucesso');
      updateButton(); // Chamada inicial para definir estado do botão
    } else {
      console.error('❌ [BENCHMARK] Falha ao configurar event listeners - elementos não encontrados');
    }

    // Configuração para comparação de grupos
    console.log('🏷️ [GROUPS] Configurando comparação de grupos...');
    const groups = new Set();
    DataStore.current.forEach(c => {
      if (c.tag) {
        groups.add(c.tag);
      }
    });

    const sortedGroups = Array.from(groups).sort();
    console.log(`🏷️ [GROUPS] Total de ${sortedGroups.length} grupos únicos encontrados`);

    const groupOptions = ['<option value="">Selecione um grupo...</option>'];
    sortedGroups.forEach(group => {
      groupOptions.push(`<option value="${group}">${Utils.cleanText(group)}</option>`);
    });

    const groupOptionsHtml = groupOptions.join('');
    const group1Select = Utils.qs('#group1Select');
    const group2Select = Utils.qs('#group2Select');
    const group3Select = Utils.qs('#group3Select');

    if (group1Select && group2Select && group3Select && compareGroupsBtn) {
      group1Select.innerHTML = groupOptionsHtml;
      group2Select.innerHTML = groupOptionsHtml;
      group3Select.innerHTML = groupOptionsHtml;
      console.log('✅ [GROUPS] Dropdowns de grupos populados com sucesso');

      const updateGroupButton = () => {
        const val1 = group1Select.value || '';
        const val2 = group2Select.value || '';
        const val3 = group3Select.value || '';
        const shouldDisable = !val1 || !val2 || !val3 || val1 === val2 || val1 === val3 || val2 === val3;
        compareGroupsBtn.disabled = shouldDisable;
        console.log('🏷️ [GROUPS] Estado do botão atualizado:', { val1, val2, val3, disabled: shouldDisable });
      };

      group1Select.addEventListener('change', () => {
        console.log('🏷️ [GROUPS] Grupo 1 alterado:', group1Select.value);
        updateGroupButton();
      });

      group2Select.addEventListener('change', () => {
        console.log('🏷️ [GROUPS] Grupo 2 alterado:', group2Select.value);
        updateGroupButton();
      });

      group3Select.addEventListener('change', () => {
        console.log('🏷️ [GROUPS] Grupo 3 alterado:', group3Select.value);
        updateGroupButton();
      });

      compareGroupsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!compareGroupsBtn.disabled && group1Select.value && group2Select.value && group3Select.value) {
          console.log('✅ [GROUPS] Executando comparação de grupos...');
          this.compareBenchmarkGroups(group1Select.value, group2Select.value, group3Select.value);
        }
      });

      updateGroupButton(); // Estado inicial
      console.log('✅ [GROUPS] Event listeners de grupos configurados');
    } else {
      console.error('❌ [GROUPS] Elementos de grupos não encontrados');
    }
  },

  // Compara dois canais específicos
  compareBenchmarkChannels(channel1Name, channel2Name, channel3Name) {
    console.log('📊 [COMPARISON] Iniciando comparação entre canais...');
    console.log('📊 [COMPARISON] Parâmetros recebidos:', { channel1Name, channel2Name, channel3Name });
    
    const resultsDiv = Utils.qs('#benchmarkResults');
    if (!resultsDiv) {
      console.error('❌ [COMPARISON] Elemento #benchmarkResults não encontrado');
      return;
    }
    console.log('✅ [COMPARISON] Elemento resultsDiv encontrado');
    
    // Busca dados dos canais
    console.log('🔍 [COMPARISON] Buscando dados dos canais no DataStore...');
    console.log('🔍 [COMPARISON] DataStore.current tem', DataStore.current.length, 'registros');
    
    const channel1Data = DataStore.current.find(c => c.channel_name === channel1Name);
    const channel2Data = DataStore.current.find(c => c.channel_name === channel2Name);
    const channel3Data = DataStore.current.find(c => c.channel_name === channel3Name);
    
    console.log('🔍 [COMPARISON] Dados encontrados:', { 
      channel1Data: !!channel1Data, 
      channel2Data: !!channel2Data, 
      channel3Data: !!channel3Data 
    });
    
    if (channel1Data) {
      console.log('📺 [COMPARISON] Canal 1 dados:', { 
        name: channel1Data.channel_name,
        subscribers: channel1Data.subscriber_count,
        views24h: channel1Data.views_24h 
      });
    }
    
    if (channel2Data) {
      console.log('📺 [COMPARISON] Canal 2 dados:', { 
        name: channel2Data.channel_name,
        subscribers: channel2Data.subscriber_count,
        views24h: channel2Data.views_24h 
      });
    }
    
    if (channel3Data) {
      console.log('📺 [COMPARISON] Canal 3 dados:', { 
        name: channel3Data.channel_name,
        subscribers: channel3Data.subscriber_count,
        views24h: channel3Data.views_24h 
      });
    }
    
    if (!channel1Data || !channel2Data || !channel3Data) {
      console.error('❌ [COMPARISON] Dados não encontrados para um ou ambos os canais');
      resultsDiv.innerHTML = `
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          ❌ Dados não encontrados para um ou ambos os canais selecionados.
          <div class="text-sm mt-2 opacity-75">
            ${channel1Name}: ${channel1Data ? '✅ Encontrado' : '❌ Não encontrado'}<br>
            ${channel2Name}: ${channel2Data ? '✅ Encontrado' : '❌ Não encontrado'}<br>
            ${channel3Name}: ${channel3Data ? '✅ Encontrado' : '❌ Não encontrado'}
          </div>
        </div>
      `;
      resultsDiv.classList.remove('hidden');
      return;
    }
    
    // Calcula métricas comparativas
    const metrics = [
      {
        name: 'Inscritos',
        ch1: channel1Data.subscriber_count || 0,
        ch2: channel2Data.subscriber_count || 0,
        ch3: channel3Data.subscriber_count || 0,
        formatter: (v) => Utils.formatCompact(v)
      },
      {
        name: 'Vídeos (24h)',
        ch1: channel1Data.videos_24h || 0,
        ch2: channel2Data.videos_24h || 0,
        ch3: channel3Data.videos_24h || 0,
        formatter: (v) => Utils.formatNumber(v)
      },
      {
        name: 'Views (24h)',
        ch1: channel1Data.views_24h || 0,
        ch2: channel2Data.views_24h || 0,
        ch3: channel3Data.views_24h || 0,
        formatter: (v) => Utils.formatCompact(v)
      },
      {
        name: 'Likes (24h)',
        ch1: channel1Data.likes_24h || 0,
        ch2: channel2Data.likes_24h || 0,
        ch3: channel3Data.likes_24h || 0,
        formatter: (v) => Utils.formatCompact(v)
      },
      {
        name: 'Comentários (24h)',
        ch1: channel1Data.comments_24h || 0,
        ch2: channel2Data.comments_24h || 0,
        ch3: channel3Data.comments_24h || 0,
        formatter: (v) => Utils.formatCompact(v)
      },
      {
        name: 'Engajamento (24h)',
        ch1: ((channel1Data.likes_24h || 0) + (channel1Data.comments_24h || 0)) / Math.max(1, channel1Data.views_24h || 0) * 100,
        ch2: ((channel2Data.likes_24h || 0) + (channel2Data.comments_24h || 0)) / Math.max(1, channel2Data.views_24h || 0) * 100,
        ch3: ((channel3Data.likes_24h || 0) + (channel3Data.comments_24h || 0)) / Math.max(1, channel3Data.views_24h || 0) * 100,
        formatter: (v) => Utils.formatPercentage(v, 2)
      }
    ];
    
    // Calcula métricas de 7 dias se dados disponíveis
    if (DataStore.trendByChannel7 && DataStore.trendByChannel7.length > 0) {
      const channel1Data7d = this.calculateChannelMetrics7d(channel1Name);
      const channel2Data7d = this.calculateChannelMetrics7d(channel2Name);
      const channel3Data7d = this.calculateChannelMetrics7d(channel3Name);

      metrics.push(
        {
          name: 'Vídeos (7d)',
          ch1: channel1Data7d.videos || 0,
          ch2: channel2Data7d.videos || 0,
          ch3: channel3Data7d.videos || 0,
          formatter: (v) => Utils.formatNumber(v)
        },
        {
          name: 'Views (7d)',
          ch1: channel1Data7d.views || 0,
          ch2: channel2Data7d.views || 0,
          ch3: channel3Data7d.views || 0,
          formatter: (v) => Utils.formatCompact(v)
        },
        {
          name: 'Likes (7d)',
          ch1: channel1Data7d.likes || 0,
          ch2: channel2Data7d.likes || 0,
          ch3: channel3Data7d.likes || 0,
          formatter: (v) => Utils.formatCompact(v)
        },
        {
          name: 'Comentários (7d)',
          ch1: channel1Data7d.comments || 0,
          ch2: channel2Data7d.comments || 0,
          ch3: channel3Data7d.comments || 0,
          formatter: (v) => Utils.formatCompact(v)
        },
        {
          name: 'Engajamento (7d)',
          ch1: channel1Data7d.engagement || 0,
          ch2: channel2Data7d.engagement || 0,
          ch3: channel3Data7d.engagement || 0,
          formatter: (v) => Utils.formatPercentage(v, 2)
        }
      );
    }

    // Calcula métricas de 30 dias se dados disponíveis
    if (DataStore.trendByChannel30 && DataStore.trendByChannel30.length > 0) {
      const channel1Data30d = this.calculateChannelMetrics30d(channel1Name);
      const channel2Data30d = this.calculateChannelMetrics30d(channel2Name);
      const channel3Data30d = this.calculateChannelMetrics30d(channel3Name);

      metrics.push(
        {
          name: 'Vídeos (30d)',
          ch1: channel1Data30d.videos || 0,
          ch2: channel2Data30d.videos || 0,
          ch3: channel3Data30d.videos || 0,
          formatter: (v) => Utils.formatNumber(v)
        },
        {
          name: 'Views (30d)',
          ch1: channel1Data30d.views || 0,
          ch2: channel2Data30d.views || 0,
          ch3: channel3Data30d.views || 0,
          formatter: (v) => Utils.formatCompact(v)
        },
        {
          name: 'Likes (30d)',
          ch1: channel1Data30d.likes || 0,
          ch2: channel2Data30d.likes || 0,
          ch3: channel3Data30d.likes || 0,
          formatter: (v) => Utils.formatCompact(v)
        },
        {
          name: 'Comentários (30d)',
          ch1: channel1Data30d.comments || 0,
          ch2: channel2Data30d.comments || 0,
          ch3: channel3Data30d.comments || 0,
          formatter: (v) => Utils.formatCompact(v)
        },
        {
          name: 'Engajamento (30d)',
          ch1: channel1Data30d.engagement || 0,
          ch2: channel2Data30d.engagement || 0,
          ch3: channel3Data30d.engagement || 0,
          formatter: (v) => Utils.formatPercentage(v, 2)
        }
      );
    }
    
    let html = `
      <div class="bg-white dark:bg-zinc-800 border rounded-xl p-6">
        <h4 class="text-lg font-semibold mb-4">📊 Comparação: ${Utils.cleanText(channel1Name)} vs ${Utils.cleanText(channel2Name)} vs ${Utils.cleanText(channel3Name)}</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Canal 1 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-blue-600 dark:text-blue-400">${Utils.cleanText(channel1Name)}</h5>
              <span class="chip bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">${channel1Data.tag || 'Sem tag'}</span>
          </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.ch1)}</span>
          </div>
              `).join('')}
            </div>
          </div>

          <!-- Canal 2 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-green-600 dark:text-green-400">${Utils.cleanText(channel2Name)}</h5>
              <span class="chip bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">${channel2Data.tag || 'Sem tag'}</span>
            </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.ch2)}</span>
          </div>
              `).join('')}
            </div>
          </div>

          <!-- Canal 3 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-purple-600 dark:text-purple-400">${Utils.cleanText(channel3Name)}</h5>
              <span class="chip bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100">${channel3Data.tag || 'Sem tag'}</span>
            </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.ch3)}</span>
          </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Comparação direta -->
        <div class="mt-6 border-t pt-4">
          <h6 class="font-medium mb-3">🏆 Vencedor por Categoria:</h6>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            ${metrics.map(m => {
              const winner = m.ch1 > m.ch2 ? m.ch1 > m.ch3 ? channel1Name : m.ch3 > m.ch1 ? channel3Name : 'Empate' : m.ch2 > m.ch3 ? channel2Name : m.ch3 > m.ch2 ? channel3Name : 'Empate';
              const winnerColor = m.ch1 > m.ch2 ? m.ch1 > m.ch3 ? 'text-blue-600' : m.ch3 > m.ch1 ? 'text-purple-600' : 'text-gray-600' : m.ch2 > m.ch3 ? 'text-green-600' : m.ch3 > m.ch2 ? 'text-purple-600' : 'text-gray-600';
              return `
                <div class="flex justify-between">
                  <span>${m.name}:</span>
                  <span class="font-medium ${winnerColor}">${winner}</span>
            </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    console.log('📊 [COMPARISON] Renderizando resultados...');
    resultsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
    console.log('✅ [COMPARISON] Resultados renderizados com sucesso');
    
    // Scroll suave para os resultados
    console.log('📜 [COMPARISON] Fazendo scroll para os resultados...');
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log('✅ [COMPARISON] Comparação concluída com sucesso!');
  },

  // Compara dois grupos específicos
  compareBenchmarkGroups(group1Name, group2Name, group3Name) {
    console.log('🏷️ [GROUP_COMPARISON] Iniciando comparação entre grupos...');
    console.log('🏷️ [GROUP_COMPARISON] Parâmetros recebidos:', { group1Name, group2Name, group3Name });
    
    const resultsDiv = Utils.qs('#benchmarkResults');
    if (!resultsDiv) {
      console.error('❌ [GROUP_COMPARISON] Elemento #benchmarkResults não encontrado');
      return;
    }
    
    // Coleta dados agregados por grupo
    const group1Channels = DataStore.current.filter(c => c.tag === group1Name);
    const group2Channels = DataStore.current.filter(c => c.tag === group2Name);
    const group3Channels = DataStore.current.filter(c => c.tag === group3Name);
    
    console.log('🏷️ [GROUP_COMPARISON] Canais encontrados:', {
      group1: group1Channels.length,
      group2: group2Channels.length,
      group3: group3Channels.length
    });
    
    if (group1Channels.length === 0 || group2Channels.length === 0 || group3Channels.length === 0) {
      resultsDiv.innerHTML = `
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div class="text-red-800 dark:text-red-200">
            ❌ Erro: Um ou ambos os grupos não possuem canais.
            <br>Grupo 1 (${group1Name}): ${group1Channels.length} canais
            <br>Grupo 2 (${group2Name}): ${group2Channels.length} canais
            <br>Grupo 3 (${group3Name}): ${group3Channels.length} canais
          </div>
        </div>
      `;
      resultsDiv.classList.remove('hidden');
      return;
    }
    
    // Calcula métricas agregadas para cada grupo
    const calculateGroupMetrics = (channels, groupName) => {
      const totalChannels = channels.length;
      const totalSubscribers = channels.reduce((sum, c) => sum + (c.subscriber_count || 0), 0);
      const totalViews24h = channels.reduce((sum, c) => sum + (c.views_24h || 0), 0);
      const totalLikes24h = channels.reduce((sum, c) => sum + (c.likes_24h || 0), 0);
      const totalComments24h = channels.reduce((sum, c) => sum + (c.comments_24h || 0), 0);
      const totalVideos24h = channels.reduce((sum, c) => sum + (c.videos_24h || 0), 0);
      
      const avgSubscribers = totalSubscribers / totalChannels;
      const avgViews24h = totalViews24h / totalChannels;
      const avgLikes24h = totalLikes24h / totalChannels;
      const avgComments24h = totalComments24h / totalChannels;
      const avgVideos24h = totalVideos24h / totalChannels;
      
      const engagementRate = totalViews24h > 0 ? 
        ((totalLikes24h + totalComments24h) / totalViews24h) * 100 : 0;
      
      return {
        groupName,
        totalChannels,
        totalSubscribers,
        totalViews24h,
        totalLikes24h,
        totalComments24h,
        totalVideos24h,
        avgSubscribers,
        avgViews24h,
        avgLikes24h,
        avgComments24h,
        avgVideos24h,
        engagementRate
      };
    };
    
    const group1Metrics = calculateGroupMetrics(group1Channels, group1Name);
    const group2Metrics = calculateGroupMetrics(group2Channels, group2Name);
    const group3Metrics = calculateGroupMetrics(group3Channels, group3Name);
    
    // Prepara dados para exibição
    const metrics = [
      { name: 'Total de Canais', g1: group1Metrics.totalChannels, g2: group2Metrics.totalChannels, g3: group3Metrics.totalChannels, formatter: (v) => Utils.formatNumber(v) },
      { name: 'Total de Inscritos', g1: group1Metrics.totalSubscribers, g2: group2Metrics.totalSubscribers, g3: group3Metrics.totalSubscribers, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Total Views (24h)', g1: group1Metrics.totalViews24h, g2: group2Metrics.totalViews24h, g3: group3Metrics.totalViews24h, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Total Likes (24h)', g1: group1Metrics.totalLikes24h, g2: group2Metrics.totalLikes24h, g3: group3Metrics.totalLikes24h, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Total Comentários (24h)', g1: group1Metrics.totalComments24h, g2: group2Metrics.totalComments24h, g3: group3Metrics.totalComments24h, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Total Vídeos (24h)', g1: group1Metrics.totalVideos24h, g2: group2Metrics.totalVideos24h, g3: group3Metrics.totalVideos24h, formatter: (v) => Utils.formatNumber(v) },
      { name: 'Média Inscritos/Canal', g1: group1Metrics.avgSubscribers, g2: group2Metrics.avgSubscribers, g3: group3Metrics.avgSubscribers, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Média Views/Canal (24h)', g1: group1Metrics.avgViews24h, g2: group2Metrics.avgViews24h, g3: group3Metrics.avgViews24h, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Taxa de Engajamento (24h)', g1: group1Metrics.engagementRate, g2: group2Metrics.engagementRate, g3: group3Metrics.engagementRate, formatter: (v) => v.toFixed(2) + '%' }
    ];

    // Adiciona métricas de 7 dias se dados disponíveis
    if (DataStore.trendByChannel7 && DataStore.trendByChannel7.length > 0) {
      const group1Metrics7d = this.calculateGroupMetrics7d(group1Name);
      const group2Metrics7d = this.calculateGroupMetrics7d(group2Name);
      const group3Metrics7d = this.calculateGroupMetrics7d(group3Name);

      metrics.push(
        { name: 'Total Views (7d)', g1: group1Metrics7d.totalViews, g2: group2Metrics7d.totalViews, g3: group3Metrics7d.totalViews, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Likes (7d)', g1: group1Metrics7d.totalLikes, g2: group2Metrics7d.totalLikes, g3: group3Metrics7d.totalLikes, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Comentários (7d)', g1: group1Metrics7d.totalComments, g2: group2Metrics7d.totalComments, g3: group3Metrics7d.totalComments, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Vídeos (7d)', g1: group1Metrics7d.totalVideos, g2: group2Metrics7d.totalVideos, g3: group3Metrics7d.totalVideos, formatter: (v) => Utils.formatNumber(v) },
        { name: 'Média Views/Canal (7d)', g1: group1Metrics7d.avgViews, g2: group2Metrics7d.avgViews, g3: group3Metrics7d.avgViews, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Taxa de Engajamento (7d)', g1: group1Metrics7d.engagementRate, g2: group2Metrics7d.engagementRate, g3: group3Metrics7d.engagementRate, formatter: (v) => v.toFixed(2) + '%' }
      );
    }

    // Adiciona métricas de 30 dias se dados disponíveis
    if (DataStore.trendByChannel30 && DataStore.trendByChannel30.length > 0) {
      const group1Metrics30d = this.calculateGroupMetrics30d(group1Name);
      const group2Metrics30d = this.calculateGroupMetrics30d(group2Name);
      const group3Metrics30d = this.calculateGroupMetrics30d(group3Name);

      metrics.push(
        { name: 'Total Views (30d)', g1: group1Metrics30d.totalViews, g2: group2Metrics30d.totalViews, g3: group3Metrics30d.totalViews, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Likes (30d)', g1: group1Metrics30d.totalLikes, g2: group2Metrics30d.totalLikes, g3: group3Metrics30d.totalLikes, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Comentários (30d)', g1: group1Metrics30d.totalComments, g2: group2Metrics30d.totalComments, g3: group3Metrics30d.totalComments, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Vídeos (30d)', g1: group1Metrics30d.totalVideos, g2: group2Metrics30d.totalVideos, g3: group3Metrics30d.totalVideos, formatter: (v) => Utils.formatNumber(v) },
        { name: 'Média Views/Canal (30d)', g1: group1Metrics30d.avgViews, g2: group2Metrics30d.avgViews, g3: group3Metrics30d.avgViews, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Taxa de Engajamento (30d)', g1: group1Metrics30d.engagementRate, g2: group2Metrics30d.engagementRate, g3: group3Metrics30d.engagementRate, formatter: (v) => v.toFixed(2) + '%' }
      );
    }
    
    let html = `
      <div class="bg-white dark:bg-zinc-800 border rounded-xl p-6">
        <h4 class="text-lg font-semibold mb-4">🏷️ Comparação de Grupos: ${Utils.cleanText(group1Name)} vs ${Utils.cleanText(group2Name)} vs ${Utils.cleanText(group3Name)}</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Grupo 1 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-blue-600 dark:text-blue-400">${Utils.cleanText(group1Name)}</h5>
              <span class="chip bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">${group1Metrics.totalChannels} canais</span>
            </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.g1)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Grupo 2 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-green-600 dark:text-green-400">${Utils.cleanText(group2Name)}</h5>
              <span class="chip bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">${group2Metrics.totalChannels} canais</span>
            </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.g2)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Grupo 3 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-purple-600 dark:text-purple-400">${Utils.cleanText(group3Name)}</h5>
              <span class="chip bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100">${group3Metrics.totalChannels} canais</span>
            </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.g3)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Comparação direta -->
        <div class="mt-6 border-t pt-4">
          <h6 class="font-medium mb-3">🏆 Vencedor por Categoria:</h6>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            ${metrics.map(m => {
              const winner = m.g1 > m.g2 ? m.g1 > m.g3 ? group1Name : m.g3 > m.g1 ? group3Name : 'Empate' : m.g2 > m.g3 ? group2Name : m.g3 > m.g2 ? group3Name : 'Empate';
              const winnerColor = m.g1 > m.g2 ? m.g1 > m.g3 ? 'text-blue-600' : m.g3 > m.g1 ? 'text-purple-600' : 'text-gray-600' : m.g2 > m.g3 ? 'text-green-600' : m.g3 > m.g2 ? 'text-purple-600' : 'text-gray-600';
              return `
                <div class="flex justify-between">
                  <span>${m.name}:</span>
                  <span class="font-medium ${winnerColor}">${winner}</span>
            </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Top canais de cada grupo -->
        <div class="mt-6 border-t pt-4">
          <h6 class="font-medium mb-3">🌟 Top 3 Canais de Cada Grupo (por Views 24h):</h6>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h7 class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 block">${group1Name}:</h7>
              ${group1Channels
                .sort((a, b) => (b.views_24h || 0) - (a.views_24h || 0))
                .slice(0, 3)
                .map((c, i) => `
                  <div class="text-xs flex justify-between py-1">
                    <span>${i + 1}. ${Utils.cleanText(c.channel_name)}</span>
                    <span class="font-medium">${Utils.formatCompact(c.views_24h || 0)}</span>
                  </div>
                `).join('')}
            </div>
            <div>
              <h7 class="text-sm font-medium text-green-600 dark:text-green-400 mb-2 block">${group2Name}:</h7>
              ${group2Channels
                .sort((a, b) => (b.views_24h || 0) - (a.views_24h || 0))
                .slice(0, 3)
                .map((c, i) => `
                  <div class="text-xs flex justify-between py-1">
                    <span>${i + 1}. ${Utils.cleanText(c.channel_name)}</span>
                    <span class="font-medium">${Utils.formatCompact(c.views_24h || 0)}</span>
                  </div>
                `).join('')}
            </div>
            <div>
              <h7 class="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2 block">${group3Name}:</h7>
              ${group3Channels
                .sort((a, b) => (b.views_24h || 0) - (a.views_24h || 0))
                .slice(0, 3)
                .map((c, i) => `
                  <div class="text-xs flex justify-between py-1">
                    <span>${i + 1}. ${Utils.cleanText(c.channel_name)}</span>
                    <span class="font-medium">${Utils.formatCompact(c.views_24h || 0)}</span>
                  </div>
                `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    resultsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
    console.log('✅ [GROUP_COMPARISON] Resultados renderizados com sucesso');
    
    // Scroll suave para os resultados
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log('✅ [GROUP_COMPARISON] Comparação de grupos concluída!');
  },

  renderPredictions() {
    const content = Utils.qs('#predictionsContent');
    if (!content) return;
    
    const predictions = DataStore.performancePredictions?.predictions || [];
    
    if (predictions.length === 0) {
      content.innerHTML = '<div class="text-center text-zinc-500 py-8">Dados de predições não encontrados</div>';
      return;
    }

    // Calcular KPIs
    const highConfidence = predictions.filter(p => (p.confidence_score || 0) > 0.8).length;
    const highPerformance = predictions.filter(p => (p.performance_ratio || 0) > 1.0).length;
    const lowPerformance = predictions.filter(p => (p.performance_ratio || 0) < 0.8).length;
    const avgPerformance = predictions.reduce((sum, p) => sum + (p.performance_ratio || 0), 0) / predictions.length;
    
    // Atualizar KPIs
    const updateKPI = (id, value) => {
      const el = Utils.qs(id);
      if (el) el.textContent = value;
    };
    
    updateKPI('#highConfidencePredictions', Utils.formatNumber(highConfidence));
    updateKPI('#highPerformancePredictions', Utils.formatNumber(highPerformance));
    updateKPI('#lowPerformancePredictions', Utils.formatNumber(lowPerformance));
    updateKPI('#avgPerformanceRatio', avgPerformance.toFixed(2) + 'x');
    
    let html = `
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr class="text-xs">
              <th class="th sort-header cursor-pointer" data-key="channel_name" data-type="predictions">
                Canal <span class="sort-indicator"></span>
              </th>
              <th class="th">Grupo</th>
              <th class="th text-right sort-header cursor-pointer" data-key="daily_avg_views" data-type="predictions">
                Media Diaria <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="historical_avg_views" data-type="predictions">
                Media Historica <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="performance_ratio" data-type="predictions">
                Razao <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="performance_category" data-type="predictions">
                Categoria <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="confidence_score" data-type="predictions">
                Confianca <span class="sort-indicator"></span>
              </th>
            </tr>
          </thead>
          <tbody id="predictionsBody">
    `;
    
    html += '</tbody></table></div>';
    content.innerHTML = html;
    
    // Renderiza os dados com ordenação
    this.renderPredictionsData();
    
    // Configura eventos de ordenação
    Components.bindSorters();
  },

  // Renderiza dados das predições com ordenação
  renderPredictionsData() {
    const body = Utils.qs('#predictionsBody');
    if (!body) return;
    body.innerHTML = '';
    
    let data = (DataStore.performancePredictions?.predictions || []).slice();
    
    // Aplica ordenação
    const st = Components.sortState.predictions || { key: 'confidence_score', dir: 'desc' };
    data.sort((a, b) => Components.cmp(Components.getVal('predictions', st.key, a), Components.getVal('predictions', st.key, b), st.dir));
    
    const frag = document.createDocumentFragment();
    data.slice(0, 50).forEach(pred => {
      const categoryColors = {
        'above_average': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        'below_average': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
        'average': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      };
      const categoryColor = categoryColors[pred.performance_category] || 'bg-gray-100 text-gray-800';
      
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70';
      tr.innerHTML = `
        <td class="td font-medium">${Utils.cleanText(pred.channel_name)}</td>
        <td class="td"><span class="chip bg-zinc-100 dark:bg-zinc-900">${pred.tag || ''}</span></td>
        <td class="td text-right">${Utils.formatCompact(pred.daily_avg_views || 0)}</td>
        <td class="td text-right">${Utils.formatCompact(pred.historical_avg_views || 0)}</td>
        <td class="td text-right">${(pred.performance_ratio || 0).toFixed(2)}x</td>
        <td class="td text-right"><span class="chip ${categoryColor}">${(pred.performance_category || '').replace('_', ' ')}</span></td>
        <td class="td text-right">${Utils.formatPercentage(pred.confidence_score || 0, 1)}</td>
      `;
      frag.appendChild(tr);
    });
    body.appendChild(frag);
    
    Components.updateSortIndicators('predictions');
  },

  renderPeriods() {
    const content = Utils.qs('#periodsContent');
    if (!content) return;
    
    const periodData = DataStore.periodComparisons?.channels || [];
    
    if (periodData.length === 0) {
      content.innerHTML = '<div class="text-center text-zinc-500 py-8">Dados de comparação de períodos não encontrados</div>';
      return;
    }
    
    // Calcular KPIs
    const growthChannels = periodData.filter(p => (p.changes?.views_change || 0) > 10).length;
    const declineChannels = periodData.filter(p => (p.changes?.views_change || 0) < -10).length;
    const stableChannels = periodData.filter(p => Math.abs(p.changes?.views_change || 0) <= 10).length;
    const topGrowth = periodData.reduce((max, p) => 
      (p.changes?.views_change || 0) > max ? (p.changes?.views_change || 0) : max, 0);
    
    // Atualizar KPIs
    const updateKPI = (id, value) => {
      const el = Utils.qs(id);
      if (el) el.textContent = value;
    };
    
    updateKPI('#growthChannels', Utils.formatNumber(growthChannels));
    updateKPI('#declineChannels', Utils.formatNumber(declineChannels));
    updateKPI('#stableChannels', Utils.formatNumber(stableChannels));
    updateKPI('#topGrowthPercent', `+${topGrowth.toFixed(1)}%`);
    
    let html = `
      <div class="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900">
          <div class="text-zinc-500 text-sm">7 Dias</div>
          <div class="text-sm">
            Canais: ${DataStore.periodComparisons?.summary?.['7d']?.total_channels || 0}<br>
            Views: ${Utils.formatCompact(DataStore.periodComparisons?.summary?.['7d']?.total_views || 0)}<br>
            Media: ${Utils.formatCompact(DataStore.periodComparisons?.summary?.['7d']?.avg_views || 0)}
          </div>
        </div>
        <div class="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900">
          <div class="text-zinc-500 text-sm">30 Dias</div>
          <div class="text-sm">
            Canais: ${DataStore.periodComparisons?.summary?.['30d']?.total_channels || 0}<br>
            Views: ${Utils.formatCompact(DataStore.periodComparisons?.summary?.['30d']?.total_views || 0)}<br>
            Media: ${Utils.formatCompact(DataStore.periodComparisons?.summary?.['30d']?.avg_views || 0)}
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr class="text-xs">
              <th class="th sort-header cursor-pointer" data-key="channel_name" data-type="periods">
                Canal <span class="sort-indicator"></span>
              </th>
              <th class="th">Grupo</th>
              <th class="th text-right sort-header cursor-pointer" data-key="views_7d" data-type="periods">
                Views 7d <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="views_30d" data-type="periods">
                Views 30d <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="views_change" data-type="periods">
                Mudanca Views <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="engagement_7d" data-type="periods">
                Engaj. 7d <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="engagement_30d" data-type="periods">
                Engaj. 30d <span class="sort-indicator"></span>
              </th>
              <th class="th text-right sort-header cursor-pointer" data-key="engagement_change" data-type="periods">
                Mudanca Engaj. <span class="sort-indicator"></span>
              </th>
            </tr>
          </thead>
          <tbody id="periodsBody">
    `;
    
    html += '</tbody></table></div>';
    content.innerHTML = html;
    
    // Renderiza os dados com ordenação
    this.renderPeriodsData();
    
    // Configura eventos de ordenação
    Components.bindSorters();
  },

  // Renderiza dados dos períodos com ordenação
  renderPeriodsData() {
    const body = Utils.qs('#periodsBody');
    if (!body) return;
    body.innerHTML = '';
    
    let data = (DataStore.periodComparisons?.channels || []).slice();
    
    // Aplica ordenação
    const st = Components.sortState.periods || { key: 'views_change', dir: 'desc' };
    data.sort((a, b) => Components.cmp(Components.getVal('periods', st.key, a), Components.getVal('periods', st.key, b), st.dir));
    
    const frag = document.createDocumentFragment();
    data.slice(0, 50).forEach(channel => {
      const viewsChange = channel.changes?.views_change || 0;
      const engagementChange = channel.changes?.engagement_change || 0;
      const viewsColor = viewsChange > 0 ? 'text-green-600' : viewsChange < 0 ? 'text-red-600' : 'text-gray-600';
      const engColor = engagementChange > 0 ? 'text-green-600' : engagementChange < 0 ? 'text-red-600' : 'text-gray-600';
      
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70';
      tr.innerHTML = `
        <td class="td font-medium">${Utils.cleanText(channel.channel_name)}</td>
        <td class="td"><span class="chip bg-zinc-100 dark:bg-zinc-900">${channel.tag || ''}</span></td>
        <td class="td text-right">${Utils.formatCompact(channel['7d']?.avg_views || 0)}</td>
        <td class="td text-right">${Utils.formatCompact(channel['30d']?.avg_views || 0)}</td>
        <td class="td text-right ${viewsColor}">${viewsChange > 0 ? '+' : ''}${Utils.formatPercentage(viewsChange, 1)}</td>
        <td class="td text-right">${Utils.formatPercentage(channel['7d']?.engagement_rate || 0, 2)}</td>
        <td class="td text-right">${Utils.formatPercentage(channel['30d']?.engagement_rate || 0, 2)}</td>
        <td class="td text-right ${engColor}">${engagementChange > 0 ? '+' : ''}${Utils.formatPercentage(engagementChange, 1)}</td>
      `;
      frag.appendChild(tr);
    });
    body.appendChild(frag);
    
    Components.updateSortIndicators('periods');
  },

  renderKeywords() {
    const content = Utils.qs('#keywordsContent');
    if (!content) return;
    
    // Usa a mesma análise de palavras-chave do dashboard
    const topWords = Components.analyzeTopWords();
    
    if (topWords.length === 0) {
      content.innerHTML = '<div class="text-center text-zinc-500 py-8">Nenhum dado de títulos encontrado</div>';
      return;
    }

    // Calcula estatísticas
    const totalMatches = topWords.reduce((sum, w) => sum + w.matches, 0);
    const totalViews = topWords.reduce((sum, w) => sum + w.totalViews, 0);
    const avgViewsPerMatch = totalMatches > 0 ? totalViews / totalMatches : 0;
    
    let html = `
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">🔍 Top 50 Palavras dos Títulos (24h)</h3>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
          Análise das palavras mais frequentes e com maior impacto nos títulos dos vídeos das últimas 24 horas.
        </p>
      </div>
      
      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div class="text-blue-600 dark:text-blue-400 text-sm font-medium">TOTAL MATCHES</div>
          <div class="text-3xl font-bold">${Utils.formatNumber(totalMatches)}</div>
          <div class="text-xs text-blue-600 dark:text-blue-400 mt-1">ocorrências nos títulos</div>
        </div>
        <div class="p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div class="text-green-600 dark:text-green-400 text-sm font-medium">TOTAL VIEWS</div>
          <div class="text-3xl font-bold">${Utils.formatCompact(totalViews)}</div>
          <div class="text-xs text-green-600 dark:text-green-400 mt-1">views acumuladas</div>
        </div>
        <div class="p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div class="text-purple-600 dark:text-purple-400 text-sm font-medium">MÉDIA VIEWS/MATCH</div>
          <div class="text-3xl font-bold">${Utils.formatCompact(avgViewsPerMatch)}</div>
          <div class="text-xs text-purple-600 dark:text-purple-400 mt-1">performance média</div>
        </div>
      </div>
      
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-semibold">Ranking das Palavras</h4>
        <button id="downloadTitleWordsCsv" class="btn-ghost text-xs">Exportar CSV</button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr class="text-xs">
              <th class="th">Posição</th>
              <th class="th">Palavra</th>
              <th class="th text-right">Matches</th>
              <th class="th text-right">Total Views</th>
              <th class="th text-right">Média Views/Match</th>
              <th class="th text-right">% do Total</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    topWords.forEach((word, index) => {
      const percentage = (word.totalViews / totalViews) * 100;
      const rowClass = index < 5 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70';
      
      html += `
        <tr class="${rowClass}">
          <td class="td">
            <span class="flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'} text-sm font-bold">
              ${index + 1}
            </span>
          </td>
          <td class="td font-medium">${Utils.cleanText(word.word)}</td>
          <td class="td text-right font-semibold">${Utils.formatNumber(word.matches)}</td>
          <td class="td text-right font-semibold">${Utils.formatCompact(word.totalViews)}</td>
          <td class="td text-right">${Utils.formatCompact(word.avgViews)}</td>
          <td class="td text-right text-sm">
            <span class="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
              ${Utils.formatPercentage(percentage, 1)}
            </span>
          </td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
      
      <div class="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <h5 class="font-medium text-amber-800 dark:text-amber-200 mb-2">ℹ️ Sobre a Análise</h5>
        <ul class="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          <li>• <strong>Stop words</strong> em português são automaticamente filtradas</li>
          <li>• Apenas palavras com <strong>3+ caracteres</strong> são consideradas</li>
          <li>• Ordenação por <strong>total de views</strong> das palavras mais impactantes</li>
          <li>• Dados baseados nos vídeos publicados nas <strong>últimas 24 horas</strong></li>
        </ul>
      </div>
    `;
    
    content.innerHTML = html;
    
    // Evento de download CSV
    Utils.on('#downloadTitleWordsCsv', 'click', () => {
      const rows = topWords.map((w, i) => [
        i + 1, w.word, w.matches, w.totalViews, w.avgViews, ((w.totalViews / totalViews) * 100).toFixed(1) + '%'
      ]);
      Utils.download('top_50_palavras_titulos_24h.csv', 
        Utils.toCsv(rows, ['posicao', 'palavra', 'matches', 'total_views', 'media_views_por_match', 'percentual_total']));
    });
  },

  renderAdmin() {
    const content = Utils.qs('#adminContent');
    if (!content) return;
    
    console.log('🔧 [ADMIN] Iniciando renderização das informações gerais');
    console.log('🔧 [ADMIN] DataStore disponível:', {
      current: DataStore.current?.length || 0,
      videos24: DataStore.videos24?.length || 0,
      videos7d: DataStore.videos7d?.length || 0,
      videos30d: DataStore.videos30d?.length || 0,
      tagList: DataStore.tagList?.length || 0
    });
    
    // Calcula estatísticas avançadas para múltiplos períodos (com verificações de segurança)
    const totalChannels = DataStore.current?.length || 0;
    const totalVideos24h = DataStore.videos24?.length || 0;
    const totalVideos7d = DataStore.videos7d?.length || 0;
    const totalVideos30d = DataStore.videos30d?.length || 0;
    const totalTags = DataStore.tagList?.length || 0;
    const uniqueChannelsIn24h = new Set((DataStore.videos24 || []).map(v => v.channel_name)).size;
    const uniqueChannelsIn7d = new Set((DataStore.videos7d || []).map(v => v.channel_name)).size;
    const uniqueChannelsIn30d = new Set((DataStore.videos30d || []).map(v => v.channel_name)).size;
    
    // Estatísticas de performance para múltiplos períodos (com verificações de segurança)
    const totalViews24h = (DataStore.videos24 || []).reduce((sum, v) => sum + (Number(v.views) || 0), 0);
    const totalViews7d = (DataStore.videos7d || []).reduce((sum, v) => sum + (Number(v.views) || 0), 0);
    const totalViews30d = (DataStore.videos30d || []).reduce((sum, v) => sum + (Number(v.views) || 0), 0);
    
    const totalLikes24h = (DataStore.videos24 || []).reduce((sum, v) => sum + (Number(v.likes) || 0), 0);
    const totalLikes7d = (DataStore.videos7d || []).reduce((sum, v) => sum + (Number(v.likes) || 0), 0);
    const totalLikes30d = (DataStore.videos30d || []).reduce((sum, v) => sum + (Number(v.likes) || 0), 0);
    
    const totalComments24h = (DataStore.videos24 || []).reduce((sum, v) => sum + (Number(v.comments) || 0), 0);
    const totalComments7d = (DataStore.videos7d || []).reduce((sum, v) => sum + (Number(v.comments) || 0), 0);
    const totalComments30d = (DataStore.videos30d || []).reduce((sum, v) => sum + (Number(v.comments) || 0), 0);
    
    const avgViewsPerVideo24h = totalVideos24h > 0 ? totalViews24h / totalVideos24h : 0;
    const avgViewsPerVideo7d = totalVideos7d > 0 ? totalViews7d / totalVideos7d : 0;
    const avgViewsPerVideo30d = totalVideos30d > 0 ? totalViews30d / totalVideos30d : 0;
    
    const globalEngagement24h = totalViews24h > 0 ? ((totalLikes24h + totalComments24h) / totalViews24h) * 100 : 0;
    const globalEngagement7d = totalViews7d > 0 ? ((totalLikes7d + totalComments7d) / totalViews7d) * 100 : 0;
    const globalEngagement30d = totalViews30d > 0 ? ((totalLikes30d + totalComments30d) / totalViews30d) * 100 : 0;
    
    // Estatísticas avançadas
    const avgVideosPerChannelActive24h = uniqueChannelsIn24h > 0 ? totalVideos24h / uniqueChannelsIn24h : 0;
    const avgVideosPerChannelActive7d = uniqueChannelsIn7d > 0 ? totalVideos7d / uniqueChannelsIn7d : 0;
    const avgVideosPerChannelActive30d = uniqueChannelsIn30d > 0 ? totalVideos30d / uniqueChannelsIn30d : 0;
    
    // Top vídeos por período (com verificação de segurança)
    const topVideo24h = (DataStore.videos24 || []).length > 0 ? 
      (DataStore.videos24 || []).sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))[0] : null;
    const topVideo7d = (DataStore.videos7d || []).length > 0 ? 
      (DataStore.videos7d || []).sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))[0] : null;
    const topVideo30d = (DataStore.videos30d || []).length > 0 ? 
      (DataStore.videos30d || []).sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))[0] : null;
    
    // Análise de crescimento (com verificação de segurança)
    const growthRate7dTo24h = totalViews24h > 0 && totalViews7d > 0 && totalVideos7d > 0 ? 
      ((totalViews24h / (totalViews7d / 7)) - 1) * 100 : 0;
    const growthRate30dTo7d = totalViews7d > 0 && totalViews30d > 0 && totalVideos30d > 0 ? 
      ((totalViews7d / 7) / (totalViews30d / 30) - 1) * 100 : 0;
    
    // Análise por grupo (com verificação de segurança)
    const groupStats = {};
    (DataStore.tagList || []).forEach(tag => {
      const channelsInGroup = (DataStore.current || []).filter(c => c.tag === tag).length;
      const videosInGroup = (DataStore.videos24 || []).filter(v => v.tag === tag).length;
      const viewsInGroup = (DataStore.videos24 || []).filter(v => v.tag === tag).reduce((sum, v) => sum + (Number(v.views) || 0), 0);
      groupStats[tag] = { channels: channelsInGroup, videos: videosInGroup, views: viewsInGroup };
    });
    
    // Top canais por inscritos (com verificação de segurança)
    const topChannelsBySubscribers = (DataStore.current || [])
      .sort((a, b) => (Number(b.subscriber_count) || 0) - (Number(a.subscriber_count) || 0))
      .slice(0, 5);
    
    // Top canais por views 24h (com verificação de segurança)
    const topChannelsByViews24h = (DataStore.current || [])
      .sort((a, b) => (Number(b.views_24h) || 0) - (Number(a.views_24h) || 0))
      .slice(0, 5);
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- KPIs Principais Expandidos -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div class="text-blue-600 dark:text-blue-400 text-xs font-medium">CANAIS ATIVOS</div>
            <div class="text-2xl font-bold">${Utils.formatNumber(totalChannels)}</div>
            <div class="text-xs text-blue-500 mt-1">24h: ${uniqueChannelsIn24h} • 7d: ${uniqueChannelsIn7d} • 30d: ${uniqueChannelsIn30d}</div>
          </div>
          <div class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div class="text-green-600 dark:text-green-400 text-xs font-medium">VÍDEOS TOTAL</div>
            <div class="text-2xl font-bold">${Utils.formatNumber(totalVideos30d)}</div>
            <div class="text-xs text-green-500 mt-1">24h: ${totalVideos24h} • 7d: ${totalVideos7d}</div>
          </div>
          <div class="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div class="text-purple-600 dark:text-purple-400 text-xs font-medium">VIEWS TOTAL</div>
            <div class="text-2xl font-bold">${Utils.formatCompact(totalViews30d)}</div>
            <div class="text-xs text-purple-500 mt-1">24h: ${Utils.formatCompact(totalViews24h)} • 7d: ${Utils.formatCompact(totalViews7d)}</div>
          </div>
          <div class="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div class="text-orange-600 dark:text-orange-400 text-xs font-medium">LIKES TOTAL</div>
            <div class="text-2xl font-bold">${Utils.formatCompact(totalLikes30d)}</div>
            <div class="text-xs text-orange-500 mt-1">24h: ${Utils.formatCompact(totalLikes24h)} • 7d: ${Utils.formatCompact(totalLikes7d)}</div>
          </div>
          <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div class="text-red-600 dark:text-red-400 text-xs font-medium">COMENTÁRIOS TOTAL</div>
            <div class="text-2xl font-bold">${Utils.formatCompact(totalComments30d)}</div>
            <div class="text-xs text-red-500 mt-1">24h: ${Utils.formatCompact(totalComments24h)} • 7d: ${Utils.formatCompact(totalComments7d)}</div>
          </div>
          <div class="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
            <div class="text-indigo-600 dark:text-indigo-400 text-xs font-medium">ENGAJAMENTO</div>
            <div class="text-2xl font-bold">${Utils.formatPercentage(globalEngagement24h, 2)}</div>
            <div class="text-xs text-indigo-500 mt-1">7d: ${Utils.formatPercentage(globalEngagement7d, 2)} • 30d: ${Utils.formatPercentage(globalEngagement30d, 2)}</div>
          </div>
        </div>
        
        <!-- Estatísticas de Crescimento -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
            <div class="text-emerald-700 dark:text-emerald-300 text-sm font-medium">📈 CRESCIMENTO VIEWS</div>
            <div class="text-xl font-bold text-emerald-800 dark:text-emerald-200">${growthRate7dTo24h > 0 ? '+' : ''}${growthRate7dTo24h.toFixed(1)}%</div>
            <div class="text-xs text-emerald-600 dark:text-emerald-400">Taxa diária vs média 7d</div>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700">
            <div class="text-amber-700 dark:text-amber-300 text-sm font-medium">⚡ MÉDIA VIEWS/VÍDEO</div>
            <div class="text-xl font-bold text-amber-800 dark:text-amber-200">${Utils.formatCompact(avgViewsPerVideo24h)}</div>
            <div class="text-xs text-amber-600 dark:text-amber-400">7d: ${Utils.formatCompact(avgViewsPerVideo7d)} • 30d: ${Utils.formatCompact(avgViewsPerVideo30d)}</div>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-700">
            <div class="text-rose-700 dark:text-rose-300 text-sm font-medium">🎯 PRODUTIVIDADE</div>
            <div class="text-xl font-bold text-rose-800 dark:text-rose-200">${avgVideosPerChannelActive24h.toFixed(1)}</div>
            <div class="text-xs text-rose-600 dark:text-rose-400">Vídeos por canal ativo (24h)</div>
          </div>
        </div>
        
        <!-- Estatísticas de Performance -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border">
            <h4 class="font-semibold text-lg mb-4">📈 Métricas de Performance</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-zinc-600 dark:text-zinc-400">Média de Views por Vídeo (24h):</span>
                <span class="font-semibold">${Utils.formatCompact(avgViewsPerVideo24h)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-600 dark:text-zinc-400">Total de Likes (24h):</span>
                <span class="font-semibold">${Utils.formatCompact(totalLikes24h)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-600 dark:text-zinc-400">Total de Comentários (24h):</span>
                <span class="font-semibold">${Utils.formatCompact(totalComments24h)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-600 dark:text-zinc-400">Taxa de Atividade:</span>
                <span class="font-semibold">${Utils.formatPercentage((uniqueChannelsIn24h / totalChannels) * 100, 1)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-600 dark:text-zinc-400">Vídeos por Canal Ativo:</span>
                <span class="font-semibold">${uniqueChannelsIn24h > 0 ? (totalVideos24h / uniqueChannelsIn24h).toFixed(1) : '0'}</span>
              </div>
            </div>
          </div>
          
          <div class="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border">
            <h4 class="font-semibold text-lg mb-4">🏷️ Estatísticas por Grupo</h4>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              ${(DataStore.tagList || []).map(tag => {
                const stats = groupStats[tag] || { channels: 0, videos: 0, views: 0 };
                return `
                  <div class="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
                    <div>
                      <span class="font-medium">${tag}</span>
                      <div class="text-xs text-zinc-500">${stats.channels} canais • ${stats.videos} vídeos</div>
                    </div>
                    <div class="text-right">
                      <div class="font-semibold">${Utils.formatCompact(stats.views)}</div>
                      <div class="text-xs text-zinc-500">views</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        
        <!-- Rankings -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
            <h4 class="font-semibold text-lg mb-4 text-blue-800 dark:text-blue-200">👑 Top 5 Canais por Inscritos</h4>
            <div class="space-y-3">
              ${topChannelsBySubscribers.map((channel, index) => `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">${index + 1}</span>
                    <div>
                      <div class="font-medium text-sm">${Utils.cleanText(channel.channel_name)}</div>
                      <div class="text-xs text-blue-600 dark:text-blue-400">${channel.tag}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold">${Utils.formatCompact(channel.subscriber_count || 0)}</div>
                    <div class="text-xs text-zinc-500">inscritos</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
            <h4 class="font-semibold text-lg mb-4 text-green-800 dark:text-green-200">🔥 Top 5 Canais por Views (24h)</h4>
            <div class="space-y-3">
              ${topChannelsByViews24h.map((channel, index) => `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold">${index + 1}</span>
                    <div>
                      <div class="font-medium text-sm">${Utils.cleanText(channel.channel_name)}</div>
                      <div class="text-xs text-green-600 dark:text-green-400">${channel.tag}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold">${Utils.formatCompact(channel.views_24h || 0)}</div>
                    <div class="text-xs text-zinc-500">views 24h</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Informações do Sistema Expandidas -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 class="font-semibold text-lg mb-4 text-blue-800 dark:text-blue-200">📊 Banco de Dados</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Registros históricos:</span>
                <span class="font-medium">${Utils.formatNumber(DataStore.history.length)}</span>
              </div>
              <div class="flex justify-between">
                <span>Dados de tendência 7d:</span>
                <span class="font-medium">${Utils.formatNumber(DataStore.trendByChannel7.length)}</span>
              </div>
              <div class="flex justify-between">
                <span>Dados de tendência 30d:</span>
                <span class="font-medium">${Utils.formatNumber(DataStore.trendByChannel30.length)}</span>
              </div>
              <div class="flex justify-between">
                <span>Rankings disponíveis:</span>
                <span class="font-medium">${Utils.formatNumber(Object.keys(DataStore.rankings || {}).length)}</span>
              </div>
              <div class="flex justify-between">
                <span>Canais únicos no histórico:</span>
                <span class="font-medium">${Utils.formatNumber(new Set(DataStore.history.map(h => h.channel_name)).size)}</span>
              </div>
              <div class="pt-2 border-t border-blue-200 dark:border-blue-700">
                <div class="flex justify-between">
                  <span>Última atualização:</span>
                  <span class="font-medium text-xs">${Utils.formatDate(DataStore.metadata?.generated_at) || '—'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
            <h4 class="font-semibold text-lg mb-4 text-emerald-800 dark:text-emerald-200">📊 Estatísticas de Conteúdo</h4>
            <div class="space-y-3 text-base">
              <div class="flex justify-between items-center">
                <span>Total de vídeos (24h):</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">${Utils.formatNumber(DataStore.videos24?.length || 0)}</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Total de visualizações:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">${Utils.formatCompact(DataStore.videos24?.reduce((sum, v) => sum + (v.views || 0), 0) || 0)}</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Taxa de engajamento média:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">${(() => {
                  const videos = DataStore.videos24 || [];
                  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
                  const totalEngagement = videos.reduce((sum, v) => sum + (v.likes || 0) + (v.comments || 0), 0);
                  return totalViews > 0 ? Utils.formatPercentage((totalEngagement / totalViews) * 100, 2) : '0%';
                })()}</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Vídeos mais virais:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">${Utils.formatNumber(DataStore.rankings?.viral_videos?.length || 0)} identificados</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Grupos mais ativos:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">${(() => {
                  const groups = DataStore.tags24?.by_tag || [];
                  return groups.length > 0 ? groups.sort((a, b) => (b.videos || 0) - (a.videos || 0))[0]?.tag || 'N/A' : 'N/A';
                })()}</span>
              </div>
              <div class="pt-3 border-t border-emerald-200 dark:border-emerald-700">
                <div class="flex justify-between items-center">
                  <span>Período de análise:</span>
                  <span class="font-medium text-sm text-emerald-700 dark:text-emerald-300">${DataStore.metadata?.windows?.history?.window_start ? Utils.formatDate(DataStore.metadata.windows.history.window_start) + ' até ' + Utils.formatDate(DataStore.metadata.windows.history.window_end) : 'Últimas 24-30 dias'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <h4 class="font-semibold text-lg mb-4 text-amber-800 dark:text-amber-200">⚙️ Gerenciamento do Sistema</h4>
            <div class="space-y-4 text-sm">
              <div>
                <p class="font-medium mb-2">CLI do Sistema:</p>
                <pre class="p-3 bg-black text-green-400 rounded font-mono text-xs">python main.py</pre>
              </div>
              <div>
                <p class="font-medium mb-2">Funcionalidades disponíveis:</p>
                <ul class="list-disc list-inside space-y-1 text-xs text-amber-700 dark:text-amber-300">
                  <li>Adicionar e remover canais</li>
                  <li>Atualizar dados e estatísticas</li>
                  <li>Gerenciar tags e grupos</li>
                  <li>Exportar relatórios</li>
                  <li>Configurar chaves de API</li>
                  <li>Análises avançadas</li>
                </ul>
              </div>
              <div class="pt-2 border-t border-amber-200 dark:border-amber-700">
                <p class="text-xs text-amber-600 dark:text-amber-400">
                  💡 Use a opção "14. Exportar para web" na CLI para atualizar todos os dados do dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    console.log('✅ [ADMIN] Informações gerais renderizadas com sucesso');
  },

  // Função auxiliar para calcular métricas de 7 dias
  calculateChannelMetrics7d(channelName) {
    if (!DataStore.trendByChannel7 || !Array.isArray(DataStore.trendByChannel7)) {
      return { videos: 0, views: 0, likes: 0, comments: 0, engagement: 0 };
    }

    const channelData = DataStore.trendByChannel7.filter(item => 
      item.channel_name === channelName
    );

    if (channelData.length === 0) {
      return { videos: 0, views: 0, likes: 0, comments: 0, engagement: 0 };
    }

    const totalVideos = channelData.reduce((sum, item) => sum + (item.videos || 0), 0);
    const totalViews = channelData.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = channelData.reduce((sum, item) => sum + (item.likes || 0), 0);
    const totalComments = channelData.reduce((sum, item) => sum + (item.comments || 0), 0);
    
    const engagement = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    return {
      videos: totalVideos,
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      engagement: engagement
    };
  },

  // Função auxiliar para calcular métricas de 30 dias
  calculateChannelMetrics30d(channelName) {
    if (!DataStore.trendByChannel30 || !Array.isArray(DataStore.trendByChannel30)) {
      return { videos: 0, views: 0, likes: 0, comments: 0, engagement: 0 };
    }

    const channelData = DataStore.trendByChannel30.filter(item => 
      item.channel_name === channelName
    );

    if (channelData.length === 0) {
      return { videos: 0, views: 0, likes: 0, comments: 0, engagement: 0 };
    }

    const totalVideos = channelData.reduce((sum, item) => sum + (item.videos || 0), 0);
    const totalViews = channelData.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = channelData.reduce((sum, item) => sum + (item.likes || 0), 0);
    const totalComments = channelData.reduce((sum, item) => sum + (item.comments || 0), 0);
    
    const engagement = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    return {
      videos: totalVideos,
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      engagement: engagement
    };
  },

  // Função auxiliar para calcular métricas de grupos de 7 dias
  calculateGroupMetrics7d(groupName) {
    if (!DataStore.trendByChannel7 || !Array.isArray(DataStore.trendByChannel7)) {
      return { totalViews: 0, totalLikes: 0, totalComments: 0, totalVideos: 0, avgViews: 0, engagementRate: 0 };
    }

    const groupData = DataStore.trendByChannel7.filter(item => 
      item.tag === groupName
    );

    if (groupData.length === 0) {
      return { totalViews: 0, totalLikes: 0, totalComments: 0, totalVideos: 0, avgViews: 0, engagementRate: 0 };
    }

    const totalViews = groupData.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = groupData.reduce((sum, item) => sum + (item.likes || 0), 0);
    const totalComments = groupData.reduce((sum, item) => sum + (item.comments || 0), 0);
    const totalVideos = groupData.reduce((sum, item) => sum + (item.videos || 0), 0);
    
    // Calcula número único de canais no grupo
    const uniqueChannels = new Set(groupData.map(item => item.channel_id)).size;
    const avgViews = uniqueChannels > 0 ? totalViews / uniqueChannels : 0;
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalVideos,
      avgViews,
      engagementRate
    };
  },

  // Função auxiliar para calcular métricas de grupos de 30 dias
  calculateGroupMetrics30d(groupName) {
    if (!DataStore.trendByChannel30 || !Array.isArray(DataStore.trendByChannel30)) {
      return { totalViews: 0, totalLikes: 0, totalComments: 0, totalVideos: 0, avgViews: 0, engagementRate: 0 };
    }

    const groupData = DataStore.trendByChannel30.filter(item => 
      item.tag === groupName
    );

    if (groupData.length === 0) {
      return { totalViews: 0, totalLikes: 0, totalComments: 0, totalVideos: 0, avgViews: 0, engagementRate: 0 };
    }

    const totalViews = groupData.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = groupData.reduce((sum, item) => sum + (item.likes || 0), 0);
    const totalComments = groupData.reduce((sum, item) => sum + (item.comments || 0), 0);
    const totalVideos = groupData.reduce((sum, item) => sum + (item.videos || 0), 0);
    
    // Calcula número único de canais no grupo
    const uniqueChannels = new Set(groupData.map(item => item.channel_id)).size;
    const avgViews = uniqueChannels > 0 ? totalViews / uniqueChannels : 0;
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalVideos,
      avgViews,
      engagementRate
    };
  },

  // Compara dois grupos específicos
  compareBenchmarkGroups(group1Name, group2Name, group3Name) {
    console.log('🏷️ [GROUP_COMPARISON] Iniciando comparação entre grupos...');
    console.log('🏷️ [GROUP_COMPARISON] Parâmetros recebidos:', { group1Name, group2Name, group3Name });
    
    const resultsDiv = Utils.qs('#benchmarkResults');
    if (!resultsDiv) {
      console.error('❌ [GROUP_COMPARISON] Elemento #benchmarkResults não encontrado');
      return;
    }
    
    // Coleta dados agregados por grupo
    const group1Channels = DataStore.current.filter(c => c.tag === group1Name);
    const group2Channels = DataStore.current.filter(c => c.tag === group2Name);
    const group3Channels = DataStore.current.filter(c => c.tag === group3Name);
    
    console.log('🏷️ [GROUP_COMPARISON] Canais encontrados:', {
      group1: group1Channels.length,
      group2: group2Channels.length,
      group3: group3Channels.length
    });
    
    if (group1Channels.length === 0 || group2Channels.length === 0 || group3Channels.length === 0) {
      resultsDiv.innerHTML = `
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div class="text-red-800 dark:text-red-200">
            ❌ Erro: Um ou ambos os grupos não possuem canais.
            <br>Grupo 1 (${group1Name}): ${group1Channels.length} canais
            <br>Grupo 2 (${group2Name}): ${group2Channels.length} canais
            <br>Grupo 3 (${group3Name}): ${group3Channels.length} canais
          </div>
        </div>
      `;
      resultsDiv.classList.remove('hidden');
      return;
    }
    
    // Calcula métricas agregadas para cada grupo
    const calculateGroupMetrics = (channels, groupName) => {
      const totalChannels = channels.length;
      const totalSubscribers = channels.reduce((sum, c) => sum + (c.subscriber_count || 0), 0);
      const totalViews24h = channels.reduce((sum, c) => sum + (c.views_24h || 0), 0);
      const totalLikes24h = channels.reduce((sum, c) => sum + (c.likes_24h || 0), 0);
      const totalComments24h = channels.reduce((sum, c) => sum + (c.comments_24h || 0), 0);
      const totalVideos24h = channels.reduce((sum, c) => sum + (c.videos_24h || 0), 0);
      
      const avgSubscribers = totalSubscribers / totalChannels;
      const avgViews24h = totalViews24h / totalChannels;
      const avgLikes24h = totalLikes24h / totalChannels;
      const avgComments24h = totalComments24h / totalChannels;
      const avgVideos24h = totalVideos24h / totalChannels;
      
      const engagementRate = totalViews24h > 0 ? 
        ((totalLikes24h + totalComments24h) / totalViews24h) * 100 : 0;
      
      return {
        groupName,
        totalChannels,
        totalSubscribers,
        totalViews24h,
        totalLikes24h,
        totalComments24h,
        totalVideos24h,
        avgSubscribers,
        avgViews24h,
        avgLikes24h,
        avgComments24h,
        avgVideos24h,
        engagementRate
      };
    };
    
    const group1Metrics = calculateGroupMetrics(group1Channels, group1Name);
    const group2Metrics = calculateGroupMetrics(group2Channels, group2Name);
    const group3Metrics = calculateGroupMetrics(group3Channels, group3Name);
    
    // Prepara dados para exibição
    const metrics = [
      { name: 'Total de Canais', g1: group1Metrics.totalChannels, g2: group2Metrics.totalChannels, g3: group3Metrics.totalChannels, formatter: (v) => Utils.formatNumber(v) },
      { name: 'Total de Inscritos', g1: group1Metrics.totalSubscribers, g2: group2Metrics.totalSubscribers, g3: group3Metrics.totalSubscribers, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Total Views (24h)', g1: group1Metrics.totalViews24h, g2: group2Metrics.totalViews24h, g3: group3Metrics.totalViews24h, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Total Likes (24h)', g1: group1Metrics.totalLikes24h, g2: group2Metrics.totalLikes24h, g3: group3Metrics.totalLikes24h, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Total Comentários (24h)', g1: group1Metrics.totalComments24h, g2: group2Metrics.totalComments24h, g3: group3Metrics.totalComments24h, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Total Vídeos (24h)', g1: group1Metrics.totalVideos24h, g2: group2Metrics.totalVideos24h, g3: group3Metrics.totalVideos24h, formatter: (v) => Utils.formatNumber(v) },
      { name: 'Média Inscritos/Canal', g1: group1Metrics.avgSubscribers, g2: group2Metrics.avgSubscribers, g3: group3Metrics.avgSubscribers, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Média Views/Canal (24h)', g1: group1Metrics.avgViews24h, g2: group2Metrics.avgViews24h, g3: group3Metrics.avgViews24h, formatter: (v) => Utils.formatCompact(v) },
      { name: 'Taxa de Engajamento (24h)', g1: group1Metrics.engagementRate, g2: group2Metrics.engagementRate, g3: group3Metrics.engagementRate, formatter: (v) => v.toFixed(2) + '%' }
    ];

    // Adiciona métricas de 7 dias se dados disponíveis
    if (DataStore.trendByChannel7 && DataStore.trendByChannel7.length > 0) {
      const group1Metrics7d = this.calculateGroupMetrics7d(group1Name);
      const group2Metrics7d = this.calculateGroupMetrics7d(group2Name);
      const group3Metrics7d = this.calculateGroupMetrics7d(group3Name);

      metrics.push(
        { name: 'Total Views (7d)', g1: group1Metrics7d.totalViews, g2: group2Metrics7d.totalViews, g3: group3Metrics7d.totalViews, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Likes (7d)', g1: group1Metrics7d.totalLikes, g2: group2Metrics7d.totalLikes, g3: group3Metrics7d.totalLikes, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Comentários (7d)', g1: group1Metrics7d.totalComments, g2: group2Metrics7d.totalComments, g3: group3Metrics7d.totalComments, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Vídeos (7d)', g1: group1Metrics7d.totalVideos, g2: group2Metrics7d.totalVideos, g3: group3Metrics7d.totalVideos, formatter: (v) => Utils.formatNumber(v) },
        { name: 'Média Views/Canal (7d)', g1: group1Metrics7d.avgViews, g2: group2Metrics7d.avgViews, g3: group3Metrics7d.avgViews, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Taxa de Engajamento (7d)', g1: group1Metrics7d.engagementRate, g2: group2Metrics7d.engagementRate, g3: group3Metrics7d.engagementRate, formatter: (v) => v.toFixed(2) + '%' }
      );
    }

    // Adiciona métricas de 30 dias se dados disponíveis
    if (DataStore.trendByChannel30 && DataStore.trendByChannel30.length > 0) {
      const group1Metrics30d = this.calculateGroupMetrics30d(group1Name);
      const group2Metrics30d = this.calculateGroupMetrics30d(group2Name);
      const group3Metrics30d = this.calculateGroupMetrics30d(group3Name);

      metrics.push(
        { name: 'Total Views (30d)', g1: group1Metrics30d.totalViews, g2: group2Metrics30d.totalViews, g3: group3Metrics30d.totalViews, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Likes (30d)', g1: group1Metrics30d.totalLikes, g2: group2Metrics30d.totalLikes, g3: group3Metrics30d.totalLikes, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Comentários (30d)', g1: group1Metrics30d.totalComments, g2: group2Metrics30d.totalComments, g3: group3Metrics30d.totalComments, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Total Vídeos (30d)', g1: group1Metrics30d.totalVideos, g2: group2Metrics30d.totalVideos, g3: group3Metrics30d.totalVideos, formatter: (v) => Utils.formatNumber(v) },
        { name: 'Média Views/Canal (30d)', g1: group1Metrics30d.avgViews, g2: group2Metrics30d.avgViews, g3: group3Metrics30d.avgViews, formatter: (v) => Utils.formatCompact(v) },
        { name: 'Taxa de Engajamento (30d)', g1: group1Metrics30d.engagementRate, g2: group2Metrics30d.engagementRate, g3: group3Metrics30d.engagementRate, formatter: (v) => v.toFixed(2) + '%' }
      );
    }
    
    let html = `
      <div class="bg-white dark:bg-zinc-800 border rounded-xl p-6">
        <h4 class="text-lg font-semibold mb-4">🏷️ Comparação de Grupos: ${Utils.cleanText(group1Name)} vs ${Utils.cleanText(group2Name)} vs ${Utils.cleanText(group3Name)}</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Grupo 1 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-blue-600 dark:text-blue-400">${Utils.cleanText(group1Name)}</h5>
              <span class="chip bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">${group1Metrics.totalChannels} canais</span>
            </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.g1)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Grupo 2 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-green-600 dark:text-green-400">${Utils.cleanText(group2Name)}</h5>
              <span class="chip bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">${group2Metrics.totalChannels} canais</span>
            </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.g2)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Grupo 3 -->
          <div class="space-y-3">
            <div class="text-center">
              <h5 class="font-medium text-purple-600 dark:text-purple-400">${Utils.cleanText(group3Name)}</h5>
              <span class="chip bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100">${group3Metrics.totalChannels} canais</span>
            </div>
            <div class="space-y-2">
              ${metrics.map(m => `
                <div class="flex justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">${m.name}:</span>
                  <span class="font-medium">${m.formatter(m.g3)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Comparação direta -->
        <div class="mt-6 border-t pt-4">
          <h6 class="font-medium mb-3">🏆 Vencedor por Categoria:</h6>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            ${metrics.map(m => {
              const winner = m.g1 > m.g2 ? m.g1 > m.g3 ? group1Name : m.g3 > m.g1 ? group3Name : 'Empate' : m.g2 > m.g3 ? group2Name : m.g3 > m.g2 ? group3Name : 'Empate';
              const winnerColor = m.g1 > m.g2 ? m.g1 > m.g3 ? 'text-blue-600' : m.g3 > m.g1 ? 'text-purple-600' : 'text-gray-600' : m.g2 > m.g3 ? 'text-green-600' : m.g3 > m.g2 ? 'text-purple-600' : 'text-gray-600';
              return `
                <div class="flex justify-between">
                  <span>${m.name}:</span>
                  <span class="font-medium ${winnerColor}">${winner}</span>
            </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Top canais de cada grupo -->
        <div class="mt-6 border-t pt-4">
          <h6 class="font-medium mb-3">🌟 Top 3 Canais de Cada Grupo (por Views 24h):</h6>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h7 class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 block">${group1Name}:</h7>
              ${group1Channels
                .sort((a, b) => (b.views_24h || 0) - (a.views_24h || 0))
                .slice(0, 3)
                .map((c, i) => `
                  <div class="text-xs flex justify-between py-1">
                    <span>${i + 1}. ${Utils.cleanText(c.channel_name)}</span>
                    <span class="font-medium">${Utils.formatCompact(c.views_24h || 0)}</span>
                  </div>
                `).join('')}
            </div>
            <div>
              <h7 class="text-sm font-medium text-green-600 dark:text-green-400 mb-2 block">${group2Name}:</h7>
              ${group2Channels
                .sort((a, b) => (b.views_24h || 0) - (a.views_24h || 0))
                .slice(0, 3)
                .map((c, i) => `
                  <div class="text-xs flex justify-between py-1">
                    <span>${i + 1}. ${Utils.cleanText(c.channel_name)}</span>
                    <span class="font-medium">${Utils.formatCompact(c.views_24h || 0)}</span>
                  </div>
                `).join('')}
            </div>
            <div>
              <h7 class="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2 block">${group3Name}:</h7>
              ${group3Channels
                .sort((a, b) => (b.views_24h || 0) - (a.views_24h || 0))
                .slice(0, 3)
                .map((c, i) => `
                  <div class="text-xs flex justify-between py-1">
                    <span>${i + 1}. ${Utils.cleanText(c.channel_name)}</span>
                    <span class="font-medium">${Utils.formatCompact(c.views_24h || 0)}</span>
                  </div>
                `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    resultsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
    console.log('✅ [GROUP_COMPARISON] Resultados renderizados com sucesso');
    
    // Scroll suave para os resultados
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log('✅ [GROUP_COMPARISON] Comparação de grupos concluída!');
  }
};

// Inicializacao quando DOM estiver pronto
function startApp() {
  console.log('📋 DOM carregado, iniciando aplicacao...');
  App.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

// Expoe globalmente para debugging
window.App = App;

console.log('✅ App carregado com sucesso!');

