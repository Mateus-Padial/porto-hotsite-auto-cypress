class CatalogoElements {
  // ─── Modal Jornada Guiada ───────────────────────────────────────────────────
  get modalJornada() {
    return '#tourHomeModal';
  }
  get btnVisitaGuiada() {
    return 'button[data-testid="vert-button"]';
  }
  get btnVerMaisTarde() {
    return 'button[data-testid="vert-button"]';
  }
  get btnFecharJornada() {
    return '.ant-modal-close-x';
  }

  // ─── Tour Steps ─────────────────────────────────────────────────────────────
  get tourStep1() {
    return '[data-step="1"]';
  }
  get tourStep2() {
    return '#step_focus_2';
  }
  get tourStep3() {
    return '#step_focus_3';
  }
  get tourStep4() {
    return '#step_focus_5';
  }
  get tourStep5() {
    return '#step_focus_8';
  }
  get tourStep6() {
    return '#step_focus_7';
  }
  get tourStep7() {
    return '#step_focus_9';
  }

  // ─── Tour Controls ──────────────────────────────────────────────────────────
  get txtTourTituloPrimeiro() {
    return '#step_focus_1';
  }
  get btnFecharTour() {
    return '.ant-modal-close-x';
  }
  get btnTourProximo() {
    return '[data-tour-elem="right-arrow"]';
  }

  getTourStep(stepNumber) {
    const steps = {
      1: this.tourStep1,
      2: this.tourStep2,
      3: this.tourStep3,
      4: this.tourStep4,
      5: this.tourStep5,
      6: this.tourStep6,
      7: this.tourStep7,
    };
    return steps[stepNumber] || null;
  }

  // ─── Card de Produto (vitrine) ───────────────────────────────────────────────
  get image() {
    return '.vert-card-image-wrapper img';
  }
  get tagDesconto() {
    return '.vert-card-highlight-tags .ant-tag';
  }
  get btnFavorito() {
    return 'button[aria-label="Adicionar aos favoritos"]';
  }
  get tituloProduto() {
    return '.vert-card-product-title span';
  }
  get avaliacao() {
    return '.vert-card-product-rate .ant-rate';
  }
  get loja() {
    return '.vert-card-product-vendor span';
  }
  get valorAntigo() {
    return '.price-label';
  }
  get valorAtual() {
    return '.price-value';
  }
  get cardProduto() {
    return '.vert-card-product';
  }

  // ─── Categorias ─────────────────────────────────────────────────────────────
  // Trigger do dropdown de categorias no menu principal
  // <a data-label="Categorias" class="ant-dropdown-trigger vert-menu-item">
  get btnCategoria() {
    return 'a[data-label="Categorias"].ant-dropdown-trigger';
  }

  // O Ant Design injeta o dropdown no document.body com position:fixed
  // Estrutura: div.ant-dropdown > ul.ant-dropdown-menu[role="menu"] > li > span > a[data-label="X"]
  get menuDropdownCategorias() {
    return '.ant-dropdown-menu[role="menu"]';
  }

  // Retorna seletor do link da categoria pelo data-label exato
  getCategoriaByLabel(label) {
    return `a[data-label="${label}"]`;
  }

  // ─── Detalhes do Produto ────────────────────────────────────────────────────
  get tituloH1() {
    return 'h1';
  }
  get btnAdicionarCarrinho() {
    return 'button:contains("Adicionar ao carrinho")';
  }
  get imagemPrincipal() {
    return '.ant-image-img';
  }
  get precoProduto() {
    return '.price-value';
  }

  // ─── Carrinho ───────────────────────────────────────────────────────────────
  get cartItems() {
    return '[data-testid="cart-items"]';
  }
  get btnFinalizarCompra() {
    return 'button[data-testid="checkout-button"]';
  }
  get resumoPedido() {
    return '[data-testid="order-summary"]';
  }

  // ─── Favoritos ──────────────────────────────────────────────────────────────
  get btnFavoritoAtivo() {
    return 'button[aria-label="Remover dos favoritos"]';
  }
  get listaFavoritos() {
    return '[data-testid="favorites-list"], .vert-wishlist, [class*="wishlist"]';
  }
  get itemFavorito() {
    return '[data-testid="favorite-item"], .vert-card-product';
  }
  get menuFavoritos() {
    return 'a[href*="wishlist"], a[href*="favoritos"], [data-label="Favoritos"]';
  }

  // ─── Barra de Pesquisa ──────────────────────────────────────────────────────
  get inputBusca() {
    return 'input[placeholder*="busca"], input[placeholder*="pesquisa"], input[type="search"], input[data-testid="search-input"], .vert-search input';
  }
  get btnBuscar() {
    return 'button[type="submit"][aria-label*="busca"], button[data-testid="search-button"], .vert-search button[type="submit"]';
  }
  get resultadosBusca() {
    return '.vert-card-product, [data-testid="search-results"] .vert-card-product';
  }
  get containerResultados() {
    return '[data-testid="search-results"], .vert-catalog-list, .catalog-list';
  }

  // ─── Saldo de Pontos ────────────────────────────────────────────────────────
  // <span class="ant-typography vert-text ...">4.166 pontos</span> — no header do catálogo
  get saldoPontos() {
    return 'header span.vert-text:contains("pontos"), [class*="header"] span.vert-text:contains("pontos")';
  }
  get valorSaldo() {
    return 'header span.vert-text:contains("pontos"), [class*="header"] span.vert-text:contains("pontos")';
  }
  get containerSaldo() {
    return '[data-testid="balance-container"], .balance-container, [class*="balance"]';
  }

  // ─── Extrato de Pontos ──────────────────────────────────────────────────────
  // Navegação: link /extract no breadcrumb ou menu
  get menuExtrato() {
    return 'a[href="/extract"]';
  }

  // Container principal da página de extrato
  get containerExtrato() {
    return '.extract-page-content';
  }

  // Título da página ("Extrato")
  get tituloExtrato() {
    return '.extract-page-title h1';
  }

  // Bloco de resumo de pontos (disponível / processamento / total / expirados / resgatados / creditados)
  get blocoInfoExtrato() {
    return '.extract-page-info';
  }

  // Label e valor dentro de cada bloco de info
  // ex: "Disponível" / "4.166 pontos"
  get labelInfoExtrato() {
    return '.extract-page-info .vert-paragraph:not(:has(strong))';
  }
  get valorInfoExtrato() {
    return '.extract-page-info .vert-paragraph strong';
  }

  // Pontos disponíveis — primeiro bloco de cada .extract-page-info
  get pontosDisponiveis() {
    return '.extract-page-info:first-of-type .vert-paragraph strong';
  }

  // Filtro de período
  get filtroPeriodo() {
    return '.extract-page-filters .filter-by-period .ant-select';
  }

  // Estado vazio (sem movimentações no período)
  get extratoVazio() {
    return '.extract-page-empty';
  }
  get mensagemExtratoVazio() {
    return '.extract-page-empty h1';
  }

  // Breadcrumb de volta para a home
  get breadcrumbExtrato() {
    return '.extract-page-breadcrumb .ant-breadcrumb';
  }
  get linkBreadcrumbInicio() {
    return '.extract-page-breadcrumb a[href="/"]';
  }
  get linkBreadcrumbExtrato() {
    return '.extract-page-breadcrumb a[href="/extract"]';
  }

  // ─── Perfil ─────────────────────────────────────────────────────────────────
  // Navegação para a página de perfil
  get menuPerfil() {
    return 'a[href="/profile"], a[href*="profile"]';
  }

  // Container principal da página de perfil
  get containerPerfil() {
    return '.profile-page-content';
  }

  // Seção de dados pessoais
  get tituloDadosPessoais() {
    return 'h3.ant-typography';
  }
  get formDadosPessoais() {
    return '#FormsPersonalData';
  }

  // Campos de dados pessoais (todos disabled — só leitura)
  get inputNome() {
    return '#FormsPersonalData_name';
  }
  get inputCpf() {
    return '#FormsPersonalData_documentNumber';
  }
  get inputNascimento() {
    return '#FormsPersonalData_birthDate';
  }
  get inputCelular() {
    return '#FormsPersonalData_phone';
  }
  get inputEmail() {
    return '#FormsPersonalData_email';
  }

  // Nome do usuário — valor do input nome
  get nomeUsuarioPerfil() {
    return '#FormsPersonalData_name';
  }

  // Seção de endereço de entrega
  get formEndereco() {
    return '#FormsDeliveryAddressPersonal';
  }
  get inputCep() {
    return '#FormsDeliveryAddressPersonal_zipCode';
  }
  get inputEstado() {
    return '#FormsDeliveryAddressPersonal_state';
  }
  get inputRua() {
    return '#FormsDeliveryAddressPersonal_street';
  }
  get inputNumero() {
    return '#FormsDeliveryAddressPersonal_number';
  }
  get inputCidade() {
    return '#FormsDeliveryAddressPersonal_city';
  }

  // Dados cadastrais — container que engloba dados pessoais + endereço
  get dadosCadastrais() {
    return '.container-form-personal-data';
  }

  // Botão salvar dados
  get btnSalvarDados() {
    return 'button[data-testid="vert-button"]';
  }

  // ─── Parceiros de Viagem ────────────────────────────────────────────────────
  get menuViagens() {
    return 'a[href*="travel"], a[href*="viagens"], [data-label="Viagens"], [data-testid="menu-travel"]';
  }
  get cardBeflyConecta() {
    return '[data-testid="partner-befly"], [class*="befly"], a[href*="befly"]';
  }
}

export default CatalogoElements;
