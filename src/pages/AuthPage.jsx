import { useState } from "react";
import { authService } from "../api/authService";
import { Field, Icon, Logo } from "../components/common/AppUi";

export default function AuthPage({ mode, setMode, onSuccess }) {
  const login = mode === "login";
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = login
        ? await authService.login({
            email: form.email,
            password: form.password,
          })
        : await authService.register(form);
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-aside">
        <div className="brand brand-light">
          <Logo />
        </div>
        <div className="auth-aside-copy">
          <p className="eyebrow">CARE, WITHOUT THE WAIT</p>
          <h1>Make time for what matters.</h1>
          <p>
            Book trusted care, see your place in line, and stay informed from
            your phone.
          </p>
        </div>
        <div className="aside-footer">Secure, private healthcare access</div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="brand brand-dark">
            <Logo />
          </div>
          <div className="auth-heading">
            <p className="eyebrow">{login ? "WELCOME BACK" : "GET STARTED"}</p>
            <h2>
              {login
                ? "Sign in to your care hub"
                : "Create your patient account"}
            </h2>
            <p>
              {login
                ? "Your appointments and care team, all in one place."
                : "It only takes a minute to get started."}
            </p>
          </div>
          <form onSubmit={submit}>
            {!login && (
              <div className="field-row">
                <Field
                  label="First name"
                  value={form.firstName}
                  onChange={update("firstName")}
                  placeholder="John"
                />
                <Field
                  label="Last name"
                  value={form.lastName}
                  onChange={update("lastName")}
                  placeholder="Doe"
                />
              </div>
            )}
            <Field
              label="Email address"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="Enter your password"
              trailing={login ? <a href="#reset">Forgot?</a> : null}
            />
            {!login && (
              <Field
                label="Phone number"
                value={form.phone}
                onChange={update("phone")}
                placeholder="+233 50 123 4567"
              />
            )}
            {error && <div className="form-error">{error}</div>}
            <button
              className="primary-button full-width"
              type="submit"
              disabled={busy}
            >
              {busy ? "Connecting..." : login ? "Sign in" : "Create account"}{" "}
              <Icon name="arrowRight" size={16} />
            </button>
          </form>
          <p className="switch-auth">
            {login ? "New to queueless?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setError("");
                setMode(login ? "register" : "login");
              }}
            >
              {login ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
