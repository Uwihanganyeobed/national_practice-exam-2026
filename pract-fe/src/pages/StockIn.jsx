import { useState, useEffect } from 'react';
import { getSpareParts, createStockIn } from '../lib/api';

export default function StockIn() {
  const [parts, setParts] = useState([]);
  const [form,  setForm]  = useState({ sparePartId: '', stockInQuantity: '', stockInDate: '' });
  const [msg,   setMsg]   = useState('');

  useEffect(() => {
    getSpareParts()
      .then(res => setParts(res.data.results))
      .catch(console.log);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createStockIn(form);
      setMsg('Stock in recorded!');
      setForm({ sparePartId: '', stockInQuantity: '', stockInDate: '' });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock In</h2>
      {msg && <p className="mb-3 text-sm text-green-600">{msg}</p>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Spare Part</label>
          <select required value={form.sparePartId}
            onChange={e => setForm({ ...form, sparePartId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Select part --</option>
            {parts.map(p => (
              <option key={p.SparePartID} value={p.SparePartID}>{p.Name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" required min="1" value={form.stockInQuantity}
            onChange={e => setForm({ ...form, stockInQuantity: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" required value={form.stockInDate}
            onChange={e => setForm({ ...form, stockInDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium">
          Record Stock In
        </button>
      </form>
    </div>
  );
}