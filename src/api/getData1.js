const delayList = [];
let index = -1;
const getData = (keyWord = "", current = 1, pageSize = 3, delay = 500) => {
  index++;
  return new Promise((resolve, reject) => {
    console.log("getData begin", keyWord, current);
    setTimeout(() => {
      // if (Math.random() > 0.5) {
      //   console.log("reject error");
      //   reject("error");
      //   return;
      // }
      const data = [];
      if (current < 5) {
        for (let i = 0; i < pageSize; i++) {
          data.push(`${keyWord}-${current}-${i}---${Date.now()}`);
        }
      } else if (current === 5) {
        for (let i = 0; i < 2; i++) {
          data.push(`${keyWord}-${current}-${i}---${Date.now()}`);
        }
      }
      console.log("resolve", data);
      resolve(data);
    }, delayList[index] || delay);
  });
};

export default getData;
