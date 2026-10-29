class HomeElements {
  // Logo e Identidade
  get imgPortoPlus() {
    return '.logoHeader';
  }
  get imgUser() {
    return 'a img[src^="data:image"]';
  }

  // Menu Principal
  get txtSobrePorto() {
    return 'a[href="/sobre-o-portoplus"]';
  }
  get btnPraMim() {
    return 'button:contains("Para mim")';
  }
  get btnMeusPontos() {
    return 'button:contains("Meus Pontos")';
  }
  get btnTrocarPontos() {
    return 'button:contains("Trocar Pontos")';
  }
  get btnComprarComDesconto() {
    return 'button:contains("Comprar com ")';
  }

  // Submenus - Para Mim
  get txtMeusVouchers() {
    return 'a:contains("Meus Vouchers")';
  }
  get txtMeusRelacionamentos() {
    return 'a:contains("Meus Relacionamentos")';
  }
  get txtFaqCartao() {
    return 'a:contains("FAQ Cartão")';
  }
  get txtFaqComprasDesconto() {
    return 'a:contains("FAQ Compras Com Desconto")';
  }
  get txtProdutosPorto() {
    return 'a:contains("Produtos Porto")';
  }

  // Submenus - Meus Pontos
  get txtMeuExtrato() {
    return 'a:contains("Meu Extrato")';
  }
  get txtHistoricoExtrato() {
    return 'a:contains("Histórico de Resgates")';
  }
  get txtProgramaAnterior() {
    return 'a:contains("Programa Anterior")';
  }

  // FAQ
  get txtMenuFaq() {
    return '.itemPrimeiroNivel';
  }
  get txtSubMenuFaq() {
    return '.submenu';
  }
  get iconSetaFaq() {
    return '.iconeSeta';
  }

  // Saldo e Modal
  get modalSaldo() {
    return 'div:contains("Clique para ver o saldo")';
  }
  get txtSaldoDisponivel() {
    return 'span:contains("Disponível")';
  }

  // Usuário
  get txtNomeUsuario() {
    return '.nomeUsuario';
  }
  get txtEntrar() {
    return 'span:contains("Entrar")';
  }
  get btnSair() {
    return 'a[href="/logout"]';
  }

  // Cards e Seções
  get btnCardTroquePontos() {
    return 'span:contains("Troque")';
  }
  get btnCardCompreProdutos() {
    return 'span:contains("Compre produtos e serviços com")';
  }
  get txtTitleServicos() {
    return '.col-md-12';
  }
  get txtTitleTroquePontos() {
    return '.cXQWSm';
  }
  get txtTitleParceirosViagens() {
    return '.kevlZl';
  }
  get txtTitleDescontosExclusivos() {
    return 'span:contains("Economize com )';
  }

  // Banner e Footer
  get banner() {
    return '.carousel-root';
  }
  get footer() {
    return 'a.imgFooter';
  }

  // Marketplace Preview
  get txtPreviaMarkeplace() {
    return 'h2:contains("Confira uma prévia")';
  }
  get btnVerMais() {
    return 'button:contains("Ver Mais")';
  }
  get txtVantagensExclusivas() {
    return 'strong:contains("Quem é Porto, economiza e tem vantagens exclusivas no dia a dia.")';
  }
  get btHome() {
    return '#0:contains("Home")';
  }
  get txtMkt() {
    return '.vert-template-marketplace';
  }
  get btnAlguelCarro() {
    return '#1:contains("Aluguel de Carro")';
  }

  // Serviços Porto
  get btnSeguroAuto() {
    return 'h2:contains("Seguro Auto")';
  }
  get btnSeguroAzul() {
    return 'h2:contains("Seguro Azul")';
  }
  get btnSeguroResidencia() {
    return 'h2:contains("Seguro Residência")';
  }
  get btnFinanciamento() {
    return 'h2:contains("Financiamento")';
  }
  get btnVida() {
    return 'h2:contains("Vida")';
  }
  get btnPortoServicos() {
    return 'h2:contains("Porto Serviço")';
  }
  get btnInstitutoPorto() {
    return 'h2:contains("Instituto Porto")';
  }

  // Cards Marketplace - Produtos
  get btnGame() {
    return 'li[data-index="4"] img[src*="ps5"]';
  }
  get btnCasaECozinha() {
    return 'li[data-index="5"] img[src*="geladeira"]';
  }
  get btnEletronicos() {
    return 'li[data-index="6"] img[src*="edot"]';
  }
  get btnTVs() {
    return 'li[data-index="7"] img[src*="TV"]';
  }

  // Cards Parceiros - Viagens
  get btnSmiles() {
    return '.col-md-9 > .react-multi-carousel-list > .react-multi-carousel-track > [data-index="4"] > .m-2 > .m-3';
  }
  get btnAzul() {
    return '.col-md-9 > .react-multi-carousel-list > .react-multi-carousel-track > [data-index="5"] > .m-2 > .m-3';
  }
  get btnMiles() {
    return '.col-md-9 > .react-multi-carousel-list > .react-multi-carousel-track > [data-index="6"] > .m-2 > .m-3';
  }
  get btnLatam() {
    return '.col-md-9 > .react-multi-carousel-list > .react-multi-carousel-track > [data-index="7"] > .m-2 > .m-3';
  }

  get txtTrocarPontos() {
    return '#trocar-pontos-header';
  }
}

export default HomeElements;
