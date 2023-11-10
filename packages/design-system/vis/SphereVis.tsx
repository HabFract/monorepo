import ApexCharts from 'apexcharts';
import './common.css'
import React, { useRef, useEffect } from 'react';

const SpherePie: React.FC = () => {
  const pieChart = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getChartOptions = () => {
      return {
        series: [52.8, 26.8, 20.4],
        colors: ["#A2EAC4", "#91d5ff", "#6F54B2"],
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
    <div className="sphere-pie">
      <div ref={pieChart} className="py-6" id="pie-chart"></div>
    </div>
  );
};

export default SpherePie;
