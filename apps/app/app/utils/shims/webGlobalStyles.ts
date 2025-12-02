/**
 * Web Global Styles
 *
 * Injects CSS styles needed for proper scrolling on web.
 * This runs only on web platform.
 */

import { Platform } from "react-native"

if (Platform.OS === "web" && typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    /* Ensure html and body fill viewport */
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      /* Allow scrolling - child elements control their own overflow */
      overflow: auto;
    }
    
    /* React Native Web renders into #root */
    #root {
      min-height: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `
  document.head.appendChild(style)
}

export {}
