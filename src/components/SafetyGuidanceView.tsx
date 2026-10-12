import React, { useState } from 'react';
import { 
  CheckSquare, ChevronDown, ChevronUp, DownloadCloud
} from 'lucide-react';
import { SAFETY_GUIDES } from '../services/mockData';

export const SafetyGuidanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'before' | 'during' | 'evacuation' | 'health_sanitation' | 'after'>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>('during-response');

  const filteredGuides = activeTab === 'all' 
    ? SAFETY_GUIDES 
    : SAFETY_GUIDES.filter(g => g.stage === activeTab);

  const toggleExpand = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Offline Storage Status */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between text-xs text-neutral-300 shadow-xl">
        <div className="flex items-center gap-2">
          <DownloadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Preparedness guidance:</strong> This guidance is included in the app bundle. Offline access after refresh depends on browser caching; it does not replace current official alerts or emergency instructions.
          </span>
        </div>
        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase shrink-0">
          Guidance Included
        </span>
      </div>

      {/* Stage Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Guidance' },
          { id: 'during', label: '🚨 During Flood (Urgent)' },
          { id: 'evacuation', label: '🏃 Evacuation Protocol' },
          { id: 'before', label: '📦 Before / Go-Bag' },
          { id: 'health_sanitation', label: '💧 Water & Health' },
          { id: 'after', label: '🏡 Returning Home' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-neutral-100 text-neutral-950 font-bold shadow-lg'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Guide Cards */}
      <div className="space-y-3">
        {filteredGuides.map(guide => {
          const isExpanded = expandedSection === guide.id;
          const isUrgent = guide.stage === 'during';

          return (
            <div
              key={guide.id}
              className={`rounded-2xl border transition-all bg-neutral-900 shadow-xl overflow-hidden ${
                isUrgent ? 'border-red-900/60' : 'border-neutral-800'
              }`}
            >
              {/* Card Header */}
              <button
                onClick={() => toggleExpand(guide.id)}
                className={`w-full p-4 text-left flex items-start justify-between gap-3 ${
                  isUrgent ? 'bg-red-950/20 hover:bg-red-950/40' : 'hover:bg-neutral-850'
                }`}
                aria-expanded={isExpanded}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isUrgent ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {guide.stage.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Reviewed: {guide.reviewedDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-100 mt-1">
                    {guide.title}
                  </h3>
                </div>

                <div className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Priority Action Items */}
              <div className="px-4 pb-3 pt-1 border-t border-neutral-800">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  Immediate High-Priority Actions:
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-200">
                  {guide.priorityActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Expanded Instructions */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 bg-neutral-950 border-t border-neutral-800 space-y-3">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Detailed Protocol & Precautions:
                  </div>
                  <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
                    {guide.detailedInstructions.map((detail, idx) => (
                      <p key={idx} className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
                        {detail}
                      </p>
                    ))}
                  </div>

                  <div className="text-[11px] text-neutral-500 pt-1 flex items-center justify-between">
                    <span>Source: {guide.source}</span>
                    <span className="text-neutral-400 font-medium font-mono">Safety guidance · verify local instructions</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
