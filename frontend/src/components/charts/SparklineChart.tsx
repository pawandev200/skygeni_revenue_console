import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  data: number[];
  color: string;
  type: "area" | "bar";
}

export default function SparklineChart({ data, color, type }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
  if (!ref.current || !data.length) return;

  const width = 320;
  const height = 80;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };

  const svg = d3
    .select(ref.current)
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg.selectAll("*").remove();

  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([d3.min(data) ?? 0, d3.max(data) ?? 0])
    .nice()
    .range([height - margin.bottom, margin.top]);

  /* ---------------- GRID LINES ---------------- */

  const gridLines = y.ticks(3);

  svg.selectAll(".grid-line")
    .data(gridLines)
    .enter()
    .append("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#e5e7eb")
    .attr("stroke-width", 1);

  /* ---------------- BAR TYPE ---------------- */

  if (type === "bar") {
    const xBand = d3
      .scaleBand()
      .domain(data.map((_, i) => i.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (_, i) => xBand(i.toString())!)
      .attr("y", d => y(d))
      .attr("width", xBand.bandwidth())
      .attr("height", d => height - margin.bottom - y(d))
      .attr("fill", color)
      .attr("rx", 2);

    return;
  }

  /* ---------------- AREA TYPE ---------------- */

  const area = d3.area<number>()
    .x((_, i) => x(i))
    .y0(height - margin.bottom)
    .y1(d => y(d))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data)
    .attr("fill", color)
    .attr("opacity", 0.25)
    .attr("d", area);

  const line = d3.line<number>()
    .x((_, i) => x(i))
    .y(d => y(d))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("d", line);

}, [data, color, type]);


  return (
    <svg
      ref={ref}
      style={{
        width: "100%",
        height: "70px",
      }}
    />
  );
}
