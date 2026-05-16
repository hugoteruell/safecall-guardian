import AnalysisScreen from '@/components/AnalysisScreen';
import { SCENARIOS } from '@/lib/mockScenarios';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = {
  searchParams: Promise<{ scenario?: string; skip?: string }>;
};

export default async function AnalysisPage({ searchParams }: Props) {
  const { scenario: scenarioId = 'fake_son', skip } = await searchParams;
  const scenario = SCENARIOS[scenarioId];

  if (!scenario) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-2xl text-slate-800 mb-6 leading-relaxed">
            We couldn&apos;t load this check. Try again from the home screen.
          </p>
          <Link
            href="/"
            className="inline-flex min-h-[64px] px-8 items-center justify-center bg-blue-900 hover:bg-blue-950 text-white text-lg font-bold rounded-2xl"
          >
            Go home
          </Link>
        </div>
      </main>
    );
  }

  return <AnalysisScreen scenario={scenario} skipAnimation={skip === '1'} />;
}
