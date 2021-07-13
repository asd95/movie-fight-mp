function deBounce (cb, delay = 1000) {
  let seto;
  return (...args) => {
    if (seto) {
      clearTimeout(seto);
    }
    seto = setTimeout(() => {
      cb.call(null, ...args);
    }, delay);
  };
};
