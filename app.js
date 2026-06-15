/**
 * Main Application Logic - Gamified Kletterpark Vektor-Lernumgebung
 */

// Core states
let scene, camera, renderer, controls;
let gridHelper; // Global reference to recreate grid on theme switch
let platforms = []; // Free mode platforms
let ropes = [];     // Free mode ropes
let selectedPlatformId = null;
let selectedRopeId = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Gamified Level states
let learnMode = true;
let currentLevelIndex = 0;
let unlockedLevelIndex = 0; // Index of the highest unlocked level
let currentLevelState = {
    platforms: [],
    ropes: [],
    ghostPlatforms: [],
    ghostRopes: [],
    obstacle: null,
    targetReached: false
};

// Free mode tab state
let currentFreeTab = 'build';

// Materials
const materials = {
    ground: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 }),
    grid: new THREE.LineBasicMaterial({ color: 0x374151 }),
    tree: new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 }), 
    platformNormal: new THREE.MeshStandardMaterial({ color: 0xd7ccc8, metalness: 0.1, roughness: 0.6 }), 
    platformSelected: new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x4f46e5, emissiveIntensity: 0.5 }), 
    platformGhost: new THREE.MeshStandardMaterial({ color: 0x4b5563, transparent: true, opacity: 0.5, wireframe: true }),
    ropeSafe: new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.4 }), 
    ropeWarning: new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.4 }), 
    ropeDanger: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6 }), 
    ropeSelected: new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x6366f1, emissiveIntensity: 0.5 }), 
    ropeGhost: new THREE.MeshStandardMaterial({ color: 0x4b5563, transparent: true, opacity: 0.3 }),
    obstacleLeaf: new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.9, emissive: 0x064e3b, emissiveIntensity: 0.2 }),
    obstacleBranch: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
};

// 3D groups
let meshGroup;

/**
 * Safe wrapper to render KaTeX math expressions without throwing errors if the CDN failed to load
 */
function safeRenderMath(element) {
    if (typeof renderMathInElement !== 'undefined') {
        try {
            renderMathInElement(element, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false
            });
        } catch (error) {
            console.error("Error rendering math with KaTeX:", error);
        }
    } else {
        console.warn("KaTeX renderMathInElement is not defined (CDN might be offline/blocked). Math will remain in raw text format.");
    }
}

/**
 * Initialize 3D Engine
 */
function init3D() {
    const container = document.getElementById('canvas-3d');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const isLight = document.body.classList.contains('theme-light');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(isLight ? 0xf3f4f6 : 0x05070c);

    if (isLight) {
        materials.ground.color.setHex(0xe5e7eb);
        materials.grid.color.setHex(0x9ca3af);
    }

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.up.set(0, 0, 1); // Z-axis is vertical (GeoGebra 3D standard)
    camera.position.set(12, -15, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01; 
    controls.minDistance = 2;
    controls.maxDistance = 40;
    controls.target.set(5, 5, 2);

    // Light setups
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(10, -15, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.25);
    dirLight2.position.set(-10, 10, 10);
    scene.add(dirLight2);

    meshGroup = new THREE.Group();
    scene.add(meshGroup);

    setupEnvironment();

    window.addEventListener('resize', onWindowResize);
    container.addEventListener('pointerdown', onPointerDown);

    animate();
}

function updateGridHelper(isLight) {
    if (gridHelper) {
        scene.remove(gridHelper);
    }
    const gridSize = 30;
    const gridDivisions = 30;
    const colorCenter = isLight ? 0x9ca3af : 0x374151;
    const colorGrid = isLight ? 0xd1d5db : 0x111827;
    gridHelper = new THREE.GridHelper(gridSize, gridDivisions, colorCenter, colorGrid);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(0, 0, 0);
    scene.add(gridHelper);
}

function setupEnvironment() {
    const isLight = document.body.classList.contains('theme-light');
    updateGridHelper(isLight);

    // Custom styled Axes (Red=X, Green=Y, Blue=Z)
    const axisThickness = 0.035;
    const axisLength = 16; // Goes from -1 to 15

    // X-Axis (Red)
    const xGeo = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
    xGeo.rotateZ(-Math.PI / 2);
    const xMesh = new THREE.Mesh(xGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    // Center of cylinder is at x = 7, which means it starts at -1 and ends at 15
    xMesh.position.set(7, 0, 0);
    scene.add(xMesh);

    // Y-Axis (Green)
    const yGeo = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
    // Cylinder is already aligned with Y-axis in Three.js, so no rotation is needed.
    const yMesh = new THREE.Mesh(yGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    // Center of cylinder is at y = 7, starting at -1 and ending at 15
    yMesh.position.set(0, 7, 0);
    scene.add(yMesh);

    // Z-Axis (Blue) - Vertical height
    const zGeo = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
    // Rotate around X-axis by 90 degrees to align the height axis of the cylinder with the world Z-axis
    zGeo.rotateX(Math.PI / 2);
    const zMesh = new THREE.Mesh(zGeo, new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
    // Center of cylinder is at z = 7, starting at -1 and ending at 15
    zMesh.position.set(0, 0, 7);
    scene.add(zMesh);

    createAxisLabel('X', [15.5, 0.3, 0], '#ef4444');
    createAxisLabel('Y', [0.3, 15.5, 0], '#10b981');
    createAxisLabel('Z', [0.3, 0, 15.5], '#3b82f6');
}

function createTextSprite(text, color = '#ffffff', scale = 0.5) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adapt colors for light theme
    const isLight = document.body.classList.contains('theme-light');
    let textColor = color;
    let shadowColor = 'rgba(0,0,0,0.85)';
    if (isLight) {
        shadowColor = 'rgba(255,255,255,0.85)';
        if (color === '#ffffff') textColor = '#111827';
        else if (color === '#e2e8f0') textColor = '#1f2937';
        else if (color === '#a5b4fc') textColor = '#4f46e5';
    }
    
    ctx.font = 'bold 36px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 4;
    ctx.fillStyle = textColor;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale * 2, scale, 1);
    return sprite;
}

function createAxisLabel(text, position, color) {
    const sprite = createTextSprite(text, color, 0.55);
    sprite.position.set(...position);
    scene.add(sprite);
}

function onPointerDown(event) {
    // Do not run raycasting in learn mode to keep things simple and focused
    if (learnMode) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshGroup.children, true);

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        
        const plat = platforms.find(p => p.mesh === clickedMesh || p.sprite === clickedMesh);
        if (plat) {
            selectPlatform(plat.id);
            showToast(`Plattform ${plat.name} ausgewählt`);
            return;
        }

        const rope = ropes.find(r => r.mesh === clickedMesh);
        if (rope) {
            selectRope(rope.id);
            showToast(`Seil ${rope.name} ausgewählt`);
            return;
        }
    }
}

