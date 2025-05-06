import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// Helper grid
const gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0x888888);
scene.add(gridHelper);

// Create a group for all objects
const group = new THREE.Group();
scene.add(group);

// Device Materials
const endpointMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
const ftdMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
const fmcMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
const splunkMaterial = new THREE.MeshPhongMaterial({ color: 0x1abc9c });
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
const dataPacketMaterial = new THREE.MeshPhongMaterial({ color: 0xf39c12 });

// Create a label function
const createLabel = (text, position, size = 1) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = '24px Arial';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.position.y += 1.5;
    sprite.scale.set(size * 4, size * 2, 1);
    
    return sprite;
};

// Endpoint Workstations (multiple)
const endpoints = [];
const endpointPositions = [
    { x: -10, y: 0, z: -8 },
    { x: -8, y: 0, z: -10 },
    { x: -12, y: 0, z: -10 },
    { x: -14, y: 0, z: -8 },
];

endpointPositions.forEach((pos) => {
    const endpointGeometry = new THREE.BoxGeometry(1, 0.5, 1);
    const endpoint = new THREE.Mesh(endpointGeometry, endpointMaterial);
    endpoint.position.set(pos.x, pos.y, pos.z);
    group.add(endpoint);
    endpoints.push(endpoint);

    // Add screen to workstation
    const screenGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const screenMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 0.5, 0);
    endpoint.add(screen);
});

// FTD Device
const ftdGeometry = new THREE.BoxGeometry(3, 1, 2);
const ftd = new THREE.Mesh(ftdGeometry, ftdMaterial);
ftd.position.set(-3, 0, 0);
group.add(ftd);

// Add FTD label
const ftdLabel = createLabel('Cisco FTD', ftd.position);
group.add(ftdLabel);

// FMC (Firewall Management Center)
const fmcGeometry = new THREE.BoxGeometry(2, 2, 2);
const fmc = new THREE.Mesh(fmcGeometry, fmcMaterial);
fmc.position.set(-3, 0, 5);
group.add(fmc);

// Add FMC label
const fmcLabel = createLabel('FMC', fmc.position);
group.add(fmcLabel);

// Splunk
const splunkGeometry = new THREE.BoxGeometry(4, 2, 2);
const splunk = new THREE.Mesh(splunkGeometry, splunkMaterial);
splunk.position.set(8, 0, 0);
group.add(splunk);

// Add Splunk label
const splunkLabel = createLabel('Splunk', splunk.position);
group.add(splunkLabel);

// Analytics Dashboard (above Splunk)
const dashboardGeometry = new THREE.PlaneGeometry(6, 3);
const dashboardMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    side: THREE.DoubleSide
});
const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
dashboard.position.set(8, 4, 0);
dashboard.rotation.x = -Math.PI / 4;
group.add(dashboard);

// Create dashboard texture
const dashCanvas = document.createElement('canvas');
dashCanvas.width = 512;
dashCanvas.height = 256;
const dashContext = dashCanvas.getContext('2d');

// Draw dashboard background
dashContext.fillStyle = '#f8f9fa';
dashContext.fillRect(0, 0, dashCanvas.width, dashCanvas.height);

// Draw header
dashContext.fillStyle = '#343a40';
dashContext.fillRect(0, 0, dashCanvas.width, 40);

// Draw header text
dashContext.font = '24px Arial';
dashContext.fillStyle = 'white';
dashContext.textAlign = 'center';
dashContext.fillText('Cisco FTD Security Dashboard', dashCanvas.width / 2, 28);

// Draw charts and metrics
// Bar graph
dashContext.fillStyle = '#6c757d';
dashContext.fillRect(40, 60, 100, 20);
dashContext.fillStyle = '#007bff';
dashContext.fillRect(40, 90, 160, 20);
dashContext.fillStyle = '#28a745';
dashContext.fillRect(40, 120, 80, 20);
dashContext.fillStyle = '#dc3545';
dashContext.fillRect(40, 150, 200, 20);

// Pie chart
dashContext.beginPath();
dashContext.arc(350, 120, 60, 0, Math.PI * 2);
dashContext.fillStyle = '#f8f9fa';
dashContext.fill();
dashContext.stroke();

