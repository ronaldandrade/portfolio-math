import { DownloadGate } from "../../components/features/DownloadGate";
import PageHeader from "../../components/PageHeader";

const materials = [
  {
    id: 1,
    title: "Ebook: Machine Learning para Iniciantes",
    description: "Meu guia introdutório sobre os fundamentos do machine learning, com exemplos práticos e código comentado.",
    type: "PDF",
    fileUrl: "https://mymrspjrihlbrkswnzjl.supabase.co/storage/v1/object/public/materiais/Fundamentos_de_Machine_Learning_para_Iniciantes.pdf"
  },
  {
    id: 2,
    title: "Aula de Funções - Material de Apoio",
    description: "Resumo dos principais tipos de funções, gráficos e exercícios resolvidos.",
    type: "PDF",
    fileUrl: "https://mymrspjrihlbrkswnzjl.supabase.co/storage/v1/object/public/materiais/MAP_09_Funcoes_primeiro_e_segundo_grau.pdf"
  },
  {
    id: 3,
    title: "Aula de Porcentagem - Livro de Apoio",
    description: "Um guia rápido com as principais fórmulas e exemplos práticos sobre porcentagem.",
    type: "PDF",
    fileUrl: "https://mymrspjrihlbrkswnzjl.supabase.co/storage/v1/object/public/materiais/MAP_08_Porcentagem_livro_apoio.pdf"
  },
  
];

export default function MaterialsPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 pb-20">
      <PageHeader
        eyebrow="Materiais."
        title="Biblioteca de estudos."
        description="PDFs, resumos e guias para baixar. O download é liberado para membros."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-border pt-10">
        {materials.map((item) => (
          <div key={item.id} className="bg-card p-6 flex flex-col gap-4">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                {item.type}
              </span>
              <h3 className="text-lg font-extrabold leading-snug mt-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mt-2">{item.description}</p>
            </div>
            <div className="mt-auto pt-4">
              <DownloadGate fileName={item.title} fileUrl={item.fileUrl} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