function onWindowResize() {
    const container = document.getElementById('canvas-3d');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/**
 * 3D Model Redrawing Engine
 */
function rebuild3DModel() {
    // Clear old meshes
    while(meshGroup.children.length > 0) { 
        meshGroup.remove(meshGroup.children[0]); 
    }

    const activePlatforms = learnMode ? currentLevelState.platforms : platforms;
    const activeRopes = learnMode ? currentLevelState.ropes : ropes;

    // Draw Trees
    const treePositions = {};
    activePlatforms.forEach(p => {
        const key = `${p.x.toFixed(1)}_${p.y.toFixed(1)}`;
        if (!treePositions[key] || treePositions[key] < p.z) {
            treePositions[key] = p.z;
        }
    });

    // Draw ghost tree positions if in Level 1 (to help guide them)
    if (learnMode && currentLevelIndex === 0 && !currentLevelState.targetReached) {
        const targetPlats = window.KLETTERPARK_LEVELS[0].target.platforms;
        targetPlats.forEach(p => {
            const key = `${p.x.toFixed(1)}_${p.y.toFixed(1)}`;
            if (!treePositions[key]) {
                treePositions[key] = p.z;
            }
        });
    }

    Object.keys(treePositions).forEach(key => {
        const [xStr, yStr] = key.split('_');
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        const zHeight = treePositions[key];
        
        if (zHeight > 0) {
            const treeRadius = 0.22;
            const treeGeo = new THREE.CylinderGeometry(treeRadius, treeRadius * 1.05, zHeight, 10);
            treeGeo.translate(0, zHeight / 2, 0);
            
            // Render trees as semi-transparent brown if they are target spots not yet built
            const isBuilt = activePlatforms.some(p => Math.abs(p.x - x) < 0.1 && Math.abs(p.y - y) < 0.1);
            let mat = materials.tree;
            if (learnMode && !isBuilt) {
                mat = materials.tree.clone();
                mat.transparent = true;
                mat.opacity = 0.25;
            }

            const treeMesh = new THREE.Mesh(treeGeo, mat);
            treeMesh.rotation.x = Math.PI / 2;
            treeMesh.position.set(x, y, 0);
            meshGroup.add(treeMesh);
        }
    });

    // Draw Active Platforms
    activePlatforms.forEach(p => {
        const platGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 14);
        platGeo.rotateX(Math.PI / 2);
        
        const isSelected = !learnMode && p.id === selectedPlatformId;
        const mat = isSelected ? materials.platformSelected : materials.platformNormal;
        
        const platMesh = new THREE.Mesh(platGeo, mat);
        platMesh.position.set(p.x, p.y, p.z);
        meshGroup.add(platMesh);
        p.mesh = platMesh;

        // Label above platform
        const labelSprite = createTextSprite(p.name, isSelected ? '#a5b4fc' : '#ffffff', 0.35);
        labelSprite.position.set(p.x, p.y, p.z + 0.5);
        meshGroup.add(labelSprite);
        p.sprite = labelSprite;
    });

    // Draw Ghost Platforms (target placements for Level 1)
    if (learnMode && currentLevelState.ghostPlatforms.length > 0) {
        currentLevelState.ghostPlatforms.forEach(p => {
            const platGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 14);
            platGeo.rotateX(Math.PI / 2);
            const platMesh = new THREE.Mesh(platGeo, materials.platformGhost);
            platMesh.position.set(p.x, p.y, p.z);
            meshGroup.add(platMesh);

            const labelSprite = createTextSprite(p.name + ' ?', '#9ca3af', 0.3);
            labelSprite.position.set(p.x, p.y, p.z + 0.5);
            meshGroup.add(labelSprite);
        });
    }

    // Draw Ropes
    const ropeSafety = learnMode ? {} : calculateRopeSafety();
    activeRopes.forEach(r => {
        const startPlat = activePlatforms.find(p => p.id === r.start || p.name === r.start);
        const endPlat = activePlatforms.find(p => p.id === r.end || p.name === r.end);
        
        if (startPlat && endPlat) {
            const pStart = new THREE.Vector3(startPlat.x, startPlat.y, startPlat.z);
            const pEnd = new THREE.Vector3(endPlat.x, endPlat.y, endPlat.z);
            const distance = pStart.distanceTo(pEnd);
            r.length = distance;

            const thickness = 0.07;
            const ropeGeo = new THREE.CylinderGeometry(thickness, thickness, distance, 8);
            ropeGeo.translate(0, distance / 2, 0);
            ropeGeo.rotateX(Math.PI / 2);

            let mat = materials.ropeSafe;
            if (!learnMode) {
                if (r.id === selectedRopeId) {
                    mat = materials.ropeSelected;
                } else if (ropeSafety[r.id] === 'danger') {
                    mat = materials.ropeDanger;
                } else if (ropeSafety[r.id] === 'warning') {
                    mat = materials.ropeWarning;
                }
            } else {
                // In Learn mode:
                // Level 4 collision visual
                if (currentLevelIndex === 3 && currentLevelState.targetReached) {
                    mat = materials.ropeDanger; // Red warning rope
                } else if (currentLevelIndex === 5) {
                    // Level 6 abnahme
                    if (currentLevelState.targetReached) {
                        mat = materials.ropeSafe; // Everything safe
                    } else {
                        mat = materials.ropeWarning;
                    }
                }
            }

            const ropeMesh = new THREE.Mesh(ropeGeo, mat);
            ropeMesh.position.copy(pStart);
            ropeMesh.lookAt(pEnd);
            meshGroup.add(ropeMesh);
            r.mesh = ropeMesh;

            const midPoint = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
            const labelRope = createTextSprite(r.name, '#e2e8f0', 0.22);
            labelRope.position.copy(midPoint);
            labelRope.position.z += 0.25;
            meshGroup.add(labelRope);
        }
    });

    // Draw Ghost Ropes (dashed line to guide vector calculations in Level 2 / 3 / 5)
    if (learnMode && currentLevelState.ghostRopes.length > 0) {
        currentLevelState.ghostRopes.forEach(gr => {
            const startPlat = activePlatforms.find(p => p.name === gr.start);
            const endPlat = activePlatforms.find(p => p.name === gr.end);
            
            if (startPlat && endPlat) {
                const points = [
                    new THREE.Vector3(startPlat.x, startPlat.y, startPlat.z),
                    new THREE.Vector3(endPlat.x, endPlat.y, endPlat.z)
                ];
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                // Dotted line
                const lineMat = new THREE.LineDashedMaterial({
                    color: 0x818cf8,
                    dashSize: 0.3,
                    gapSize: 0.15
                });
                const line = new THREE.Line(lineGeo, lineMat);
                line.computeLineDistances(); // Required for dashed lines
                meshGroup.add(line);
            }
        });
    }

    // Draw level-specific obstacles (Level 4 Tree Branch)
    if (learnMode && currentLevelState.obstacle) {
        const obs = currentLevelState.obstacle;
        
        // 1. Draw leafy sphere (the branch point)
        const obsGeo = new THREE.SphereGeometry(0.35, 12, 12);
        const obsMesh = new THREE.Mesh(obsGeo, materials.obstacleLeaf);
        obsMesh.position.set(obs.x, obs.y, obs.z);
        meshGroup.add(obsMesh);

        // 2. Draw support branch (cylinder from closest tree trunk)
        // Find nearest tree to this obstacle coordinates. There is a tree at (5, 7) (Platform C)
        const branchGeo = new THREE.CylinderGeometry(0.06, 0.09, 2.5, 6);
        branchGeo.rotateZ(Math.PI / 2); // Make horizontal
        const branchMesh = new THREE.Mesh(branchGeo, materials.obstacleBranch);
        branchMesh.position.set(5 - 1.25, 7, 3); // Branch comes out of tree C at (5,7) towards x direction
        meshGroup.add(branchMesh);

        const labelSprite = createTextSprite(obs.name, '#fca5a5', 0.28);
        labelSprite.position.set(obs.x, obs.y, obs.z + 0.45);
        meshGroup.add(labelSprite);

        // If target is reached in Level 4 (correct collision check), highlight the collision point!
        if (currentLevelState.targetReached) {
            const glowGeo = new THREE.SphereGeometry(0.5, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0xef4444,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.set(obs.x, obs.y, obs.z);
            meshGroup.add(glow);
        }
    }

    // Draw intersection point indicator for Level 6
    if (learnMode && currentLevelIndex === 5 && currentLevelState.targetReached) {
        // Draw the collision point at (5, 5, 2) which is windschief but the closest point
        // Or if there was a real intersection. Here the lines are windschief (closest points are (5, 5, 2) and (5, 5, 2.8)).
        // We draw the shortest distance line!
        const p1 = new THREE.Vector3(5, 5, 2);
        const p2 = new THREE.Vector3(5, 5, 2.8);
        
        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
        const line = new THREE.Line(lineGeo, lineMat);
        meshGroup.add(line);

        const labelDist = createTextSprite("Abstand = 2,8m", '#facc15', 0.28);
        labelDist.position.set(5, 5, 3.1);
        meshGroup.add(labelDist);
    }
}

