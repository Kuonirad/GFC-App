import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FluxImageRenderer from './components/FluxImageRenderer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <FluxImageRenderer />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
