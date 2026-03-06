import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function SvgIcon({ size = 18, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return <SvgIcon {...props}><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></SvgIcon>;
}

export function EventsIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M4 18L10 12L14 15L20 7" /><path d="M20 7H15" /><path d="M20 7V12" /></SvgIcon>;
}

export function CompareIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M7 7H17" /><path d="M7 12H14" /><path d="M7 17H11" /><circle cx="18" cy="12" r="2" /><circle cx="13" cy="17" r="2" /></SvgIcon>;
}

export function OutletsIcon(props: IconProps) {
  return <SvgIcon {...props}><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M7 9H17" /><path d="M7 13H14" /><path d="M7 17H12" /><path d="M16.5 13L18 14.5L16.5 16" /></SvgIcon>;
}

export function AuditIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M7 4H17V20L12 17L7 20V4Z" /><path d="M10 9H14" /></SvgIcon>;
}

export function SearchIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="11" cy="11" r="6" /><path d="M20 20L16.5 16.5" /></SvgIcon>;
}

export function ChevronLeftIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M15 18L9 12L15 6" /></SvgIcon>;
}

export function ChevronRightIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M9 6L15 12L9 18" /></SvgIcon>;
}

export function ChevronDownIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M6 9L12 15L18 9" /></SvgIcon>;
}

export function SidebarOpenIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <rect x="6.5" y="7.5" width="3" height="9" rx="1" fill="currentColor" stroke="none" opacity="0.9" />
      <path d="M11.75 7.75V16.25" opacity="0.6" />
    </SvgIcon>
  );
}

export function SidebarClosedIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M10.75 7.75V16.25" />
    </SvgIcon>
  );
}

export function SunIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2V4" /><path d="M12 20V22" /><path d="M4.9 4.9L6.3 6.3" /><path d="M17.7 17.7L19.1 19.1" /><path d="M2 12H4" /><path d="M20 12H22" /><path d="M4.9 19.1L6.3 17.7" /><path d="M17.7 6.3L19.1 4.9" /></SvgIcon>;
}

export function MoonIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M18 14.5C17.1 14.9 16.1 15.1 15 15.1C10.5 15.1 6.9 11.5 6.9 7C6.9 5.9 7.1 4.9 7.5 4C4.9 5.1 3 7.6 3 10.6C3 14.6 6.4 18 10.4 18C13.4 18 15.9 16.1 17 13.5" /></SvgIcon>;
}

export function SparkIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z" /></SvgIcon>;
}

export function FilterIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M4 6H20" /><path d="M7 12H17" /><path d="M10 18H14" /></SvgIcon>;
}

export function PulseIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M3 12H7L10 4L14 20L17 12H21" /></SvgIcon>;
}

export function UserIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21C4 17.1 7.6 14 12 14C16.4 14 20 17.1 20 21" /></SvgIcon>;
}

export function BookOpenIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </SvgIcon>
  );
}

export function StatusIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="12" cy="12" r="8" /><path d="M12 7V12" /><circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" /></SvgIcon>;
}

export function MapPinIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M12 2C8.1 2 5 5.1 5 9C5 14.2 12 22 12 22C12 22 19 14.2 19 9C19 5.1 15.9 2 12 2Z" /><circle cx="12" cy="9" r="2.5" /></SvgIcon>;
}

export function ActivityIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M22 12H18L15 21L9 3L6 12H2" /></SvgIcon>;
}
