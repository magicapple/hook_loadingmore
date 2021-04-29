export default class Event {
  constructor() {
    this.events = {};
  }

  /**
   * 注册一个自定义事件
   * @param {String} name 自定义事件名称
   * @param {Function} callback 回调函数
   * @returns {Function} 返回注销该事件的方法
   */
  on(name, callback) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(callback);

    return () => {
      this.off(name, callback);
    };
  }

  /**
   * 注销自定义事件
   * @param {String} name 要注销的自定义事件名称
   * @param {Function} callback 要注销的回调函数 （如果注册的是匿名函数，则无法注销）
   */
  off(name, callback) {
    if (this.events[name]) {
      if (typeof callback === "undefined") {
        this.events[name] = [];
      } else {
        this.events[name] = this.events[name].filter(
          (item) => callback !== item
        );
      }
    }
  }

  /**
   * 触发自定义事件
   * @param {String} name 要触发的自定义事件名称
   * @param {Array} data 给回调的参数值
   */
  trigger(name, ...data) {
    if (this.events[name]) {
      this.events[name].forEach((callback) => callback(...data));
    }
  }
}
