/**
 * Coupe Building Designer - Floor Plan
 * Ported from components/FloorPlan.tsx
 * Uses GoJS to render an architectural floor plan with dimensions.
 */
(function (window) {
    'use strict';

    const CoupeFloorPlan = {
        diagram: null,
        containerId: null,

        init: function (containerId) {
            this.containerId = containerId;
            const $ = go.GraphObject.make;

            this.diagram = $(go.Diagram, containerId, {
                initialAutoScale: go.Diagram.Uniform,
                contentAlignment: go.Spot.Center,
                "undoManager.isEnabled": false,
                allowCopy: false,
                allowDelete: false,
                allowMove: false,
                allowResize: false,
                allowTextEdit: false
            });
        },

        update: function (design) {
            if (!this.diagram) return;
            const $ = go.GraphObject.make;
            const diagram = this.diagram;

            diagram.startTransaction("updateFloorPlan");
            diagram.clear(); // Clear everything and rebuild

            const width = parseFloat(design.width);
            const length = parseFloat(design.length);
            const trussSpacing = parseInt(design.trussSpacing || 8);

            const scale = 20; // 1 ft = 20 px
            const bWidth = width * scale;
            const bLength = length * scale;

            // 1. Building Outline (Background)
            diagram.add($(go.Part,
                { layerName: "Background", selectable: false },
                $(go.Shape, "Rectangle", {
                    width: bWidth,
                    height: bLength,
                    fill: null,
                    stroke: "#000000",
                    strokeWidth: 3
                })
            ));

            // Helper: Format Feet/Inches
            const formatDist = (ft) => {
                const totalInches = Math.round(ft * 12);
                const feet = Math.floor(totalInches / 12);
                const inches = totalInches % 12;
                if (inches === 0) return feet + "'";
                return feet + "' " + inches + '"';
            };

            // 2. Grid Lines (Dashed) & Segments
            // Sidewall Grid (Vertical lines along length)
            const numSegmentsL = Math.ceil(length / trussSpacing);
            for (let i = 1; i < numSegmentsL; i++) {
                const y = i * trussSpacing * scale;
                diagram.add($(go.Part,
                    { layerName: "Grid", selectable: false },
                    $(go.Shape, {
                        geometryString: `M 0 ${y} L ${bWidth} ${y}`,
                        stroke: "#d1d5db",
                        strokeWidth: 1,
                        strokeDashArray: [4, 2]
                    })
                ));
            }

            // Endwall Grid (Horizontal lines along width) - Actually typically trusses run one way. 
            // In post frame, trusses usually span the Width (gabled end). Bays are along Length.
            // So we primarily have bays dividing the Length.
            // The React code had basic grid. I'll stick to simple grid logic.

            // 3. Posts (X Marks)
            const postInset = 0.125 * scale; // 1.5 inches
            const xStyle = { font: "bold 14px sans-serif", stroke: "black" };

            // Generate post positions along the perimeter based on segments
            // Side Walls
            for (let i = 0; i <= numSegmentsL; i++) {
                const y = Math.min(i * trussSpacing * scale, bLength); // Cap at length

                // Left Wall
                diagram.add($(go.Part, { position: new go.Point(-15, y - 5), selectable: false },
                    $(go.TextBlock, "X", xStyle)
                ));

                // Right Wall
                diagram.add($(go.Part, { position: new go.Point(bWidth + 5, y - 5), selectable: false },
                    $(go.TextBlock, "X", xStyle)
                ));
            }
            // End Walls (Corners already handled, add intermediates if width allows)
            const numSegmentsW = Math.ceil(width / trussSpacing);
            for (let i = 1; i < numSegmentsW; i++) {
                const x = i * trussSpacing * scale;
                // Top Wall (Front)
                diagram.add($(go.Part, { position: new go.Point(x - 5, -15), selectable: false },
                    $(go.TextBlock, "X", xStyle)
                ));
                // Bottom Wall (Back)
                diagram.add($(go.Part, { position: new go.Point(x - 5, bLength + 5), selectable: false },
                    $(go.TextBlock, "X", xStyle)
                ));
            }

            // 4. Dimensions
            const dimStyle = { font: "12px sans-serif", stroke: "#000000", background: "white" };

            // Width Dimension (Bottom)
            diagram.add($(go.Part,
                { position: new go.Point(0, bLength + 30), selectable: false },
                $(go.Shape, { geometryString: `M 0 0 L ${bWidth} 0`, stroke: "black" }), // Line
                $(go.Shape, { geometryString: `M 0 0 L -5 -5 M 0 0 L -5 5`, stroke: "black" }), // Arrow Left
                $(go.Shape, { geometryString: `M ${bWidth} 0 L ${bWidth + 5} -5 M ${bWidth} 0 L ${bWidth + 5} 5`, stroke: "black" }), // Arrow Right
                $(go.TextBlock, formatDist(width), { ...dimStyle, position: new go.Point(bWidth / 2 - 15, -10) })
            ));

            // Length Dimension (Left)
            diagram.add($(go.Part,
                { position: new go.Point(-30, 0), selectable: false },
                $(go.Shape, { geometryString: `M 0 0 L 0 ${bLength}`, stroke: "black" }), // Line
                $(go.Shape, { geometryString: `M 0 0 L -5 -5 M 0 0 L 5 -5`, stroke: "black" }), // Arrow Top
                $(go.Shape, { geometryString: `M 0 ${bLength} L -5 ${bLength + 5} M 0 ${bLength} L 5 ${bLength + 5}`, stroke: "black" }), // Arrow Bottom
                $(go.TextBlock, formatDist(length), { ...dimStyle, angle: -90, position: new go.Point(-10, bLength / 2 - 15) })
            ));

            // 5. Openings (Windows/Doors)
            if (design.openings && Array.isArray(design.openings)) {
                design.openings.forEach(op => {
                    // Logic to place opening rect
                    // "x" in design is % along the wall.
                    let xPos = 0, yPos = 0, w = 0, h = 0;

                    // Helper: Opening size in px
                    // Dimensions are ft relative to wall
                    // If Wall A (Left, Length)
                    // Rect is thin width (wall thickness), length is opening width
                    const opW = op.width * scale;
                    const wallThick = 6; // px

                    let angle = 0;

                    if (op.wall === 'left') { // Side Wall A
                        w = wallThick; h = opW; // Vertical on screen
                        xPos = -w;
                        yPos = (op.x / 100) * bLength - (h / 2);
                    } else if (op.wall === 'right') { // Side Wall B
                        w = wallThick; h = opW;
                        xPos = bWidth;
                        yPos = (op.x / 100) * bLength - (h / 2);
                    } else if (op.wall === 'front') { // End Wall C (Top)
                        w = opW; h = wallThick;
                        xPos = (op.x / 100) * bWidth - (w / 2);
                        yPos = -h;
                    } else if (op.wall === 'back') { // End Wall D (Top)
                        w = opW; h = wallThick;
                        xPos = (op.x / 100) * bWidth - (w / 2);
                        yPos = bLength;
                    }

                    const color = op.type === 'door' ? '#a78bfa' : '#60a5fa'; // Purple/Blue

                    diagram.add($(go.Part,
                        { position: new go.Point(xPos, yPos), selectable: false },
                        $(go.Shape, "Rectangle", { width: w, height: h, fill: color, stroke: "black" }),
                        $(go.TextBlock, op.type === 'door' ? "D" : "W", { font: "8px sans-serif", stroke: "white", position: new go.Point(w / 2 - 3, h / 2 - 5) })
                    ));
                });
            }

            diagram.commitTransaction("updateFloorPlan");
            diagram.zoomToFit();
        }
    };

    window.CoupeFloorPlan = CoupeFloorPlan;

})(window);
