/* eslint-disable */
"use client";
import { select } from "d3-selection";
import { useEffect, useRef, useState } from "react";

// Example data: Only the first three rows are provided as an example
// Add more animals or change up the style as you desire

// TODO: Write this interface
interface AnimalDatum {}

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // TODO: Load CSV data
  useEffect(() => {
    console.log("Implement CSV loading!");
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 60, bottom: 80, left: 100 };

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg = select(graphRef.current!).append<SVGSVGElement>("svg").attr("width", width).attr("height", height);

    // TODO: Implement the rest of the graph
    // HINT: Look up the documentation at these links
    // https://github.com/d3/d3-scale#band-scales
    // https://github.com/d3/d3-scale#linear-scales
    // https://github.com/d3/d3-scale#ordinal-scales
    // https://github.com/d3/d3-axis
  }, [animalData]);

  // TODO: Return the graph
  return (
    <div className="relative min-h-[360px] overflow-x-auto bg-[#eef5f1]">
      <div ref={graphRef} className="min-h-[360px] min-w-[600px]" aria-label="Animal speed visualization" />
      {animalData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="max-w-sm">
            <span className="mx-auto block h-2 w-2 rounded-full bg-[#bf7138]" aria-hidden="true" />
            <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">
              Preparing the comparison
            </p>
            <p className="mt-3 text-sm leading-6 text-[#60796e]">
              Speed observations will be plotted here once the field dataset is available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
