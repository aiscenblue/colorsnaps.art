

import React, { useState, useEffect } from 'react';
import { motion, easeInOut } from 'framer-motion';


const generateRandomBlue = () => {
  const hue = 200 + Math.random() * 40; // Hue for blue (200-240)
  const saturation = 50 + Math.random() * 30; // Saturation (50-80)
  const lightness = 40 + Math.random() * 20; // Lightness (40-60)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const ColorPaletteLoader: React.FC = () => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setColors([
      generateRandomBlue(),
      generateRandomBlue(),
      generateRandomBlue(),
    ]);

    const interval = setInterval(() => {
      setColors([
        generateRandomBlue(),
        generateRandomBlue(),
        generateRandomBlue(),
      ]);
    }, 1000); // Change colors every second

    return () => clearInterval(interval);
  }, []);

  const bounceVariants = {
    initial: { y: "0%" },
    animate: {
      y: ["0%", "-40%", "0%"],
    },
  };

  return (
    <div className="flex space-x-2 justify-center items-center h-screen">
      {colors.map((color, index) => (
        <motion.div
          key={index}
          className="h-8 w-8 rounded-full animate-pulse"
          style={{ backgroundColor: color }}
          variants={bounceVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 1,
            ease: easeInOut,
            repeat: Infinity,
            repeatDelay: 0.1,
            delay: index * 0.1,
          }}
        ></motion.div>
      ))}
    </div>
  );
};

export default ColorPaletteLoader;