/**
 * Calculates safety for free mode ropes
 */
function calculateRopeSafety() {
    const safety = {};
    ropes.forEach(r => safety[r.id] = 'safe');

    for (let i = 0; i < ropes.length; i++) {
        for (let j = i + 1; j < ropes.length; j++) {
            const r1 = ropes[i];
            const r2 = ropes[j];
            
            const startPlat1 = platforms.find(p => p.id === r1.start);
            const endPlat1 = platforms.find(p => p.id === r1.end);
            const startPlat2 = platforms.find(p => p.id === r2.start);
            const endPlat2 = platforms.find(p => p.id === r2.end);

            if (startPlat1 && endPlat1 && startPlat2 && endPlat2) {
                const ropeData1 = {
                    name: r1.name,
                    start: [startPlat1.x, startPlat1.y, startPlat1.z],
                    vector: [endPlat1.x - startPlat1.x, endPlat1.y - startPlat1.y, endPlat1.z - startPlat1.z]
                };
                const ropeData2 = {
                    name: r2.name,
                    start: [startPlat2.x, startPlat2.y, startPlat2.z],
                    vector: [endPlat2.x - startPlat2.x, endPlat2.y - startPlat2.y, endPlat2.z - startPlat2.z]
                };

                const analysis = window.MathSolver.analyzeLagebeziehung(ropeData1, ropeData2, 0.01);
                
                if (analysis.relation === 'identisch' || analysis.segmentCollision) {
                    safety[r1.id] = 'danger';
                    safety[r2.id] = 'danger';
                } else if (analysis.relation === 'windschief' && analysis.distance < 1.5) {
                    if (safety[r1.id] !== 'danger') safety[r1.id] = 'warning';
                    if (safety[r2.id] !== 'danger') safety[r2.id] = 'warning';
                }
            }
        }
    }
    return safety;
}

/**
 * Free Mode operations
 */
function generatePlatformName() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < alphabet.length; i++) {
        const letter = alphabet[i];
        if (!platforms.find(p => p.name === letter)) {
            return letter;
        }
    }
    return 'P' + (platforms.length + 1);
}

function addPlatform(name, x, y, z) {
    const id = 'plat_' + Date.now() + '_' + Math.floor(Math.random()*1000);
    platforms.push({ id, name, x, y, z });
    rebuild3DModel();
    updateSidebarLists();
    updateGeoGebraCode();
    updateSelectFields();
    triggerMathAnalysis();
    return id;
}

function removePlatform(id) {
    ropes = ropes.filter(r => r.start !== id && r.end !== id);
    platforms = platforms.filter(p => p.id !== id);
    if (selectedPlatformId === id) selectedPlatformId = null;
    
    rebuild3DModel();
    updateSidebarLists();
    updateGeoGebraCode();
    updateSelectFields();
    triggerMathAnalysis();
}

function addRope(startId, endId) {
    if (startId === endId) {
        showToast('Start- und Endplattform müssen verschieden sein!', true);
        return null;
    }
    const startPlat = platforms.find(p => p.id === startId);
    const endPlat = platforms.find(p => p.id === endId);
    if (!startPlat || !endPlat) return null;

    const duplicate = ropes.find(r => 
        (r.start === startId && r.end === endId) || 
        (r.start === endId && r.end === startId)
    );
    if (duplicate) {
        showToast('Dieses Seil existiert bereits!', true);
        return null;
    }

    const name = startPlat.name + endPlat.name;
    const id = 'rope_' + Date.now();
    ropes.push({ id, name, start: startId, end: endId });
    
    rebuild3DModel();
    updateSidebarLists();
    updateGeoGebraCode();
    updateSelectFields();
    triggerMathAnalysis();
    return id;
}

function removeRope(id) {
    ropes = ropes.filter(r => r.id !== id);
    if (selectedRopeId === id) selectedRopeId = null;
    
    rebuild3DModel();
    updateSidebarLists();
    updateGeoGebraCode();
    updateSelectFields();
    triggerMathAnalysis();
}

