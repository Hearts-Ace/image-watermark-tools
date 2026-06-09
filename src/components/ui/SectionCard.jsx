import React from 'react';

function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-zinc-400">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export default SectionCard;
