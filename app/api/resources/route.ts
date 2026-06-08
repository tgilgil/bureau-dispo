import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export interface CalendarResource {
  id: string;
  name: string;
  email: string;
  buildingId: string;
  buildingName: string;
  type: string;
  capacity: number | null;
}

export interface Building {
  id: string;
  name: string;
  resources: CalendarResource[];
}

// Cache in memory for 1 hour
let cache: { data: Building[]; ts: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000;

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const admin = google.admin({ version: "directory_v1", auth: oauth2Client });

  const resourcesRes = await admin.resources.calendars.list({
    customer: "my_customer",
    maxResults: 500,
  });

  const items = resourcesRes.data.items ?? [];

  // Fetch building names
  const buildingsRes = await admin.resources.buildings.list({
    customer: "my_customer",
  });
  const buildingMap = new Map<string, string>(
    (buildingsRes.data.buildings ?? []).map((b) => [
      b.buildingId ?? "",
      b.buildingName ?? b.buildingId ?? "Inconnu",
    ])
  );

  // Group by building
  const buildingsMap = new Map<string, Building>();
  for (const item of items) {
    const buildingId = item.buildingId ?? "unknown";
    const buildingName = buildingMap.get(buildingId) ?? buildingId;

    if (!buildingsMap.has(buildingId)) {
      buildingsMap.set(buildingId, { id: buildingId, name: buildingName, resources: [] });
    }

    buildingsMap.get(buildingId)!.resources.push({
      id: item.resourceId ?? "",
      name: item.resourceName ?? "Sans nom",
      email: item.resourceEmail ?? "",
      buildingId,
      buildingName,
      type: item.resourceType ?? "Salle",
      capacity: item.capacity ?? null,
    });
  }

  const data = Array.from(buildingsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  cache = { data, ts: Date.now() };
  return NextResponse.json(data);
}
