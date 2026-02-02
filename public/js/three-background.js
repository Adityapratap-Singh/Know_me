// 3D Background Setup using Three.js
// Enhanced with floating artifacts and interactive geometry

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;

    // --- Configuration ---
    const config = {
        particleCount: 120,      // Increased for more density
        connectionDistance: 150, // Longer connections
        mouseDistance: 250,
        particleColor: 0x00fff2, // Neon Cyan
        lineColor: 0xbd00ff,     // Neon Purple
        shapeCount: 20,          // More shapes
        shapeColor: 0x00fff2,     // Neon Cyan
        bloomStrength: 1.5,      // Visual enhancement concept
    };

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Particles & Lines (The Network) ---
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(config.particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < config.particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 1.5;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight * 1.5;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 400;

        particleVelocities.push({
            x: (Math.random() - 0.5) * 0.4,
            y: (Math.random() - 0.5) * 0.4
        });
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: config.particleColor,
        size: 2,
        transparent: true,
        opacity: 0.6
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    const lineMaterial = new THREE.LineBasicMaterial({
        color: config.lineColor,
        transparent: true,
        opacity: 0.15
    });

    const linesGeometry = new THREE.BufferGeometry();
    const lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lines);

    // --- Floating Artifacts (The "More 3D" part) ---
    const shapes = [];
    const shapeGeometries = [
        new THREE.IcosahedronGeometry(10, 0),
        new THREE.OctahedronGeometry(8, 0),
        new THREE.TetrahedronGeometry(8, 0),
        new THREE.TorusGeometry(6, 2, 8, 20)
    ];
    const shapeMaterial = new THREE.MeshBasicMaterial({ 
        color: config.shapeColor, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    for (let i = 0; i < config.shapeCount; i++) {
        const geom = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
        const mesh = new THREE.Mesh(geom, shapeMaterial);
        
        mesh.position.set(
            (Math.random() - 0.5) * window.innerWidth,
            (Math.random() - 0.5) * window.innerHeight,
            (Math.random() - 0.5) * 300
        );
        
        mesh.userData = {
            velX: (Math.random() - 0.5) * 0.3,
            velY: (Math.random() - 0.5) * 0.3,
            rotX: (Math.random() - 0.5) * 0.02,
            rotY: (Math.random() - 0.5) * 0.02
        };

        scene.add(mesh);
        shapes.push(mesh);
    }

    // --- Mouse Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // --- Animation Loop ---
    const animate = () => {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Global rotation
        scene.rotation.y += 0.05 * (targetX - scene.rotation.y);
        scene.rotation.x += 0.05 * (targetY - scene.rotation.x);

        // Update Particles
        const positions = particleSystem.geometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < config.particleCount; i++) {
            positions[i * 3] += particleVelocities[i].x;
            positions[i * 3 + 1] += particleVelocities[i].y;

            // Boundary wrap
            if (Math.abs(positions[i * 3]) > window.innerWidth / 1.5) positions[i * 3] *= -0.9;
            if (Math.abs(positions[i * 3 + 1]) > window.innerHeight / 1.5) positions[i * 3 + 1] *= -0.9;

            // Connections
            for (let j = i + 1; j < config.particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < config.connectionDistance) {
                    linePositions.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                }
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        // Update Shapes
        shapes.forEach((shape, index) => {
            shape.rotation.x += shape.userData.rotX;
            shape.rotation.y += shape.userData.rotY;
            
            shape.position.x += shape.userData.velX;
            shape.position.y += shape.userData.velY;

            // Float interaction
            // If mouse is close, push away slightly
            const dx = shape.position.x - (mouseX * 2); // Approximate world pos
            const dy = shape.position.y - (-mouseY * 2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 300) {
                shape.position.x += dx * 0.001;
                shape.position.y += dy * 0.001;
            }

            // Pulse effect
            const time = Date.now() * 0.001;
            const pulse = 1 + Math.sin(time + index) * 0.1;
            shape.scale.setScalar(pulse);

            // Boundary wrap for shapes
            if (Math.abs(shape.position.x) > window.innerWidth / 1.5) shape.userData.velX *= -1;
            if (Math.abs(shape.position.y) > window.innerHeight / 1.5) shape.userData.velY *= -1;
        });

        renderer.render(scene, camera);
    };

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});
