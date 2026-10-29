class SobreOPortoPlusElements {
  get txtRegulamentoSobrePorto() {
    return 'h4:contains("Regulamento do PortoPlus")';
  }
  get infoRegulamentoSobrePorto() {
    return '.sc-hCgVqe';
  }
  get linkDownload() {
    return 'a:contains("Download")';
  }
  get imgDownload() {
    return 'a:contains("Download")';
  }
  get breadCrumb() {
    return 'a[href="/"]:contains("Home")';
  }
}

export default SobreOPortoPlusElements;
