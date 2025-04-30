import React from 'react';

export const GradientBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Gradientes de fondo */}
      <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-500 rounded-full opacity-20 blur-[100px]" />
      <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full opacity-20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-500 rounded-full opacity-20 blur-[100px]" />
      
      {/* Estrellas (puntos pequeños) */}
      <div className="absolute inset-0 bg-[url('/stars-bg.png')] bg-repeat opacity-30" />
    </div>
  );
};