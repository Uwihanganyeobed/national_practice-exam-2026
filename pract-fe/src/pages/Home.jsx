import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getSpareParts, createSparePart } from '../lib/api';

export default function Home() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await getSpareParts();
      setProducts(res.data.results);      // ← same as your pattern
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // GENERATE PDF REPORT — your exact pattern
  const generateReport = () => {
    const doc = new jsPDF();
    doc.text('Spare Parts Report', 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [['Name', 'Category', 'Qty', 'Unit Price', 'Total Price']],
      body: products.map((product) => [
        product.Name,
        product.Category,
        product.Quantity,
        Number(product.UnitPrice).toFixed(2),
        Number(product.TotalPrice).toFixed(2),
      ]),
    });
    doc.save('spare-parts-report.pdf');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Spare Parts</h2>
        <div className="flex gap-3">
          <Link
            to="/create"
            className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            + Add Spare Part
          </Link>
          <button
            onClick={generateReport}
            className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Download Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product name</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Quantity</th>
              <th className="px-4 py-3 text-left font-medium">Unit price</th>
              <th className="px-4 py-3 text-left font-medium">Total price</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.SparePartID} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{product.Name}</td>
                <td className="px-4 py-2">{product.Category}</td>
                <td className="px-4 py-2">{product.Quantity}</td>
                <td className="px-4 py-2">{Number(product.UnitPrice).toFixed(2)}</td>
                <td className="px-4 py-2">{Number(product.TotalPrice).toFixed(2)}</td>
                <td className="px-4 py-2 flex gap-3">
                  <Link
                    to={`/edit/${product.SparePartID}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400">
                  No spare parts yet.{' '}
                  <Link to="/create" className="text-blue-600 hover:underline">Add one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}