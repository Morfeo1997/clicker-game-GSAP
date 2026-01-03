import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const ConstantEscapeGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const { contextSafe } = useGSAP({ scope: containerRef });

  // Setters optimizados con quickTo
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);
  const leftPupilX = useRef<gsap.QuickToFunc | null>(null);
  const leftPupilY = useRef<gsap.QuickToFunc | null>(null);
  const rightPupilX = useRef<gsap.QuickToFunc | null>(null);
  const rightPupilY = useRef<gsap.QuickToFunc | null>(null);

  useGSAP(() => {
    xTo.current = gsap.quickTo(ballRef.current, "x", { duration: 0.6, ease: "power3" });
    yTo.current = gsap.quickTo(ballRef.current, "y", { duration: 0.6, ease: "power3" });
    leftPupilX.current = gsap.quickTo(leftPupilRef.current, "x", { duration: 0.3, ease: "power2" });
    leftPupilY.current = gsap.quickTo(leftPupilRef.current, "y", { duration: 0.3, ease: "power2" });
    rightPupilX.current = gsap.quickTo(rightPupilRef.current, "x", { duration: 0.3, ease: "power2" });
    rightPupilY.current = gsap.quickTo(rightPupilRef.current, "y", { duration: 0.3, ease: "power2" });
    if (ballRef.current && containerRef.current) {
    const centerX = containerRef.current.clientWidth / 2 - 25; // 25 es el radio de la bola
    const centerY = containerRef.current.clientHeight / 2 - 25;
    
    gsap.set(ballRef.current, { x: centerX, y: centerY });
  }
  }, { scope: containerRef });

  const handleMouseMove = contextSafe((e: React.MouseEvent) => {
    if (!ballRef.current || !containerRef.current) return;

    const ballX = gsap.getProperty(ballRef.current, "x") as number;
    const ballY = gsap.getProperty(ballRef.current, "y") as number;
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    const pupilOffset = 4;

    // Calcular vector de distancia
    const dx = ballX + 25 - mouseX;
    const dy = ballY + 25 - mouseY;
    const angle = Math.atan2(mouseY - (ballY + 25), mouseX - (ballX + 25));
    const distance = Math.sqrt(dx * dx + dy * dy);
    const pupilX = Math.cos(angle) * pupilOffset;
    const pupilY = Math.sin(angle) * pupilOffset;

    leftPupilX.current?.(pupilX);
    leftPupilY.current?.(pupilY);
    rightPupilX.current?.(pupilX);
    rightPupilY.current?.(pupilY);

    // Lógica de "Empuje"
    if (distance < 150) {
      const pushForce = (150 - distance) * (2 * speedMultiplier); // Fuerza basada en cercanía y velocidad
      
      // Calculamos el destino (la dirección opuesta al mouse)
      let targetX = ballX + (dx / distance) * pushForce;
      let targetY = ballY + (dy / distance) * pushForce;
      const containerRadius = containerRef.current.clientWidth / 2;
      const ballRadius = 25; // radio de la bola
      const centerX = containerRadius;
      const centerY = containerRef.current.clientHeight / 2;

      const distFromCenterX = targetX + ballRadius - centerX;
      const distFromCenterY = targetY + ballRadius - centerY;
      const distFromCenter = Math.sqrt(distFromCenterX * distFromCenterX + distFromCenterY * distFromCenterY);

      const maxRadius = containerRadius - ballRadius - 10; // 10px de margen
        if (distFromCenter > maxRadius) {
          const angle = Math.atan2(distFromCenterY, distFromCenterX);
          targetX = centerX + Math.cos(angle) * maxRadius - ballRadius;
          targetY = centerY + Math.sin(angle) * maxRadius - ballRadius;
        }


      // Mantener dentro de los límites del contenedor
      const bounds = 20; // margen
      targetX = gsap.utils.clamp(bounds, containerRef.current.clientWidth - 70, targetX);
      targetY = gsap.utils.clamp(bounds, containerRef.current.clientHeight - 70, targetY);

      // Movemos la pelota instantáneamente hacia ese destino suavizado
      xTo.current?.(targetX);
      yTo.current?.(targetY);
    }
  });

  const handleCatch = contextSafe(() => {
    if (!ballRef.current || !containerRef.current) return;
    setScore(s => s + 1);
    setSpeedMultiplier(prev => prev + 0.5); // Aumenta la fuerza de escape cada vez

    // Animación de "click exitoso"
    gsap.fromTo(ballRef.current, 
      { scale: 1.5, backgroundColor: "#4ade80" }, 
      { scale: 1, backgroundColor: "#3b82f6", duration: 0.3 }
    );

    // Generar nueva posición aleatoria dentro del contenedor
    const containerRadius = containerRef.current.clientWidth / 2;
    const ballRadius = 25;
    const maxRadius = containerRadius - ballRadius - 10;

    // Generar ángulo y radio aleatorios
    const randomAngle = gsap.utils.random(0, Math.PI * 2);
    const randomRadius = gsap.utils.random(0, maxRadius);

    // Convertir polar a cartesiano
    const centerX = containerRadius;
    const centerY = containerRef.current.clientHeight / 2;
    const randomX = centerX + Math.cos(randomAngle) * randomRadius - ballRadius;
    const randomY = centerY + Math.sin(randomAngle) * randomRadius - ballRadius;

    // Reiniciar posición con animación suave
    gsap.to(ballRef.current, {
      x: randomX,
      y: randomY,
      duration: 0.5,
      ease: "power2.inOut"
    });
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-black text-cyan-700 italic tracking-tighter">Atrapa la pelota</h1>
        <div className="flex justify-center gap-10 mt-2 font-mono text-xl">
          <span>PUNTOS: {score}</span>
          <span>VELOCIDAD: {speedMultiplier.toFixed(1)}x</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-3xl h-[500px] bg-neutral-900 border-2 border-white/10 rounded-full cursor-crosshair overflow-hidden"
      >
        <div
          ref={ballRef}
          onClick={handleCatch}
          className="relative w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center gap-2 shadow-md shadow-blue-400 hover:shadow-blue-700 transition-shadow"
        >
          {/* Ojo izquierdo */}
          <div className="relative w-4 h-5 bg-white rounded-full overflow-hidden">
            <div 
              ref={leftPupilRef}
              className="absolute w-2 h-2 bg-black rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          
          {/* Ojo derecho */}
          <div className="relative w-4 h-5 bg-white rounded-full overflow-hidden">
            <div 
              ref={rightPupilRef}
              className="absolute w-2 h-2 bg-black rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </div>
      
      <footer className="block w-full text-center mt-4">
        <p className="text-cyan-700 font-black text-xl">Creado por <a className="text-blue-700 hover:text-cyan-500 transition-colors duration-300" target="_blank" href="https://gaston-gomez1997.netlify.app/">Gastón Gómez</a></p>
      </footer>
    </div>
  );
};

export default ConstantEscapeGame;
