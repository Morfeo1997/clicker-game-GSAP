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

  // 1. Creamos "setters" optimizados con quickTo
  // Estos se inicializan una sola vez y son extremadamente rápidos
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
  }, { scope: containerRef });

  const handleMouseMove = contextSafe((e: React.MouseEvent) => {
    if (!ballRef.current || !containerRef.current) return;

    const ballX = gsap.getProperty(ballRef.current, "x") as number;
    const ballY = gsap.getProperty(ballRef.current, "y") as number;
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    const pupilOffset = 4;

    // 3. Calcular vector de distancia
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

    // 4. Lógica de "Empuje"
    // Si el mouse está a menos de 150px, calculamos una nueva posición
    if (distance < 150) {
      const pushForce = (150 - distance) * (2 * speedMultiplier); // Fuerza basada en cercanía y velocidad
      
      // Calculamos el destino (la dirección opuesta al mouse)
      let targetX = ballX + (dx / distance) * pushForce;
      let targetY = ballY + (dy / distance) * pushForce;

      // 5. Mantener dentro de los límites del contenedor
      const bounds = 20; // margen
      targetX = gsap.utils.clamp(bounds, containerRef.current.clientWidth - 70, targetX);
      targetY = gsap.utils.clamp(bounds, containerRef.current.clientHeight - 70, targetY);

      // 6. Movemos la pelota instantáneamente hacia ese destino suavizado
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
      { scale: 1, backgroundColor: "#fbbf24", duration: 0.3 }
    );

    // Generar nueva posición aleatoria dentro del contenedor
    const bounds = 20;
    const maxX = containerRef.current.clientWidth - 70;
    const maxY = containerRef.current.clientHeight - 70;
    
    const randomX = gsap.utils.random(bounds, maxX);
    const randomY = gsap.utils.random(bounds, maxY);

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
        <h1 className="text-4xl font-black italic tracking-tighter">ESCAPE BALL</h1>
        <div className="flex justify-center gap-10 mt-2 font-mono text-xl text-yellow-500">
          <span>PUNTOS: {score}</span>
          <span>DIFICULTAD: {speedMultiplier.toFixed(1)}x</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-4xl h-[500px] bg-neutral-900 border-2 border-white/10 rounded-2xl cursor-crosshair overflow-hidden"
      >
        <div
          ref={ballRef}
          onClick={handleCatch}
          className="absolute w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-yellow-400/60 transition-shadow"
          style={{ x: 100, y: 100 }}
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
      
      <p className="mt-4 text-neutral-500 animate-pulse">Intenta tocar el ojo si puedes...</p>
    </div>
  );
};

export default ConstantEscapeGame;
