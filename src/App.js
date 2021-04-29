import "./styles.css";
import { useCallback, useRef, useState } from "react";
import LoadingMore from "./LoadingMore";
import getData from "./api/getData";

export default function App() {
  const indexRef = useRef(0);
  const [list, setList] = useState([]);

  const control = useCallback(async () => {
    await getData();
    if (indexRef.current >= 10) {
      return "end";
    }
    if (indexRef.current % 5 === 1) {
      indexRef.current++;
      return "error";
    }
    setList((list) => [...list, indexRef.current++]);
    return "success";
  }, []);

  return (
    <div className="App">
      <h1>list</h1>
      {list.map((item, index) => (
        <div key={index} className="item">
          {item}
        </div>
      ))}
      <LoadingMore control={control} />
    </div>
  );
}
