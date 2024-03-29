import { draftMode } from 'next/headers'
import { toNextMetadata } from 'react-datocms'

import { performRequest } from '@/lib/datocms'
import { PAGE_BY_SLUG_QUERY } from '@/lib/datocms/queries/customPage'

import { CustomPage, DraftCustomPage } from '@/components/pages/CustomPage'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Locale } from '@/i18n'

export async function generateStaticParams() {
  const { allPosts } = await performRequest({ query: `{ allPosts { slug } }` })
  return allPosts.map(({ slug }: any) => slug)
}

function getPageRequest({ slug, locale }: PageProps['params']) {
  const { isEnabled } = draftMode()
  return {
    query: PAGE_BY_SLUG_QUERY,
    includeDrafts: isEnabled,
    variables: { slug, locale },
    // @todo: increase revalidate interval in production
    revalidate: 10,
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { site, page } = await performRequest(getPageRequest(params))
  return toNextMetadata([...site.favicon, ...page.seo])
}

type PageProps = {
  params: {
    slug: string
    locale: Locale
  }
}

export default async function Page({ params }: PageProps) {
  unstable_setRequestLocale(params.locale)
  const { isEnabled } = draftMode()
  const pageRequest = getPageRequest(params)
  const data = await performRequest(pageRequest)

  if (isEnabled) {
    return (
      <DraftCustomPage
        subscription={{
          ...pageRequest,
          initialData: data,
          token: process.env.NEXT_DATOCMS_READ_ONLY_API_TOKEN,
          environment: process.env.NEXT_DATOCMS_ENVIRONMENT || null,
        }}
      />
    )
  }

  return <CustomPage data={data} />
}
