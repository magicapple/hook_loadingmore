import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import "./index.css";
import createObserver from "../lib/createObserver";

/**
 * WATCHING -- 开启加载更多的监控
 * LOADING  -- 正在加载，在此状态会跳过监控
 * END      -- 加载更多结束，此状态会关闭监控，为最终状态
 * ERROR    -- 加载更多出错，此状态会跳过监控
 * 状态流转图 https://www.processon.com/view/link/6078f543f346fb647a551c66
 */
const STATE = {
  WATCHING: "watching",
  LOADING: "loading",
  END: "end",
  ERROR: "error"
};

/**
 * @param {Function} control 该方法返回一个promise对象，
 *      resolve 返回三个值
 *          success ===> STATE.WATCHING
 *          end ===> STATE.END
 *          error ===> STATE.ERROR
 *      reject ===> STATE.ERROR
 * @returns {Array} [domRef, state, retryHandle] 返回一个数组
 *      domRef 绑定监控事件的dom元素
 *      state  当前的状态，参考STATE
 *      retryHandle 执行可以将 STATE.ERROR ===> STATE.LOADING
 */
const useLoadingMore = (control) => {
  const domRef = useRef(null);
  const unbindRef = useRef(null);
  const ob = useRef(createObserver());
  const [state, setState] = useState(STATE.WATCHING);

  useEffect(() => {
    const { event, observer } = ob.current;
    const dom = domRef.current;

    observer.observe(dom);
    unbindRef.current = event.on("lazyload", (target) => {
      if (domRef.current === target) {
        setState((state) => {
          return state === STATE.WATCHING ? STATE.LOADING : state;
        });
      }
    });

    return () => {
      unbindRef.current();
      observer.unobserve(dom);
    };
  }, [state]);

  useEffect(() => {
    if (state === STATE.LOADING) {
      control()
        .then((res) => {
          switch (res) {
            case "success":
              setState(STATE.WATCHING);
              break;
            case "end":
              setState(STATE.END);
              break;
            case "error":
            default:
              setState(STATE.ERROR);
              break;
          }
        })
        .catch(() => {
          setState(STATE.ERROR);
        });
    }
  }, [state, control]);

  const retryHandle = () => {
    setState(STATE.LOADING);
  };

  return [state, domRef, retryHandle];
};

const STATETEXT = {
  [STATE.WATCHING]: "",
  [STATE.LOADING]: "加载中...",
  [STATE.END]: "已全部加载",
  [STATE.ERROR]: "加载失败"
};

/**
 * 加载更多组件，使用了 useLoadingMore，如果ui和交互不一样，可以使用useLoadingMore再开发一个。
 */
const LoadingMore = ({ control }) => {
  const [state, domRef, retryHandle] = useLoadingMore(control);

  return (
    <div ref={domRef} className="loading">
      {state === STATE.WATCHING ? null : (
        <span>
          {STATETEXT[state]}
          {state === STATE.ERROR ? (
            <em onClick={retryHandle}>点击重试</em>
          ) : null}
        </span>
      )}
    </div>
  );
};

LoadingMore.propTypes = {
  control: PropTypes.func.isRequired
};

export { STATE, useLoadingMore };

export default LoadingMore;