dashContext.beginPath();
dashContext.moveTo(350, 120);
dashContext.arc(350, 120, 60, 0, Math.PI * 0.7);
dashContext.fillStyle = '#007bff';
dashContext.fill();

dashContext.beginPath();
dashContext.moveTo(350, 120);
dashContext.arc(350, 120, 60, Math.PI * 0.7, Math.PI * 1.5);
dashContext.fillStyle = '#28a745';
dashContext.fill();

dashContext.beginPath();
dashContext.moveTo(350, 120);
dashContext.arc(350, 120, 60, Math.PI * 1.5, Math.PI * 2);
dashContext.fillStyle = '#dc3545';
dashContext.fill();

// Apply dashboard texture
const dashboardTexture = new THREE.CanvasTexture(dashCanvas);
dashboard.material.map = dashboardTexture;
dashboard.material.needsUpdate = true;

// Connect endpoints to FTD with lines
endpoints.forEach((endpoint) => {
    const points = [
        new THREE.Vector3(endpoint.position.x, endpoint.position.y, endpoint.position.z),
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

// Connect FTD to Splunk
const ftdToSplunkPoints = [
    new THREE.Vector3(ftd.position.x, ftd.position.y, ftd.position.z),
    new THREE.Vector3(splunk.position.x, splunk.position.y, splunk.position.z)
];
const ftdToSplunkGeometry = new THREE.BufferGeometry().setFromPoints(ftdToSplunkPoints);
const ftdToSplunkLine = new THREE.Line(ftdToSplunkGeometry, lineMaterial);
group.add(ftdToSplunkLine);

// Connect Splunk to Dashboard
const splunkToDashPoints = [
    new THREE.Vector3(splunk.position.x, splunk.position.y + 1, splunk.position.z),
    new THREE.Vector3(dashboard.position.x, dashboard.position.y - 1.5, dashboard.position.z)
];
const splunkToDashGeometry = new THREE.BufferGeometry().setFromPoints(splunkToDashPoints);
const splunkToDashLine = new THREE.Line(splunkToDashGeometry, lineMaterial);
group.add(splunkToDashLine);

// Create data packets for animation
const packets = [];

const createDataPacket = (startPosition, path) => {
    const packetGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const packet = new THREE.Mesh(packetGeometry, dataPacketMaterial);
    packet.position.copy(startPosition);
    packet.userData = {
        path: path,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01
    };
    group.add(packet);
    packets.push(packet);
    return packet;
};

// Create paths for animation
const createRandomEndpointPackets = () => {
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const path = [
        new THREE.Vector3(randomEndpoint.position.x, randomEndpoint.position.y, randomEndpoint.position.z),
        new THREE.Vector3(ftd.position.x, ftd.position.y, ftd.position.z),
        new THREE.Vector3(splunk.position.x, splunk.position.y, splunk.position.z)
    ];
    createDataPacket(new THREE.Vector3(path[0].x, path[0].y, path[0].z), path);
};

// Create initial packets
for (let i = 0; i < 5; i++) {
    createRandomEndpointPackets();
}

// Orbit controls setup
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = 0.01;

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
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
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);
    
    // Animate data packets
    for (let i = packets.length - 1; i >= 0; i--) {
        const packet = packets[i];
        const { path, progress, speed } = packet.userData;
        
        if (progress < 1) {
            const currentPathIndex = Math.min(Math.floor(progress * (path.length - 1)), path.length - 2);
            const pathProgress = (progress * (path.length - 1)) % 1;
            
            const start = path[currentPathIndex];
            const end = path[currentPathIndex + 1];
            
            packet.position.lerpVectors(start, end, pathProgress);
            packet.userData.progress += speed;
        } else {
            group.remove(packet);
            packets.splice(i, 1);
            
            if (Math.random() < 0.3) {
                createRandomEndpointPackets();
            }
        }
    }
    
    if (Math.random() < 0.02 && packets.length < 20) {
        createRandomEndpointPackets();
    }
    
    renderer.render(scene, camera);
};

// Hide loading screen and start animation
document.getElementById('loading').style.display = 'none';
animate(); 