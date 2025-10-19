import { NavLink } from 'react-router-dom'

const linkBase = "px-3 py-2 rounded-md text-sm font-medium"
const linkActive = "bg-white/10"
const linkInactive = "hover:bg-white/5"

export default function TopNav() {
  const tabs = [
    { to: '/home', label: 'Home' },
    { to: '/deals', label: 'Deals' },
    { to: '/part-ex', label: 'Part Ex' },
    { to: '/bikes', label: 'Bikes' },
    { to: '/to-do', label: 'To Do' },
    { to: '/new-deal', label: 'New Deal' },
  ]

  return (
    <nav style={{
      display: 'flex',
      gap: '8px',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      position: 'sticky',
      top: 0,
      backdropFilter: 'blur(6px)'
    }}>
      {tabs.map(t => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
