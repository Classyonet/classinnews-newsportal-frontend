import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default function Page({ params }: { params: { slug: string } }) {
  redirect(`/articles/${params.slug}`)
}
