import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const CampaignPage = () => {
   const { token } = useAuth();

   const [widgetToken, setWidgetToken] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

   const baseUrl = "https://widgets.songtools.io/v1/CampaignTestX?app-key=21B0C76233F14B2CB724FE0134A0F167&autodetect=1";

   // We grab spotifyId directly from native URLSearchParams avoiding react-router library dependency
   const searchParams = new URLSearchParams(window.location.search);
   const spotifyId = searchParams.get('spotifyId');

   useEffect(() => {
      let isMounted = true;

      const loadScript = (src, integrity, crossorigin) => {
         return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            if (integrity) script.integrity = integrity;
            if (crossorigin) script.crossOrigin = crossorigin;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
         });
      };
      
      // Load necessary external scripts for widget to function perfectly
      loadScript('https://digitallatino.songtools.io/js/wixgetcontent.js?v=1738787616');
      loadScript('https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=6706d724bb0e4c6b5a5c849b', 'sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=', 'anonymous');

      const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      const eventer = window[eventMethod];
      const messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
      
      const processParentEvent = (e) => {
         console.log('Evento recibido del iframe:', e);
      };
      eventer(messageEvent, processParentEvent);

      const fetchWidgetToken = async () => {
         if (!token) {
            if (isMounted) setIsLoading(false);
            return;
         }

         if (!spotifyId) {
            console.error("No se encontró 'spotifyId' en la URL."); 
            if (isMounted) setIsLoading(false);
            return;
         }

         try {
            const response = await fetch('https://security.digital-latino.com/api/auth/widget-token', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
               },
               body: JSON.stringify({ spotifysongid: spotifyId })
            });

            if (!response.ok) {
               throw new Error('No se pudo generar el token del widget');
            }

            const data = await response.json();
            if (isMounted) setWidgetToken(data.token);

         } catch (error) {
            console.error("Error al buscar token del widget:", error);
         } finally {
            if (isMounted) setIsLoading(false);
         }
      };

      fetchWidgetToken();

      // Cleanup function
      return () => {
         isMounted = false;
         if (eventMethod === "addEventListener") {
            window.removeEventListener(messageEvent, processParentEvent);
         } else if (eventMethod === "attachEvent") {
            window.detachEvent(messageEvent, processParentEvent);
         }
      };
   }, [token, spotifyId]);

   const iframeSrc = widgetToken ? `${baseUrl}&jwt=${widgetToken}` : baseUrl;

   if (isLoading) {
      return (
         <div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark, #0a0b14)' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '3rem 5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
               <Loader2 className="loading-spinner" size={48} color="var(--accent-primary, #8a88ff)" />
               <p style={{ color: 'var(--text-main, white)', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Cargando inteligencia de campaña...</p>
               <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', margin: 0 }}>Conectando con herramientas de promoción</p>
            </div>
         </div>
      );
   }

   return (
      <div style={{ height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--bg-dark, #0a0b14)' }} className="animate-fade-in">
         {(!spotifyId) && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444' }}>
               Error crítico: Faltan parámetros (spotifyId) para configurar la campaña.
            </div>
         )}
         <iframe
            id="iframeWidget"
            title="SongTools Campaign Widget"
            frameBorder="0"
            scrolling="no"
            width="100%"
            height="100%"
            src={iframeSrc}
            style={{
               backgroundColor: 'transparent',
               height: '100%',
               border: '0px',
               margin: 0,
               padding: 0,
               display: 'block'
            }}
            allow="clipboard-write"
         />
      </div>
   );
};

export default CampaignPage;
