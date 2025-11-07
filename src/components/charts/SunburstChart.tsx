import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";

// Inner ring - Bold colors for main categories
const innerRingPalette = [
  "#A2AF9B", "#DCCFC0", "#e2f3c2ff", "#b2d3f1ff", "#c8c6b2ff",
  "#bdbdaaff", "#ace0baff", "#98A1BC", "#89c2c4ff", "#A7C1A8",
  "#7494BC", "#95A0C4", "#6B7280",
];

// Outer ring - Lighter colors for subcategories
const outerRingPalette = ["#748DAE", "#A2AF9B", "#7A7A73"];

interface ChildData {
  name: string;
  value: number;
  color?: string;
  percent?: string;
  isLargeSegment?: boolean;
  parentTotal?: number;
  status?: "alert" | "normal";
}

interface CategoryData {
  name: string;
  total?: number;
  children: ChildData[];
  isHighValue?: boolean;
  isCriticalCategory?: boolean;
  color?: string;
}

interface SunburstChartProps {
  data?: CategoryData[];
  showPercentages?: boolean;
  showValues?: boolean;
  thresholdAlert?: { amount: number } | null;
}

type SunburstNode = CategoryData | ChildData;

const SunburstChart: React.FC<SunburstChartProps> = ({
  data = [],
  showPercentages = true,
  showValues = true,
  thresholdAlert = null,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Wrap data for D3 hierarchy
  const wrappedData: { name: string; children: SunburstNode[] } = {
    name: "Root",
    children: data.map((category, catIdx) => {
      const total =
        category.total ||
        category.children.reduce((sum, c) => sum + (c.value || 0), 0);

      const isHighValue = total > 1000000;
      const isCriticalCategory =
        category.name.toLowerCase().includes("critical") ||
        category.name.toLowerCase().includes("urgent");

      return {
        name: category.name,
        total,
        isHighValue,
        isCriticalCategory,
        color: innerRingPalette[catIdx % innerRingPalette.length],
        children: category.children.map((child, idx) => ({
          name: child.name,
          value: child.value,
          color: outerRingPalette[idx % outerRingPalette.length] || "#6c757d",
          percent: total ? ((child.value / total) * 100).toFixed(2) : "0.00",
          isLargeSegment: total ? (child.value / total) * 100 > 20 : false,
          parentTotal: total,
          status: child.value > (thresholdAlert?.amount || 500_000) ? "alert" : "normal",
        })),
      };
    }),
  };

  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    d3.select(chartElement).selectAll("*").remove();

    const tooltip = d3
      .select(chartElement)
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(11, 29, 58, 0.95)")
      .style("backdrop-filter", "blur(10px)")
      .style("padding", "12px 16px")
      .style("border-radius", "8px")
      .style("border", "1px solid rgba(255, 255, 255, 0.2)")
      .style("box-shadow", "0 8px 16px rgba(0,0,0,0.3)")
      .style("font-size", "12px")
      .style("color", "white")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("font-family", "Inter, sans-serif");

    const width = 300;
    const height = 320;
    const radius = Math.min(width, height) / 2.5; // More padding for labels

    // Type-safe hierarchy
interface RootNode {
  name: string;
  children: SunburstNode[];
}

const wrappedData: RootNode = {
  name: "Root",
  children: data.map((category, catIdx) => {
    const total =
      category.total ||
      category.children.reduce((sum, c) => sum + (c.value || 0), 0);

    const isHighValue = total > 1000000;
    const isCriticalCategory =
      category.name.toLowerCase().includes("critical") ||
      category.name.toLowerCase().includes("urgent");

    return {
      name: category.name,
      total,
      isHighValue,
      isCriticalCategory,
      color: innerRingPalette[catIdx % innerRingPalette.length],
      children: category.children.map((child, idx) => ({
        name: child.name,
        value: child.value,
        color: outerRingPalette[idx % outerRingPalette.length] || "#6c757d",
        percent: total ? ((child.value / total) * 100).toFixed(2) : "0.00",
        isLargeSegment: total ? (child.value / total) * 100 > 20 : false,
        parentTotal: total,
        status: child.value > (thresholdAlert?.amount || 500_000) ? "alert" : "normal",
      })),
    };
  }),
};

// Create hierarchy
const root = d3
  .hierarchy<SunburstNode | RootNode>(wrappedData)
  .sum(d => "value" in d ? d.value : 0);

d3.partition<SunburstNode | RootNode>().size([2 * Math.PI, radius])(root);

    const arc = d3
      .arc<d3.HierarchyRectangularNode<SunburstNode>>()
      .startAngle(d => d.x0!)
      .endAngle(d => d.x1!)
      .innerRadius(d => d.y0!)
      .outerRadius(d => d.y1!);

    const svg = d3
      .select(chartElement)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Add the segments
    const path = svg
      .selectAll("path")
      .data(root.descendants().slice(1))
      .enter()
      .append("path")
      .attr("d", d => arc(d as d3.HierarchyRectangularNode<SunburstNode>)!)
      .style("fill", d => (d.data as SunburstNode).color || "#495057")
      .style("stroke", "rgba(255, 255, 255, 0.3)")
      .style("stroke-width", "1.5px")
      .on("mouseover", function (event, d) {
        const node = d as d3.HierarchyRectangularNode<SunburstNode>;
        tooltip.style("visibility", "visible").html(`${node.data.name}: ${node.value}`);
      })
      .on("mousemove", function (event) {
        tooltip.style("top", event.offsetY + 10 + "px").style("left", event.offsetX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    // Add the labels
    const text = svg
      .selectAll("text")
      .data(root.descendants().slice(1))
      .enter()
      .append("text")
      .attr("transform", function(d) {
        const node = d as d3.HierarchyRectangularNode<SunburstNode>;
        // Calculate the angle at the center of the segment
        const angle = (node.x0 + node.x1) / 2;
        // Calculate radius for the text position (middle of the segment)
        const textRadius = (node.y0 + node.y1) / 2;
        // Calculate x and y positions
        const x = textRadius * Math.sin(angle);
        const y = -textRadius * Math.cos(angle);
        // Determine if we're in the left or right half of the circle
        const rotation = (angle * 180 / Math.PI) + (angle > Math.PI ? 180 : 0);
        
        return `translate(${x},${y}) rotate(${rotation})`;
      })
      .attr("dx", 0)
      .attr("dy", "0.35em")
      .style("font-size", (d) => {
        const node = d as d3.HierarchyRectangularNode<SunburstNode>;
        const arcLength = (node.x1 - node.x0) * (node.y0 + node.y1) / 2;
        // Dynamically adjust font size based on segment size
        return Math.min(arcLength * 0.2, 12) + "px";
      })
      .style("fill", "#000000")
      .style("font-weight", "600")
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .text(function(d) {
        const node = d as d3.HierarchyRectangularNode<SunburstNode>;
        const arcLength = (node.x1 - node.x0) * (node.y0 + node.y1) / 2;
        // Show at least 2 characters for very small segments
        if (arcLength < 15) {
          return node.data.name.substring(0, 2) + '...';
        }
        
        // Truncate text if too long for the segment
        const name = node.data.name;
        if (name.length * (parseInt(this.style.fontSize) * 0.6) > arcLength) {
          const chars = Math.max(2, Math.floor(arcLength / (parseInt(this.style.fontSize) * 0.6)));
          return name.substring(0, chars) + '...';
        }
        return name;
      });
  }, [data, thresholdAlert]);

  return (
    <Box
      ref={chartRef}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        minHeight: 320,
        position: "relative",
        overflow: "visible",
      }}
    />
  );
};

export default SunburstChart;
