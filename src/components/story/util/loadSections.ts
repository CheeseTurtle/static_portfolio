// import {
//   getCollection,
//   getEntries,
//   getEntry,
//   render,
//   reference,
// } from "astro:content";

import type { MarkdownInstance, MDXInstance } from "astro";
import type { StorySectionFrontmatter } from "./types/types";

export default function loadSections() {
  const allSectionsRecord = import.meta.glob<
    | MarkdownInstance<StorySectionFrontmatter>
    | MDXInstance<StorySectionFrontmatter>
  >("src/pages/story/sections/*.{md,mdx}", { eager: true });
  const allSections = Object.values(allSectionsRecord);
  // console.log("HELLO");
  function parseDate(x: string): Date {
    let m =
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
    } else {
      if (!(m.groups.month.length & 0b10)) {
        month = "0" + m.groups.month;
      }
      if (m.groups.day === undefined) {
        day = "01";
      } else {
        if (!(m.groups.day.length & 2)) {
          day = "0" + m.groups.day;
        }
      }
    }

    let dateStr = `${year}-${month}-${day}`;
    if (m.groups.hour !== undefined) {
      let minuteStr = m.groups.minute === undefined ? "00" : m.groups.minute;
      let hourString = m.groups.hour;
      if (!(hourString.length & 0b10)) hourString = "0" + hourString;
      dateStr += ` ${hourString}:${minuteStr}`;
    } else {
      dateStr += " 00:00";
    }
    const date = new Date(dateStr);

    // console.log(year,month,day,date);
    return date;
    //   return new Date(`${m.groups.year}-${m.groups.month}-${m.groups.day}`);
  }

  function parseDateOrder(x: string): number {
    const d = parseDate(x);
    return d.valueOf();
  }

  allSections.sort(
    (a, b) =>
      parseDateOrder(a.frontmatter.date) - parseDateOrder(b.frontmatter.date)
  );

  return allSections;
}
