import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useEffect, useState } from "react";

function Sidebar() {

    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    useEffect(() => {

        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }

    }, [darkMode]);

    return (

        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

            {/* Menu Button */}

            <button
                className="menu-btn"
                onClick={() => setCollapsed(!collapsed)}
            >
                ☰
            </button>


            {/* AsthmaWatch Logo */}

            <img
                src="/images/asthmawatch-logo.png"
                alt="AsthmaWatch"
                className="sidebar-logo"
            />


            {/* Navigation */}

            <nav>

    <NavLink to="/dashboard">
        <span className="nav-icon">🏠</span>
        <span className="nav-text">Dashboard</span>
    </NavLink>

    <NavLink to="/profile">
        <span className="nav-icon">👤</span>
        <span className="nav-text">Profile</span>
    </NavLink>

    <NavLink to="/about-asthma">
        <span className="nav-icon">🫁</span>
        <span className="nav-text">About Asthma</span>
    </NavLink>

    <NavLink to="/asthma-faqs">
        <span className="nav-icon">❓</span>
        <span className="nav-text">Asthma FAQs</span>
    </NavLink>

    <NavLink to="/about-asthmawatch">
    <span className="nav-icon">💡</span>
    <span className="nav-text">About AsthmaWatch</span>
</NavLink>

<NavLink to="/know-your-vitals">
    <span className="nav-icon">🩺</span>
    <span className="nav-text">Know Your Vitals</span>
</NavLink>

<NavLink to="/fun-zone">
    <span className="nav-icon">🎮</span>
    <span className="nav-text">Fun Zone</span>
</NavLink>

</nav>


            {/* Theme Toggle */}

            <button
                className="theme-btn"
                onClick={() => setDarkMode(!darkMode)}
            >
                {collapsed
                    ? (darkMode ? "☀️" : "🌙")
                    : (darkMode ? "☀️ Light Mode" : "🌙 Dark Mode")
                }
            </button>


            {/* Logout */}

            <button
                onClick={logout}
                className="sidebar-logout"
            >

                <span className="logout-icon">

                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >

                        <path
                            d="M10 17L15 12L10 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <path
                            d="M15 12H3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <path
                            d="M21 19V5C21 3.89543 20.1046 3 19 3H13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                    </svg>

                </span>

                {!collapsed && "Logout"}

            </button>

        </aside>
    );
}

export default Sidebar;