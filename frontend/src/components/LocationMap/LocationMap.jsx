import React, { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function LocationMap({
  setLatLng,
  setAddress,
  setGoToMyLocation,
}) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    const initializeMap = async () => {
      const { Map } = await loader.importLibrary("maps");
      const { AdvancedMarkerElement } = await loader.importLibrary("marker");
      const { SearchBox } = await loader.importLibrary("places");

      const geocoder = new google.maps.Geocoder();

      const defaultLocation = { lat: 28.6139, lng: 77.209 }; // Delhi

      const map = new Map(mapRef.current, {
        center: defaultLocation,
        zoom: 10,
        mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
      });

      const setLocation = (latLng, title = "Selected Location") => {
        setLatLng(latLng);
        map.setCenter(latLng);

        if (markerRef.current) markerRef.current.map = null;

        markerRef.current = new AdvancedMarkerElement({
          map,
          position: latLng,
          title,
        });

        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results[0]) {
            setAddress(results[0].formatted_address);
          } else {
            console.error("Geocoder failed due to:", status);
          }
        });
      };

      map.addListener("click", (e) => {
        setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Search location...";
      input.style.cssText = `
  box-sizing: border-box;
  border: 1px solid #ccc;
  padding: 8px 12px;
  border-radius: 20px;
  margin: 10px;
  width: 200px;
  font-size: 14px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
`;

      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(input);

      const searchBox = new SearchBox(input);

      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setLocation(location, place.name || "Searched Location");
      });

      // ✅ Expose goToMyLocation handler
      setGoToMyLocation(() => () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setLocation(userLocation, "Your Location");
            },
            (error) => {
              console.warn("Geolocation failed:", error);
            }
          );
        } else {
          console.warn("Geolocation not supported.");
        }
      });
    };

    initializeMap().catch((err) => console.error("Map load error:", err));
  }, [setLatLng, setAddress, setGoToMyLocation]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "300px",
        borderRadius: "8px",
      }}
    />
  );
}
