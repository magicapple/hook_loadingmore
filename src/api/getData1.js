const getData = (keyWord = "", current = 1, pageSize = 3, delay = 500) => {
  return new Promise((resolve, reject) => {
    console.log("getData begin", keyWord, current);
    setTimeout(() => {
      if (Math.random() > 0.7) {
        reject("error");
      }
      const data = [];
      if (current < 5) {
        for (let i = 0; i < pageSize; i++) {
          data.push(`${keyWord}-${current}-${i}`);
        }
      } else if (current === 5) {
        for (let i = 0; i < 2; i++) {
          data.push(`${keyWord}-${current}-${i}`);
        }
      }
      resolve(data);
    }, delay);
  });
};

export default getData;
