class MeuExtratoElements {
  get txtTitulo() {
    return 'h1:contains("Meu Extrato")';
  }
  get menuLateral() {
    return 'a:contains("Meu Extrato")';
  }
  get txtSaldo() {
    return 'h4:contains("Saldo")';
  }
  get txtHistorico() {
    return 'h4:contains("Histórico")';
  }
  get btnDetalhePontos() {
    return 'button:contains("Detalhe dos pontos")';
  }
  get btnPontosExpirar() {
    return 'button:contains("Pontos a expirar")';
  }
}

export default MeuExtratoElements;
