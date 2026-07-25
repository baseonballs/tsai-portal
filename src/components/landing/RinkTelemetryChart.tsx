"use client";

import React, { useEffect, useRef, useState } from "react";

import * as d3 from "d3";

import { PlayerTelemetry, PLAYERS_DATA } from "@/data/players-telemetry";

interface RinkTelemetryChartProps {
  onHoverPlayer?: (player: PlayerTelemetry | null) => void;
}

export function RinkTelemetryChart({ onHoverPlayer = () => {} }: RinkTelemetryChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerTelemetry | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    const width = 600;
    const height = 300;
    const padding = 15;

    // Rink group
    const rink = svg.append("g").attr("class", "rink-surface").attr("transform", `translate(${padding}, ${padding})`);

    const rWidth = width - padding * 2;
    const rHeight = height - padding * 2;

    // 1. Draw Rink Outline (Glassmorphic look)
    rink
      .append("rect")
      .attr("width", rWidth)
      .attr("height", rHeight)
      .attr("rx", 35)
      .attr("ry", 35)
      .attr("fill", "rgba(9, 9, 11, 0.5)")
      .attr("stroke", "rgba(255, 255, 255, 0.08)")
      .attr("stroke-width", 2.5);

    // 2. Draw Center Red Line
    rink
      .append("line")
      .attr("x1", rWidth / 2)
      .attr("y1", 0)
      .attr("x2", rWidth / 2)
      .attr("y2", rHeight)
      .attr("stroke", "rgba(239, 68, 68, 0.35)") // muted red
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "4 2");

    // 3. Draw Blue Lines
    const blueLineOffset = rWidth * 0.15;
    rink
      .append("line")
      .attr("x1", rWidth / 2 - blueLineOffset)
      .attr("y1", 0)
      .attr("x2", rWidth / 2 - blueLineOffset)
      .attr("y2", rHeight)
      .attr("stroke", "rgba(59, 130, 246, 0.5)") // cyan/blue
      .attr("stroke-width", 4);

    rink
      .append("line")
      .attr("x1", rWidth / 2 + blueLineOffset)
      .attr("y1", 0)
      .attr("x2", rWidth / 2 + blueLineOffset)
      .attr("y2", rHeight)
      .attr("stroke", "rgba(59, 130, 246, 0.5)")
      .attr("stroke-width", 4);

    // 4. Center Faceoff Circle & Spot
    rink
      .append("circle")
      .attr("cx", rWidth / 2)
      .attr("cy", rHeight / 2)
      .attr("r", 40)
      .attr("fill", "none")
      .attr("stroke", "rgba(59, 130, 246, 0.3)")
      .attr("stroke-width", 1.5);

    rink
      .append("circle")
      .attr("cx", rWidth / 2)
      .attr("cy", rHeight / 2)
      .attr("r", 4)
      .attr("fill", "rgba(59, 130, 246, 0.5)");

    // 5. Draw Goal Lines & Creases
    const goalLineOffset = 25;
    // Left Goal Line
    rink
      .append("line")
      .attr("x1", goalLineOffset)
      .attr("y1", 10)
      .attr("x2", goalLineOffset)
      .attr("y2", rHeight - 10)
      .attr("stroke", "rgba(239, 68, 68, 0.3)")
      .attr("stroke-width", 1.5);

    // Left Goal Crease
    rink
      .append("path")
      .attr("d", `M ${goalLineOffset} ${rHeight / 2 - 15} A 15 15 0 0 1 ${goalLineOffset} ${rHeight / 2 + 15}`)
      .attr("fill", "rgba(59, 130, 246, 0.1)")
      .attr("stroke", "rgba(239, 68, 68, 0.4)")
      .attr("stroke-width", 1.5);

    // Right Goal Line
    rink
      .append("line")
      .attr("x1", rWidth - goalLineOffset)
      .attr("y1", 10)
      .attr("x2", rWidth - goalLineOffset)
      .attr("y2", rHeight - 10)
      .attr("stroke", "rgba(239, 68, 68, 0.3)")
      .attr("stroke-width", 1.5);

    // Right Goal Crease
    rink
      .append("path")
      .attr(
        "d",
        `M ${rWidth - goalLineOffset} ${rHeight / 2 - 15} A 15 15 0 0 0 ${rWidth - goalLineOffset} ${rHeight / 2 + 15}`,
      )
      .attr("fill", "rgba(59, 130, 246, 0.1)")
      .attr("stroke", "rgba(239, 68, 68, 0.4)")
      .attr("stroke-width", 1.5);

    // 6. Draw Player Trails & Nodes
    PLAYERS_DATA.forEach((player) => {
      // Create a smooth line generator
      const lineGenerator = d3
        .line()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(d3.curveCardinalClosed.tension(0.1));

      // Draw Path Trail
      rink
        .append("path")
        .attr("d", lineGenerator(player.path) ?? "")
        .attr("fill", "none")
        .attr("stroke", player.color)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 4")
        .attr("opacity", 0.3);

      // Skater Node (g element containing dot & label)
      const node = rink.append("g").attr("class", `player-node-${player.id}`).style("cursor", "pointer");

      // Glowing filter overlay circle
      const glow = node
        .append("circle")
        .attr("r", 14)
        .attr("fill", "none")
        .attr("stroke", player.color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.4);

      // Pulse animation for glow
      function pulse() {
        glow
          .transition()
          .duration(1200)
          .attr("r", 18)
          .attr("opacity", 0)
          .transition()
          .duration(0)
          .attr("r", 10)
          .attr("opacity", 0.5)
          .on("end", pulse);
      }
      pulse();

      // Main core circle
      node
        .append("circle")
        .attr("r", 9)
        .attr("fill", player.color)
        .attr("stroke", "rgba(9, 9, 11, 0.8)")
        .attr("stroke-width", 2.5);

      // Number text
      node
        .append("text")
        .text(player.number)
        .attr("text-anchor", "middle")
        .attr("dy", "3px")
        .attr("fill", "#09090b")
        .attr("font-size", "8px")
        .attr("font-weight", "900")
        .attr("font-family", "monospace");

      // Dynamic path-following movement
      const pathNode = rink
        .append("path")
        .attr("d", lineGenerator(player.path) ?? "")
        .attr("fill", "none")
        .style("display", "none")
        .node();



      // Add loops extension helper
      function loopTransition() {
        if (!pathNode) return;
        const pathLength = pathNode.getTotalLength();
        d3.transition()
          .duration(12000 + Math.random() * 6000)
          .ease(d3.easeLinear)
          .tween(`move-${player.id}`, () => {
            return (t) => {
              const point = pathNode.getPointAtLength(t * pathLength);
              node.attr("transform", `translate(${point.x}, ${point.y})`);
            };
          })
          .on("end", loopTransition);
      }
      loopTransition();

      // Interaction Events
      node
        .on("mouseenter", function () {
          d3.select(this).select("circle:nth-child(2)").transition().duration(200).attr("r", 12);
          setSelectedPlayer(player);
          onHoverPlayer(player);
        })
        .on("mouseleave", function () {
          d3.select(this).select("circle:nth-child(2)").transition().duration(200).attr("r", 9);
          setSelectedPlayer(null);
          onHoverPlayer(null);
        });
    });
  }, [onHoverPlayer]);

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/10 p-4 backdrop-blur-xl">
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
        <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
          Live Arena Telemetry (MASCE Tracking)
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 600 300"
        className="h-auto w-full max-w-[600px] overflow-visible drop-shadow-[0_0_20px_rgba(34,211,238,0.05)] select-none"
      />

      {/* Skater Telemetry Tooltip */}
      <div className="mt-2 flex h-6 items-center justify-center">
        {selectedPlayer ? (
          <div className="flex items-center gap-4 font-mono text-xs text-zinc-300">
            <span style={{ color: selectedPlayer.color }}>
              #{selectedPlayer.number} {selectedPlayer.name}
            </span>
            <span className="text-zinc-600">|</span>
            <span>
              Speed: <strong className="text-white">{selectedPlayer.speed} km/h</strong>
            </span>
            <span className="text-zinc-600">|</span>
            <span>
              Heart Rate: <strong className="text-white">{selectedPlayer.heartRate} bpm</strong>
            </span>
            <span className="text-zinc-600">|</span>
            <span>
              Stick Flex: <strong className="text-white">{selectedPlayer.flex}%</strong>
            </span>
          </div>
        ) : (
          <span className="animate-pulse font-mono text-[10px] text-zinc-500">
            Hover over skater nodes to inspect real-time physics vectors
          </span>
        )}
      </div>
    </div>
  );
}
