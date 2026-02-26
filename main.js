import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Tab Logic ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and target content
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// --- Three.js 3D Viewer ---
const container = document.getElementById('zeolite-3d-viewer');
if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create a simple Zeolite-like lattice (Sodalite cage)
    const latticeGroup = new THREE.Group();
    const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const materialAl = new THREE.MeshPhongMaterial({ color: 0xff4d4d, shininess: 100 }); // Red for Al/Si
    const materialO = new THREE.MeshPhongMaterial({ color: 0x4da6ff, shininess: 80 });   // Blue for Oxygen

    // Simplified lattice points (cube representation for demo)
    const points = [];
    const size = 1.5;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                if (Math.abs(x) + Math.abs(y) + Math.abs(z) <= 2) {
                    const sphere = new THREE.Mesh(sphereGeometry, materialAl);
                    sphere.position.set(x * size, y * size, z * size);
                    latticeGroup.add(sphere);
                    points.push(sphere.position.clone());
                }
            }
        }
    }

    // Add "Oxygen" connections (sticks)
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const dist = points[i].distanceTo(points[j]);
            if (dist < size * 1.5 && dist > size * 0.5) {
                const direction = new THREE.Vector3().subVectors(points[j], points[i]);
                const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, dist, 8);
                const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
                
                // Position and orient cylinder
                const midpoint = new THREE.Vector3().addVectors(points[i], points[j]).multiplyScalar(0.5);
                cylinder.position.copy(midpoint);
                cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
                latticeGroup.add(cylinder);
            }
        }
    }

    scene.add(latticeGroup);
    camera.position.z = 8;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        latticeGroup.rotation.y += 0.005;
        latticeGroup.rotation.x += 0.003;
        controls.update();
        renderer.render(scene, camera);
    }

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    animate();
}
