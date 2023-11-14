// App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import './App.css';

// Register necessary elements and scales
Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

const App = () => {
  const [data, setData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://reference.intellisense.io/thickenernn/v1/referencia');
        const currentData = response.data?.current?.data || {};

        if (currentData.TK1) {
          const TK1 = currentData.TK1;

          const dataArray = [];

          for (const metricName in TK1) {
            if (metricName.startsWith('TK1_')) {
              const { times, values } = TK1[metricName];
              dataArray.push({
                metric: metricName,
                times: times,
                values: values,
              });
            }
          }

          setData(dataArray);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const tableData = dataLoaded ? data.filter(entry => entry.values.length > 0) : [];

  const getRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  };
  
const selectedMetricData = tableData
  ?.filter(entry => entry.metric === selectedMetric)
  .pop(); // Get the last entry for the selected metric

const lineGraphData = {
  type: 'line',
  data: {
    labels: selectedMetricData?.times || [],
    datasets: [
      {
        label: selectedMetric,
        data: selectedMetricData?.values || [],
        borderColor: getRandomColor(),
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Times',
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: selectedMetric,
        },
      },
    },
  },
};


  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  return (
    <div>
      <div className="center-container">
        <h1>Data Visualization</h1>

        {/* Dropdown for Metric Selection */}
        <div>
          <label className="labelStyle">Select metric  to view the line graph :</label>
          <select className="dropdown" value={selectedMetric} onChange={handleMetricChange}>
            <option value="" disabled>Select a Metric</option>
            {tableData.map(entry => (
              <option key={entry.metric} value={entry.metric}>{entry.metric}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(entry => (
              <tr key={entry.metric}>
                <td>{entry.metric}</td>
                <td>{entry.values.slice(-1)[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Line Graph */}
      {selectedMetric && (
        <div className="line-chart-container">
          <h2>Line Graph for {selectedMetric}</h2>
          <Line data={lineGraphData.data} options={lineGraphData.options} />
        </div>
      )}
    </div>
  );
};

export default App;
