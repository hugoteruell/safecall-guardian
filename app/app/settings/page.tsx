import SettingsClient from '@/components/SettingsClient';
import { getCaretaker, getSenior, getSettings } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [caretaker, senior, settings] = await Promise.all([
    getCaretaker(),
    getSenior(),
    getSettings(),
  ]);
  return <SettingsClient caretaker={caretaker} senior={senior} initial={settings} />;
}
