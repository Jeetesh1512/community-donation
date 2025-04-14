export function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      console.log("Google Maps script is already loaded.");
      resolve();
      return;
    }

    window.initMap = () => {
      console.log("Google Maps loaded.");
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=weekly&callback=initMap`;
    script.async = true;
    script.defer = true;

    script.onerror = (e) => {
      console.error("Error loading Google Maps script", e);
      reject(e);
    };

    document.head.appendChild(script);
  });
}
