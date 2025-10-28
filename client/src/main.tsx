// client/src/main.tsx

import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient"; // <-- Import the correct client
import App from "./App";
import "./index.css";
import { worker } from "./mocks/browser";
import { initializeDatabase } from "./lib/init-db";

async function prepare() {
  await worker.start({ onUnhandledRequest: "bypass" });
  await initializeDatabase();
}

prepare().then(() => {
  createRoot(document.getElementById("root")!).render(
    // This is now the ONLY QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
});