// Shared SVG icon set — YouTube-style outline icons, currentColor.
// Usage: <HomeIcon size={22} />

function base(size, children, vb = "0 0 24 24") {
  return (
    <svg
      width={size}
      height={size}
      viewBox={vb}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const MenuIcon = ({ size = 22 }) =>
  base(size, <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>);

export const SearchIcon = ({ size = 20 }) =>
  base(size, <><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></>);

export const MicIcon = ({ size = 20 }) =>
  base(size, <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="17" x2="12" y2="22" /></>);

export const BellIcon = ({ size = 22 }) =>
  base(size, <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>);

export const HomeIcon = ({ size = 22 }) =>
  base(size, <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></>);

export const ShortsIcon = ({ size = 22 }) =>
  base(size, <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13L13 2z" />);

export const SubsIcon = ({ size = 22 }) =>
  base(size, <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" /><path d="M2 9h20" /></>);

export const HistoryIcon = ({ size = 22 }) =>
  base(size, <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3.5 2" /></>);

export const PlaylistIcon = ({ size = 22 }) =>
  base(size, <><path d="M4 6h12" /><path d="M4 10h12" /><path d="M4 14h7" /><rect x="15" y="13" width="6" height="8" rx="1" /><path d="M18 13v4l3-1.5" /></>);

export const WatchLaterIcon = ({ size = 22 }) =>
  base(size, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>);

export const LikeIcon = ({ size = 20 }) =>
  base(size, <path d="M7 10v11H3.5A1.5 1.5 0 0 1 2 19.5v-8A1.5 1.5 0 0 1 3.5 10H7zm0 0 4.5-7a2.5 2.5 0 0 1 4.4 2.3L14.5 10H21a2 2 0 0 1 2 2.4l-1.5 7A2 2 0 0 1 19.5 21H7" />);

export const DislikeIcon = ({ size = 20 }) =>
  base(size, <path d="M17 14V3h3.5A1.5 1.5 0 0 1 22 4.5v8a1.5 1.5 0 0 1-1.5 1.5H17zm0 0-4.5 7a2.5 2.5 0 0 1-4.4-2.3l1.4-4.7H3a2 2 0 0 1-2-2.4l1.5-7A2 2 0 0 1 4.5 3H17" />);

export const TrendingIcon = ({ size = 22 }) =>
  base(size, <path d="M12 22c4.4 0 7.5-3 7.5-7.2 0-3.1-2-5.6-3.7-7.3C14.2 5.9 13 4.5 13 2c-3 2-4.5 4.2-5.3 6.6-.4-1-.6-2.1-.6-3.3C4.9 6.9 4.5 9.5 4.5 12 4.5 19 7.6 22 12 22z" />);

export const MusicIcon = ({ size = 22 }) =>
  base(size, <><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><path d="M9 18V4l12-2v12" /></>);

export const GamingIcon = ({ size = 22 }) =>
  base(size, <><rect x="2" y="7" width="20" height="11" rx="5.5" /><path d="M7 11v4M5 13h4" /><circle cx="16" cy="12" r="0.6" fill="currentColor" /><circle cx="18.2" cy="14" r="0.6" fill="currentColor" /></>);

export const NewsIcon = ({ size = 22 }) =>
  base(size, <><path d="M4 5h13v14H6a2 2 0 0 1-2-2V5z" /><path d="M17 8h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H6" /><path d="M7 9h8M7 12.5h8M7 16h5" /></>);

export const SportsIcon = ({ size = 22 }) =>
  base(size, <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 2 4.5 4.5 4.5M17 6h3a1 1 0 0 1 1 1c0 2.5-2 4.5-4.5 4.5" /></>);

export const CloseIcon = ({ size = 20 }) =>
  base(size, <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>);

export const ShareIcon = ({ size = 20 }) =>
  base(size, <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></>);

export const SaveIcon = ({ size = 20 }) =>
  base(size, <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />);

export const MoreIcon = ({ size = 20 }) =>
  base(size, <><circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" /></>);

export const PlayIcon = ({ size = 20 }) =>
  base(size, <path d="M7 4.5v15l13-7.5-13-7.5z" fill="currentColor" stroke="none" />);

export const CheckIcon = ({ size = 18 }) =>
  base(size, <path d="M4 12.5l5 5L20 6.5" />);

export const ChevronDownIcon = ({ size = 18 }) =>
  base(size, <path d="M6 9l6 6 6-6" />);

export const UserIcon = ({ size = 22 }) =>
  base(size, <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>);

export const PlusIcon = ({ size = 18 }) =>
  base(size, <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>);

export const TrashIcon = ({ size = 18 }) =>
  base(size, <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></>);

export const PencilIcon = ({ size = 18 }) =>
  base(size, <><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /><path d="M14.5 5.5l4 4" /></>);

export const TheaterIcon = ({ size = 20 }) =>
  base(size, <rect x="2" y="6" width="20" height="12" rx="2" />);

export const FullscreenIcon = ({ size = 20 }) =>
  base(size, <><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></>);

export const MuteIcon = ({ size = 20 }) =>
  base(size, <><path d="M11 5L6.5 9H3v6h3.5L11 19V5z" fill="currentColor" stroke="none" /><line x1="15" y1="9" x2="21" y2="15" /><line x1="21" y1="9" x2="15" y2="15" /></>);

export const UnmuteIcon = ({ size = 20 }) =>
  base(size, <><path d="M11 5L6.5 9H3v6h3.5L11 19V5z" fill="currentColor" stroke="none" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.2 6a9 9 0 0 1 0 12" /></>);

export const VolumeIcon = ({ size = 20 }) =>
  base(size, <><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" /><path d="M16 9a4 4 0 0 1 0 6" /></>);

export const VolumeMuteIcon = ({ size = 20 }) =>
  base(size, <><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" /><line x1="16" y1="9" x2="22" y2="15" /><line x1="22" y1="9" x2="16" y2="15" /></>);

export const ReplyIcon = ({ size = 16 }) =>
  base(size, <><path d="M9 10 4 14l5 4" /><path d="M4 14h9a7 7 0 0 1 7 7v1" /></>);

export const LinkIcon = ({ size = 18 }) =>
  base(size, <><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></>);

export const ClockIcon = ({ size = 20 }) =>
  base(size, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>);
