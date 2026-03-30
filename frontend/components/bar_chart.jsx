import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const defaultContributions = {
  subscription: 20,
  vix: -10,
  roce: 15,
  de: -5,
};


const Bar_Chart = ({ contributions = defaultContributions, mode }) => {
  
  const config = {
    0: {
      labels: ["Subscription", "VIX"],
      keys: ["subscription", "vix"],
    },
    1: {
      labels: ["ROCE", "D/E"],
      keys: ["roce", "de"],
    },
  };

  const { labels, keys } = config[mode];

 
  const values = keys.map((key) => Number(contributions[key]) * 100);

  
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: values.map((v) =>
          v < 0 ? "#d77b0a" : "#F0B90B"
        ),
        borderRadius: 6,
      },
    ],
  };


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",

    plugins: {
      title: {
        display: true,
        text: "Contribution of each parameter",
        color: "#EAECEF",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw}`,
        },
      },
    },

    scales: {
      x: {
        min: -100,   
        max: 100,

        grid: {
          color: (ctx) =>
            ctx.tick.value === 0 ? "#dbd8cc" : "#2B3139",
          lineWidth: (ctx) =>
            ctx.tick.value === 0 ? 2 : 1,
        },

        ticks: {
          color: "#848E9C",
        },
      },

      y: {
        ticks: {
          color: "#EAECEF",
        },
      },
    },
  };

  return (
    <div className="w-full max-w-xl h-64">
      <Bar data={data} options={options} />
    </div>
  );
};

export default Bar_Chart;