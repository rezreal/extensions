// shamelessly inspired by: https://github.com/ggaabe/rrule-temporal/blob/main/demo/src/App.tsx

import { startTransition, useEffect, useMemo, useState } from 'react'
import { Temporal } from '@js-temporal/polyfill'
import { RRuleTemporal } from 'rrule-temporal'
import { toText } from 'rrule-temporal/totext'
import {
  Select,
  Typography,
  Option,
  Box,
  Chip,
  IconButton,
  Button,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Sheet,
  FormLabel,
  FormControl,
} from '@mui/joy'
import { CloseRounded } from '@mui/icons-material'
import { useTranslation } from '@/app/i18n/client'

const defaultICS = `DTSTART;TZID=UTC:20250101T120000\nRRULE:FREQ=WEEKLY;BYHOUR=12`

const hourLabels = Array.from({ length: 24 }, (_, h) => h)
const monthLabels = Array.from({ length: 12 }, (_, h) => h + 1)

type Frequency =
  | 'YEARLY'
  | 'MONTHLY'
  | 'WEEKLY'
  | 'DAILY'
  | 'HOURLY'
  | 'MINUTELY'
  | 'SECONDLY'
const freqOpts = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'] as const

const dowTokens = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const

const pad = (n: number, len = 2) => n.toString().padStart(len, '0')
const toDateInput = (zdt: Temporal.ZonedDateTime) =>
  `${zdt.year}-${pad(zdt.month)}-${pad(zdt.day)}`
const toTimeInput = (zdt: Temporal.ZonedDateTime) =>
  `${pad(zdt.hour)}:${pad(zdt.minute)}:${pad(zdt.second)}`

export interface Props {
  lang: string
  rrule?: RRuleTemporal
  onConfirm: (rrule: RRuleTemporal) => unknown
}

