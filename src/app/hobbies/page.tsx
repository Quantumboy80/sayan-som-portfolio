import HobbiesPageClient from "@/components/hobbies/HobbiesPageClient";
import { generateMetadata as getMetadata } from "@/config/Meta";

export const metadata = getMetadata("/hobbies");

export default function HobbiesPage() {
  return <HobbiesPageClient />;
}
