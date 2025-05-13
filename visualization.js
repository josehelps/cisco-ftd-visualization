import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a); // Darker background for better contrast

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 25); // Moved back and higher for better view

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404050, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 15);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Add some spot lights for dramatic effect
const spotLight1 = new THREE.SpotLight(0x4488ff, 2, 30, Math.PI / 6, 0.5, 1);
spotLight1.position.set(-10, 15, 0);
spotLight1.castShadow = true;
scene.add(spotLight1);

const spotLight2 = new THREE.SpotLight(0xff4466, 2, 30, Math.PI / 6, 0.5, 1);
spotLight2.position.set(10, 15, 0);
spotLight2.castShadow = true;
scene.add(spotLight2);

// Helper grid
const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
scene.add(gridHelper);

// Create a group for all objects
const group = new THREE.Group();
group.scale.set(1.5, 1.5, 1.5); // Bigger scale for all objects
group.position.y = 1; // Raise slightly above the grid
scene.add(group);

// Device Materials - More vibrant colors and emissive for glow
const endpointMaterial = new THREE.MeshPhongMaterial({
    color: 0x2c3e50,
    emissive: 0x1a2530,
    emissiveIntensity: 0.2,
    shininess: 50
});

const windowsMaterial = new THREE.MeshPhongMaterial({
    color: 0x0078d7,  // Windows blue
    emissive: 0x00366a,
    emissiveIntensity: 0.3,
    shininess: 70
});

const linuxMaterial = new THREE.MeshPhongMaterial({
    color: 0xf9a834,  // Linux orange/yellow
    emissive: 0x734d19,
    emissiveIntensity: 0.3,
    shininess: 70
});

const ftdMaterial = new THREE.MeshPhongMaterial({
    color: 0xe74c3c,
    emissive: 0x73261e,
    emissiveIntensity: 0.3,
    shininess: 80
});

const fmcMaterial = new THREE.MeshPhongMaterial({
    color: 0x3498db,
    emissive: 0x1a496d,
    emissiveIntensity: 0.3,
    shininess: 80
});

const splunkMaterial = new THREE.MeshPhongMaterial({
    color: 0x1abc9c,
    emissive: 0x0d5e4e,
    emissiveIntensity: 0.3,
    shininess: 80
});

const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x66aaff,
    linewidth: 2
});

const dataPacketMaterial = new THREE.MeshPhongMaterial({
    color: 0xf39c12,
    emissive: 0x794e09,
    emissiveIntensity: 0.5,
    shininess: 90
});

// Create a label function with improved visuals
const createLabel = (text, position, size = 1) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512; // Increased for higher resolution
    canvas.height = 256;
    
    // Background with gradient
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(20, 20, 40, 0.9)');
    gradient.addColorStop(1, 'rgba(40, 40, 80, 0.9)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    context.strokeStyle = 'rgba(120, 180, 255, 0.7)';
    context.lineWidth = 4;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Text with glow effect
    context.shadowColor = 'rgba(100, 180, 255, 0.8)';
    context.shadowBlur = 15;
    context.font = 'bold 32px Arial, sans-serif';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.position.y += 2; // Higher positioning
    sprite.scale.set(size * 6, size * 3, 1); // Bigger labels
    
    return sprite;
};

// Endpoint Workstations (multiple with OS indicators)
const endpoints = [];
const endpointPositions = [
    { x: -10, y: 0, z: -8, os: 'windows' },
    { x: -8, y: 0, z: -10, os: 'linux' },
    { x: -12, y: 0, z: -10, os: 'windows' },
    { x: -14, y: 0, z: -8, os: 'linux' },
];

