import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, Droplets, ArrowUpRight, 
  CheckCircle, RefreshCw, Volume2, ShieldCheck, Thermometer, CloudRain, ExternalLink
} from 'lucide-react';
import { RealtimeFeedResponse } from '../services/strictRealtimeService';
import { LocationData } from '../types';

interface RiskAlertBannerProps {
  feed: RealtimeFeedResponse;
  location: LocationData;
  onRefresh: () => void;
  loading: boolean;
  onTestSound: () => void;
}

export const RiskAlertBanner: React.FC<RiskAlertBannerProps> = ({
  feed,
  location,
  onRefresh,
  loading,
  onTestSound
}) => {
  const [showFactors, setShowFactors] = useState(false);

  const riskBadgeConfig = {
    LOW: {
      border: 'border-emerald-600/40',
      badgeBg: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400 bg-emerald-950/60',
      headline: 'Weather-Based Risk Estimate: Low'
    },
    MODERATE: {
      border: 'border-amber-600/40',
      badgeBg: 'bg-amber-950 text-amber-300 border border-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-400 bg-amber-950/60',
      headline: 'Weather-Based Risk Estimate: Moderate'
    },
    HIGH: {
      border: 'border-red-600/50',
      badgeBg: 'bg-red-950 text-red-300 border border-red-800',
      icon: AlertTriangle,
      iconColor: 'text-red-400 bg-red-950/60',
      headline: 'Weather-Based Risk Estimate: High'
    },
    CRITICAL: {
      border: 'border-red-600',
      badgeBg: 'bg-red-950 text-red-300 border border-red-800',
      icon: ShieldAlert,
      iconColor: 'text-red-400 bg-red-950/80',
      headline: 'Weather-Based Risk Estimate: Critical'
    }
  }[feed.riskLevel];

  const IconComponent = riskBadgeConfig.icon;
  const p = feed.livePrecipitation;

  return (
    <div className="space-y-3">
      
      {/* Weather API and Estimated Risk */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${riskBadgeConfig.iconColor} border border-neutral-800 shrink-0`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${riskBadgeConfig.badgeBg}`}>
                  ESTIMATED RISK: {feed.riskLevel}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Updated {new Date(feed.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-neutral-100 mt-1">
                {riskBadgeConfig.headline}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 leading-relaxed">
                {feed.riskSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onTestSound}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Test Alert Chime</span>
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors disabled:opacity-50"
              title="Refresh live atmospheric telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Weather Values from API */}
        <div className="mt-4 pt-3 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>Current Precipitation</span>
            </div>
            <div className="text-sm font-bold font-mono text-neutral-100 mt-0.5">
              {p.currentMm} mm
            </div>
          </div>

          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Today's Forecast Total</span>
            </div>
            <div className="text-sm font-bold font-mono text-neutral-100 mt-0.5">
              {p.dailySumMm} mm
            </div>
          </div>

          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-blue-400" />
              <span>Temperature & Air</span>
            </div>
            <div className="text-sm font-bold font-mono text-neutral-100 mt-0.5">
              {p.tempC}°C ({p.humidity}% RH)
            </div>
          </div>

          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Peak Hourly Forecast (Next 24h)</span>
            </div>
            <div className="text-sm font-bold font-mono text-neutral-100 mt-0.5">
              {p.maxHourlyMm} mm/h
            </div>
          </div>
        </div>

        {/* Attribution and Telemetry Breakdown Toggle */}
        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span>Feed Source:</span>
            <strong className="text-neutral-200">{feed.sourceAttribution}</strong>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold uppercase">
              Weather API
            </span>
          </div>

          <button
            onClick={() => setShowFactors(!showFactors)}
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors text-xs"
          >
            <span>{showFactors ? 'Hide Weather Factors' : 'View Weather Factors'}</span>
            <ArrowUpRight className={`w-3.5 h-3.5 transform transition-transform ${showFactors ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Expandable Weather Parameter Breakdown */}
        {showFactors && (
          <div className="mt-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
              Weather API values and app-calculated indicators:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {feed.factors.map((f, i) => (
                <div key={i} className="p-2 bg-neutral-900 rounded-lg border border-neutral-800 text-xs">
                  <div className="flex justify-between items-center text-neutral-300 font-semibold">
                    <span>{f.parameter}</span>
                    <span className="text-[10px] uppercase font-bold text-blue-400">{f.status}</span>
                  </div>
                  <div className="text-neutral-100 font-mono font-bold mt-0.5">{f.value}</div>
                  <div className="text-neutral-500 text-[11px] mt-0.5">{f.impactDescription}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Weather-threshold Advisories */}
      {feed.alerts.length > 0 && (
        <div className="space-y-2">
          {feed.alerts.map((alert) => (
            <div 
              key={alert.id}
              className="p-4 rounded-2xl border border-amber-800/80 bg-neutral-900 flex items-start gap-3 shadow-xl"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-neutral-100 text-sm">{alert.title}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-950 text-amber-400 border border-amber-800">
                    MODEL-BASED ADVISORY
                  </span>
                </div>
                <p className="text-neutral-300">{alert.headline}</p>
                <p className="text-amber-200 bg-neutral-950 p-2.5 rounded-xl border border-amber-900/40">
                  <strong>Instruction:</strong> {alert.instruction}
                </p>
                <div className="text-[10px] text-neutral-500 font-mono pt-1">
                  Coverage: {alert.geographicCoverage} • Source: {alert.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
