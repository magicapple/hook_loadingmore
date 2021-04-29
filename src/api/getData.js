const getData = (val = "", type = "success", delay = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (type === "success") {
        resolve(val);
      } else {
        reject(val);
      }
    }, delay);
  });
};

export default getData;
