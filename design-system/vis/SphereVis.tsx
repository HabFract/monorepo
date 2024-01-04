import ApexCharts from 'apexcharts';
import './common.css'
import React, { useRef, useEffect } from 'react';

interface SpherePieProps {
  spherePercentages: {
    Sub: number;
    Atom: number;
    Astro: number;
  };
}

const SpherePie: React.FC<SpherePieProps> = ({ spherePercentages }) => {
  const pieChart = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getChartOptions = () => {
      const series = Object.fromEntries(Object.entries(spherePercentages).map(([type, number]) => [type, isNaN(number) ? 0 : number]));
      console.log('series :>> ', series);
      return {
        series: [series.Sub, series.Atom, series.Astro],
        colors: ["rgba(64, 169, 255, 0.5)", "rgba(107,125,127, 0.9)","rgba(189, 16, 224, 0.3)"],
        chart: {
          width: 'auto',
          height: "100%",
          type: "pie",
        },
        stroke: {
          colors: ["white"],
          lineCap: "",
        },
        plotOptions: {
          pie: {
            labels: {
              show: true,
            },
            size: "80%",
            dataLabels: {
              offset: -8
            }
          },
        },
        labels: ["Atomic", "Subatomic", "Astronomic"],
        dataLabels: {
          enabled: true,
          style: {
            fontFamily: "Open Sans, sans-serif",
            colors: ['#E6E8E6']
          },
        },
        legend: {
          show: false
        }
      }
    }
    if(typeof  pieChart?.current === "undefined" || (pieChart.current as HTMLElement)!.children?.length > 0) return;
    const chart = new ApexCharts(pieChart.current, getChartOptions());
    chart.render();
  }, [])
  
  return (
    //@ts-ignore
    <div className="sphere-pie relative">
      <div ref={pieChart} className="py-6" id="pie-chart"></div>
      <label><div className="sphere-pie-label absolute top-8 -left-2 w-full">Orbit Scales %</div></label>
    </div>
  );
};

export default SpherePie;
