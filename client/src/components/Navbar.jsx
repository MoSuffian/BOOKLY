import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();

    // Hide navbar on auth and landing pages — they have their own branding
    const authRoutes = ["/login", "/register", "/"];
    if (authRoutes.includes(location.pathname)) return null;

    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const token = localStorage.getItem("token");

    const logout = () => {
        localStorage.clear();
        navigate("/login");
        window.location.reload();
    };

    // Helper to apply active class
    const linkClass = ({ isActive }) =>
        isActive ? "nav-link active" : "nav-link";

    return (
        <nav className="navbar">

            {/* Logo */}
            <NavLink to={token ? "/dashboard" : "/login"} className="logo">
                <img
                    src={`${process.env.PUBLIC_URL}/bookly-logo.png`}
                    alt="Bookly"
                    className="logo-img"
                />
                <span className="logo-name">BOOKLY</span>
            </NavLink>

            {/* Centre navigation */}
            <div className="nav-links">

                {!token && (
                    <>
                        <NavLink to="/login" className={linkClass}>
                            Login
                        </NavLink>

                        <NavLink to="/register" className={linkClass}>
                            Register
                        </NavLink>
                    </>
                )}

                {token && (
                    <>
                        <NavLink to="/dashboard" className={linkClass}>
                            Dashboard
                        </NavLink>

                        <NavLink to="/books" className={linkClass}>
                            Catalog
                        </NavLink>


                        {role === "admin" && (
                            <>
                                <NavLink to="/manage-books" className={linkClass}>
                                    Manage Books
                                </NavLink>

                                <NavLink to="/manage-users" className={linkClass}>
                                    Manage Users
                                </NavLink>

                                <NavLink to="/analysis" className={linkClass}>
                                    Analytics
                                </NavLink>
                            </>
                        )}

                        {(role === "student" || role === "admin") && (
                            <NavLink to="/my-borrowings" className={linkClass}>
                                Borrowed
                            </NavLink>
                        )}
                    </>
                )}

            </div>

            {/* Right — user info */}
            {token && (
                <div className="user-info">
                    <div className="user-avatar">
                        <span className="welcome">{name}</span>
                        <span className="role-badge">{role}</span>
                    </div>
                    <button onClick={logout} className="logout-btn">
                        Log out
                    </button>
                </div>
            )}

        </nav>
    );
}

export default Navbar;