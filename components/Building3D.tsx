'use client';

import { useEffect, useRef, useState } from 'react';
import { BuildingDesign } from '@/types/building';
import { wallColors, roofColors, trimColors } from '@/data/menardsColors';

interface Building3DProps {
  design: BuildingDesign;
}

export default function Building3D({ design }: Building3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'exterior' | 'interior'>('exterior');

  // Color state (local to this component for UI updates)
  const [localWallColor, setLocalWallColor] = useState(design.wallColor || 'white');
  const [localRoofColor, setLocalRoofColor] = useState(design.roofColor || 'charcoal');
  const [localTrimColor, setLocalTrimColor] = useState(design.trimColor || 'white');

  // View options
  const [showFraming, setShowFraming] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [showRoof, setShowRoof] = useState(true);

  // UI state for color/view panels
  const [activeColorPanel, setActiveColorPanel] = useState<'wall' | 'roof' | 'trim' | null>(null);
  const [activeViewPanel, setActiveViewPanel] = useState<'views' | null>(null);

  // Overlay states for color and view pickers
  const [showWallColorPicker, setShowWallColorPicker] = useState(false);
  const [showRoofColorPicker, setShowRoofColorPicker] = useState(false);
  const [showTrimColorPicker, setShowTrimColorPicker] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);

  // Camera and scene refs for controls
  const cameraRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const wallMeshRef = useRef<any>(null);
  const wallGroupRef = useRef<any>(null); // Reference to wall group
  const roofMeshRef = useRef<any>(null);
  const trimMeshesRef = useRef<any[]>([]);
  const framingGroupRef = useRef<any>(null);
  const backgroundGroupRef = useRef<any>(null);

  // CSS 3D Fallback state (always declared, used conditionally)
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update colors when local state changes
  useEffect(() => {
    console.log("Building3D: v3 - Client Grade Framing Loaded");
    if (!wallMeshRef.current || !roofMeshRef.current) return;

    // Toggle background visibility separate from scene rebuild
    if (backgroundGroupRef.current) {
      backgroundGroupRef.current.visible = showBackground;
    }

    import('three').then((THREE) => {
      // Helper function to create corrugated texture
      const createCorrugatedTexture = (color: THREE.Color, textureWidth: number, textureHeight: number, isVertical: boolean = true, repeatX: number = 1, repeatY: number = 1) => {
        const canvas = document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        const ctx = canvas.getContext('2d')!;

        // Check if color is white (or very close to white)
        const isWhite = color.r > 0.95 && color.g > 0.95 && color.b > 0.95;

        // Base color
        ctx.fillStyle = color.getStyle();
        ctx.fillRect(0, 0, textureWidth, textureHeight);

        // For white colors, use minimal or no shadows/highlights to keep it pure white
        if (!isWhite) {
          // Create corrugated pattern
          const patternSize = 8;
          const gradient = ctx.createLinearGradient(0, 0, isVertical ? 0 : textureWidth, isVertical ? textureHeight : 0);

          // Add highlights and shadows for 3D effect
          for (let i = 0; i < (isVertical ? textureHeight : textureWidth); i += patternSize) {
            const pos = i / (isVertical ? textureHeight : textureWidth);
            const highlight = color.clone().lerp(new THREE.Color(0xffffff), 0.15);
            const shadow = color.clone().lerp(new THREE.Color(0x000000), 0.15);

            gradient.addColorStop(Math.max(0, pos - 0.1), highlight.getStyle());
            gradient.addColorStop(pos, color.getStyle());
            gradient.addColorStop(Math.min(1, pos + 0.1), shadow.getStyle());
          }

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, textureWidth, textureHeight);

          // Add vertical lines for corrugation effect
          ctx.strokeStyle = color.clone().lerp(new THREE.Color(0x000000), 0.1).getStyle();
          ctx.lineWidth = 1;
          for (let i = 0; i < (isVertical ? textureWidth : textureHeight); i += patternSize) {
            ctx.beginPath();
            if (isVertical) {
              ctx.moveTo(i, 0);
              ctx.lineTo(i, textureHeight);
            } else {
              ctx.moveTo(0, i);
              ctx.lineTo(textureWidth, i);
            }
            ctx.stroke();
          }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        return texture;
      };

      // Update wall color - update both color and texture
      const wallColorHex = wallColors.find(c => c.value === localWallColor)?.hex || '#FFFFFF';
      if (wallMeshRef.current && wallMeshRef.current.material) {
        const wallColor = new THREE.Color(wallColorHex);
        wallMeshRef.current.material.color.set(wallColorHex);

        // Dispose old texture
        if (wallMeshRef.current.material.map) {
          wallMeshRef.current.material.map.dispose();
        }
        const buildingHeight = parseInt(design.clearHeight) || 12;
        wallMeshRef.current.material.map = createCorrugatedTexture(wallColor, 256, 512, true, 1, buildingHeight / 2);
        wallMeshRef.current.material.needsUpdate = true;
      }

      // Update roof color - update both color and texture
      const roofColorHex = roofColors.find(c => c.value === localRoofColor)?.hex || '#FFFFFF';
      if (roofMeshRef.current && roofMeshRef.current.material) {
        const roofColor = new THREE.Color(roofColorHex);
        roofMeshRef.current.material.color.set(roofColorHex);

        // Dispose old texture
        if (roofMeshRef.current.material.map) {
          roofMeshRef.current.material.map.dispose();
        }
        const buildingLength = design.length || 30;
        roofMeshRef.current.material.map = createCorrugatedTexture(roofColor, 512, 256, false, buildingLength / 2, 1);
        roofMeshRef.current.material.needsUpdate = true;
      }

      // Update trim colors
      const trimColorHex = trimColors.find(c => c.value === localTrimColor)?.hex || '#FFFFFF';
      trimMeshesRef.current.forEach((trimMesh: any) => {
        if (trimMesh && trimMesh.material) {
          trimMesh.material.color.set(trimColorHex);
        }
      });
    });
  }, [localWallColor, localRoofColor, localTrimColor, design]);

  // Update visibility when view options change
  useEffect(() => {
    // Frame visibility: Show when showFraming toggle is ON
    if (framingGroupRef.current) {
      framingGroupRef.current.visible = showFraming;
    }

    // Walls visibility: Hide when frame is shown (opposite of frame)
    // When "Framing" toggle ON -> hide walls, show frame
    // When "Framing" toggle OFF -> show walls, hide frame
    if (wallMeshRef.current) {
      if (wallMeshRef.current.children) {
        // Wall group - hide all children when frame is shown
        wallMeshRef.current.children.forEach((wall: any) => {
          wall.visible = !showFraming;
        });
      } else {
        // Single wall mesh - hide when frame is shown
        wallMeshRef.current.visible = !showFraming;
      }
    }

    // Hide all trim meshes when frame is shown
    trimMeshesRef.current.forEach((trimMesh: any) => {
      if (trimMesh) {
        trimMesh.visible = !showFraming;
      }
    });

    // Roof visibility: Hide when frame is shown
    // Show only when frame is OFF and showRoof is ON
    if (roofMeshRef.current) {
      roofMeshRef.current.visible = showRoof && !showFraming;
    }

    // Background visibility
    if (backgroundGroupRef.current) {
      backgroundGroupRef.current.visible = showBackground;
    }

    // Hide any backWall or other wall meshes in the scene when frame is shown
    if (sceneRef.current) {
      sceneRef.current.traverse((object: any) => {
        if (object.name && (object.name.includes('wall') || object.name.includes('Wall'))) {
          if (object !== framingGroupRef.current) {
            object.visible = !showFraming;
          }
        }
      });
    }
  }, [showFraming, showBackground, showRoof]);

  useEffect(() => {
    if (!mountRef.current || !isMounted) return;

    let scene: any;
    let camera: any;
    let renderer: any;
    let animationId: number;

    // Dynamically import Three.js
    import('three').then((THREE) => {
      if (!mountRef.current) return;

      try {
        // Clear any previous errors
        setWebglError(null);

        // Clear previous mesh references
        trimMeshesRef.current = [];

        // Check WebGL support - try WebGL2 first, then WebGL1
        const canvas = document.createElement('canvas');
        let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

        // Try WebGL 2.0 first (preferred)
        gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;

        // Fall back to WebGL 1.0 if WebGL 2.0 is not available
        if (!gl) {
          gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
        }

        // Try experimental-webgl as last resort (for older browsers)
        if (!gl) {
          gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
        }

        // If still no WebGL context, show error
        if (!gl) {
          console.warn('WebGL not available. Available contexts:', {
            webgl2: !!canvas.getContext('webgl2'),
            webgl: !!canvas.getContext('webgl'),
            experimental: !!canvas.getContext('experimental-webgl')
          });
          setWebglError('WebGL is disabled in your browser. Please enable WebGL in your browser settings to view the 3D model.');
          return;
        }

        console.log('WebGL detected successfully:', gl instanceof WebGL2RenderingContext ? 'WebGL2' : 'WebGL1');

        // Create renderer - try with WebGL2 first, fallback to WebGL1
        try {
          // Try to create WebGL2 renderer first
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
          });

          // Verify the renderer actually has a valid context
          if (!renderer.domElement || !renderer.getContext()) {
            throw new Error('Renderer context is invalid');
          }
        } catch (rendererError: any) {
          console.error('WebGL renderer creation error:', rendererError);
          setWebglError('Unable to create WebGL context. WebGL may be disabled. Please check your browser settings or try a different browser.');
          return;
        }
        // Set renderer size and append to DOM
        if (mountRef.current) {
          const width = mountRef.current.clientWidth || 800;
          const height = mountRef.current.clientHeight || 600;
          renderer.setSize(width, height);
          mountRef.current.appendChild(renderer.domElement);

          // Verify WebGL is actually working
          const context = renderer.getContext();
          if (!context) {
            throw new Error('WebGL context is null after renderer creation');
          }
        } else {
          throw new Error('Mount ref is null');
        }

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);

        // Camera
        const width = design.width || 24;
        const length = design.length || 30;
        const height = parseInt(design.clearHeight) || 12;

        camera = new THREE.PerspectiveCamera(
          75,
          mountRef.current.clientWidth / mountRef.current.clientHeight,
          0.1,
          1000
        );
        // Adjust camera position based on view mode
        if (viewMode === 'interior') {
          // Interior view: camera inside building looking at back wall
          camera.position.set(0, height * 0.4, length * 0.3);
          camera.lookAt(0, height * 0.4, -length / 2);
        } else {
          // Exterior view: camera outside building
          camera.position.set(width * 0.8, length * 0.6, width * 0.8);
          camera.lookAt(0, 0, 0);
        }

        // Enhanced lighting for better visuals
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Main directional light (sun)
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Additional fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-30, 50, -30);
        scene.add(fillLight);

        // Sky light
        const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x7cb342, 0.4);
        scene.add(skyLight);

        // Simple building box: walls up to clear height
        const buildingWidth = width;
        const buildingLength = length;
        const buildingHeight = height; // clear inside height up to bottom of truss



        // Layering Constants
        // Layering Constants
        const WALL_OFFSET = 0.25; // Increased to 3 inches to clear girts and prevent z-fighting
        const outerWallWidth = buildingWidth + (WALL_OFFSET * 2);
        const outerWallLength = buildingLength + (WALL_OFFSET * 2);

        // Use framing type and roof pitch (if provided) to drive visuals
        const framingType = design.framingType || 'post-frame-construction';
        const roofPitch = design.roofPitch || '4/12';

        // Parse truss spacing early so it's available for all framing calculations
        const trussSpacingFeet = parseFloat(design.trussSpacing || '6');

        // Store refs for later updates
        cameraRef.current = camera;
        sceneRef.current = scene;
        rendererRef.current = renderer;

        // Get colors from local state (allows real-time updates)
        const wallColorHex = wallColors.find(c => c.value === localWallColor)?.hex || '#808080';
        const roofColorHex = roofColors.find(c => c.value === localRoofColor)?.hex || '#654321';
        const trimColorHex = trimColors.find(c => c.value === localTrimColor)?.hex || '#FFFFFF';

        // Convert hex to Three.js color
        const wallColor3D = new THREE.Color(wallColorHex);
        const roofColor3D = new THREE.Color(roofColorHex);
        const trimColor3D = new THREE.Color(trimColorHex);

        // Create corrugated metal texture for walls
        const createCorrugatedTexture = (color: THREE.Color, textureWidth: number, textureHeight: number, isVertical: boolean = true, repeatX: number = 1, repeatY: number = 1) => {
          const canvas = document.createElement('canvas');
          canvas.width = textureWidth;
          canvas.height = textureHeight;
          const ctx = canvas.getContext('2d')!;

          // Check if color is white (or very close to white) - for pure white, no shadows/highlights
          const isWhite = color.r > 0.95 && color.g > 0.95 && color.b > 0.95;

          // Base color
          ctx.fillStyle = color.getStyle();
          ctx.fillRect(0, 0, textureWidth, textureHeight);

          // For white colors, skip shadows/highlights to keep it pure white
          if (!isWhite) {
            // Create corrugated pattern
            const patternSize = 8; // Size of each corrugation
            const gradient = ctx.createLinearGradient(0, 0, isVertical ? 0 : textureWidth, isVertical ? textureHeight : 0);

            // Add highlights and shadows for 3D effect
            for (let i = 0; i < (isVertical ? textureHeight : textureWidth); i += patternSize) {
              const pos = i / (isVertical ? textureHeight : textureWidth);
              const highlight = color.clone().lerp(new THREE.Color(0xffffff), 0.15);
              const shadow = color.clone().lerp(new THREE.Color(0x000000), 0.15);

              gradient.addColorStop(Math.max(0, pos - 0.1), highlight.getStyle());
              gradient.addColorStop(pos, color.getStyle());
              gradient.addColorStop(Math.min(1, pos + 0.1), shadow.getStyle());
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, textureWidth, textureHeight);

            // Add vertical lines for corrugation effect
            ctx.strokeStyle = color.clone().lerp(new THREE.Color(0x000000), 0.1).getStyle();
            ctx.lineWidth = 1;
            for (let i = 0; i < (isVertical ? textureWidth : textureHeight); i += patternSize) {
              ctx.beginPath();
              if (isVertical) {
                ctx.moveTo(i, 0);
                ctx.lineTo(i, textureHeight);
              } else {
                ctx.moveTo(0, i);
                ctx.lineTo(textureWidth, i);
              }
              ctx.stroke();
            }
          }

          const texture = new THREE.CanvasTexture(canvas);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(repeatX, repeatY);
          return texture;
        };

        // Create wall texture (vertical corrugation) - check if white for pure white texture
        const isWallWhite = wallColor3D.r > 0.95 && wallColor3D.g > 0.95 && wallColor3D.b > 0.95;
        const wallTexture = createCorrugatedTexture(wallColor3D, 256, 512, true, 1, buildingHeight / 2);

        // Create building structure based on view mode
        const isInteriorView = viewMode === 'interior';

        // Wood material for framing
        const woodColor = new THREE.Color(0xd4a574); // Light brown wood
        const treatedWoodColor = new THREE.Color(0x9db86a); // Greenish treated wood
        const woodMaterial = new THREE.MeshStandardMaterial({
          color: woodColor,
          roughness: 0.8,
          metalness: 0.1
        });
        const treatedWoodMaterial = new THREE.MeshStandardMaterial({
          color: treatedWoodColor,
          roughness: 0.8,
          metalness: 0.1
        });

        // Create walls - transparent in interior view, solid in exterior
        // Create walls - Solid and OFF-SET from frame
        const wallGeometry = new THREE.BoxGeometry(outerWallWidth, buildingHeight, outerWallLength);
        const wallMaterial = new THREE.MeshStandardMaterial({
          map: wallTexture,
          color: wallColor3D,
          roughness: 0.7,
          metalness: 0.3,
          side: THREE.DoubleSide // Visible from inside (behind framing) and outside
        });
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.name = 'walls'; // Name it for visibility control
        walls.position.y = buildingHeight / 2;
        scene.add(walls);
        wallMeshRef.current = walls; // Store reference for color updates
        // Walls hidden when frame is shown (opposite of frame)
        // When frame is ON, walls are OFF. When frame is OFF, walls are ON
        walls.visible = !showFraming;

        // OFFSET CONSTANTS for layering "Inside -> Out"
        // 0. Frame (Base)
        // 1. Walls (Cladding) = Frame + 0.1
        // 2. Trim = Walls + 0.1
        const ROOF_OFFSET = 0.15; // Roof cladding offset

        const endWallOverhang = parseFloat(design.endWallOverhang || '0');
        const sidewallOverhang = parseFloat(design.sidewallOverhang || '0');

        // Create framing group for visibility toggling
        const framingGroup = new THREE.Group();
        framingGroup.name = 'framing';

        // Calculate roof metrics for truss generation
        let peakHeight = buildingHeight;
        let roofAngle = 0;
        const pitchParts = roofPitch.split('/');
        if (pitchParts.length === 2) {
          const rise = parseFloat(pitchParts[0]);
          const run = parseFloat(pitchParts[1]);
          if (!isNaN(rise) && !isNaN(run) && run > 0) {
            const halfSpan = buildingWidth / 2;
            const extraHeight = (halfSpan * rise) / run;
            peakHeight = buildingHeight + extraHeight;
            roofAngle = Math.atan2(extraHeight, halfSpan);
          }
        }

        // Add framing structure (posts, girts, trusses) - visible in both views
        if (framingType === 'post-frame-construction') {
          // --- POST FRAME CONSTRUCTION (Standard / User Diagram) ---

          const postWidth = 0.5; // 6x6 nominal (0.5 ft)
          const postDepth = 0.5;
          const buriedDepth = 4.0; // 4ft buried
          const trussThickness = 0.125; // 1.5"
          const trussDepth = 0.46; // 5.5" (2x6)
          const girtHeightReal = 0.125; // 1.5 inch
          const girtDepthReal = 0.46; // 5.5 inch
          const trussSpacing = trussSpacingFeet || 8;

          // Helper: Create Member (General)
          const createMemberLocal = (p1: THREE.Vector3, p2: THREE.Vector3, width: number, depth: number, material: THREE.Material) => {
            const length = p1.distanceTo(p2);
            const geometry = new THREE.BoxGeometry(width, length, depth);
            const mesh = new THREE.Mesh(geometry, material);
            const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            mesh.position.copy(midpoint);
            const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
            const axis = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
            mesh.setRotationFromQuaternion(quaternion);
            return mesh;
          };

          const numBays = Math.ceil(buildingLength / trussSpacing);
          const actualPostSpacing = buildingLength / numBays;
          const numPosts = numBays + 1;

          // 1. POSTS & TRUSSES (Side Walls)
          for (let i = 0; i < numPosts; i++) {
            const z = -buildingLength / 2 + i * actualPostSpacing;
            const postCenterY = (buildingHeight - buriedDepth) / 2;
            const totalPostHeight = buildingHeight + buriedDepth;

            // Posts
            const pGeo = new THREE.BoxGeometry(postWidth, totalPostHeight, postDepth);
            const leftPost = new THREE.Mesh(pGeo, treatedWoodMaterial);
            leftPost.position.set(-buildingWidth / 2 + postWidth / 2, postCenterY, z);
            framingGroup.add(leftPost);

            const rightPost = new THREE.Mesh(pGeo, treatedWoodMaterial);
            rightPost.position.set(buildingWidth / 2 - postWidth / 2, postCenterY, z);
            framingGroup.add(rightPost);

            // Footings
            const fGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.0, 16);
            const fMesh = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ color: 0x999999 }));
            const leftF = fMesh.clone(); leftF.position.set(-buildingWidth / 2 + postWidth / 2, -buriedDepth - 0.5, z); framingGroup.add(leftF);
            const rightF = fMesh.clone(); rightF.position.set(buildingWidth / 2 - postWidth / 2, -buriedDepth - 0.5, z); framingGroup.add(rightF);

            // TRUSS (Fink/W-truss pattern as shown in image)
            // Bottom Chord (horizontal)
            const botChordGeo = new THREE.BoxGeometry(buildingWidth, trussDepth, trussThickness);
            const botChord = new THREE.Mesh(botChordGeo, woodMaterial);
            botChord.position.set(0, buildingHeight + trussDepth / 2, z);
            framingGroup.add(botChord);

            // Top Chords (rafters) - form the roof slope
            const slopeHeight = peakHeight - buildingHeight;
            const roofSlopeLen = Math.sqrt(Math.pow(buildingWidth / 2, 2) + Math.pow(slopeHeight, 2));
            const rafterGeo = new THREE.BoxGeometry(roofSlopeLen + 1.0, trussDepth, trussThickness);

            const lRafter = new THREE.Mesh(rafterGeo, woodMaterial);
            lRafter.rotation.z = roofAngle;
            lRafter.position.set(-buildingWidth / 4, buildingHeight + slopeHeight / 2, z);
            framingGroup.add(lRafter);

            const rRafter = new THREE.Mesh(rafterGeo, woodMaterial);
            rRafter.rotation.z = -roofAngle;
            rRafter.position.set(buildingWidth / 4, buildingHeight + slopeHeight / 2, z);
            framingGroup.add(rRafter);

            // Fink/W-truss Webbing Pattern (as shown in image)
            const trussY = buildingHeight + trussDepth;
            const pBotCenter = new THREE.Vector3(0, trussY, z);
            const pRafterMidL = new THREE.Vector3(-buildingWidth / 4, buildingHeight + slopeHeight / 2, z);
            const pRafterMidR = new THREE.Vector3(buildingWidth / 4, buildingHeight + slopeHeight / 2, z);

            // Bottom chord division points for W-pattern
            const pBotThirdL = new THREE.Vector3(-buildingWidth / 3, trussY, z);
            const pBotThirdR = new THREE.Vector3(buildingWidth / 3, trussY, z);

            // Top chord division points
            const pTopThirdL = new THREE.Vector3(-buildingWidth / 6, buildingHeight + slopeHeight * 0.75, z);
            const pTopThirdR = new THREE.Vector3(buildingWidth / 6, buildingHeight + slopeHeight * 0.75, z);

            // Knee Braces (from post to bottom chord)
            const pPostL = new THREE.Vector3(-buildingWidth / 2 + postWidth / 2, buildingHeight - 2, z);
            const pChordL = new THREE.Vector3(-buildingWidth / 2 + 3, buildingHeight + trussDepth / 2, z);
            framingGroup.add(createMemberLocal(pPostL, pChordL, trussThickness, 0.3, woodMaterial));
            const pPostR = new THREE.Vector3(buildingWidth / 2 - postWidth / 2, buildingHeight - 2, z);
            const pChordR = new THREE.Vector3(buildingWidth / 2 - 3, buildingHeight + trussDepth / 2, z);
            framingGroup.add(createMemberLocal(pPostR, pChordR, trussThickness, 0.3, woodMaterial));

            // W-truss web members (forming W pattern)
            // Center vertical member
            framingGroup.add(createMemberLocal(pBotCenter, pRafterMidL, trussThickness, 0.3, woodMaterial));
            framingGroup.add(createMemberLocal(pBotCenter, pRafterMidR, trussThickness, 0.3, woodMaterial));

            // Left side W pattern
            framingGroup.add(createMemberLocal(pRafterMidL, pBotThirdL, trussThickness, 0.3, woodMaterial));
            framingGroup.add(createMemberLocal(pTopThirdL, pBotThirdL, trussThickness, 0.3, woodMaterial));
            framingGroup.add(createMemberLocal(pTopThirdL, pRafterMidL, trussThickness, 0.3, woodMaterial));

            // Right side W pattern
            framingGroup.add(createMemberLocal(pRafterMidR, pBotThirdR, trussThickness, 0.3, woodMaterial));
            framingGroup.add(createMemberLocal(pTopThirdR, pBotThirdR, trussThickness, 0.3, woodMaterial));
            framingGroup.add(createMemberLocal(pTopThirdR, pRafterMidR, trussThickness, 0.3, woodMaterial));
          }

          // 2. SIDE WALL GIRTS ("Standard" - Outside Posts)
          // Exactly 5 girts evenly spaced as shown in the image
          const girtCount = 5;
          const girtGeoSide = new THREE.BoxGeometry(girtDepthReal, girtHeightReal, buildingLength);

          // Calculate spacing for 5 evenly spaced girts
          // Start from bottom (above grade board) to just below roof
          const girtStartHeight = 1.0; // Start at 1ft above ground
          const girtEndHeight = buildingHeight - 0.5; // End just below roof
          const girtSpacing = (girtEndHeight - girtStartHeight) / (girtCount - 1);

          for (let g = 0; g < girtCount; g++) {
            const y = girtStartHeight + (g * girtSpacing);
            if (y > buildingHeight - 0.5) continue;

            // Left (Outside Post) - girts attach to outside face of posts
            const lGirt = new THREE.Mesh(girtGeoSide, woodMaterial);
            lGirt.position.set(-buildingWidth / 2 - girtDepthReal / 2, y, 0);
            framingGroup.add(lGirt);

            // Right (Outside Post) - girts attach to outside face of posts
            const rGirt = new THREE.Mesh(girtGeoSide, woodMaterial);
            rGirt.position.set(buildingWidth / 2 + girtDepthReal / 2, y, 0);
            framingGroup.add(rGirt);
          }


          // 2.5 GRADE BOARD (Bottom Plate) - Treated Wood
          const gradeBoardHeight = 0.65; // ~8 inches (2x8)
          const gradeBoardDepth = 0.125; // 1.5 inches
          const gradeBoardGeo = new THREE.BoxGeometry(gradeBoardDepth, gradeBoardHeight, buildingLength);

          // Left Side Grade Board (attached to outside of posts, at bottom)
          const lGradeBoard = new THREE.Mesh(gradeBoardGeo, treatedWoodMaterial);
          lGradeBoard.position.set(-buildingWidth / 2 - gradeBoardDepth / 2, gradeBoardHeight / 2 + 0.1, 0);
          framingGroup.add(lGradeBoard);

          // Right Side Grade Board
          const rGradeBoard = new THREE.Mesh(gradeBoardGeo, treatedWoodMaterial);
          rGradeBoard.position.set(buildingWidth / 2 + gradeBoardDepth / 2, gradeBoardHeight / 2 + 0.1, 0);
          framingGroup.add(rGradeBoard);

          // 2.6 SIDE WALL V-BRACING (Diagonals)
          const braceThick = 0.125; // 1.5"
          const braceWidth = 0.46; // 5.5" (2x6)

          // Iterate through each bay to add alternating braces
          for (let i = 0; i < numBays; i++) {
            const zStart = -buildingLength / 2 + i * actualPostSpacing;
            const zEnd = -buildingLength / 2 + (i + 1) * actualPostSpacing;

            // Heights for brace connection
            const braceTopY = buildingHeight - 1.0;
            const braceBotY = gradeBoardHeight + 0.5;

            // X positions for Left/Right Walls
            const xLeft = -buildingWidth / 2 + postWidth / 2;
            const xRight = buildingWidth / 2 - postWidth / 2;

            if (i % 2 === 0) {
              // EVEN BAY (0, 2...): Diagonal goes \ (Top-Left to Bottom-Right)
              // This starts the "V"

              // Left Wall
              const pTopLeftL = new THREE.Vector3(xLeft, braceTopY, zStart + postWidth / 2);
              const pBotRightL = new THREE.Vector3(xLeft, braceBotY, zEnd - postWidth / 2);
              framingGroup.add(createMemberLocal(pTopLeftL, pBotRightL, braceThick, braceWidth, woodMaterial));

              // Right Wall
              const pTopLeftR = new THREE.Vector3(xRight, braceTopY, zStart + postWidth / 2);
              const pBotRightR = new THREE.Vector3(xRight, braceBotY, zEnd - postWidth / 2);
              framingGroup.add(createMemberLocal(pTopLeftR, pBotRightR, braceThick, braceWidth, woodMaterial));

            } else {
              // ODD BAY (1, 3...): Diagonal goes / (Top-Right to Bottom-Left)
              // This completes the "V" meeting at the bottom of the shared post

              // Left Wall
              const pTopRightL = new THREE.Vector3(xLeft, braceTopY, zEnd - postWidth / 2);
              const pBotLeftL = new THREE.Vector3(xLeft, braceBotY, zStart + postWidth / 2);
              framingGroup.add(createMemberLocal(pTopRightL, pBotLeftL, braceThick, braceWidth, woodMaterial));

              // Right Wall
              const pTopRightR = new THREE.Vector3(xRight, braceTopY, zEnd - postWidth / 2);
              const pBotLeftR = new THREE.Vector3(xRight, braceBotY, zStart + postWidth / 2);
              framingGroup.add(createMemberLocal(pTopRightR, pBotLeftR, braceThick, braceWidth, woodMaterial));
            }
          }

          // 3. END WALL FRAMING (4 Posts + Diagonal Braces + Girts)
          [1, -1].forEach(dir => {
            const z = (buildingLength / 2 - postDepth / 2) * dir;

            // Intermediate Post Positions
            const xLeft = -buildingWidth / 6;
            const xRight = buildingWidth / 6;

            // Draw Intermediate Posts
            [xLeft, xRight].forEach(x => {
              const dist = Math.abs(x);
              const slopeH = peakHeight - buildingHeight;
              const roofH = peakHeight - (dist * (slopeH / (buildingWidth / 2)));

              const pGeo = new THREE.BoxGeometry(postWidth, roofH + buriedDepth, postDepth);
              const p = new THREE.Mesh(pGeo, treatedWoodMaterial);
              p.position.set(x, (roofH - buriedDepth) / 2, z);
              framingGroup.add(p);
              // Footing
              const fGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.0, 16);
              const f = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ color: 0x999999 }));
              f.position.set(x, -buriedDepth - 0.5, z);
              framingGroup.add(f);
            });

            // Diagonal Brace logic (User Image: Top-Corner -> Bottom-Intermediate)
            // Left Bay Brace
            {
              const pCornerTop = new THREE.Vector3(-buildingWidth / 2 + postWidth / 2, buildingHeight - 1.0, z); // Top of Corner Post
              const pInnerBot = new THREE.Vector3(xLeft, 1.0, z); // Bottom of Intermediate
              framingGroup.add(createMemberLocal(pCornerTop, pInnerBot, 0.125, 0.46, woodMaterial));
            }
            // Right Bay Brace
            {
              const pCornerTop = new THREE.Vector3(buildingWidth / 2 - postWidth / 2, buildingHeight - 1.0, z); // Top of Corner Post
              const pInnerBot = new THREE.Vector3(xRight, 1.0, z); // Bottom of Intermediate
              framingGroup.add(createMemberLocal(pCornerTop, pInnerBot, 0.125, 0.46, woodMaterial));
            }

            // End Wall Girts (Between Posts - exactly 5 girts as shown in image)
            const girtCountEnd = 5;
            const girtStartHeight = 1.0; // Start at 1ft above ground
            const girtEndHeight = buildingHeight - 0.5; // End just below roof
            const girtSpacingEnd = (girtEndHeight - girtStartHeight) / (girtCountEnd - 1);

            const girtGeoCenter = new THREE.BoxGeometry(buildingWidth / 3 - postWidth, girtHeightReal, girtDepthReal); // Center Bay
            const girtGeoSide = new THREE.BoxGeometry(buildingWidth / 3 - postWidth, girtHeightReal, girtDepthReal); // Side Bays (approx)

            for (let g = 0; g < girtCountEnd; g++) {
              const y = girtStartHeight + (g * girtSpacingEnd);
              if (y > buildingHeight - 0.5) continue;

              // Left Bay Girt
              const lg = new THREE.Mesh(girtGeoSide, woodMaterial);
              lg.position.set(-buildingWidth / 3, y, z);
              framingGroup.add(lg);

              // Center Bay Girt
              const cg = new THREE.Mesh(girtGeoCenter, woodMaterial);
              cg.position.set(0, y, z);
              framingGroup.add(cg);

              // Right Bay Girt
              const rg = new THREE.Mesh(girtGeoSide, woodMaterial);
              rg.position.set(buildingWidth / 3, y, z);
              framingGroup.add(rg);
            }
          });

          // 4. ROOF PURLINS (evenly spaced as shown in image)
          const purlinOverhang = endWallOverhang > 0 ? parseFloat(design.endWallOverhang || '0') : 1.5;
          const purlinLength = buildingLength + (purlinOverhang * 2);
          const purlinW = 0.29; // 3.5"
          const purlinH = 0.125; // 1.5"
          const pSlopeLen = Math.sqrt(Math.pow(buildingWidth / 2, 2) + Math.pow(peakHeight - buildingHeight, 2));

          // Evenly spaced purlins (approximately 2ft spacing as shown in image)
          const purlinSpacing = 2.0; // 2 feet spacing
          const numPurlins = Math.floor(pSlopeLen / purlinSpacing);
          const purlinGeo = new THREE.BoxGeometry(purlinW, purlinH, purlinLength);

          for (let p = 1; p <= numPurlins; p++) {
            const dist = p * purlinSpacing;
            const ratio = dist / pSlopeLen;
            const x = ratio * (buildingWidth / 2);
            const yDrop = ratio * (peakHeight - buildingHeight);

            // Left slope purlin
            const lP = new THREE.Mesh(purlinGeo, woodMaterial);
            lP.rotation.z = roofAngle;
            lP.position.set(-x, peakHeight - yDrop + 0.2 + ROOF_OFFSET, 0);
            framingGroup.add(lP);

            // Right slope purlin
            const rP = new THREE.Mesh(purlinGeo, woodMaterial);
            rP.rotation.z = -roofAngle;
            rP.position.set(x, peakHeight - yDrop + 0.2 + ROOF_OFFSET, 0);
            framingGroup.add(rP);
          }

          // Ridge Cap (at peak)
          const rCapGeo = new THREE.BoxGeometry(0.3, 0.15, purlinLength);
          const rCap = new THREE.Mesh(rCapGeo, woodMaterial);
          rCap.position.set(0, peakHeight + 0.2 + ROOF_OFFSET, 0);
          framingGroup.add(rCap);

          // 3.5 FLOOR
          const floorGeo = new THREE.PlaneGeometry(buildingWidth, buildingLength);
          const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, side: THREE.DoubleSide });
          const floor = new THREE.Mesh(floorGeo, floorMat);
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = 0.05;
          framingGroup.add(floor);

        } else if (framingType === 'ladder-frame-construction') {
          // LADDER FRAME IMPL (Simplified)
          const studSpacing = 2;
          const sW = 0.15; // 1.5"
          const sD = 0.45; // 5.5"

          // Plates
          const plateGeo = new THREE.BoxGeometry(sD, sW, buildingLength);
          const lBP = new THREE.Mesh(plateGeo, treatedWoodMaterial); lBP.position.set(-buildingWidth / 2 + sD / 2, sW / 2, 0); framingGroup.add(lBP);
          const rBP = new THREE.Mesh(plateGeo, treatedWoodMaterial); rBP.position.set(buildingWidth / 2 - sD / 2, sW / 2, 0); framingGroup.add(rBP);
          const tPlateGeo = new THREE.BoxGeometry(sD, sW * 2, buildingLength);
          const lTP = new THREE.Mesh(tPlateGeo, woodMaterial); lTP.position.set(-buildingWidth / 2 + sD / 2, buildingHeight - sW, 0); framingGroup.add(lTP);
          const rTP = new THREE.Mesh(tPlateGeo, woodMaterial); rTP.position.set(buildingWidth / 2 - sD / 2, buildingHeight - sW, 0); framingGroup.add(rTP);

          // Studs
          const studGeo = new THREE.BoxGeometry(sD, buildingHeight - sW * 3, sW);
          const numStuds = Math.ceil(buildingLength / studSpacing) + 1;
          for (let i = 0; i < numStuds; i++) {
            const z = -buildingLength / 2 + i * (buildingLength / (numStuds - 1));
            const lS = new THREE.Mesh(studGeo, woodMaterial); lS.position.set(-buildingWidth / 2 + sD / 2, buildingHeight / 2, z); framingGroup.add(lS);
            const rS = new THREE.Mesh(studGeo, woodMaterial); rS.position.set(buildingWidth / 2 - sD / 2, buildingHeight / 2, z); framingGroup.add(rS);
          }

          // End Walls
          const ewWidth = buildingWidth - sD * 2;
          const ewPlateGeo = new THREE.BoxGeometry(ewWidth, sW, sD);
          const fBP = new THREE.Mesh(ewPlateGeo, treatedWoodMaterial); fBP.position.set(0, sW / 2, buildingLength / 2 - sD / 2); framingGroup.add(fBP);
          const bBP = new THREE.Mesh(ewPlateGeo, treatedWoodMaterial); bBP.position.set(0, sW / 2, -buildingLength / 2 + sD / 2); framingGroup.add(bBP);

          const ewStudGeo = new THREE.BoxGeometry(sW, buildingHeight - sW * 3, sD);
          const numEStuds = Math.ceil(ewWidth / studSpacing) + 1;
          for (let k = 0; k < numEStuds; k++) {
            const x = -ewWidth / 2 + k * (ewWidth / (numEStuds - 1));
            const fS = new THREE.Mesh(ewStudGeo, woodMaterial); fS.position.set(x, buildingHeight / 2, buildingLength / 2 - sD / 2); framingGroup.add(fS);
            const bS = new THREE.Mesh(ewStudGeo, woodMaterial); bS.position.set(x, buildingHeight / 2, -buildingLength / 2 + sD / 2); framingGroup.add(bS);
          }

          // Floor (Dirt)
          const floorGeo = new THREE.PlaneGeometry(buildingWidth, buildingLength);
          const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 1.0, side: THREE.DoubleSide }));
          floor.rotation.x = -Math.PI / 2; floor.position.y = 0.05; framingGroup.add(floor);
        }

        // --- MODIFY LAYER POSITIONS ---
        // We need to ensure Walls and Roof are physically OUTSIDE this frame.
        // The frame is built at 'buildingWidth' (outer bounds of posts).
        // So walls should be at buildingWidth + WALL_OFFSET.

        // Re-construct roof geometry to render *on top* of trusses
        try {
          // Roof Geometry
          const roofShape = new THREE.Shape();
          // Profile matches top of trusses but offset upwards
          const roofThick = 0.1;
          const overhang = sidewallOverhang;

          // Start left eave
          roofShape.moveTo(-buildingWidth / 2 - overhang, buildingHeight + ROOF_OFFSET);
          // Peak
          roofShape.lineTo(0, peakHeight + ROOF_OFFSET);
          // Right eave
          roofShape.lineTo(buildingWidth / 2 + overhang, buildingHeight + ROOF_OFFSET);
          // Thickness down (optional, or just single sheet)

          // We can use the created texture
          const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
            depth: buildingLength + (endWallOverhang * 2), // Total length
            bevelEnabled: false
          });

          // Original texture/material creation kept, just geometry updated
          const roof = new THREE.Mesh(roofGeo, roofMeshRef.current?.material || new THREE.MeshStandardMaterial({ color: roofColor3D }));

          // Centering: ExtrudeGeometry starts at Z=0 and goes +Depth. 
          // We want center at 0. So start at -TotalLength/2
          const totalLen = buildingLength + (endWallOverhang * 2);
          roof.position.z = -totalLen / 2;

          scene.add(roof);
          roofMeshRef.current = roof;
          roof.visible = showRoof; // Independent of framing, but usually always shown unless hidden explicitly

        } catch (e) { console.warn("RoofGen error", e); }

        // Add trim elements (corners, edges, base, gable) using trim color
        // Trim uses outerWallWidth to sit ON TOP of walls
        const trimThickness = 0.1;
        const trimWidth = 0.6;
        const trimMaterial = new THREE.MeshStandardMaterial({
          color: trimColor3D,
          roughness: 0.7,
          metalness: 0.2,
          side: THREE.DoubleSide
        });

        // Overhangs (read from design) - defined above

        // 1. CORNER TRIM - Vertical strips at all 4 corners
        // Front Left Corner
        const flCornerGeo = new THREE.BoxGeometry(trimWidth, buildingHeight, trimThickness);
        const flCorner = new THREE.Mesh(flCornerGeo, trimMaterial);
        // Position: use outerWallWidth/Length
        flCorner.position.set(-outerWallWidth / 2 + trimWidth / 2, buildingHeight / 2, outerWallLength / 2 + trimThickness / 2);
        scene.add(flCorner);
        trimMeshesRef.current.push(flCorner);

        // Front Right Corner
        const frCornerGeo = new THREE.BoxGeometry(trimWidth, buildingHeight, trimThickness);
        const frCorner = new THREE.Mesh(frCornerGeo, trimMaterial);
        frCorner.position.set(outerWallWidth / 2 - trimWidth / 2, buildingHeight / 2, outerWallLength / 2 + trimThickness / 2);
        scene.add(frCorner);
        trimMeshesRef.current.push(frCorner);

        // Back Left Corner
        const blCornerGeo = new THREE.BoxGeometry(trimWidth, buildingHeight, trimThickness);
        const blCorner = new THREE.Mesh(blCornerGeo, trimMaterial);
        blCorner.position.set(-outerWallWidth / 2 + trimWidth / 2, buildingHeight / 2, -outerWallLength / 2 - trimThickness / 2);
        scene.add(blCorner);
        trimMeshesRef.current.push(blCorner);

        // Back Right Corner
        const brCornerGeo = new THREE.BoxGeometry(trimWidth, buildingHeight, trimThickness);
        const brCorner = new THREE.Mesh(brCornerGeo, trimMaterial);
        brCorner.position.set(outerWallWidth / 2 - trimWidth / 2, buildingHeight / 2, -outerWallLength / 2 - trimThickness / 2);
        scene.add(brCorner);
        trimMeshesRef.current.push(brCorner);

        // Side Corner Trims (wrapping around the corner)
        const sideTrimGeo = new THREE.BoxGeometry(trimThickness, buildingHeight, trimWidth);

        // Left Side Front
        const lsfCorner = new THREE.Mesh(sideTrimGeo, trimMaterial);
        lsfCorner.position.set(-outerWallWidth / 2 - trimThickness / 2, buildingHeight / 2, outerWallLength / 2 - trimWidth / 2);
        scene.add(lsfCorner);
        trimMeshesRef.current.push(lsfCorner);

        // Right Side Front
        const rsfCorner = new THREE.Mesh(sideTrimGeo, trimMaterial);
        rsfCorner.position.set(outerWallWidth / 2 + trimThickness / 2, buildingHeight / 2, outerWallLength / 2 - trimWidth / 2);
        scene.add(rsfCorner);
        trimMeshesRef.current.push(rsfCorner);

        // Left Side Back
        const lsbCorner = new THREE.Mesh(sideTrimGeo, trimMaterial);
        lsbCorner.position.set(-outerWallWidth / 2 - trimThickness / 2, buildingHeight / 2, -outerWallLength / 2 + trimWidth / 2);
        scene.add(lsbCorner);
        trimMeshesRef.current.push(lsbCorner);

        // Right Side Back
        const rsbCorner = new THREE.Mesh(sideTrimGeo, trimMaterial);
        rsbCorner.position.set(outerWallWidth / 2 + trimThickness / 2, buildingHeight / 2, -outerWallLength / 2 + trimWidth / 2);
        scene.add(rsbCorner);
        trimMeshesRef.current.push(rsbCorner);

        // 2. GABLE / RAKE TRIM - Follows the roof slope on front and back
        const roofHeight = peakHeight - buildingHeight;
        const roofHalfWidth = buildingWidth / 2;
        const roofSlopeLength = Math.sqrt(roofHeight * roofHeight + roofHalfWidth * roofHalfWidth);
        // roofAngle already calculated above

        const rakeTrimWidth = 0.5; // Width of the trim on the face
        const rakeTrimThickness = 0.15; // Thickness sticking out

        const rakeGeo = new THREE.BoxGeometry(roofSlopeLength + 0.5, rakeTrimWidth, rakeTrimThickness); // slight overhang

        // Front Left Rake
        const flRake = new THREE.Mesh(rakeGeo, trimMaterial);
        flRake.rotation.z = roofAngle;
        // Position: X needs to be midpoint of slope, Y midpoint of slope height + wall height
        flRake.position.set(-roofHalfWidth / 2, buildingHeight + roofHeight / 2, buildingLength / 2 + trimThickness / 2);
        scene.add(flRake);
        trimMeshesRef.current.push(flRake);

        // Front Right Rake
        const frRake = new THREE.Mesh(rakeGeo, trimMaterial);
        frRake.rotation.z = -roofAngle;
        frRake.position.set(roofHalfWidth / 2, buildingHeight + roofHeight / 2, buildingLength / 2 + trimThickness / 2);
        scene.add(frRake);
        trimMeshesRef.current.push(frRake);

        // Back Left Rake
        const blRake = new THREE.Mesh(rakeGeo, trimMaterial);
        blRake.rotation.z = roofAngle;
        blRake.position.set(-roofHalfWidth / 2, buildingHeight + roofHeight / 2, -buildingLength / 2 - trimThickness / 2);
        scene.add(blRake);
        trimMeshesRef.current.push(blRake);

        // Back Right Rake
        const brRake = new THREE.Mesh(rakeGeo, trimMaterial);
        brRake.rotation.z = -roofAngle;
        brRake.position.set(roofHalfWidth / 2, buildingHeight + roofHeight / 2, -buildingLength / 2 - trimThickness / 2);
        scene.add(brRake);
        trimMeshesRef.current.push(brRake);

        // 3. EAVE TRIM - Runs along the side walls at the top
        const eaveTrimGeo = new THREE.BoxGeometry(trimThickness, 0.4, buildingLength + (endWallOverhang * 2));

        // Left Eave
        const leftEave = new THREE.Mesh(eaveTrimGeo, trimMaterial);
        leftEave.position.set(-buildingWidth / 2 - trimThickness / 2, buildingHeight - 0.2, 0);
        scene.add(leftEave);
        trimMeshesRef.current.push(leftEave);

        // Right Eave
        const rightEave = new THREE.Mesh(eaveTrimGeo, trimMaterial);
        rightEave.position.set(buildingWidth / 2 + trimThickness / 2, buildingHeight - 0.2, 0);
        scene.add(rightEave);
        trimMeshesRef.current.push(rightEave);

        // 4. BASE TRIM (Wainscot top/bottom or just base) - Optional but good for detail
        // Front Base
        const frontBaseGeo = new THREE.BoxGeometry(buildingWidth, 0.5, trimThickness);
        const frontBase = new THREE.Mesh(frontBaseGeo, trimMaterial);
        frontBase.position.set(0, 0.25, buildingLength / 2 + trimThickness / 2);
        scene.add(frontBase);
        trimMeshesRef.current.push(frontBase);

        // Back Base
        const backBaseGeo = new THREE.BoxGeometry(buildingWidth, 0.5, trimThickness);
        const backBase = new THREE.Mesh(backBaseGeo, trimMaterial);
        backBase.position.set(0, 0.25, -buildingLength / 2 - trimThickness / 2);
        scene.add(backBase);
        trimMeshesRef.current.push(backBase);

        // Side Bases
        const sideBaseGeo = new THREE.BoxGeometry(trimThickness, 0.5, buildingLength);

        const leftBase = new THREE.Mesh(sideBaseGeo, trimMaterial);
        leftBase.position.set(-buildingWidth / 2 - trimThickness / 2, 0.25, 0);
        scene.add(leftBase);
        trimMeshesRef.current.push(leftBase);

        const rightBase = new THREE.Mesh(sideBaseGeo, trimMaterial);
        rightBase.position.set(buildingWidth / 2 + trimThickness / 2, 0.25, 0);
        scene.add(rightBase);
        trimMeshesRef.current.push(rightBase);

        // Ridge Cap (Apex Trim)
        const ridgeCapGeo = new THREE.BoxGeometry(0.5, 0.1, buildingLength + 1);
        const ridgeCap = new THREE.Mesh(ridgeCapGeo, trimMaterial);
        ridgeCap.position.set(0, peakHeight + 0.05, 0);
        scene.add(ridgeCap);
        trimMeshesRef.current.push(ridgeCap);

        // Create grass texture for floor
        const createGrassTexture = () => {
          const canvas = document.createElement('canvas');
          canvas.height = 512;
          const ctx = canvas.getContext('2d')!;

          // Base grass color
          const baseColor = design.floorFinish === 'concrete' ? '#d3d3d3' : '#7cb342';
          ctx.fillStyle = baseColor;
          ctx.fillRect(0, 0, 512, 512);

          if (design.floorFinish !== 'concrete') {
            // Add grass texture variation
            for (let i = 0; i < 2000; i++) {
              const x = Math.random() * 512;
              const y = Math.random() * 512;
              const brightness = Math.random() * 0.3 + 0.7;
              const grassColor = new THREE.Color(baseColor).lerp(new THREE.Color(0xffffff), brightness - 0.7);
              ctx.fillStyle = grassColor.getStyle();
              ctx.fillRect(x, y, 2, 2);
            }

            // Add darker patches
            for (let i = 0; i < 100; i++) {
              const x = Math.random() * 512;
              const y = Math.random() * 512;
              const size = Math.random() * 10 + 5;
              const darkColor = new THREE.Color(baseColor).lerp(new THREE.Color(0x000000), 0.2);
              ctx.fillStyle = darkColor.getStyle();
              ctx.fillRect(x, y, size, size);
            }
          }

          const texture = new THREE.CanvasTexture(canvas);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(10, 10);
          return texture;
        };

        // Floor - with texture (dirt/gravel texture for interior, grass for exterior)
        const floorGeometry = new THREE.PlaneGeometry(200, 200);
        const floorTexture = createGrassTexture();
        const floorColor = design.floorFinish === 'concrete' ? 0xd3d3d3 : (isInteriorView ? 0x8b4513 : 0x7cb342); // Brown for interior dirt, green for exterior grass
        const floorMaterial = new THREE.MeshStandardMaterial({
          map: floorTexture,
          color: floorColor,
          roughness: 0.9
        });
        // Create background group (Floor + Trees)
        const bgGroup = new THREE.Group();
        bgGroup.name = 'background';

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        bgGroup.add(floor);

        // In interior view, add back wall with corrugated metal (visible)
        if (isInteriorView) {
          const backWallGeometry = new THREE.PlaneGeometry(buildingWidth, buildingHeight);
          const backWallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            color: wallColor3D,
            roughness: 0.7,
            metalness: 0.3
          });
          const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
          backWall.position.set(0, buildingHeight / 2, -buildingLength / 2);
          backWall.rotation.y = 0;
          backWall.name = 'backWall'; // Name it so we can find and hide it
          scene.add(backWall);
        }

        // Add trees in the background (only in exterior view)
        if (!isInteriorView) {
          const createTree = (x: number, z: number, scale: number = 1) => {
            const treeGroup = new THREE.Group();

            // Tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.3 * scale, 0.4 * scale, 3 * scale, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1.5 * scale;
            treeGroup.add(trunk);

            // Tree foliage (cone shape)
            const foliageGeometry = new THREE.ConeGeometry(2 * scale, 4 * scale, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0x2d5016).lerp(new THREE.Color(0x4a7c2a), Math.random() * 0.3)
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 3 * scale + 2 * scale;
            treeGroup.add(foliage);

            treeGroup.position.set(x, 0, z);
            return treeGroup;
          };

          // Add multiple trees in the background
          const treePositions = [
            [-buildingWidth * 1.5, -buildingLength * 1.2],
            [-buildingWidth * 1.8, -buildingLength * 1.5],
            [-buildingWidth * 2.1, -buildingLength * 1.0],
            [buildingWidth * 1.5, -buildingLength * 1.2],
            [buildingWidth * 1.8, -buildingLength * 1.5],
            [buildingWidth * 2.1, -buildingLength * 1.0],
            [-buildingWidth * 1.3, -buildingLength * 0.8],
            [buildingWidth * 1.3, -buildingLength * 0.8],
          ];

          treePositions.forEach(([x, z]) => {
            const tree = createTree(x, z, 0.8 + Math.random() * 0.4);
            bgGroup.add(tree);
          });
        }

        scene.add(bgGroup);
        backgroundGroupRef.current = bgGroup;
        if (!showBackground) bgGroup.visible = false;

        // Add framing group to scene - Frame is the BASE structure (skeleton)
        // Structure order: 1. Frame (base), 2. Walls (on frame), 3. Roof (on top)
        scene.add(framingGroup);
        framingGroupRef.current = framingGroup;
        // Frame visible when showFraming toggle is ON
        framingGroup.visible = showFraming;

        // Simple controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const onMouseDown = (e: MouseEvent) => {
          isDragging = true;
          previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const onMouseUp = () => {
          isDragging = false;
        };

        const onMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;

          const deltaX = e.clientX - previousMousePosition.x;
          const deltaY = e.clientY - previousMousePosition.y;

          const spherical = new THREE.Spherical();
          spherical.setFromVector3(camera.position);
          spherical.theta -= deltaX * 0.01;
          spherical.phi += deltaY * 0.01;
          spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

          camera.position.setFromSpherical(spherical);
          camera.lookAt(0, 0, 0);

          previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const onWheel = (e: WheelEvent) => {
          e.preventDefault();
          const distance = camera.position.length();
          const newDistance = distance + e.deltaY * 0.01;
          if (newDistance > 10 && newDistance < 200) {
            camera.position.normalize().multiplyScalar(newDistance);
          }
        };

        renderer.domElement.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('wheel', onWheel);

        // Animation
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          if (renderer && renderer.domElement) {
            renderer.domElement.removeEventListener('mousedown', onMouseDown);
            renderer.domElement.removeEventListener('wheel', onWheel);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
            if (mountRef.current && renderer.domElement.parentNode) {
              mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
          }
        };
      } catch (err: any) {
        console.error('Error creating 3D scene:', err);
        setWebglError('Failed to initialize 3D scene. ' + (err.message || 'Please try refreshing the page.'));
      }
    }).catch((err) => {
      console.error('Error loading Three.js:', err);
      setWebglError('Failed to load 3D library. Please refresh the page.');
    });

    // Cleanup on unmount
    return () => {
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }
    };
  }, [design, isMounted, viewMode]);

  if (!isMounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4">3D Rendering</h3>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ height: '800px' }}>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (webglError) {
    // CSS 3D Fallback - Simple 3D visualization without WebGL
    const width = design.width || 24;
    const length = design.length || 30;
    const height = parseInt(design.clearHeight) || 12;

    // Scale for visualization (1ft = 5px approximately)
    const scale = 5;
    const w = width * scale;
    const l = length * scale;
    const h = height * scale;

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastPos.x;
      const deltaY = e.clientY - lastPos.y;
      setRotation(prev => ({
        x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
        y: prev.y + deltaX * 0.5
      }));
      setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4">3D Rendering (CSS Fallback)</h3>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gradient-to-b from-sky-200 to-green-100 relative" style={{ height: '800px' }}>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: '1000px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s',
              }}
            >
              {/* Building Box - CSS 3D */}
              <div style={{ position: 'relative', width: `${w}px`, height: `${h}px`, transformStyle: 'preserve-3d' }}>
                {/* Front Face */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w}px`,
                    height: `${h}px`,
                    background: 'linear-gradient(135deg, #e0e0e0 0%, #b0b0b0 100%)',
                    border: '2px solid #999',
                    transform: `translateZ(${l / 2}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: 'bold',
                  }}
                >
                  {width}ft × {height}ft
                </div>

                {/* Back Face */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w}px`,
                    height: `${h}px`,
                    background: 'linear-gradient(135deg, #d0d0d0 0%, #a0a0a0 100%)',
                    border: '2px solid #999',
                    transform: `translateZ(-${l / 2}px) rotateY(180deg)`,
                  }}
                />

                {/* Right Face */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${l}px`,
                    height: `${h}px`,
                    background: 'linear-gradient(135deg, #c0c0c0 0%, #909090 100%)',
                    border: '2px solid #999',
                    transform: `rotateY(90deg) translateZ(${w / 2}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: 'bold',
                  }}
                >
                  {length}ft
                </div>

                {/* Left Face */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${l}px`,
                    height: `${h}px`,
                    background: 'linear-gradient(135deg, #b0b0b0 0%, #808080 100%)',
                    border: '2px solid #999',
                    transform: `rotateY(-90deg) translateZ(${w / 2}px)`,
                  }}
                />

                {/* Top Face (Roof) */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w}px`,
                    height: `${l}px`,
                    background: 'linear-gradient(135deg, #8b4513 0%, #654321 100%)',
                    border: '2px solid #654321',
                    transform: `rotateX(90deg) translateZ(${h}px)`,
                  }}
                />

                {/* Bottom Face (Floor) */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w}px`,
                    height: `${l}px`,
                    background: 'linear-gradient(135deg, #90ee90 0%, #7ccd7c 100%)',
                    border: '2px solid #5cb85c',
                    transform: `rotateX(-90deg) translateZ(0px)`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
            <p className="text-xs font-semibold mb-2 text-gray-700">Building Dimensions:</p>
            <p className="text-xs text-gray-600">Width: {width} ft</p>
            <p className="text-xs text-gray-600">Length: {length} ft</p>
            <p className="text-xs text-gray-600">Height: {height} ft</p>
            <p className="text-xs text-gray-500 mt-2 italic">Click and drag to rotate</p>
          </div>

          {/* WebGL Notice */}
          <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 max-w-xs">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> WebGL is disabled. Showing CSS 3D preview. Enable WebGL for full 3D rendering.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Reset camera to default position
  const resetCamera = () => {
    if (cameraRef.current && mountRef.current) {
      const width = design.width || 24;
      const length = design.length || 30;
      if (viewMode === 'interior') {
        const height = parseInt(design.clearHeight) || 12;
        cameraRef.current.position.set(0, height * 0.4, length * 0.3);
        cameraRef.current.lookAt(0, height * 0.4, -length / 2);
      } else {
        cameraRef.current.position.set(width * 0.8, length * 0.6, width * 0.8);
        cameraRef.current.lookAt(0, 0, 0);
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg" style={{ height: '800px' }}>
      {/* Transparent Overlay Background */}
      {(activeColorPanel || activeViewPanel) && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => {
            setActiveColorPanel(null);
            setActiveViewPanel(null);
          }}
        />
      )}

      {/* Slide-in Panel from Right - Transparent */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-96 bg-white/95 backdrop-blur-md shadow-2xl z-40 transition-transform duration-300 ease-in-out border-l border-gray-200 ${(activeColorPanel || activeViewPanel) ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-full overflow-y-auto p-6 relative">
          {/* Color Panel Content - Shows all colors when Colors button is clicked */}
          {activeColorPanel === 'wall' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Choose Colors</h3>

              {/* Wall Colors */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border-2 border-gray-400"
                    style={{ backgroundColor: wallColors.find(c => c.value === localWallColor)?.hex || '#FFFFFF' }}
                  />
                  Wall Color
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {wallColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setLocalWallColor(color.value);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${localWallColor === color.value
                        ? 'border-green-500 ring-4 ring-green-200'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="text-sm font-semibold mt-2 text-gray-800">{color.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Roof Colors */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border-2 border-gray-400"
                    style={{ backgroundColor: roofColors.find(c => c.value === localRoofColor)?.hex || '#654321' }}
                  />
                  Roof Color
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {roofColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setLocalRoofColor(color.value);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${localRoofColor === color.value
                        ? 'border-green-500 ring-4 ring-green-200'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="text-sm font-semibold mt-2 text-gray-800">{color.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trim Colors */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border-2 border-gray-400"
                    style={{ backgroundColor: trimColors.find(c => c.value === localTrimColor)?.hex || '#FFFFFF' }}
                  />
                  Trim Color
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {trimColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setLocalTrimColor(color.value);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${localTrimColor === color.value
                        ? 'border-green-500 ring-4 ring-green-200'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="text-sm font-semibold mt-2 text-gray-800">{color.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* View Panel Content - Includes Views, Navigation, Settings */}
          {activeViewPanel === 'views' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">View Options</h3>

              {/* Views Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Views</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowFraming(!showFraming);
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${showFraming
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-semibold text-lg mb-1">Framing</div>
                    <div className="text-sm text-gray-600">Toggle visibility of posts, trusses, and girts</div>
                  </button>

                  <button
                    onClick={() => {
                      setShowBackground(!showBackground);
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${showBackground
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-semibold text-lg mb-1">Background</div>
                    <div className="text-sm text-gray-600">Toggle visibility of trees and landscape</div>
                  </button>

                  <button
                    onClick={() => {
                      setShowRoof(!showRoof);
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${showRoof
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-semibold text-lg mb-1">Roof</div>
                    <div className="text-sm text-gray-600">Toggle visibility of roof</div>
                  </button>
                </div>
              </div>

              {/* Navigation Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Navigation</h4>
                <div className="space-y-3">
                  <button
                    onClick={resetCamera}
                    className="w-full p-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 transition-all text-left flex items-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg mb-1">Reset View</div>
                      <div className="text-sm text-gray-600">Reset camera to default position</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setViewMode('exterior')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${viewMode === 'exterior'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-semibold text-lg mb-1">Exterior</div>
                    <div className="text-sm text-gray-600">View building from outside</div>
                  </button>

                  <button
                    onClick={() => setViewMode('interior')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${viewMode === 'interior'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-semibold text-lg mb-1">Interior</div>
                    <div className="text-sm text-gray-600">View building from inside</div>
                  </button>
                </div>
              </div>

              {/* Settings Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Settings</h4>
                <div className="space-y-3">
                  <button
                    onClick={toggleFullscreen}
                    className="w-full p-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 transition-all text-left flex items-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg mb-1">Fullscreen</div>
                      <div className="text-sm text-gray-600">Toggle fullscreen mode</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => {
              setActiveColorPanel(null);
              setActiveViewPanel(null);
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Buttons on Top of 3D View */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        <button
          onClick={() => {
            setActiveColorPanel(activeColorPanel === 'wall' ? null : 'wall');
            setActiveViewPanel(null);
          }}
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg ${activeColorPanel === 'wall'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
        >
          Colors
        </button>
        <button
          onClick={() => {
            setActiveViewPanel(activeViewPanel === 'views' ? null : 'views');
            setActiveColorPanel(null);
          }}
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg ${activeViewPanel === 'views'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
        >
          Views
        </button>
      </div>


      {/* Main 3D View */}
      <div className="h-full">
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 h-full">
          <div
            ref={mountRef}
            className="w-full h-full"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600 text-center">Click and drag to rotate, scroll to zoom</p>
      </div>
    </div>
  );
}
