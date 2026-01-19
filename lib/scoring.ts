import { RoleType, TargetType } from '@prisma/client';
import { prisma } from './prisma';

const ROLE_WEIGHTS: Record<RoleType, number> = {
  GERENCIA: 0.35,
  PARES: 0.4,
  AUTO: 0.25
};

const EXPECTED_ROLE_TYPES: RoleType[] = ['GERENCIA', 'PARES', 'AUTO'];

type RoleStats = {
  sum: number;
  count: number;
};

type RoleMap = Record<RoleType, RoleStats>;

const emptyRoleMap = (): RoleMap => ({
  GERENCIA: { sum: 0, count: 0 },
  PARES: { sum: 0, count: 0 },
  AUTO: { sum: 0, count: 0 }
});

const toAverageMap = (roleMap: RoleMap): Record<RoleType, number | null> => ({
  GERENCIA: roleMap.GERENCIA.count ? roleMap.GERENCIA.sum / roleMap.GERENCIA.count : null,
  PARES: roleMap.PARES.count ? roleMap.PARES.sum / roleMap.PARES.count : null,
  AUTO: roleMap.AUTO.count ? roleMap.AUTO.sum / roleMap.AUTO.count : null
});

const computeWeighted = (roleAverages: Record<RoleType, number | null>) => {
  const present = EXPECTED_ROLE_TYPES.filter((roleType) => roleAverages[roleType] !== null);
  const missing = EXPECTED_ROLE_TYPES.filter((roleType) => roleAverages[roleType] === null);
  const totalWeight = present.reduce((sum, roleType) => sum + ROLE_WEIGHTS[roleType], 0);

  if (present.length === 0 || totalWeight === 0) {
    return { weighted: null, missing };
  }

  const weighted = present.reduce((sum, roleType) => {
    return sum + (roleAverages[roleType] ?? 0) * ROLE_WEIGHTS[roleType];
  }, 0) / totalWeight;

  return { weighted, missing };
};

const computeGap = (autoScore: number | null, othersScore: number | null) => {
  if (autoScore === null || othersScore === null) {
    return null;
  }
  return Math.abs(autoScore - othersScore);
};

const computeOthersWeighted = (roleAverages: Record<RoleType, number | null>) => {
  const present = ['GERENCIA', 'PARES'] as RoleType[];
  const available = present.filter((roleType) => roleAverages[roleType] !== null);
  if (available.length === 0) {
    return null;
  }
  const totalWeight = available.reduce((sum, roleType) => sum + ROLE_WEIGHTS[roleType], 0);
  return available.reduce((sum, roleType) => sum + (roleAverages[roleType] ?? 0) * ROLE_WEIGHTS[roleType], 0) / totalWeight;
};

