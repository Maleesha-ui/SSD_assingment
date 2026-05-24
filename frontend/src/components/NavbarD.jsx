import {Link} from "react-router-dom";
import "./NavbarD.css";

const Navbar = () => {

    return(
        <nav className="navbar">
            <ul className="nav-links">
                <li><Link to="/dri">Dashboard</Link></li>
                <li><Link to="/vehiclemanagement">Vehicle Management</Link></li>
                <li><Link to="/drivermanagement">Driver Management</Link></li>
                <li><Link to="/assignmentmanagement">Vehicle Assignment</Link></li>
                <li><Link to="/routes">Route Management</Link></li>
                <li><Link to="/maintenancemanagement">Maintenance Management</Link></li>
                <li><Link to="/maintenancereport">Maintenance Report</Link></li>
            </ul>
        </nav>
    );

};

export default Navbar;