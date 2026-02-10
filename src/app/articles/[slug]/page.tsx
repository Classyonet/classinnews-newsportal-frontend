import ArticlePage from './ClientContent'

export async function generateStaticParams() {
  return [{ slug: '_placeholder' }]
}

export default function Page() {
  return <ArticlePage />
}
