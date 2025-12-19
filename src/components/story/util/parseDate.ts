type ExplicitDate = {
  year?: number;
  month?: number;
  day?: number;
}

type ExplicitTime = {
  hour?: number;
  minute?: number;
  second?: number;
  amPm?: boolean;
}

type ExplicitDateTime = ExplicitDate & ExplicitTime;

export interface ParsedDate extends Date {
  explicitDate?: ExplicitDate;
  explicitTime?: ExplicitTime;
}

// type DateTimeSpec = {
//   year?: number,
//   month?: number,
//   day?: number,
// };


const _DATE = new Date();

export function createParsedDate(spec: ExplicitDateTime, date?: Date): ParsedDate {

  const explicitDate: ExplicitDate | undefined = (
    (spec.year !== undefined || spec.month !== undefined || spec.day !== undefined)
    ?
    {
      year: spec.year, month: spec.month, day: spec.day
    }
    :
    undefined
  );

  const explicitTime: ExplicitTime | undefined = (
    (spec.hour !== undefined || spec.minute !== undefined || spec.second !== undefined)
    ?
    {
      hour: spec.hour, minute: spec.minute, second: spec.second, amPm: spec.amPm
    }
    :
    undefined
  );

  const date_ =(date ??  new Date(spec.year ?? _DATE.getFullYear(), spec.month ?? _DATE.getMonth(), 
        spec.day, spec.hour, spec.minute, spec.second)) as ParsedDate;
  date_.explicitDate = explicitDate;
  date_.explicitTime = explicitTime;
  return date_;
}


export default function parseDate(
  x: string,
  stringWithTime: boolean = false
): [ParsedDate, string] {
  const m =
    /(?<year>\d{4})(?:[-/](?<month>\d\d?)(?:[-/](?:(?<day>\d\d?)(?: (?<hour>\d\d?):(?<minute>\d\d))?)?)?)?/.exec(
      x
    );
  // console.assert(m !== null && m.groups, `Invalid date string: ${x}`);


  const explicitDateTime: ExplicitDateTime = {};

  if (!m || !m.groups || m.groups.year === undefined) {
    throw new Error(`Invalid date string: ${x}`);
  } // TODO
  let month = m.groups.month,
    day = m.groups.day,
    // eslint-disable-next-line prefer-const
    year = m.groups.year;
    explicitDateTime.year = Number(year);
  if (m.groups.month === undefined) {
    month = m.groups.day = "01";
    stringWithTime = false;
  } else {
    if (!(m.groups.month.length & 0b10)) {
      month = "0" + m.groups.month;
    }
    explicitDateTime.month = Number(m.groups.month);
    if (m.groups.day === undefined) {
      day = "01";
      stringWithTime = false;
    } else {
      explicitDateTime.day = Number(m.groups.day);
      if (!(m.groups.day.length & 2)) {
        day = "0" + m.groups.day;
      }
    }
  }

  let dateStr = `${year}-${month}-${day}`;
  let dateStrReturn = m.groups.day === undefined ? `${year}-${month}` : dateStr;
  let timeStr = "";
  if (m.groups.hour !== undefined) {
    explicitDateTime.hour = Number(m.groups.hour);
    explicitDateTime.minute = m.groups.minute ? Number(m.groups.minute) : undefined;
    explicitDateTime.second = m.groups.second ? Number(m.groups.second) : undefined;
    // eslint-disable-next-line prefer-const
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
  return [createParsedDate(explicitDateTime, new Date(dateStr)), dateStrReturn]
}
