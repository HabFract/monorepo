import ApexCharts from "apexcharts";
import "./common.css";
import React, { useRef, useEffect } from "react";

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
      const series = Object.fromEntries(
        Object.entries(spherePercentages).map(([type, number]) => [
          type,
          isNaN(number) ? 0 : number,
        ]),
      );
      return {
        series: [series.Astro, series.Sub, series.Atom],
        colors: ["#92a8d4", "#5380e5", "#997ae8"],

        chart: {
          width: "auto",
          height: "80%",
          type: "donut",
        },
        stroke: {
          colors: ["transparent"],
          lineCap: "",
        },
        plotOptions: {
          pie: {
            labels: {
              show: true,
            },
            size: "80%",
            startAngle: -90,
            endAngle: 90,
            offsetY: 10,
            tooltip: {
              theme: "dark",
              x: {
                show: true,
              },
              y: {
                title: {
                  formatter: function () {
                    return "";
                  },
                },
              },
            },
          },
        },
        labels: ["Astronomic", "Sub-astronomic", "Atomic"],
        dataLabels: {
          enabled: true,
          style: {
            fontFamily: "Open Sans, sans-serif",
            colors: ["#E6E8E6"],
          },
        },
        legend: {
          show: true,
          position: "right",
          floating: true,
        },
      };
    };
    if (
      typeof pieChart?.current === "undefined" ||
      (pieChart.current as HTMLElement)!.children?.length > 0
    )
      return;
    // const chart = new ApexCharts(pieChart.current, getChartOptions());
    try {
      // chart.render();
    } catch (error) {
      // console.warn(error);
    }
    // return () => chart.destroy();
  }, []);

  return (
    Object.values(spherePercentages).length > 0 && (
      <div className="sphere-pie relative">
        <div ref={pieChart} className="pie" id="pie-chart"></div>
        <label>
          <div className="sphere-pie-label top-1/2 absolute w-full">
            Breakdown
          </div>
        </label>
      </div>
    )
  );
};

export default SpherePie;
