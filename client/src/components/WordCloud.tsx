import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

type Word = {
  text: string;
  value: number;
};

interface WordCloudProps {
  words: Word[];
}

export function WordCloud({ words }: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!words || !svgRef.current) return;

    const width = 600;
    const height = 400;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const layout = cloud()
      .size([width, height])
      .words(words.map(d => ({ ...d, size: 10 + d.value * 3 })))
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .fontSize(d => (d as any).size)
      .on("end", draw);

    layout.start();

    function draw(entries: any[]) {
      d3.select(svgRef.current)
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)
        .selectAll("text")
        .data(entries)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("fill", () => d3.schemeCategory10[~~(Math.random() * 10)])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }, [words]);

  return (
    <div className="flex justify-center">
      <svg ref={svgRef} />
    </div>
  );
}
