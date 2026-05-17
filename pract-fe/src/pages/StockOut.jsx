import { useState, useEffect } from 'react';
import { getSpareParts, createStockOut, getStockOuts, updateStockOut, deleteStockOut } from '../lib/api';

export default function StockOut() {
  const [parts,   setParts]   = useState([]);
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({ sparePartId:'', stockOutQuantity:'', stockOutUnitPrice:'', stockOutDate:'' });
  const [msg,     setMsg]     = useState('');

  const load = async () => {
    try {
      const [p, r] = await Promise.all([getSpareParts(), getStockOuts()]);
      setParts(p.data.results);
      setRecords(r.data.results);
    } catch (error) { console.log(error); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editing) {
        await updateStockOut(editing, form);
        setMsg('Updated!');
        setEditing(null);
      } else {
        await createStockOut(form);
        setMsg('Stock out recorded!');
      }
      setForm({ sparePartId:'', stockOutQuantity:'', stockOutUnitPrice:'', stockOutDate:'' });
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (r) => {
    setEditing(r.StockOutID);
    setForm({
      sparePartId:       r.SparePartID,
      stockOutQuantity:  r.StockOutQuantity,
      stockOutUnitPrice: r.StockOutUnitPrice,
      stockOutDate:      r.StockOutDate?.slice(0, 10),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await deleteStockOut(id); load(); }
    catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock Out</h2>
      {msg && <p className="mb-3 text-sm text-green-600">{msg}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-lg mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Spare Part</label>
          <select required value={form.sparePartId}
            onChange={e => setForm({ ...form, sparePartId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Select part --</option>
            {parts.map(p => <option key={p.SparePartID} value={p.SparePartID}>{p.Name}</option>)}
          </select>
        </div>
        {[
          { label: 'Quantity',   key: 'stockOutQuantity',  type: 'number' },
          { label: 'Unit Price', key: 'stockOutUnitPrice', type: 'number' },
          { label: 'Date',       key: 'stockOutDate',      type: 'date'   },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} required value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
        <div className="flex gap-3">
          <button type="submit"
            className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition font-medium">
            {editing ? 'Update' : 'Record Stock Out'}
          </button>
          {editing && (
            <button type="button"
              onClick={() => { setEditing(null); setForm({ sparePartId:'', stockOutQuantity:'', stockOutUnitPrice:'', stockOutDate:'' }); }}
              className="px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {['Part','Qty','Unit Price','Total','Date','User','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.StockOutID} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{r.PartName}</td>
                <td className="px-4 py-2">{r.StockOutQuantity}</td>
                <td className="px-4 py-2">{Number(r.StockOutUnitPrice).toFixed(2)}</td>
                <td className="px-4 py-2">{Number(r.StockOutTotalPrice).toFixed(2)}</td>
                <td className="px-4 py-2">{r.StockOutDate?.slice(0, 10)}</td>
                <td className="px-4 py-2">{r.Username}</td>
                <td className="px-4 py-2 flex gap-3">
                  <button onClick={() => handleEdit(r)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(r.StockOutID)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}