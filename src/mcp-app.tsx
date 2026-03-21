import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SlashCardsApp } from "./SlashCardsApp";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SlashCardsApp />
  </StrictMode>
);
