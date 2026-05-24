import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RouteMap.css";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Use environment variable for API key
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
if (!ORS_API_KEY) {
  console.error("Openrouteservice API key is missing. Please set VITE_ORS_API_KEY in .env.");
}

function RouteMap() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [routeName, setRouteName] = useState("");
  const [route, setRoute] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default: Colombo, Sri Lanka
  const [error, setError] = useState("");

  // Predefined funeral locations with specific addresses
  const funeralLocations = [
    { name: "Colombo City Center", coords: [6.9271, 79.8612] },
    { name: "St. Mary’s Church, Bambalapitiya", coords: [6.9350, 79.8500] },
    { name: "Greenfield Cemetery, Borella", coords: [6.9100, 79.8700] },
  ];

  // Fetch saved routes
  useEffect(() => {
    axios.get("http://localhost:5000/routes")
      .then((res) => setSavedRoutes(res.data.routes))
      .catch((err) => console.error("Error fetching routes:", err));
  }, []);

  // Calculate route using predefined coordinates
  const calculateRoute = async () => {
    if (!startLocation || !endLocation) {
      setError("Please select both start and end locations.");
      return;
    }
    setError("");
    try {
      const startLoc = funeralLocations.find(loc => loc.name === startLocation);
      const endLoc = funeralLocations.find(loc => loc.name === endLocation);
      if (!startLoc || !endLoc) {
        throw new Error("Selected location not found");
      }
      const startCoords = startLoc.coords.reverse(); // [longitude, latitude]
      const endCoords = endLoc.coords.reverse(); // [longitude, latitude]
      console.log("Start Coords:", startCoords);
      console.log("End Coords:", endCoords);
      console.log("Authorization Header:", `Bearer ${ORS_API_KEY}`);
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
        {
          coordinates: [startCoords, endCoords],
          instructions: true,
        },
        {
          headers: {
            Authorization: `Bearer ${ORS_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const routeData = response.data;
      setRoute(routeData);
      setMapCenter(startLoc.coords); // [latitude, longitude]
    } catch (err) {
      console.error("API Error Response:", err.response?.data);
      setError(`Error calculating route: ${err.message}`);
    }
  };

  // Save route to backend
  const saveRoute = async () => {
    if (!routeName || !route) {
      setError("Please provide a route name and calculate a route first.");
      return;
    }
    try {
      const routeData = {
        name: routeName,
        startLocation: {
          address: startLocation,
          coordinates: route.features[0].geometry.coordinates[0],
        },
        endLocation: {
          address: endLocation,
          coordinates: route.features[0].geometry.coordinates.slice(-1)[0],
        },
        waypoints: [],
        distance: route.features[0].properties.segments[0].distance,
        duration: route.features[0].properties.segments[0].duration,
      };
      await axios.post("http://localhost:5000/routes", routeData);
      setSavedRoutes([...savedRoutes, routeData]);
      setRouteName("");
      setError("");
      alert("Route saved successfully!");
    } catch (err) {
      setError(`Error saving route: ${err.message}`);
    }
  };

  // Load a saved route
  const loadSavedRoute = (savedRoute) => {
    setStartLocation(savedRoute.startLocation.address);
    setEndLocation(savedRoute.endLocation.address);
    setRouteName(savedRoute.name);
    calculateRoute();
  };

  return (
    <div className="route-map-wrapper">
      <div className="route-map-container">
        <header className="route-map-header">
          <h1>Route Management</h1>
          <p>Plan and save routes for funeral transportation</p>
        </header>
        <div className="route-form">
          <div className="form-group">
            <label htmlFor="startLocation">Start Location</label>
            <select
              id="startLocation"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
            >
              <option value="">Select Start Location</option>
              {funeralLocations.map((loc, i) => (
                <option key={i} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="endLocation">End Location</label>
            <select
              id="endLocation"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
            >
              <option value="">Select End Location</option>
              {funeralLocations.map((loc, i) => (
                <option key={i} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="routeName">Route Name</label>
            <input
              type="text"
              id="routeName"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g., City Center to Cemetery"
            />
          </div>
          <div className="form-actions">
            <button onClick={calculateRoute} className="calculate-btn">
              <i className="fas fa-route"></i> Calculate Route
            </button>
            <button onClick={saveRoute} className="save-btn">
              <i className="fas fa-save"></i> Save Route
            </button>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="map-container">
          <MapContainer center={mapCenter} zoom={13} style={{ height: "400px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {route && (
              <>
                <Polyline
                  positions={route.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]])}
                  color="blue"
                />
                <Marker position={route.features[0].geometry.coordinates[0].slice().reverse()}>
                  <Popup>Start: {startLocation}</Popup>
                </Marker>
                <Marker position={route.features[0].geometry.coordinates.slice(-1)[0].slice().reverse()}>
                  <Popup>End: {endLocation}</Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>
        <div className="saved-routes">
          <h2>Saved Routes</h2>
          {savedRoutes.length > 0 ? (
            <ul>
              {savedRoutes.map((savedRoute, i) => (
                <li key={i}>
                  <span>{savedRoute.name}</span>
                  <button onClick={() => loadSavedRoute(savedRoute)} className="load-btn">
                    <i className="fas fa-map"></i> Load
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved routes yet.</p>
          )}
        </div>
        <footer className="route-map-footer">
          <p>© 2025 Funeral Management Services</p>
        </footer>
      </div>
    </div>
  );
}

export default RouteMap;