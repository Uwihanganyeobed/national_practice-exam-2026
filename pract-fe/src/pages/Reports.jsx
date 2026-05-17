import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDailyReport, getStatusReport } from '../lib/api';

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const [date,       setDate]       = useState(today);
  const [dailyData,  setDailyData]  = useState([]);
  const [statusData, setStatusData] = useState([]);

  const fetchDaily = async () => {
    try {
      const res = await getDailyReport(date);
      setDailyData(res.data.results);
    } catch (error) { console.log(error); }
  };

  const fetchStatus = async () => {
    try {
      const res = await getStatusReport();
      setStatusData(res.data.results);
    } catch (error) { console.log(error); }
  };

  useEffect(() => { fetchStatus(); }, []);

  // GENERATE DAILY PDF REPORT — same pattern as your generateReport
  const generateDailyPDF = () => {
    const doc = new jsPDF();
    doc.text(`Daily Stock Out Report — ${date}`, 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [['Part', 'Category', 'Qty', 'Unit Price', 'Total', 'Date', 'User']],
      body: dailyData.map((r) => [
        r.PartName,
        r.Category,
        r.StockOutQuantity,
        Number(r.StockOutUnitPrice).toFixed(2),
        Number(r.StockOutTotalPrice).toFixed(2),
        r.StockOutDate?.slice(0, 10),
        r.Username,
      ]),
    });
    doc.save(`stockout-${date}.pdf`);
  };

  // GENERATE STATUS PDF REPORT
  const generateStatusPDF = () => {
    const doc = new jsPDF();
    doc.text('Stock Status Report', 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [['Part Name', 'Category', 'Total In', 'Total Out', 'Remaining']],
      body: statusData.map((r) => [
        r.Name,
        r.Category,
        r.TotalIn,
        r.TotalOut,
        r.RemainingQuantity,
      ]),
    });
    doc.save('stock-status.pdf');
  };

  return (
    <div className="space-y-8">

      {/* === Daily StockOut Report === */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Daily Stock Out Report</h2>
        <div className="flex gap-3 mb-4">
          <input type="date" value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={fetchDaily}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
            Load Report
          </button>
          <button onClick={generateDailyPDF}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
            Download PDF
          </button>
        </div>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                {['Part','Category','Qty','Unit Price','Total','Date','User'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dailyData.map(r => (
                <tr key={r.StockOutID} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{r.PartName}</td>
                  <td className="px-4 py-2">{r.Category}</td>
                  <td className="px-4 py-2">{r.StockOutQuantity}</td>
                  <td className="px-4 py-2">{Number(r.StockOutUnitPrice).toFixed(2)}</td>
                  <td className="px-4 py-2 font-medium">{Number(r.StockOutTotalPrice).toFixed(2)}</td>
                  <td className="px-4 py-2">{r.StockOutDate?.slice(0,10)}</td>
                  <td className="px-4 py-2">{r.Username}</td>
                </tr>
              ))}
              {dailyData.length === 0 && (
                <tr><td colSpan="7" className="text-center py-6 text-gray-400">Select a date and load</td></tr>
              )}
            </tbody>
            {dailyData.length > 0 && (
              <tfoot className="bg-gray-50 font-medium">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-right">Grand Total:</td>
                  <td className="px-4 py-3 text-blue-700">
                    {dailyData.reduce((s, r) => s + Number(r.StockOutTotalPrice), 0).toFixed(2)}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {/* === Stock Status Report === */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Stock Status</h2>
          <div className="flex gap-2">
            <button onClick={fetchStatus}
              className="text-sm bg-blue-700 text-white px-3 py-1 rounded-lg hover:bg-blue-800 transition">
              Refresh
            </button>
            <button onClick={generateStatusPDF}
              className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition">
              Download PDF
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                {['Part Name','Category','Total In','Total Out','Remaining'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statusData.map(r => (
                <tr key={r.SparePartID} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{r.Name}</td>
                  <td className="px-4 py-2">{r.Category}</td>
                  <td className="px-4 py-2 text-green-700">{r.TotalIn}</td>
                  <td className="px-4 py-2 text-red-600">{r.TotalOut}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      r.RemainingQuantity < 5
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {r.RemainingQuantity}
                    </span>
                  </td>
                </tr>
              ))}
              {statusData.length === 0 && (
                <tr><td colSpan="5" className="text-center py-6 text-gray-400">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}