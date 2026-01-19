interface ReportPageProps {
  params: {
    type: string;
    campaignId: string;
    targetId: string;
  };
}

export default function ReportPage({ params }: ReportPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Reporte {params.type}</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Generación de PDFs vía Puppeteer para campaña {params.campaignId} y objetivo {params.targetId}.
        </p>
      </div>
    </div>
  );
}
