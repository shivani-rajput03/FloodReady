import React, { useState } from 'react';
import { 
  AlertTriangle, PhoneCall, Volume2, VolumeX, ShieldAlert, 
  MapPin, Send, CheckCircle2, X, HeartHandshake, Radio
} from 'lucide-react';
import { emergencyAudio } from '../services/audioService';
import { OFFICIAL_EMERGENCY_NUMBERS } from '../services/mockData';
import { LocationData, EmergencyContact } from '../types';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  emergencyContacts: EmergencyContact[];
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  location,
  emergencyContacts
}) => {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [showLocationShareConsent, setShowLocationShareConsent] = useState(false);
  const [smsDraft, setSmsDraft] = useState('');
  const [confirmedShare, setConfirmedShare] = useState(false);

  if (!isOpen) return null;

  const toggleSiren = () => {
    if (sirenPlaying) {
      emergencyAudio.stopEmergencySiren();
      emergencyAudio.stopVibrate();
      setSirenPlaying(false);
    } else {
      emergencyAudio.startEmergencySiren();
      emergencyAudio.vibrate([500, 200, 500, 200, 1000]);
      setSirenPlaying(true);
    }
  };

  const handleClose = () => {
    if (sirenPlaying) {
      emergencyAudio.stopEmergencySiren();
      emergencyAudio.stopVibrate();
      setSirenPlaying(false);
    }
    onClose();
  };

  const prepareCheckIn = (type: 'safe' | 'help') => {
    setShowLocationShareConsent(true);
    const locText = `Lat: ${location.latitude.toFixed(5)}, Lon: ${location.longitude.toFixed(5)} (${location.name})`;
    const gmapsLink = `https://maps.google.com/?q=${location.latitude.toFixed(5)},${location.longitude.toFixed(5)}`;

    if (type === 'safe') {
      setSmsDraft(`[FLOODREADY SAFETY UPDATE]: I am currently SAFE and secure from flooding. Location: ${locText}. Maps: ${gmapsLink}`);
    } else {
      setSmsDraft(`[EMERGENCY - FLOOD RESCUE NEEDED]: I am trapped / in need of urgent flood assistance at: ${locText}. Coordinates: ${gmapsLink}`);
    }
  };

  const sendCheckInMessage = () => {
    setConfirmedShare(false);
    const numbers = emergencyContacts.map(c => c.phone).filter(Boolean).join(',');
    const smsUri = `sms:${numbers}?body=${encodeURIComponent(smsDraft)}`;
    window.open(smsUri, '_self');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="sos-title"
        className="w-full max-w-lg bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-red-900/60 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-red-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-900/80 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 id="sos-title" className="text-xl font-black tracking-tight">EMERGENCY SOS DISPATCH</h2>
              <p className="text-xs text-red-200 font-medium">Single Official Crisis Hub & Direct Calling</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 rounded-full hover:bg-red-800 text-white focus:ring-2 focus:ring-white transition-colors"
            aria-label="Close emergency modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 divide-y divide-neutral-800 text-neutral-200">
          
          {/* Section 1: Immediate Audible Siren Alarm */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-red-400" />
                Acoustic Rescue Beacon (High-Decibel Siren)
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                User Armed
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Synthesizes an immediate high-penetration acoustic warning tone (650Hz–1050Hz) and device vibration pattern to signal rescue crews and neighbors if trapped.
            </p>
            <button
              onClick={toggleSiren}
              className={`w-full py-4 px-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all text-base shadow-lg ${
                sirenPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950 ring-4 ring-amber-400/50 animate-pulse' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40'
              }`}
            >
              {sirenPlaying ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>Mute Active Acoustic Siren</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>TRIGGER RESCUE SIREN</span>
                </>
              )}
            </button>
            {sirenPlaying && (
              <p className="text-xs text-center text-red-400 font-semibold mt-2 animate-bounce">
                ⚠️ Siren is sounding. Click button above to silence at any time.
              </p>
            )}
          </div>

          {/* Section 2: One-Tap Emergency Helplines */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-neutral-100 mb-1 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Verified Official Helplines (Direct Tap to Call)
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Official governmental disaster helplines:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {OFFICIAL_EMERGENCY_NUMBERS.slice(0, 4).map((line) => (
                <a
                  key={line.number}
                  href={`tel:${line.number}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950 hover:border-red-600/80 hover:bg-neutral-800 transition-all group"
                >
                  <div className="pr-2">
                    <div className="text-xs font-bold text-neutral-200 group-hover:text-red-400">
                      {line.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 line-clamp-1">{line.description}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-600 text-white font-black text-xs px-2.5 py-1.5 rounded-lg group-hover:bg-red-600 shrink-0">
                    <PhoneCall className="w-3 h-3" />
                    <span>{line.number}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Section 3: Safe / Need Help Check-In */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-neutral-100 mb-1 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-blue-400" />
              Emergency Contact Check-in (SMS composer)
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Pre-filled message with coordinates. Your messaging app will open; review and send it yourself. FloodReady does not transmit messages or dispatch rescuers.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => prepareCheckIn('safe')}
                className="py-3 px-3 bg-neutral-950 border border-emerald-800/80 text-emerald-300 rounded-xl hover:bg-emerald-950/50 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>"I'm Safe" Status</span>
              </button>
              <button
                onClick={() => prepareCheckIn('help')}
                className="py-3 px-3 bg-neutral-950 border border-red-800/80 text-red-300 rounded-xl hover:bg-red-950/50 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>"I Need Help" Status</span>
              </button>
            </div>

            {showLocationShareConsent && (
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-700 mt-2 space-y-2.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200">
                      Confirm Coordinates & Message
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Verify drafted message below before opening your device's SMS app:
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-300 break-words">
                  {smsDraft}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={sendCheckInMessage}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open SMS App</span>
                  </button>
                  <button
                    onClick={() => setShowLocationShareConsent(false)}
                    className="py-2 px-3 bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                {confirmedShare && (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SMS application opened for delivery.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700"
          >
            Close SOS Center
          </button>
        </div>
      </div>
    </div>
  );
};
