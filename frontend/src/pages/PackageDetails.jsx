import React from "react";
import { useParams, Link } from "react-router-dom";
import "./Packages.css";
import "./PackageDetails.css";
import "../components/Header.css";  // Corrected import path
import "../components/Footer.css";  // Corrected import path

const packages = [
  {
    name: "Graceful Goodbye Package",
    image: "/src/assets/basic-package12.jpg",
    price: "$1,500",
    services: [
      {
        name: "Casket and Coffin",
        image: "/src/assets/casket12.jpg",
        description: "Price: Typically $1,000 - $10,000, depending on material and design.",
      },
      {
        name: "Hearse Service",
        image: "/src/assets/hearse.jpg",
        description: "Price: Starts at $150 - $500 per trip.",
      },
      {
        name: "Funeral Home Services",
        image: "/src/assets/funeral-home.jpg",
        description: "Use of funeral home for memorial and service preparations. Starts at $1,500 - $3,000, including minimal arrangements.",
      },
      {
        name: "Body Preparations",
        image: "/src/assets/body-preparation12.jpg",
        description: "Embalming, dressing, and cosmetic preparation for viewing. Starts at $200 - $500 (cleaning and dressing).",
      },
    ],
  },
  {
    name: "Classic Memorial Package",
    image: "/src/assets/standard-package.jpg",
    price: "$3,000",
    services: [
      {
        name: "Floral Arrangements",
        image: "/src/assets/flowers.jpg",
        description: "Beautiful floral tributes and wreaths. Small Bouquets & Sympathy Flowers – $50 - $150, Standing Wreaths & Crosses – $200 - $500",
      },
      {
        name: "Music Service",
        image: "/src/assets/music.jpg",
        description: "Live or recorded music for the ceremony. Pre-recorded Music & Sound Setup – $50 - $200",
      },
      {
        name: "Memorial Booklets",
        image: "/src/assets/memorial-booklet.jpg",
        description: "Personalized memorial booklets for attendees. Basic Black & White Booklet (Stapled, 4-8 pages) – $50 - $150",
      },
    ],
  },
  {
    name: "Grand Legacy Package",
    image: "/src/assets/premium-package.jpg",
    price: "$5,500",
    services: [
      {
        name: "Customized Package",
        image: "/src/assets/customized.jpg",
        description: "Tailor-made services according to family preferences. Basic Custom Package – Starts from $800 - $2,000",
      },
      {
        name: "Catering Services",
        image: "/src/assets/catering.jpg",
        description: "Professional catering services for guests. Starts from $500 - $1,500 for simple meals and smaller gatherings.",
      },
      {
        name: "Funeral Procession",
        image: "/src/assets/procession.jpg",
        description: "Organized funeral procession with honor. Starts at $800 - $1,500 for the basic hearse and escort vehicles, including route planning and coordination.",
      },
      {
        name: "Live Streaming of Ceremony",
        image: "/src/assets/live-streaming.jpg",
        description: "Broadcast of the ceremony for distant loved ones. Starts at $500 - $800, which includes one camera setup, basic audio, and a standard streaming platform.",
      },
    ],
  },
];

const PackageDetails = () => {
  const { name } = useParams();
  
  // Transform the URL 'name' into the format used in the 'packages' array
  const packageDetails = packages.find(
    (pkg) => pkg.name.toLowerCase().replace(/\s+/g, "-") === name
  );

  if (!packageDetails) {
    return <h2>Package not found</h2>;
  }

  return (
    <div className="package-details-container">
      <header className="packages-header">
        <h1>{packageDetails.name}</h1>
      </header>

      <div className="package-details-card">
        <img src={packageDetails.image} alt={packageDetails.name} className="package-detail-image" />
        <h2>{packageDetails.name}</h2>
        <p className="package-price">Price: {packageDetails.price}</p>
      </div>

      <h3>Services Included:</h3>
      <div className="services-list">
        {packageDetails.services.map((service, idx) => (
          <div key={idx} className="service-card">
            <img src={service.image} alt={service.name} />
            <div>
              <h4>{service.name}</h4>
              <p>{service.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-group">
      <Link to="/packages" className="btn back-btn">Back to Packages</Link>

        <Link to="#" className="btn book-btn">Book Now</Link>
      </div>
    </div>
  );
};

export default PackageDetails;
