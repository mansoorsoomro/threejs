/**
 * Coupe Building Designer - 3D Visualization
 * Full Fidelity Version: Supports Wainscot, Open Walls, Accessories, Framing.
 */
(function (window) {
    'use strict';

    const CoupeBuilding3D = {
        scene: null,
        camera: null,
        renderer: null,
        controls: null,

        // Groups
        framingGroup: null,
        wallsGroup: null,
        roofGroup: null,
        trimGroup: null,
        environmentGroup: null,
        accessoriesGroup: null,

        // Materials (cached)
        materials: {},

        init: function (containerId) {
            const self = this;
            const container = document.getElementById(containerId);
            if (!container) return;

            // Dimensions
            const width = container.clientWidth;
            const height = container.clientHeight || 500;

            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x87ceeb);
            this.scene.fog = new THREE.Fog(0x87ceeb, 50, 500);

            // Camera
            this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
            this.camera.position.set(40, 30, 50);

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(width, height);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.innerHTML = '';
            container.appendChild(this.renderer.domElement);

            // Orbit Controls
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
            }

            // Lighting
            this.setupLighting();

            // Groups
            this.framingGroup = new THREE.Group();
            this.wallsGroup = new THREE.Group();
            this.roofGroup = new THREE.Group();
            this.trimGroup = new THREE.Group();
            this.environmentGroup = new THREE.Group();
            this.accessoriesGroup = new THREE.Group();

            this.scene.add(this.environmentGroup);
            this.scene.add(this.framingGroup);
            this.scene.add(this.wallsGroup);
            this.scene.add(this.roofGroup);
            this.scene.add(this.trimGroup);
            this.scene.add(this.accessoriesGroup);

            // Materials
            this.materials.wood = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.9 });
            this.materials.treated = new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.9 });
            this.materials.concrete = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, roughness: 0.8 });
            this.materials.glass = new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.1, opacity: 0.6, transparent: true });

            // Resize
            window.addEventListener('resize', function () {
                const w = container.clientWidth;
                const h = container.clientHeight;
                self.camera.aspect = w / h;
                self.camera.updateProjectionMatrix();
                self.renderer.setSize(w, h);
            });

            this.animate();
        },

        setupLighting: function () {
            const ambient = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambient);
            const sun = new THREE.DirectionalLight(0xffffff, 0.9);
            sun.position.set(50, 80, 50);
            sun.castShadow = true;
            sun.shadow.mapSize.width = 2048;
            sun.shadow.mapSize.height = 2048;
            sun.shadow.camera.near = 0.5;
            sun.shadow.camera.far = 500;
            const s = 60;
            sun.shadow.camera.left = -s;
            sun.shadow.camera.right = s;
            sun.shadow.camera.top = s;
            sun.shadow.camera.bottom = -s;
            this.scene.add(sun);
        },

        animate: function () {
            const self = this;
            requestAnimationFrame(function () { self.animate(); });
            if (this.controls) this.controls.update();
            this.renderer.render(this.scene, this.camera);
        },

        clearGroup: function (group) {
            while (group.children.length > 0) {
                const child = group.children[0];
                if (child.geometry) child.geometry.dispose();
                // Simple material dispose check
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
                group.remove(child);
            }
        },

        // MAIN UPDATE
        update: function (state) {
            if (!this.scene) return;

            // Clear all
            [this.framingGroup, this.wallsGroup, this.roofGroup, this.trimGroup, this.environmentGroup, this.accessoriesGroup].forEach(g => this.clearGroup(g));

            const W = parseFloat(state.width);
            const L = parseFloat(state.length);
            const H = parseFloat(state.height);
            // Roof Geometry
            let roofAngle = 18.4 * (Math.PI / 180); // Default 4/12
            // Simple Pitch Parser
            if (state.roofPitch === '6/12') roofAngle = 26.6 * (Math.PI / 180);

            const run = W / 2;
            const rise = run * Math.tan(roofAngle);
            const peakH = H + rise;

            // Colors
            const getHex = (val, type) => {
                if (!window.CoupeData) return 0x888888;
                let list;
                if (type === 'wall') list = CoupeData.wallColors;
                else if (type === 'roof') list = CoupeData.roofColors;
                else list = CoupeData.trimColors;
                const found = list.find(c => c.value === val);
                return found ? new THREE.Color(found.hex) : new THREE.Color(0x888888);
            };

            const wallColor = getHex(state.wallColor, 'wall');
            const trimColor = getHex(state.trimColor, 'trim');
            const roofColor = getHex(state.roofColor, 'roof');
            const wainscotColor = getHex(state.wainscotColor, 'trim');
            const gableAccentColor = getHex(state.gableAccentColor, 'trim');
            const gutterColor = getHex(state.gutterColor, 'trim');

            const matWall = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.7 });
            const matTrim = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.7 });
            const matRoof = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.6 });
            const matWainscot = new THREE.MeshStandardMaterial({ color: wainscotColor, roughness: 0.7 });
            const matGableAccent = new THREE.MeshStandardMaterial({ color: gableAccentColor, roughness: 0.7 });
            const matGutter = new THREE.MeshStandardMaterial({ color: gutterColor, roughness: 0.5 });

            // Generate Components
            this.generateEnvironment(W, L);
            this.generateFraming(W, L, H, peakH, roofAngle, state);
            this.generateWalls(W, L, H, peakH, roofAngle, state, matWall, matWainscot, matGableAccent);
            this.generateRoof(W, L, H, peakH, roofAngle, state, matRoof, matTrim);
            this.generateAccessories(W, L, H, peakH, roofAngle, state, matGutter);
            this.generateOpenings(state.openings, W, L, H);
        },

        generateEnvironment: function (W, L) {
            const pad = new THREE.Mesh(new THREE.BoxGeometry(W + 2, 0.2, L + 2), this.materials.concrete);
            pad.position.y = -0.1;
            this.environmentGroup.add(pad);

            const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x4caf50 }));
            grass.rotation.x = -Math.PI / 2;
            grass.position.y = -0.2;
            this.environmentGroup.add(grass);
        },

        generateFraming: function (W, L, H, peakH, angle, state) {
            // Simplified framing (Posts & Trusses)
            const bays = Math.ceil(L / 8);
            const spacing = L / bays;

            // Side Posts
            for (let i = 0; i <= bays; i++) {
                const z = -L / 2 + (i * spacing);
                // Left
                const pL = new THREE.Mesh(new THREE.BoxGeometry(0.5, H, 0.5), this.materials.treated);
                pL.position.set(-W / 2 + 0.25, H / 2, z);
                this.framingGroup.add(pL);
                // Right
                const pR = new THREE.Mesh(new THREE.BoxGeometry(0.5, H, 0.5), this.materials.treated);
                pR.position.set(W / 2 - 0.25, H / 2, z);
                this.framingGroup.add(pR);

                // Truss Bottom
                const tB = new THREE.Mesh(new THREE.BoxGeometry(W, 0.2, 0.2), this.materials.wood);
                tB.position.set(0, H, z);
                this.framingGroup.add(tB);

                // Rafters
                const run = W / 2;
                const rise = peakH - H;
                const slope = Math.sqrt(run * run + rise * rise);
                const rL = new THREE.Mesh(new THREE.BoxGeometry(slope, 0.2, 0.2), this.materials.wood);
                rL.rotation.z = angle;
                rL.position.set(-run / 2, H + (rise / 2), z);
                this.framingGroup.add(rL);

                const rR = new THREE.Mesh(new THREE.BoxGeometry(slope, 0.2, 0.2), this.materials.wood);
                rR.rotation.z = -angle;
                rR.position.set(run / 2, H + (rise / 2), z);
                this.framingGroup.add(rR);
            }
        },

        generateWalls: function (W, L, H, peakH, angle, state, matWall, matWainscot, matGableAccent) {
            // Helper to build a wall panel
            // type: 'side' (W x H) or 'end' (W x H + gable)
            // isOpen: boolean

            const ow = state.openWalls || {};
            const hasWainscot = state.wainscot;
            const wainHeightFt = parseFloat(state.wainscotHeight) / 12 || 3;

            // 1. LEFT SIDE WALL (A)
            if (!ow.isOpen || !ow.sideWallA) {
                this.buildRectWall(L, H, hasWainscot ? wainHeightFt : 0, matWall, matWainscot,
                    { x: -W / 2, y: 0, z: 0 }, { y: -Math.PI / 2 }, 'left');
            }

            // 2. RIGHT SIDE WALL (B)
            if (!ow.isOpen || !ow.sideWallB) {
                this.buildRectWall(L, H, hasWainscot ? wainHeightFt : 0, matWall, matWainscot,
                    { x: W / 2, y: 0, z: 0 }, { y: Math.PI / 2 }, 'right');
            }

            // 3. FRONT END WALL (C)
            if (!ow.isOpen || !ow.endWallC) {
                this.buildEndWall(W, H, peakH, hasWainscot ? wainHeightFt : 0, matWall, matWainscot, matGableAccent,
                    state.gableAccent && state.gableAccentColor ? true : false,
                    { x: 0, y: 0, z: L / 2 }, { y: 0 }); // Front
            }

            // 4. BACK END WALL (D)
            if (!ow.isOpen || !ow.endWallD) {
                this.buildEndWall(W, H, peakH, hasWainscot ? wainHeightFt : 0, matWall, matWainscot, matGableAccent,
                    state.gableAccent && state.gableAccentColor ? true : false,
                    { x: 0, y: 0, z: -L / 2 }, { y: Math.PI }); // Back
            }
        },

        buildRectWall: function (width, height, wainH, matMain, matWain, pos, rot, side) {
            const thick = 0.1;

            if (wainH > 0) {
                // Wainscot part
                const wMesh = new THREE.Mesh(new THREE.BoxGeometry(width, wainH, thick), matWain);
                wMesh.position.set(0, wainH / 2, 0);

                // Main part
                const mainH = height - wainH;
                const mMesh = new THREE.Mesh(new THREE.BoxGeometry(width, mainH, thick), matMain);
                mMesh.position.set(0, wainH + mainH / 2, 0);

                const group = new THREE.Group();
                group.add(wMesh);
                group.add(mMesh);

                group.position.set(pos.x, pos.y, pos.z);
                if (rot.y) group.rotation.y = rot.y;
                this.wallsGroup.add(group);
            } else {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, thick), matMain);
                mesh.position.set(pos.x, height / 2, pos.z);
                if (rot.y) mesh.rotation.y = rot.y;
                this.wallsGroup.add(mesh);
            }
        },

        buildEndWall: function (width, height, peakH, wainH, matMain, matWain, matAccent, hasAccent, pos, rot) {
            const thick = 0.1;
            const group = new THREE.Group();

            // Rectangular part (same as side wall essentially)
            if (wainH > 0) {
                const wMesh = new THREE.Mesh(new THREE.BoxGeometry(width, wainH, thick), matWain);
                wMesh.position.set(0, wainH / 2, 0);
                group.add(wMesh);

                const mainH = height - wainH;
                const mMesh = new THREE.Mesh(new THREE.BoxGeometry(width, mainH, thick), matMain);
                mMesh.position.set(0, wainH + mainH / 2, 0);
                group.add(mMesh);
            } else {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, thick), matMain);
                mesh.position.set(0, height / 2, 0);
                group.add(mesh);
            }

            // Gable Triangle
            const gableH = peakH - height;
            const shape = new THREE.Shape();
            shape.moveTo(-width / 2, 0);
            shape.lineTo(width / 2, 0);
            shape.lineTo(0, gableH);
            shape.lineTo(-width / 2, 0);

            const geom = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false });
            // Center extrusion
            geom.translate(0, 0, -thick / 2);

            const gableMesh = new THREE.Mesh(geom, hasAccent ? matAccent : matMain);
            gableMesh.position.set(0, height, 0); // Sit on top
            group.add(gableMesh);

            group.position.set(pos.x, pos.y, pos.z);
            if (rot.y) group.rotation.y = rot.y;
            this.wallsGroup.add(group);
        },

        generateRoof: function (W, L, H, peakH, angle, state, matRoof, matTrim) {
            const overhangE = parseFloat(state.endWallOverhang) || 0;
            const overhangS = parseFloat(state.sidewallOverhang) || 0;

            const run = (W / 2) + overhangS;
            const rise = run * Math.tan(angle);
            const slopeLen = Math.sqrt(run * run + rise * rise);
            const totalL = L + (overhangE * 2);

            const roofGeo = new THREE.BoxGeometry(slopeLen, 0.05, totalL);

            // Left Slope
            const rL = new THREE.Mesh(roofGeo, matRoof);
            // Position magic (similar to previous)
            const rCenterX = -run / 2; // Center of run (local)
            const rCenterY = peakH - (rise / 2);
            // Actually pivot around peak is easier
            const pivot = new THREE.Group();
            pivot.position.set(0, peakH, 0);

            // Left mesh logic (local to pivot)
            // Left slope goes from x=0 to x=-run. Mid is -run/2.
            // y goes from 0 to -rise. Mid is -rise/2.
            const meshL = new THREE.Mesh(roofGeo, matRoof);
            meshL.position.set(-run / 2, -rise / 2, 0);
            meshL.rotation.z = angle;
            pivot.add(meshL);

            const meshR = new THREE.Mesh(roofGeo, matRoof);
            meshR.position.set(run / 2, -rise / 2, 0);
            meshR.rotation.z = -angle;
            pivot.add(meshR);

            this.roofGroup.add(pivot);

            // Ridge Cap
            const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, totalL), matTrim);
            ridge.position.set(0, peakH + 0.05, 0);
            this.trimGroup.add(ridge);
        },

        generateAccessories: function (W, L, H, peakH, angle, state, matGutter) {
            // Cupolas
            if (state.cupolas && state.cupolas !== 'None') {
                const sz = state.cupolas === 'Large' ? 1.5 : (state.cupolas === 'Medium' ? 1.0 : 0.7);
                const cupola = new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), this.materials.wood); // Simplified
                cupola.position.set(0, peakH + sz / 2, 0);
                this.accessoriesGroup.add(cupola);
            }

            // Gutters
            if (state.gutters === 'Yes') {
                const overhangS = parseFloat(state.sidewallOverhang) || 0;
                const run = (W / 2) + overhangS;
                const rise = run * Math.tan(angle);
                const eaveH = peakH - rise;
                const totalL = L + (parseFloat(state.endWallOverhang) * 2 || 0);

                const gL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, totalL), matGutter);
                gL.position.set(-(W / 2 + overhangS), eaveH, 0);
                this.accessoriesGroup.add(gL);

                const gR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, totalL), matGutter);
                gR.position.set((W / 2 + overhangS), eaveH, 0);
                this.accessoriesGroup.add(gR);
            }
        },

        generateOpenings: function (openings, W, L, H) {
            if (!openings || !openings.length) return;
            // Simple placeholder logic for openings
            // In a full boolean CSG system we would subtract.
            // Here we just draw a box to indicate the opening (or cover the wall).
            // Actually, we should probably just place a "Door" object that z-fights or sits in front.

            openings.forEach(op => {
                const w = op.width;
                const h = op.height;
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), this.materials.glass);

                if (op.wall === 'left') {
                    const z = (op.x / 100 * L) - (L / 2);
                    mesh.rotation.y = Math.PI / 2;
                    mesh.position.set(-W / 2, h / 2, z);
                } else {
                    // Default place randomly for now as the 'wall' prop logic needs robust mapping
                    mesh.position.set(0, h / 2, L / 2);
                }
                this.accessoriesGroup.add(mesh);
            });
        }
    };

    window.CoupeBuilding3D = CoupeBuilding3D;

})(window);