endpointPositions.forEach((pos) => {
    // Base workstation
    const endpointGeometry = new THREE.BoxGeometry(1.5, 0.8, 1.5);
    const material = pos.os === 'windows' ? windowsMaterial : linuxMaterial;
    const endpoint = new THREE.Mesh(endpointGeometry, material);
    endpoint.position.set(pos.x, pos.y, pos.z);
    endpoint.castShadow = true;
    endpoint.receiveShadow = true;
    group.add(endpoint);
    endpoints.push(endpoint);

    // Add screen to workstation
    const screenGeometry = new THREE.BoxGeometry(1.2, 1, 0.1);
    const screenMaterial = new THREE.MeshPhongMaterial({
        color: 0x95a5a6,
        emissive: 0x404040,
        emissiveIntensity: 0.5
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 0.8, 0);
    screen.castShadow = true;
    endpoint.add(screen);
    
    // Add OS logo to screen
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 128;
    logoCanvas.height = 128;
    const logoCtx = logoCanvas.getContext('2d');
    
    if (pos.os === 'windows') {
        // Windows logo
        logoCtx.fillStyle = '#0078D7';
        logoCtx.fillRect(20, 20, 40, 40);
        logoCtx.fillRect(68, 20, 40, 40);
        logoCtx.fillRect(20, 68, 40, 40);
        logoCtx.fillRect(68, 68, 40, 40);
    } else {
        // Linux (Tux) simplified
        logoCtx.fillStyle = '#F9A834';
        logoCtx.beginPath();
        logoCtx.arc(64, 60, 40, 0, Math.PI * 2);
        logoCtx.fill();
        
        logoCtx.fillStyle = 'black';
        logoCtx.beginPath();
        logoCtx.arc(48, 45, 8, 0, Math.PI * 2); // Left eye
        logoCtx.arc(80, 45, 8, 0, Math.PI * 2); // Right eye
        logoCtx.fill();
        
        logoCtx.fillStyle = 'white';
        logoCtx.beginPath();
        logoCtx.arc(64, 80, 15, 0, Math.PI);
        logoCtx.fill();
    }
    
    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const logoMaterial = new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true
    });
    const logoPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.8),
        logoMaterial
    );
    logoPlane.position.set(0, 0, 0.06);
    screen.add(logoPlane);
    
    // Add label with OS type
    const osLabel = createLabel(pos.os === 'windows' ? 'Windows' : 'Linux', 
        new THREE.Vector3(pos.x, pos.y + 2, pos.z), 0.5);
    group.add(osLabel);
});

// FTD Device - Larger and more detailed
const ftdGeometry = new THREE.BoxGeometry(4, 1.5, 3);
const ftd = new THREE.Mesh(ftdGeometry, ftdMaterial);
ftd.position.set(-3, 0, 0);
ftd.castShadow = true;
ftd.receiveShadow = true;
group.add(ftd);

// Add details to FTD device (ports/lights)
for (let i = 0; i < 4; i++) {
    const portGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const portMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333
    });
    const port = new THREE.Mesh(portGeometry, portMaterial);
    port.position.set(-1.5 + i, 0.2, 1.51);
    ftd.add(port);
    
    // Add LED lights
    const ledGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.05);
    const ledMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(-1.5 + i, 0.6, 1.51);
    ftd.add(led);
}

// Add FTD logo and label
const ftdLabel = createLabel('Cisco FTD', ftd.position);
group.add(ftdLabel);

// FMC (Firewall Management Center) - Larger and more detailed
const fmcGeometry = new THREE.BoxGeometry(3, 3, 3);
const fmc = new THREE.Mesh(fmcGeometry, fmcMaterial);
fmc.position.set(-3, 0, 5);
fmc.castShadow = true;
fmc.receiveShadow = true;
group.add(fmc);

