"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarContent,
  Button,
  DropdownItem,
  DropdownSection,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { useUser } from "@/contexts/user-provider";
import { SIDEBAR_ITEMS } from "@/components/sidebar/sidebarItems";
import authService from "@/app/login/services/auth.service";
import logo_bluestack from "@/public/img/logo_bluestack.png";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ROLES } from "@/shared/constants/roles.constant";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const settingsDisclosure = useDisclosure();

  function capitalizeName(name: string | null | undefined): string {
    if (!name) return "";

    return name
      .trim()
      .split(/\s+/) // Divide por uno o más espacios
      .map((word) => {
        if (word.length === 0) return word;

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  function getInitials(name: string | null | undefined): string {
    if (!name) return "";

    // Separar por espacios y filtrar palabras vacías
    const words = name.trim().split(/\s+/).filter(Boolean);

    // Tomar la primera letra del primer y segundo nombre
    const firstInitial = words[0]?.charAt(0).toUpperCase() || "";
    const secondInitial = words[1]?.charAt(0).toUpperCase() || "";

    return firstInitial + secondInitial;
  }

  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = settingsDisclosure;

  const pageTitle = useMemo(() => {
    const map = new Map<string, string>();

    SIDEBAR_ITEMS.forEach((item) => {
      map.set(item.pathname, item.label);
    });

    return map.get(pathname) || "Rutas";
  }, [[pathname]]);

  const titleKey = pageTitle ?? "dashboard";

  const menuItems = useMemo(() => {
    return SIDEBAR_ITEMS.filter((item) => item.permissions.includes(role));
  }, [role]);

  const handleLogOut = async () => {
    try {
      await authService.logout();
      router.refresh();
      toast.success("Hasta pronto!");
    } catch {
      toast.error("Error al cerrar sesión. Por favor, inténtalo de nuevo.");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case ROLES.ADMIN:
        return "shield-check";
      case ROLES.OPERATOR:
        return "brain-research";
      case ROLES.SELLER:
        return "delivery-truck";
      default:
        return "user";
    }
  };

  return (
    <>
      <Navbar
        isBlurred
        className="bg-transparent border-b border-gray-300 h-20 lg:border-none pt-5"
        isMenuOpen={isMenuOpen}
        maxWidth="full"
        onMenuOpenChange={(open) => setIsMenuOpen(open)}
      >
        <NavbarContent as="div" className="items-center lg:hidden">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            as="button"
            className="text-gray-500 dark:text-gray-400 "
            id="navbar-menu-toggle"
          />
          <NavbarBrand as="div" className="ml-2 w-auto max-w-[120px]">
            <div className="relative w-10 h-10 lg:hidden">
              <Image
                priority
                alt="Dentist Icon"
                className="object-contain"
                fetchPriority="high"
                quality={70}
                src={logo_bluestack}
              />
            </div>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent as="div" className="hidden lg:flex">
          <h1 className="text-3xl font-semibold">{titleKey}</h1>
        </NavbarContent>

        <NavbarContent as="div" className="gap-2 pr-2" justify="end">
          <Tooltip
            className="capitalize"
            closeDelay={0}
            content={role}
            placement="bottom"
          >
            <Button
              aria-label="rol"
              as="div"
              className="rounded-full min-w-10 h-10 p-2 bg-transparent hover:bg-gray-200 hover:dark:bg-common-hoverdark border border-gray-400 dark:border-gray-800"
            >
              <DynamicIcon height="20" name={getRoleIcon(role)} width="20" />
            </Button>
          </Tooltip>

          <div className="w-[1.5px] h-8 bg-gray-300 dark:bg-gray-800 mx-2" />
          <Dropdown
            showArrow
            className="min-w-[230px]"
            isOpen={isSettingsOpen}
            placement="bottom-end"
            onOpenChange={(open) =>
              open ? onSettingsOpen() : onSettingsClose()
            }
          >
            <DropdownTrigger>
              <Avatar
                showFallback
                aria-label="Abrir menú de perfil"
                as="button"
                className="w-11 h-11 cursor-pointer transition-transform bg-[#2e93d1] text-white dark:bg-[#2e93d1] dark:text-white
                font-semibold text-sm hover:scale-105 focus:outline-none shadow-sm shadow-gray-400 dark:shadow-gray-700 rounded-full"
                color="default"
                fallback={getInitials(user?.nombre)}
                imgProps={{ loading: "eager" }}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Custom item styles"
              disabledKeys={["profile"]}
              itemClasses={{
                base: [
                  "rounded-md",
                  "text-default-500",
                  "transition-opacity",
                  "data-[hover=true]:text-foreground",
                  "data-[hover=true]:bg-default-100",
                  "dark:data-[hover=true]:bg-default-100",
                  "data-[selectable=true]:focus:bg-default-50",
                  "data-[pressed=true]:opacity-70",
                  "data-[focus-visible=true]:ring-default-500",
                ],
              }}
              text-value="Menu"
            >
              <DropdownSection
                showDivider
                aria-label="Profile"
                className="rounded-xl"
              >
                <DropdownItem
                  key="profile"
                  isReadOnly
                  className="h-auto opacity-100"
                  textValue="Perfil"
                >
                  <div className="flex flex-row items-center gap-2   w-full">
                    <Avatar
                      showFallback
                      aria-label="Abrir menú de perfil"
                      as="button"
                      className="w-10 h-10  cursor-pointer items-center transition-transform bg-[#2e93d1] text-white dark:bg-[#2e93d1] dark:text-white
                      font-semibold text-md hover:scale-105 focus:outline-none shadow-sm shadow-gray-400 dark:shadow-gray-700 rounded-full"
                      color="default"
                      fallback={getInitials(user?.nombre)}
                      imgProps={{ loading: "eager" }}
                    />
                    <div className="flex flex-col">
                      <h1 className="text-base capitalize  font-medium max-w-[120px] h-auto sm:max-w-[180px] text-common-dark dark:text-white truncate">
                        {capitalizeName(user?.nombre)}
                      </h1>
                      <span className="text-xs  text-default-500 dark:text-default-400 max-w-[180px] sm:max-w-[190px] truncate">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownItem>
              </DropdownSection>

              <DropdownSection aria-label="Logout">
                <DropdownItem
                  key="logout"
                  className="w-full pl-2 sm:pl-4 group"
                  classNames={{
                    base: "data-[hover=true]:bg-danger-50 dark:data-[hover=true]:bg-danger-50/100",
                  }}
                  textValue="Cerrar Sesión"
                  onPress={handleLogOut}
                >
                  <div className="flex items-center gap-2 w-full group-hover:text-danger transition-colors  ">
                    <DynamicIcon height="20" name="log-out" width="20" />

                    <span className="pt-0.5 text-xs sm:text-sm text-default-500 group-hover:text-danger transition-colors">
                      Cerrar Sesión
                    </span>
                  </div>
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>
    </>
  );
}
