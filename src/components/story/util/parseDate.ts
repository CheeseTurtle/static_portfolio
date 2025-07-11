export default   function parseDate(
  x: string,
  stringWithTime: boolean = false
): [Date, string] {
  const m =
    /(?<year>\d{4})(?:-(?<month>\d\d?)(?:-(?:(?<day>\d\d?)(?: (?<hour>\d\d?):(?<minute>\d\d))?)?)?)?/.exec(
      x
    );
  // console.assert(m !== null && m.groups, `Invalid date string: ${x}`);
  if (!m || !m.groups || m.groups.year === undefined) {
    throw `Invalid date string: ${x}`;
  } // TODO
  let month = m.groups.month,
    day = m.groups.day,
    year = m.groups.year;
  if (m.groups.month === undefined) {
    month = m.groups.day = "01";
    stringWithTime = false;
  } else {
    if (!(m.groups.month.length & 0b10)) {
      month = "0" + m.groups.month;
    }
    if (m.groups.day === undefined) {
      day = "01";
      stringWithTime = false;
    } else {
      if (!(m.groups.day.length & 2)) {
        day = "0" + m.groups.day;
      }
    }
  }

  let dateStr = `${year}-${month}-${day}`;
  let dateStrReturn = m.groups.day === undefined ? `${year}-${month}` : dateStr;
  let timeStr = "";
  if (m.groups.hour !== undefined) {
    let minuteStr = m.groups.minute === undefined ? "00" : m.groups.minute;
    let hourString = m.groups.hour;
    if (!(hourString.length & 0b10)) hourString = "0" + hourString;
    timeStr = ` ${hourString}:${minuteStr}`;
  } else {
    timeStr = " 00:00";
    stringWithTime = false;
  }
  dateStr += timeStr;
  if (stringWithTime) dateStrReturn += timeStr;
  return [new Date(dateStr), dateStrReturn];
}
