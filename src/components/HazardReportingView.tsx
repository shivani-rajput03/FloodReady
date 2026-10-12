import React, { useState } from 'react';
import { 
  AlertTriangle, Send, MapPin, CheckCircle, ShieldAlert, Clock
} from 'lucide-react';
import { CommunityReport, LocationData } from '../types';

interface HazardReportingViewProps {
  reports: CommunityReport[];
  currentLocation: LocationData;
  onAddReport: (report: CommunityReport) => void;
}

export const HazardReportingView: React.FC<HazardReportingViewProps> = ({
  reports,
  currentLocation,
  onAddReport
}) => {
  const [reportType, setReportType] = useState<CommunityReport['type']>('flooded_road');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(currentLocation.name);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('high');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}`,
      type: reportType,
      description: description.trim(),
      locationName: locationName.trim() || 'Unspecified location',
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      reportedAt: new Date().toISOString(),
      status: 'unverified',
      urgency
    };

    onAddReport(newReport);
    setDescription('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const getTypeLabel = (type: CommunityReport['type']) => {
    switch (type) {
      case 'flooded_road': return '🌊 Flooded Road / Underpass';
      case 'waterlogging': return '🌧️ Severe Street Waterlogging';
      case 'person_trapped': return '🆘 Stranded Person / Rescue Need';
      case 'power_hazard': return '⚡ Snapped Cable / Electric Hazard';
      case 'relief_needed': return '🍞 Clean Water / Food Shortage';
    }
  };

  return (
    <div className="space-y-4">
      {/* Verification Notice */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-300 shadow-xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Citizen Warning Protocol:</strong> Community hazard submissions are tagged strictly as <em>UNVERIFIED</em> until inspected by field responders. For life-threatening emergencies, call official rescue helplines via the SOS button.
        </div>
      </div>

      {/* Report Submission Card */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-xl">
        <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5 mb-1">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          Submit Local Road Hazard or Rescue Requirement
        </h3>
        <p className="text-xs text-neutral-400 mb-3">
          Notify responders and fellow residents about flooded intersections or fallen live wires.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Hazard Category</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value as CommunityReport['type'])}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="flooded_road">🌊 Flooded Road / Impassable Underpass</option>
              <option value="waterlogging">🌧️ Severe Street Waterlogging</option>
              <option value="person_trapped">🆘 Person Trapped / Rescue Required</option>
              <option value="power_hazard">⚡ Snapped Wire / Electrical Threat</option>
              <option value="relief_needed">🍞 Clean Water / Food Relief Shortage</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Location Landmark</label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. Near 5th Cross Rail Bridge"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Urgency</label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as typeof urgency)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="high">High (Immediate Danger)</option>
                <option value="medium">Medium (Impassable / Caution)</option>
                <option value="low">Low (Nuisance water)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Situation Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe depth, current speed, visible landmarks..."
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Save Hazard Report Locally</span>
          </button>
        </form>

        {showSuccessToast && (
          <div className="mt-3 p-2.5 bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hazard logged locally and marked as UNVERIFIED pending verification.</span>
          </div>
        )}
      </div>

      {/* Community Reports Feed */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
          Recent Community Reports ({reports.length})
        </h3>

        {reports.map(report => (
          <div
            key={report.id}
            className="bg-neutral-900 rounded-2xl border border-neutral-800 p-3.5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-neutral-100">
                    {getTypeLabel(report.type)}
                  </span>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span>{report.locationName}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                    report.status === 'confirmed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(report.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 mt-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                {report.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
