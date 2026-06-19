"use client";

import { CalendarResource } from "@/app/api/resources/route";
import { ResourceAvailability } from "@/app/api/availability/route";
import { MTL_FLOORPLAN, DeskSpot } from "@/lib/mtl-floorplan";
import { buildGCalUrl } from "@/lib/gcal";

interface Props {
  resources: CalendarResource[];
  availability: Map<string, ResourceAvailability>;
  loading: boolean;
  selectedTime: string;
}

export function FloorPlan({ resources, availability, loading, selectedTime }: Props) {
  // Match resources by "Bureau #N" pattern inferred from desk id
  const resourceByDeskId = new Map(
    resources.map((r) => {
      const match = r.name.match(/#\s*(\d+)/);
      return match ? [parseInt(match[1]), r] : null;
    }).filter((x): x is [number, typeof resources[0]] => x !== null)
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-12 items-start min-w-fit p-4">
        {MTL_FLOORPLAN.map((section) => (
          <div
            key={section.id}
            className={`flex gap-3 ${
              section.id === "center" ? "flex-row items-start" : "flex-col"
            }`}
          >
            {section.groups.map((group, gi) => (
              <div
                key={gi}
                className={`flex gap-1.5 ${
                  section.id === "center" ? "flex-col" : "flex-col"
                }`}
              >
                {group.desks.map((desk) => {
                  const resource = resourceByDeskId.get(desk.id);
                  const avail = resource ? availability.get(resource.email) : undefined;
                  return (
                    <DeskCell
                      key={desk.id}
                      desk={desk}
                      resource={resource}
                      availability={avail}
                      loading={loading}
                      selectedTime={selectedTime}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 px-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-200 border border-green-400 inline-block" />
          Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-200 border border-red-400 inline-block" />
          Occupé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300 inline-block" />
          Non configuré
        </span>
      </div>
    </div>
  );
}

function DeskCell({
  desk,
  resource,
  availability,
  loading,
  selectedTime,
}: {
  desk: DeskSpot;
  resource: CalendarResource | undefined;
  availability: ResourceAvailability | undefined;
  loading: boolean;
  selectedTime: string;
}) {
  const status = availability?.status;
  const isPortrait = desk.orientation === "portrait";
  const isClickable = !loading && status === "free" && resource;

  const colorClass = loading
    ? "bg-gray-100 border-gray-300 animate-pulse"
    : !resource
    ? "bg-gray-50 border-dashed border-gray-300"
    : status === "free"
    ? "bg-green-50 border-green-300 hover:bg-green-100"
    : status === "busy"
    ? "bg-red-50 border-red-300 hover:bg-red-100"
    : "bg-gray-100 border-gray-300";

  const label = resource?.name ?? `#${desk.id}`;
  const shortLabel = label.replace(/bureau\s*/i, "").trim() || `${desk.id}`;

  const handleClick = () => {
    if (!isClickable) return;
    window.open(buildGCalUrl(resource.email, label, selectedTime), "_blank");
  };

  return (
    <div
      onClick={handleClick}
      title={
        resource
          ? `${label}${availability?.currentOccupant ? ` · ${availability.currentOccupant}` : ""}${isClickable ? " — Cliquer pour réserver" : ""}`
          : `Position ${desk.id} — non configurée`
      }
      className={`
        border-2 rounded-lg flex flex-col items-center justify-center transition-colors select-none
        ${isClickable ? "cursor-pointer" : "cursor-default"}
        ${isPortrait ? "w-16 h-28" : "w-28 h-14"}
        ${colorClass}
      `}
    >
      <span className="text-xs font-semibold text-gray-700 text-center leading-tight px-1">
        {shortLabel}
      </span>
      {!loading && availability?.currentOccupant && (
        <span className="text-[10px] text-red-600 text-center leading-tight px-1 mt-0.5 line-clamp-2">
          {firstNameOnly(availability.currentOccupant)}
        </span>
      )}
    </div>
  );
}

function firstNameOnly(name: string) {
  return name.split(/[\s@]/)[0];
}
