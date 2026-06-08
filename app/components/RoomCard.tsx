"use client";

import { CalendarResource } from "@/app/api/resources/route";
import { ResourceAvailability } from "@/app/api/availability/route";

interface Props {
  resource: CalendarResource;
  availability: ResourceAvailability | undefined;
  loading: boolean;
}

export function RoomCard({ resource, availability, loading }: Props) {
  const status = availability?.status;

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
        loading
          ? "border-gray-200 bg-gray-50"
          : status === "free"
          ? "border-green-200 bg-green-50"
          : status === "busy"
          ? "border-red-200 bg-red-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 text-sm leading-tight">{resource.name}</h3>
        <StatusBadge status={status} loading={loading} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {resource.type && (
          <span className="bg-white border border-gray-200 rounded px-1.5 py-0.5">
            {resource.type}
          </span>
        )}
        {resource.capacity && (
          <span className="bg-white border border-gray-200 rounded px-1.5 py-0.5">
            {resource.capacity} pers.
          </span>
        )}
      </div>

      {!loading && availability?.status === "busy" && availability.currentOccupant && (
        <p className="text-xs text-red-600 font-medium mt-1">
          {availability.currentOccupant}
        </p>
      )}

      {!loading && availability && availability.busy.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          <p className="font-medium text-gray-600 mb-0.5">Réservations aujourd&apos;hui</p>
          {availability.busy.slice(0, 3).map((b, i) => (
            <p key={i}>
              {formatTime(b.start)} – {formatTime(b.end)}
              {b.occupant && <span className="text-gray-400"> · {b.occupant}</span>}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  loading,
}: {
  status: "free" | "busy" | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 animate-pulse">
        …
      </span>
    );
  }
  if (status === "free") {
    return (
      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
        Libre
      </span>
    );
  }
  if (status === "busy") {
    return (
      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
        Occupé
      </span>
    );
  }
  return null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Toronto",
  });
}
