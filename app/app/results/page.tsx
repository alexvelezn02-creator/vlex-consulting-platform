import ResultsDashboard from '@/components/ResultsDashboard';
import { fetchCampaignSummary } from '@/lib/scoring';
import { prisma } from '@/lib/prisma';

const getTargetName = (result: Awaited<ReturnType<typeof prisma.campaignResult.findFirst>>) => {
  if (!result) return 'Target';
  return (
    result.target.person?.name ??
    result.target.orgUnit?.name ??
    result.target.process?.name ??
    'Target'
  );
};

export default async function ResultsPage() {
  const campaigns = await prisma.campaign.findMany({ include: { results: true } });
  const campaign = campaigns[0];

  if (!campaign) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl">Resultados</h1>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">No hay campañas disponibles.</p>
        </div>
      </div>
    );
  }

  const results = await prisma.campaignResult.findMany({
    where: { campaignId: campaign.id },
    include: {
      target: {
        include: {
          person: true,
          orgUnit: true,
          process: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl">Resultados</h1>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            No existen resultados computados. Ejecuta el cálculo vía la API POST `/api/results/recompute`.
          </p>
        </div>
      </div>
    );
  }

  const summary = await fetchCampaignSummary(campaign.id);

  const formattedResults = results.map((result) => ({
    id: result.id,
    targetName: getTargetName(result),
    orgIndex: result.orgIndex,
    blockGerencia: result.blockGerencia,
    blockPares: result.blockPares,
    blockAuto: result.blockAuto,
    perceptionGap: result.perceptionGap,
    dependencyConcentration: result.dependencyConcentration,
    riskLowScore: result.riskLowScore,
    riskGapHigh: result.riskGapHigh,
    missingRoleTypes: result.missingRoleTypes
  }));

  return <ResultsDashboard campaignName={campaign.name} summary={summary} results={formattedResults} />;
}
