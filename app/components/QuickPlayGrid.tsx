export default function QuickPlayGrid({
  items,
  onOpen,
}: {
  items: any[];
  onOpen?: (item: any) => void;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className="relative overflow-hidden rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex items-center h-14"
          onClick={() => onOpen?.(item)}
        >
          <div className="w-14 h-full shrink-0 relative flex items-center justify-center overflow-hidden">
            {item.img ? (
              <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-white/10" />
            )}
          </div>
          <div className="px-3 flex-1 min-w-0">
            <span className="text-xs font-semibold text-white/90 truncate block">{item.title}</span>
          </div>
          <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