function selectPlatform(id) {
    selectedPlatformId = id;
    selectedRopeId = null;
    
    document.querySelectorAll('.list-item').forEach(el => el.classList.remove('selected'));
    const itemEl = document.getElementById(`li-${id}`);
    if (itemEl) itemEl.classList.add('selected');

    const plat = platforms.find(p => p.id === id);
    if (plat) {
        document.getElementById('edit-plat-container').style.display = 'block';
        document.getElementById('edit-name').value = plat.name;
        document.getElementById('edit-x').value = plat.x;
        document.getElementById('edit-y').value = plat.y;
        document.getElementById('edit-z').value = plat.z;
    } else {
        document.getElementById('edit-plat-container').style.display = 'none';
    }
    rebuild3DModel();
}

function selectRope(id) {
    selectedRopeId = id;
    selectedPlatformId = null;
    document.getElementById('edit-plat-container').style.display = 'none';

    document.querySelectorAll('.list-item').forEach(el => el.classList.remove('selected'));
    const itemEl = document.getElementById(`li-${id}`);
    if (itemEl) itemEl.classList.add('selected');

    const rope = ropes.find(r => r.id === id);
    if (rope) {
        const rope1Select = document.getElementById('math-rope-1');
        const rope2Select = document.getElementById('math-rope-2');
        rope1Select.value = id;
        const otherRope = ropes.find(r => r.id !== id);
        if (otherRope) rope2Select.value = otherRope.id;
        triggerMathAnalysis();
    }
    rebuild3DModel();
}

/**
 * Free Mode Scenarios loader
 */
const scenarios = {
    collision: {
        platforms: [
            { name: 'A', x: 2.0, y: 2.0, z: 1.0 },
            { name: 'B', x: 8.0, y: 8.0, z: 3.0 },
            { name: 'C', x: 2.0, y: 8.0, z: 3.0 },
            { name: 'D', x: 8.0, y: 2.0, z: 1.0 }
        ],
        ropes: [
            { start: 'A', end: 'B' },
            { start: 'C', end: 'D' }
        ]
    },
    windschief_safe: {
        platforms: [
            { name: 'A', x: 1.0, y: 2.0, z: 1.0 },
            { name: 'B', x: 9.0, y: 3.0, z: 3.0 },
            { name: 'C', x: 2.0, y: 8.0, z: 3.5 },
            { name: 'D', x: 8.0, y: 1.0, z: 1.2 }
        ],
        ropes: [
            { start: 'A', end: 'B' },
            { start: 'C', end: 'D' }
        ]
    },
    windschief_danger: {
        platforms: [
            { name: 'A', x: 2.0, y: 2.0, z: 1.5 },
            { name: 'B', x: 8.0, y: 8.0, z: 1.5 },
            { name: 'C', x: 2.0, y: 8.0, z: 2.0 },
            { name: 'D', x: 8.0, y: 2.0, z: 2.0 }
        ],
        ropes: [
            { start: 'A', end: 'B' },
            { start: 'C', end: 'D' }
        ]
    },
    parallel: {
        platforms: [
            { name: 'A', x: 1.0, y: 2.0, z: 2.0 },
            { name: 'B', x: 8.0, y: 2.0, z: 4.0 },
            { name: 'C', x: 1.0, y: 5.0, z: 2.0 },
            { name: 'D', x: 8.0, y: 5.0, z: 4.0 }
        ],
        ropes: [
            { start: 'A', end: 'B' },
            { start: 'C', end: 'D' }
        ]
    }
};

