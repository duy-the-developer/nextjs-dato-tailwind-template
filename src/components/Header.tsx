import Link from 'next/link'

export function Header() {
  return (
    <h2 className="mb-20 mt-8 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
      <Link href="/" className="hover:underline">
        Blog
      </Link>
      .
    </h2>
  )
}
