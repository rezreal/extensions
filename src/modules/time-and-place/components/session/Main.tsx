import { LockStatusEnum, PartnerUserRoleEnum } from '@chasterapp/chaster-js'
import { Box, Button, CssVarsProvider, Stack, Typography } from '@mui/joy'
import type { TimeAndPlacePublicGetSessionAuthResponse } from '../../types/publicTypes'
import { toText } from 'rrule-temporal/totext'
import { startTransition, useEffect, useState } from 'react'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import z from 'zod'

type Props = {
  auth: TimeAndPlacePublicGetSessionAuthResponse
}

const geoLookupSchema = z.object({
  display_name: z.string().nonempty(),
})

function Main({ auth }: Props) {
  //const { t } = useTranslation("time-and-place")

  const [userLocation, setUserLocation] = useState<
    GeolocationPosition | undefined
  >()
  const [userLocationName, setUserLocationName] = useState<string>('')

  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      throw new Error('No geolocation support. Please use a device with GPS.')
    }

    const position: GeolocationPosition = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(
        (p) => res(p),
        (e) => rej(e),
        {
          enableHighAccuracy: true,
          /*maximumAge: 0,*/
          timeout: 30000,
        },
      ),
    )
    setUserLocation(position)
  }

  useEffect(() => {
    if (!userLocation?.coords.longitude || !userLocation.coords.latitude) return
    const call = async () => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lon=${
          userLocation.coords.longitude
        }&lat=${userLocation.coords.latitude}`,
      )
      const geoLookup = geoLookupSchema.parse(await response.json())
      setUserLocationName(geoLookup.display_name)
    }
    startTransition(() => call())
  }, [userLocation?.coords.longitude, userLocation?.coords.latitude])

  useEffect(() => {
    const handle = navigator.geolocation.watchPosition(
      (pos) => setUserLocation(pos),
      null,
      { maximumAge: 0, timeout: 30000, enableHighAccuracy: false },
    )
    return () => {
      navigator.geolocation.clearWatch(handle)
    }
  }, [])

  const openTimeSpaces = auth.session.config.unlockations.filter(
    (u) => !auth.session.data.unlocked.includes(u.id),
  )

  return (
    <Stack p={2} gap={2}>
      {auth.role === PartnerUserRoleEnum.Keyholder &&
      auth.session.lock.status === LockStatusEnum.Locked ? (
        <>
          <Typography>Reconfigure from extension configuration.</Typography>
        </>
      ) : (
        <></>
      )}

      {auth.session.config.unlockations.map((a) =>
        a.when ? <Typography key={a.id}>{toText(a.when)}</Typography> : <></>,
      )}
      <Button onClick={() => getUserLocation()}>Locate</Button>

      {JSON.stringify(userLocation?.coords)}

      {userLocationName}

      {userLocation ? (
        <Box
          sx={{
            height: { xs: 400, md: 500 },
            borderRadius: 'sm',
            overflow: 'hidden',
          }}
        >
          <CssVarsProvider>
            <MapContainer
              center={[
                userLocation.coords.latitude ?? 0,
                userLocation.coords.longitude ?? 0,
              ]}
              zoom={13}
              zoomControl={false}
              attributionControl={false}
              preferCanvas={true}
              doubleClickZoom="center"
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {openTimeSpaces.map((e) =>
                e.where ? (
                  <Circle
                    key={e.id}
                    radius={e.where.maxDistance}
                    center={[e.where.latitude, e.where.longitude]}
                  >
                    <Popup>{toText(e.when)}</Popup>
                  </Circle>
                ) : (
                  <></>
                ),
              )}

              <CircleMarker
                center={[
                  userLocation.coords.latitude,
                  userLocation.coords.longitude,
                ]}
              ></CircleMarker>
            </MapContainer>
          </CssVarsProvider>
        </Box>
      ) : (
        <></>
      )}
    </Stack>
  )
}

export default Main