// Add details to FMC (server rack style)
for (let i = 0; i < 3; i++) {
    const rackSlotGeometry = new THREE.BoxGeometry(2.8, 0.6, 0.1);
    const rackSlotMaterial = new THREE.MeshPhongMaterial({
        color: 0x222222
    });
    const rackSlot = new THREE.Mesh(rackSlotGeometry, rackSlotMaterial);
    rackSlot.position.set(0, -1 + i * 0.8, 1.51);
    fmc.add(rackSlot);
    
    // Add blinking server lights
    const ledGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    const ledMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1
    });
    
    for (let j = 0; j < 3; j++) {
        const led = new THREE.Mesh(ledGeometry, ledMaterial);
        led.position.set(-1 + j * 0.5, -1 + i * 0.8, 1.56);
        led.userData = { blinkRate: 0.5 + Math.random() * 2 };
        fmc.add(led);
    }
}

// Add FMC label
const fmcLabel = createLabel('FMC', fmc.position);
group.add(fmcLabel);

// Splunk - Larger and more detailed
const splunkGeometry = new THREE.BoxGeometry(5, 3, 3);
const splunk = new THREE.Mesh(splunkGeometry, splunkMaterial);
splunk.position.set(8, 0, 0);
splunk.castShadow = true;
splunk.receiveShadow = true;
group.add(splunk);

// Add Splunk logo and details
const splunkLogoCanvas = document.createElement('canvas');
splunkLogoCanvas.width = 256;
splunkLogoCanvas.height = 128;
const splunkCtx = splunkLogoCanvas.getContext('2d');

// Splunk-inspired logo (simplified)
splunkCtx.fillStyle = 'black';
splunkCtx.fillRect(0, 0, 256, 128);

// "Splunk" text
splunkCtx.font = 'bold 48px Arial, sans-serif';
splunkCtx.fillStyle = 'white';
splunkCtx.textAlign = 'center';
splunkCtx.textBaseline = 'middle';
splunkCtx.fillText("SPLUNK", 128, 64);

const splunkLogoTexture = new THREE.CanvasTexture(splunkLogoCanvas);
const splunkLogoMaterial = new THREE.MeshBasicMaterial({
    map: splunkLogoTexture
});
const splunkLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2),
    splunkLogoMaterial
);
splunkLogo.position.set(0, 0, 1.51);
splunk.add(splunkLogo);

// Add server details to Splunk
for (let i = 0; i < 4; i++) {
    const diskSlotGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.05);
    const diskSlotMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333
    });
    const diskSlot = new THREE.Mesh(diskSlotGeometry, diskSlotMaterial);
    diskSlot.position.set(-1.5 + i, -1, 1.51);
    splunk.add(diskSlot);
}

// Add blinking Splunk server lights
for (let i = 0; i < 5; i++) {
    const ledGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.05);
    const ledMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(-2 + i, 1, 1.51);
    led.userData = { blinkRate: 0.2 + Math.random() * 3 };
    splunk.add(led);
}

// Add Splunk label
const splunkLabel = createLabel('Splunk FTD detections', splunk.position);
group.add(splunkLabel);

// Analytics Dashboard (above Splunk) with improved visuals
const dashboardGeometry = new THREE.PlaneGeometry(8, 4);
const dashboardMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    side: THREE.DoubleSide
});
const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
dashboard.position.set(8, 5, 0);
dashboard.rotation.x = -Math.PI / 6;
group.add(dashboard);

// Create dashboard texture
const dashCanvas = document.createElement('canvas');
dashCanvas.width = 1024;
dashCanvas.height = 512;
const dashContext = dashCanvas.getContext('2d');

// Draw dashboard background
const dashGradient = dashContext.createLinearGradient(0, 0, 0, dashCanvas.height);
dashGradient.addColorStop(0, '#1E293B');
dashGradient.addColorStop(1, '#0F172A');
dashContext.fillStyle = dashGradient;
dashContext.fillRect(0, 0, dashCanvas.width, dashCanvas.height);

// Draw header
dashContext.fillStyle = '#334155';
dashContext.fillRect(0, 0, dashCanvas.width, 60);