function loadScenario(key) {
    const sc = scenarios[key];
    if (!sc) return;

    platforms = [];
    ropes = [];
    selectedPlatformId = null;
    selectedRopeId = null;
    document.getElementById('edit-plat-container').style.display = 'none';

    document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-sc-${key}`);
    if (btn) btn.classList.add('active');

    const nameToId = {};
    sc.platforms.forEach(p => {
        const id = addPlatform(p.name, p.x, p.y, p.z);
        nameToId[p.name] = id;
    });
    sc.ropes.forEach(r => {
        addRope(nameToId[r.start], nameToId[r.end]);
    });

    if (ropes.length > 0) selectRope(ropes[0].id);
    showToast('Szenario geladen');
}

/**
 * Sync views
 */
function updateSidebarLists() {
    const platformListEl = document.getElementById('platform-list');
    const ropeListEl = document.getElementById('rope-list');

    if (platforms.length === 0) {
        platformListEl.innerHTML = '<div class="empty-state">Keine Plattformen vorhanden.</div>';
    } else {
        platformListEl.innerHTML = platforms.map(p => `
            <div class="list-item ${p.id === selectedPlatformId ? 'selected' : ''}" id="li-${p.id}" onclick="selectPlatform('${p.id}')">
                <div class="item-info">
                    <span class="item-title">Plattform ${p.name}</span>
                    <span class="item-subtitle">(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})</span>
                </div>
                <div class="item-actions">
                    <button class="btn-delete-item" onclick="event.stopPropagation(); removePlatform('${p.id}')">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    if (ropes.length === 0) {
        ropeListEl.innerHTML = '<div class="empty-state">Keine Seile vorhanden.</div>';
    } else {
        ropeListEl.innerHTML = ropes.map(r => {
            const startPlat = platforms.find(p => p.id === r.start);
            const endPlat = platforms.find(p => p.id === r.end);
            const lengthStr = r.length ? `${r.length.toFixed(2).replace('.', ',')}m` : '';
            return `
                <div class="list-item ${r.id === selectedRopeId ? 'selected' : ''}" id="li-${r.id}" onclick="selectRope('${r.id}')">
                    <div class="item-info">
                        <span class="item-title">Seil ${r.name}</span>
                        <span class="item-subtitle">${startPlat ? startPlat.name : '?' } → ${endPlat ? endPlat.name : '?' } (${lengthStr})</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-delete-item" onclick="event.stopPropagation(); removeRope('${r.id}')">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    lucide.createIcons();
}

function updateSelectFields() {
    const rope1Select = document.getElementById('math-rope-1');
    const rope2Select = document.getElementById('math-rope-2');
    const addRopeStart = document.getElementById('rope-start');
    const addRopeEnd = document.getElementById('rope-end');

    const selectOptionsHTML = platforms.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    addRopeStart.innerHTML = selectOptionsHTML;
    addRopeEnd.innerHTML = selectOptionsHTML;
    if (platforms.length > 1) addRopeEnd.selectedIndex = 1;

    const ropeOptionsHTML = ropes.map(r => `<option value="${r.id}">Seil ${r.name}</option>`).join('');
    const prevR1 = rope1Select.value;
    const prevR2 = rope2Select.value;

    rope1Select.innerHTML = '<option value="">-- Seil 1 wählen --</option>' + ropeOptionsHTML;
    rope2Select.innerHTML = '<option value="">-- Seil 2 wählen --</option>' + ropeOptionsHTML;

    if (ropes.find(r => r.id === prevR1)) rope1Select.value = prevR1;
    if (ropes.find(r => r.id === prevR2)) rope2Select.value = prevR2;
}

function updateGeoGebraCode() {
    const codeConsole = document.getElementById('geogebra-code');
    if (platforms.length === 0) {
        codeConsole.innerText = '// Erstelle Plattformen und Seile, um Code zu generieren';
        return;
    }

    let codeLines = [];
    codeLines.push('// --- GeoGebra 3D Befehle (Einfügen in GeoGebra Eingabezeile) ---');
    codeLines.push('');
    codeLines.push('// 1. Plattformen definieren');
    platforms.forEach(p => {
        codeLines.push(`${p.name} = (${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`);
    });

    if (ropes.length > 0) {
        codeLines.push('');
        codeLines.push('// 2. Seile als Segmente und Richtungsvektoren erstellen');
        ropes.forEach(r => {
            const startPlat = platforms.find(p => p.id === r.start);
            const endPlat = platforms.find(p => p.id === r.end);
            if (startPlat && endPlat) {
                const pN1 = startPlat.name;
                const pN2 = endPlat.name;
                codeLines.push(`v_${pN1}${pN2} = Vektor(${pN1}, ${pN2})`);
                codeLines.push(`g_${pN1}${pN2} = Gerade(${pN1}, v_${pN1}${pN2})`);
                codeLines.push(`Seil_${pN1}${pN2} = Strecke(${pN1}, ${pN2})`);
            }
        });
    }
    codeConsole.innerText = codeLines.join('\n');
}

function triggerMathAnalysis() {
    const rope1Id = document.getElementById('math-rope-1').value;
    const rope2Id = document.getElementById('math-rope-2').value;
    const outputEl = document.getElementById('math-output');

    if (!rope1Id || !rope2Id) {
        outputEl.innerHTML = '<div class="empty-state">Wähle zwei Seile aus, um die mathematische Lagebeziehung mit vollständigem Rechenweg anzuzeigen.</div>';
        return;
    }
    if (rope1Id === rope2Id) {
        outputEl.innerHTML = '<div class="empty-state" style="color: var(--danger);">Wähle zwei verschiedene Seile zum Vergleichen!</div>';
        return;
    }

    const rope1 = ropes.find(r => r.id === rope1Id);
    const rope2 = ropes.find(r => r.id === rope2Id);

    if (rope1 && rope2) {
        const result = window.MathSolver.analyzeLagebeziehung(rope1, rope2);
        outputEl.innerHTML = result.explanation;
        
        safeRenderMath(outputEl);
    }
}

/**
 * Mode Switching (Learn vs Free)
 */
function toggleMode(mode) {
    if (mode === 'learn') {
        learnMode = true;
        document.getElementById('btn-mode-learn').classList.add('active');
        document.getElementById('btn-mode-free').classList.remove('active');
        
        document.getElementById('progress-bar-container').style.display = 'flex';
        document.getElementById('learn-panel').style.display = 'flex';
        document.getElementById('help-panel').style.display = 'flex';
        
        document.getElementById('free-panel').style.display = 'none';
        document.getElementById('free-math-panel').style.display = 'none';
        document.getElementById('free-scenarios-hud').style.display = 'none';

        loadLevel(currentLevelIndex);
    } else {
        learnMode = false;
        document.getElementById('btn-mode-learn').classList.remove('active');
        document.getElementById('btn-mode-free').classList.add('active');
        
        document.getElementById('progress-bar-container').style.display = 'none';
        document.getElementById('learn-panel').style.display = 'none';
        document.getElementById('help-panel').style.display = 'none';
        
        document.getElementById('free-panel').style.display = 'flex';
        document.getElementById('free-math-panel').style.display = 'flex';
        document.getElementById('free-scenarios-hud').style.display = 'flex';

        rebuild3DModel();
        updateSidebarLists();
        updateSelectFields();
        updateGeoGebraCode();
        triggerMathAnalysis();
    }
    onWindowResize();
}

function toggleFreeTab(tab) {
    currentFreeTab = tab;
    if (tab === 'build') {
        document.getElementById('btn-free-build').classList.add('active');
        document.getElementById('btn-free-geogebra').classList.remove('active');
        document.getElementById('free-build-content').style.display = 'flex';
        document.getElementById('free-geogebra-content').style.display = 'none';
    } else {
        document.getElementById('btn-free-build').classList.remove('active');
        document.getElementById('btn-free-geogebra').classList.add('active');
        document.getElementById('free-build-content').style.display = 'none';
        document.getElementById('free-geogebra-content').style.display = 'flex';
    }
}

/**
 * Level Manager Logic
 */
function initLevels() {
    const container = document.getElementById('progress-bar-container');
    const levels = window.KLETTERPARK_LEVELS;

    let html = '';
    levels.forEach((l, idx) => {
        // Status classes: locked, active, solved
        let statusClass = 'locked';
        if (idx === currentLevelIndex) {
            statusClass = 'active';
        } else if (idx <= unlockedLevelIndex) {
            statusClass = 'solved'; // Already unlocked or solved
        }

        html += `
            <div class="level-node ${statusClass}" id="lvl-node-${idx}" onclick="onLevelNodeClick(${idx})">
                <i data-lucide="${statusClass === 'solved' ? 'check-circle' : 'play-circle'}" style="width: 16px; height: 16px;"></i>
                Lvl ${l.id}: ${l.theme}
            </div>
        `;
        if (idx < levels.length - 1) {
            html += `<div class="level-connector ${idx < unlockedLevelIndex ? 'solved' : ''}" id="lvl-conn-${idx}"></div>`;
        }
    });
    container.innerHTML = html;
    lucide.createIcons();
}

function updateLevelsProgress() {
    const levels = window.KLETTERPARK_LEVELS;
    levels.forEach((l, idx) => {
        const node = document.getElementById(`lvl-node-${idx}`);
        const conn = document.getElementById(`lvl-conn-${idx}`);

        // Remove old classes
        node.classList.remove('locked', 'active', 'solved');
        
        let statusClass = 'locked';
        if (idx === currentLevelIndex) {
            statusClass = 'active';
        } else if (idx <= unlockedLevelIndex) {
            statusClass = 'solved';
        }
        node.classList.add(statusClass);

        // Update icon in node
        const iconName = statusClass === 'solved' ? 'check-circle' : 'play-circle';
        node.innerHTML = `
            <i data-lucide="${iconName}" style="width: 16px; height: 16px;"></i>
            Lvl ${l.id}: ${l.theme}
        `;

        if (conn) {
            conn.classList.remove('solved', 'active');
            if (idx < unlockedLevelIndex) {
                conn.classList.add('solved');
            }
        }
    });
    lucide.createIcons();
}

function onLevelNodeClick(index) {
    if (index > unlockedLevelIndex) {
        showToast('Dieses Level ist noch gesperrt! Löse zuerst die vorherigen Aufgaben.', true);
        return;
    }
    loadLevel(index);
}

function loadLevel(index) {
    currentLevelIndex = index;
    const level = window.KLETTERPARK_LEVELS[index];
    
    // 1. Update progress bar visual states
    updateLevelsProgress();

    // 2. Set Email contents
    document.getElementById('email-sender').innerText = level.email.sender;
    document.getElementById('email-subject').innerText = level.email.subject;
    document.getElementById('email-date').innerText = level.email.date;
    document.getElementById('email-body').innerHTML = level.email.body;
    
    safeRenderMath(document.getElementById('email-body'));

    // 3. Set Task Description
    document.getElementById('task-instructions').innerHTML = level.taskDescription;
    safeRenderMath(document.getElementById('task-instructions'));

    // 4. Generate Level Dynamic Inputs
    const inputsContainer = document.getElementById('task-inputs');
    inputsContainer.innerHTML = '';

    level.inputs.forEach(input => {
        const row = document.createElement('div');
        row.className = 'task-input-label-row';

        const label = document.createElement('label');
        label.setAttribute('for', `input-${input.id}`);
        label.innerHTML = input.label;

        let inputEl;
        if (input.type === 'select') {
            inputEl = document.createElement('select');
            inputEl.id = `input-${input.id}`;
            inputEl.className = 'select-field';
            input.options.forEach(opt => {
                const optEl = document.createElement('option');
                optEl.value = opt.value;
                optEl.innerText = opt.label;
                inputEl.appendChild(optEl);
            });
        } else {
            inputEl = document.createElement('input');
            inputEl.type = 'number';
            inputEl.id = `input-${input.id}`;
            inputEl.className = 'input-field';
            inputEl.placeholder = 'Rechnen...';
            inputEl.step = 'any';
        }

        row.appendChild(label);
        row.appendChild(inputEl);
        inputsContainer.appendChild(row);
    });

    safeRenderMath(inputsContainer);

    // Reset Task Card Buttons
    document.getElementById('btn-check-answer').style.display = 'inline-flex';
    document.getElementById('btn-next-level').style.display = 'none';

    // 5. Setup 3D State for Level
    currentLevelState.targetReached = false;
    currentLevelState.platforms = [];
    currentLevelState.ropes = [];
    currentLevelState.ghostPlatforms = [];
    currentLevelState.ghostRopes = [];
    currentLevelState.obstacle = null;

    // Load platforms/ropes specified in level setup
    if (level.setup.platforms) {
        level.setup.platforms.forEach(p => {
            currentLevelState.platforms.push({ ...p, id: 'lvl_p_' + p.name });
        });
    }

    if (level.setup.ropes) {
        level.setup.ropes.forEach(r => {
            currentLevelState.ropes.push({ ...r, id: 'lvl_r_' + r.name });
        });
    }

    // Ghost elements visual helper setups
    if (index === 0) {
        // Level 1: Ghost platforms showing target placement locations
        level.target.platforms.forEach(p => {
            currentLevelState.ghostPlatforms.push({ ...p });
        });
    } else if (index === 1) {
        // Level 2: Show ghost rope AB
        currentLevelState.ghostRopes.push({ start: 'A', end: 'B' });
    } else if (index === 2) {
        // Level 3: Show ghost rope AC
        currentLevelState.ghostRopes.push({ start: 'A', end: 'C' });
    } else if (index === 4) {
        // Level 5: Show ghost elements
        if (level.setup.platformsToShow) {
            level.setup.platformsToShow.forEach(gp => {
                currentLevelState.ghostPlatforms.push({ ...gp });
            });
        }
        currentLevelState.ghostRopes.push({ start: 'D', end: 'F' });
    }

    // Obstacle setup (Level 4 Branch)
    if (level.setup.obstacle) {
        currentLevelState.obstacle = { ...level.setup.obstacle };
    }

    rebuild3DModel();

    // 6. Generate LMS Help cards
    const helpContainer = document.getElementById('help-cards-container');
    helpContainer.innerHTML = '';
    
    level.helpCards.forEach((card, cIdx) => {
        const cardEl = document.createElement('div');
        cardEl.className = `help-card-item ${cIdx === 0 ? 'active' : ''}`;
        cardEl.innerHTML = `
            <div class="help-card-header" onclick="toggleHelpCard(this)">
                <span>${card.title}</span>
                <i data-lucide="chevron-down" style="width: 16px; height: 16px;"></i>
            </div>
            <div class="help-card-body">
                ${card.content.replace(/\n/g, '<br>')}
            </div>
        `;
        helpContainer.appendChild(cardEl);
    });
    lucide.createIcons();
    safeRenderMath(helpContainer);

    // Hide solved LGS view
    document.getElementById('solved-level-explanation-box').style.display = 'none';

    // Focus camera on interesting spot for the level
    if (index === 0) {
        controls.target.set(5, 5, 2);
    } else if (index === 3) {
        // Level 4 focus near obstacle branch
        controls.target.set(5, 7, 3);
    } else if (index === 5) {
        // Level 6 focus near crossing ropes
        controls.target.set(5, 5, 2.5);
    }
}

function toggleHelpCard(headerEl) {
    const item = headerEl.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close other help cards
    document.querySelectorAll('.help-card-item').forEach(el => el.classList.remove('active'));
    
    if (!isActive) {
        item.classList.add('active');
    }
}

/**
 * Verify student inputs for current level
 */
function checkLevelAnswers() {
    const level = window.KLETTERPARK_LEVELS[currentLevelIndex];
    let allCorrect = true;

    level.inputs.forEach(input => {
        const inputEl = document.getElementById(`input-${input.id}`);
        const val = input.type === 'select' ? inputEl.value : parseFloat(inputEl.value);
        
        let isCorrect = false;

        if (input.type === 'select') {
            isCorrect = (val === input.expected);
        } else {
            // Check floats with tolerance
            const tolerance = input.tolerance || 0.1;
            isCorrect = Math.abs(val - input.expected) <= tolerance;
        }

        // Apply visual classes
        inputEl.classList.remove('correct', 'wrong');
        if (isCorrect) {
            inputEl.classList.add('correct');
        } else {
            inputEl.classList.add('wrong');
            allCorrect = false;
        }
    });

    if (allCorrect) {
        showToast('Hervorragend! Alle Berechnungen sind mathematisch korrekt. 🎯');
        triggerLevelSuccessActions();
    } else {
        showToast('Einige Werte sind noch fehlerhaft. Überprüfe deine Rechnungen und versuche es erneut!', true);
    }
}

/**
 * Handle visual and logical changes once level solved
 */
function triggerLevelSuccessActions() {
    currentLevelState.targetReached = true;
    const level = window.KLETTERPARK_LEVELS[currentLevelIndex];

    // Build the visual model based on solved answers
    if (currentLevelIndex === 0) {
        // Spawn actual platforms
        level.target.platforms.forEach(p => {
            currentLevelState.platforms.push({ ...p, id: 'lvl_p_' + p.name });
        });
        currentLevelState.ghostPlatforms = []; // Clear ghost guides
    } else if (currentLevelIndex === 1) {
        // Spawn rope AB
        currentLevelState.ropes.push({ name: 'AB', start: 'A', end: 'B' });
        currentLevelState.ghostRopes = [];
    } else if (currentLevelIndex === 2) {
        // Spawn rope AC
        currentLevelState.ropes.push({ name: 'AC', start: 'A', end: 'C' });
        currentLevelState.ghostRopes = [];
    } else if (currentLevelIndex === 3) {
        // Pointprobe success (collision shown in red)
        rebuild3DModel();
    } else if (currentLevelIndex === 4) {
        // Parallel rope DF spawned
        currentLevelState.platforms.push({ name: 'F', x: 5, y: 5.5, z: 3, id: 'lvl_p_F' });
        currentLevelState.ropes.push({ name: 'DF', start: 'D', end: 'F' });
        currentLevelState.ghostPlatforms = [];
        currentLevelState.ghostRopes = [];
    } else if (currentLevelIndex === 5) {
        // Level 6 abnahme
        // Compute LGS and display solving breakdown
        const ropeAB = {
            name: 'AB',
            start: [2, 3, 2],
            vector: [6, -1, 2]
        };
        const ropeCD = {
            name: 'CD',
            start: [5, 7, 3],
            vector: [3, -5, -2]
        };
        const analysis = window.MathSolver.analyzeLagebeziehung(ropeAB, ropeCD);
        
        // Render explanation in right sidebar box
        const explanationBox = document.getElementById('solved-level-explanation-box');
        const explanationEl = document.getElementById('solved-level-explanation');
        explanationEl.innerHTML = analysis.explanation;
        explanationBox.style.display = 'block';

        safeRenderMath(explanationEl);
    }

    rebuild3DModel();

    // Progress logic
    if (currentLevelIndex === unlockedLevelIndex) {
        unlockedLevelIndex = Math.min(unlockedLevelIndex + 1, window.KLETTERPARK_LEVELS.length - 1);
    }
    updateLevelsProgress();

    // Toggle buttons on task panel
    document.getElementById('btn-check-answer').style.display = 'none';
    if (currentLevelIndex < window.KLETTERPARK_LEVELS.length - 1) {
        document.getElementById('btn-next-level').style.display = 'inline-flex';
        document.getElementById('next-level-num').innerText = currentLevelIndex + 2;
    } else {
        // Final screen completed!
        showToast('🎉 Gratulation! Kletterpark-Modellierung erfolgreich abgeschlossen!', false);
        const taskInstructionsEl = document.getElementById('task-instructions');
        taskInstructionsEl.innerHTML = `
            <div class="result-box success" style="margin-top: 0;">
                <h4>🏆 Alle Levels bestanden!</h4>
                <p>Du hast sämtliche Aufträge und Prüfungen des Planungsbüros erfolgreich gelöst. Der Kletterpark ist abgenommen und sicher.</p>
                <p style="margin-top: 10px; font-weight: 500;">Wechsle jetzt oben in den <strong>"Freien Modus"</strong>, um eigene Parcours-Elemente frei zu gestalten.</p>
            </div>
        `;
    }
}

/**
 * Toast notifications
 */
function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (isError) toast.style.borderColor = 'var(--danger)';
    
    toast.innerHTML = `
        <i data-lucide="${isError ? 'alert-triangle' : 'info'}" style="width: 18px; height: 18px; stroke: ${isError ? 'var(--danger)' : 'var(--accent)'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.25s ease reverse';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

function copyGeoGebraCode() {
    const codeText = document.getElementById('geogebra-code').innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        showToast('GeoGebra-Code kopiert! 📋');
    }).catch(() => {
        showToast('Fehler beim Kopieren.', true);
    });
}

/**
 * Dom Initialization & Events
 */
document.addEventListener('DOMContentLoaded', () => {
    init3D();
    initLevels();

    // Mode Toggle Buttons
    document.getElementById('btn-mode-learn').addEventListener('click', () => toggleMode('learn'));
    document.getElementById('btn-mode-free').addEventListener('click', () => toggleMode('free'));

    // Check Answers Level
    document.getElementById('btn-check-answer').addEventListener('click', checkLevelAnswers);

    // Next Level Button
    document.getElementById('btn-next-level').addEventListener('click', () => {
        if (currentLevelIndex < window.KLETTERPARK_LEVELS.length - 1) {
            const isTestMode = document.getElementById('btn-solve-cheat') !== null;
            if (isTestMode) {
                loadLevel(currentLevelIndex + 1);
            } else {
                const docModal = document.getElementById('modal-documentation');
                if (docModal) {
                    docModal.classList.add('active');
                } else {
                    loadLevel(currentLevelIndex + 1);
                }
            }
        }
    });

    // Confirm Documentation Button (closes modal and loads next level)
    const confirmDocBtn = document.getElementById('btn-confirm-documentation');
    if (confirmDocBtn) {
        confirmDocBtn.addEventListener('click', () => {
            const docModal = document.getElementById('modal-documentation');
            if (docModal) {
                docModal.classList.remove('active');
            }
            if (currentLevelIndex < window.KLETTERPARK_LEVELS.length - 1) {
                loadLevel(currentLevelIndex + 1);
            }
        });
    }

    // Cancel / Close Documentation Button (just closes modal so they can take screenshot)
    const cancelDocBtn = document.getElementById('btn-cancel-documentation');
    if (cancelDocBtn) {
        cancelDocBtn.addEventListener('click', () => {
            const docModal = document.getElementById('modal-documentation');
            if (docModal) {
                docModal.classList.remove('active');
            }
        });
    }

    const closeDocBtn = document.getElementById('modal-doc-close-btn');
    if (closeDocBtn) {
        closeDocBtn.addEventListener('click', () => {
            const docModal = document.getElementById('modal-documentation');
            if (docModal) {
                docModal.classList.remove('active');
            }
        });
    }

    // Free Mode Platform creators
    document.getElementById('btn-add-platform').addEventListener('click', () => {
        const name = generatePlatformName();
        const randX = Math.round((Math.random() * 6 + 2) * 10) / 10;
        const randY = Math.round((Math.random() * 6 + 2) * 10) / 10;
        const randZ = Math.round((Math.random() * 3 + 1.5) * 10) / 10;
        const id = addPlatform(name, randX, randY, randZ);
        selectPlatform(id);
    });

    // Free mode coordinates inputs live update
    const formFields = ['edit-name', 'edit-x', 'edit-y', 'edit-z'];
    formFields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        el.addEventListener('input', () => {
            if (!selectedPlatformId) return;
            const plat = platforms.find(p => p.id === selectedPlatformId);
            if (!plat) return;

            if (fieldId === 'edit-name') {
                const newName = el.value.trim().toUpperCase();
                if (newName && !platforms.find(p => p.id !== selectedPlatformId && p.name === newName)) {
                    plat.name = newName;
                }
            } else {
                const val = parseFloat(el.value);
                if (!isNaN(val)) {
                    const prop = fieldId.split('-')[1];
                    plat[prop] = val;
                }
            }

            rebuild3DModel();
            updateSidebarLists();
            updateGeoGebraCode();
            updateSelectFields();
            triggerMathAnalysis();
        });
    });

    // Free mode rope connection builder
    document.getElementById('btn-add-rope').addEventListener('click', () => {
        const start = document.getElementById('rope-start').value;
        const end = document.getElementById('rope-end').value;
        if (start && end) {
            const id = addRope(start, end);
            if (id) selectRope(id);
        }
    });

    // Free mode math solver change listener
    document.getElementById('math-rope-1').addEventListener('change', triggerMathAnalysis);
    document.getElementById('math-rope-2').addEventListener('change', triggerMathAnalysis);

    // Modal Onboarding & Tutorial setup
    const modal = document.getElementById('modal-tutorial');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Show onboarding modal immediately on startup
    const isTestMode = document.getElementById('btn-solve-cheat') !== null;
    modal.classList.add('active');
    if (isTestMode) {
        modalCloseBtn.style.display = 'inline-flex';
    } else {
        modal.classList.add('onboarding-mode');
        modalCloseBtn.style.display = 'none';
    }

    // Solve cheat button for testing
    if (isTestMode) {
        document.getElementById('btn-solve-cheat').addEventListener('click', () => {
            const level = window.KLETTERPARK_LEVELS[currentLevelIndex];
            level.inputs.forEach(input => {
                const inputEl = document.getElementById(`input-${input.id}`);
                if (inputEl) {
                    inputEl.value = input.expected;
                }
            });
            checkLevelAnswers();
        });
    }

    document.getElementById('btn-tutorial').addEventListener('click', () => {
        modal.classList.remove('onboarding-mode');
        modalCloseBtn.style.display = 'inline-flex';
        modal.classList.add('active');
        nextOnboardingSlide(1);
    });

    modalCloseBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal && !modal.classList.contains('onboarding-mode')) {
            modal.classList.remove('active');
        }
    });

    // Onboarding start project button
    document.getElementById('btn-start-project').addEventListener('click', () => {
        modal.classList.remove('active', 'onboarding-mode');
    });

    // Theme Toggle Event Listener
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);

    // Sidebar right toggle listener (Collapses help cards sidebar to make more space for 3D coordinate system)
    const sidebarToggleBtn = document.getElementById('btn-sidebar-toggle');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            const sidebarRight = document.getElementById('sidebar-right');
            if (!sidebarRight) return;
            
            const isCollapsed = sidebarRight.classList.toggle('collapsed');
            
            // Update button label and icon
            const btnSpan = sidebarToggleBtn.querySelector('span');
            const btnIcon = document.getElementById('sidebar-toggle-icon');
            
            if (isCollapsed) {
                if (btnSpan) btnSpan.innerText = "Hilfe einblenden";
                if (btnIcon) btnIcon.setAttribute('data-lucide', 'book');
            } else {
                if (btnSpan) btnSpan.innerText = "Hilfe ausblenden";
                if (btnIcon) btnIcon.setAttribute('data-lucide', 'book-open');
            }
            
            if (window.lucide) {
                window.lucide.createIcons();
            }
            
            // Smoothly animate Three.js canvas size adjustment in sync with CSS transition
            onWindowResize();
            let steps = 0;
            const resizeInterval = setInterval(() => {
                onWindowResize();
                steps++;
                if (steps > 15) clearInterval(resizeInterval);
            }, 20);
        });
    }

    // Set up standard free mode sandbox coordinates (prefilled scenario)
    loadScenario('collision');

    // Default: Start in Learn Mode at level 1
    toggleMode('learn');
});

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const isLight = body.classList.toggle('theme-light');

    if (isLight) {
        themeIcon.setAttribute('data-lucide', 'moon');
        scene.background = new THREE.Color(0xf3f4f6);
        // Update lights or materials if needed for better light mode contrast
        materials.ground.color.setHex(0xe5e7eb);
        materials.grid.color.setHex(0x9ca3af);
    } else {
        themeIcon.setAttribute('data-lucide', 'sun');
        scene.background = new THREE.Color(0x05070c);
        materials.ground.color.setHex(0x111827);
        materials.grid.color.setHex(0x374151);
    }

    // Update GridHelper color scheme
    updateGridHelper(isLight);

    // Rebuild model to refresh label colors
    rebuild3DModel();

    // Recreate Lucide Icons for the updated attribute
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Switch slides inside the onboarding wizard modal
 */
