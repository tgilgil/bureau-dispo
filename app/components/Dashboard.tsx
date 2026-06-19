"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building } from "@/app/api/resources/route";
import { ResourceAvailability } from "@/app/api/availability/route";
import { RoomCard } from "./RoomCard";
import { FloorPlan } from "./FloorPlan";
import { MTL_BUILDING_ID } from "@/lib/mtl-floorplan";

const REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutes

export function Dashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  const [availability, setAvailability] = useState<ResourceAvailability[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchAvailability = useCallback(
    async (buildings: Building[], isoTime: string) => {
      const current = buildings.find((b) => b.id === activeBuilding) ?? buildings[0];
      if (!current) return;

      const emails = current.resources.map((r) => r.email).filter(Boolean);
      if (!emails.length) return;

      setLoadingAvailability(true);

      const target = new Date(isoTime);
      const dayStart = new Date(target);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(target);
      dayEnd.setHours(23, 59, 59, 999);

      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails,
          timeMin: dayStart.toISOString(),
          timeMax: dayEnd.toISOString(),
          targetTime: target.toISOString(),
        }),
      });

      if (!res.ok) {
        setError("Impossible de charger la disponibilité.");
        setLoadingAvailability(false);
        return;
      }

      const data: ResourceAvailability[] = await res.json();
      setAvailability(data);
      setLoadingAvailability(false);
    },
    [activeBuilding]
  );

  async function fetchResources() {
    setLoadingResources(true);
    const res = await fetch("/api/resources");
    if (!res.ok) {
      setError("Impossible de charger les ressources.");
      setLoadingResources(false);
      return;
    }
    const data: Building[] = await res.json();
    setBuildings(data);
    setActiveBuilding(data[0]?.id ?? null);
    setLoadingResources(false);
    fetchAvailability(data, selectedTime);
  }

  // Refresh availability on building or time change
  useEffect(() => {
    if (!buildings.length) return;
    fetchAvailability(buildings, selectedTime);
  }, [activeBuilding, selectedTime, buildings, fetchAvailability]);

  // Auto-refresh every 3 minutes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const now = new Date().toISOString().slice(0, 16);
      setSelectedTime(now);
    }, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentBuilding = buildings.find((b) => b.id === activeBuilding);
  const availMap = new Map(availability.map((a) => [a.email, a]));

  const ROOM_KEYWORDS = ["salle", "room", "conférence", "conference", "boardroom", "meeting"];
  const workspaces = currentBuilding?.resources.filter((r) => {
    const type = (r.type ?? "").toLowerCase();
    return !ROOM_KEYWORDS.some((kw) => type.includes(kw));
  }) ?? [];

  if (loadingResources) {
    return (
      <div className="flex items-center justify-center min-h-96 text-gray-400 text-sm">
        Chargement des ressources…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium" htmlFor="time-picker">
            Voir la disponibilité à
          </label>
          <input
            id="time-picker"
            type="datetime-local"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => {
            const now = new Date().toISOString().slice(0, 16);
            setSelectedTime(now);
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Maintenant
        </button>
        {loadingAvailability && (
          <span className="text-xs text-gray-400 animate-pulse">Actualisation…</span>
        )}
      </div>

      {/* Building tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBuilding(b.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeBuilding === b.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Resource grid */}
      {currentBuilding && activeBuilding?.toLowerCase() === MTL_BUILDING_ID.toLowerCase() ? (
        <FloorPlan
          resources={workspaces}
          availability={availMap}
          loading={loadingAvailability}
          selectedTime={selectedTime}
        />
      ) : currentBuilding && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {workspaces.map((r) => (
            <RoomCard
              key={r.id}
              resource={r}
              availability={availMap.get(r.email)}
              loading={loadingAvailability}
              selectedTime={selectedTime}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-12">
          Aucune ressource configurée pour ce bureau.
        </p>
      )}
    </div>
  );
}
