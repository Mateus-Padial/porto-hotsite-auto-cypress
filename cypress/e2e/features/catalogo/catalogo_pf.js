const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');
import CatalogoPage from '../../gui/pages/catalogo/CatalogoPage.js';

const catalogo = new CatalogoPage();

// ─── BACKGROUND ────────────────────────────────────────────────────────────────
// Todos os cenários do catálogo partem do SSO direto via API — sem passar pelo hotsite.
Given(`que o usuário está autenticado no catálogo via SSO`, () => {
  catalogo.acessarCatalogoViaUrlSSO();
});

// ─── CT01 — Acessar catálogo via SSO ───────────────────────────────────────────
Then(`deve visualizar o catálogo de pontos pessoa física`, () => {
  catalogo.validarAcessoCatalogo();
});

// ─── CT02 — Jornada guiada ─────────────────────────────────────────────────────
Then(`deve percorrer e concluir todos os passos da jornada guiada`, () => {
  catalogo.concluirJornadaGuiada();
});

// ─── CT03 — Carrinho ───────────────────────────────────────────────────────────
When(`o usuário seleciona um produto na vitrine`, () => {
  catalogo.selecionarProdutoVitrine();
});

When(`adiciona o produto ao carrinho`, () => {
  catalogo.adicionarAoCarrinho();
});

Then(`o carrinho deve exibir o produto adicionado`, () => {
  catalogo.validarProdutoNoCarrinho();
});

// ─── CT04 — Favoritos ──────────────────────────────────────────────────────────
When(`marca o produto como favorito`, () => {
  catalogo.marcarProdutoComoFavorito();
});

Then(`o produto deve aparecer na lista de favoritos`, () => {
  catalogo.validarProdutoNaListaDeFavoritos();
});

// ─── CT05 — Busca ──────────────────────────────────────────────────────────────
When(`o usuário digita {string} na barra de pesquisa`, (termo) => {
  catalogo.digitarNaBusca(termo);
});

When(`confirma a busca`, () => {
  catalogo.confirmarBusca();
});

Then(`os resultados devem exibir produtos relacionados ao termo {string}`, (termo) => {
  catalogo.validarResultadosBusca(termo);
});

// ─── CT06 — Saldo de pontos ────────────────────────────────────────────────────
Then(`o saldo de pontos do usuário deve estar visível`, () => {
  catalogo.validarSaldoPontosVisivel();
});

Then(`o saldo deve ser um valor numérico válido`, () => {
  catalogo.validarSaldoNumerico();
});

// ─── CT07 — Extrato de pontos ──────────────────────────────────────────────────
When(`o usuário acessa o extrato de pontos`, () => {
  catalogo.acessarExtratoPontos();
});

Then(`o extrato deve exibir o histórico de movimentações`, () => {
  catalogo.validarExtratoVisivel();
});

Then(`cada movimentação deve conter data, descrição e valor de pontos`, () => {
  catalogo.validarDadosMovimentacao();
});

// ─── CT08 — Categorias ─────────────────────────────────────────────────────────
When(`o usuário seleciona a categoria {string}`, (categoria) => {
  catalogo.selecionarCategoria(categoria);
});

Then(`apenas produtos devem ser exibidos na vitrine`, () => {
  catalogo.validarProdutosVitrine();
});

// ─── CT09 — Perfil ─────────────────────────────────────────────────────────────
When(`o usuário acessa a área de perfil`, () => {
  catalogo.acessarPerfil();
});

Then(`os dados cadastrais do usuário devem ser exibidos corretamente`, () => {
  catalogo.validarDadosPerfil();
});

Then(`o nome do usuário deve estar visível no perfil`, () => {
  catalogo.validarNomeUsuarioPerfil();
});

// ─── CT10 — Voucher (@skip) ────────────────────────────────────────────────────
When(`o usuário navega até a categoria de vouchers`, () => {
  catalogo.navegarParaVouchers();
});

When(`seleciona um voucher disponível`, () => {
  catalogo.selecionarVoucher();
});

When(`confirma o resgate do voucher`, () => {
  catalogo.confirmarResgateVoucher();
});

Then(`o voucher deve ser exibido em Meus Vouchers`, () => {
  catalogo.validarVoucherResgatado();
});

// ─── CT11 — Milhas (@skip) ────────────────────────────────────────────────────
When(`o usuário navega até a categoria de milhas`, () => {
  catalogo.navegarParaMilhas();
});

When(`seleciona uma companhia aérea parceira`, () => {
  catalogo.selecionarCompanhiaAerea();
});

When(`confirma a transferência de milhas`, () => {
  catalogo.confirmarTransferenciaMilhas();
});

Then(`a transferência deve ser registrada com sucesso`, () => {
  catalogo.validarTransferenciaMilhas();
});

// ─── CT12 — Recarga (@skip) ───────────────────────────────────────────────────
When(`o usuário navega até a categoria de recargas`, () => {
  catalogo.navegarParaRecargas();
});

When(`informa um número de celular válido`, () => {
  catalogo.informarNumeroCelular();
});

When(`seleciona o valor da recarga`, () => {
  catalogo.selecionarValorRecarga();
});

When(`confirma a recarga`, () => {
  catalogo.confirmarRecarga();
});

Then(`a recarga deve ser processada com sucesso`, () => {
  catalogo.validarRecargaProcessada();
});

// ─── CT13 — Parceiro Befly (@skip) ────────────────────────────────────────────
When(`o usuário acessa a seção de parceiros de viagem`, () => {
  catalogo.acessarParceirosViagem();
});

When(`seleciona o parceiro Befly Conecta`, () => {
  catalogo.selecionarParceiroBefly();
});

Then(`deve ser redirecionado corretamente para o ambiente da Befly`, () => {
  catalogo.validarRedirecionamentoBefly();
});