function nextOnboardingSlide(slideNum) {
    // Hide all slides
    document.querySelectorAll('.onboarding-slide').forEach(slide => {
        slide.style.display = 'none';
        slide.classList.remove('active');
    });

    // Show selected slide
    const targetSlide = document.getElementById(`slide-${slideNum}`);
    if (targetSlide) {
        targetSlide.style.display = 'block';
        targetSlide.classList.add('active');
    }

    // Update modal title text for context
    const titleTextEl = document.getElementById('modal-title-text');
    if (titleTextEl) {
        if (slideNum === 1) {
            titleTextEl.innerText = "🏢 Bauprojekt Kletterpark: Einleitung";
        } else if (slideNum === 2) {
            titleTextEl.innerText = "📐 Bauprojekt Kletterpark: Arbeitsauftrag";
        } else if (slideNum === 3) {
            titleTextEl.innerText = "🎮 Bauprojekt Kletterpark: iPad-Anleitung";
        }
    }
}

// Export functions to window
window.toggleFreeTab = toggleFreeTab;
window.loadScenario = loadScenario;
window.selectPlatform = selectPlatform;
window.selectRope = selectRope;
window.removePlatform = removePlatform;
window.removeRope = removeRope;
window.copyGeoGebraCode = copyGeoGebraCode;
window.onLevelNodeClick = onLevelNodeClick;
window.toggleHelpCard = toggleHelpCard;
window.toggleTheme = toggleTheme;
window.nextOnboardingSlide = nextOnboardingSlide;
