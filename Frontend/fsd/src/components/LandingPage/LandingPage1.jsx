import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Trail } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { useNavigate } from 'react-router-dom';

// Icons
import { 
  ArrowRightIcon,
  CheckCircleIcon,
  GlobeIcon,
  BriefcaseIcon,
  User,
  Lightbulb,
  ChartBarIcon
} from 'lucide-react';

// Define colors palette
const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#60a5fa',
  accent: '#7c3aed',
  accentLight: '#a78bfa',
  background: '#050A15',
  backgroundLight: '#0A1428',
  text: '#f8fafc',
  muted: '#94a3b8'
};

// City data with coordinates and testimonials
const cities = [
  { 
    name: "New York", 
    lat: 40.7128, 
    lng: -74.0060,
    testimonial: {
      quote: "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: "Sarah Chen",
      designation: "Product Manager at TechFlow",
      avatar: "/avatar-1.jpg"
    }
  },
  { 
    name: "London", 
    lat: 51.5072, 
    lng: -0.1276,
    testimonial: {
      quote: "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Michael Rodriguez",
      designation: "CTO at InnovateSphere",
      avatar: "/avatar-2.jpg"
    }
  },
  { 
    name: "Tokyo", 
    lat: 35.6895, 
    lng: 139.6917,
    testimonial: {
      quote: "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Emily Watson",
      designation: "Operations Director at CloudScale",
      avatar: "/avatar-3.jpg"
    }
  },
  { 
    name: "Sydney", 
    lat: -33.8688, 
    lng: 151.2093,
    testimonial: {
      quote: "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "James Kim",
      designation: "Engineering Lead at DataPro",
      avatar: "/avatar-4.jpg"
    }
  },
  { 
    name: "Delhi", 
    lat: 28.6139, 
    lng: 77.2090,
    testimonial: {
      quote: "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
      name: "Lisa Thompson",
      designation: "VP of Technology at FutureNet",
      avatar: "/avatar-5.jpg"
    }
  },
  { 
    name: "Los Angeles", 
    lat: 34.0522, 
    lng: -118.2437,
    testimonial: {
      quote: "The global reach of this platform has allowed us to find talent we never would have discovered otherwise.",
      name: "David Park",
      designation: "Collaboration Director at CreativeMinds",
      avatar: "/avatar-6.jpg"
    }
  },
  { 
    name: "Rio", 
    lat: -22.9068, 
    lng: -43.1729,
    testimonial: {
      quote: "The AI matching algorithm provided us with candidates who were perfect cultural fits for our team.",
      name: "Ana Oliveira",
      designation: "HR Manager at TechSolutions",
      avatar: "/avatar-7.jpg"
    }
  },
  { 
    name: "Cape Town", 
    lat: -33.9249, 
    lng: 18.4241,
    testimonial: {
      quote: "We've reduced our hiring time by 40% since implementing this platform. The quality of matches is outstanding.",
      name: "Thabo Nkosi",
      designation: "Talent Acquisition Lead at AfriTech",
      avatar: "/avatar-8.jpg"
    }
  },
  // Additional cities
  { 
    name: "Paris", 
    lat: 48.8566, 
    lng: 2.3522,
    testimonial: {
      quote: "The platform's AI-driven insights have revolutionized our hiring process.",
      name: "Claire Dubois",
      designation: "HR Specialist at InnovateHR",
      avatar: "/avatar-9.jpg"
    }
  },
  { 
    name: "Berlin", 
    lat: 52.52, 
    lng: 13.405,
    testimonial: {
      quote: "The user-friendly interface and powerful features make this platform a must-have.",
      name: "Hans Müller",
      designation: "Collaboration Manager at TechBridge",
      avatar: "/avatar-10.jpg"
    }
  },
  { 
    name: "Moscow", 
    lat: 55.7558, 
    lng: 37.6173,
    testimonial: {
      quote: "The platform's global reach has been instrumental in finding top talent.",
      name: "Olga Ivanova",
      designation: "Talent Acquisition Lead at GlobalTech",
      avatar: "/avatar-11.jpg"
    }
  },
  { 
    name: "Beijing", 
    lat: 39.9042, 
    lng: 116.4074,
    testimonial: {
      quote: "The advanced analytics and insights have helped us make data-driven decisions.",
      name: "Li Wei",
      designation: "HR Director at FutureVision",
      avatar: "/avatar-12.jpg"
    }
  },
  { 
    name: "Singapore", 
    lat: 1.3521, 
    lng: 103.8198,
    testimonial: {
      quote: "The platform's seamless integration with our existing tools is a game-changer.",
      name: "Amar Singh",
      designation: "Operations Manager at TalentFlow",
      avatar: "/avatar-13.jpg"
    }
  },
  { 
    name: "Dubai", 
    lat: 25.276987, 
    lng: 55.296249,
    testimonial: {
      quote: "The platform's innovative features have streamlined our Collaboration process.",
      name: "Aisha Al-Farsi",
      designation: "HR Manager at GulfRecruit",
      avatar: "/avatar-14.jpg"
    }
  },
];

