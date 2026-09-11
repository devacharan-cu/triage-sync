import { AuditEvent } from '@/types';
import { Clock } from 'lucide-react';

export function AuditTrail({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="p-4 border border-neutral-800 rounded-xl bg-neutral-900/50 flex flex-col items-center justify-center">
        <p className="text-neutral-500 font-mono text-sm">NO_AUDIT_EVENTS</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 relative before:absolute before:inset-0 before:ml-[15px] before:w-0.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:bg-neutral-800">
      {events.map((event) => (
        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-neutral-800 bg-[#111] text-neutral-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <Clock size={12} />
          </div>
          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] p-3 rounded border border-neutral-800 bg-[#111] shadow">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase ${event.actor === 'ai' ? 'text-blue-400' : event.actor === 'system' ? 'text-neutral-400' : 'text-emerald-400'}`}>
                {event.actor} • {event.type.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">{new Date(event.createdAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-xs text-neutral-300">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
