import "./styles.css";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import getData from "../api/getData1";
import createObserver from "../lib/createObserver";
import _ from "lodash";
import { useSWRInfinite } from "swr";

const getStateText = (
  isLoadingInitialData,
  isLoadingMore,
  isError,
  isReachingEnd,
  isRefreshing
) => {
  if (isLoadingInitialData) {
    return "";
  }
  if (isError) {
    return "加载失败，点击重试";
  }
  if (isLoadingMore || isRefreshing) {
    return "数据加载中...";
  }
  if (isReachingEnd) {
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

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [pageSize] = useState(3);

  // todo 对于参数判断这块，在有cache的情况下，会出现返回data格式不符合预期的问题。
  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (index) => [keyword, index + 1, pageSize],
    getData,
    {
      onErrorRetry: () => {
        return;
      }, // 重新定义重试处理函数，关闭swr的错误重试
      revalidateOnFocus: false, // 关闭窗口聚焦时自动重新验证
      revalidateOnReconnect: false // 浏览器恢复网络连接时自动重新验证
      // persistSize: true
    }
  );
  console.log("data-->", data, error, size, isValidating);
  const list = data ? [].concat(...data) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isError = !!error;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < pageSize);
  const isRefreshing = isValidating && data && data.length === size;

  console.log(
    "state==>",
    isLoadingInitialData,
    isLoadingMore,
    isEmpty,
    isError,
    isReachingEnd,
    isRefreshing
  );

  const handleRetryClick = useCallback(() => {
    if (isError) {
      setSize(size);
    }
  }, [isError, setSize, size]);

  const handleLoading = useCallback(() => {
    if (!isLoadingInitialData && !isLoadingMore && !isError && !isReachingEnd) {
      setSize((size) => size + 1);
    }
  }, [isLoadingInitialData, isLoadingMore, isError, isReachingEnd, setSize]);

  const [domRef] = useObserver(handleLoading);

  const changeKeyWord = useCallback(
    (event) => {
      setKeyword(event.target.value);
      setSize(1);
    },
    [setSize]
  );

  const handleChange = useMemo(() => _.debounce(changeKeyWord, 10), [
    changeKeyWord
  ]);

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
          isLoadingInitialData,
          isLoadingMore,
          isError,
          isReachingEnd,
          isRefreshing
        )}
      </div>
    </div>
  );
}