// Features for the platform
const features = [
  {
    icon: <GlobeIcon className="w-6 h-6" />,
    title: "Global Student Network",
    description: "Connect with students from around the world to collaborate, learn, and grow together."
  },
  {
    icon: <BriefcaseIcon className="w-6 h-6" />,
    title: "Expert Mentorship",
    description: "Access guidance from experienced mentors to help you excel in your academic and professional journey."
  },
  {
    icon: <User className="w-6 h-6" />,
    title: "Collaborative Learning",
    description: "Work with peers and mentors on projects, challenges, and competitions to enhance your skills."
  },
  {
    icon: <ChartBarIcon className="w-6 h-6" />,
    title: "Competition Insights",
    description: "Participate in global competitions and track your progress with detailed analytics and feedback."
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Skill Development",
    description: "Enhance your skills through curated challenges and competitions tailored to your interests."
  }
];

// Stats for impact section
const stats = [
  { value: "500K+", label: "Students" },
  { value: "10K+", label: "Mentors" },
  { value: "1,200+", label: "Competitions" },
  { value: "95%", label: "Success Rate" }
];

// Utility function to convert latitude and longitude to 3D coordinates
const latLngToVector3 = (lat, lng, r = 5) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const position = new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );

  return position;
};

// Enhanced line creation function with improved visual effects
const createAnimatedLine = (start, end, color = '#38bdf8') => {
  // Calculate direction vectors
  const startNormal = start.clone().normalize();
  const endNormal = end.clone().normalize();
  
  // Calculate midpoint that arcs outward from the sphere
  const midDirection = new THREE.Vector3()
    .addVectors(startNormal, endNormal)
    .normalize();
  const arcHeight = 5 * 0.8; // Higher arc for more dramatic effect
  const midPoint = midDirection.multiplyScalar(5 + arcHeight);

  // Create curve through the three points
  const curve = new THREE.CubicBezierCurve3(
    start,
    start.clone().lerp(midPoint, 0.6), // More curve near the start
    end.clone().lerp(midPoint, 0.6), // More curve near the end
    end
  );

  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // Add UV coordinates
  const uvs = new Float32Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    uvs[i * 2] = i / (points.length - 1); // U from 0 to 1 along the line
    uvs[i * 2 + 1] = 0; // V coordinate (not used)
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  // Enhanced shader material with stronger glow and improved animation
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        float progress1 = fract(time * 1.2); 
        float progress2 = fract(time * 1.2 + 0.4); 
        float pulseWidth = 0.3;
        
        float front1 = smoothstep(progress1 - pulseWidth, progress1, vUv.x);
        float trail1 = smoothstep(progress1 - pulseWidth - 0.1, progress1 - 0.1, vUv.x);
        float alpha1 = (front1 - trail1) * 1.0;
        
        float front2 = smoothstep(progress2 - pulseWidth, progress2, vUv.x);
        float trail2 = smoothstep(progress2 - pulseWidth - 0.1, progress2 - 0.1, vUv.x);
        float alpha2 = (front2 - trail2) * 0.8;
        
        float baseAlpha = 0.5; // Increased base alpha for better visibility
        
        float finalAlpha = max(alpha1, alpha2) + baseAlpha;
        
        gl_FragColor = vec4(color * 0.8, finalAlpha); // Darker color by reducing brightness
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const line = new THREE.Line(geometry, material);
  line.scale.set(1.05, 1.05, 1.05);

  return line;
};

