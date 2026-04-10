interface TagBadgeProps {
  tag: string;
  onClick?: () => void;
  active?: boolean;
}

export default function TagBadge({ tag, onClick, active = false }: TagBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
        active
          ? 'bg-green-600 text-white shadow-sm shadow-green-900'
          : 'bg-gray-800 text-gray-400 hover:bg-green-900/40 hover:text-green-400'
      }`}
    >
      #{tag}
    </button>
  );
}
