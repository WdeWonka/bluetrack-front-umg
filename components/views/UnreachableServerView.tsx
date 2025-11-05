"use client";

import { Button } from "@heroui/button";

export default function ServerUnreachableView() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-4 z-10 mt-[-40px] sm:mt-[-90px] text-center px-4">
        <svg
          className="sm:w-[200px] sm:h-[200px] w-[120px] h-[120px] md:ml-[-11px]"
          height="120"
          viewBox="0 0 200 200"
          width="120"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Server icon */}
          <rect
            fill="var(--color-brandblue)"
            height="40"
            rx="10"
            stroke="var(--color-brandblue)"
            strokeWidth="6"
            width="120"
            x="40"
            y="60"
          />
          <rect
            fill="#e0f2fe"
            height="30"
            rx="8"
            stroke="var(--color-brandblue)"
            strokeWidth="4"
            width="120"
            x="40"
            y="110"
          />
          {/* Server lights */}
          <circle cx="60" cy="80" fill="#040444" r="5">
            <animate
              attributeName="opacity"
              dur="1.2s"
              repeatCount="indefinite"
              values="1;0.3;1"
            />
          </circle>
          <circle cx="80" cy="80" fill="#fbbf24" r="5">
            <animate
              attributeName="opacity"
              dur="1.5s"
              repeatCount="indefinite"
              values="1;0.3;1"
            />
          </circle>
          <circle cx="100" cy="80" fill="#22d3ee" r="5">
            <animate
              attributeName="opacity"
              dur="1.8s"
              repeatCount="indefinite"
              values="1;0.3;1"
            />
          </circle>
          {/* Slash for "not accessible" */}
          <line
            stroke="var(--color-brandblue)"
            strokeLinecap="round"
            strokeWidth="12"
            x1="55"
            x2="145"
            y1="55"
            y2="145"
          >
            <animate
              attributeName="stroke-opacity"
              dur="1.5s"
              repeatCount="indefinite"
              values="1;0.7;1"
            />
          </line>
        </svg>
        <h1 className="text-3xl sm:text-5xl mt-[-30px] font-bold text-[#212121]">
          ¡Ups! <span className="text-[#212121]">Algo salió mal</span>
        </h1>

        <div className="flex flex-col gap-4 max-w-[700px] justify-center items-center">
          <p className="text-[#212121] text-xl">
            Al parecer estamos teniendo problemas al procesar tu solicitud,
            nuetro equipo esta trabajando para solucionar este problema.
          </p>
          <span className="text-gray-400 text-sm"> SERVER_UNREACHABLE</span>
          <Button
            className="w-[200px] h-[40px] bg-[#040444] text-white text-md font-semibold"
            color="primary"
            onClick={handleRefresh}
          >
            Recargar
          </Button>
        </div>
      </div>
    </div>
  );
}
