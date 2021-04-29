import Event from "./event";
import "./intersection-observer";
import SsrIntersectionObserver from "./ssrIntersectionObserver";

import isIE from "./isIE";

const defaultHandler = (event) => (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.intersectionRatio > 0) {
      event.trigger("lazyload", entry.target);
    }
  });
};

/**
 * 创建一个 IntersectionObserver 对象和 event 对象并返回
 * IntersectionObserver https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API
 * @param {Object} options IntersectionObserver 的 option
 *    root       所监听对象的具体祖先元素(element)，如果未传入任何值或值为null，则默认使用viewport
 *    rootMargin 计算交叉时添加到根(root)边界盒bounding box的矩形偏移量， 可以有效的缩小或扩大根的判定范围从而满足计算需要。
 *               此属性返回的值可能与调用构造函数时指定的值不同，因此可能需要更改该值，以匹配内部要求。
 *               所有的偏移量均可用像素(pixel)(px)或百分比(percentage)(%)来表达, 默认值为"0px 0px 0px 0px"。
 *    threshold  设定监控的阈值，是一个数组，默认[0]，意味着当目标元素在根元素上可见程度达到该值得时候，调用处理函数。
 *               可以是一组0到1的数字 [0.3, 0.5, 1]，意味着当目标元素在根元素上可见程度达到 30% 50% 100% 的时候，调用处理函数
 *
 * @param {Function} handler 观察者回调，该回调函数形式如下，需要先将event传给该函数生成一个供 IntersectionObserver 使用的函数
 *  const handler = event => (entries, observer) => {
 *      entries.forEach(entry => {
 *          if (entry.intersectionRatio > 0) {
 *              event.trigger('lazyload', entry.target);
 *          }
 *      });
 *  };
 *
 * @param {Object} config polyfill中的一些配置，通常情况下不需要配置
 *   THROTTLE_TIMEOUT 节流的时间，默认为 100 毫秒
 *   POLL_INTERVAL 边界检查的时长，默认为 null，不使用定时器，使用事件去触发，不过在ie7-8下面document下的scroll无法触发，需要使用轮询去检查
 *   USE_MUTATION_OBSERVER 是否使用 MutationObserver，这个一般也不用设置
 *
 * @returns {Object} 返回一个对象，包含 event 对象和 observer 对象
 */

export default function createObserver(
  options = {},
  handler = defaultHandler,
  config = {}
) {
  const event = new Event();
  const RealIntersectionObserver =
    typeof IntersectionObserver !== "undefined"
      ? IntersectionObserver
      : SsrIntersectionObserver;
  const observer = new RealIntersectionObserver(handler(event), options);

  if (isIE(7) || isIE(8)) {
    observer.POLL_INTERVAL = 300;
  }

  const configs = [
    "THROTTLE_TIMEOUT",
    "POLL_INTERVAL",
    "USE_MUTATION_OBSERVER"
  ];

  Object.keys(config).forEach((key) => {
    if (configs.includes(key)) {
      observer[key] = config[key];
    }
  });

  return { event, observer };
}
