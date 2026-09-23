import React from "react";
import { Link } from "react-router-dom";
import "./Packages.css";
import "../components/Header.css";
import "../components/Footer.css";
import "./PackageDetails.css";

// Use direct Unsplash URLs for topic-related photos
const packages = [
  {
    name: "Graceful Goodbye Package",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80",
    price: "$1,500",
  },
  {
    name: "Classic Memorial Package",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
    price: "$3,000",
  },
  {
    name: "Grand Legacy Package",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80",
    price: "$5,500",
  },
];

const Packages = () => {
  return (
    <div className="packages-container">
      <header className="packages-header">
        <h1>Explore Our Funeral Packages</h1>
        <p>Select the best package for your needs and get more details about our comprehensive funeral services.</p>
      </header>

      <div className="packages-grid">
        {/* Loop through packages and display them */}
        {packages.map((pkg, index) => (
          <div className="package-card" key={index}>
            <img 
              src={pkg.image} 
              alt={`Image of ${pkg.name}`} 
              className="package-image" 
              loading="lazy"
            />
            <h2 className="package-title">{pkg.name}</h2>
            <p className="package-price">{pkg.price}</p>
            <Link 
              to={`/package/${pkg.name.toLowerCase().replace(/\s+/g, "-")}`} 
              className="btn view-details-btn"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Packages;
