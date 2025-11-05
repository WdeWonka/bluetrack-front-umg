"use client";

import { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { SidebarCollapse, SidebarExpand } from "iconoir-react";

import { SIDEBAR_ITEMS } from "./sidebarItems";

import { useUser } from "@/contexts/user-provider";
import logo_bluestack from "@/public/img/logo_bluestack.png";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

export default function Sidebar() {
  const { role } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const handleWhiteSpaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignorar clicks en elementos con data-ignore o dentro de links
    if (e.target instanceof Element) {
      if (e.target.closest("[data-ignore]") || e.target.closest("a")) return;
    }
    if (!isOpen) setIsOpen(true);
  };

  const handleWhiteSpaceKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
    }
  };

  return (
    <div
      aria-label="Sidebar navigation"
      className={`hidden lg:flex flex-col bg-white border-r border-gray-200 p-4 transition-all duration-300 shadow-[4px_0_16px_-6px_rgba(0,0,0,0.18)]
        ${isOpen ? `w-[240px] ` : `w-[80px] `}
        ${isHovering && !isOpen ? "cursor-e-resize" : "cursor-default"}
          `}
      role="button"
      tabIndex={isOpen ? -1 : 0}
      onClick={handleWhiteSpaceClick}
      onKeyDown={handleWhiteSpaceKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={`flex flex-row h-10 mx-2 ${isOpen ? "justify-between" : "hidden justify-center"}`}
      >
        {isOpen && (
          <AnimatePresence>
            <motion.div
              key="logo-dots"
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2"
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              <motion.span
                aria-hidden
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                className="w-2 h-2 rounded-full bg-[#2e93d1]"
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 2,
                  delay: 0,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                aria-hidden
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                className="w-2 h-2 rounded-full bg-[#2e93d1]"
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 2,
                  delay: 0.4,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                aria-hidden
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                className="w-2 h-2 rounded-full bg-[#2e93d1]"
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 2,
                  delay: 0.8,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {isOpen && (
          <Tooltip
            closeDelay={0}
            content="Cerrar barra lateral"
            placement="bottom"
          >
            <Button
              data-ignore
              className="p-2 min-w-0 bg-transparent w-10 h-10 rounded-md
             flex items-center justify-center
             hover:bg-gray-200 dark:hover:bg-[#23272F] hover:cursor-e-resize"
              onPress={toggleSidebar}
            >
              <SidebarCollapse
                className="text-gray-600 "
                height="32"
                width="32"
              />
            </Button>
          </Tooltip>
        )}
      </div>
      <div
        className={`flex justify-center items-center mt-4  relative ${
          isOpen ? "mb-3 h-[30px]" : "mb-5 h-[60px]"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="logo-full"
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-3"
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              <Image
                priority
                alt="Bluestack Logo"
                className="object-contain h-auto w-8"
                src={logo_bluestack}
              />
              <span className="text-lg font-bold pt-2 self-center bg-clip-text text-transparent bg-[linear-gradient(90deg,#2e93d1,#0057c7,#001f54)] bg-[length:200%_200%]">
                BlueTrack
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center relative cursor-pointer"
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              {!isHovering ? (
                <Image
                  priority
                  alt="Dentist Icon"
                  className="object-contain h-auto w-10"
                  src={logo_bluestack}
                />
              ) : (
                <Tooltip
                  closeDelay={0}
                  content="Abrir barra lateral"
                  placement="right"
                >
                  <Button
                    data-ignore
                    className="p-2 min-w-0 bg-transparent w-10 h-10 rounded-lg cursor-e-resize
                   flex items-center justify-center
                 hover:bg-gray-200 dark:hover:bg-[#23272F]"
                    onPress={toggleSidebar}
                  >
                    <SidebarExpand
                      className="text-gray-600  "
                      height="32"
                      width="32"
                    />
                  </Button>
                </Tooltip>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="mt-5 flex-1">
        <ul className={`${isOpen ? "space-y-3" : "space-y-3"}`}>
          {SIDEBAR_ITEMS.filter((item) => item.permissions.includes(role)).map(
            (item) => {
              const isActive = pathname === item.pathname;

              return (
                <li key={item.key} data-ignore>
                  <Tooltip
                    className={`${isOpen ? "hidden" : ""}`}
                    closeDelay={0}
                    content={item.label}
                    placement="right"
                  >
                    <Link
                      aria-label={item.label}
                      className={`flex z-1 items-center text-sm gap-4 mb-1 py-2 transition-all duration-200
                ${
                  isActive
                    ? "bg-[#DEE5FF] font-medium text-[#001F54] hover:bg-[#D0DAFF]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
                ${
                  isOpen
                    ? "justify-start ml-[-17px] pl-8 rounded-tr-lg rounded-br-lg"
                    : "justify-center rounded-lg"
                }
              `}
                      href={item.pathname}
                    >
                      <span
                        className={`text-2xl transition-all duration-200
                  ${isActive ? "text-[#001F54]" : "text-gray-600"}
                `}
                      >
                        <DynamicIcon height="24" name={item.icon} width="24" />
                      </span>

                      {isOpen && <span>{item.label}</span>}
                    </Link>
                  </Tooltip>
                </li>
              );
            },
          )}
        </ul>
      </nav>
    </div>
  );
}
