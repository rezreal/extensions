import { formatRelative } from 'date-fns'
import { type TimelineEntry, TimelineEntryType } from '../../lib/qApi'
import {
  Box,
  Card,
  CssVarsProvider,
  Divider,
  Stack,
  Typography,
} from '@mui/joy'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { MyLocation, QuestionMark } from '@mui/icons-material'
import 'leaflet/dist/leaflet.css'

function LocationHistory({ events }: { events: readonly TimelineEntry[] }) {
  const locationUpdates = events.filter(
    (e) => e.type === TimelineEntryType.Location,
  )
  const pathCoordinates: [number, number][] = locationUpdates.map((e) => [
    e.location_latitude!,
    e.location_longitude!,
  ])

  return (
    <>
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography level="h2" sx={{ mb: 2 }}>
          Location History
        </Typography>
        <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
          Your lockees&apos;s movements throughout the day
        </Typography>

        {locationUpdates.length > 0 ? (
          <Box
            sx={{
              height: { xs: 400, md: 500 },
              borderRadius: 'sm',
              overflow: 'hidden',
            }}
          >
            <CssVarsProvider>
              <MapContainer
                center={pathCoordinates[0]}
                zoom={13}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline
                  positions={pathCoordinates}
                  color="blue"
                  weight={3}
                  opacity={0.6}
                />
                {locationUpdates.map((loc, idx) => (
                  <Marker
                    key={idx}
                    position={[loc.location_longitude!, loc.location_latitude!]}
                  >
                    <Popup>
                      <strong>{loc.location_address ?? 'Unknown'}</strong>
                      <br />
                      {loc.location_time
                        ? formatRelative(loc.location_time, new Date())
                        : ''}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </CssVarsProvider>
          </Box>
        ) : (
          ''
        )}

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          <Typography level="title-sm">Today&apos;s Journey:</Typography>

          {locationUpdates.length === 0 ? (
            <Typography startDecorator={<QuestionMark />} level="body-md">
              No location entries yet
            </Typography>
          ) : (
            ''
          )}
          {locationUpdates.map((loc, idx) => (
            <Stack key={idx} direction="row" spacing={1} alignItems="center">
              <Typography startDecorator={<MyLocation />} level="body-sm">
                <a
                  href={`geo:${loc.location_latitude},${loc.location_longitude}?z=13`}
                  onClick={async () =>
                    navigator.canShare({ url: '' })
                      ? await navigator.share({
                          url: `geo:${loc.location_latitude},${loc.location_longitude}?z=13`,
                        })
                      : {}
                  }
                >
                  <strong>
                    {loc.location_time
                      ? formatRelative(loc.location_time, new Date())
                      : ''}
                  </strong>{' '}
                  - {loc.location_address ?? 'Unknown'} ({})
                </a>
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Card>
    </>
  )
}

export default LocationHistory
