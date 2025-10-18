import './assets/css/style.css'

export default function App() {
  return (
    <div className="app-wrapper">
      <header className="site-header">
        <img
          src="/src/assets/img/halliwell-jones-logo.png"
          alt="Halliwell Jones Motorrad"
          className="logo"
        />
        <div className="title-block">
          <h1>Halliwell Jones Motorrad</h1>
          <p className="subtitle">Harber Motorrad V2.0</p>
        </div>
      </header>

      <main className="content">
        <h2>Welcome to your clean slate</h2>
        <p>
          This is the base React + Vite setup for <strong>Harber Motorrad V2.0</strong>.
          Start designing your interface and linking components here.
        </p>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Halliwell Jones Motorrad · Built with React &amp; Vite</p>
      </footer>
    </div>
  )
}
