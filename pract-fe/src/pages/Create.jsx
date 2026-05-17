import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSparePart } from '../lib/api';

export default function Create() {
  const [form, setForm] = useState({ name: '', category: '', quantity: '', unitPrice: '' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createSparePart(form);
      nav('/spare-parts');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating spare part');
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Spare Part</h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {[
          { label: 'Name',       key: 'name',       type: 'text'   },
          { label: 'Category',   key: 'category',   type: 'text'   },
          { label: 'Quantity',   key: 'quantity',   type: 'number' },
          { label: 'Unit Price', key: 'unitPrice',  type: 'number' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} required value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition font-medium">
            Save
          </button>
          <button type="button" onClick={() => nav('/spare-parts')}
            className="px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}