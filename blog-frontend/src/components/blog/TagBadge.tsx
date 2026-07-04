interface TagBadgeProps {
  tag: string;
  onClick?: () => void;
  active?: boolean;
}

export default function TagBadge({ tag, onClick, active = false }: TagBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-green-600 text-white' : 'bg-green-900/40 text-green-400 hover:bg-green-900/70'
      }`}
    >
      #{tag}
    </button>
  );
}
