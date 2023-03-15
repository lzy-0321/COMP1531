export function timetable(dates: Date[], times: [number, number][]): Date[] {
  const datestore: Date[] = [];
  for (const date of dates) {
    for (const time of times) {
      datestore.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time[0], time[1]));
    }
  }
  // Sort the dates by times number
  return datestore.sort((a, b) => a.getTime() - b.getTime());
}
