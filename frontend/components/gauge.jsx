import { useState, useEffect } from "react";
import ReactSpeedometer from "react-d3-speedometer";
const API_BASE = import.meta.env.VITE_API_BASE;
const WS_BASE = import.meta.env.VITE_WS_BASE;

const Gauge = ({ value = 79 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current += 2;

      if (current >= value) {
        current = value;
        clearInterval(interval);
      }

      setDisplayValue(current);
    }, 15);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="w-full max-w-md mx-auto">
      <ReactSpeedometer
        value={displayValue}
        minValue={0}
        maxValue={100}
        segments={1000}
        needleColor="white"
        startColor="#F0B90B"
        needleHeightRatio={0.8}
        maxSegmentLabels={5}
        endColor="red"
        height={200}
      />
    </div>
  );
};

export default Gauge;