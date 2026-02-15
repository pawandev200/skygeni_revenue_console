import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { RevenueTrendMonth } from "../../types";

interface Props {
  data: RevenueTrendMonth[];
}

export default function RevenueTrendChart({ data }: Props) {

  console.log("Revenue Trend Data:", data); 
  // Blue bars => Actual Revenue (Closed Won)
  // Orange line => Target Revenue

  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;

    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 40, bottom: 40, left: 60 };

    const svg = d3
      .select(ref.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    svg.selectAll("*").remove();

    const months = data.map(d => d.month);
    const revenues = data.map(d => d.revenue);
    const targets = data.map(d => d.target);
    const maxValue = d3.max([...revenues, ...targets]) ?? 0;

    // const achieved = data.map(d => d.achieved);
    // const maxValue = d3.max(achieved) ?? 0;


    /* ---------------- SCALES ---------------- */

    const x = d3
      .scaleBand()
      .domain(months)
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      // .domain([0, Math.max(100, maxValue * 1.1)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    /* ---------------- AXES ---------------- */

    const yAxis = d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat(d => `$${(Number(d) / 1000).toFixed(0)}k`)
      // .tickFormat(d => `${Number(d).toFixed(0)}%`)
      .tickSize(-width + margin.left + margin.right);

    const gy = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    gy.selectAll(".tick line").attr("stroke", "#f0f2f5");
    gy.select(".domain").remove();

    const gx = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    gx.select(".domain").attr("stroke", "#e2e8f0");

    /* ---------------- BARS (Revenue) ---------------- */

    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.month)!)
      .attr("y", d => y(d.revenue))
      .attr("height", d => height - margin.bottom - y(d.revenue))
      // .attr("y", d => y(d.achieved))
      // .attr("height", d => height - margin.bottom - y(d.achieved))
      .attr("width", x.bandwidth())
      .attr("fill", "#2563eb")
      .attr("rx", 4);

    /* ---------------- LINE (Target) ---------------- */

    const line = d3.line<RevenueTrendMonth>()
      .x(d => x(d.month)! + x.bandwidth() / 2)
      .y(d => y(d.target))
      // .y(d => y(d.achieved))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 3)
      .attr("d", line);

    /* ---------------- DOTS ---------------- */

    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month)! + x.bandwidth() / 2)
      .attr("cy", d => y(d.target))
      // .attr("cy", d => y(d.achieved))
      .attr("r", 5)
      .attr("fill", "white")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2);

  }, [data]);

  return <svg ref={ref} style={{ width: "100%", height: "auto" }} />;
}
