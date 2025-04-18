import React, { useRef, useEffect, useState, useCallback } from 'react';
 import * as THREE from 'three';
 import { Canvas, useFrame, useThree } from '@react-three/fiber';
 import { OrbitControls, Stars, Text, Trail } from '@react-three/drei';
 import { motion, AnimatePresence } from 'framer-motion';
 import { TypeAnimation } from 'react-type-animation';
 import { useNavigate } from 'react-router-dom';

 const colors = {
    primary: '#3b82f6',         // Primary color
    primaryDark: '#2563eb',     // Darker shade of primary
    secondary: '#60a5fa',       // Secondary color
    accent: '#7c3aed',          // Accent color
    accentLight: '#a78bfa',     // Lighter accent color
    background: '#050A15',      // Main background color
    backgroundLight: '#0A1428', // Lighter background color
    text: '#f8fafc',            // Text color
    muted: '#94a3b8'            // Muted text color
  };

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

  export default function Dharti({ onCitySelect }) {
    // const navigate = useNavigate();
    //    const [selectedCity, setSelectedCity] = useState(null);
    //    const [activeTab, setActiveTab] = useState('individual');
    //    const [scrolled, setScrolled] = useState(false);
    // const handleCitySelect = useCallback((city) => {
    //      setSelectedCity(city);
    //    }, []);
       
       useEffect(() => {
         const handleScroll = () => {
           setScrolled(window.scrollY > 50);
         };
         
         window.addEventListener('scroll', handleScroll);
         return () => window.removeEventListener('scroll', handleScroll);
       }, []);
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
             {/* Background texture and gradient effects */}
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3ODdiZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMCAwaDQwdjQwSDB6TTIwIDIwaDIwdjIwSDIweiIvPjwvZz48L2c+PC9zdmc+')] opacity-40 pointer-events-none"></div>
             <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/90 pointer-events-none"></div>
             
             {/* Animated floating particles */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
               {[...Array(30)].map((_, i) => (
                 <div 
                   key={i}
                   className="absolute rounded-full bg-blue-500/30 blur-xl"
                   style={{
                     width: `${Math.random() * 12 + 5}px`,
                     height: `${Math.random() * 12 + 5}px`,
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`,
                     opacity: Math.random() * 0.5,
                     animation: `float ${Math.random() * 20 + 10}s linear infinite`,
                     animationDelay: `${Math.random() * -20}s`
                   }}
                 />
               ))}
             </div>
             
             {/* Globe and hero content */}
             <div className="relative w-full h-[700px] lg:h-[900px] flex items-center justify-center">
       {/* Ensure the Canvas is on top */}
       <div className="absolute inset-0 z-10">
         <Canvas camera={{ position: [0, 0, 18], fov: 50 }}>
           <color attach="background" args={['#030718']} />
           <ambientLight intensity={0.8} />
           <directionalLight
             position={[10, 10, 5]}
             intensity={1.2}
             color={colors.primary}
           />
           <pointLight position={[0, 0, 0]} intensity={0.8} color="#3b82f6" />
           <pointLight position={[-10, -5, -5]} intensity={0.5} color="#7c3aed" />
     
           {/* Globe Component */}
           <Globe onCitySelect={onCitySelect} />
     
           {/* OrbitControls */}
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
         {/* Tooltip */}
     <div className="absolute top-20 left-5 z-20 text-center">
       <p className="text-sm text-blue-100/80 bg-blue-900/50 px-4 py-2 rounded-lg shadow-lg">
         Click on the glowing dots to see testimonials!
       </p>
       </div>
       
       {/* Hero Content */}
       <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="text-white"
         >
           <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 leading-tight">
             Connect with global students and mentors in minutes, <span className="text-blue-400">not months</span>
           </h1>
           <p className="text-blue-100/80 text-lg mb-8 max-w-lg mx-auto">
             Our platform connects students and mentors globally, fostering collaboration, learning, and competition.
           </p>
         </motion.div>
       </div>
     </div>
           </div>
  )}