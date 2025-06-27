import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
      connect-src 'self' https://api.hnv.com https://*.onrender.com;
      frame-src 'self' https://accounts.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim();
    
    document.head.appendChild(meta);

    // Additional security headers via meta tags
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
    ];

    headers.forEach(header => {
      const metaTag = document.createElement('meta');
      metaTag.httpEquiv = header.name;
      metaTag.content = header.content;
      document.head.appendChild(metaTag);
    });

    return () => {
      // Cleanup on unmount
      document.querySelectorAll('meta[http-equiv]').forEach(meta => {
        if (meta.getAttribute('http-equiv')?.startsWith('X-') || 
            meta.getAttribute('http-equiv') === 'Content-Security-Policy') {
          meta.remove();
        }
      });
    };
  }, []);
};