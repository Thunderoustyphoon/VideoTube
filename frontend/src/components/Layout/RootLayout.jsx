import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import Sidebar from "../Sidebar/Sidebar.jsx";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          } p-4`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
