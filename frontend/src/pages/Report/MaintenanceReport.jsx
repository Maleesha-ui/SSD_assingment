import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./MaintenanceReport.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function MaintenanceReport() {
  const [chartData, setChartData] = useState([]);
  const [report, setReport] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch vehicles for reference
    axios.get("http://localhost:5000/vehicles")
      .then((res) => setVehicles(res.data.vehicles))
      .catch((err) => console.error("Error fetching vehicles:", err));
    // Fetch monthly report
    fetchReport();
  }, [yearFilter]);

  const fetchReport = async () => {
    try {
      const params = yearFilter ? `year=${yearFilter}` : "";
      const res = await axios.get(`http://localhost:5000/maintenance/report?${params}`);
      setChartData(res.data.chartData || []);
      setReport(res.data.report || []);
      setError("");
    } catch (err) {
      console.error("Fetch Report Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch report.");
      setChartData([]);
      setReport([]);
    }
  };

  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
  };

  const handleDownload = async (format) => {
    try {
      const params = yearFilter ? `year=${yearFilter}` : "";
      const res = await axios.get(`http://localhost:5000/maintenance/report/${format}?${params}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `monthly_maintenance_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Download ${format} Error:`, err);
      alert(`Failed to download ${format.toUpperCase()}.`);
    }
  };

  // Prepare chart data
  const chartConfig = {
    labels: chartData.map((item) => `${item.year}-${item.month}`),
    datasets: [
      {
        label: "Monthly Maintenance Cost ($)",
        data: chartData.map((item) => item.total_cost),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Maintenance Costs by Month (${yearFilter || "All Years"})` },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Cost ($)" } },
      x: { title: { display: true, text: "Year-Month" } },
    },
  };

  return (
    <div className="maintenance-report-container">
      <h1>Monthly Vehicle Maintenance Report</h1>
      {error && <div className="error">{error}</div>}
      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="yearFilter">Year</label>
          <input
            type="number"
            id="yearFilter"
            name="yearFilter"
            value={yearFilter}
            onChange={handleYearChange}
            placeholder="e.g., 2025"
          />
        </div>
        <button className="filter-btn" onClick={fetchReport}>
          <i className="fas fa-filter"></i> Apply Filter
        </button>
      </div>
      <div className="download-buttons">
        <button className="download-btn" onClick={() => handleDownload("pdf")}>
          <i className="fas fa-file-pdf"></i> Download PDF
        </button>
        <button className="download-btn" onClick={() => handleDownload("csv")}>
          <i className="fas fa-file-csv"></i> Download CSV
        </button>
      </div>
      <div className="chart-container">
        {chartData.length > 0 ? (
          <Bar data={chartConfig} options={chartOptions} />
        ) : (
          <p>No maintenance data available for the selected year.</p>
        )}
      </div>
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Year-Month</th>
              <th>Vehicle ID</th>
              <th>Vehicle Model</th>
              <th>Last Service Date</th>
              <th>Next Service Date</th>
              <th>Service Types</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {report.map((item, i) => (
              <tr key={i}>
                <td>{`${item.year}-${item.month}`}</td>
                <td>{item.vehicle_id}</td>
                <td>{item.vehicle_model}</td>
                <td>{new Date(item.last_service_date).toLocaleDateString()}</td>
                <td>{new Date(item.next_service_date).toLocaleDateString()}</td>
                <td>{item.service_types || "None"}</td>
                <td>${item.total_cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MaintenanceReport;