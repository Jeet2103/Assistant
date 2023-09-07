import React from "react";
import Home from "./Home";
import { MyProvider } from "./Context";
function App() {
  return (
    <>
      <MyProvider>
        <Home />
      </MyProvider>
    </>
  );
}

export default App;
