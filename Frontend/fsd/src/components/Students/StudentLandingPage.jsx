import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { 
  Menu, X, ChevronRight, User, Search, Bell, LogOut, 
  Moon, Sun, GlobeIcon, BriefcaseIcon, Lightbulb, 
  ChartBarIcon, ArrowRightIcon, CheckCircleIcon, BookOpen, 
  Trophy, Users, MessageSquare, Mic, MicOff
} from 'lucide-react';

// Enhanced colors palette with better balance
const colors = {
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  secondary: '#818cf8',
  accent: '#a855f7',
  accentLight: '#c084fc',
  background: '#0a0a1a',
  backgroundLight: '#111827',
  text: '#f8fafc',
  muted: '#94a3b8',
  highlight: '#eab308',
  success: '#10b981'
};

// Enhanced student features with new additions
const features = [
  {
    icon: <GlobeIcon className="w-6 h-6" />,
    title: "Global Student Network",
    description: "Connect with students from around the world to collaborate, learn, and grow together.",
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: <BriefcaseIcon className="w-6 h-6" />,
    title: "Expert Mentorship",
    description: "Access guidance from experienced mentors to help you excel in your academic and professional journey.",
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Study Groups",
    description: "Form or join study groups with peers who share your academic interests and goals.",
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: <ChartBarIcon className="w-6 h-6" />,
    title: "Competition Insights",
    description: "Participate in global competitions and track your progress with detailed analytics and feedback.",
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Learning Resources",
    description: "Access curated educational materials and resources tailored to your courses and interests.",
    color: 'from-amber-500 to-yellow-500'
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Achievement Badges",
    description: "Earn recognition for your accomplishments with verifiable digital badges.",
    color: 'from-rose-500 to-red-500'
  }
];

// Student stats
const stats = [
  { value: "500K+", label: "Students" },
  { value: "10K+", label: "Mentors" },
  { value: "1,200+", label: "Competitions" },
  { value: "95%", label: "Success Rate" }
];

// Sample cities data for the globe
const cities = [
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "London", lat: 51.5072, lng: -0.1276 },
  { name: "Tokyo", lat: 35.6895, lng: 139.6917 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Rio", lat: -22.9068, lng: -43.1729 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241 }
];

// Utility function to convert latitude and longitude to 3D coordinates
const latLngToVector3 = (lat, lng, r = 5) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
};

