import React from "react";
import { useParams, Link } from "react-router-dom";
import "./Packages.css";
import "./PackageDetails.css";
import "../components/Header.css";
import "../components/Footer.css";

const packages = [
  {
    name: "Graceful Goodbye Package",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80",
    price: "$1,500",
    services: [
      {
        name: "Casket and Coffin",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
        description: "Price: Typically $1,000 - $10,000, depending on material and design.",
      },
      {
        name: "Hearse Service",
        image: "https://images.unsplash.com/photo-1449965408869-ebd3fee3a29f?w=400&q=80",
        description: "Price: Starts at $150 - $500 per trip.",
      },
      {
        name: "Funeral Home Services",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
        description: "Use of funeral home for memorial and service preparations. Starts at $1,500 - $3,000, including minimal arrangements.",
      },
      {
        name: "Body Preparations",
        image: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400&q=80",
        description: "Embalming, dressing, and cosmetic preparation for viewing. Starts at $200 - $500 (cleaning and dressing).",
      },
    ],
  },
  {
    name: "Classic Memorial Package",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
    price: "$3,000",
    services: [
      {
        name: "Floral Arrangements",
        image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&q=80",
        description: "Beautiful floral tributes and wreaths. Small Bouquets & Sympathy Flowers – $50 - $150, Standing Wreaths & Crosses – $200 - $500",
      },
      {
        name: "Music Service",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80",
        description: "Live or recorded music for the ceremony. Pre-recorded Music & Sound Setup – $50 - $200",
      },
      {
        name: "Memorial Booklets",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
        description: "Personalized memorial booklets for attendees. Basic Black & White Booklet (Stapled, 4-8 pages) – $50 - $150",
      },
    ],
  },
  {
    name: "Grand Legacy Package",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80",
    price: "$5,500",
    services: [
      {
        name: "Customized Package",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
        description: "Tailor-made services according to family preferences. Basic Custom Package – Starts from $800 - $2,000",
      },
      {
        name: "Catering Services",
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80",
        description: "Professional catering services for guests. Starts from $500 - $1,500 for simple meals and smaller gatherings.",
      },
      {
        name: "Funeral Procession",
        image: "https://images.unsplash.com/photo-1449965408869-ebd3fee3a29f?w=400&q=80",
        description: "Organized funeral procession with honor. Starts at $800 - $1,500 for the basic hearse and escort vehicles, including route planning and coordination.",
      },
      {
        name: "Live Streaming of Ceremony",
        image: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=400&q=80",
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
        <img src={packageDetails.image} alt={packageDetails.name} className="package-detail-image" loading="lazy" />
        <h2>{packageDetails.name}</h2>
        <p className="package-price">Price: {packageDetails.price}</p>
      </div>

      <h3>Services Included:</h3>
      <div className="services-list">
        {packageDetails.services.map((service, idx) => (
          <div key={idx} className="service-card">
            <img src={service.image} alt={service.name} loading="lazy" />
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