// Draw header text with glow
dashContext.shadowColor = 'rgba(59, 130, 246, 0.8)';
dashContext.shadowBlur = 15;
dashContext.font = 'bold 36px Arial';
dashContext.fillStyle = 'white';
dashContext.textAlign = 'center';
dashContext.fillText('Cisco FTD Security Dashboard', dashCanvas.width / 2, 40);
dashContext.shadowBlur = 0;

// Draw Splunk logo
dashContext.font = 'bold 24px Arial';
dashContext.fillStyle = '#FF5733';
dashContext.textAlign = 'left';
dashContext.fillText('SPLUNK', 40, 100);

// Draw charts and metrics
// Section titles
dashContext.font = 'bold 20px Arial';
dashContext.fillStyle = '#94A3B8';
dashContext.fillText('Security Events', 50, 140);
dashContext.fillText('Threat Categories', 550, 140);

// Chart background elements
dashContext.fillStyle = 'rgba(51, 65, 85, 0.4)';
dashContext.fillRect(40, 160, 400, 300);
dashContext.fillRect(480, 160, 500, 300);

// Bar graph
const barWidth = 60;
const barSpacing = 40;
const barMaxHeight = 200;
const barStartY = 420;
const barStartX = 80;

// Connection events
dashContext.fillStyle = '#3B82F6';
const connectionHeight = barMaxHeight * 0.6;
dashContext.fillRect(barStartX, barStartY - connectionHeight, barWidth, connectionHeight);

// File events
dashContext.fillStyle = '#10B981';
const fileHeight = barMaxHeight * 0.15;
dashContext.fillRect(barStartX + barWidth + barSpacing, barStartY - fileHeight, barWidth, fileHeight);

// Intrusion events
dashContext.fillStyle = '#F59E0B';
const intrusionHeight = barMaxHeight * 0.25;
dashContext.fillRect(barStartX + (barWidth + barSpacing) * 2, barStartY - intrusionHeight, barWidth, intrusionHeight);

// Labels for bars
dashContext.font = '16px Arial';
dashContext.fillStyle = 'white';
dashContext.textAlign = 'center';
dashContext.fillText('Connection', barStartX + barWidth/2, barStartY + 20);
dashContext.fillText('60%', barStartX + barWidth/2, barStartY - connectionHeight/2);

dashContext.fillText('File', barStartX + barWidth + barSpacing + barWidth/2, barStartY + 20);
dashContext.fillText('15%', barStartX + barWidth + barSpacing + barWidth/2, barStartY - fileHeight/2);

dashContext.fillText('Intrusion', barStartX + (barWidth + barSpacing) * 2 + barWidth/2, barStartY + 20);
dashContext.fillText('25%', barStartX + (barWidth + barSpacing) * 2 + barWidth/2, barStartY - intrusionHeight/2);

// Pie chart
const pieX = 730;
const pieY = 300;
const pieRadius = 100;

// Background circle
dashContext.beginPath();
dashContext.arc(pieX, pieY, pieRadius, 0, Math.PI * 2);
dashContext.fillStyle = '#475569';
dashContext.fill();

// Connection slice
dashContext.beginPath();
dashContext.moveTo(pieX, pieY);
dashContext.arc(pieX, pieY, pieRadius, 0, Math.PI * 1.2);
dashContext.fillStyle = '#3B82F6';
dashContext.fill();

// File slice
dashContext.beginPath();
dashContext.moveTo(pieX, pieY);
dashContext.arc(pieX, pieY, pieRadius, Math.PI * 1.2, Math.PI * 1.5);
dashContext.fillStyle = '#10B981';
dashContext.fill();

// Intrusion slice
dashContext.beginPath();
dashContext.moveTo(pieX, pieY);
dashContext.arc(pieX, pieY, pieRadius, Math.PI * 1.5, Math.PI * 2);
dashContext.fillStyle = '#F59E0B';
dashContext.fill();

// Draw legend for pie chart
const legendX = 600;
const legendY = 430;
const squareSize = 15;

