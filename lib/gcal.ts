export function buildGCalUrl(resourceEmail: string, title: string, isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const fmt = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, "");
  const start = fmt(d);
  const end = fmt(new Date(d.getTime() + 86_400_000));
  return (
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${start}%2F${end}` +
    `&add=${encodeURIComponent(resourceEmail)}`
  );
}
