import "./styles.css";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { unstable_batchedUpdates } from "react-dom";
import getData from "../api/getData1";
import createObserver from "../lib/createObserver";
import _ from "lodash";
import useSWR, { createCache } from "swr";

// todo 对搜索词如果反复的话，数据可能会有问题

const getStateText = (isLoading, isError, isEnd, keyword) => {
  if (!keyword) {
    return "";
  }
  if (isLoading) {
    return "数据加载中...";
  }
  if (isError) {
    return "加载失败，点击重试";
  }
  if (isEnd) {
    return "没有更多数据了";
  }
  return "";
};

const useObserver = (callback) => {
  const domRef = useRef(null);
  const unbindRef = useRef(null);
  const ob = useRef(createObserver());

  useEffect(() => {
    console.log("observerEffect trigger");
    const { event, observer } = ob.current;
    const dom = domRef.current;
    observer.observe(dom);
    unbindRef.current = event.on("lazyload", (target) => {
      if (domRef.current === target) {
        callback();
      }
    });

    return () => {
      unbindRef.current();
      observer.unobserve(dom);
    };
  }, [callback]);

  return [domRef];
};

const isLoading = (data, error) => !(data || error);
const isError = (error) => !!error;
const isEnd = (data, pageSize) => data && data.length < pageSize;

export default function App() {
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);
  const [cache, setCache] = useState(createCache(new Map()).cache);

  const { data, error, mutate } = useSWR(
    keyword !== "" ? [keyword, currentPage, pageSize] : null,
    getData,
    {
      onErrorRetry: () => {
        return;
      }, // 重新定义重试处理函数，关闭swr的错误重试
      revalidateOnFocus: false, // 关闭窗口聚焦时自动重新验证
      revalidateOnReconnect: false, // 浏览器恢复网络连接时自动重新验证
      cache
    }
  );

  const handleRetryClick = useCallback(() => {
    if (isError(error)) {
      mutate(""); // 不赋值的话，无法触发重新渲染，刷新不了loading状态
    }
  }, [mutate, error]);

  const handleLoading = useCallback(() => {
    if (!isLoading(data, error) && !isError(error) && !isEnd(data, pageSize)) {
      setCurrentPage((page) => page + 1);
    }
  }, [data, error, pageSize]);

  const [domRef] = useObserver(handleLoading);

  const changeKeyWord = useCallback((event) => {
    // 注意：这个地方顺序不对会导致各种问题，没想到每个useState是单独渲染的，是不是可以考虑用useReducer
    unstable_batchedUpdates(() => {
      setKeyword(event.target.value);
      setList([]);
      setCache(createCache(new Map()).cache);
      setCurrentPage(1);
    });
  }, []);

  const handleChange = useMemo(() => _.debounce(changeKeyWord, 10), [
    changeKeyWord
  ]);
  useEffect(() => {
    if (data) {
      setList((list) => {
        return [...list, ...data];
      });
    }
  }, [data]);

  return (
    <div className="App">
      <div>
        关键词：
        <input type="text" onChange={handleChange} />
      </div>
      {list.length > 0
        ? list.map((item, index) => (
            <div key={index} className="item">
              {item}
            </div>
          ))
        : "无内容"}
      <div
        onClick={handleRetryClick}
        ref={domRef}
        style={{ width: 200, margin: "10px auto" }}
      >
        {getStateText(
          isLoading(data, error),
          isError(error),
          isEnd(data, pageSize),
          keyword
        )}
      </div>
    </div>
  );
}