// Enhanced Globe component with improved visuals
const Globe = ({ onCitySelect }) => {
  const { scene, camera, gl } = useThree();
  const groupRef = useRef();
  const linesRef = useRef([]);
  const cityMeshes = useRef([]);
  const starfieldRef = useRef(null);
  const cloudRef = useRef(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  // Memoize this function to prevent unnecessary recalculations
  const latLngToVector3 = useCallback((lat, lng, r = 5) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
  
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }, []);

  // Create improved starfield with depth and varied sizes
  const createStarfield = (count, radius) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * radius * 2;
      const y = (Math.random() - 0.5) * radius * 2;
      const z = (Math.random() - 0.5) * radius * 2;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Varied star sizes for more visual interest
      sizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        pointSize: { value: 6.0 },
        time: { value: 0.0 }
      },
      vertexShader: `
        attribute float size;
        uniform float time;
        uniform float pointSize;
        varying float vSize;
        
        void main() {
          vSize = size;
          // Small randomized movement
          vec3 pos = position;
          pos.x += sin(time * 0.2 + position.z * 5.0) * 0.05 * size;
          pos.y += cos(time * 0.2 + position.x * 5.0) * 0.05 * size;
          pos.z += sin(time * 0.2 + position.y * 5.0) * 0.05 * size;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = pointSize * size * (600.0 / length(gl_Position.xyz));
        }
      `,
      fragmentShader: `
        varying float vSize;
        
        void main() {
          // Create circular points with soft edges
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
          
          // Brighter centers for realistic star appearance
          float intensity = 1.0 - smoothstep(0.0, 0.4, dist);
          vec3 color = mix(vec3(1.0), vec3(0.8, 0.85, 1.0), vSize);
          
          gl_FragColor = vec4(color, alpha * (0.6 + 0.4 * vSize));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
  };

  // Setup scene with improved globe and effects
  useEffect(() => {
    const globeGroup = new THREE.Group();
    const loader = new THREE.TextureLoader();
  
    // Add multi-layered bloom effect for enhanced glow
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(5 + 0.15, 64, 64),
      new THREE.MeshBasicMaterial({
        color: colors.secondary,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide
      })
    );
    
    const atmosphereOuter = new THREE.Mesh(
      new THREE.SphereGeometry(5 + 0.3, 64, 64),
      new THREE.MeshBasicMaterial({
        color: colors.accent,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide
      })
    );
    
    globeGroup.add(atmosphere);
    globeGroup.add(atmosphereOuter);
  
    // Load textures
    const dayTexture = loader.load("/textures/earth.jpg");
    const nightTexture = loader.load("/textures/earth_night.jpg");
    const bumpTexture = loader.load("/textures/earth_bump.jpg"); // Optional: Add bump texture if available
    
    // Create custom shader material for day/night cycle
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        bumpTexture: { value: bumpTexture },
        bumpScale: { value: 0.15 },
        lightDirection: { value: new THREE.Vector3(10, 10, 5).normalize() },
        specularColor: { value: new THREE.Color('#222222') },
        shininess: { value: 10.0 },
        ambientLight: { value: 0.1 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform sampler2D bumpTexture;
        uniform float bumpScale;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 lightDirection;
        uniform vec3 specularColor;
        uniform float shininess;
        uniform float ambientLight;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          // Calculate light intensity based on normal and light direction
          float lightIntensity = max(dot(vNormal, normalize(lightDirection)), 0.0);
          
          // Add specular highlight
          vec3 halfVector = normalize(normalize(lightDirection) + vec3(0.0, 0.0, 1.0));
          float specular = pow(max(dot(vNormal, halfVector), 0.0), shininess);
          vec3 specularHighlight = specularColor * specular;
          
          // Sample day and night textures
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // Blend between day and night based on light intensity
          // Smooth transition with a blend range
          float blendRange = 0.2;
          float blendCenter = 0.1;
          float blendFactor = smoothstep(blendCenter - blendRange, blendCenter + blendRange, lightIntensity);
          
          // Final color combines day/night and adds specular highlight
          vec3 finalColor = mix(nightColor.rgb, dayColor.rgb, blendFactor);
          
          // Add specular highlight and ambient light to final color
          finalColor = finalColor * (lightIntensity + ambientLight) + specularHighlight;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
    
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(5, 64, 64),
      earthMaterial
    );
    
    globeGroup.add(earthMesh);
    
    // Update light direction in shader when directional light changes
    const updateLightDirection = () => {
      if (earthMaterial && earthMaterial.uniforms) {
        earthMaterial.uniforms.lightDirection.value.copy(directionalLight.position).normalize();
      }
    };
    
    // Add subtle cloud layer with animation
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("/clouds.png", () => {}, () => {}),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    
    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(5.05, 64, 64),
      cloudsMaterial
    );
    
    globeGroup.add(cloudsMesh);
    cloudRef.current = cloudsMesh;

    // City markers with enhanced interactive capability
    cities.forEach((city, index) => {
      const position = latLngToVector3(city.lat, city.lng);

      // Larger hit area for interaction but invisible
      const hitGeom = new THREE.SphereGeometry(0.3, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({
        color: colors.primary,
        transparent: true,
        opacity: 0.01,
      });
      const hitArea = new THREE.Mesh(hitGeom, hitMat);
      hitArea.position.copy(position);
      hitArea.userData = { cityIndex: index };

      // Improved visible dot with glow effect
      const dotGeom = new THREE.SphereGeometry(0.12, 32, 32);
      const dotMat = new THREE.MeshStandardMaterial({
        color: colors.text,
        emissive: colors.accentLight,
        emissiveIntensity: 1.5,
        metalness: 0.9,
        roughness: 0.1,
      });
      const dot = new THREE.Mesh(dotGeom, dotMat);
      dot.position.copy(position);

      // Animated pulsing ring
      const ringGeom = new THREE.RingGeometry(0.15, 0.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colors.accent,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(position);
      ring.lookAt(0, 0, 0);

      globeGroup.add(hitArea);
      globeGroup.add(dot);
      globeGroup.add(ring);

      cityMeshes.current.push({ dot, ring, hitArea, position });
    });

    // Enhanced connections between cities with more variety and direction
    const connections = new Map();
    const maxConnectionsPerCity = 4;
    
    // Fixed connections for important cities to ensure good coverage
    const keyConnections = [
      [0, 1], [0, 6], [1, 8], [2, 11], [3, 7], [4, 10], 
      [5, 0], [8, 9], [11, 12], [12, 13], [13, 4]
    ];
    
    // Add key connections first
    keyConnections.forEach(([i, j]) => {
      const start = latLngToVector3(cities[i].lat, cities[i].lng);
      const end = latLngToVector3(cities[j].lat, cities[j].lng);
      
      const colorIndex = Math.floor(Math.random() * 3);
      const colors = ['#38bdf8', '#818cf8', '#60a5fa'];
      
      const line = createAnimatedLine(start, end, colors[colorIndex]);
      globeGroup.add(line);
      linesRef.current.push(line);
      
      // Update connection counts
      connections.set(i, (connections.get(i) || 0) + 1);
      connections.set(j, (connections.get(j) || 0) + 1);
    });
    
    // Then add random connections to fill gaps
    cities.forEach((a, i) => {
      if ((connections.get(i) || 0) >= maxConnectionsPerCity) return;
      
      const potentialConnections = [];
      
      cities.forEach((b, j) => {
        if (i === j) return;
        if ((connections.get(j) || 0) >= maxConnectionsPerCity) return;
        
        // Check if this connection already exists
        if (keyConnections.some(([x, y]) => (x === i && y === j) || (x === j && y === i))) return;
        
        potentialConnections.push(j);
      });
      
      if (potentialConnections.length > 0) {
        const randomIdx = Math.floor(Math.random() * potentialConnections.length);
        const j = potentialConnections[randomIdx];
        
        const start = latLngToVector3(cities[i].lat, cities[i].lng);
        const end = latLngToVector3(cities[j].lat, cities[j].lng);
        
        const colorIndex = Math.floor(Math.random() * 3);
        const colors = ['#38bdf8', '#818cf8', '#60a5fa'];
        
        const line = createAnimatedLine(start, end, colors[colorIndex]);
        globeGroup.add(line);
        linesRef.current.push(line);
        
        connections.set(i, (connections.get(i) || 0) + 1);
        connections.set(j, (connections.get(j) || 0) + 1);
      }
    });
    
    scene.add(globeGroup);
    groupRef.current = globeGroup;

    // Create enhanced starfield with depth
    const starfield = createStarfield(2000, 80);
    scene.add(starfield);
    starfieldRef.current = starfield;

    const directionalLight = new THREE.DirectionalLight(colors.primary, 2.5); // Stronger light intensity
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true; // Enable shadows for better contrast
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;

    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(colors.backgroundLight, 0.05); // Reduce ambient light for darker shadows
    scene.add(ambientLight);

    return () => {
      scene.remove(globeGroup);
      scene.remove(starfield);
    };
  }, [scene, camera, onCitySelect, latLngToVector3]);
  
  // Handle interactive city selection
  const handleClick = useCallback((event) => {
    event.stopPropagation();
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);

    const hitAreas = cityMeshes.current.map(mesh => mesh.hitArea);
    const intersects = raycaster.current.intersectObjects(hitAreas);

    if (intersects.length > 0) {
      const cityIndex = intersects[0].object.userData.cityIndex;
      onCitySelect(cities[cityIndex]);
    }
  }, [camera, gl, onCitySelect]);

  // Setup click event listener
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);
    
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [gl, handleClick]);

  // Handle hover effects
  const [hoveredCity, setHoveredCity] = useState(null);
  
  const handlePointerMove = useCallback((event) => {
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    
    raycaster.current.setFromCamera(mouse.current, camera);
    
    const hitAreas = cityMeshes.current.map(mesh => mesh.hitArea);
    const intersects = raycaster.current.intersectObjects(hitAreas);
    
    if (intersects.length > 0) {
      const cityIndex = intersects[0].object.userData.cityIndex;
      if (hoveredCity !== cityIndex) {
        document.body.style.cursor = 'pointer';
        setHoveredCity(cityIndex);
      }
    } else if (hoveredCity !== null) {
      document.body.style.cursor = 'default';
      setHoveredCity(null);
    }
  }, [camera, gl, hoveredCity]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      document.body.style.cursor = 'default';
    };
  }, [gl, handlePointerMove]);

  // Animation loop with enhanced effects
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    
    // Animate the connection lines with improved timing
    linesRef.current.forEach((line, index) => {
      // Offset each line's animation differently for more visual variety
      const offset = index * 0.1;
      line.material.uniforms.time.value = (elapsedTime * 0.2 + offset) % 1.0;
    });
    
    // Twinkling effect for stars with improved variation
    if (starfieldRef.current) {
      starfieldRef.current.material.uniforms.time.value = elapsedTime;
    }
    
    // Rotate clouds for subtle atmospheric movement
    if (cloudRef.current) {
      cloudRef.current.rotation.y = elapsedTime * 0.02;
    }
    
    // Pulse effect for city indicators
    cityMeshes.current.forEach((city, index) => {
      const isHovered = index === hoveredCity;
      
      // Enhanced pulsing animation for dots
      const scale = 1 + 0.2 * Math.sin(elapsedTime * 2 + index);
      city.ring.scale.set(scale, scale, 1);
      
      // Highlight hovered city
      if (isHovered) {
        city.dot.scale.set(1.5, 1.5, 1.5);
        city.ring.material.opacity = 0.9;
        city.ring.material.color.set(colors.accentLight);
      } else {
        city.dot.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        city.ring.material.opacity = 0.6 + 0.2 * Math.sin(elapsedTime * 2 + index);
        city.ring.material.color.set(colors.accent);
      }
    });
  });

  return null;
};

// Main LandingPage component
const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);
  const [activeTab, setActiveTab] = useState('individual');
  const [scrolled, setScrolled] = useState(false);
  
  const handleCitySelect = useCallback((city) => {
    setSelectedCity(city);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#030718] via-[#0A1428] to-[#0F2E6B] min-h-screen">
      {/* Enhanced fixed header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled 
            ? "py-2 bg-[#030718]/90 backdrop-blur-lg shadow-lg" 
            : "py-4 bg-transparent"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <GlobeIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
                TalentNexus
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-blue-100 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-blue-100 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-blue-100 hover:text-white transition-colors">Pricing</a>
              <button onClick={() => navigate('/contact')} className="text-sm text-blue-100 hover:text-white transition-colors">Contact</button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/login')} className="hidden md:block px-4 py-2 text-sm text-blue-100 hover:text-white border border-blue-400/30 rounded-lg hover:border-blue-400/60 transition-all duration-300">
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  scrolled 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50" 
                    : "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/10"
                }`}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero section with globe */}
      <div className="relative min-h-screen flex flex-col items-center overflow-hidden">
        {/* Background texture and gradient effects */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3ODdiZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMCAwaDQwdjQwSDB6TTIwIDIwaDIwdjIwSDIweiIvPjwvZz48L2c+PC9zdmc+')] opacity-40 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/90 pointer-events-none"></div>

        {/* Interactive 3D Globe */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="relative h-[500px] lg:h-[600px] w-full"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="absolute w-[140%] h-[140%] rounded-full bg-blue-500/10 blur-3xl pointer-events-none"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 10,
                ease: "easeInOut"
              }}
            />
            
            <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
              <color attach="background" args={['#030718']} />
              <ambientLight intensity={0.8} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1.2}
                color={colors.primary}
              />
              <pointLight position={[0, 0, 0]} intensity={0.8} color="#3b82f6" />
              <pointLight position={[-10, -5, -5]} intensity={0.5} color="#7c3aed" />

              <Globe onCitySelect={handleCitySelect} />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2.1}
                maxPolarAngle={Math.PI / 2.1}
                enableDamping
                dampingFactor={0.05}
                autoRotate
                autoRotateSpeed={0.9}
                makeDefault
              />
            </Canvas>
          </div>
        </motion.div>

        {/* Left side - Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center lg:text-left mt-12 px-6"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-500/20">
            <span className="text-xs font-medium text-blue-300">
              Empowering students and mentors globally
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 leading-tight">
            Connect with global students and mentors in minutes, <span className="text-blue-400">not months</span>
          </h1>
          
          <p className="text-blue-100/80 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
            Our platform connects students and mentors globally, fostering collaboration, learning, and competition.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-medium text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center"
            >
              Register <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
            <button 
              onClick={() => navigate('/how-it-works')}
              className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-blue-400/30 rounded-lg font-medium text-blue-100 hover:bg-blue-500/20 transition-all duration-300"
            >
              How It Works
            </button>
          </div>
          
          {/* Logos and social proof */}
          <div className="mt-12">
            <p className="text-blue-200/60 mb-4 text-sm">
              Trusted by leading mentors and students worldwide
            </p>
          </div>
        </motion.div>
      </div>

      {/* Stats section */}
      <div className="relative z-10 py-12 bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-blue-900/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-blue-500/20"
              >
                <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">
                  {stat.value}
                </span>
                <span className="text-blue-200/70 text-sm mt-1">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div id="features" className="relative py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Advanced Features for Students and Mentors
            </h2>
            <p className="text-blue-100/70 max-w-2xl mx-auto">
              Our platform connects students and mentors globally, fostering collaboration, learning, and competition.
            </p>
          </motion.div>
          
          {/* Tab navigation */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex p-1 rounded-lg bg-blue-900/20 backdrop-blur-sm border border-blue-500/20">
              <button
                onClick={() => setActiveTab('individual')}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${
                  activeTab === 'individual'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                For Students
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${
                  activeTab === 'company'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                For Mentors
              </button>
            </div>
          </div>
          
          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl p-6 hover:bg-blue-900/20 transition-all duration-300"
              >
                <div className="w-12 h-12 mb-5 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <div className="text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-blue-100/70">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Testimonial sidebar */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 backdrop-blur-xl bg-gradient-to-br from-blue-900/40 via-blue-950/40 to-purple-900/30 border-l border-blue-500/20 shadow-2xl z-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3ODdiZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMCAwaDQwdjQwSDB6TTIwIDIwaDIwdjIwSDIweiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
            
            <div className="relative h-full py-12 px-8 flex flex-col">
              {/* Close button with animated effect */}
              <button
                onClick={() => setSelectedCity(null)}
                className="absolute right-5 top-5 w-8 h-8 rounded-full flex items-center justify-center border border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/30 transition-all duration-300 group"
              >
                <span className="text-blue-300 group-hover:text-white transition-colors">✕</span>
              </button>
              
              {/* City name with pulsing dot */}
              <div className="mb-6">
                <div className="inline-flex items-center bg-blue-500/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-blue-400 mr-3 animate-pulse" />
                  <h3 className="text-blue-300 font-medium">{selectedCity.name}</h3>
                </div>
              </div>
              
              {/* Quote with decorative elements */}
              <div className="relative mb-8 flex-1">
                <div className="absolute -left-1 top-0 text-5xl text-blue-500/20">"</div>
                <p className="text-blue-50 text-lg leading-relaxed pl-6 italic">
                  {selectedCity.testimonial.quote}
                </p>
                <div className="absolute -right-1 bottom-0 text-5xl text-blue-500/20">"</div>
              </div>
              
              {/* Divider with gradient */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent my-6"></div>
              
              {/* Enhanced testimonial attribution */}
              <div className="bg-blue-900/20 backdrop-blur-md border border-blue-500/20 rounded-xl p-4">
                <div className="font-medium text-blue-200 text-lg">{selectedCity.testimonial.name}</div>
                <div className="text-sm text-blue-300/80 font-light">
                  {selectedCity.testimonial.designation}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Final CTA section */}
      <div className="relative py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden relative"
          >
            {/* Background glow and patterns */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-800/30 to-indigo-900/30"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3ODdiZmYiIGZpbGwtb3BhY2l0eT0iLjEiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHpNMjAgMjBoMjB2MjBIMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500 rounded-full filter blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/3"></div>
            
            {/* Content */}
            <div className="relative p-12 md:p-16 flex flex-col items-center text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white max-w-3xl">
                Ready to transform your learning journey?
              </h2>
              <p className="text-blue-100/80 mb-8 max-w-2xl">
                Join thousands of students and mentors using our platform to collaborate, learn, and compete globally.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/students')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Connect With Students
                </button>
                <button 
                  onClick={() => navigate('/mentors')}
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-medium text-blue-100 hover:bg-blue-500/20 transition-all duration-300"
                >
                  Connect With Mentors
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative py-16 bg-gradient-to-b from-transparent to-[#030718]/80">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center">
                  <GlobeIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-3 text-xl font-bold text-white">TalentNexus</h3>
              </div>
              <p className="text-blue-200/60 mb-6">
                Empowering students and mentors to achieve their goals through collaboration and competitions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">About Us</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Careers</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Blog</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Webinars</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Compliance</a></li>
                <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-blue-500/20 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200/60 text-sm mb-4 md:mb-0">
              © 2025 TalentNexus. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors text-sm">Privacy</a>
              <a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors text-sm">Terms</a>
              <a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
        
        {/* Create keyframe animation for floating particles */}
        <style>{`
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
            100% {
              transform: translateY(0) translateX(0);
            }
          }
        `}</style>
      </footer>
    </div>
  );
};

export default LandingPage;