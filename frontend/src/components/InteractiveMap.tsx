"use client";

import { useEffect, useRef, useState } from "react";

interface InteractiveMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  title?: string;
  subtitle?: string;
}

export default function InteractiveMap({
  lat = -6.3533,
  lng = 107.2831,
  zoom = 14,
  title = "SECTOR MADNESS WAREHOUSE",
  subtitle = "Karawang Barat, Jawa Barat, Indonesia",
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const numLat = Number(lat);
      const numLng = Number(lng);
      if (!isNaN(numLat) && !isNaN(numLng)) {
        markerRef.current.setLatLng([numLat, numLng]);
        mapRef.current.panTo([numLat, numLng]);
      }
    }
  }, [lat, lng]);

  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    const loadLeafletScript = () => {
      if ((window as unknown as { L: unknown }).L) {
        initMap();
        return;
      }
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        const existing = document.getElementById("leaflet-js");
        if (existing) {
          existing.addEventListener("load", initMap);
        }
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current) return;
      const L = (window as unknown as { L: any }).L;
      if (!L) return;

      const numLat = Number(lat);
      const numLng = Number(lng);

      // Avoid double initialization
      if ((mapContainerRef.current as any)._leaflet_id) {
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([numLat, numLng]);
          mapRef.current.panTo([numLat, numLng]);
        }
        setMapLoaded(true);
        return;
      }

      // Initialize map with dark tile theme
      const map = L.map(mapContainerRef.current, {
        center: [numLat, numLng],
        zoom: zoom,
        zoomControl: false,
        scrollWheelZoom: false,
      });

      mapRef.current = map;

      // Custom minimal zoom control
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // CartoDB Dark Matter tile layer for dark monochrome aesthetic
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Create Custom Minimal Accent Circle Marker
      const customIcon = L.divIcon({
        className: "custom-sector-marker",
        html: `
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: rgba(182, 164, 126, 0.25);
              border: 1px solid #B6A47E;
              animation: pulse-ring 2s infinite ease-out;
            "></div>
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #B6A47E;
              border: 2px solid #0A0A0A;
              box-shadow: 0 0 10px rgba(182, 164, 126, 0.8);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      // Add Marker
      const marker = L.marker([numLat, numLng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Minimal Dark Popup
      const popupContent = `
        <div style="
          background: #121212;
          color: #F5F5F5;
          padding: 12px 16px;
          border: 1px solid #333333;
          font-family: 'Inter', sans-serif;
          min-width: 200px;
        ">
          <div style="font-size: 10px; letter-spacing: 0.25em; color: #B6A47E; font-weight: 700; margin-bottom: 4px; text-transform: uppercase;">
            SECTOR MADNESS
          </div>
          <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #FFFFFF; letter-spacing: -0.01em;">
            ${title}
          </div>
          <div style="font-size: 11px; color: #999999; margin-top: 4px; font-weight: 300;">
            ${subtitle}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "sector-custom-popup",
        closeButton: false,
      });

      // Automatically open popup
      marker.openPopup();

      setMapLoaded(true);
    };

    loadLeafletScript();

    return () => {
      if (mapRef.current && mapRef.current.remove) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom, title, subtitle]);

  return (
    <div className="relative w-full max-w-[560px] overflow-hidden border border-[#222222] bg-[#0E0E0E]">
      <style jsx global>{`
        .sector-custom-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .sector-custom-popup .leaflet-popup-tip {
          background: #121212 !important;
          border: 1px solid #333333 !important;
        }
        .leaflet-container {
          background: #0A0A0A !important;
          font-family: 'Inter', sans-serif !important;
        }
        .leaflet-control-zoom a {
          background-color: #121212 !important;
          color: #F5F5F5 !important;
          border-color: #333333 !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #1A1A1A !important;
          color: #B6A47E !important;
        }
        .leaflet-control-attribution {
          background: rgba(10, 10, 10, 0.8) !important;
          color: #666666 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #888888 !important;
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D0D] text-[#8A8A8A] text-xs font-mono tracking-widest uppercase z-10">
          Loading Interactive Map...
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full h-[320px] sm:h-[360px] md:h-[380px] z-0"
      />
    </div>
  );
}
