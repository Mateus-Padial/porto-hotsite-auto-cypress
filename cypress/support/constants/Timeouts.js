class Timeouts {
  static get DEFAULT() {
    return 7000;
  }
  static get SHORT() {
    return 1500;
  }
  static get MEDIUM() {
    return 10000;
  }
  static get LONG() {
    return 15000;
  }
  static get EXTRA_LONG() {
    return 20000;
  }
  static get PAGE_LOAD() {
    return 30000;
  }
  static get API_REQUEST() {
    return 15000;
  }
  static get ELEMENT_VISIBLE() {
    return 10000;
  }
  static get ANIMATION() {
    return 500;
  }
}

export default Timeouts;
