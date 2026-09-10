import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const emptyForm = { fullName: '', email: '', password: '', phone: '' };

function App() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(emptyForm);
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setNotice({ type: 'success', text: 'UI ready. Connect this form to your backend API next.' });
    setLoading(false);
  }

  async function logout() {
    setUser(null);
    setNotice({ type: 'success', text: 'UI logout state cleared. Your logout API is the next step.' });
  }

  return <main className="shell">
    <section className="intro">
      <div className="mark">SK</div>
      <p className="eyebrow">SHOPKART / CUSTOMER ACCESS</p>
      <h1>Your everyday<br /><em>made easy.</em></h1>
      <p className="lede">A calm, secure home for everything you want to bring home next.</p>
      <div className="signal"><span className="signal-dot" /> Frontend UI ready · API not connected</div>
    </section>
    <section className="panel">
      {user ? <div className="profile-view">
        <div className="avatar">{user.fullName?.slice(0, 1).toUpperCase()}</div>
        <p className="eyebrow">MY SHOPKART</p><h2>Welcome back,<br />{user.fullName}.</h2>
        <div className="details"><span>EMAIL</span><strong>{user.email}</strong><span>PHONE</span><strong>{user.phone}</strong></div>
        <button className="button secondary" onClick={logout}>Log out <span>↗</span></button>
      </div> : <>
        <div className="tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button></div>
        <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'NEW TO SHOPKART'}</p>
        <h2>{mode === 'login' ? 'Good to see you.' : 'Make it yours.'}</h2>
        <form onSubmit={submit}>
          {mode === 'register' && <label>Full name<input name="fullName" value={form.fullName} onChange={updateField} placeholder="John Doe" required /></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" required /></label>
          <label>Password<input name="password" type="password" minLength="6" value={form.password} onChange={updateField} placeholder="At least 6 characters" required /></label>
          {mode === 'register' && <label>Phone number<input name="phone" value={form.phone} onChange={updateField} placeholder="9876543210" required /></label>}
          <button className="button" disabled={loading}>{loading ? 'Working...' : mode === 'login' ? 'Sign in securely' : 'Create my account'} <span>↗</span></button>
        </form>
        {notice.text && <p className={`notice ${notice.type}`}>{notice.text}</p>}
      </>}
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);