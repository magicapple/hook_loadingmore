const isIE = function isIE(ver) {
  if (typeof document !== "undefined") {
    const b = document.createElement("b");

    b.innerHTML = `<!--[if IE ${ver}]><i></i><![endif]-->`;

    return b.getElementsByTagName("i").length === 1;
  } else {
    return false;
  }
};

export default isIE;
