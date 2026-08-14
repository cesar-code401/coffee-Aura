"use client";

import { Station } from "@prisma/client";
import { Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KdsFilterBarProps {
  station: Station | 'ALL';
  setStation: (station: Station | 'ALL') => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

export function KdsFilterBar({ station, setStation, audioEnabled, setAudioEnabled }: KdsFilterBarProps) {
  
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 text-slate-100">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-black tracking-widest text-primary hidden sm:block">KDS</h1>
        
        <div className="flex bg-slate-900 rounded-lg p-1">
          <Button 
            variant={station === 'ALL' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setStation('ALL')}
            className={station === 'ALL' ? '' : 'text-slate-400'}
          >
            ALL
          </Button>
          <Button 
            variant={station === Station.BAR ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setStation(Station.BAR)}
            className={station === Station.BAR ? '' : 'text-slate-400'}
          >
            BAR
          </Button>
          <Button 
            variant={station === Station.KITCHEN ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setStation(Station.KITCHEN)}
            className={station === Station.KITCHEN ? '' : 'text-slate-400'}
          >
            KITCHEN
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant={audioEnabled ? "default" : "destructive"} 
          size="icon"
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? "Mute Alarms" : "Enable Alarms"}
        >
          {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>

        <Button variant="outline" size="icon" onClick={handleFullscreen} title="Fullscreen" className="border-slate-700 bg-slate-900">
          <Maximize className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
