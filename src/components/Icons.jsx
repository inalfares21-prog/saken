const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function SearchIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

export function MapPinIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 10c0 5.2-8 11-8 11s-8-5.8-8-11a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function BedIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 18h18M7 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function BathIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
      <path d="M6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" />
    </svg>
  );
}

export function UsersIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.3a3.2 3.2 0 0 1 0 6.4M17 14.5a5.5 5.5 0 0 1 4 5.5" />
    </svg>
  );
}

export function StarIcon(props) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" />
    </svg>
  );
}

export function HeartIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7.5-4.6-7.5-9.7A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.9C19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function SlidersIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="9" cy="7" r="2" fill="var(--surface, #fff)" />
      <circle cx="15" cy="12" r="2" fill="var(--surface, #fff)" />
      <circle cx="8" cy="17" r="2" fill="var(--surface, #fff)" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function KeyIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="8" r="4.2" />
      <path d="m11 11 9 9M16 16l-2 2M19 13l-2 2" />
    </svg>
  );
}

export function BuildingIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M14 21V11h4a2 2 0 0 1 2 2v8M3 21h18" />
      <path d="M7 8h2M7 12h2M7 16h2M17 15h.01M17 18h.01" />
    </svg>
  );
}

export function PalmIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21c0-6 0-9 2-12" />
      <path d="M14 9c2.5-2 5-1.5 6 0-2 .6-4 1-6 2M14 9c-2.5-2-5-1.5-6 0 2 .6 4 1 6 2M14 9c.6-2.6-.2-4.7-1.8-5.6-.5 2.2-.2 4 .8 5.6" />
    </svg>
  );
}

export function ShieldIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function PhoneIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5L15.5 11l4 1.5v3a2.5 2.5 0 0 1-2.7 2.5C10.4 17.4 6.6 13.6 4 7.7A2.5 2.5 0 0 1 6.5 3Z" />
    </svg>
  );
}

export function MailIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function CalendarIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

export function EyeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function MessageIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9Z" />
    </svg>
  );
}

export function LogOutIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h9" />
    </svg>
  );
}

export function UserIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ImageIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m4 18 5-5 4 4 3-3 4 4" />
    </svg>
  );
}

export function SunIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}
