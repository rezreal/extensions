import { formatDuration, formatRelative } from 'date-fns'
import { useState, type ReactElement } from 'react'
import { Platform, type TimelineEntry, TimelineEntryType } from '../../lib/qApi'
import { z } from 'zod'
import { Avatar, Button, Card, Sheet, Stack, Table, Typography } from '@mui/joy'
import { Block, AccessTime } from '@mui/icons-material'
import 'leaflet/dist/leaflet.css'

const LocationAddressSchema = z.object({
  addressLines: z.array(z.string().nonempty()).nonempty(),
})

function Activity({ events }: { events: readonly TimelineEntry[] }) {
  const [currentPage, setCurrentPage] = useState(1)

  const nonLocationEvents = events.filter(
    (e) => e.type !== TimelineEntryType.Location,
  )
  const itemsPerPage = 10
  const totalPages = Math.max(
    1,
    Math.ceil(nonLocationEvents.length / itemsPerPage),
  )
  const paginatedEvents = nonLocationEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  function actualTime(e: TimelineEntry): number {
    return (
      Date.parse(e.dt) + (e.utc_diff_seconds ? e.utc_diff_seconds : 0) * 1000
    )
  }

  function renderEvent(e: TimelineEntry): ReactElement {
    switch (e.type) {
      case TimelineEntryType.WebSearch:
        return (
          <>
            searched {e.search_engine} for: {e.text}
          </>
        )
      case TimelineEntryType.PageVisit:
        return (
          <>
            Page visited:{' '}
            <a href={e.url} target={'_blank'}>
              {e.host}
            </a>
          </>
        )
      case TimelineEntryType.AppUsage:
        return <>App: {e.name}</>
      case TimelineEntryType.Location:
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${e.location_latitude}%2C${e.location_longitude}`

        return (
          <>
            Location:{' '}
            <a href={mapsLink} target="_blank" referrerPolicy={'no-referrer'}>
              {' '}
              {e.location_address
                ? LocationAddressSchema.parse(JSON.parse(e.location_address))
                    .addressLines
                : ''}
              &nbsp; 📍
            </a>
          </>
        )
    }
  }

  function renderTimes(e: TimelineEntry): ReactElement {
    return (
      <span>
        {formatRelative(actualTime(e), new Date())}
        {e.type === TimelineEntryType.AppUsage && e.minutes
          ? ` for ${formatDuration({ minutes: e.minutes })}`
          : ''}
      </span>
    )
  }

  return (
    <>
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography level="h2" sx={{ mb: 2 }}>
          App History
        </Typography>
        <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
          Recent app usage and search history
        </Typography>

        <Sheet
          variant="outlined"
          sx={{ borderRadius: 'sm', overflow: 'auto', mb: 2 }}
        >
          <Table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Activity</th>
                <th>Time</th>
                <th>Device</th>
                <th style={{ width: 120 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((entry, i) => (
                <tr key={i}>
                  <td>
                    {entry.type === TimelineEntryType.AppUsage ? (
                      <Avatar
                        sx={{ width: 24, height: 24 }}
                        alt={entry.name}
                        src={entry.thumbnail?.replace('s3://', 'https://')}
                      />
                    ) : (
                      ''
                    )}
                  </td>
                  <td>{renderEvent(entry)}</td>
                  <td>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        startDecorator={<AccessTime />}
                        level="body-sm"
                      >
                        {renderTimes(entry)}
                      </Typography>
                    </Stack>
                  </td>
                  <td>
                    <td>
                      {entry.device.name} ({Platform[entry.device.platform]})
                    </td>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outlined"
                      color="danger"
                      startDecorator={<Block />}
                      //onClick={() => addBlockedApp(entry.app)}
                      //disabled={blockedApps.includes(entry.app)}
                    >
                      Block
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <Button
            size="sm"
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Typography level="body-sm">
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            size="sm"
            variant="outlined"
            disabled={currentPage == totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </Stack>
      </Card>
    </>
  )
}

export default Activity
