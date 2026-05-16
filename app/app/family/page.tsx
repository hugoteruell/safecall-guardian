import FamilyClient from '@/components/FamilyClient';
import { getFamilyContacts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function FamilyPage() {
  const contacts = await getFamilyContacts();
  return <FamilyClient contacts={contacts} />;
}
