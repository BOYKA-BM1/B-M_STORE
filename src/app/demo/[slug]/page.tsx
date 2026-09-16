import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

/** Legacy path → live demo runner */
export default async function DemoRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/d/${slug}/`);
}
