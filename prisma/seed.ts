import { PrismaClient, RoleType, TargetType, BottleneckReason } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Vlex Demo',
      users: {
        create: [{ email: 'admin@vlex.demo', name: 'Admin Demo' }]
      }
    }
  });

  const sales = await prisma.orgUnit.create({
    data: { tenantId: tenant.id, name: 'Área Comercial' }
  });
  const ops = await prisma.orgUnit.create({
    data: { tenantId: tenant.id, name: 'Operaciones' }
  });

  const people = await prisma.$transaction([
    prisma.person.create({
      data: { tenantId: tenant.id, name: 'Carla Pérez', title: 'Gerente Comercial', orgUnitId: sales.id }
    }),
    prisma.person.create({
      data: { tenantId: tenant.id, name: 'Diego Morales', title: 'Ejecutivo de Ventas', orgUnitId: sales.id }
    }),
    prisma.person.create({
      data: { tenantId: tenant.id, name: 'Lucía Torres', title: 'Gerente de Operaciones', orgUnitId: ops.id }
    }),
    prisma.person.create({
      data: { tenantId: tenant.id, name: 'Martín Ríos', title: 'Analista Operaciones', orgUnitId: ops.id }
    }),
    prisma.person.create({
      data: { tenantId: tenant.id, name: 'Sofía Díaz', title: 'Project Manager', orgUnitId: ops.id }
    })
  ]);

  const processes = await prisma.$transaction([
    prisma.process.create({
      data: { tenantId: tenant.id, name: 'Ventas B2B', description: 'Pipeline comercial B2B' }
    }),
    prisma.process.create({
      data: { tenantId: tenant.id, name: 'Onboarding', description: 'Proceso de incorporación de clientes' }
    })
  ]);

  const instrument = await prisma.instrument.create({
    data: {
      tenantId: tenant.id,
      name: 'Instrumento base 360',
      version: 1,
      sections: {
        create: [
          {
            title: 'Colaboración',
            order: 1,
            questions: {
              create: [
                { text: 'Coordina con áreas clave.', order: 1 },
                { text: 'Comparte información relevante.', order: 2 }
              ]
            }
          },
          {
            title: 'Resultados',
            order: 2,
            questions: {
              create: [
                { text: 'Cumple compromisos críticos.', order: 1 },
                { text: 'Gestiona prioridades.', order: 2 }
              ]
            }
          }
        ]
      }
    },
    include: { sections: { include: { questions: true } } }
  });

  const campaigns = await prisma.$transaction([
    prisma.campaign.create({
      data: {
        tenantId: tenant.id,
        name: 'Campaña 360 Personas',
        targetType: TargetType.PERSON,
        instrumentId: instrument.id,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    }),
    prisma.campaign.create({
      data: {
        tenantId: tenant.id,
        name: 'Campaña 180 Áreas',
        targetType: TargetType.ORG_UNIT,
        instrumentId: instrument.id,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    }),
    prisma.campaign.create({
      data: {
        tenantId: tenant.id,
        name: 'Campaña 180 Procesos',
        targetType: TargetType.PROCESS,
        instrumentId: instrument.id,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    })
  ]);

  const [personCampaign, orgCampaign, processCampaign] = campaigns;

  const roles = [
    { label: 'Gerencia', roleType: RoleType.GERENCIA },
    { label: 'Otro gerente', roleType: RoleType.PARES },
    { label: 'Subordinado / Par operativo', roleType: RoleType.PARES },
    { label: 'Autoevaluación', roleType: RoleType.AUTO }
  ];

  await prisma.campaignRole.createMany({
    data: campaigns.flatMap((campaign) =>
      roles.map((role) => ({
        campaignId: campaign.id,
        label: role.label,
        roleType: role.roleType
      }))
    )
  });

  const personTargets = await prisma.$transaction(
    people.slice(0, 3).map((person) =>
      prisma.campaignTarget.create({
        data: {
          campaignId: personCampaign.id,
          targetType: TargetType.PERSON,
          personId: person.id
        }
      })
    )
  );

  const orgTargets = await prisma.$transaction([
    prisma.campaignTarget.create({
      data: {
        campaignId: orgCampaign.id,
        targetType: TargetType.ORG_UNIT,
        orgUnitId: sales.id
      }
    }),
    prisma.campaignTarget.create({
      data: {
        campaignId: orgCampaign.id,
        targetType: TargetType.ORG_UNIT,
        orgUnitId: ops.id
      }
    })
  ]);

  const processTargets = await prisma.$transaction(
    processes.map((process) =>
      prisma.campaignTarget.create({
        data: {
          campaignId: processCampaign.id,
          targetType: TargetType.PROCESS,
          processId: process.id
        }
      })
    )
  );

  const tokens = await prisma.$transaction([
    prisma.token.create({
      data: {
        token: 'demo-persona-1',
        tenantId: tenant.id,
        campaignId: personCampaign.id,
        targetId: personTargets[0].id,
        roleLabel: 'Gerencia',
        roleType: RoleType.GERENCIA
      }
    }),
    prisma.token.create({
      data: {
        token: 'demo-persona-2',
        tenantId: tenant.id,
        campaignId: personCampaign.id,
        targetId: personTargets[0].id,
        roleLabel: 'Autoevaluación',
        roleType: RoleType.AUTO
      }
    }),
    prisma.token.create({
      data: {
        token: 'demo-area-1',
        tenantId: tenant.id,
        campaignId: orgCampaign.id,
        targetId: orgTargets[0].id,
        roleLabel: 'Otro gerente',
        roleType: RoleType.PARES
      }
    })
  ]);

  const response = await prisma.response.create({
    data: {
      tenantId: tenant.id,
      campaignId: personCampaign.id,
      targetId: personTargets[0].id,
      tokenId: tokens[0].id,
      roleType: RoleType.GERENCIA,
      roleLabel: 'Gerencia',
      answers: {
        create: instrument.sections.flatMap((section) =>
          section.questions.map((question) => ({
            questionId: question.id,
            score: 80
          }))
        )
      }
    },
    include: { answers: true }
  });

  const dependencyNodes = await prisma.$transaction([
    prisma.dependencyNode.create({
      data: {
        tenantId: tenant.id,
        nodeType: TargetType.ORG_UNIT,
        nodeRefId: sales.id
      }
    }),
    prisma.dependencyNode.create({
      data: {
        tenantId: tenant.id,
        nodeType: TargetType.ORG_UNIT,
        nodeRefId: ops.id
      }
    }),
    prisma.dependencyNode.create({
      data: {
        tenantId: tenant.id,
        nodeType: TargetType.PERSON,
        nodeRefId: people[0].id
      }
    })
  ]);

  await prisma.dependencyEdge.createMany({
    data: [
      {
        tenantId: tenant.id,
        campaignId: personCampaign.id,
        targetId: personTargets[0].id,
        responseId: response.id,
        fromNodeId: dependencyNodes[0].id,
        toNodeId: dependencyNodes[1].id,
        isBottleneck: true,
        bottleneckReason: BottleneckReason.TIME,
        optionalComment: 'Tiempo de respuesta lento.'
      },
      {
        tenantId: tenant.id,
        campaignId: personCampaign.id,
        targetId: personTargets[0].id,
        responseId: response.id,
        fromNodeId: dependencyNodes[0].id,
        toNodeId: dependencyNodes[2].id,
        isBottleneck: false
      }
    ]
  });

  console.log('Seed completado para tenant demo:', tenant.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
