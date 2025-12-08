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
  const [showFraming, setShowFraming] = useState(true);
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
    if (!wallMeshRef.current || !roofMeshRef.current) return;

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
        const wallGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingLength);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
          map: wallTexture,
          color: wallColor3D,
          roughness: 0.7,
          metalness: 0.3,
          transparent: isInteriorView,
          opacity: isInteriorView ? 0.1 : 1.0
        });
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.name = 'walls'; // Name it for visibility control
        walls.position.y = buildingHeight / 2;
        scene.add(walls);
        wallMeshRef.current = walls; // Store reference for color updates
        // Walls hidden when frame is shown (opposite of frame)
        // When frame is ON, walls are OFF. When frame is OFF, walls are ON
        walls.visible = !showFraming;

        // Create framing group for visibility toggling
        const framingGroup = new THREE.Group();
        framingGroup.name = 'framing';

        // Add framing structure (posts, girts, trusses) - visible in both views but more prominent in interior
        if (framingType === 'post-frame-construction') {
          // Post Frame: Vertical posts with horizontal girts
          const postSpacing = trussSpacingFeet; // Posts typically align with truss spacing
          const numPosts = Math.floor(buildingLength / postSpacing) + 1;
          
          // Determine post size based on sidewallPosts setting
          let postWidth = 0.5; // 4x6 default
          let postDepth = 0.75;
          if (design.sidewallPosts === '6x6') {
            postWidth = 0.75;
            postDepth = 0.75;
          } else if (design.sidewallPosts === 'columns') {
            postWidth = 1.0;
            postDepth = 1.0;
          }

          // Create vertical posts - positioned INSIDE the walls (not outside)
          for (let i = 0; i < numPosts; i++) {
            const z = -buildingLength / 2 + i * postSpacing;
            
            // Left side posts - positioned inside the wall
            const leftPostGeometry = new THREE.BoxGeometry(postWidth, buildingHeight, postDepth);
            const leftPost = new THREE.Mesh(leftPostGeometry, treatedWoodMaterial);
            // Position inside: -buildingWidth/2 + postWidth/2 (moves it inward by half post width)
            leftPost.position.set(-buildingWidth / 2 + postWidth / 2, buildingHeight / 2, z);
            framingGroup.add(leftPost);
            
            // Right side posts - positioned inside the wall
            const rightPostGeometry = new THREE.BoxGeometry(postWidth, buildingHeight, postDepth);
            const rightPost = new THREE.Mesh(rightPostGeometry, treatedWoodMaterial);
            // Position inside: buildingWidth/2 - postWidth/2 (moves it inward by half post width)
            rightPost.position.set(buildingWidth / 2 - postWidth / 2, buildingHeight / 2, z);
            framingGroup.add(rightPost);
          }

          // Add horizontal girts
          const girtSize = design.girtType === '2x6' ? 0.5 : 0.375; // 2x6 or 2x4
          const numGirts = 3; // Typically 3 rows of girts
          const girtSpacing = buildingHeight / (numGirts + 1);
          
          for (let g = 1; g <= numGirts; g++) {
            const girtY = girtSpacing * g;
            // Girts should span between posts, positioned inside walls
            // Adjust width to account for posts being inside walls
            const girtGeometry = new THREE.BoxGeometry(buildingWidth - (postWidth * 2), girtSize, girtSize);
            const girtMaterial = new THREE.MeshStandardMaterial({ 
              color: woodColor,
              roughness: 0.8
            });
            
            // Girts positioned inside walls (same X position as posts)
            for (let i = 0; i < numPosts - 1; i++) {
              const z = -buildingLength / 2 + i * postSpacing + postSpacing / 2;
              const girt = new THREE.Mesh(girtGeometry, girtMaterial);
              // Position at center (0) since girts span between posts inside walls
              girt.position.set(0, girtY, z);
              framingGroup.add(girt);
            }
          }

          // Add diagonal bracing on end walls (visible in interior)
          if (isInteriorView) {
            const braceGeometry = new THREE.BoxGeometry(0.25, 0.25, Math.sqrt(buildingHeight * buildingHeight + (buildingWidth / 4) * (buildingWidth / 4)));
            const braceMaterial = new THREE.MeshStandardMaterial({ color: woodColor });
            
            // Left side diagonal braces
            const leftBrace1 = new THREE.Mesh(braceGeometry, braceMaterial);
            leftBrace1.rotation.z = Math.atan2(buildingHeight, buildingWidth / 4);
            leftBrace1.position.set(-buildingWidth / 2 + 1, buildingHeight / 3, -buildingLength / 2 + 2);
            framingGroup.add(leftBrace1);
            
            const leftBrace2 = new THREE.Mesh(braceGeometry, braceMaterial);
            leftBrace2.rotation.z = -Math.atan2(buildingHeight, buildingWidth / 4);
            leftBrace2.position.set(-buildingWidth / 2 + 1, buildingHeight / 3, buildingLength / 2 - 2);
            framingGroup.add(leftBrace2);
            
            // Right side diagonal braces
            const rightBrace1 = new THREE.Mesh(braceGeometry, braceMaterial);
            rightBrace1.rotation.z = -Math.atan2(buildingHeight, buildingWidth / 4);
            rightBrace1.position.set(buildingWidth / 2 - 1, buildingHeight / 3, -buildingLength / 2 + 2);
            framingGroup.add(rightBrace1);
            
            const rightBrace2 = new THREE.Mesh(braceGeometry, braceMaterial);
            rightBrace2.rotation.z = Math.atan2(buildingHeight, buildingWidth / 4);
            rightBrace2.position.set(buildingWidth / 2 - 1, buildingHeight / 3, buildingLength / 2 - 2);
            framingGroup.add(rightBrace2);
          }
        } else if (framingType === 'ladder-frame-construction') {
          // Ladder Frame: 2-ply or 3-ply studs 4' oc with 4' oc trusses
          const studSpacing = 4; // 4 feet on center
          const numStuds = Math.floor(buildingLength / studSpacing) + 1;
          
          // Create studs (2-ply)
          const studWidth = 0.375; // 2x4 = 1.5" = 0.375 feet (approx)
          const studDepth = 0.5;
          
          for (let i = 0; i < numStuds; i++) {
            const z = -buildingLength / 2 + i * studSpacing;
            
            // Left side studs (2-ply) - positioned INSIDE the wall
            const leftStud1 = new THREE.Mesh(
              new THREE.BoxGeometry(studWidth, buildingHeight, studDepth),
              woodMaterial
            );
            // Position inside wall: move inward by stud width
            leftStud1.position.set(-buildingWidth / 2 + studWidth, buildingHeight / 2, z);
            framingGroup.add(leftStud1);
            
            const leftStud2 = new THREE.Mesh(
              new THREE.BoxGeometry(studWidth, buildingHeight, studDepth),
              woodMaterial
            );
            // Position inside wall: move inward by stud width
            leftStud2.position.set(-buildingWidth / 2 + studWidth * 2, buildingHeight / 2, z);
            framingGroup.add(leftStud2);
            
            // Right side studs (2-ply) - positioned INSIDE the wall
            const rightStud1 = new THREE.Mesh(
              new THREE.BoxGeometry(studWidth, buildingHeight, studDepth),
              woodMaterial
            );
            // Position inside wall: move inward by stud width
            rightStud1.position.set(buildingWidth / 2 - studWidth, buildingHeight / 2, z);
            framingGroup.add(rightStud1);
            
            const rightStud2 = new THREE.Mesh(
              new THREE.BoxGeometry(studWidth, buildingHeight, studDepth),
              woodMaterial
            );
            // Position inside wall: move inward by stud width
            rightStud2.position.set(buildingWidth / 2 - studWidth * 2, buildingHeight / 2, z);
            framingGroup.add(rightStud2);
          }

          // Add horizontal 2x6 girts for ladder frame
          const girtSize = 0.5; // 2x6
          const numGirts = 3;
          const girtSpacing = buildingHeight / (numGirts + 1);
          
          for (let g = 1; g <= numGirts; g++) {
            const girtY = girtSpacing * g;
            // Girts span between studs, positioned inside walls
            const girtGeometry = new THREE.BoxGeometry(buildingWidth - (studWidth * 4), girtSize, girtSize);
            const girtMaterial = new THREE.MeshStandardMaterial({ color: woodColor });
            
            for (let i = 0; i < numStuds - 1; i++) {
              const z = -buildingLength / 2 + i * studSpacing + studSpacing / 2;
              const girt = new THREE.Mesh(girtGeometry, girtMaterial);
              // Position at center (0) since girts span between studs inside walls
              girt.position.set(0, girtY, z);
              framingGroup.add(girt);
            }
          }
        }

        // Compute roof peak height from roof pitch (e.g. "4/12")
        let peakHeight = buildingHeight;
        const pitchParts = roofPitch.split('/');
        if (pitchParts.length === 2) {
          const rise = parseFloat(pitchParts[0]);
          const run = parseFloat(pitchParts[1]);
          if (!isNaN(rise) && !isNaN(run) && run > 0) {
            const halfSpan = buildingWidth / 2;
            const extraHeight = (halfSpan * rise) / run;
            peakHeight = buildingHeight + extraHeight;
          }
        }

        // Create roof texture (horizontal corrugation) - check if white for pure white texture
        const isRoofWhite = roofColor3D.r > 0.95 && roofColor3D.g > 0.95 && roofColor3D.b > 0.95;
        const roofTexture = createCorrugatedTexture(roofColor3D, 512, 256, false, buildingLength / 2, 1);

        // Add a simple gable roof using an extruded triangle
        try {
          const roofShape = new THREE.Shape();
          roofShape.moveTo(-buildingWidth / 2, buildingHeight);
          roofShape.lineTo(0, peakHeight);
          roofShape.lineTo(buildingWidth / 2, buildingHeight);
          roofShape.closePath();

          const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
            depth: buildingLength,
            bevelEnabled: false,
          });
          const roofMaterial = new THREE.MeshStandardMaterial({
            map: roofTexture,
            color: roofColor3D,
            roughness: 0.6,
            metalness: 0.4
          });
          const roof = new THREE.Mesh(roofGeometry, roofMaterial);
          // Center the roof along the length (Extrude goes in +Z from the shape origin)
          roof.position.z = -buildingLength / 2;
          scene.add(roof);
          roofMeshRef.current = roof; // Store reference for color updates
          // Roof hidden when frame is shown OR when showRoof is OFF
          // Show only when frame is OFF and showRoof is ON
          roof.visible = showRoof && !showFraming;
        } catch (roofErr) {
          console.warn('Failed to build roof geometry:', roofErr);
        }

        // Visualize truss spacing along the length - make them 3D in interior view
        if (!isNaN(trussSpacingFeet) && trussSpacingFeet > 0) {
          const numTrusses = Math.floor(buildingLength / trussSpacingFeet) + 1;

          for (let i = 0; i < numTrusses; i++) {
            const z = -buildingLength / 2 + i * trussSpacingFeet;

            if (isInteriorView) {
              // Create 3D truss structure in interior view
              const trussThickness = 0.25; // 2x4 truss member
              const trussMaterial = new THREE.MeshStandardMaterial({ 
                color: woodColor,
                roughness: 0.8
              });

              // Bottom chord (horizontal)
              const bottomChord = new THREE.Mesh(
                new THREE.BoxGeometry(buildingWidth, trussThickness, trussThickness),
                trussMaterial
              );
              bottomChord.position.set(0, buildingHeight, z);
              framingGroup.add(bottomChord);

              // Top chords (diagonal to peak)
              const trussHeight = peakHeight - buildingHeight;
              const trussLength = Math.sqrt((buildingWidth / 2) * (buildingWidth / 2) + trussHeight * trussHeight);
              
              // Left top chord
              const leftTopChord = new THREE.Mesh(
                new THREE.BoxGeometry(trussLength, trussThickness, trussThickness),
                trussMaterial
              );
              leftTopChord.rotation.z = Math.atan2(trussHeight, buildingWidth / 2);
              leftTopChord.position.set(-buildingWidth / 4, buildingHeight + trussHeight / 2, z);
              framingGroup.add(leftTopChord);

              // Right top chord
              const rightTopChord = new THREE.Mesh(
                new THREE.BoxGeometry(trussLength, trussThickness, trussThickness),
                trussMaterial
              );
              rightTopChord.rotation.z = -Math.atan2(trussHeight, buildingWidth / 2);
              rightTopChord.position.set(buildingWidth / 4, buildingHeight + trussHeight / 2, z);
              framingGroup.add(rightTopChord);

              // Vertical web members (if needed for larger spans)
              if (buildingWidth > 30) {
                const webMember = new THREE.Mesh(
                  new THREE.BoxGeometry(trussThickness, trussHeight * 0.6, trussThickness),
                  trussMaterial
                );
                webMember.position.set(0, buildingHeight + trussHeight * 0.3, z);
                framingGroup.add(webMember);
              }
            } else {
              // Simple line representation in exterior view
              const trussMaterial = new THREE.LineBasicMaterial({ color: trimColor3D });
              const trussGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-buildingWidth / 2, buildingHeight, z),
                new THREE.Vector3(0, peakHeight, z),
                new THREE.Vector3(buildingWidth / 2, buildingHeight, z),
              ]);
              const trussLine = new THREE.Line(trussGeometry, trussMaterial);
              framingGroup.add(trussLine);
            }
          }
        }

        // Add trim elements (corners, edges, base, gable) using trim color
        // Trim should be visible like in the image - brown/dark color outlining the building
        const trimThickness = 0.3; // Slightly thicker for better visibility
        const trimWidth = 0.3; // Width of corner trim
        const trimMaterial = new THREE.MeshStandardMaterial({ 
          color: trimColor3D,
          roughness: 0.7,
          metalness: 0.2
        });
        
        const endWallOverhang = parseFloat(design.endWallOverhang || '0');
        const sidewallOverhang = parseFloat(design.sidewallOverhang || '0');
        // Use the peakHeight already calculated above for roof
        
        // Corner trim pieces - vertical strips at all 4 corners
        // These run from bottom to top of walls
        const cornerTrimGeometry = new THREE.BoxGeometry(trimWidth, buildingHeight, trimThickness);
        
        // Front left corner (outside the wall)
        const frontLeftCorner = new THREE.Mesh(cornerTrimGeometry, trimMaterial);
        frontLeftCorner.position.set(-buildingWidth / 2 - trimThickness / 2, buildingHeight / 2, buildingLength / 2);
        scene.add(frontLeftCorner);
        trimMeshesRef.current.push(frontLeftCorner);
        
        // Front right corner
        const frontRightCorner = new THREE.Mesh(cornerTrimGeometry, trimMaterial);
        frontRightCorner.position.set(buildingWidth / 2 + trimThickness / 2, buildingHeight / 2, buildingLength / 2);
        scene.add(frontRightCorner);
        trimMeshesRef.current.push(frontRightCorner);
        
        // Back left corner
        const backLeftCorner = new THREE.Mesh(cornerTrimGeometry, trimMaterial);
        backLeftCorner.position.set(-buildingWidth / 2 - trimThickness / 2, buildingHeight / 2, -buildingLength / 2);
        scene.add(backLeftCorner);
        trimMeshesRef.current.push(backLeftCorner);
        
        // Back right corner
        const backRightCorner = new THREE.Mesh(cornerTrimGeometry, trimMaterial);
        backRightCorner.position.set(buildingWidth / 2 + trimThickness / 2, buildingHeight / 2, -buildingLength / 2);
        scene.add(backRightCorner);
        trimMeshesRef.current.push(backRightCorner);
        
        // Side corner trim pieces (left and right sides)
        const sideCornerTrimGeometry = new THREE.BoxGeometry(trimThickness, buildingHeight, trimWidth);
        
        // Left side front corner
        const leftSideFrontCorner = new THREE.Mesh(sideCornerTrimGeometry, trimMaterial);
        leftSideFrontCorner.position.set(-buildingWidth / 2, buildingHeight / 2, buildingLength / 2 + trimThickness / 2);
        scene.add(leftSideFrontCorner);
        trimMeshesRef.current.push(leftSideFrontCorner);
        
        // Left side back corner
        const leftSideBackCorner = new THREE.Mesh(sideCornerTrimGeometry, trimMaterial);
        leftSideBackCorner.position.set(-buildingWidth / 2, buildingHeight / 2, -buildingLength / 2 - trimThickness / 2);
        scene.add(leftSideBackCorner);
        trimMeshesRef.current.push(leftSideBackCorner);
        
        // Right side front corner
        const rightSideFrontCorner = new THREE.Mesh(sideCornerTrimGeometry, trimMaterial);
        rightSideFrontCorner.position.set(buildingWidth / 2, buildingHeight / 2, buildingLength / 2 + trimThickness / 2);
        scene.add(rightSideFrontCorner);
        trimMeshesRef.current.push(rightSideFrontCorner);
        
        // Right side back corner
        const rightSideBackCorner = new THREE.Mesh(sideCornerTrimGeometry, trimMaterial);
        rightSideBackCorner.position.set(buildingWidth / 2, buildingHeight / 2, -buildingLength / 2 - trimThickness / 2);
        scene.add(rightSideBackCorner);
        trimMeshesRef.current.push(rightSideBackCorner);
        
        // Bottom/base trim - runs along the bottom edge of all walls
        const baseTrimWidth = buildingWidth + (trimThickness * 2);
        const baseTrimLength = buildingLength + (trimThickness * 2);
        
        // Front base trim
        const frontBaseTrim = new THREE.Mesh(
          new THREE.BoxGeometry(baseTrimWidth, trimThickness, trimThickness),
          trimMaterial
        );
        frontBaseTrim.position.set(0, trimThickness / 2, buildingLength / 2 + trimThickness / 2);
        scene.add(frontBaseTrim);
        trimMeshesRef.current.push(frontBaseTrim);
        
        // Back base trim
        const backBaseTrim = new THREE.Mesh(
          new THREE.BoxGeometry(baseTrimWidth, trimThickness, trimThickness),
          trimMaterial
        );
        backBaseTrim.position.set(0, trimThickness / 2, -buildingLength / 2 - trimThickness / 2);
        scene.add(backBaseTrim);
        trimMeshesRef.current.push(backBaseTrim);
        
        // Left side base trim
        const leftBaseTrim = new THREE.Mesh(
          new THREE.BoxGeometry(trimThickness, trimThickness, buildingLength),
          trimMaterial
        );
        leftBaseTrim.position.set(-buildingWidth / 2 - trimThickness / 2, trimThickness / 2, 0);
        scene.add(leftBaseTrim);
        trimMeshesRef.current.push(leftBaseTrim);
        
        // Right side base trim
        const rightBaseTrim = new THREE.Mesh(
          new THREE.BoxGeometry(trimThickness, trimThickness, buildingLength),
          trimMaterial
        );
        rightBaseTrim.position.set(buildingWidth / 2 + trimThickness / 2, trimThickness / 2, 0);
        scene.add(rightBaseTrim);
        trimMeshesRef.current.push(rightBaseTrim);
        
        // Eave trim (along roof edges) - horizontal trim at the roofline
        const eaveTrimHeight = trimThickness;
        const eaveTrimDepth = trimThickness;
        
        // Front eave trim (along front roof edge)
        const frontEaveTrim = new THREE.Mesh(
          new THREE.BoxGeometry(buildingWidth + (sidewallOverhang * 2) + (trimThickness * 2), eaveTrimHeight, eaveTrimDepth),
          trimMaterial
        );
        frontEaveTrim.position.set(0, buildingHeight, buildingLength / 2 + endWallOverhang + trimThickness / 2);
        scene.add(frontEaveTrim);
        trimMeshesRef.current.push(frontEaveTrim);
        
        // Back eave trim (along back roof edge)
        const backEaveTrim = new THREE.Mesh(
          new THREE.BoxGeometry(buildingWidth + (sidewallOverhang * 2) + (trimThickness * 2), eaveTrimHeight, eaveTrimDepth),
          trimMaterial
        );
        backEaveTrim.position.set(0, buildingHeight, -buildingLength / 2 - endWallOverhang - trimThickness / 2);
        scene.add(backEaveTrim);
        trimMeshesRef.current.push(backEaveTrim);
        
        // Gable trim (along roof peak/ridge) - trim along the top ridge of the roof
        const gableTrimLength = buildingLength + (endWallOverhang * 2) + (trimThickness * 2);
        const gableTrim = new THREE.Mesh(
          new THREE.BoxGeometry(trimThickness, trimThickness, gableTrimLength),
          trimMaterial
        );
        gableTrim.position.set(0, peakHeight, 0);
        scene.add(gableTrim);
        trimMeshesRef.current.push(gableTrim);

        // Create grass texture for floor
        const createGrassTexture = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
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
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

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
        
          // Create background group
          const bgGroup = new THREE.Group();
          bgGroup.name = 'background';
          treePositions.forEach(([x, z]) => {
            const tree = createTree(x, z, 0.8 + Math.random() * 0.4);
            bgGroup.add(tree);
          });
          scene.add(bgGroup);
          backgroundGroupRef.current = bgGroup;
          if (!showBackground) bgGroup.visible = false;
        }
        
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
        className={`absolute top-0 right-0 bottom-0 w-96 bg-white/95 backdrop-blur-md shadow-2xl z-40 transition-transform duration-300 ease-in-out border-l border-gray-200 ${
          (activeColorPanel || activeViewPanel) ? 'translate-x-0' : 'translate-x-full'
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
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        localWallColor === color.value 
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
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        localRoofColor === color.value 
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
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        localTrimColor === color.value 
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
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      showFraming 
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
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      showBackground 
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
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      showRoof 
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
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      viewMode === 'exterior' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold text-lg mb-1">Exterior</div>
                    <div className="text-sm text-gray-600">View building from outside</div>
                  </button>
                  
                  <button
                    onClick={() => setViewMode('interior')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      viewMode === 'interior' 
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
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg ${
            activeColorPanel === 'wall'
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
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg ${
            activeViewPanel === 'views'
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
