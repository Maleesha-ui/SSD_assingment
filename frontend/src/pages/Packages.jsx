import React from "react";
import { Link } from "react-router-dom";
import "./Packages.css";
import "../components/Header.css";
import "../components/Footer.css";
import "./PackageDetails.css";

// Import images directly
import basicPackage from "../assets/basic-package12.jpg";
import standardPackage from "../assets/standard-package.jpg";
import premiumPackage from "../assets/premium-package.jpg";

// Array of packages with names, images, and prices
const packages = [
  {
    name: "Graceful Goodbye Package",
    image: basicPackage,
    price: "$1,500",
  },
  {
    name: "Classic Memorial Package",
    image: standardPackage,
    price: "$3,000",
  },
  {
    name: "Grand Legacy Package",
    image: premiumPackage,
    price: "$5,500",
  },
];

const Packages = () => {
  return (
    <div className="packages-container">
      <header className="packages-header">
        <h1>Explore Our Funeral Packages</h1>
        <p>Select the best package for your needs and get more details.</p>
      </header>

      <div className="packages-grid">
        {/* Loop through packages and display them */}
        {packages.map((pkg, index) => (
          <div className="package-card" key={index}>
            <img 
              src={pkg.image} 
              alt={`Image of ${pkg.name}`} 
              className="package-image" 
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
