import * as Icons from "iconoir-react";

interface DynamicIconProps {
  name: string;
  height?: string | number;
  width?: string | number;
  className?: string;
}

export const DynamicIcon = ({
  name,
  height = 24,
  width = 24,
  className = "",
}: DynamicIconProps) => {
  // Convierte el string a componente, respetando el nombre exacto del export de iconoir
  const IconComponent = (Icons as any)[toPascalCase(name)];

  if (!IconComponent)
    return (
      <Icons.QuestionMark className={className} height={height} width={width} />
    );

  return <IconComponent className={className} height={height} width={width} />;
};

// Helper para convertir "user-badge-check" => "UserBadgeCheck"
function toPascalCase(str: string) {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}
