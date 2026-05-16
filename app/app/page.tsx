import DashboardClient from '@/components/DashboardClient';
import {
  getCaretaker,
  getSenior,
  getFamilyContacts,
  getEvents,
  getSettings,
} from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [caretaker, senior, contacts, events, settings] = await Promise.all([
    getCaretaker(),
    getSenior(),
    getFamilyContacts(),
    getEvents(),
    getSettings(),
  ]);

  return (
    <DashboardClient
      caretaker={caretaker}
      senior={senior}
      contacts={contacts}
      events={events}
      initialPausedUntilIso={settings.paused_until}
    />
  );
}
