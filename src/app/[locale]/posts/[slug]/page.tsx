import { draftMode } from 'next/headers'
import { toNextMetadata } from 'react-datocms'

import { performRequest } from '@/lib/datocms'
import { metaTagsFragment, responsiveImageFragment } from '@/lib/fragments'

import { DraftPostPage } from '@/components/DraftPostPage'
import { PostPage } from '@/components/PostPage'

export async function generateStaticParams() {
  const { allPosts } = await performRequest({ query: `{ allPosts { slug } }` })

  return allPosts.map(({ slug }: any) => slug)
}

const PAGE_CONTENT_QUERY = `
  query PostBySlug($slug: String) {
    site: _site {
      favicon: faviconMetaTags {
        ...metaTagsFragment
      }
    }
    post(filter: {slug: {eq: $slug}}) {
      seo: _seoMetaTags {
        ...metaTagsFragment
      }
      title
      slug
      content {
        value
        blocks {
          __typename
          ...on ImageBlockRecord {
            id
            image {
              responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
                ...responsiveImageFragment
              }
            }
          }
        }
      }
      date
      ogImage: coverImage{
        url(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 })
      }
      coverImage {
        responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
          ...responsiveImageFragment
        }
      }
      author {
        name
        picture {
          responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 100, h: 100, sat: -100}) {
            ...responsiveImageFragment
          }
        }
      }
    }

    morePosts: allPosts(orderBy: date_DESC, first: 2, filter: {slug: {neq: $slug}}) {
      title
      slug
      excerpt
      date
      coverImage {
        responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
          ...responsiveImageFragment
        }
      }
      author {
        name
        picture {
          responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 100, h: 100, sat: -100}) {
            ...responsiveImageFragment
          }
        }
      }
    }
  }

  ${responsiveImageFragment}
  ${metaTagsFragment}
`

function getPageRequest(slug: string) {
  const { isEnabled } = draftMode()

  return {
    query: PAGE_CONTENT_QUERY,
    includeDrafts: isEnabled,
    variables: { slug },
  }
}

export async function generateMetadata({ params }: any) {
  const { site, post } = await performRequest(getPageRequest(params.slug))

  return toNextMetadata([...site.favicon, ...post.seo])
}

export default async function Page({ params }: any) {
  const { isEnabled } = draftMode()

  const pageRequest = getPageRequest(params.slug)
  const data = await performRequest(pageRequest)

  if (isEnabled) {
    return (
      <DraftPostPage
        subscription={{
          ...pageRequest,
          initialData: data,
          token: process.env.NEXT_DATOCMS_API_TOKEN,
          environment: process.env.NEXT_DATOCMS_ENVIRONMENT || null,
        }}
      />
    )
  }

  return <PostPage data={data} />
}