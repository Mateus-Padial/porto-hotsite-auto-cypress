const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

import HomePage from '../../gui/pages/HomePage.js';
import SobreOPortoPlusPage from '../../gui/pages/cenario_deslogado/SobreOPortoPlusPage.js';
import FaqComprarComDescontoPage from '../../gui/pages/cenario_deslogado/FaqComprarComDescontoPage.js';

const home = new HomePage();
const sobreOPortoPlus = new SobreOPortoPlusPage();
const faqComprarComDesconto = new FaqComprarComDescontoPage();

Given(`que o usuário acessa o hotsite PortoPlus`, () => {
  home.acessarHotsite();
  home.dispensaCookies();
});

Then(`o usuário deve visualizar os seguintes elementos na home:`, (dataTable) => {
  home.validaElementosNaHome(dataTable);
});

When(`o usuário clica no link Sobre o PortoPlus`, () => {
  home.clickSobrePortoPlus();
});

Then(`deve visualizar o conteúdo da página`, () => {
  home.validaDirecionamentoSobrePorto();
});

When(`o usuário clica na seta do link {string}`, (arg0) => {
  home.acessoPaginaSobreOPortoPlus();
});

Then(`o conteúdo deve alternar entre exibido e oculto`, () => {
  sobreOPortoPlus.validaRegulamentoSobrePortoPlus();
});

When(`o usuário clica no link {string} do regulamento`, (arg0) => {
  home.acessoPaginaSobreOPortoPlus();
  sobreOPortoPlus.validaRegulamentoSobrePortoPlus();
});

Then(`o arquivo deve ser baixado no formato {string}`, (arg0) => {
  sobreOPortoPlus.validaDownloadRegulamentoPortoPlus();
});

When(`o usuário clica no PDF do regulamento`, () => {
  home.acessoPaginaSobreOPortoPlus();
  sobreOPortoPlus.validaRegulamentoSobrePortoPlus();
});

Then(`uma nova aba é aberta com o conteúdo do regulamento`, () => {
  sobreOPortoPlus.validaDirecionamentoPdfRegulamento();
});

When(`o usuário clica no breadcrumb Home`, () => {
  home.acessoPaginaSobreOPortoPlus();
  sobreOPortoPlus.pegaUrlAtual();
  sobreOPortoPlus.clickBreadCrumbHome();
});

Then(`o usuário deve ser redirecionado para a home`, () => {
  sobreOPortoPlus.validaDirecionamentoClickBreadCrumb();
});

When(`o usuário clica no link {string}`, (arg0) => {
  home.clickFaqComprarComDesconto(arg0.includes('FAQ Compras') ? 'FAQ Compras Com Desconto' : arg0);
});

Then(`deve visualizar o conteúdo correspondente`, () => {
  faqComprarComDesconto.validarPaginaFaqComprarComDesconto();
});

When(`o usuário clica no banner da home`, () => {
  home.pegaUrlAtual();
  home.clickBanner();
});

Then(`deve ser redirecionado para a página vinculada ao banner`, () => {
  home.validaDirecionamentoClickBanner();
});

Then(`deve ser redirecionado para a página de login`, () => {
  home.validarDirecionamentoPaginaLogin();
});
When(`o usuário clica no card Troque pontos por produtos e serviços`, () => {
  home.clickTroquePontos();
});

Then(`deve visualizar uma prévia de produtos e categorias`, () => {
  home.validaInfoTroquePontosHome();
});

When(`o usuário clica no card Compre produtos e serviços com descontos`, () => {
  home.clickCompreComDesconto();
});

Then(`deve visualizar catálogo de ofertas com filtros`, () => {
  home.validarInfoCompreComDesconto();
});

When(`o usuário clica no serviço {string}`, (servico) => {
  home.clickServico(servico);
});

Then(`deve ser redirecionado para {string}`, (url) => {
  home.validaRedirecionamentoServico(url);
});

When(`o usuário clica em {string} na seção Troque Pontos`, (cards) => {
  home.clickCardsTroquePontos(cards);
});

When(`o usuário clica em {string} em Parceiros de viagem`, (cards) => {
  home.clickCardsParceiros(cards);
});

Then(`deve ser redirecionado para a pagina {string}`, (url) => {
  home.validarUrlEsperada(url);
});
