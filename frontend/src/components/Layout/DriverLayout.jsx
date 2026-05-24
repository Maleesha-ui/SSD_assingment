// components/Layout/DriverLayout.js
import React from "react";
import { Outlet } from "react-router-dom";
import NavbarD from "../NavbarD";

const DriverLayout = () => {
  return (
    <>
      <NavbarD />
      <Outlet />
    </>
  );
};

export default DriverLayout;