// Connection legend
dashContext.fillStyle = '#3B82F6';
dashContext.fillRect(legendX, legendY - squareSize, squareSize, squareSize);
dashContext.fillStyle = 'white';
dashContext.textAlign = 'left';
dashContext.fillText('Connection Events (60%)', legendX + squareSize + 10, legendY);

// File legend
dashContext.fillStyle = '#10B981';
dashContext.fillRect(legendX, legendY + 20, squareSize, squareSize);
dashContext.fillStyle = 'white';
dashContext.fillText('File Events (15%)', legendX + squareSize + 10, legendY + 20 + squareSize/2);

// Intrusion legend
dashContext.fillStyle = '#F59E0B';
dashContext.fillRect(legendX, legendY + 40, squareSize, squareSize);
dashContext.fillStyle = 'white';
dashContext.fillText('Intrusion Events (25%)', legendX + squareSize + 10, legendY + 40 + squareSize/2);

// Apply dashboard texture
const dashboardTexture = new THREE.CanvasTexture(dashCanvas);
dashboard.material.map = dashboardTexture;
dashboard.material.needsUpdate = true;

// Connect endpoints to FTD with more visible lines
endpoints.forEach((endpoint) => {
    const points = [
        new THREE.Vector3(endpoint.position.x, endpoint.position.y + 0.5, endpoint.position.z),
        new THREE.Vector3(ftd.position.x, ftd.position.y, ftd.position.z)
    ];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    group.add(line);
});

// Connect FTD to FMC
const ftdToFmcPoints = [
    new THREE.Vector3(ftd.position.x, ftd.position.y, ftd.position.z),
    new THREE.Vector3(fmc.position.x, fmc.position.y, fmc.position.z)
];
const ftdToFmcGeometry = new THREE.BufferGeometry().setFromPoints(ftdToFmcPoints);
const ftdToFmcLine = new THREE.Line(ftdToFmcGeometry, lineMaterial);
group.add(ftdToFmcLine);

// Connect FMC to Splunk
const fmcToSplunkPoints = [
    new THREE.Vector3(fmc.position.x, fmc.position.y, fmc.position.z),
    new THREE.Vector3(splunk.position.x, splunk.position.y, splunk.position.z)
];
const fmcToSplunkGeometry = new THREE.BufferGeometry().setFromPoints(fmcToSplunkPoints);
const fmcToSplunkLine = new THREE.Line(fmcToSplunkGeometry, lineMaterial);
group.add(fmcToSplunkLine);

// Connect Splunk to Dashboard
const splunkToDashPoints = [
    new THREE.Vector3(splunk.position.x, splunk.position.y + 1, splunk.position.z),
    new THREE.Vector3(dashboard.position.x, dashboard.position.y - 1.5, dashboard.position.z)
];
const splunkToDashGeometry = new THREE.BufferGeometry().setFromPoints(splunkToDashPoints);
const splunkToDashLine = new THREE.Line(splunkToDashGeometry, lineMaterial);
group.add(splunkToDashLine);

// Create enhanced data packets for animation
const packets = [];

const createDataPacket = (startPosition, path) => {
    // Create more interesting packet geometry
    const packetGeometry = new THREE.SphereGeometry(0.3, 12, 12);
    const packet = new THREE.Mesh(packetGeometry, dataPacketMaterial);
    packet.position.copy(startPosition);
    
    // Add glow effect
    const packetGlow = new THREE.PointLight(0xf39c12, 0.5, 1);
    packet.add(packetGlow);
    
    packet.castShadow = true;
    packet.userData = {
        path: path,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
        type: Math.random() < 0.6 ? 'connection' : (Math.random() < 0.6 ? 'file' : 'intrusion')
    };
    
    // Color based on type
    if (packet.userData.type === 'file') {
        packet.material.color.set(0x3498db);
        packet.material.emissive.set(0x1a496d);
        packetGlow.color.set(0x3498db);
    } else if (packet.userData.type === 'intrusion') {
        packet.material.color.set(0xe74c3c);
        packet.material.emissive.set(0x73261e);
        packetGlow.color.set(0xe74c3c);
    }
    
    group.add(packet);
    packets.push(packet);
    return packet;
};