export function RRule(props: Props) {
  const { t } = useTranslation()

  const [ics, setIcs] = useState(props.rrule?.toString() ?? defaultICS)
  const [visualErr, setVisualErr] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(60)

  // -------- derived rule + occurrences -------------------------------------
  const {
    ruleString,
    ruleText,
    error: derivedErr,
    nextString,
    nextUntilStr,
  } = useMemo(() => {
    try {
      const rule = new RRuleTemporal({ rruleString: ics.trim() })

      const next = rule.next() || undefined

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

      const nextString = next
        ? fmt.format(new Date(next.toInstant().epochMilliseconds))
        : ''
      const nextUntilStr = next
        ? fmt.format(
            new Date(
              next
                .add(Temporal.Duration.from({ minutes: duration }))
                .toInstant().epochMilliseconds,
            ),
          )
        : ''

      return {
        ruleString: rule.toString(),
        ruleText: toText(rule, props.lang),
        error: undefined,
        nextString,
        nextUntilStr,
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return {
        ruleString: '',
        ruleText: '',
        rows: [],
        error: message,
        nextString: '',
        nextUntilStr: '',
      }
    }
  }, [ics, props.lang, duration])

  const err = derivedErr ?? visualErr

  // -------- VISUAL form state ----------------------------------------------
  const [freq, setFreq] = useState<string>('WEEKLY')
  const [count, setCount] = useState<number | undefined>(undefined)
  const [tzid, setTzid] = useState('UTC')
  const [dtDate, setDtDate] = useState('2025-01-01')
  const [dtTime, setDtTime] = useState('12:00:00')
  const [byDay, setByDay] = useState<string[]>([])
  const [byHour, setByHour] = useState<number[]>([12])
  const [interval, setInterval] = useState(1)
  const [untilDate, setUntilDate] = useState('')
  const [untilTime, setUntilTime] = useState('00:00:00')
  const [byMinuteStr, setByMinuteStr] = useState('')
  const [bySecondStr, setBySecondStr] = useState('')
  const [byMonthStr, setByMonthStr] = useState('')
  const [byMonthDayStr, setByMonthDayStr] = useState('')

  const [byWeekNoStr, setByWeekNoStr] = useState('')
  const [bySetPosStr, setBySetPosStr] = useState('')
  const [wkst, setWkst] = useState('')
  const [rDateStr, setRDateStr] = useState('')

  const [maxIterations, setMaxIterations] = useState(10000)
  const [includeDtstart, setIncludeDtstart] = useState(false)

  // --- sync visual controls from raw ics when entering visual ---------------
  useEffect(() => {
    try {
      const opts = new RRuleTemporal({ rruleString: ics.trim() }).options()
      startTransition(() => {
        setFreq(opts.freq)
        setInterval(opts.interval ?? 1)
        setCount(opts.count)
        setUntilDate(opts.until ? toDateInput(opts.until) : '')
        setUntilTime(opts.until ? toTimeInput(opts.until) : '00:00:00')
        setTzid(opts.tzid ?? opts.dtstart.timeZoneId ?? 'UTC')
        setDtDate(toDateInput(opts.dtstart))
        setDtTime(toTimeInput(opts.dtstart))
        setByDay(opts.byDay ?? [])
        setByHour(
          opts.byHour ??
            (['MINUTELY', 'SECONDLY'].includes(opts.freq)
              ? []
              : [opts.dtstart.hour]),
        )
        setByMinuteStr(opts.byMinute ? opts.byMinute.join(',') : '')
        setBySecondStr(opts.bySecond ? opts.bySecond.join(',') : '')
        setByMonthStr(opts.byMonth ? opts.byMonth.join(',') : '')
        setByMonthDayStr(opts.byMonthDay ? opts.byMonthDay.join(',') : '')

        setByWeekNoStr(opts.byWeekNo ? opts.byWeekNo.join(',') : '')
        setBySetPosStr(opts.bySetPos ? opts.bySetPos.join(',') : '')
        setWkst(opts.wkst ?? '')
        setRDateStr(
          opts.rDate
            ? opts.rDate
                .map((d) => `${toDateInput(d)}T${toTimeInput(d)}`)
                .join(',')
            : '',
        )

        setMaxIterations(opts.maxIterations ?? 10000)
        setIncludeDtstart(opts.includeDtstart ?? false)
      })
    } catch (e) {
      /* ignore parse failure */
      console.log(e)
    }
  }, [ics])

  // --- rebuild ics when visual state changes --------------------------------
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dtDate)) return
    if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(dtTime)) return
    try {
      const [y, m, d] = dtDate.split('-').map(Number)
      const [hh, mm, ss] = dtTime.split(':').map(Number)
      const dtstart = Temporal.ZonedDateTime.from({
        year: y,
        month: m,
        day: d,
        hour: hh,
        minute: mm,
        second: ss ?? 0,
        timeZone: tzid,
      })
      const until = untilDate
        ? Temporal.ZonedDateTime.from({
            year: Number(untilDate.split('-')[0]),
            month: Number(untilDate.split('-')[1]),
            day: Number(untilDate.split('-')[2]),
            hour: Number(untilTime.split(':')[0] || 0),
            minute: Number(untilTime.split(':')[1] || 0),
            second: Number(untilTime.split(':')[2] || 0),
            timeZone: tzid,
          })
        : undefined

      const numList = (str: string) =>
        str.trim()
          ? str
              .split(/\s*,\s*/)
              .map((n) => parseInt(n, 10))
              .filter((n) => !isNaN(n))
          : undefined
      const dateList = (str: string): Temporal.ZonedDateTime[] | undefined => {
        if (!str.trim()) return undefined
        const parts = str.split(/\s*,\s*/)
        const out: Temporal.ZonedDateTime[] = []
        for (const p of parts) {
          try {
            out.push(Temporal.ZonedDateTime.from(p))
          } catch {
            try {
              out.push(Temporal.PlainDateTime.from(p).toZonedDateTime(tzid))
            } catch {
              /* ignore */
            }
          }
        }
        return out.length ? out : undefined
      }
      const rule = new RRuleTemporal({
        freq: freq as Frequency,
        interval,
        count: count || undefined,
        until,
        dtstart,
        tzid,
        maxIterations,
        includeDtstart,
        byDay: byDay.length ? byDay : undefined,
        byHour: ['MINUTELY', 'SECONDLY'].includes(freq)
          ? undefined
          : byHour.length
            ? [...byHour].sort((a, b) => a - b)
            : undefined,
        byMinute: numList(byMinuteStr),
        bySecond: numList(bySecondStr),
        byMonth: numList(byMonthStr),
        byMonthDay: numList(byMonthDayStr),
        byYearDay: undefined,
        byWeekNo: numList(byWeekNoStr),
        bySetPos: numList(bySetPosStr),
        wkst: wkst || undefined,
        rDate: dateList(rDateStr),
        exDate: undefined,
      })
      startTransition(() => {
        setIcs(rule.toString())
        setVisualErr(null)
      })
    } catch (e) {
      /* silent */
      console.log(e)
      const message = e instanceof Error ? e.message : String(e)
      startTransition(() => {
        setVisualErr(message)
      })
    }
  }, [
    freq,
    interval,
    count,
    untilDate,
    untilTime,
    tzid,
    dtDate,
    dtTime,
    byDay,
    byHour,
    byMinuteStr,
    bySecondStr,
    byMonthStr,
    byMonthDayStr,
    byWeekNoStr,
    bySetPosStr,
    wkst,
    rDateStr,
    maxIterations,
    includeDtstart,
  ])

  // -------------------------------------------------------------------------
  return (
    <Sheet variant="soft" sx={{ p: 1 }}>
      <Stack
        direction="column"
        spacing={1}
        sx={{
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        {/* ───────── INPUT COLUMN ───────── */}

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          {/* DTSTART date/time */}
          <FormControl>
            <FormLabel>Start</FormLabel>

            <Input
              size="sm"
              type="date"
              id="dtDate"
              value={dtDate}
              onChange={(e) => setDtDate(e.target.value)}
            />
            <Input
              size="sm"
              type="time"
              value={dtTime}
              onChange={(e) => setDtTime(e.target.value)}
            />
          </FormControl>

          <Typography component="label" noWrap>
            &nbsp;Every
          </Typography>
          {/* INTERVAL */}
          {interval === 1 ? (
            <Button onClick={() => setInterval(2)} variant="plain">
              Skip?
            </Button>
          ) : (
            <>
              <Input
                size="sm"
                type="number"
                slotProps={{ input: { min: 2, max: 365 } }}
                endDecorator={
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={() => {
                      setInterval(1)
                    }}
                  >
                    <CloseRounded />
                  </IconButton>
                }
                id="interval"
                value={`${interval}`}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              ></Input>
              <Typography component="label" noWrap>
                {t('common.key', { count: interval, ordinal: true })}
              </Typography>
            </>
          )}
        </Stack>

        {/* FREQ */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <RadioGroup
            name="freq"
            id="freq"
            onChange={(f) => setFreq(f.target.value)}
            orientation="horizontal"
          >
            {freqOpts.map((f) => (
              <Radio
                key={f}
                value={`${f}`}
                label={t(`time-and-place.frequency.${f}`, { count: interval })}
              />
            ))}
          </RadioGroup>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          {/* BYDAY */}
          <Select
            placeholder="On Weekday(s)"
            size="sm"
            multiple
            value={byDay}
            onChange={(e, value) =>
              setByDay(dowTokens.filter((dow) => value.includes(dow)))
            }
            endDecorator={
              <IconButton
                size="sm"
                variant="plain"
                color="neutral"
                onMouseDown={(event) => {
                  // don't open the popup when clicking on this button
                  event.stopPropagation()
                }}
                onClick={() => {
                  setByDay([])
                }}
              >
                <CloseRounded />
              </IconButton>
            }
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                On
                {selected.map((selectedOption) => (
                  <Chip key={selectedOption.value}>{selectedOption.label}</Chip>
                ))}
              </Box>
            )}
            sx={{ minWidth: '15rem' }}
            slotProps={{
              listbox: {
                sx: {
                  width: '100%',
                },
              },
            }}
          >
            {dowTokens.map((tok) => (
              <Option key={tok} id={tok} value={tok}>
                {tok}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="At Hours(s)"
            size="sm"
            multiple
            value={byHour}
            onChange={(e, value) =>
              setByHour(hourLabels.filter((hour) => value.includes(hour)))
            }
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                at
                {selected.map((selectedOption) => (
                  <Chip key={selectedOption.value}>{selectedOption.label}</Chip>
                ))}
              </Box>
            )}
            sx={{ minWidth: '15rem' }}
            endDecorator={
              <IconButton
                size="sm"
                variant="plain"
                color="neutral"
                onMouseDown={(event) => {
                  // don't open the popup when clicking on this button
                  event.stopPropagation()
                }}
                onClick={() => {
                  setByHour([])
                }}
              >
                <CloseRounded />
              </IconButton>
            }
            slotProps={{
              listbox: {
                sx: {
                  width: '100%',
                },
              },
            }}
          >
            {hourLabels.map((hour) => (
              <Option key={hour} value={hour}>
                {hour}
              </Option>
            ))}
          </Select>

          {/* BYMINUTE */}

          <Input
            startDecorator={<Typography>Minute</Typography>}
            size="sm"
            type="text"
            value={byMinuteStr}
            onChange={(e) => setByMinuteStr(e.target.value)}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          {/* BYMONTH */}
          <Select
            placeholder={'any'}
            startDecorator={<Typography>In Month(s)</Typography>}
            size="sm"
            multiple
            value={byMonthStr
              .split(',')
              .map((m) => Number.parseInt(m))
              .toSorted()}
            onChange={(e, value) => setByMonthStr(value.toSorted().join(','))}
            endDecorator={
              <IconButton
                size="sm"
                variant="plain"
                color="neutral"
                onMouseDown={(event) => {
                  // don't open the popup when clicking on this button
                  event.stopPropagation()
                }}
                onClick={() => {
                  setByMonthStr('')
                }}
              >
                <CloseRounded />
              </IconButton>
            }
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                {selected.map((selectedOption) => (
                  <Chip key={selectedOption.value}>{selectedOption.label}</Chip>
                ))}
              </Box>
            )}
            sx={{ minWidth: '15rem' }}
            slotProps={{
              listbox: {
                sx: {
                  width: '100%',
                },
              },
            }}
          >
            {monthLabels.map((month) => (
              <Option key={month} value={month}>
                {month}
              </Option>
            ))}
          </Select>

          <Typography>or</Typography>

          {/* BYMONTHDAY */}

          <Input
            startDecorator={<Typography>At Day of month</Typography>}
            type="text"
            value={byMonthDayStr}
            onChange={(e) => setByMonthDayStr(e.target.value)}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Input
            startDecorator={<Typography>Duration</Typography>}
            endDecorator={<Typography>Minutes</Typography>}
            value={duration}
            type="number"
            slotProps={{ input: { min: 5, step: 5, max: 3600 } }}
            onChange={(e) => setDuration(Number.parseInt(e.target.value))}
          />
        </Stack>
        <Stack alignContent={'center'} justifyContent={'center'}>
          {err && (
            <Typography component="p" color="danger">
              {err}
            </Typography>
          )}

          {/* ───────── OUTPUT COLUMN ───────── */}

          {ruleText && (
            <Typography
              component="p"
              textAlign={'center'}
              style={{ fontStyle: 'italic' }}
              title={ruleString}
            >
              {ruleText}
            </Typography>
          )}

          {ruleText && (
            <Typography component="p">
              Next chance to open: {nextString} until {nextUntilStr}
            </Typography>
          )}
          <Button
            onClick={() =>
              props.onConfirm(new RRuleTemporal({ rruleString: ics }))
            }
          >
            Accept
          </Button>
        </Stack>
      </Stack>
    </Sheet>
  )
}
