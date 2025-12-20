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
  const [localSoffitColor, setLocalSoffitColor] = useState(design.soffitColor || 'white');

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
  const soffitMeshRef = useRef<any>(null);
  const trimMeshesRef = useRef<any[]>([]);
  const framingGroupRef = useRef<any>(null);
  const backgroundGroupRef = useRef<any>(null);
  const skyRef = useRef<any>(null);
  const threeRef = useRef<any>(null);

  // CSS 3D Fallback state (always declared, used conditionally)
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync local color state with design prop changes (for preview updates)
  useEffect(() => {
    setLocalWallColor(design.wallColor || 'white');
  }, [design.wallColor]);

  useEffect(() => {
    setLocalRoofColor(design.roofColor || 'charcoal');
  }, [design.roofColor]);

  useEffect(() => {
    setLocalTrimColor(design.trimColor || 'white');
  }, [design.trimColor]);

  useEffect(() => {
    setLocalSoffitColor(design.soffitColor || 'white');
  }, [design.soffitColor]);

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
      // Update wall color - update both color and texture
      const wallColorHex = wallColors.find(c => c.value === localWallColor)?.hex || '#FFFFFF';
      if (wallMeshRef.current) {
        const wallColor = new THREE.Color(wallColorHex);
        const buildingHeight = parseInt(design.clearHeight) || 12;
        // Create texture once to share
        const newTexture = createCorrugatedTexture(wallColor, 256, 512, true, 1, buildingHeight / 2);

        const updateWallMesh = (mesh: any) => {
          if (mesh.isMesh && mesh.material) {
            mesh.material.color.set(wallColorHex);
            if (mesh.material.map) mesh.material.map.dispose();
            mesh.material.map = newTexture.clone(); // Clone to avoid shared state issues if any
            mesh.material.needsUpdate = true;
          }
        };

        if (wallMeshRef.current.isGroup) {
          wallMeshRef.current.traverse(updateWallMesh);
        } else {
          updateWallMesh(wallMeshRef.current);
        }
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
        roofMeshRef.current.material.map = createCorrugatedTexture(roofColor, 512, 256, true, 1, buildingLength / 2);
        roofMeshRef.current.material.needsUpdate = true;
      }

      // Update trim colors
      const trimColorHex = trimColors.find(c => c.value === localTrimColor)?.hex || '#FFFFFF';
      trimMeshesRef.current.forEach((trimMesh: any) => {
        if (trimMesh && trimMesh.material) {
          trimMesh.material.color.set(trimColorHex);
        }
      });

      // Update soffit color
      const soffitColorHex = trimColors.find(c => c.value === localSoffitColor)?.hex || '#FFFFFF';
      if (soffitMeshRef.current) {
        if (soffitMeshRef.current.isGroup) {
          soffitMeshRef.current.traverse((child: any) => {
            if (child.isMesh && child.material) child.material.color.set(soffitColorHex);
          });
        } else if (soffitMeshRef.current.material) {
          soffitMeshRef.current.material.color.set(soffitColorHex);
        }
      }
    });
  }, [localWallColor, localRoofColor, localTrimColor, localSoffitColor, design]);

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
    if (soffitMeshRef.current) {
      soffitMeshRef.current.visible = showRoof && !showFraming;
    }

    // Background visibility
    if (backgroundGroupRef.current) {
      backgroundGroupRef.current.visible = showBackground;
    }
    // Sky visibility
    // Sky visibility
    if (skyRef.current && threeRef.current) {
      skyRef.current.visible = showBackground;
      // Also update scene background to match (if sky is hidden, show white/simple bg, else sky blue)
      if (sceneRef.current) {
        // Use threeRef.current directly to avoid ReferenceError
        sceneRef.current.background = showBackground
          ? new threeRef.current.Color(0x87ceeb)
          : new threeRef.current.Color(0xf0f0f0);
      }
    }

    // Hide any backWall or other wall meshes in the scene when frame is shown
    if (sceneRef.current) {
      sceneRef.current.traverse((object: any) => {
        if (object.name && (object.name.includes('wall') || object.name.includes('Wall') || object.name === 'gables')) {
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
    // Dynamically import Three.js and Sky
    Promise.all([
      import('three'),
      import('three/examples/jsm/objects/Sky.js')
    ]).then(([THREE, { Sky }]) => {
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

        // Add Sky
        const sky = new Sky();
        sky.scale.setScalar(450000);
        scene.add(sky);
        skyRef.current = sky; // Store reference
        sky.visible = showBackground; // Set initial visibility

        const sun = new THREE.Vector3();
        const effectController = {
          turbidity: 10,
          rayleigh: 3,
          mieCoefficient: 0.005,
          mieDirectionalG: 0.7,
          elevation: 2,
          azimuth: 180,
          exposure: renderer.toneMappingExposure
        };

        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = effectController.turbidity;
        uniforms['rayleigh'].value = effectController.rayleigh;
        uniforms['mieCoefficient'].value = effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);
        uniforms['sunPosition'].value.copy(sun);

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
          // Exterior view: camera outside building - ZOOMED OUT
          camera.position.set(width * 1.5, length * 1.0, width * 1.5);
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
        threeRef.current = THREE;

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
        const fusionWoodColor = new THREE.Color(0x5a5a5a); // Dark Grey/Brown for Fusion
        const fusionWoodMaterial = new THREE.MeshStandardMaterial({
          color: fusionWoodColor,
          roughness: 0.8,
          metalness: 0.1
        });

        // Create walls - transparent in interior view, solid in exterior
        // Create walls - Solid and OFF-SET from frame
        // Create walls - separate planes to allow for "Open Wall" configuration
        const wallGroup = new THREE.Group();
        wallGroup.name = 'walls';

        const wallMaterial = new THREE.MeshStandardMaterial({
          map: wallTexture,
          color: wallColor3D,
          roughness: 0.7,
          metalness: 0.3,
          side: THREE.DoubleSide
        });

        const openConfig = design.openWalls || {
          isOpen: false,
          sideWallA: false,
          sideWallB: false,
          endWallC: false,
          endWallD: false,
          removeEveryOtherPost: false
        };
        const sideWallGeo = new THREE.PlaneGeometry(outerWallLength, buildingHeight);
        const endWallGeo = new THREE.PlaneGeometry(outerWallWidth, buildingHeight);

        // Side Wall A (Left, -X)
        if (!openConfig.isOpen || !openConfig.sideWallA) {
          const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
          leftWall.position.set(-outerWallWidth / 2, buildingHeight / 2, 0);
          leftWall.rotation.y = -Math.PI / 2;
          leftWall.name = 'Wall_Left';
          wallGroup.add(leftWall);
        }

        // Side Wall B (Right, +X)
        if (!openConfig.isOpen || !openConfig.sideWallB) {
          const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
          rightWall.position.set(outerWallWidth / 2, buildingHeight / 2, 0);
          rightWall.rotation.y = Math.PI / 2;
          rightWall.name = 'Wall_Right';
          wallGroup.add(rightWall);
        }

        // End Wall C (Front, +Z)
        if (!openConfig.isOpen || !openConfig.endWallC) {
          const frontWall = new THREE.Mesh(endWallGeo, wallMaterial);
          frontWall.position.set(0, buildingHeight / 2, outerWallLength / 2);
          // Faces +Z by default
          frontWall.name = 'Wall_Front';
          wallGroup.add(frontWall);
        }

        // End Wall D (Back, -Z)
        if (!openConfig.isOpen || !openConfig.endWallD) {
          const backWall = new THREE.Mesh(endWallGeo, wallMaterial);
          backWall.position.set(0, buildingHeight / 2, -outerWallLength / 2);
          backWall.rotation.y = Math.PI; // Face -Z
          backWall.name = 'Wall_Back';
          wallGroup.add(backWall);
        }

        // --- WAINSCOT ---
        if (design.wainscot) {
          const wainscotHeightVal = design.wainscotHeight ? parseInt(design.wainscotHeight) / 12 : 3;
          const wainscotOffset = 0.05; // Slightly offset from wall to avoid z-fighting

          const sideWainscotGeo = new THREE.PlaneGeometry(outerWallLength, wainscotHeightVal);
          const endWainscotGeo = new THREE.PlaneGeometry(outerWallWidth, wainscotHeightVal);

          const wainscotColorHex = trimColors.find(c => c.value === design.wainscotColor)?.hex || '#FFFFFF';
          const wainscotColor3D = new THREE.Color(wainscotColorHex);
          // Reuse corrugated texture logic but scaled for wainscot height
          const wainscotTexture = createCorrugatedTexture(wainscotColor3D, 256, 256, true, 1, wainscotHeightVal);

          const wainscotMaterial = new THREE.MeshStandardMaterial({
            map: wainscotTexture,
            color: wainscotColor3D,
            roughness: 0.7,
            metalness: 0.3,
            side: THREE.DoubleSide
          });

          // Side Wall A (Left) - check local flag AND open config
          if (design.wainscotSideWallA && (!openConfig.isOpen || !openConfig.sideWallA)) {
            const leftWainscot = new THREE.Mesh(sideWainscotGeo, wainscotMaterial);
            leftWainscot.position.set(-outerWallWidth / 2 - wainscotOffset, wainscotHeightVal / 2, 0);
            leftWainscot.rotation.y = -Math.PI / 2;
            leftWainscot.name = 'Wainscot_Left';
            wallGroup.add(leftWainscot);
          }

          // Side Wall B (Right)
          if (design.wainscotSideWallB && (!openConfig.isOpen || !openConfig.sideWallB)) {
            const rightWainscot = new THREE.Mesh(sideWainscotGeo, wainscotMaterial);
            rightWainscot.position.set(outerWallWidth / 2 + wainscotOffset, wainscotHeightVal / 2, 0);
            rightWainscot.rotation.y = Math.PI / 2;
            rightWainscot.name = 'Wainscot_Right';
            wallGroup.add(rightWainscot);
          }

          // End Wall C (Front)
          if (design.wainscotEndWallC && (!openConfig.isOpen || !openConfig.endWallC)) {
            const frontWainscot = new THREE.Mesh(endWainscotGeo, wainscotMaterial);
            frontWainscot.position.set(0, wainscotHeightVal / 2, outerWallLength / 2 + wainscotOffset);
            frontWainscot.name = 'Wainscot_Front';
            wallGroup.add(frontWainscot);
          }

          // End Wall D (Back)
          if (design.wainscotEndWallD && (!openConfig.isOpen || !openConfig.endWallD)) {
            const backWainscot = new THREE.Mesh(endWainscotGeo, wainscotMaterial);
            backWainscot.position.set(0, wainscotHeightVal / 2, -outerWallLength / 2 - wainscotOffset);
            backWainscot.rotation.y = Math.PI;
            backWainscot.name = 'Wainscot_Back';
            wallGroup.add(backWainscot);
          }
        }

        // --- INTERIOR WALL LINER ---
        if (design.interiorWallLiner && design.interiorWallLiner !== 'None') {
          const linerOffset = 0.2; // Offset inside the wall (approx 2.4 inches)

          const sideLinerGeo = new THREE.PlaneGeometry(outerWallLength, buildingHeight);
          const endLinerGeo = new THREE.PlaneGeometry(outerWallWidth, buildingHeight);

          const linerColorHex = trimColors.find(c => c.value === design.interiorWallLinerColor)?.hex || '#FFFFFF';
          const linerColor3D = new THREE.Color(linerColorHex);
          // Reuse corrugated texture logic
          const linerTexture = createCorrugatedTexture(linerColor3D, 256, 256, true, 4, 4);

          const linerMaterial = new THREE.MeshStandardMaterial({
            map: linerTexture,
            color: linerColor3D,
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.FrontSide // Only visible from inside
          });

          // Side Wall A (Left)
          if (!openConfig.isOpen || !openConfig.sideWallA) {
            const leftLiner = new THREE.Mesh(sideLinerGeo, linerMaterial);
            // Wall is at -outerWallWidth/2. Liner should be at -outerWallWidth/2 + linerOffset
            leftLiner.position.set(-outerWallWidth / 2 + linerOffset, buildingHeight / 2, 0);
            leftLiner.rotation.y = Math.PI / 2; // Face roughly +X (inwards)
            leftLiner.name = 'Liner_Left';
            wallGroup.add(leftLiner);
          }

          // Side Wall B (Right)
          if (!openConfig.isOpen || !openConfig.sideWallB) {
            const rightLiner = new THREE.Mesh(sideLinerGeo, linerMaterial);
            // Wall is at outerWallWidth/2. Liner should be at outerWallWidth/2 - linerOffset
            rightLiner.position.set(outerWallWidth / 2 - linerOffset, buildingHeight / 2, 0);
            rightLiner.rotation.y = -Math.PI / 2; // Face roughly -X (inwards)
            rightLiner.name = 'Liner_Right';
            wallGroup.add(rightLiner);
          }

          // End Wall C (Front)
          if (!openConfig.isOpen || !openConfig.endWallC) {
            const frontLiner = new THREE.Mesh(endLinerGeo, linerMaterial);
            // Wall at +Z (outerWallLength/2). Liner at +Z - offset
            frontLiner.position.set(0, buildingHeight / 2, outerWallLength / 2 - linerOffset);
            frontLiner.rotation.y = Math.PI; // Face -Z (inwards)
            frontLiner.name = 'Liner_Front';
            wallGroup.add(frontLiner);
          }

          // End Wall D (Back)
          if (!openConfig.isOpen || !openConfig.endWallD) {
            const backLiner = new THREE.Mesh(endLinerGeo, linerMaterial);
            // Wall at -Z. Liner at -Z + offset
            backLiner.position.set(0, buildingHeight / 2, -outerWallLength / 2 + linerOffset);
            // Default rotation is looking at +Z (inwards for back wall)
            backLiner.name = 'Liner_Back';
            wallGroup.add(backLiner);
          }
        }

        // --- CEILING LINER ---
        if (design.ceilingLiner && design.ceilingLiner !== 'None') {
          const linerColorHex = trimColors.find(c => c.value === design.ceilingLinerColor)?.hex || '#FFFFFF';
          const linerColor3D = new THREE.Color(linerColorHex);

          // Use similar corrugated texture logic
          const ceilingTexture = createCorrugatedTexture(linerColor3D, 256, 256, true, 4, 1);

          const ceilingMaterial = new THREE.MeshStandardMaterial({
            map: ceilingTexture,
            color: linerColor3D,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
          });

          const ceilingGeo = new THREE.PlaneGeometry(outerWallLength, outerWallWidth);
          const ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial);

          // Position at building height (eaves)
          // If buildingHeight is eaves height, this creates a flat ceiling.
          // Rotate to be flat (xz plane)
          ceiling.rotation.x = -Math.PI / 2;
          ceiling.rotation.z = Math.PI / 2; // Orient corrugation along length
          ceiling.position.set(0, buildingHeight - 0.05, 0); // Slightly below top to avoid z-fighting with roof if flat
          ceiling.name = 'CeilingLiner';
          wallGroup.add(ceiling);
        }

        scene.add(wallGroup);
        wallMeshRef.current = wallGroup;
        // Walls hidden when frame is shown (opposite of frame)
        // When frame is ON, walls are OFF. When frame is OFF, walls are ON
        wallGroup.visible = !showFraming;

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

        // --- GABLE ENDS (Triangular Wall Sections) ---
        // Fill the gap between the top of the wall and the roof peak
        const gableHeight = peakHeight - buildingHeight;
        const gableShape = new THREE.Shape();
        gableShape.moveTo(-outerWallWidth / 2, 0); // Bottom-left
        gableShape.lineTo(outerWallWidth / 2, 0);  // Bottom-right
        gableShape.lineTo(0, gableHeight);         // Top-peak
        gableShape.lineTo(-outerWallWidth / 2, 0); // Close

        const gableGeo = new THREE.ExtrudeGeometry(gableShape, {
          depth: 0.1, // Match simplistic wall thickness or kept thin
          bevelEnabled: false
        });

        const gables = new THREE.Group();
        gables.name = 'gables';

        // Helper to get gable material (accent or standard)
        const getGableMaterial = (isAccent: boolean) => {
          if (isAccent && design.gableAccentColor) {
            const accentColorHex = trimColors.find(c => c.value === design.gableAccentColor)?.hex || '#FFFFFF';
            const accentColor3D = new THREE.Color(accentColorHex);
            const accentTexture = createCorrugatedTexture(accentColor3D, 256, 512, true, 1, buildingHeight / 2); // reuse similar scale
            return new THREE.MeshStandardMaterial({
              map: accentTexture,
              color: accentColor3D,
              roughness: 0.7,
              metalness: 0.3,
              side: THREE.DoubleSide
            });
          }
          return wallMaterial;
        };

        const isFrontGableAccent = design.gableAccent && design.gableAccentEndWallC;
        const isBackGableAccent = design.gableAccent && design.gableAccentEndWallD;

        // Front Gable
        const frontGableMat = getGableMaterial(!!isFrontGableAccent);
        const frontGable = new THREE.Mesh(gableGeo, frontGableMat);
        // BoxGeometry centers at 0. Front face is at +outerWallLength/2.
        // Extrude creates Z: 0 -> depth.
        // We want frontGable to end at outerWallLength/2.
        frontGable.position.set(0, buildingHeight, outerWallLength / 2 - 0.1);
        gables.add(frontGable);

        // Back Gable
        const backGableMat = getGableMaterial(!!isBackGableAccent);
        const backGable = new THREE.Mesh(gableGeo, backGableMat);
        // We want backGable to start at -outerWallLength/2.
        backGable.position.set(0, buildingHeight, -outerWallLength / 2);
        gables.add(backGable);

        gables.visible = !showFraming; // Match wall visibility
        scene.add(gables);

        // Add framing structure (posts, girts, trusses) - visible in both views
        if (framingType === 'post-frame-construction') {
          // --- POST FRAME CONSTRUCTION (Standard / User Diagram) ---

          // Determine post dimensions based on selection
          const getPostDimensions = (type?: string) => {
            switch (type) {
              case '4x6': return { width: 3.5 / 12, depth: 5.5 / 12 }; // 0.29 ft x 0.46 ft
              case '6x6': return { width: 5.5 / 12, depth: 5.5 / 12 }; // 0.46 ft x 0.46 ft
              case 'columns': return { width: 5.5 / 12, depth: 5.5 / 12 }; // 0.46 ft x 0.46 ft
              default: return { width: 5.5 / 12, depth: 5.5 / 12 }; // default 6x6
            }
          };

          const postDims = getPostDimensions(design.sidewallPosts);
          const postWidth = postDims.width;
          const postDepth = postDims.depth;
          const isSecuredToConcrete = design.postFoundation === 'Secured to Concrete';
          const postEmbedmentVal = design.postEmbedmentDepth ? parseInt(design.postEmbedmentDepth) : 4;
          const buriedDepth = isSecuredToConcrete ? 0.0 : postEmbedmentVal; // Use selected depth if not secured to concrete

          // Helper to parse footing size string
          const parseFootingSize = (sizeStr?: string) => {
            const defaultSize = { diameter: 20 / 12, height: 6 / 12 }; // Default 20x6
            if (!sizeStr) return defaultSize;

            const match = sizeStr.match(/(\d+)\s*in\s*x\s*(\d+)\s*in/);
            if (match && match[1] && match[2]) {
              return {
                diameter: parseInt(match[1]) / 12, // convert inches to feet
                height: parseInt(match[2]) / 12
              };
            }
            return defaultSize;
          };

          const footingDims = parseFootingSize(design.footingSize);
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
            const pGeo = new THREE.BoxGeometry(postWidth, totalPostHeight, postDepth);

            // Posts
            if ((!openConfig.isOpen || !openConfig.sideWallA) || (!openConfig.removeEveryOtherPost) || (i === 0 || i === numPosts - 1)) {
              const leftPost = new THREE.Mesh(pGeo, treatedWoodMaterial);
              leftPost.position.set(-buildingWidth / 2 + postWidth / 2, postCenterY, z);
              framingGroup.add(leftPost);
            }

            if ((!openConfig.isOpen || !openConfig.sideWallB) || (!openConfig.removeEveryOtherPost) || (i === 0 || i === numPosts - 1)) {
              const rightPost = new THREE.Mesh(pGeo, treatedWoodMaterial);
              rightPost.position.set(buildingWidth / 2 - postWidth / 2, postCenterY, z);
              framingGroup.add(rightPost);
            }

            // Footings (Only show if buried)
            if (!isSecuredToConcrete) {
              const fRadius = footingDims.diameter / 2;
              const fHeight = footingDims.height;
              const fGeo = new THREE.CylinderGeometry(fRadius, fRadius, fHeight, 16);
              const fMesh = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ color: 0x999999 }));

              const footingY = -buriedDepth - (fHeight / 2);

              const leftF = fMesh.clone();
              leftF.position.set(-buildingWidth / 2 + postWidth / 2, footingY, z);
              if ((!openConfig.isOpen || !openConfig.sideWallA) || (!openConfig.removeEveryOtherPost) || (i === 0 || i === numPosts - 1)) framingGroup.add(leftF);

              const rightF = fMesh.clone();
              rightF.position.set(buildingWidth / 2 - postWidth / 2, footingY, z);
              if ((!openConfig.isOpen || !openConfig.sideWallB) || (!openConfig.removeEveryOtherPost) || (i === 0 || i === numPosts - 1)) framingGroup.add(rightF);
            } else {
              // Show bracket/anchor if secured to concrete (optional, simplified as just sitting on floor)
              // For now, just no footing since it's on the slab
            }

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
            if ((!openConfig.isOpen || !openConfig.sideWallA) || (!openConfig.removeEveryOtherPost) || (i === 0 || i === numPosts - 1)) framingGroup.add(createMemberLocal(pPostL, pChordL, trussThickness, 0.3, woodMaterial));
            const pPostR = new THREE.Vector3(buildingWidth / 2 - postWidth / 2, buildingHeight - 2, z);
            const pChordR = new THREE.Vector3(buildingWidth / 2 - 3, buildingHeight + trussDepth / 2, z);
            if ((!openConfig.isOpen || !openConfig.sideWallB) || (!openConfig.removeEveryOtherPost) || (i === 0 || i === numPosts - 1)) framingGroup.add(createMemberLocal(pPostR, pChordR, trussThickness, 0.3, woodMaterial));

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

          // 2.5 GRADE BOARD (Bottom Plate) - Treated Wood
          const gradeBoardDepth = 0.125; // 1.5 inches
          const gradeBoardHeightUnit = 5 / 12; // 5 inches per row for Centermatch

          // Check for Centermatch
          const isCentermatch = design.gradeBoard && (design.gradeBoard.includes('centermatch'));

          // Define gradeBoardHeight in outer scope for use in V-Bracing later
          let gradeBoardHeight = 0.60; // Default

          // Calculate Centermatch heights for Side A and Side B
          let centermatchHeightA = 0;
          let centermatchHeightB = 0;

          if (isCentermatch) {
            const rowsA = design.centermatchRows?.sidewallA || 1;
            const rowsB = design.centermatchRows?.sidewallB || 1;
            centermatchHeightA = rowsA * gradeBoardHeightUnit;
            centermatchHeightB = rowsB * gradeBoardHeightUnit;
            // Update main gradeBoardHeight to max for other calcs if needed
            gradeBoardHeight = Math.max(centermatchHeightA, centermatchHeightB);
          } else if (design.gradeBoard) {
            if (design.gradeBoard.includes('2x6')) gradeBoardHeight = 0.46;
            else if (design.gradeBoard.includes('2x8')) gradeBoardHeight = 0.60;
            else if (design.gradeBoard.includes('2x10')) gradeBoardHeight = 0.77;
          }


          // Girt Dimensions based on Type
          const girtType = design.girtType || 'flat'; // Default to flat
          const girtSize = design.girtSize || '2x4'; // Default size

          const girtWidthVal = girtSize === '2x6' ? 0.46 : 0.29; // 5.5" or 3.5"
          const girtDepthVal = 0.125; // 1.5" thickness

          // Standard Flat Girts (Exterior) geometry
          const girtGeoFlat = new THREE.BoxGeometry(girtDepthVal, girtWidthVal, buildingLength);

          // Bookshelf Girts (Between Posts) geometry
          // Spacing between posts is `actualPostSpacing`. Girts fit in between.
          // We need multiple small segments instead of one long board.
          // ... calculated inside loop

          // Interior Girts (Double) geometry
          const girtGeoInterior = new THREE.BoxGeometry(girtDepthVal, girtWidthVal, buildingLength);


          for (let g = 0; g < girtCount; g++) {
            const y = girtStartHeight + (g * girtSpacing);
            if (y > buildingHeight - 0.5) continue;

            const isAboveCentermatchA = !isCentermatch || y > centermatchHeightA;
            const isAboveCentermatchB = !isCentermatch || y > centermatchHeightB;

            // 1. EXT. FLAT GIRTS (Standard) - Render for 'flat', 'bookshelf', and 'double'
            // User said Bookshelf and Double ALSO have exterior flat girts.
            // "Bookshelf Girts ... 2x4 flat wall girts are applied to the outside"
            // "Double Girts ... flat wall girts on the outside"

            // Left Side (A) Exterior
            if (isAboveCentermatchA && (!openConfig.isOpen || !openConfig.sideWallA)) {
              const lGirt = new THREE.Mesh(girtGeoFlat, woodMaterial);
              // Position: Outside the post (-X)
              lGirt.position.set(-buildingWidth / 2 - girtDepthVal / 2, y, 0);
              framingGroup.add(lGirt);
            }

            // Right Side (B) Exterior
            if (isAboveCentermatchB && (!openConfig.isOpen || !openConfig.sideWallB)) {
              const rGirt = new THREE.Mesh(girtGeoFlat, woodMaterial);
              // Position: Outside the post (+X)
              rGirt.position.set(buildingWidth / 2 + girtDepthVal / 2, y, 0);
              framingGroup.add(rGirt);
            }

            // 2. INTERIOR GIRTS (Double Only)
            if (girtType === 'double') {
              // Left Side (A) Interior
              // Always show interior girts (they are on the inside face)
              if (!openConfig.isOpen || !openConfig.sideWallA) {
                const lGirtIn = new THREE.Mesh(girtGeoInterior, woodMaterial);
                // Position: Inside the post (+X relative to wall)
                // Wall is at -buildingWidth/2. Post depth is postDepth.
                // Interior face is -buildingWidth/2 + postDepth
                lGirtIn.position.set(-buildingWidth / 2 + postDepth + girtDepthVal / 2, y, 0);
                framingGroup.add(lGirtIn);
              }

              // Right Side (B) Interior
              if (!openConfig.isOpen || !openConfig.sideWallB) {
                const rGirtIn = new THREE.Mesh(girtGeoInterior, woodMaterial);
                // Position: Inside the post (-X relative to wall)
                // Wall is at +buildingWidth/2. Post is inside.
                rGirtIn.position.set(buildingWidth / 2 - postDepth - girtDepthVal / 2, y, 0);
                framingGroup.add(rGirtIn);
              }
            }

            // 3. BOOKSHELF GIRTS (Between Posts)
            if (girtType === 'bookshelf') {
              // We need to generate segments between posts.
              // Iterate bays.
              for (let b = 0; b < numBays; b++) {
                const zCenter = -buildingLength / 2 + (b * actualPostSpacing) + (actualPostSpacing / 2);
                // Width of segment = post spacing - post width
                const segmentLen = actualPostSpacing - postWidth;
                // Use '2x6' (0.46) for bookshelf usually, or match girtSize? 
                // User said "2x6 wall girts that are laid horizontally between". Let's use 2x6 (0.46) height/width?
                // Actually wood is usually flat horizontally for bookshelf? 
                // "laid horizontally ... to put batt insulation between"
                // This usually means the "Wide" face is horizontal? Or vertical?
                // Standard girt is vertical face. Bookshelf means wide face is horizontal (like a shelf).
                // So depth is 5.5" (0.46), height is 1.5" (0.125).
                const bsDepth = 0.46; // 5.5" deep (filling the wall cavity)
                const bsHeight = 0.125; // 1.5" thick

                const bsGeo = new THREE.BoxGeometry(bsDepth, bsHeight, segmentLen); // Z is length in this orientation? No buildingLength is Z.
                // BoxGeometry args: Width (X), Height (Y), Depth (Z)
                // Here we want Width to be 5.5" (X), Height 1.5" (Y), Length (Z)
                const bsGeoCorrect = new THREE.BoxGeometry(bsDepth, bsHeight, segmentLen);

                // Left Side Bookshelf
                // Always show bookshelf girts (visible from inside)
                if (!openConfig.isOpen || !openConfig.sideWallA) {
                  const lBS = new THREE.Mesh(bsGeoCorrect, woodMaterial);
                  // Position: Centered in the wall (align with posts)
                  // Post center X is -buildingWidth / 2 + postDepth / 2
                  lBS.position.set(-buildingWidth / 2 + postDepth / 2, y, zCenter);
                  framingGroup.add(lBS);
                }

                // Right Side Bookshelf
                if (!openConfig.isOpen || !openConfig.sideWallB) {
                  const rBS = new THREE.Mesh(bsGeoCorrect, woodMaterial);
                  rBS.position.set(buildingWidth / 2 - postDepth / 2, y, zCenter);
                  framingGroup.add(rBS);
                }
              }
            }
          }


          if (isCentermatch) {
            // Centermatch Stacking Logic
            const rowsA = design.centermatchRows?.sidewallA || 1;
            const rowsB = design.centermatchRows?.sidewallB || 1;

            const gbGeoUnit = new THREE.BoxGeometry(gradeBoardDepth, gradeBoardHeightUnit, buildingLength);

            const isFusion = design.gradeBoard && design.gradeBoard.toLowerCase().includes('fusion');
            const gbMaterial = isFusion ? fusionWoodMaterial : treatedWoodMaterial;

            // Left Side (Sidewall A)
            for (let i = 0; i < rowsA; i++) {
              const y = (i * gradeBoardHeightUnit) + (gradeBoardHeightUnit / 2) + 0.1;
              if (!openConfig.isOpen || !openConfig.sideWallA) {
                const lGB = new THREE.Mesh(gbGeoUnit, gbMaterial);
                lGB.position.set(-buildingWidth / 2 - gradeBoardDepth / 2, y, 0);
                framingGroup.add(lGB);
              }
            }

            // Right Side (Sidewall B)
            for (let i = 0; i < rowsB; i++) {
              const y = (i * gradeBoardHeightUnit) + (gradeBoardHeightUnit / 2) + 0.1;
              if (!openConfig.isOpen || !openConfig.sideWallB) {
                const rGB = new THREE.Mesh(gbGeoUnit, gbMaterial);
                rGB.position.set(buildingWidth / 2 + gradeBoardDepth / 2, y, 0);
                framingGroup.add(rGB);
              }
            }

            // Endwall C (Front)
            const rowsC = design.centermatchRows?.endwallC || 1;
            for (let i = 0; i < rowsC; i++) {
              const y = (i * gradeBoardHeightUnit) + (gradeBoardHeightUnit / 2) + 0.1;
              const gb = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth + 0.2, gradeBoardHeightUnit, gradeBoardDepth), gbMaterial);
              gb.position.set(0, y, buildingLength / 2 + gradeBoardDepth / 2);
              framingGroup.add(gb);
            }

            // Endwall D (Back)
            const rowsD = design.centermatchRows?.endwallD || 1;
            for (let i = 0; i < rowsD; i++) {
              const y = (i * gradeBoardHeightUnit) + (gradeBoardHeightUnit / 2) + 0.1;
              const gb = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth + 0.2, gradeBoardHeightUnit, gradeBoardDepth), gbMaterial);
              gb.position.set(0, y, -buildingLength / 2 - gradeBoardDepth / 2);
              framingGroup.add(gb);
            }
          } else {
            // Standard Gradeboard Logic (Single Board)
            // gradeBoardHeight is already initialized to 0.60, update if specific size selected
            if (design.gradeBoard) {
              if (design.gradeBoard.includes('2x6')) gradeBoardHeight = 0.46; // 5.5"
              else if (design.gradeBoard.includes('2x8')) gradeBoardHeight = 0.60; // 7.25"
              else if (design.gradeBoard.includes('2x10')) gradeBoardHeight = 0.77; // 9.25"
            }

            const gradeBoardGeo = new THREE.BoxGeometry(gradeBoardDepth, gradeBoardHeight, buildingLength);

            // Left Side Grade Board
            if (!openConfig.isOpen || !openConfig.sideWallA) {
              const lGradeBoard = new THREE.Mesh(gradeBoardGeo, treatedWoodMaterial);
              lGradeBoard.position.set(-buildingWidth / 2 - gradeBoardDepth / 2, gradeBoardHeight / 2 + 0.1, 0);
              framingGroup.add(lGradeBoard);
            }

            // Right Side Grade Board
            if (!openConfig.isOpen || !openConfig.sideWallB) {
              const rGradeBoard = new THREE.Mesh(gradeBoardGeo, treatedWoodMaterial);
              rGradeBoard.position.set(buildingWidth / 2 + gradeBoardDepth / 2, gradeBoardHeight / 2 + 0.1, 0);
              framingGroup.add(rGradeBoard);
            }
          }

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
              if (!openConfig.isOpen || !openConfig.sideWallA) framingGroup.add(createMemberLocal(pTopLeftL, pBotRightL, braceThick, braceWidth, woodMaterial));

              // Right Wall
              const pTopLeftR = new THREE.Vector3(xRight, braceTopY, zStart + postWidth / 2);
              const pBotRightR = new THREE.Vector3(xRight, braceBotY, zEnd - postWidth / 2);
              if (!openConfig.isOpen || !openConfig.sideWallB) framingGroup.add(createMemberLocal(pTopLeftR, pBotRightR, braceThick, braceWidth, woodMaterial));

            } else {
              // ODD BAY (1, 3...): Diagonal goes / (Top-Right to Bottom-Left)
              // This completes the "V" meeting at the bottom of the shared post

              // Left Wall
              const pTopRightL = new THREE.Vector3(xLeft, braceTopY, zEnd - postWidth / 2);
              const pBotLeftL = new THREE.Vector3(xLeft, braceBotY, zStart + postWidth / 2);
              if (!openConfig.isOpen || !openConfig.sideWallA) framingGroup.add(createMemberLocal(pTopRightL, pBotLeftL, braceThick, braceWidth, woodMaterial));

              // Right Wall
              const pTopRightR = new THREE.Vector3(xRight, braceTopY, zEnd - postWidth / 2);
              const pBotLeftR = new THREE.Vector3(xRight, braceBotY, zStart + postWidth / 2);
              if (!openConfig.isOpen || !openConfig.sideWallB) framingGroup.add(createMemberLocal(pTopRightR, pBotLeftR, braceThick, braceWidth, woodMaterial));
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
              // Check visibility: Hide if End Wall is Open
              const isFront = dir === 1;
              const isEndWallOpen = isFront
                ? (openConfig.isOpen && openConfig.endWallC)
                : (openConfig.isOpen && openConfig.endWallD);

              // Only show intermediate posts if NOT (Open AND RemoveEveryOtherPost)
              const showPost = !(isEndWallOpen && openConfig.removeEveryOtherPost);

              if (showPost) {
                const dist = Math.abs(x);
                const slopeH = peakHeight - buildingHeight;
                const roofH = peakHeight - (dist * (slopeH / (buildingWidth / 2)));

                const pGeo = new THREE.BoxGeometry(postWidth, roofH + buriedDepth, postDepth);
                const p = new THREE.Mesh(pGeo, treatedWoodMaterial);
                p.position.set(x, (roofH - buriedDepth) / 2, z);
                framingGroup.add(p);
                // Footing (only if buried)
                if (!isSecuredToConcrete) {
                  const fGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.0, 16);
                  const f = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ color: 0x999999 }));
                  f.position.set(x, -buriedDepth - 0.5, z);
                  framingGroup.add(f);
                }
              }
            });

            // Diagonal Brace logic (User Image: Top-Corner -> Bottom-Intermediate)
            const isFrontBrace = dir === 1;
            const isEndWallOpenBrace = isFrontBrace
              ? (openConfig.isOpen && openConfig.endWallC)
              : (openConfig.isOpen && openConfig.endWallD);

            if (!isEndWallOpenBrace) {
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
            }

            // End Wall Grade Board
            const isFrontGB = dir === 1;
            const isEndWallOpenGB = isFrontGB
              ? (openConfig.isOpen && openConfig.endWallC)
              : (openConfig.isOpen && openConfig.endWallD);

            if (!isEndWallOpenGB) {
              if (isCentermatch) {
                const rows = (dir === 1) ? (design.centermatchRows?.endwallC || 1) : (design.centermatchRows?.endwallD || 1);
                const gbGeoEnd = new THREE.BoxGeometry(buildingWidth, gradeBoardHeightUnit, gradeBoardDepth);

                for (let i = 0; i < rows; i++) {
                  const y = (i * gradeBoardHeightUnit) + (gradeBoardHeightUnit / 2) + 0.1;
                  const gb = new THREE.Mesh(gbGeoEnd, treatedWoodMaterial);
                  // Position on outside face of end posts
                  const zPos = (dir === 1)
                    ? (buildingLength / 2 + gradeBoardDepth / 2)
                    : (-buildingLength / 2 - gradeBoardDepth / 2);

                  gb.position.set(0, y, zPos);
                  framingGroup.add(gb);
                }
              } else {
                // Standard Gradeboard Logic (Single Board)
                const gbGeoEnd = new THREE.BoxGeometry(buildingWidth, gradeBoardHeight, gradeBoardDepth);
                const zPos = (dir === 1)
                  ? (buildingLength / 2 + gradeBoardDepth / 2)
                  : (-buildingLength / 2 - gradeBoardDepth / 2);

                const gb = new THREE.Mesh(gbGeoEnd, treatedWoodMaterial);
                gb.position.set(0, gradeBoardHeight / 2 + 0.1, zPos);
                framingGroup.add(gb);
              }
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
              // framingGroup.add(lg);

              // Center Bay Girt
              const cg = new THREE.Mesh(girtGeoCenter, woodMaterial);
              cg.position.set(0, y, z);
              // framingGroup.add(cg);

              // Right Bay Girt
              const rg = new THREE.Mesh(girtGeoSide, woodMaterial);
              rg.position.set(buildingWidth / 3, y, z);
              // ADDED LOGIC: Check Open Status for End Walls
              // dir=1 is Front (Z>0) -> Wall C
              // dir=-1 is Back (Z<0) -> Wall D
              const isFront = dir === 1;
              const isOpen = isFront
                ? (openConfig.isOpen && openConfig.endWallC)
                : (openConfig.isOpen && openConfig.endWallD);

              if (!isOpen) {
                framingGroup.add(lg);
                framingGroup.add(cg);
                framingGroup.add(rg);
              }
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

          // 3.5 FLOOR - Internal Building Pad
          const floorGeo = new THREE.PlaneGeometry(buildingWidth, buildingLength);
          const floorMatColor = design.floorFinish === 'concrete' ? 0xd3d3d3 : 0x9b7653; // Grey or Dirt Brown
          const floorMatRoughness = design.floorFinish === 'concrete' ? 0.9 : 1.0;
          const floorMat = new THREE.MeshStandardMaterial({
            color: floorMatColor,
            roughness: floorMatRoughness,
            side: THREE.DoubleSide
          });
          const floor = new THREE.Mesh(floorGeo, floorMat);
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = 0.05;
          framingGroup.add(floor);

        } else if (framingType === 'ladder-frame-construction') {
          // LADDER FRAME CONSTRUCTION - Matching user images exactly
          // End walls: 4 posts, Side walls: 5 posts
          const isSecuredToConcrete = design.postFoundation === 'Secured to Concrete';
          // For ladder frame, posts usually sit on grade board or slab, but if "buried" option exists, we simulate same logic
          // Actually, ladder frame descriptions often imply on-slab or on-grade-board. 
          // If the user wants "Secured to Concrete" to mean "No pillars below", it implies buried pillars DO exist in default.
          // Let's assume default Ladder Frame posts (studs) currently sit on Grade Board which is at y=gradeBoardHeight/2

          // Wait, the current ladder frame posts (lines 901) are positioned:
          // gradeBoardHeight + (buildingHeight - gradeBoardHeight) / 2
          // Height: buildingHeight - gradeBoardHeight
          // So they start AT grade board top. They don't go underground?
          // Let's check "buriedDepth" in Ladder section. It wasn't defined.

          // However, user said "pillors nahi huge neshe wale".
          // If current ladder frame implementation DOES NOT have buried posts, then there's nothing to hide?
          // Let's check if there are footings or extensions in Ladder frame code.
          // Lines 899-902: `buildingHeight - gradeBoardHeight`. Position y is centered.
          // Bottom y = gradeBoardHeight.
          // Grade board is at y=gradeBoardHeight/2. Bottom is 0.

          // So currently Ladder frame posts START at Y=0 (or Y=gradeBoardHeight).
          // They DO NOT extend underground (-y).

          // BUT, if the user sees "pillars below" maybe they selected Post Frame?
          // Or maybe I should check if they want changes in Ladder Frame too?
          // User selected "Secured To Concrete".
          // If I look at the code for Post frame, it explicitly has `buriedDepth = 4.0`.

          // I will assume for now I only need to modify Post Frame section (which I did in previous chunks).
          // But I'll leave this check here just in case I need to add buried logic to Ladder Frame later (which I won't do now as it wasn't there).

          const studWidth = 0.15; // 1.5" (2x4 stud width)
          const studDepth = 0.45; // 5.5" (2x4 stud depth)
          const girtHeight = 0.15; // 1.5" (2x4 girt height)
          const girtDepth = 0.45; // 5.5" (2x4 girt depth)

          // Determine gradeboard height based on selection
          let gradeBoardHeight = 0.60; // Default 2x8 approx (7.25")
          if (design.gradeBoard) {
            if (design.gradeBoard.includes('2x6')) gradeBoardHeight = 0.46; // 5.5"
            else if (design.gradeBoard.includes('2x8')) gradeBoardHeight = 0.60; // 7.25"
            else if (design.gradeBoard.includes('2x10')) gradeBoardHeight = 0.77; // 9.25"
          }

          const gradeBoardDepth = 0.125; // 1.5 inches

          // Helper function to create member (same as post-frame)
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

          // Calculate roof metrics
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

          // 1. SIDE WALLS - 5 POSTS (as shown in image)
          const numSidePosts = 5;
          const sidePostSpacing = buildingLength / (numSidePosts - 1);

          for (let i = 0; i < numSidePosts; i++) {
            const z = -buildingLength / 2 + i * sidePostSpacing;

            // Left side wall post
            if ((!openConfig.isOpen || !openConfig.sideWallA) || (!openConfig.removeEveryOtherPost) || (i === 0 || i === numSidePosts - 1)) {
              const leftStudGeo = new THREE.BoxGeometry(studDepth, buildingHeight - gradeBoardHeight, studWidth);
              const leftStud = new THREE.Mesh(leftStudGeo, woodMaterial);
              leftStud.position.set(-buildingWidth / 2 + studDepth / 2, gradeBoardHeight + (buildingHeight - gradeBoardHeight) / 2, z);
              framingGroup.add(leftStud);
            }

            // Right side wall post
            if ((!openConfig.isOpen || !openConfig.sideWallB) || (!openConfig.removeEveryOtherPost) || (i === 0 || i === numSidePosts - 1)) {
              const rightStudGeo = new THREE.BoxGeometry(studDepth, buildingHeight - gradeBoardHeight, studWidth);
              const rightStud = new THREE.Mesh(rightStudGeo, woodMaterial);
              rightStud.position.set(buildingWidth / 2 - studDepth / 2, gradeBoardHeight + (buildingHeight - gradeBoardHeight) / 2, z);
              framingGroup.add(rightStud);
            }
          }

          // 2. SIDE WALL GIRTS - 4 horizontal members (as shown in image)
          const numSideGirts = 4;
          const girtStartHeight = gradeBoardHeight + 0.5;
          const girtEndHeight = buildingHeight - 0.5;
          const girtSpacing = (girtEndHeight - girtStartHeight) / (numSideGirts - 1);

          const sideGirtGeo = new THREE.BoxGeometry(girtDepth, girtHeight, buildingLength);

          for (let g = 0; g < numSideGirts; g++) {
            const y = girtStartHeight + (g * girtSpacing);

            // Left side wall girt
            if (!openConfig.isOpen || !openConfig.sideWallA) {
              const leftGirt = new THREE.Mesh(sideGirtGeo, woodMaterial);
              leftGirt.position.set(-buildingWidth / 2 + studDepth / 2, y, 0);
              framingGroup.add(leftGirt);
            }

            // Right side wall girt
            if (!openConfig.isOpen || !openConfig.sideWallB) {
              const rightGirt = new THREE.Mesh(sideGirtGeo, woodMaterial);
              rightGirt.position.set(buildingWidth / 2 - studDepth / 2, y, 0);
              framingGroup.add(rightGirt);
            }
          }

          // 3. GRADE BOARD (Bottom Plate) - Treated Wood
          const gradeBoardGeo = new THREE.BoxGeometry(gradeBoardDepth, gradeBoardHeight, buildingLength);

          // Left side grade board
          if (!openConfig.isOpen || !openConfig.sideWallA) {
            const leftGradeBoard = new THREE.Mesh(gradeBoardGeo, treatedWoodMaterial);
            leftGradeBoard.position.set(-buildingWidth / 2 + studDepth / 2, gradeBoardHeight / 2, 0);
            framingGroup.add(leftGradeBoard);
          }

          // Right side grade board
          if (!openConfig.isOpen || !openConfig.sideWallB) {
            const rightGradeBoard = new THREE.Mesh(gradeBoardGeo, treatedWoodMaterial);
            rightGradeBoard.position.set(buildingWidth / 2 - studDepth / 2, gradeBoardHeight / 2, 0);
            framingGroup.add(rightGradeBoard);
          }

          // 4. TOP PLATE
          const topPlateGeo = new THREE.BoxGeometry(studDepth, studWidth * 2, buildingLength);
          if (!openConfig.isOpen || !openConfig.sideWallA) {
            const leftTopPlate = new THREE.Mesh(topPlateGeo, woodMaterial);
            leftTopPlate.position.set(-buildingWidth / 2 + studDepth / 2, buildingHeight - studWidth, 0);
            framingGroup.add(leftTopPlate);
          }

          if (!openConfig.isOpen || !openConfig.sideWallB) {
            const rightTopPlate = new THREE.Mesh(topPlateGeo, woodMaterial);
            rightTopPlate.position.set(buildingWidth / 2 - studDepth / 2, buildingHeight - studWidth, 0);
            framingGroup.add(rightTopPlate);
          }

          // 5. END WALLS - 4 POSTS (as shown in image)
          const numEndPosts = 4;
          const endPostSpacing = buildingWidth / (numEndPosts - 1);

          [1, -1].forEach(dir => {
            const z = (buildingLength / 2 - studWidth / 2) * dir;

            const isFront = dir === 1;

            // Create 4 posts evenly spaced across end wall width
            // Check visibility: Hide if End Wall is Open
            const isEndWallOpen = isFront
              ? (openConfig.isOpen && openConfig.endWallC)
              : (openConfig.isOpen && openConfig.endWallD);

            for (let i = 0; i < numEndPosts; i++) {
              const x = -buildingWidth / 2 + i * endPostSpacing;

              // Adjust post height for roof slope on end walls
              const dist = Math.abs(x);
              const slopeH = peakHeight - buildingHeight;
              const roofH = peakHeight - (dist * (slopeH / (buildingWidth / 2)));
              const postHeight = roofH - gradeBoardHeight;

              const endStudGeo = new THREE.BoxGeometry(studWidth, postHeight, studDepth);
              const endStud = new THREE.Mesh(endStudGeo, woodMaterial);
              endStud.position.set(x, gradeBoardHeight + postHeight / 2, z);
              framingGroup.add(endStud);
            }

            // 6. END WALL GIRTS - 5 horizontal members (as shown in image)
            const numEndGirts = 5;
            const endGirtStartHeight = gradeBoardHeight + 0.5;
            const endGirtEndHeight = buildingHeight - 0.5;
            const endGirtSpacing = (endGirtEndHeight - endGirtStartHeight) / (numEndGirts - 1);

            const endWallWidth = buildingWidth;
            const endGirtGeo = new THREE.BoxGeometry(endWallWidth, girtHeight, girtDepth);

            for (let g = 0; g < numEndGirts; g++) {
              const y = endGirtStartHeight + (g * endGirtSpacing);
              if (y > buildingHeight - 0.5) continue;

              if (isFront ? (!openConfig.isOpen || !openConfig.endWallC) : (!openConfig.isOpen || !openConfig.endWallD)) {
                const endGirt = new THREE.Mesh(endGirtGeo, woodMaterial);
                endGirt.position.set(0, y, z);
                framingGroup.add(endGirt);
              }
            }

            // 7. END WALL GRADE BOARD
            if (!isEndWallOpen) {
              const endGradeBoardGeo = new THREE.BoxGeometry(endWallWidth, gradeBoardHeight, gradeBoardDepth);
              const endGradeBoard = new THREE.Mesh(endGradeBoardGeo, treatedWoodMaterial);
              endGradeBoard.position.set(0, gradeBoardHeight / 2, z);
              framingGroup.add(endGradeBoard);

              // 8. END WALL TOP PLATE
              const endTopPlateGeo = new THREE.BoxGeometry(endWallWidth, studWidth * 2, studDepth);
              const endTopPlate = new THREE.Mesh(endTopPlateGeo, woodMaterial);
              endTopPlate.position.set(0, buildingHeight - studWidth, z);
              framingGroup.add(endTopPlate);
            }
          });

          // 9. ROOF TRUSSES (Simple truss for ladder frame)
          const trussSpacing = parseFloat(design.trussSpacing || '6');
          const numTrusses = Math.ceil(buildingLength / trussSpacing);
          const actualTrussSpacing = buildingLength / numTrusses;

          for (let i = 0; i <= numTrusses; i++) {
            const z = -buildingLength / 2 + i * actualTrussSpacing;

            // Bottom chord
            const botChordGeo = new THREE.BoxGeometry(buildingWidth, studDepth, studWidth);
            const botChord = new THREE.Mesh(botChordGeo, woodMaterial);
            botChord.position.set(0, buildingHeight + studDepth / 2, z);
            framingGroup.add(botChord);

            // Rafters (top chords)
            const slopeHeight = peakHeight - buildingHeight;
            const roofSlopeLen = Math.sqrt(Math.pow(buildingWidth / 2, 2) + Math.pow(slopeHeight, 2));
            const rafterGeo = new THREE.BoxGeometry(roofSlopeLen, studDepth, studWidth);

            const leftRafter = new THREE.Mesh(rafterGeo, woodMaterial);
            leftRafter.rotation.z = roofAngle;
            leftRafter.position.set(-buildingWidth / 4, buildingHeight + slopeHeight / 2, z);
            framingGroup.add(leftRafter);

            const rightRafter = new THREE.Mesh(rafterGeo, woodMaterial);
            rightRafter.rotation.z = -roofAngle;
            rightRafter.position.set(buildingWidth / 4, buildingHeight + slopeHeight / 2, z);
            framingGroup.add(rightRafter);
          }

          // 10. ROOF PURLINS
          const purlinOverhang = endWallOverhang > 0 ? parseFloat(design.endWallOverhang || '0') : 1.5;
          const purlinLength = buildingLength + (purlinOverhang * 2);
          const purlinW = 0.29; // 3.5"
          const purlinH = 0.125; // 1.5"
          const pSlopeLen = Math.sqrt(Math.pow(buildingWidth / 2, 2) + Math.pow(peakHeight - buildingHeight, 2));
          const purlinSpacing = 2.0; // 2 feet spacing
          const numPurlins = Math.floor(pSlopeLen / purlinSpacing);
          const purlinGeo = new THREE.BoxGeometry(purlinW, purlinH, purlinLength);

          for (let p = 1; p <= numPurlins; p++) {
            const dist = p * purlinSpacing;
            const ratio = dist / pSlopeLen;
            const x = ratio * (buildingWidth / 2);
            const yDrop = ratio * (peakHeight - buildingHeight);

            const lP = new THREE.Mesh(purlinGeo, woodMaterial);
            lP.rotation.z = roofAngle;
            lP.position.set(-x, peakHeight - yDrop + 0.2, 0);
            framingGroup.add(lP);

            const rP = new THREE.Mesh(purlinGeo, woodMaterial);
            rP.rotation.z = -roofAngle;
            rP.position.set(x, peakHeight - yDrop + 0.2, 0);
            framingGroup.add(rP);
          }

          // 11. FLOOR - Internal Building Pad
          const floorGeo = new THREE.PlaneGeometry(buildingWidth, buildingLength);
          const floorMatColor = design.floorFinish === 'concrete' ? 0xd3d3d3 : 0x9b7653; // Grey or Dirt Brown
          const floorMatRoughness = design.floorFinish === 'concrete' ? 0.9 : 1.0;
          const floorMat = new THREE.MeshStandardMaterial({
            color: floorMatColor,
            roughness: floorMatRoughness,
            side: THREE.DoubleSide
          });
          const floor = new THREE.Mesh(floorGeo, floorMat);
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = 0.05;
          framingGroup.add(floor);
        }

        // --- MODIFY LAYER POSITIONS ---
        // We need to ensure Walls and Roof are physically OUTSIDE this frame.
        // The frame is built at 'buildingWidth' (outer bounds of posts).
        // So walls should be at buildingWidth + WALL_OFFSET.

        // Re-construct roof geometry to render *on top* of trusses
        try {
          // --- NEW PLANAR ROOF GENERATION ---
          // Using planes avoids the solid prism issue of ExtrudeGeometry and allows visible soffits

          const totalLen = buildingLength + (endWallOverhang * 2);
          const slopeHeight = peakHeight - buildingHeight;
          const halfWidth = buildingWidth / 2;
          const run = halfWidth + sidewallOverhang;
          // Calculate slope based on the run including overhang? 
          // Slope ratio is constant. Rise/Run. 
          // Height at edge = buildingHeight. Height at Peak = peakHeight.
          // The pure triangle is (0, peak) to (halfWidth, buildingHeight).
          // With overhang, the slope continues down.
          // Slope Angle
          const angle = Math.atan2(slopeHeight, halfWidth); // angle from horizontal

          // Length of the slope surface (Hypotenuse) from peak to eave (including overhang)
          // The rise for the full run:
          const fullRise = run * Math.tan(angle);
          const slopeLength = Math.sqrt(Math.pow(run, 2) + Math.pow(fullRise, 2));

          // Geometry for one side of the roof (Plane)
          const roofPlaneGeo = new THREE.PlaneGeometry(slopeLength, totalLen);

          // Groups to hold left/right panels
          const roofGroup = new THREE.Group();
          const soffitGroup = new THREE.Group();

          // SIMPLEST:
          // Create plane with (SlopeLength, TotalLength).
          // X = SlopeLength, Y = TotalLength.
          const simpleGeo = new THREE.PlaneGeometry(slopeLength, totalLen);

          // Rotate X -90 to lay it flat on XZ plane.
          // Now: X = SlopeLength, Z = TotalLength (actually -Y became Z).
          simpleGeo.rotateX(-Math.PI / 2);

          // Now we have a flat plane centered at (0,0,0).
          // Width (X) is the slope direction. Depth (Z) is the building length.

          const lMesh = new THREE.Mesh(simpleGeo, new THREE.MeshStandardMaterial({ color: roofColor3D, side: THREE.DoubleSide }));
          // Left Side: Slopes UP from left-to-right.
          // Pivot is center.
          // Rotation Z: +angle tiles the right side up, left side down?
          // Standard rotation Z+ is counter-clockwise.
          // So right side goes UP. Correct.
          lMesh.rotation.set(0, 0, angle);

          // Position:
          // X: Center of the left slope run.
          // The run is 'run'. Center is at -run/2 from peak.
          // Y: Center of the slope height.
          // Top is at peakHeight + ROOF_OFFSET. Bottom is lower.
          // Midpoint is peakHeight + ROOF_OFFSET - (fullRise / 2).
          // Z: 0 (Centered on building).
          lMesh.position.set(-run / 2, (peakHeight + ROOF_OFFSET) - fullRise / 2, 0);

          roofGroup.add(lMesh);

          // Right Side
          const rMesh = new THREE.Mesh(simpleGeo, new THREE.MeshStandardMaterial({ color: roofColor3D, side: THREE.DoubleSide }));
          // Right Side: Slopes DOWN from left-to-right.
          // Rotation Z: -angle.
          rMesh.rotation.set(0, 0, -angle);
          rMesh.position.set(run / 2, (peakHeight + ROOF_OFFSET) - fullRise / 2, 0);
          roofGroup.add(rMesh);


          // --- SOFFITS ---
          // Determine Soffit Material
          const soffitMatBack = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.BackSide, roughness: 1.0 });
          // We use the same geometry and positions, just BackSide material.

          const lSoffit = new THREE.Mesh(simpleGeo, soffitMatBack);
          lSoffit.rotation.copy(lMesh.rotation);
          lSoffit.position.copy(lMesh.position);
          // Move slightly down to avoid z-fighting with double-side roof?
          lSoffit.position.y -= 0.01;
          soffitGroup.add(lSoffit);

          const rSoffit = new THREE.Mesh(simpleGeo, soffitMatBack);
          rSoffit.rotation.copy(rMesh.rotation);
          rSoffit.position.copy(rMesh.position);
          rSoffit.position.y -= 0.01;
          soffitGroup.add(rSoffit);

          // Initialize Soffit Color
          import('three').then((THREE) => {
            const soffitHex = trimColors.find(c => c.value === localSoffitColor)?.hex || '#FFFFFF';
            lSoffit.material.color.set(soffitHex);
            rSoffit.material.color.set(soffitHex);
          });

          scene.add(roofGroup);
          scene.add(soffitGroup);

          roofMeshRef.current = roofGroup;
          soffitMeshRef.current = soffitGroup;

          const updateSoffitVis = () => {
            const vis = showRoof && !showFraming;
            roofGroup.visible = vis;
            soffitGroup.visible = vis;
          };
          updateSoffitVis();

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

        const getFasciaHeight = () => {
          switch (design.fasciaSize) {
            case '4': return 4 / 12; // 0.33 ft
            case '8': return 8 / 12; // 0.67 ft
            case '6':
            default: return 6 / 12; // 0.5 ft
          }
        };
        const fasciaHeight = getFasciaHeight();

        const rakeTrimWidth = fasciaHeight; // Width of the trim on the face
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
        const eaveTrimGeo = new THREE.BoxGeometry(trimThickness, fasciaHeight, buildingLength + (endWallOverhang * 2));

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

        // Floor - Garden Look
        // Make it much larger to feel like a "real garden" environment
        const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
        const floorTexture = createGrassTexture();
        // Repeat texture more for larger area
        floorTexture.repeat.set(50, 50);

        const floorColor = isInteriorView ? 0x8b4513 : 0x7cb342;
        const floorMaterial = new THREE.MeshStandardMaterial({
          map: floorTexture,
          color: floorColor,
          roughness: 1,
          metalness: 0
        });

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
        let isAutoRotating = true; // Start with auto-rotation enabled
        let previousMousePosition = { x: 0, y: 0 };

        const onMouseDown = (e: MouseEvent) => {
          isDragging = true;
          isAutoRotating = false; // Stop auto-rotation on user interaction
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
          isAutoRotating = false; // Stop auto-rotation on zoom
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

          // Auto-rotation logic
          if (isAutoRotating) {
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(camera.position);
            spherical.theta += 0.001; // Slow rotation speed
            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);
          }

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
        cameraRef.current.position.set(width * 1.5, length * 1.0, width * 1.5);
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
