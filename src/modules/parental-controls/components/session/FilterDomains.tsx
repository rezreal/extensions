import {
  Button,
  Card,
  Chip,
  IconButton,
  Input,
  Select,
  Option,
  Sheet,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import { BlockActionCode } from '../../lib/qApi'

import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { Delete, Add } from '@mui/icons-material'

function FilterDomains({
  domains,
  disabled,
  onChange,
}: {
  domains: Record<string, BlockActionCode>
  disabled: boolean
  onChange: (domains: Record<string, BlockActionCode>) => void
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'parental_controls' })

  const [newDomain, setNewDomain] = useState<[string, BlockActionCode]>([
    '',
    BlockActionCode.BLOCK,
  ])

  function deleteDomain(d: string) {
    const ds = { ...domains }
    delete ds[d]
    onChange(ds)
  }

  return (
    <>
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography level="h2" sx={{ mb: 2 }}>
          {t('filterDomains.title')}
        </Typography>
        <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
          {t(`filterDomains.description`)}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Input
            placeholder="Enter domain (e.g., example.com)"
            onChange={(e) => setNewDomain([e.target.value, newDomain[1]])}
            sx={{ flex: 1 }}
          />
          <Select
            value={newDomain[1]}
            onChange={(_, val) => setNewDomain([newDomain[0], val!])}
          >
            <Option value={BlockActionCode.ALLOW}>Allow</Option>
            <Option value={BlockActionCode.BLOCK}>Deny</Option>
            <Option value={BlockActionCode.REPORT}>Report</Option>
          </Select>
          <Button
            startDecorator={<Add />}
            onClick={addDomain}
            loading={disabled}
          >
            Add Domain
          </Button>
        </Stack>

        <Sheet variant="outlined" sx={{ borderRadius: 'sm', overflow: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <th>Domain</th>
                <th style={{ width: 100 }}>Type</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(domains).map((domain, i) => (
                <tr key={i}>
                  <td>{domain}</td>
                  <td>
                    <Chip
                      color={
                        domains[domain] === BlockActionCode.ALLOW
                          ? 'success'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {domains[domain] === BlockActionCode.BLOCK ? '🔒' : '🔓'}{' '}
                      {BlockActionCode[domains[domain]]}
                    </Chip>
                  </td>
                  <td>
                    <IconButton
                      size="sm"
                      color="danger"
                      onClick={() => deleteDomain(domain)}
                      disabled={disabled}
                    >
                      <Delete />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </Card>
    </>
  )

  function addDomain() {
    onChange({ ...domains, [newDomain[0]]: newDomain[1] })
  }
}

export default FilterDomains
