import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export interface ResourceAvailability {
  email: string;
  busy: { start: string; end: string; occupant: string | null }[];
  status: "free" | "busy";
  currentOccupant: string | null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { emails, timeMin, timeMax, targetTime } = await req.json() as {
    emails: string[];
    timeMin: string;
    timeMax: string;
    targetTime: string;
  };

  if (!emails?.length || !timeMin || !timeMax || !targetTime) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const target = targetTime;

  const results = await Promise.all(
    emails.map(async (email): Promise<ResourceAvailability> => {
      try {
        const eventsRes = await calendar.events.list({
          calendarId: email,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 50,
        });

        const events = eventsRes.data.items ?? [];
        const busy = events
          .filter((e) => e.status !== "cancelled" && e.start?.dateTime && e.end?.dateTime)
          .map((e) => ({
            start: e.start!.dateTime!,
            end: e.end!.dateTime!,
            occupant: e.organizer?.displayName ?? e.organizer?.email ?? null,
          }));

        const currentEvent = busy.find((b) => b.start <= target && target <= b.end);
        return {
          email,
          busy,
          status: currentEvent ? "busy" : "free",
          currentOccupant: currentEvent?.occupant ?? null,
        };
      } catch {
        return { email, busy: [], status: "free", currentOccupant: null };
      }
    })
  );

  return NextResponse.json(results);
}
