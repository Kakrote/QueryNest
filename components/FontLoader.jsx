'use client';

import { useEffect } from 'react';

export default function FontLoader() {
  useEffect(() => {
    // Check if fonts are loaded, if not, apply fallback
    const checkFonts = async () => {
      try {
        // Check if Roboto is loaded
        if (document.fonts) {
          const robotoLoaded = document.fonts.check('16px Roboto');
          const geistLoaded = document.fonts.check('16px Geist');
          
          if (!robotoLoaded && !geistLoaded) {
            console.warn('Google Fonts failed to load, applying fallback styles');
            // Add fallback styles
            const style = document.createElement('style');
            style.textContent = `
              .font-roboto { 
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important; 
              }
              .font-geist { 
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important; 
              }
              .font-mono { 
                font-family: ui-monospace, SFMono-Regular, Monaco, Consolas, monospace !important; 
              }
            `;
            document.head.appendChild(style);
          }
        }
      } catch (error) {
        console.warn('Font loading check failed:', error);
      }
    };

    // Run check after fonts have had time to load
    setTimeout(checkFonts, 1000);
  }, []);

  return null;
}