// Enhanced Globe component with better lighting
const Globe = ({ onCitySelect }) => {
  const { scene, camera, gl } = useThree();
  const groupRef = useRef();
  const linesRef = useRef([]);
  const cityMeshes = useRef([]);
  const starfieldRef = useRef(null);
  const cloudRef = useRef(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  // Create animated line between points
  const createAnimatedLine = (start, end, color = '#818cf8') => {
    const startNormal = start.clone().normalize();
    const endNormal = end.clone().normalize();
    
    const midDirection = new THREE.Vector3()
      .addVectors(startNormal, endNormal)
      .normalize();
    const arcHeight = 5 * 0.8;
    const midPoint = midDirection.multiplyScalar(5 + arcHeight);

    const curve = new THREE.CubicBezierCurve3(
      start,
      start.clone().lerp(midPoint, 0.6),
      end.clone().lerp(midPoint, 0.6),
      end
    );

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const uvs = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
      uvs[i * 2] = i / (points.length - 1);
      uvs[i * 2 + 1] = 0;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

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
          
          float baseAlpha = 0.5;
          float finalAlpha = max(alpha1, alpha2) + baseAlpha;
          
          gl_FragColor = vec4(color * 0.8, finalAlpha);
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

  // Setup scene with globe and effects
  useEffect(() => {
    const globeGroup = new THREE.Group();
    const loader = new THREE.TextureLoader();
  
    // Add atmosphere layers with better colors
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(5 + 0.15, 64, 64),
      new THREE.MeshBasicMaterial({
        color: colors.secondary,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
      })
    );
    
    const atmosphereOuter = new THREE.Mesh(
      new THREE.SphereGeometry(5 + 0.3, 64, 64),
      new THREE.MeshBasicMaterial({
        color: colors.accent,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
      })
    );
    
    globeGroup.add(atmosphere);
    globeGroup.add(atmosphereOuter);
  
    // Create earth with better textures
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: loader.load("/textures/earth.jpg"),
      bumpMap: loader.load("/textures/earth_bump.jpg"),
      bumpScale: 0.2,
      metalness: 0.3,
      roughness: 0.6,
      emissive: new THREE.Color(0x0a0a1a),
      emissiveIntensity: 0.1
    });
    
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(5, 64, 64),
      earthMaterial
    );
    
    globeGroup.add(earthMesh);
    
    // Add subtle cloud layer with animation
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: loader.load("/clouds.png"),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    
    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(5.05, 64, 64),
      cloudsMaterial
    );
    
    globeGroup.add(cloudsMesh);
    cloudRef.current = cloudsMesh;

    // Add city markers with better visual hierarchy
    cities.forEach((city, index) => {
      const position = latLngToVector3(city.lat, city.lng);

      // Interactive hit area
      const hitGeom = new THREE.SphereGeometry(0.3, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({
        color: colors.primary,
        transparent: true,
        opacity: 0.01,
      });
      const hitArea = new THREE.Mesh(hitGeom, hitMat);
      hitArea.position.copy(position);
      hitArea.userData = { cityIndex: index };

      // Visible dot with glow effect
      const dotGeom = new THREE.SphereGeometry(0.12, 32, 32);
      const dotMat = new THREE.MeshStandardMaterial({
        color: colors.text,
        emissive: colors.highlight,
        emissiveIntensity: 2.0,
        metalness: 0.9,
        roughness: 0.1,
      });
      const dot = new THREE.Mesh(dotGeom, dotMat);
      dot.position.copy(position);

      // Animated pulsing ring
      const ringGeom = new THREE.RingGeometry(0.15, 0.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colors.highlight,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(position);
      ring.lookAt(0, 0, 0);

      // Glow effect
      const glowGeom = new THREE.SphereGeometry(0.25, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: colors.highlight,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.copy(position);

      globeGroup.add(hitArea);
      globeGroup.add(dot);
      globeGroup.add(ring);
      globeGroup.add(glow);

      cityMeshes.current.push({ dot, ring, glow, hitArea, position });
    });

    // Create connections between cities with varied colors
    const connections = [
      [0, 1], [0, 5], [1, 2], [2, 3], [3, 7], [4, 5], [5, 6]
    ];
    
    connections.forEach(([i, j]) => {
      const start = latLngToVector3(cities[i].lat, cities[i].lng);
      const end = latLngToVector3(cities[j].lat, cities[j].lng);
      
      const colors = ['#818cf8', '#a855f7', '#eab308', '#10b981'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const line = createAnimatedLine(start, end, color);
      globeGroup.add(line);
      linesRef.current.push(line);
    });
    
    scene.add(globeGroup);
    groupRef.current = globeGroup;

    // Create starfield with better distribution
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);
    starfieldRef.current = starfield;

    // Enhanced lighting setup
    const directionalLight = new THREE.DirectionalLight(colors.primary, 3.0);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(colors.primary, colors.accent, 0.5);
    scene.add(hemisphereLight);

    const pointLight = new THREE.PointLight(colors.highlight, 1.5, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(colors.backgroundLight, 0.2);
    scene.add(ambientLight);

    return () => {
      scene.remove(globeGroup);
      scene.remove(starfield);
    };
  }, [scene, camera, onCitySelect]);
  
  // Handle city selection
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
      onCitySelect(`Student from ${cities[cityIndex].name}`);
      
      // Highlight the selected city
      cityMeshes.current.forEach((city, idx) => {
        if (idx === cityIndex) {
          city.dot.material.emissiveIntensity = 5.0;
          city.ring.material.color.set(colors.highlight);
          city.glow.scale.set(1.5, 1.5, 1.5);
        } else {
          city.dot.material.emissiveIntensity = 2.0;
          city.ring.material.color.set(colors.accent);
          city.glow.scale.set(1, 1, 1);
        }
      });
    }
  }, [camera, gl, onCitySelect]);

  // Animation loop
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    
    // Animate connection lines
    linesRef.current.forEach((line, index) => {
      const offset = index * 0.1;
      line.material.uniforms.time.value = (elapsedTime * 0.2 + offset) % 1.0;
    });
    
    // Rotate clouds
    if (cloudRef.current) {
      cloudRef.current.rotation.y = elapsedTime * 0.02;
    }
    
    // Pulse effect for city indicators
    cityMeshes.current.forEach((city, index) => {
      const scale = 1 + 0.2 * Math.sin(elapsedTime * 2 + index);
      city.ring.scale.set(scale, scale, 1);
      city.ring.material.opacity = 0.6 + 0.2 * Math.sin(elapsedTime * 2 + index);
      city.glow.material.opacity = 0.3 + 0.1 * Math.sin(elapsedTime * 3 + index);
    });
  });

  return (
    <group ref={groupRef} onClick={handleClick}>
      <Stars ref={starfieldRef} radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
};

const StudentLandingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  // Initialize voice recognition
  useEffect(() => {
    const initVoiceRecognition = () => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
          setVoiceFeedback('Voice commands not supported in your browser');
          return;
        }
  
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
  
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setVoiceCommand(transcript);
          processVoiceCommand(transcript);
        };
  
        recognitionRef.current.onerror = (event) => {
          console.error('Voice recognition error', event.error);
          const errorMessages = {
            'no-speech': 'No speech detected',
            'audio-capture': 'No microphone available',
            'not-allowed': 'Microphone access denied',
            default: `Error: ${event.error}`
          };
          setVoiceFeedback(errorMessages[event.error] || errorMessages.default);
          setIsListening(false);
        };
  
        recognitionRef.current.onend = () => {
          if (isListening) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error('Restart error:', e);
              setIsListening(false);
            }
          }
        };
      } catch (error) {
        console.error('Initialization error:', error);
        setVoiceFeedback('Error initializing voice recognition');
        setIsListening(false);
      }
    };
  
    initVoiceRecognition();
  
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Process voice commands
  const processVoiceCommand = (command) => {
    const normalizedCommand = command.toLowerCase().trim();
    let feedback = '';
  
    if (normalizedCommand.includes('help')) {
      feedback = [
        'Available commands:',
        '- "Dashboard" - Go to dashboard',
        '- "Competitions" - View competitions',
        '- "Mentors" - Find mentors',
        '- "Profile" - View your profile',
        '- "Study groups" - Find study groups',
        '- "Dark mode"/"Light mode" - Toggle theme',
        '- "Sign out" - Log out',
        '- "Close" - Close current view'
      ].join('\n');
    }

    if (feedback) {
      setVoiceFeedback(feedback);
      setTimeout(() => setVoiceFeedback(''), 3000);
    }
  };

