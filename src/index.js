import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./SearchListUseSWRInfinite";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
