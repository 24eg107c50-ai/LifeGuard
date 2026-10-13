import { useState } from "react";
import axios from "axios";
import "./App.css";

const API = `${(import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "")}/api/auth`;

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sosMessage, setSosMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (page === "register") {
        if (form.password !== form.confirmPassword) {
          setMessage("Passwords do not match.");
          return;
        }

        const response = await axios.post(`${API}/register`, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          password: form.password,
        });

        const smsStatus = response.data.smsStatus;

        setMessage(
          smsStatus === "REQUEST_ACCEPTED"
            ? "Registration successful. Your SMS request was accepted by the provider."
            : "Registration successful, but SMS was not sent. Check the SMS configuration."
        );

        setForm({
          fullName: "",
          email: form.email,
          mobile: "",
          password: "",
          confirmPassword: "",
        });

        setPage("login");
      } else {
        const response = await axios.post(`${API}/login`, {
          email: form.email.trim(),
          password: form.password,
        });

        setUser({
          fullName: response.data.fullName,
          email: response.data.email,
        });

        setMessage("");
        setForm({
          fullName: "",
          email: "",
          mobile: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to connect to the server. Check your backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSOS() {
    setSosMessage(
      "Emergency assistance requested. Please contact local emergency services if you are in danger."
    );
  }

  function handleLogout() {
    setUser(null);
    setPage("login");
    setMessage("");
    setSosMessage("");
  }

  // LOGIN AND REGISTER PAGES
  if (!user) {
    return (
      <div className="auth-container">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-logo">🛡️ LifeGuard</div>

          <h2>
            {page === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>

          <p className="auth-subtitle">
            {page === "login"
              ? "Login to access your safety dashboard."
              : "Register to get started with LifeGuard."}
          </p>

          {page === "register" && (
            <>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange}
                required
              />

              <label htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="+91XXXXXXXXXX"
                value={form.mobile}
                onChange={handleChange}
                pattern="^\+[1-9]\d{7,14}$"
                title="Enter your mobile number with country code."
                required
              />
            </>
          )}

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          {page === "register" && (
            <>
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                minLength={8}
                required
              />
            </>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : page === "login"
                ? "Login"
                : "Create Account"}
          </button>

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

          <p className="auth-switch">
            {page === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setPage(page === "login" ? "register" : "login");
                setMessage("");
              }}
            >
              {page === "login" ? "Register" : "Login"}
            </button>
          </p>
        </form>
      </div>
    );
  }

  // LIFEGUARD DASHBOARD
  return (
    <div className="app">
      <header className="navbar">
        <h1>🛡️ LifeGuard</h1>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#contacts">Emergency Contacts</a>
          <a href="#safety">Safety</a>
          <span className="nav-user">
            Hi, {user.fullName}
          </span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="container" id="dashboard">
        <section className="welcome">
          <h2>Your Safety, Our Priority</h2>
          <p>
            Welcome to LifeGuard, {user.fullName}.
            Your personal safety dashboard is ready.
          </p>
        </section>

        <section className="notification-card">
          <h2>📱 SMS Notifications</h2>
          <p>
            Notifications are intended for your registered mobile number.
          </p>
          <p>
            Account: <strong>{user.email}</strong>
          </p>
          <p className="notification-note">
            Registration SMS is supported when the SMS provider is
            configured. Emergency SMS alerts are not yet connected
            to this dashboard's SOS button.
          </p>
        </section>

        <section className="emergency-card">
          <h2>Emergency Assistance</h2>

          <p>
            If you are in immediate danger, contact local emergency
            services directly.
          </p>

          <button className="sos-button" onClick={handleSOS}>
            SOS
          </button>

          <p className="warning">
            Demo only: this button does not call emergency services
            or send your location or an SMS.
          </p>

          {sosMessage && (
            <p className="message" role="status">
              {sosMessage}
            </p>
          )}
        </section>

        <section className="cards" id="safety">
          <article className="card">
            <h3>🟢 Safety Status</h3>
            <p>
              Your dashboard is ready. No live safety monitoring
              is configured yet.
            </p>
          </article>

          <article className="card">
            <h3>📍 Location</h3>
            <p>Location services are not connected.</p>
          </article>

          <article className="card" id="contacts">
            <h3>📞 Emergency Contacts</h3>
            <p>Add trusted contacts to your application.</p>
            <p>
              India's emergency response number:{" "}
              <a href="tel:112">112</a>
            </p>
          </article>
        </section>
      </main>

      <footer>
        <p>LifeGuard © 2026 | Your Safety Matters</p>
      </footer>
    </div>
  );
}

export default App;