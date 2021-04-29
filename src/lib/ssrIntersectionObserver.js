const PolyfillIntersectionObserver = function PolyfillIntersectionObserver(
  handle = () => {},
  options = {}
) {};

PolyfillIntersectionObserver.prototype = {
  observe: function observe() {},
  unobserve: function unobserve() {}
};

export default PolyfillIntersectionObserver;
