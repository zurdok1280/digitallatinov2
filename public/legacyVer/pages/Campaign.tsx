import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

const SongToolsWidget = () => {

   const { token } = useAuth();

   const [widgetToken, setWidgetToken] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   const baseUrl = "https://widgets.songtools.io/v1/CampaignTestX?app-key=21B0C76233F14B2CB724FE0134A0F167&autodetect=1";

   //read url for Spotify Song ID
   const [searchParams] = useSearchParams();

   useEffect(() => {

      const loadScript = (src: string, integrity?: string, crossorigin?: string) => {
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
            setIsLoading(false);
            return;
         }


         const spotifysongid = searchParams.get('spotifyId');


         if (!spotifysongid) {
            console.error("No se encontró 'spotifyId' en la URL."); setIsLoading(false);
            return;
         }

         try {
            const response = await fetch('https://security.digital-latino.com/api/auth/widget-token', {
               //const response = await fetch('http://localhost:8085/api/auth/widget-token', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` // Login token
               },
               body: JSON.stringify({ spotifysongid: spotifysongid })
            });

            if (!response.ok) {
               throw new Error('No se pudo generar el token del widget');
            }

            const data = await response.json();
            setWidgetToken(data.token);

         } catch (error) {
            console.error("Error al buscar token del widget:", error);
         } finally {
            setIsLoading(false);
         }
      };

      fetchWidgetToken();

      // Cleanup function
      return () => {
         if (eventMethod === "addEventListener") {
            window.removeEventListener(messageEvent, processParentEvent);
         } else if (eventMethod === "attachEvent") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).detachEvent(messageEvent, processParentEvent);
         }
      };
   }, [token, searchParams]);


   const iframeSrc = widgetToken ? `${baseUrl}&jwt=${widgetToken}` : baseUrl;


   if (isLoading) {
      return (
         <div className="flex justify-center items-center h-[900px]">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="ml-4 text-gray-600">Cargando campaña...</p>
         </div>);
   }

   return (
      <div>
         <iframe
            id="iframeWidget"
            title="SongTools Campaign Widget"
            frameBorder="0"
            scrolling="no"
            width="100%"
            height="1200"
            src={iframeSrc}
            style={{
               backgroundColor: 'transparent',
               height: '900px',
               border: '0px',
               margin: 0,
               padding: 0,
               overflow: 'hidden'
            }}
            allow="clipboard-write"
         />
      </div>
   );
};

export default SongToolsWidget;