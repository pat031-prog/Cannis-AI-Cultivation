import React from 'react';

interface GrowthChartProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data, width = 500, height = 100, className = '' }) => {
  if (data.length < 2) {
    return (
      <div style={{ height }} className={`flex items-center justify-center text-xs text-gray-500 ${className}`}>
        Datos de crecimiento insuficientes.
      </div>
    );
  }

  const max = 100; // Growth is a percentage
  const min = 0;
  const range = max - min;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <svg 
      width="100%" 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      preserveAspectRatio="none"
      className={className}
      aria-label="Gráfico de progreso de crecimiento"
    >
      <defs>
        <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(74, 222, 128, 0.4)" />
          <stop offset="100%" stopColor="rgba(74, 222, 128, 0)" />
        </linearGradient>
      </defs>
      <path
        d={`M ${points}`}
        fill="none"
        stroke="rgb(74, 222, 128)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M ${areaPoints}`}
        fill="url(#growthGradient)"
      />
      <circle 
        cx={( (data.length - 1) / (data.length - 1) ) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="4"
        fill="rgb(74, 222, 128)"
      />
    </svg>
  );
};