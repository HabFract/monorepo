import ApexCharts from 'apexcharts';
import React, { useRef, useEffect } from 'react';

const SpherePie: React.FC = () => {
  const pieChart = useRef();

  useEffect(() => {
    const getChartOptions = () => {
      return {
        series: [52.8, 26.8, 20.4],
        colors: ["#1C64F2", "#16BDCA", "#9061F9"],
        chart: {
          height: 420,
          width: "100%",
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
            size: "100%",
            dataLabels: {
              offset: -25
            }
          },
        },
        labels: ["Direct", "Organic search", "Referrals"],
        dataLabels: {
          enabled: true,
          style: {
            fontFamily: "Inter, sans-serif",
          },
        },
        legend: {
          position: "bottom",
          fontFamily: "Inter, sans-serif",
        },
        yaxis: {
          labels: {
            formatter: function (value) {
              return value + "%"
            },
          },
        },
        xaxis: {
          labels: {
            formatter: function (value) {
              return value  + "%"
            },
          },
          axisTicks: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        },
      }
    }
    const chart = new ApexCharts(pieChart, getChartOptions());
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