export async function computeCampaignResults(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      targets: true,
      instrument: {
        include: {
          sections: {
            include: { questions: true }
          }
        }
      }
    }
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const questionToSection = new Map<string, string>();
  campaign.instrument.sections.forEach((section) => {
    section.questions.forEach((question) => {
      questionToSection.set(question.id, section.id);
    });
  });

  const existingResults = await prisma.campaignResult.findMany({
    where: { campaignId },
    select: { id: true }
  });

  if (existingResults.length) {
    await prisma.$transaction([
      prisma.questionScore.deleteMany({
        where: { campaignResultId: { in: existingResults.map((result) => result.id) } }
      }),
      prisma.sectionScore.deleteMany({
        where: { campaignResultId: { in: existingResults.map((result) => result.id) } }
      }),
      prisma.roleScore.deleteMany({
        where: { campaignResultId: { in: existingResults.map((result) => result.id) } }
      }),
      prisma.campaignResult.deleteMany({
        where: { id: { in: existingResults.map((result) => result.id) } }
      })
    ]);
  }

  const results = [] as { id: string; targetId: string }[];

  for (const target of campaign.targets) {
    const responses = await prisma.response.findMany({
      where: { campaignId, targetId: target.id },
      include: {
        answers: true
      }
    });

    const overallByRoleType = emptyRoleMap();
    const roleLabelStats = new Map<string, RoleStats>();
    const questionStats = new Map<string, RoleMap>();
    const sectionStats = new Map<string, RoleMap>();

    responses.forEach((response) => {
      response.answers.forEach((answer) => {
        const roleType = response.roleType;
        overallByRoleType[roleType].sum += answer.score;
        overallByRoleType[roleType].count += 1;

        const labelKey = `${response.roleType}:${response.roleLabel}`;
        const labelStats = roleLabelStats.get(labelKey) ?? { sum: 0, count: 0 };
        labelStats.sum += answer.score;
        labelStats.count += 1;
        roleLabelStats.set(labelKey, labelStats);

        const questionRoleMap = questionStats.get(answer.questionId) ?? emptyRoleMap();
        questionRoleMap[roleType].sum += answer.score;
        questionRoleMap[roleType].count += 1;
        questionStats.set(answer.questionId, questionRoleMap);

        const sectionId = questionToSection.get(answer.questionId);
        if (sectionId) {
          const sectionRoleMap = sectionStats.get(sectionId) ?? emptyRoleMap();
          sectionRoleMap[roleType].sum += answer.score;
          sectionRoleMap[roleType].count += 1;
          sectionStats.set(sectionId, sectionRoleMap);
        }
      });
    });

    const overallAverages = toAverageMap(overallByRoleType);
    const overallWeighted = computeWeighted(overallAverages);
    const othersWeighted = computeOthersWeighted(overallAverages);

    const dependencyEdges = await prisma.dependencyEdge.findMany({
      where: { campaignId, targetId: target.id },
      select: { toNodeId: true }
    });

    const dependencyCounts = dependencyEdges.reduce((acc, edge) => {
      acc.set(edge.toNodeId, (acc.get(edge.toNodeId) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());

    const totalDependencies = dependencyEdges.length;
    const topDependency = Math.max(0, ...Array.from(dependencyCounts.values()));
    const dependencyConcentration = totalDependencies > 0 ? topDependency / totalDependencies : null;

    const perceptionGap = computeGap(overallAverages.AUTO, othersWeighted);

    const result = await prisma.campaignResult.create({
      data: {
        campaignId,
        targetId: target.id,
        targetType: target.targetType ?? campaign.targetType,
        orgIndex: overallWeighted.weighted,
        blockGerencia: overallAverages.GERENCIA,
        blockPares: overallAverages.PARES,
        blockAuto: overallAverages.AUTO,
        perceptionGap,
        dependencyConcentration,
        riskLowScore: (overallWeighted.weighted ?? 0) < 70,
        riskGapHigh: (perceptionGap ?? 0) > 15,
        missingRoleTypes: overallWeighted.missing
      }
    });

    const questionScores = Array.from(questionStats.entries())
      .map(([questionId, roleMap]) => {
        const weighted = computeWeighted(toAverageMap(roleMap)).weighted;
        if (weighted === null) {
          return null;
        }
        return { campaignResultId: result.id, questionId, weightedScore: weighted };
      })
      .filter((item): item is { campaignResultId: string; questionId: string; weightedScore: number } => item !== null);

    const sectionScores = Array.from(sectionStats.entries())
      .map(([sectionId, roleMap]) => {
        const weighted = computeWeighted(toAverageMap(roleMap)).weighted;
        if (weighted === null) {
          return null;
        }
        return { campaignResultId: result.id, sectionId, weightedScore: weighted };
      })
      .filter((item): item is { campaignResultId: string; sectionId: string; weightedScore: number } => item !== null);

    const roleScores = Array.from(roleLabelStats.entries()).map(([key, stats]) => {
      const [roleType, roleLabel] = key.split(':');
      return {
        campaignResultId: result.id,
        roleType: roleType as RoleType,
        roleLabel,
        averageScore: stats.sum / stats.count,
        responseCount: stats.count
      };
    });

    if (questionScores.length) {
      await prisma.questionScore.createMany({ data: questionScores });
    }
    if (sectionScores.length) {
      await prisma.sectionScore.createMany({ data: sectionScores });
    }
    if (roleScores.length) {
      await prisma.roleScore.createMany({ data: roleScores });
    }

    results.push({ id: result.id, targetId: target.id });
  }

  return { campaignId, results };
}

export async function fetchCampaignResults(campaignId: string) {
  return prisma.campaignResult.findMany({
    where: { campaignId },
    include: {
      target: {
        include: {
          person: true,
          orgUnit: true,
          process: true
        }
      },
      questionScores: true,
      sectionScores: true,
      roleScores: true
    }
  });
}

export async function fetchCampaignSummary(campaignId: string) {
  const results = await fetchCampaignResults(campaignId);
  if (!results.length) {
    return null;
  }

  const orgIndex = results.reduce((sum, result) => sum + (result.orgIndex ?? 0), 0) / results.length;
  const riskCount = results.filter((result) => result.riskLowScore || result.riskGapHigh).length;

  return {
    orgIndex,
    riskCount,
    totalTargets: results.length
  };
}
