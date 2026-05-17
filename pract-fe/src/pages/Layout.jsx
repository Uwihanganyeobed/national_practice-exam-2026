import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const links = [
  { to: '/spare-parts', label: 'SparePart' },
  { to: '/stock-in',    label: 'StockIn'   },
  { to: '/stock-out',   label: 'StockOut'  },
  { to: '/reports',     label: 'Reports'   },
];

export default function Layout() {
  const nav = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    nav('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 text-white px-6 py-3 flex items-center gap-4">
        <span className="font-bold text-lg mr-2">SIMS</span>
        {links.map(l => (
          <NavLink
            key={l.to} to={l.to}
            className={({ isActive }) =>
              `text-sm px-3 py-1 rounded transition ${isActive ? 'bg-blue-900' : 'hover:bg-blue-600'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="ml-auto text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition"
        >
          Logout
        </button>
      </nav>
      <main className="p-6"><Outlet /></main>
    </div>
  );
}