import { parseISO, format } from 'date-fns'

export function Date({ dateString }: any) {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, 'LLLL	d, yyyy')}</time>
}
