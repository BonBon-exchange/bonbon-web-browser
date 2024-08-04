// main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Create a root container to render the application
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  // Render the main App component into the root container
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found.");
}
