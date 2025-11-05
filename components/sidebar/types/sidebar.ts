import { Role } from "@/shared/constants/roles.constant";

export interface SidebarItem {
  key: string;
  label: string;
  pathname: string;
  icon: string;
  permissions: Role[];
}
