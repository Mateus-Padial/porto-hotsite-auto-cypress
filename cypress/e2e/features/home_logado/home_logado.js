const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

import HomePage from '../../gui/pages/HomePage.js';
import MeusVouchersPage from '../../gui/pages/cenario_logado/MeusVouchersPage.js';
import MeusRelacionamentosPage from '../../gui/pages/cenario_logado/MeusRelacionamentosPage.js';
import FaqCartaoPage from '../../gui/pages/cenario_logado/FaqCartaoPage.js';
import MeuExtratoPage from '../../gui/pages/cenario_logado/MeuExtratoPage.js';
import HistoricoResgatesPage from '../../gui/pages/cenario_logado/HistoricoResgatesPage.js';
import ProgramaAnteriorPage from '../../gui/pages/cenario_logado/ProgramaAnteriorPage.js';
import ProdutosPortoPage from '../../gui/pages/cenario_logado/ProdutosPortoPage.js';

const home = new HomePage();
const vouchers = new MeusVouchersPage();
const relacionamentos = new MeusRelacionamentosPage();
const faqCartao = new FaqCartaoPage();
const meuExtrato = new MeuExtratoPage();
const historicoResgates = new HistoricoResgatesPage();
const programaAnterior = new ProgramaAnteriorPage();
const produtosPortoPlus = new ProdutosPortoPage();

Given(`que o usuário logue no hotsite PortoPlus`, () => {
  home.login();
});

Then(`o usuário deve visualizar seu nome junto ao ícone de usuário`, () => {
  home.validaHomeUsuarioLogado();
});

Then(`deve visualizar novos menus disponíveis`, () => {
  home.validaNovosMenusUsuarioLogado();
});

When(`o usuário clica no módulo de saldo`, () => {
  home.validaClickModalSaldo();
});

Then(`deve visualizar corretamente o saldo de pontos`, () => {
  home.validaSaldoDisponivel();
});

When(`o usuário clica no submenu {string}`, (submenu) => {
  home.clicarNoSubmenu(submenu);
});

Then(`deve ser redirecionado para a página {string}`, (url) => {
  home.validarUrlEsperada(url);
});

Given(`que o usuário está na página Meus Vouchers`, () => {
  home.acessarPaginaMeusVouchers();
});

Then(`deve ser validar a pagina Meus Voucher:`, (elements) => {
  vouchers.validaElementosPaginaMeuVouchers(elements);
});

Given(`que o usuário está na página Meus Relacionamentos`, () => {
  home.acessarPaginaMeusRelacionamentos();
});

Then(`deve ser validar a pagina Meus Relacionamentos:`, (elements) => {
  relacionamentos.validaElementosPaginaMeusRelacionamentos(elements);
});

Given(`que o usuário está na página FAQ Cartão`, () => {
  home.acessarPaginaFaqCartao();
});

Then(`deve ser validar a pagina FAQ Cartão:`, (elements) => {
  faqCartao.validaElementosPaginaFaqCartao(elements);
});

Given(`que o usuário está na página Produtos Porto`, () => {
  home.acessarPaginaProdutosPorto();
});

Then(`deve ser validar a pagina Produtos Porto:`, (elements) => {
  produtosPortoPlus.validaElementosPaginaProdutosPorto(elements);
});

Given(`que o usuário está na página Meu Extrato`, () => {
  home.acessarPaginaMeuExtrato();
});

Then(`deve ser validar a pagina Meu Extrato:`, (elements) => {
  meuExtrato.validaElementosPaginaMeuExtrato(elements);
});

Given(`que o usuário está na página Histórico de Resgates`, () => {
  home.acessarPaginaHistoricoResgates();
});

Then(`deve ser validar a pagina Historico de Resgates:`, (elements) => {
  historicoResgates.validaElementosPaginaHistoricoResgates(elements);
});

Given(`que o usuário está na página Programa Anterior`, () => {
  home.acessarPaginaProgramaAnterior();
});

Then(`deve ser validar a pagina Programa Anterior:`, (elements) => {
  programaAnterior.validaElementosPaginaProgramaAnterior(elements);
});

When(`o usuário clica em {string} na seção Troque Pontos`, (elements) => {
  home.prepararStubRedirecionamento();
  home.clickCardsTroquePontos(elements);
});

Then(`deve ser redirecionado para o marketplace`, () => {
  home.validarUrlEsperadaTroquePontosLogado();
});

When(`o usuário clica na opção Troca de Pontos`, () => {
  home.clickTrocarPontos();
});

Then(`deve ser redirecionado para o marketplace PortoPlus`, () => {
  home.inteceptaResquestCatalogo();
});

When(`o usuário clica no botão Sair no perfil`, () => {
  home.clickLogout();
});

Then(`deve ser redirecionado para o hotsite já deslogado`, () => {
  home.validarLogoutRedirect();
});