// Create paths for animation
const createRandomEndpointPackets = () => {
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const path = [
        new THREE.Vector3(randomEndpoint.position.x, randomEndpoint.position.y + 0.5, randomEndpoint.position.z),
        new THREE.Vector3(ftd.position.x, ftd.position.y, ftd.position.z),
        new THREE.Vector3(fmc.position.x, fmc.position.y, fmc.position.z),
        new THREE.Vector3(splunk.position.x, splunk.position.y, splunk.position.z)
    ];
    createDataPacket(new THREE.Vector3(path[0].x, path[0].y, path[0].z), path);
};

// Create initial packets
for (let i = 0; i < 8; i++) {
    createRandomEndpointPackets();
}

// Add stars/particles to the background for a more cinematic look
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8
});

const starsVertices = [];
for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    starsVertices.push(x, y, z);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Orbit controls setup
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = 0.005;
let autoRotate = true;

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    autoRotate = false;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };
    
    group.rotation.y += deltaMove.x * rotationSpeed;
    group.rotation.x += deltaMove.y * rotationSpeed;
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('wheel', (e) => {
    const zoomSpeed = 0.1;
    camera.position.z += e.deltaY * zoomSpeed;
    // Keep camera in reasonable bounds
    camera.position.z = Math.max(10, Math.min(50, camera.position.z));
});

// Add key controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        autoRotate = !autoRotate;
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop with more dynamic elements
const animate = () => {
    requestAnimationFrame(animate);
    
    // Auto-rotate if enabled
    if (autoRotate) {
        group.rotation.y += 0.002;
    }
    
    // Animate stars slowly rotating
    stars.rotation.y += 0.0001;
    stars.rotation.z += 0.0001;
    
    // Animate server LEDs blinking in FMC and Splunk
    fmc.traverse(obj => {
        if (obj.userData && obj.userData.blinkRate) {
            if (obj.material && obj.material.emissive) {
                // Random blinking effect
                if (Math.random() > 0.97) {
                    obj.material.emissive.set(Math.random() > 0.5 ? 0x00ff00 : 0xff0000);
                }
            }
        }
    });
    
    splunk.traverse(obj => {
        if (obj.userData && obj.userData.blinkRate) {
            if (obj.material && obj.material.emissive) {
                // Random blinking effect
                if (Math.random() > 0.95) {
                    obj.material.emissive.set(Math.random() > 0.7 ? 0x00ff00 : 0xff0000);
                }
            }
        }
    });
    
    // Animate data packets
    for (let i = packets.length - 1; i >= 0; i--) {
        const packet = packets[i];
        const { path, progress, speed, type } = packet.userData;
        
        if (progress < 1) {
            const currentPathIndex = Math.min(Math.floor(progress * (path.length - 1)), path.length - 2);
            const pathProgress = (progress * (path.length - 1)) % 1;
            
            const start = path[currentPathIndex];
            const end = path[currentPathIndex + 1];
            
            packet.position.lerpVectors(start, end, pathProgress);
            packet.userData.progress += speed;
            
            // Pulse effect
            const pulseFactor = 1 + 0.2 * Math.sin(Date.now() * 0.01);
            packet.scale.set(pulseFactor, pulseFactor, pulseFactor);
        } else {
            group.remove(packet);
            packets.splice(i, 1);
            
            if (Math.random() < 0.8) {
                createRandomEndpointPackets();
            }
        }
    }
    
    if (Math.random() < 0.05 && packets.length < 25) {
        createRandomEndpointPackets();
    }
    
    renderer.render(scene, camera);
};

// Hide loading screen and start animation
document.getElementById('loading').style.display = 'none';
animate(); 