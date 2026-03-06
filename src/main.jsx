import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

const userAgent = navigator.userAgent;
const vendor = navigator.vendor || "";
const brands = navigator.userAgentData?.brands?.map((item) => item.brand) ?? [];
const hasBrand = (name) => brands.some((brand) => brand.includes(name));

const isBrave =
  /Brave/.test(userAgent) || hasBrand("Brave") || !!navigator.brave;
const isEdge = hasBrand("Microsoft Edge") || /Edg/.test(userAgent);
const isOpera = hasBrand("Opera") || /OPR/.test(userAgent);
const isChrome =
  (hasBrand("Google Chrome") || hasBrand("Chromium") || /Chrome/.test(userAgent)) &&
  /Google Inc/.test(vendor) &&
  !isEdge &&
  !isOpera &&
  !isBrave;
const isFirefox = /Firefox/.test(userAgent);
const isSafari =
  /Safari/.test(userAgent) &&
  /Apple/.test(vendor) &&
  !isChrome &&
  !isEdge &&
  !isOpera;
const useOneRem = isChrome || isFirefox || isEdge || isSafari;

document.documentElement.classList.toggle("font-1rem", useOneRem);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
