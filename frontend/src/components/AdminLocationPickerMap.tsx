"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

interface AdminLocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationChange?: (lat: number, lng: number, addressDetails?: { address?: string; city?: string; province?: string; postalCode?: string }) => void;
  isDarkMode?: boolean;
  readOnly?: boolean;
}

export default function AdminLocationPickerMap({
  lat = -6.3117,
  lng = 107.3015,
  onLocationChange,
  isDarkMode = true,
  readOnly = false,
}: AdminLocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Helper for reverse geocoding coordinates to street address details
  const reverseGeocode = async (newLat: number, newLng: number) => {
    if (readOnly || !onLocationChange) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${newLat}&lon=${newLng}`,
        {
          headers: {
            "User-Agent": "SectorMadness/1.0 (logistics@sectormadness.com)",
          },
        }
      );
      const data = await res.json();
      if (data && data.address) {
        const addrObj = data.address;
        const street = addrObj.road || addrObj.suburb || addrObj.city_district || "";
        const city = addrObj.city || addrObj.town || addrObj.county || "Karawang";
        const province = addrObj.state || "Jawa Barat";
        const postalCode = addrObj.postcode || "41311";

        onLocationChange(newLat, newLng, {
          address: street,
          city: city,
          province: province,
          postalCode: postalCode,
        });
        return;
      }
    } catch (e) {
      console.error("Reverse geocoding failed:", e);
    }
    onLocationChange(newLat, newLng);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const loadLeafletScript = () => {
      if ((window as any).L) {
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
      const L = (window as any).L;
      if (!L) return;

      const numLat = Number(lat);
      const numLng = Number(lng);

      if ((mapContainerRef.current as any)._leaflet_id) {
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([numLat, numLng]);
          mapRef.current.panTo([numLat, numLng]);
        }
        setMapLoaded(true);
        return;
      }

      const map = L.map(mapContainerRef.current, {
        center: [numLat, numLng],
        zoom: 16,
        zoomControl: false,
      });

      mapRef.current = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // CartoDB Dark or Light tile layer
      const tileUrl = isDarkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: "custom-admin-picker-marker",
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(182, 164, 126, 0.35); border: 2px solid #B6A47E; animation: pulse-ring 2s infinite ease-out;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #B6A47E; border: 2px solid #000; box-shadow: 0 0 14px rgba(182, 164, 126, 1);"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([numLat, numLng], {
        icon: customIcon,
        draggable: !readOnly,
      }).addTo(map);

      markerRef.current = marker;

      if (!readOnly) {
        // Handle marker drag end
        marker.on("dragend", () => {
          const position = marker.getLatLng();
          reverseGeocode(position.lat, position.lng);
        });

        // Handle map click to place marker
        map.on("click", (e: any) => {
          const newLat = e.latlng.lat;
          const newLng = e.latlng.lng;
          marker.setLatLng([newLat, newLng]);
          reverseGeocode(newLat, newLng);
        });
      }

      setMapLoaded(true);
    };

    loadLeafletScript();

    return () => {
      if (mapRef.current && mapRef.current.remove) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map view & marker when lat/lng props change
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

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="space-y-3">
      {/* MAP CONTAINER */}
      <div
        style={{
          borderRadius: "8px",
          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
          overflow: "hidden",
          backgroundColor: isDarkMode ? "#0E0E0E" : "#F3F4F6",
        }}
        className="relative w-full h-[280px]"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0E0E0E] text-[#8A8A8A] text-xs font-mono tracking-widest uppercase z-10">
            Loading Interactive Map...
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* FOOTER ACTION: OPEN IN GOOGLE MAPS */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[#8A8A8A] font-mono tracking-wide">
          {readOnly
            ? `LAT: ${Number(lat).toFixed(4)}°, LNG: ${Number(lng).toFixed(4)}°`
            : "Map otomatis menyesuaikan titik berdasarkan alamat lengkap gudang & kota."}
        </span>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#B6A47E] hover:underline uppercase tracking-wider"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
