'use client'

import { WebCategory } from '../../lib/qApi'
import { useTranslation } from '@/app/i18n/client'
import { FormGroup } from '@mui/material'
import { Box, Button, Card, Checkbox, Grid, Typography } from '@mui/joy'
import type { UseFormReturn } from 'react-hook-form'
import {
  Attractions,
  Block,
  Casino,
  Chat,
  Email,
  Explicit,
  Google,
  Instagram,
  Newspaper,
  NoAdultContent,
  Save,
  ShoppingBag,
  SportsEsports,
} from '@mui/icons-material'
import type { FormEventHandler } from 'react'

type Props = {
  form: UseFormReturn<{ categories: WebCategory[] }>
  formHandler: FormEventHandler<HTMLFormElement>
  disabled: boolean
}

function FilterContent({
  form: { getValues, setValue, watch },
  formHandler,
  disabled,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'parental_controls' })

  const titles: { [key in WebCategory]?: string } = {
    [WebCategory.PORNOGRAPHY]: t('webcategory.PORNOGRAPHY'),
    [WebCategory.MATURE_CONTENT]: t('webcategory.MATURE_CONTENT'),
    [WebCategory.CHAT]: t('webcategory.CHAT'),
    [WebCategory.ENTERTAINMENT]: t('webcategory.ENTERTAINMENT'),
    [WebCategory.GAMBLING]: t('webcategory.GAMBLING'),
    [WebCategory.GAMES]: t('webcategory.GAMES'),
    [WebCategory.FORUMS]: t('webcategory.FORUMS'),
    [WebCategory.NEWS]: t('webcategory.NEWS'),
    [WebCategory.EDUCATION]: t('webcategory.EDUCATION'),
    [WebCategory.FILE_SHARING]: t('webcategory.FILE_SHARING'),
    [WebCategory.SEARCH_ENGINES]: t('webcategory.SEARCH_ENGINES'),
    [WebCategory.SOCIAL_NETWORKS]: t('webcategory.SOCIAL_NETWORKS'),
    [WebCategory.SHOPPING]: t('webcategory.SHOPPING'),
    [WebCategory.PROXIES_LOOPHOLES]: t('webcategory.PROXIES_LOOPHOLES'),
    [WebCategory.PROFANITY]: t('webcategory.PROFANITY'),
    [WebCategory.VIOLENCE]: t('webcategory.VIOLENCE'),
    [WebCategory.WEBMAIL]: t('webcategory.WEBMAIL'),
    [WebCategory.TOBACCO]: t('webcategory.TOBACCO'),
    [WebCategory.WEAPONS]: t('webcategory.WEAPONS'),
    [WebCategory.DRUGS]: t('webcategory.DRUGS'),
    [WebCategory.ALCOHOL]: t('webcategory.ALCOHOL'),
  }
  function iconForCategory(category: WebCategory) {
    switch (category) {
      case WebCategory.SHOPPING:
        return <ShoppingBag />
      case WebCategory.PORNOGRAPHY:
        return <NoAdultContent />
      case WebCategory.MATURE_CONTENT:
        return <Explicit />
      case WebCategory.CHAT:
        return <Chat />
      case WebCategory.ENTERTAINMENT:
        return <Attractions />
      case WebCategory.GAMBLING:
        return <Casino />
      case WebCategory.GAMES:
        return <SportsEsports />
      case WebCategory.NEWS:
        return <Newspaper />
      case WebCategory.WEBMAIL:
        return <Email />
      case WebCategory.SEARCH_ENGINES:
        return <Google />
      case WebCategory.SOCIAL_NETWORKS:
        return <Instagram />
      default:
        return <Block />
    }
  }

  return (
    <>
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography level="h2" sx={{ mb: 2 }}>
          {t('filterContent.title')}
        </Typography>
        <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
          {t(`filterContent.description`)}
        </Typography>

        <form onSubmit={formHandler}>
          <FormGroup>
            <Grid container spacing={2}>
              {Object.keys(titles)
                .map((k) => Number.parseInt(k))
                .map((i) => i as WebCategory)
                .map((c: WebCategory) => (
                  <Grid xs={12} sm={6} md={4} lg={3} key={c}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        size="md"
                        checkedIcon={iconForCategory(c) || ''}
                        color="danger"
                        checked={watch('categories').includes(c)}
                        onChange={(e) =>
                          setValue(
                            'categories',
                            e.target.checked
                              ? [...getValues('categories'), c]
                              : getValues('categories').filter(
                                  (ic) => ic !== c,
                                ),
                          )
                        }
                        label={titles[c]}
                      />
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </FormGroup>
          <Button startDecorator={<Save />} loading={disabled} type="submit">
            Save
          </Button>
        </form>
      </Card>
    </>
  )
}

export default FilterContent
