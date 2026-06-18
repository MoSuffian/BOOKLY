import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

function Login() {

    const navigate = useNavigate();

    // Lock body scroll for the duration this page is mounted
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message,  setMessage]  = useState("");
    const [msgType,  setMsgType]  = useState(""); // "success" | "error"
    const [loading,  setLoading]  = useState(false);
    const [showPwd,  setShowPwd]  = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await API.post("/auth/login", formData);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role",  response.data.role);
            localStorage.setItem("name",  response.data.name);

            setMessage("Login successful! Redirecting…");
            setMsgType("success");

            setFormData({ email: "", password: "" });
            navigate("/dashboard");

        } catch (error) {
            setMessage(error.response?.data?.message || "Invalid credentials. Please try again.");
            setMsgType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* ── Left panel: library photo ── */}
            <div className="auth-left">
                <img
                    src={`${process.env.PUBLIC_URL}/auth-bg.png`}
                    alt="Library interior"
                    className="auth-left-img"
                />
                <div className="auth-left-overlay" />
                <div className="auth-left-quote">
                    <blockquote>
                        "A library is not a luxury but one of the necessities of life."
                    </blockquote>
                    <cite>— Henry Ward Beecher</cite>
                </div>
            </div>

            {/* ── Right panel: form ── */}
            <div className="auth-right">

                {/* Brand */}
                <div className="auth-brand">
                    <img
                        src={`${process.env.PUBLIC_URL}/bookly-logo.png`}
                        alt="Bookly"
                        className="auth-brand-logo"
                    />
                    <span className="auth-brand-name">BOOKLY</span>
                </div>

                <h1 className="auth-heading">Welcome back</h1>
                <p className="auth-subheading">Sign in to your account to continue.</p>

                <form className="auth-form" onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="login-email">Email address</label>
                        <div className="auth-input-wrapper">
                            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                className="auth-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="login-password">Password</label>
                        <div className="auth-input-wrapper">
                            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input
                                id="login-password"
                                type={showPwd ? "text" : "password"}
                                name="password"
                                className="auth-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                style={{ paddingRight: "42px" }}
                            />
                            {/* Show / hide toggle */}
                            <button
                                type="button"
                                onClick={() => setShowPwd((v) => !v)}
                                style={{
                                    position: "absolute", right: 12, background: "none",
                                    border: "none", cursor: "pointer", color: "#a08060",
                                    display: "flex", alignItems: "center", padding: 0
                                }}
                                aria-label={showPwd ? "Hide password" : "Show password"}
                            >
                                {showPwd ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button id="login-submit" type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Signing in…" : "Sign in"}
                    </button>

                </form>

                {/* Feedback */}
                {message && (
                    <p className={`auth-message auth-message--${msgType}`}>{message}</p>
                )}

                {/* Footer */}
                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">Create one</Link>
                </p>

            </div>
        </div>
    );
}

export default Login;
