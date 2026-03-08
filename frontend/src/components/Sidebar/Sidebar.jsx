import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const navItems = [
  {
    to: "/",
    label: "Home",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    to: "/search",
    label: "Explore",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
  },
  {
    to: "/history",
    label: "History",
    auth: true,
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm1 5v5.25l4.5 2.67-.75 1.23L13 14V8h1z" />
      </svg>
    ),
  },
  {
    to: "/liked-videos",
    label: "Liked Videos",
    auth: true,
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
      </svg>
    ),
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    auth: true,
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
];

const Sidebar = ({ isOpen }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 bg-dark-bg overflow-y-auto z-40 border-r border-dark-border">
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          if (item.auth && !isAuthenticated) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-dark-elevated text-white"
                    : "text-dark-subtext hover:bg-dark-elevated hover:text-white"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mt-4">
        <p className="text-xs text-dark-subtext">© 2024 VideoTube</p>
      </div>
    </aside>
  );
};

export default Sidebar;
