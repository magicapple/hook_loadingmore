import "./styles.css";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import getData from "./api/getData1";
import createObserver from "./lib/createObserver";
import _ from "lodash";

const getStateText = (isLoading, isError, isEnd) => {
  // console.log("isLoading", isLoading, "isError", isError, "isEnd", isEnd);
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
    const { event, observer } = ob.current;
    const dom = domRef.current;
    unbindRef.current = event.on("lazyload", (target) => {
      if (domRef.current === target) {
        callback();
      }
    });
    observer.observe(dom);

    return () => {
      unbindRef.current();
      observer.unobserve(dom);
    };
  }, [callback]);

  return [domRef];
};

const useFetch = (keyWord, currentPage, pageSize, fetcher) => {
  const keywordRef = useRef("");
  const [list, setList] = useState([]);
  const [isLoading, changeLoadingState] = useState(false);
  const [isError, changeErrorState] = useState(false);
  const [isEnd, changeEndState] = useState(false);

  const fetchData = useCallback(async () => {
    keywordRef.current = keyWord;
    if (currentPage === 0 || keyWord === "") {
      changeLoadingState(false);
      changeEndState(false);
      changeErrorState(false);
      return;
    }
    changeLoadingState(true);
    changeEndState(false);
    changeErrorState(false);
    try {
      const data = await fetcher(keyWord, currentPage, pageSize);

      if (keyWord === keywordRef.current) {
        setList((list) => [...list, ...data]);
        if (data.length < pageSize) {
          changeEndState(true);
        }
      }
    } catch (error) {
      if (keyWord === keywordRef.current) {
        changeErrorState(true);
      }
    }
    if (keyWord === keywordRef.current) {
      changeLoadingState(false);
    }
  }, [keyWord, currentPage, pageSize, fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setList([]);
  }, [keyWord]);

  return [list, isLoading, isError, isEnd, fetchData];
};

export default function App() {
  const [pageSize] = useState(3);
  const [keyWord, setKeyWord] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const [list, isLoading, isError, isEnd, retry] = useFetch(
    keyWord,
    currentPage,
    pageSize,
    getData
  );

  const handleRetryClick = useCallback(() => {
    console.log("handleClick trigger");
    if (isError) {
      retry();
    }
  }, [retry, isError]);

  const handleLoading = useCallback(() => {
    console.log("handleClick trigger");
    if (!isLoading && !isError && !isEnd) {
      setCurrentPage((page) => page + 1);
    }
  }, [isLoading, isError, isEnd]);

  const [domRef] = useObserver(handleLoading);

  // useCallback 只能放入内联元素，如果需要对函数进行高阶函数的封装，可以有两种方法：
  // 1. 使用匿名函数进行包装，然后再调用
  // react-hooks/exhaustive-deps throws lint error Pass an inline function for valid scenarios
  // https://github.com/facebook/react/issues/19240
  // const handleChange = useCallback(
  //   _.debounce((event) => {
  //     setKeyWord(event.target.value);
  //     keywordRef.current = event.target.value;
  //     setCurrentPage(1);
  //     changeEndState(false);
  //     changeErrorState(false);
  //     setList([]);
  //   }, 500),
  //   []
  // );

  // const handleChange = useCallback((event) => {
  //   _.debounce((event) => {
  //     setKeyWord(event.target.value);
  //     keywordRef.current = event.target.value;
  //     setCurrentPage(1);
  //     changeEndState(false);
  //     changeErrorState(false);
  //     setList([]);
  //   }, 500)(event);
  // }, []);

  // 2. 使用useMemo对高阶函数进行封装，这个方案推荐的人比较多，不过要额外多封装一个函数。
  const changeKeyWord = useCallback((event) => {
    setKeyWord(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleChange = useMemo(() => _.debounce(changeKeyWord, 10), [
    changeKeyWord
  ]);

  return (
    <div className="App">
      <div>
        关键词：
        <input type="text" onChange={handleChange} />
      </div>
      {list.map((item, index) => (
        <div key={index} className="item">
          {item}
        </div>
      ))}
      <div onClick={handleRetryClick} ref={domRef}>
        {getStateText(isLoading, isError, isEnd)}
      </div>
    </div>
  );
}
