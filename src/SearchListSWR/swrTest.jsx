import "./styles.css";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import getData from "../api/getData1";
// import createObserver from "../lib/createObserver";
import _ from "lodash";
import useSWR from "swr";

const getStateText = (isLoading, isError, isEnd, keyword, currentPage) => {
  console.log(
    "getStateText",
    "isLoading",
    isLoading,
    "isError",
    isError,
    "isEnd",
    isEnd
  );
  if (!keyword || currentPage === 0) {
    return "参数还没准备好";
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
  return "等待加载";
};

const isLoading = (data, error) => {
  if (data || error) {
    return false;
  } else {
    return true;
  }
};

const isError = (error) => {
  return !!error;
};

const isEnd = (data, pageSize) => {
  if (data && data.length < pageSize) {
    return true;
  } else {
    return false;
  }
};

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);

  const { data, error, mutate } = useSWR(
    keyword !== "" && currentPage > 0 ? [keyword, currentPage, pageSize] : null,
    getData,
    {
      onErrorRetry: () => {
        return;
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: (data, key, config) => {
        console.log("success", key, data);
      }
    }
  );
  console.log("--------");
  console.log(data, error, keyword, currentPage);

  const handleTurnpage = useCallback(() => {
    if (!isLoading(data, error) && !isError(error) && !isEnd(data, pageSize)) {
      setCurrentPage((page) => page + 1);
    }
  }, [data, error, pageSize]);
  const handleRetry = useCallback(() => {
    mutate("");
  }, [mutate]);
  const changeKeyWord = useCallback((event) => {
    setKeyword(event.target.value);
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
        <button onClick={handleRetry}>重试</button>
      </div>
      {data ? (
        data.map((item, index) => (
          <div key={index} className="item">
            {item}
          </div>
        ))
      ) : (
        <div>暂无内容</div>
      )}
      <div
        onClick={handleTurnpage}
        style={{ border: "1px solid #000", width: 200, margin: "10px auto" }}
      >
        {getStateText(
          isLoading(data, error),
          isError(error),
          isEnd(data ? data.length : data, pageSize),
          keyword,
          currentPage
        )}
        {currentPage}
      </div>
    </div>
  );
}
