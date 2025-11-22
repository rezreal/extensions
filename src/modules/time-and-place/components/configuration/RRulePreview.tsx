import { Sheet, Table, Typography } from '@mui/joy'
import { useMemo } from 'react'
import type { RRuleTemporal } from 'rrule-temporal'
import { toText } from 'rrule-temporal/totext'

export interface Props {
  lang: string
  rule: RRuleTemporal
}

export function RRulePreview(props: Props) {
  // -------- derived rule + occurrences -------------------------------------
  const { ruleString, ruleText, rows } = useMemo(() => {
    try {
      const rule = props.rule
      const fmt = new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      })
      const rows = rule
        .all((_, i) => i < 30)
        .map((dt, i) => {
          const parts = fmt.formatToParts(
            new Date(dt.toInstant().epochMilliseconds),
          )
          const bag: Record<string, string> = {}
          parts.forEach((p) => (bag[p.type] = p.value))
          return {
            idx: i + 1,
            dow: bag.weekday,
            day: bag.day,
            month: bag.month,
            year: Number(bag.year),
            time: `${bag.hour}:${bag.minute}:${bag.second}`,
            tz: bag.timeZoneName,
          }
        })
      return {
        ruleString: rule.toString(),
        ruleText: toText(rule, props.lang),
        rows,
        error: null,
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return { ruleString: '', ruleText: '', rows: [], error: message }
    }
  }, [props.rule, props.lang])

  return (
    <>
      <Typography level="h2">Output</Typography>
      <Typography fontStyle={'italic'}>{ruleText}</Typography>
      <pre className="">{ruleString}</pre>

      <Sheet>
        <Table></Table>
      </Sheet>

      <table className="min-w-full">
        <thead className="sticky top-0">
          <tr>
            <th>#</th>
            <th>Day</th>
            <th>Date</th>
            <th>Time</th>
            <th>TZ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.idx}>
              <td>{r.idx}</td>
              <td>{r.dow}</td>
              <td>{`${r.day} ${r.month} ${r.year}`}</td>
              <td>{r.time}</td>
              <td>{r.tz}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
