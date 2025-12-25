'use client';

import { useEffect, useRef } from 'react';
import * as go from 'gojs';
import { BuildingDesign, Opening } from '@/types/building';

interface FloorPlanProps {
  design: BuildingDesign;
  onOpeningAdd?: (opening: Opening) => void;
  onOpeningRemove?: (opening: Opening) => void;
  onOpeningUpdate?: (opening: Opening) => void;
}

export default function FloorPlan({ design, onOpeningAdd, onOpeningRemove, onOpeningUpdate }: FloorPlanProps) {
  const diagramDiv = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<go.Diagram | null>(null);

  useEffect(() => {
    if (!diagramDiv.current) return;

    const $ = go.GraphObject.make;

    // Create the diagram
    const diagram = $(go.Diagram, diagramDiv.current, {
      initialAutoScale: go.Diagram.Uniform,
      contentAlignment: go.Spot.Center,
      'undoManager.isEnabled': false,
      allowCopy: false,
      allowDelete: false,
      allowMove: false,
      allowResize: false,
      allowTextEdit: false,
    });

    diagramRef.current = diagram;

    const width = design.width;
    const length = design.length;
    const trussSpacing = parseInt(design.trussSpacing);

    // Scale factor: 1 foot = 20 pixels
    const scale = 20;
    const buildingWidth = width * scale;
    const buildingHeight = length * scale;

    // Calculate wall segments based on truss spacing
    const sidewallSegments = Math.ceil(length / trussSpacing);
    const endwallSegments = Math.ceil(width / trussSpacing);

    // Calculate segment sizes
    // For sidewalls (top/bottom): segments of trussSpacing
    // For endwalls (left/right): segments of trussSpacing
    const segmentSize = trussSpacing * scale;

    // Create the main building rectangle
    const building = $(
      go.Part,
      { selectable: false, layerName: 'Background' },
      $(
        go.Shape,
        'Rectangle',
        {
          width: buildingWidth,
          height: buildingHeight,
          fill: null,
          stroke: '#000000',
          strokeWidth: 3,
        }
      )
    );

    diagram.add(building);

    // Helper function to format feet and inches
    const formatFeetInches = (totalInches: number): string => {
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;

      if (inches === 0) {
        return `${feet}'`;
      } else if (feet === 0) {
        // Check for common fractions
        if (Math.abs(inches - 1.5) < 0.1) return "1 1/2\"";
        if (Math.abs(inches - 0.5) < 0.1) return '1/2"';
        if (Math.abs(inches - 0.25) < 0.1) return '1/4"';
        if (Math.abs(inches - 0.75) < 0.1) return '3/4"';
        return `${inches}"`;
      } else {
        // Check for common fractions in inches
        if (Math.abs(inches - 10.5) < 0.1) return `${feet}' 10 1/2"`;
        if (Math.abs(inches - 0.5) < 0.1) return `${feet}' 1/2"`;
        if (Math.abs(inches - 1.5) < 0.1) return `${feet}' 1 1/2"`;
        if (Math.abs(inches - 0.25) < 0.1) return `${feet}' 1/4"`;
        if (Math.abs(inches - 0.75) < 0.1) return `${feet}' 3/4"`;
        // Round to nearest 1/16th
        const roundedInches = Math.round(inches * 16) / 16;
        if (roundedInches % 1 === 0) {
          return `${feet}' ${roundedInches}"`;
        } else {
          const wholeInches = Math.floor(roundedInches);
          const fraction = roundedInches - wholeInches;
          let fractionStr = '';
          if (Math.abs(fraction - 0.5) < 0.01) fractionStr = '1/2';
          else if (Math.abs(fraction - 0.25) < 0.01) fractionStr = '1/4';
          else if (Math.abs(fraction - 0.75) < 0.01) fractionStr = '3/4';
          else if (Math.abs(fraction - 0.125) < 0.01) fractionStr = '1/8';
          else if (Math.abs(fraction - 0.375) < 0.01) fractionStr = '3/8';
          else if (Math.abs(fraction - 0.625) < 0.01) fractionStr = '5/8';
          else if (Math.abs(fraction - 0.875) < 0.01) fractionStr = '7/8';
          else fractionStr = `${Math.round(fraction * 16)}/16`;

          if (wholeInches === 0) {
            return `${feet}' ${fractionStr}"`;
          } else {
            return `${feet}' ${wholeInches} ${fractionStr}"`;
          }
        }
      }
    };

    // Calculate actual segment positions accounting for post spacing
    // Standard post spacing: posts are typically 1.5" (0.125 ft) from edges
    const postOffset = 0.125; // 1.5 inches in feet
    const postWidth = 0.125; // Post width in feet (1.5 inches)

    // Calculate segments for top/bottom walls (sidewalls) - for dimension labels
    const calculateSidewallSegments = () => {
      const segments: Array<{ start: number; end: number; length: number }> = [];

      // First edge segment (typically 1.5" = 0.125 ft)
      if (postOffset > 0) {
        segments.push({ start: 0, end: postOffset, length: postOffset });
      }

      // Calculate how many full truss spacing segments fit
      const remainingWidth = width - (postOffset * 2);
      const fullSegments = Math.floor(remainingWidth / trussSpacing);
      let currentPos = postOffset;

      // Add full truss spacing segments
      for (let i = 0; i < fullSegments; i++) {
        const segmentStart = currentPos;
        const segmentEnd = currentPos + trussSpacing;
        segments.push({ start: segmentStart, end: segmentEnd, length: trussSpacing });
        currentPos = segmentEnd;
      }

      // Last edge segment
      if (currentPos < width - postOffset) {
        const lastLength = width - postOffset - currentPos;
        segments.push({ start: currentPos, end: width - postOffset, length: lastLength });
      }

      // Add final edge segment
      if (postOffset > 0 && segments.length > 0) {
        segments[segments.length - 1].end = width;
        segments[segments.length - 1].length = width - segments[segments.length - 1].start;
      }

      return segments;
    };

    // Calculate segments for left/right walls (endwalls) - for dimension labels
    const calculateEndwallSegments = () => {
      const segments: Array<{ start: number; end: number; length: number }> = [];

      // First edge segment (typically 1.5" = 0.125 ft)
      if (postOffset > 0) {
        segments.push({ start: 0, end: postOffset, length: postOffset });
      }

      // Calculate how many full truss spacing segments fit
      const remainingLength = length - (postOffset * 2);
      const fullSegments = Math.floor(remainingLength / trussSpacing);
      let currentPos = postOffset;

      // Add full truss spacing segments
      for (let i = 0; i < fullSegments; i++) {
        const segmentStart = currentPos;
        const segmentEnd = currentPos + trussSpacing;
        segments.push({ start: segmentStart, end: segmentEnd, length: trussSpacing });
        currentPos = segmentEnd;
      }

      // Last edge segment
      if (currentPos < length - postOffset) {
        const lastLength = length - postOffset - currentPos;
        segments.push({ start: currentPos, end: length - postOffset, length: lastLength });
      }

      // Add final edge segment
      if (postOffset > 0 && segments.length > 0) {
        segments[segments.length - 1].end = length;
        segments[segments.length - 1].length = length - segments[segments.length - 1].start;
      }

      return segments;
    };

    const sidewallSegmentsList = calculateSidewallSegments();
    const endwallSegmentsList = calculateEndwallSegments();

    // Calculate X mark positions (at segment boundaries - start and end of each segment)
    // Use Array.from to avoid iterating Set directly (ES5 target without downlevelIteration)
    const sidewallXPositions = Array.from(
      new Set([
        0,
        ...sidewallSegmentsList.flatMap(s => [s.start * scale, s.end * scale]),
        buildingWidth,
      ]),
    ).sort((a, b) => a - b);

    const endwallXPositions = Array.from(
      new Set([
        0,
        ...endwallSegmentsList.flatMap(s => [s.start * scale, s.end * scale]),
        buildingHeight,
      ]),
    ).sort((a, b) => a - b);

    // Add grid lines for truss spacing
    // Vertical grid lines (sidewall segments)
    for (let i = 1; i < sidewallSegments; i++) {
      const x = i * trussSpacing * scale;
      const gridLine = $(
        go.Part,
        { selectable: false, layerName: 'Grid' },
        $(
          go.Shape,
          {
            geometryString: `M ${x} 0 L ${x} ${buildingHeight}`,
            stroke: '#d1d5db',
            strokeWidth: 1,
            strokeDashArray: [4, 2],
          }
        )
      );
      diagram.add(gridLine);
    }

    // Horizontal grid lines (endwall segments)
    for (let i = 1; i < endwallSegments; i++) {
      const y = i * trussSpacing * scale;
      const gridLine = $(
        go.Part,
        { selectable: false, layerName: 'Grid' },
        $(
          go.Shape,
          {
            geometryString: `M 0 ${y} L ${buildingWidth} ${y}`,
            stroke: '#d1d5db',
            strokeWidth: 1,
            strokeDashArray: [4, 2],
          }
        )
      );
      diagram.add(gridLine);
    }

    // Add X marks (posts) along walls
    const xMarkSize = 8;
    const xMarkStyle = {
      font: 'bold 14px sans-serif',
      stroke: '#000000',
    };

    // Top wall (1-A) - X marks at segment boundaries
    sidewallXPositions.forEach((x) => {
      if (x >= 0 && x <= buildingWidth) {
        const xMark = $(
          go.Part,
          { selectable: false, layerName: 'Foreground' },
          $(go.TextBlock, 'X', {
            ...xMarkStyle,
            alignment: go.Spot.Center,
          })
        );
        xMark.position = new go.Point(x, -10);
        diagram.add(xMark);
      }
    });

    // Bottom wall (1-B) - X marks at segment boundaries
    sidewallXPositions.forEach((x) => {
      if (x >= 0 && x <= buildingWidth) {
        const xMark = $(
          go.Part,
          { selectable: false, layerName: 'Foreground' },
          $(go.TextBlock, 'X', {
            ...xMarkStyle,
            alignment: go.Spot.Center,
          })
        );
        xMark.position = new go.Point(x, buildingHeight + 10);
        diagram.add(xMark);
      }
    });

    // Left wall (1-C) - X marks at segment boundaries
    endwallXPositions.forEach((y) => {
      if (y >= 0 && y <= buildingHeight) {
        const xMark = $(
          go.Part,
          { selectable: false, layerName: 'Foreground' },
          $(go.TextBlock, 'X', {
            ...xMarkStyle,
            alignment: go.Spot.Center,
          })
        );
        xMark.position = new go.Point(-10, y);
        diagram.add(xMark);
      }
    });

    // Right wall (1-D) - X marks at segment boundaries
    endwallXPositions.forEach((y) => {
      if (y >= 0 && y <= buildingHeight) {
        const xMark = $(
          go.Part,
          { selectable: false, layerName: 'Foreground' },
          $(go.TextBlock, 'X', {
            ...xMarkStyle,
            alignment: go.Spot.Center,
          })
        );
        xMark.position = new go.Point(buildingWidth + 10, y);
        diagram.add(xMark);
      }
    });


    // Add segment dimension labels along walls
    const segmentLabelStyle = {
      font: '10px sans-serif',
      stroke: '#000000',
    };

    // Top wall (1-A) - segment labels with detailed measurements
    sidewallSegmentsList.forEach((segment, i) => {
      const x1 = segment.start * scale;
      const x2 = segment.end * scale;
      const segmentWidth = x2 - x1;
      const segmentFeet = segment.length;
      const segmentInches = segmentFeet * 12;

      if (segmentFeet > 0) {
        const labelText = formatFeetInches(segmentInches);
        const label = $(
          go.Part,
          { selectable: false, layerName: 'Foreground' },
          $(go.TextBlock, labelText, {
            ...segmentLabelStyle,
            alignment: go.Spot.TopCenter,
          })
        );
        label.position = new go.Point(x1 + segmentWidth / 2, -25);
        diagram.add(label);
      }
    });

    // Bottom wall (1-B) - segment labels with detailed measurements
    sidewallSegmentsList.forEach((segment, i) => {
      const x1 = segment.start * scale;
      const x2 = segment.end * scale;
      const segmentWidth = x2 - x1;
      const segmentFeet = segment.length;
      const segmentInches = segmentFeet * 12;

      if (segmentFeet > 0) {
        const labelText = formatFeetInches(segmentInches);
        const label = $(
          go.Part,
          { selectable: false, layerName: 'Foreground' },
          $(go.TextBlock, labelText, {
            ...segmentLabelStyle,
            alignment: go.Spot.BottomCenter,
          })
        );
        label.position = new go.Point(x1 + segmentWidth / 2, buildingHeight + 25);
        diagram.add(label);
      }
    });

    // Left wall (1-C) - segment labels with detailed measurements
    endwallSegmentsList.forEach((segment, i) => {
      const y1 = segment.start * scale;
      const y2 = segment.end * scale;
      const segmentHeight = y2 - y1;
      const segmentFeet = segment.length;
      const segmentInches = segmentFeet * 12;

      if (segmentFeet > 0) {
        const labelText = formatFeetInches(segmentInches);
        const label = $(
          go.Part,
          { selectable: false, layerName: 'Foreground' },
          $(go.TextBlock, labelText, {
            ...segmentLabelStyle,
            angle: -90,
            alignment: go.Spot.LeftCenter,
          })
        );
        label.position = new go.Point(-25, y1 + segmentHeight / 2);
        diagram.add(label);
      }
    });

    // Right wall (1-D) - segment labels with detailed measurements
    endwallSegmentsList.forEach((segment, i) => {
      const y1 = segment.start * scale;
      const y2 = segment.end * scale;
      const segmentHeight = y2 - y1;
      const segmentFeet = segment.length;
      const segmentInches = segmentFeet * 12;

      if (segmentFeet > 0) {
        const labelText = formatFeetInches(segmentInches);
        const label = $(
          go.Part,
          { selectable: false, layerName: 'Foreground' },
          $(go.TextBlock, labelText, {
            ...segmentLabelStyle,
            angle: 90,
            alignment: go.Spot.RightCenter,
          })
        );
        label.position = new go.Point(buildingWidth + 25, y1 + segmentHeight / 2);
        diagram.add(label);
      }
    });

    // Add wall labels (1-A, 1-B, 1-C, 1-D) in red
    const wallLabelStyle = {
      font: 'bold 14px sans-serif',
      stroke: '#ff0000',
    };

    // Top wall (1-A)
    const topLabel = $(
      go.Part,
      { selectable: false, layerName: 'Foreground' },
      $(go.TextBlock, '1-A', {
        ...wallLabelStyle,
        alignment: go.Spot.TopCenter,
        alignmentFocus: go.Spot.TopCenter,
      })
    );
    topLabel.position = new go.Point(buildingWidth / 2, -45);
    diagram.add(topLabel);

    // Bottom wall (1-B)
    const bottomLabel = $(
      go.Part,
      { selectable: false, layerName: 'Foreground' },
      $(go.TextBlock, '1-B', {
        ...wallLabelStyle,
        alignment: go.Spot.BottomCenter,
        alignmentFocus: go.Spot.BottomCenter,
      })
    );
    bottomLabel.position = new go.Point(buildingWidth / 2, buildingHeight + 45);
    diagram.add(bottomLabel);

    // Left wall (1-C)
    const leftLabel = $(
      go.Part,
      { selectable: false, layerName: 'Foreground' },
      $(go.TextBlock, '1-C', {
        ...wallLabelStyle,
        angle: -90,
        alignment: go.Spot.LeftCenter,
        alignmentFocus: go.Spot.LeftCenter,
      })
    );
    leftLabel.position = new go.Point(-45, buildingHeight / 2);
    diagram.add(leftLabel);

    // Right wall (1-D)
    const rightLabel = $(
      go.Part,
      { selectable: false, layerName: 'Foreground' },
      $(go.TextBlock, '1-D', {
        ...wallLabelStyle,
        angle: 90,
        alignment: go.Spot.RightCenter,
        alignmentFocus: go.Spot.RightCenter,
      })
    );
    rightLabel.position = new go.Point(buildingWidth + 45, buildingHeight / 2);
    diagram.add(rightLabel);

    // Add overall dimension labels with dimension lines
    const dimStyle = {
      font: '12px sans-serif',
      stroke: '#000000',
    };

    // Width dimension (bottom) with dimension line
    const widthDimLine = $(
      go.Part,
      { selectable: false, layerName: 'Foreground' },
      $(
        go.Shape,
        {
          geometryString: `M 0 ${buildingHeight + 35} L ${buildingWidth} ${buildingHeight + 35}`,
          stroke: '#000000',
          strokeWidth: 1,
        }
      ),
      // Arrow at start
      $(
        go.Shape,
        {
          geometryString: `M 0 ${buildingHeight + 35} L -5 ${buildingHeight + 30} M 0 ${buildingHeight + 35} L -5 ${buildingHeight + 40}`,
          stroke: '#000000',
          strokeWidth: 1,
        }
      ),
      // Arrow at end
      $(
        go.Shape,
        {
          geometryString: `M ${buildingWidth} ${buildingHeight + 35} L ${buildingWidth + 5} ${buildingHeight + 30} M ${buildingWidth} ${buildingHeight + 35} L ${buildingWidth + 5} ${buildingHeight + 40}`,
          stroke: '#000000',
          strokeWidth: 1,
        }
      )
    );
    diagram.add(widthDimLine);

    const widthDim = $(
      go.Part,
      { selectable: false, layerName: 'Foreground' },
      $(go.TextBlock, `${width}' 0"`, {
        ...dimStyle,
        alignment: go.Spot.Center,
        background: '#ffffff',
      })
    );
    widthDim.position = new go.Point(buildingWidth / 2, buildingHeight + 35);
    diagram.add(widthDim);

    // Length dimension (left) with dimension line
    const lengthDimLine = $(
      go.Part,
      { selectable: false, layerName: 'Foreground' },
      $(
        go.Shape,
        {
          geometryString: `M -35 0 L -35 ${buildingHeight}`,
          stroke: '#000000',
          strokeWidth: 1,
        }
      ),
      // Arrow at start
      $(
        go.Shape,
        {
          geometryString: `M -35 0 L -30 -5 M -35 0 L -40 -5`,
          stroke: '#000000',
          strokeWidth: 1,
        }
      ),
      // Arrow at end
      $(
        go.Shape,
        {
          geometryString: `M -35 ${buildingHeight} L -30 ${buildingHeight + 5} M -35 ${buildingHeight} L -40 ${buildingHeight + 5}`,
          stroke: '#000000',
          strokeWidth: 1,
        }
      )
    );
    diagram.add(lengthDimLine);

    const lengthDim = $(
      go.Part,
      { selectable: false, layerName: 'Foreground' },
      $(go.TextBlock, `${length}' 0"`, {
        ...dimStyle,
        angle: -90,
        alignment: go.Spot.Center,
        background: '#ffffff',
      })
    );
    lengthDim.position = new go.Point(-35, buildingHeight / 2);
    diagram.add(lengthDim);

    // Add openings
    if (design.openings && design.openings.length > 0) {
      design.openings.forEach((opening) => {
        const isHorizontal = opening.wall === 'front' || opening.wall === 'back';
        const openingWidth = isHorizontal ? opening.width * scale : scale * 0.5;
        const openingHeight = isHorizontal ? scale * 0.5 : opening.height * scale;

        let x = 0;
        let y = 0;

        if (opening.wall === 'front') {
          x = (opening.x / 100) * buildingWidth - openingWidth / 2;
          y = -openingHeight;
        } else if (opening.wall === 'back') {
          x = (opening.x / 100) * buildingWidth - openingWidth / 2;
          y = buildingHeight;
        } else if (opening.wall === 'left') {
          x = -openingWidth;
          y = (opening.y / 100) * buildingHeight - openingHeight / 2;
        } else if (opening.wall === 'right') {
          x = buildingWidth;
          y = (opening.y / 100) * buildingHeight - openingHeight / 2;
        }

        const openingColor = opening.type === 'door' ? '#8b5cf6' : '#3b82f6';

        const openingPart = $(
          go.Part,
          {
            selectable: false,
            layerName: 'Foreground',
          },
          $(
            go.Shape,
            'Rectangle',
            {
              width: openingWidth,
              height: openingHeight,
              fill: openingColor,
              stroke: '#000000',
              strokeWidth: 1,
            }
          ),
          $(
            go.TextBlock,
            opening.name.split(' ')[0],
            {
              font: 'bold 8px sans-serif',
              stroke: '#000000',
              alignment: go.Spot.Center,
            }
          )
        );

        openingPart.position = new go.Point(x, y);
        diagram.add(openingPart);
      });
    }

    // Fit the diagram to show all content
    diagram.commandHandler.zoomToFit();

    return () => {
      if (diagramRef.current) {
        diagramRef.current.div = null;
        diagramRef.current = null;
      }
    };
  }, [design]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">FLOOR PLAN</h3>
      <div
        ref={diagramDiv}
        className="border-2 border-gray-300 rounded"
        style={{
          width: '100%',
          height: '700px',
          minHeight: '600px',
          background: '#ffffff',
        }}
      />
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p className="font-semibold">Total Area: {design.width * design.length} sq ft</p>
        <p className="font-semibold">Perimeter: {(design.width + design.length) * 2} linear ft</p>
      </div>
    </div>
  );
}
