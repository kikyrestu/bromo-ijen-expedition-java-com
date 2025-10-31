'use client';

import { useEffect } from 'react';

/**
 * DynamicFavicon Component
 * 
 * Fetches favicon from Settings API and dynamically updates <link> tag in <head>
 * This runs client-side to allow dynamic favicon without rebuilding the app
 */
const DynamicFavicon = () => {
  useEffect(() => {
    let isMounted = true;

    const updateFavicon = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (!isMounted) return; // Component unmounted, abort

        if (data.success && data.data?.favicon) {
          const faviconUrl = data.data.favicon;

          if (!isMounted) return;

          // Update existing primary favicon if present; otherwise create a managed one
          const primaryFavicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
          if (primaryFavicon) {
            primaryFavicon.type = 'image/x-icon';
            primaryFavicon.href = faviconUrl;
            primaryFavicon.setAttribute('data-dynamic-favicon', 'true');
          } else {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/x-icon';
            link.href = faviconUrl;
            link.setAttribute('data-dynamic-favicon', 'true');
            document.head.appendChild(link);
          }

          if (!isMounted) return;

          // Update or create apple touch icon separately
          const appleTouchSelector = "link[rel='apple-touch-icon']";
          const appleTouchIcon = document.querySelector<HTMLLinkElement>(appleTouchSelector);
          if (appleTouchIcon) {
            appleTouchIcon.href = faviconUrl;
            appleTouchIcon.setAttribute('data-dynamic-favicon', 'true');
          } else {
            const newAppleTouchIcon = document.createElement('link');
            newAppleTouchIcon.rel = 'apple-touch-icon';
            newAppleTouchIcon.href = faviconUrl;
            newAppleTouchIcon.setAttribute('data-dynamic-favicon', 'true');
            document.head.appendChild(newAppleTouchIcon);
          }
        }
      } catch (error) {
        console.error('Error updating favicon:', error);
      }
    };

    updateFavicon();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  return null; // This component doesn't render anything
};

export default DynamicFavicon;
