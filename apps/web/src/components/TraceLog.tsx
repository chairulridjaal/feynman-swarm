import { History } from "lucide-react";

interface TraceLogProps {
  entries: string[];
}

export function TraceLog({ entries }: TraceLogProps) {
  return (
    <aside className="trace-log" aria-label="Execution Audit Log">
      <div className="section-header">
        <History size={18} className="icon-indigo" />
        <h2>Audit Trail</h2>
      </div>

      <div className="trace-list">
        {entries.map((entry, index) => (
          <div className="trace-item" key={`${entry}-${index}`}>
            <div className="trace-indicator">
              <div className="trace-dot" />
              {index !== entries.length - 1 && <div className="trace-connector" />}
            </div>
            <div className="trace-content">
              <span className="trace-index font-mono">{String(entries.length - index).padStart(2, "0")}</span>
              <p className="trace-text">{entry}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
