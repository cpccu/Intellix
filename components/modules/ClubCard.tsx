import type { Club } from '@/types';

interface Props {
  club: Club;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function ClubCard({ club }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:border-slate-300 transition-colors">
      {/* Avatar */}
      {club.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={club.logo_url}
          alt={club.name}
          className="w-10 h-10 rounded-lg object-cover border border-slate-100"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{getInitials(club.name)}</span>
        </div>
      )}

      {/* Name & description */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug">{club.name}</h3>
        {club.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{club.description}</p>
        )}
      </div>
    </div>
  );
}
