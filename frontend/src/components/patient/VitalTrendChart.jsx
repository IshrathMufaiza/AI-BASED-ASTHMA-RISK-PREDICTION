import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function VitalTrendChart({
  title,
  icon,
  unit,
  dataKey,
  healthHistory,
}) {

  const chartData = {

    labels: [...healthHistory]
      .reverse()
      .map((record) =>
        new Date(record.createdAt)
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
      ),

    datasets: [
      {
        label: title,

        data: [...healthHistory]
          .reverse()
          .map(
            (record) => record[dataKey]
          ),

        borderColor: "#2563eb",

        backgroundColor:
          "rgba(37,99,235,0.12)",

        fill: true,

        tension: 0.35,

        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div
      className="patient-profile-card"
      style={{ marginTop: "30px" }}
    >
      <h3>
        {icon} {title}
      </h3>

      <Line
        data={chartData}
        options={options}
      />
    </div>
  );
}

export default VitalTrendChart;