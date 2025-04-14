export function initMap(setLatLng, setAddress) {
  const defaultLocation = { lat: 28.6139, lng: 77.209 }; // Delhi

  const map = new window.google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 10,
    mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
  });

  const geocoder = new window.google.maps.Geocoder();
  let marker;

  // Function to update map with a new location
  const setLocation = (latLngObj, title = "Selected Location") => {
    setLatLng(latLngObj);
    map.setCenter(latLngObj);

    // Remove existing marker
    if (marker) marker.setMap(null);

    // Add new marker
    marker = new window.google.maps.marker.AdvancedMarkerElement({
      position: latLngObj,
      map,
      title,
    });

    // Get address
    geocoder.geocode({ location: latLngObj }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  // Click handler for map
  map.addListener("click", (e) => {
    const clickedLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setLocation(clickedLocation);
  });

  // Create and add the search input box to the map
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search location...";
  input.style.cssText = `
    margin: 10px;
    padding: 8px;
    width: 150px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 12px;
    position: absolute;
    left:60px;
    bottom: 5px;
    z-index: 5;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  `;

  map.controls[window.google.maps.ControlPosition.BOTTOM_RIGHT].push(input);

  const searchBox = new window.google.maps.places.SearchBox(input);

  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (!places || places.length === 0) return;

    const place = places[0];
    if (!place.geometry || !place.geometry.location) return;

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setLocation(location, place.name || "Searched Location");
  });

  return () => {
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
          console.warn("Geolocation failed or permission denied:", error);
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  };
}
