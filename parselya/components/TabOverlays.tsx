"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useEditor } from "@/state/EditorContext";
import { OverlayPresetPicker } from "@/components/OverlayPresetPicker";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/cn";
import type { OverlayItem } from "@/types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function TabOverlays() {
  const { state, dispatch } = useEditor();

  const addPreset = (preset: Omit<OverlayItem, "id">) => {
    dispatch({
      type: "ADD_OVERLAY",
      overlay: { ...preset, id: uid() },
    });
  };

  return (
    <div className="space-y-4 p-3">
      <OverlayPresetPicker onAdd={addPreset} />

      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          Sahnedeki Etiketler ({state.overlays.length})
        </p>
        {state.overlays.length === 0 && (
          <p className="rounded-md border border-dashed border-white/10 px-3 py-4 text-center text-xs text-white/30">
            Henüz etiket yok. Yukarıdaki şablonlardan ekleyin.
          </p>
        )}
        {state.overlays.map((o) => (
          <OverlayRow key={o.id} overlay={o} />
        ))}
      </div>
    </div>
  );
}

function OverlayRow({ overlay }: { overlay: OverlayItem }) {
  const { state, dispatch } = useEditor();
  const patch = (p: Partial<OverlayItem>) =>
    dispatch({ type: "UPDATE_OVERLAY", id: overlay.id, patch: p });

  return (
    <div
      className={cn(
        "space-y-2 rounded-lg border p-2.5",
        overlay.enabled
          ? "border-white/10 bg-chrome-850"
          : "border-white/5 bg-chrome-900 opacity-50",
      )}
    >
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => patch({ enabled: !overlay.enabled })}
          className={cn(
            "rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60",
            overlay.enabled ? "text-neon-bright" : "text-white/30",
          )}
          aria-label={overlay.enabled ? "Etiketi gizle" : "Etiketi göster"}
        >
          {overlay.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <Input
          value={overlay.label}
          onChange={(e) => patch({ label: e.target.value })}
          className="h-7 flex-1 text-xs"
          aria-label="Etiket başlığı"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/40 hover:text-red-400"
          onClick={() => dispatch({ type: "REMOVE_OVERLAY", id: overlay.id })}
          aria-label="Etiketi sil"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Input
        value={overlay.value}
        onChange={(e) => patch({ value: e.target.value })}
        className="h-7 text-xs"
        aria-label="Etiket değeri"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-[9px] uppercase tracking-wider text-white/30">
            Başlangıç {overlay.startTime.toFixed(1)}s
          </p>
          <Slider
            min={0}
            max={state.camera.duration}
            step={0.1}
            value={overlay.startTime}
            onValueChange={(v) => patch({ startTime: Math.min(v, overlay.endTime - 0.1) })}
          />
        </div>
        <div>
          <p className="mb-1 text-[9px] uppercase tracking-wider text-white/30">
            Bitiş {overlay.endTime.toFixed(1)}s
          </p>
          <Slider
            min={0}
            max={state.camera.duration}
            step={0.1}
            value={overlay.endTime}
            onValueChange={(v) => patch({ endTime: Math.max(v, overlay.startTime + 0.1) })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-[9px] uppercase tracking-wider text-white/30">
            Konum X {(overlay.position.x * 100).toFixed(0)}%
          </p>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={overlay.position.x}
            onValueChange={(v) => patch({ position: { ...overlay.position, x: v } })}
          />
        </div>
        <div>
          <p className="mb-1 text-[9px] uppercase tracking-wider text-white/30">
            Konum Y {(overlay.position.y * 100).toFixed(0)}%
          </p>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={overlay.position.y}
            onValueChange={(v) => patch({ position: { ...overlay.position, y: v } })}
          />
        </div>
      </div>
    </div>
  );
}
