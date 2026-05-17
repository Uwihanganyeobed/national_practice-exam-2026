import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Create from './pages/Create';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Reports from './pages/Reports';
// import Login     from './pages/Login';
// import Layout    from './pages/Layout';
// import Home      from './pages/Home';        // SparePart list + PDF report
// import StockIn   from './pages/StockIn';
// import StockOut  from './pages/StockOut';
// import Reports   from './pages/Reports';
// import Create    from './pages/Create';
// import Edit      from './pages/Edit';

const Private = ({ children }) =>
  localStorage.getItem('token') ? children : <Navigate to="/login" replace />;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Private><Layout /></Private>}>
          <Route index        element={<Navigate to="/spare-parts" replace />} />
          <Route path="spare-parts" element={<Home />} />
          <Route path="create"      element={<Create />} />
          {/* <Route path="edit/:id"    element={<Edit />} /> */}
          <Route path="stock-in"    element={<StockIn />} />
          <Route path="stock-out"   element={<StockOut />} />
          <Route path="reports"     element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}