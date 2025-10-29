import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient"; 
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
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
});