import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const CiscoFTDVisualization = () => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    mountRef.current.appendChild(renderer.domElement);

    // Create our own orbit controls since we don't have the OrbitControls import
    // This is a simplified version of Three.js OrbitControls
    const setupOrbitControls = (camera, domElement) => {
      const controls = {
        enabled: true,
        target: new THREE.Vector3(),
        minDistance: 0,
        maxDistance: Infinity,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        enableDamping: true,
        dampingFactor: 0.05,
        rotateSpeed: 1.0,
        zoomSpeed: 1.0,
        
        // State
        spherical: new THREE.Spherical(),
        sphericalDelta: new THREE.Spherical(),
        scale: 1,
        target0: new THREE.Vector3(),
        position0: camera.position.clone(),
        zoom0: camera.zoom,
        
        // Methods
        update: function() {
          const offset = new THREE.Vector3();
          
          // Get camera position relative to target
          offset.copy(camera.position).sub(this.target);
          
          // Convert to spherical coordinates
          this.spherical.setFromVector3(offset);
          
          // Apply rotation from mouse movement
          this.spherical.theta += this.sphericalDelta.theta;
          this.spherical.phi += this.sphericalDelta.phi;
          
          // Restrict phi to avoid going over the top/bottom
          this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
          
          // Restrict radius within bounds
          this.spherical.radius *= this.scale;
          this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
          
          // Move target to panned location
          this.target.add(this.panOffset);
          
          // Convert back to Cartesian coordinates
          offset.setFromSpherical(this.spherical);
          
          // Position camera based on offset from target
          camera.position.copy(this.target).add(offset);
          camera.lookAt(this.target);
          
          // Apply damping
          if (this.enableDamping) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);
            this.scale = 1;
          } else {
            this.sphericalDelta.set(0, 0, 0);
            this.scale = 1;
          }
          
          this.panOffset.set(0, 0, 0);
          
          return false;
        },
        
        // Handlers
        panOffset: new THREE.Vector3(),
        
        handleMouseDownRotate: function(event) {
          this.rotateStart = {
            x: event.clientX,
            y: event.clientY
          };
        },
        
        handleMouseMoveRotate: function(event) {
          if (!this.rotateStart) return;
          
          const element = domElement;
          
          this.rotateEnd = {
            x: event.clientX,
            y: event.clientY
          };
          
          this.rotateDelta = {
            x: (this.rotateEnd.x - this.rotateStart.x) * this.rotateSpeed,
            y: (this.rotateEnd.y - this.rotateStart.y) * this.rotateSpeed
          };
          
          // Rotating across whole screen goes 360 degrees around
          const elementWidth = element.clientWidth || element.offsetWidth;
          this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / elementWidth;
          
          // Rotating up and down along whole screen attempts to go 360, but limited to 180
          const elementHeight = element.clientHeight || element.offsetHeight;
          this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / elementHeight;
          
          this.rotateStart = this.rotateEnd;
        },
        
        handleMouseWheel: function(event) {
          const delta = event.deltaY;
          
          if (delta > 0) {
            this.scale /= Math.pow(0.95, this.zoomSpeed);
          } else if (delta < 0) {
            this.scale *= Math.pow(0.95, this.zoomSpeed);
          }
        }
      };
      
      // Event listeners
      const onMouseDown = function(event) {
        if (!controls.enabled) return;
        
        event.preventDefault();
        
        if (event.button === 0) {
          controls.handleMouseDownRotate(event);
        }
        
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
      };
      
      const onMouseMove = function(event) {
        if (!controls.enabled) return;
        
        event.preventDefault();
        controls.handleMouseMoveRotate(event);
      };
      
      const onMouseUp = function() {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
      };
      
      const onMouseWheel = function(event) {
        if (!controls.enabled || !event) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        controls.handleMouseWheel(event);
      };
      
      domElement.addEventListener('mousedown', onMouseDown, false);
      domElement.addEventListener('wheel', onMouseWheel, false);
      
      // Clean up function to remove event listeners
      controls.dispose = function() {
        domElement.removeEventListener('mousedown', onMouseDown, false);
        domElement.removeEventListener('wheel', onMouseWheel, false);
      };
      
      return controls;
    };
    
    // Setup our custom orbit controls
    const controls = setupOrbitControls(camera, renderer.domElement);

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

    // Create a label for FTD
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

    // Add labels
    const ftdLabel = createLabel('Cisco FTD', ftd.position);
    group.add(ftdLabel);

    // FMC (Firewall Management Center)
    const fmcGeometry = new THREE.BoxGeometry(2, 2, 2);
    const fmc = new THREE.Mesh(fmcGeometry, fmcMaterial);
    fmc.position.set(-3, 0, 5);
    group.add(fmc);

    const fmcLabel = createLabel('FMC', fmc.position);
    group.add(fmcLabel);

    // Splunk
    const splunkGeometry = new THREE.BoxGeometry(4, 2, 2);
    const splunk = new THREE.Mesh(splunkGeometry, splunkMaterial);
    splunk.position.set(8, 0, 0);
    group.add(splunk);

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

    // Add some visual elements to the dashboard
    const dashCanvas = document.createElement('canvas');
    dashCanvas.width = 512;
    dashCanvas.height = 256;
    const dashContext = dashCanvas.getContext('2d');
    
    // Draw a dashboard background
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
    
    // Draw some charts and metrics
    // Bar graph
    dashContext.fillStyle = '#6c757d';
    dashContext.fillRect(40, 60, 100, 20);
    dashContext.fillStyle = '#007bff';
    dashContext.fillRect(40, 90, 160, 20);
    dashContext.fillStyle = '#28a745';
    dashContext.fillRect(40, 120, 80, 20);
    dashContext.fillStyle = '#dc3545';
    dashContext.fillRect(40, 150, 200, 20);
    
    // Pie chart (simplified)
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
    
    // Create texture from canvas
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
        { ...randomEndpoint.position },
        { ...ftd.position },
        { ...splunk.position }
      ];
      createDataPacket(new THREE.Vector3(path[0].x, path[0].y, path[0].z), path);
    };

    // Create initial packets
    for (let i = 0; i < 5; i++) {
      createRandomEndpointPackets();
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Animate data packets - modified to avoid array mutation during iteration
      for (let i = packets.length - 1; i >= 0; i--) {
        const packet = packets[i];
        const { path, progress, speed } = packet.userData;
        
        if (progress < 1) {
          const currentPathIndex = Math.min(Math.floor(progress * (path.length - 1)), path.length - 2);
          const pathProgress = (progress * (path.length - 1)) % 1;
          
          const start = new THREE.Vector3(
            path[currentPathIndex].x,
            path[currentPathIndex].y,
            path[currentPathIndex].z
          );
          
          const end = new THREE.Vector3(
            path[currentPathIndex + 1].x,
            path[currentPathIndex + 1].y,
            path[currentPathIndex + 1].z
          );
          
          packet.position.lerpVectors(start, end, pathProgress);
          packet.userData.progress += speed;
        } else {
          // Remove packet when it reaches the end
          group.remove(packet);
          packets.splice(i, 1);
          
          // Create a new packet
          if (Math.random() < 0.3) {
            createRandomEndpointPackets();
          }
        }
      };
      
      // Add new packets occasionally
      if (Math.random() < 0.02 && packets.length < 20) {
        createRandomEndpointPackets();
      }
      
      // Render
      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    // Start animation
    setIsLoading(false);
    animate();
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div 
        ref={mountRef} 
        className="absolute top-0 left-0 w-full h-full" 
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-xl font-semibold">Loading visualization...</div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded shadow-md">
        <h3 className="text-lg font-semibold mb-1">Cisco FTD to Splunk Data Flow</h3>
        <p className="text-sm">
          <span className="inline-block w-3 h-3 bg-gray-700 mr-1"></span> Endpoints
          <span className="inline-block w-3 h-3 bg-red-500 ml-3 mr-1"></span> Cisco FTD
          <span className="inline-block w-3 h-3 bg-blue-500 ml-3 mr-1"></span> FMC
          <span className="inline-block w-3 h-3 bg-green-500 ml-3 mr-1"></span> Splunk
          <span className="inline-block w-3 h-3 bg-yellow-500 ml-3 mr-1"></span> Data Packets
        </p>
        <p className="text-xs mt-1">Drag to rotate | Scroll to zoom</p>
      </div>
    </div>
  );
};

export default CiscoFTDVisualization;
