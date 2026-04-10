// Route handled by app/page.tsx to avoid duplicate-route conflict
import { notFound } from 'next/navigation';
export default function PublicHomePage() {
  notFound();
}
