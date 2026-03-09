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

export function DocumentIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M8 3H14L19 8V21H8Z" /><path d="M14 3V8H19" /><path d="M10 12H17" /><path d="M10 16H17" /></SvgIcon>;
}

export function EventsIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M4 18L10 12L14 15L20 7" /><path d="M20 7H15" /><path d="M20 7V12" /></SvgIcon>;
}

export function UniverseIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="7" cy="8" r="2.5" /><circle cx="17" cy="7" r="2.5" /><circle cx="12" cy="17" r="2.5" /><path d="M9 9.5L10.5 15" /><path d="M14.4 15.4L15.6 9.4" /><path d="M9.5 8H14.5" /></SvgIcon>;
}

export function CompareIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M7 7H17" /><path d="M7 12H14" /><path d="M7 17H11" /><circle cx="18" cy="12" r="2" /><circle cx="13" cy="17" r="2" /></SvgIcon>;
}

export function OutletsIcon(props: IconProps) {
  return <SvgIcon {...props}><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M7 9H17" /><path d="M7 13H14" /><path d="M7 17H12" /><path d="M16.5 13L18 14.5L16.5 16" /></SvgIcon>;
}

export function EntityIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="8" cy="8" r="3" /><circle cx="16" cy="9" r="2.5" /><path d="M5 19C5 15.7 7.9 13 11.5 13C12.9 13 14.2 13.4 15.2 14.2" /><path d="M15 18.5C15.4 17 16.7 16 18.1 16C19.8 16 21 17.2 21 18.9" /></SvgIcon>;
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

export function PulseIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M3 12H7L10 4L14 20L17 12H21" /></SvgIcon>;
}

export function ContradictionIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M6 6L18 18" /><path d="M18 6L6 18" /><circle cx="12" cy="12" r="8" /></SvgIcon>;
}

export function ScalesIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M12 4V20" /><path d="M6 7H18" /><path d="M7.5 7L5 12H10L7.5 7Z" /><path d="M16.5 7L14 12H19L16.5 7Z" /><path d="M9 20H15" /></SvgIcon>;
}

export function CalendarIcon(props: IconProps) {
  return <SvgIcon {...props}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3V7" /><path d="M16 3V7" /><path d="M4 10H20" /></SvgIcon>;
}

export function MapPinIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M12 2C8.1 2 5 5.1 5 9C5 14.2 12 22 12 22C12 22 19 14.2 19 9C19 5.1 15.9 2 12 2Z" /><circle cx="12" cy="9" r="2.5" /></SvgIcon>;
}

export function ExploreIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M4 20L9 15" /><path d="M15 9L20 4" /><circle cx="9" cy="15" r="3" /><circle cx="15" cy="9" r="3" /><path d="M10.8 13.2L13.2 10.8" /></SvgIcon>;
}

export function ActivityIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M22 12H18L15 21L9 3L6 12H2" /></SvgIcon>;
}

export function AlertIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M12 3L21 19H3L12 3Z" /><path d="M12 9V13" /><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" /></SvgIcon>;
}

export function UserIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21C4 17.1 7.6 14 12 14C16.4 14 20 17.1 20 21" /></SvgIcon>;
}

export function BookOpenIcon(props: IconProps) {
  return <SvgIcon {...props}><path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></SvgIcon>;
}

export function StatusIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="12" cy="12" r="8" /><path d="M12 7V12" /><circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" /></SvgIcon>;
}

export function LockIcon(props: IconProps) {
  return <SvgIcon {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8.5A4 4 0 0 1 12 4.5A4 4 0 0 1 16 8.5V11" /></SvgIcon>;
}

export function SettingsIcon(props: IconProps) {
  return <SvgIcon {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15A1.7 1.7 0 0 0 19.7 16.9L19.8 17A2 2 0 0 1 17 19.8L16.9 19.7A1.7 1.7 0 0 0 15 19.4A1.7 1.7 0 0 0 14 21V21.2A2 2 0 0 1 10 21.2V21A1.7 1.7 0 0 0 9 19.4A1.7 1.7 0 0 0 7.1 19.7L7 19.8A2 2 0 0 1 4.2 17L4.3 16.9A1.7 1.7 0 0 0 4.6 15A1.7 1.7 0 0 0 3 14H2.8A2 2 0 0 1 2.8 10H3A1.7 1.7 0 0 0 4.6 9A1.7 1.7 0 0 0 4.3 7.1L4.2 7A2 2 0 0 1 7 4.2L7.1 4.3A1.7 1.7 0 0 0 9 4.6A1.7 1.7 0 0 0 10 3H10.2A2 2 0 0 1 14 3V3A1.7 1.7 0 0 0 15 4.6A1.7 1.7 0 0 0 16.9 4.3L17 4.2A2 2 0 0 1 19.8 7L19.7 7.1A1.7 1.7 0 0 0 19.4 9A1.7 1.7 0 0 0 21 10H21.2A2 2 0 0 1 21.2 14H21A1.7 1.7 0 0 0 19.4 15Z" /></SvgIcon>;
}

export function DensityIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4.5 18L7 11L9.5 18" />
      <path d="M5.6 15H8.4" />
      <path d="M13.5 18L17 6L20.5 18" />
      <path d="M14.8 13H19.2" />
    </SvgIcon>
  );
}