const toggleVoiceControl = async () => {
  if (isListening) {
    recognitionRef.current.stop();
    setIsListening(false);
    setVoiceCommand('');
  } else {
    try {
      // Check microphone permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setVoiceFeedback('Listening... Say "help" for commands');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Microphone access error:', error);
      setVoiceFeedback('Microphone access denied. Please allow microphone access.');
    }
  }
};

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // New UX feature: Auto-hide tooltip after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // New UX feature: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedCity(null);
        setSidebarOpen(false);
      }
      if (e.key === 'm' && e.metaKey) {
        navigate('/mentors');
      }
      if (e.key === 'd' && e.metaKey) {
        navigate('/dashboard');
      }
      if (e.key === 'v' && e.metaKey) {
        toggleVoiceControl();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className={`${darkMode ? 'dark' : ''} bg-gradient-to-br from-[#0a0a1a] via-[#111827] to-[#1e1b4b] min-h-screen`}>
      {/* Voice Control UI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
        {voiceFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-blue-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg max-w-xs"
          >
            {voiceFeedback}
          </motion.div>
        )}
        
        // Update your voice control button JSX:
<button
  onClick={toggleVoiceControl}
  className={`p-4 rounded-full shadow-lg transition-all duration-300 flex flex-col items-center ${
    isListening 
      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
      : 'bg-blue-600 hover:bg-blue-700'
  }`}
  aria-label={isListening ? "Stop listening" : "Start voice control"}
  disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
>
  {isListening ? (
    <>
      <MicOff className="h-6 w-6 text-white" />
      <span className="text-xs mt-1 text-white">Listening...</span>
    </>
  ) : (
    <>
      <Mic className="h-6 w-6 text-white" />
      <span className="text-xs mt-1 text-white">Voice Control</span>
    </>
  )}
</button>
        
        {isListening && voiceCommand && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm text-blue-100 px-4 py-2 rounded-lg shadow-lg max-w-xs"
          >
            <div className="text-xs text-blue-300/80 mb-1">Heard:</div>
            <div>{voiceCommand}</div>
          </motion.div>
        )}
      </div>

      {/* Enhanced fixed header with mobile menu button */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled 
            ? "py-2 bg-[#0a0a1a]/90 backdrop-blur-lg shadow-lg" 
            : "py-4 bg-transparent"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-4 p-2 rounded-full hover:bg-blue-500/20 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-blue-200" />
              </button>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GlobeIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
                StudentSphere
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button 
                className="text-sm text-blue-100 hover:text-white transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button 
                className="text-sm text-blue-100 hover:text-white transition-colors"
                onClick={() => navigate('/competitions')}
              >
                Competitions
              </button>
              <button 
                className="text-sm text-blue-100 hover:text-white transition-colors"
                onClick={() => navigate('/mentors')}
              >
                Mentors
              </button>
              <button 
                className="text-sm text-blue-100 hover:text-white transition-colors"
                onClick={() => navigate('/profile')}
              >
                Profile
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-blue-500/20 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-300" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-300" />
                )}
              </button>
              
              <button 
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero section with globe */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3ODdiZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMCAwaDQwdjQwSDB6TTIwIDIwaDIwdjIwSDIweiIvPjwvZz48L2c+PC9zdmc+')] opacity-40 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/90 pointer-events-none"></div>
        
        {/* Animated floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-xl"
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
          {/* 3D Globe */}
          <div className="absolute inset-0 z-10">
            <Canvas camera={{ position: [0, 0, 18], fov: 50 }}>
              <color attach="background" args={['#0a0a1a']} />
              <ambientLight intensity={0.8} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1.5}
                color={colors.primary}
              />
              <pointLight position={[0, 0, 0]} intensity={0.8} color="#4f46e5" />
              <pointLight position={[-10, -5, -5]} intensity={0.5} color="#a855f7" />

              <Globe onCitySelect={setSelectedCity} />

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
          
          {/* Tooltip with close button */}
          {showTooltip && (
            <motion.div 
              className="absolute top-20 left-5 z-20 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <p className="text-sm text-blue-100/80 bg-blue-900/50 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                  Click on the glowing dots to see student locations!
                </p>
                <button 
                  onClick={() => setShowTooltip(false)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-900/70 flex items-center justify-center hover:bg-blue-800 transition-colors"
                >
                  <X className="h-3 w-3 text-blue-200" />
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Hero Content */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 leading-tight">
                Welcome back, <span className="text-blue-400">{currentUser?.name || "Student"}</span>
              </h1>
              <p className="text-blue-100/80 text-lg mb-8 max-w-lg mx-auto">
                Explore global learning opportunities and connect with mentors and peers worldwide.
              </p>
              
              {/* New UX feature: Quick actions */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 mt-8 pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button 
                  onClick={() => navigate('/competitions')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Join Competition
                </button>
                <button 
                  onClick={() => navigate('/mentors')}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-medium text-blue-100 hover:bg-blue-500/20 transition-all duration-300 flex items-center"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Find Mentor
                </button>
                <button 
                  onClick={() => navigate('/study-groups')}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-medium text-blue-100 hover:bg-blue-500/20 transition-all duration-300 flex items-center"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Study Groups
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
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
                className= "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
                >
                <h3 className="text-3xl font-bold text-blue-200 mb-2">{stat.value}</h3>
                <p className="text-blue-100/80 text-sm">{stat.label}</p>
                </motion.div>
                ))}
                </div>
                </div>
                </div>
                
  {/* Features section */}
  <div className="relative z-10 py-20 bg-gradient-to-br from-[#0a0a1a] via-[#111827] to-[#1e1b4b]">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Student Features</h2>
        <p className="text-blue-100/80 max-w-2xl mx-auto">
          Discover powerful tools and resources designed to enhance your learning experience and connect you with opportunities worldwide.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
            onMouseEnter={() => setActiveFeature(index)}
            onMouseLeave={() => setActiveFeature(null)}
            className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 shadow-lg overflow-hidden relative`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-blue-100/90 mb-4">{feature.description}</p>
              <button className="flex items-center text-sm font-medium text-white hover:text-blue-200 transition-colors">
                Learn more <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {activeFeature === index && (
              <motion.div
                className="absolute inset-0 bg-white/5 backdrop-blur-sm z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </div>

  {/* Testimonials section */}
  <div className="relative z-10 py-20 bg-gradient-to-br from-[#1e1b4b] via-[#111827] to-[#0a0a1a]">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Student Stories</h2>
        <p className="text-blue-100/80 max-w-2xl mx-auto">
          Hear from students who have transformed their learning journey with StudentSphere.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold mr-4">
                {String.fromCharCode(65 + index)}
              </div>
              <div>
                <h4 className="text-white font-medium">Student from {['New York', 'London', 'Tokyo'][index]}</h4>
                <p className="text-blue-100/60 text-sm">Computer Science</p>
              </div>
            </div>
            <p className="text-blue-100/80 mb-6">
              "StudentSphere connected me with mentors who helped me win the Global Hackathon. The resources and community support are unparalleled."
            </p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>

  {/* CTA section */}
  <div className="relative z-10 py-20 bg-gradient-to-br from-[#0a0a1a] via-[#111827] to-[#1e1b4b]">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 rounded-2xl p-8 md:p-12 border border-blue-500/20"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 md:mr-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to elevate your learning experience?</h2>
            <p className="text-blue-100/80 max-w-lg">
              Join thousands of students who are already achieving their academic goals with StudentSphere.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              Go to Dashboard <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
            <button
              onClick={() => navigate('/competitions')}
              className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-medium text-blue-100 hover:bg-blue-500/20 transition-all duration-300 flex items-center justify-center"
            >
              Explore Competitions <Trophy className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </div>

  {/* Mobile sidebar */}
  <AnimatePresence>
    {sidebarOpen && (
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-[#0a0a1a] shadow-xl border-r border-blue-900/50"
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GlobeIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
                StudentSphere
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-blue-500/20 transition-colors"
            >
              <X className="h-6 w-6 text-blue-200" />
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            <nav className="flex-1 space-y-2">
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors"
              >
                <User className="h-5 w-5 mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  navigate('/competitions');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors"
              >
                <Trophy className="h-5 w-5 mr-3" />
                Competitions
              </button>
              <button
                onClick={() => {
                  navigate('/mentors');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors"
              >
                <BriefcaseIcon className="h-5 w-5 mr-3" />
                Mentors
              </button>
              <button
                onClick={() => {
                  navigate('/study-groups');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors"
              >
                <Users className="h-5 w-5 mr-3" />
                Study Groups
              </button>
              <button
                onClick={() => {
                  navigate('/profile');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors"
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-blue-900/50">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors mb-4"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 mr-3" />
                ) : (
                  <Moon className="h-5 w-5 mr-3" />
                )}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-red-900/30 hover:bg-red-900/40 text-red-100 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* City details modal */}
  <AnimatePresence>
    {selectedCity && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={() => setSelectedCity(null)}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-gradient-to-br from-[#0a0a1a] to-[#1e1b4b] rounded-2xl p-8 max-w-md w-full mx-4 border border-blue-900/50 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-white">{selectedCity}</h3>
            <button
              onClick={() => setSelectedCity(null)}
              className="p-2 rounded-full hover:bg-blue-500/20 transition-colors"
            >
              <X className="h-5 w-5 text-blue-200" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h4 className="text-white font-medium">Computer Science</h4>
                <p className="text-blue-100/60 text-sm">University of {selectedCity.split(' ')[2]}</p>
              </div>
            </div>
            
            <div className="bg-blue-900/20 rounded-lg p-4">
              <p className="text-blue-100/80 text-sm">
                "StudentSphere helped me connect with mentors in my field and participate in global competitions that boosted my career prospects."
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-blue-900/50">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-blue-100">3 competitions won</span>
              </div>
              <button className="text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors flex items-center">
                View profile <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Footer */}
  <footer className="relative z-10 py-12 bg-[#0a0a1a] border-t border-blue-900/20">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-6 md:mb-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <GlobeIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
            StudentSphere
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <a href="#" className="text-sm text-blue-100/80 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-blue-100/80 hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-blue-100/80 hover:text-white transition-colors">Contact Us</a>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-blue-900/20 text-center">
        <p className="text-sm text-blue-100/60">
          &copy; {new Date().getFullYear()} StudentSphere. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
);
};

export default StudentLandingPage;                