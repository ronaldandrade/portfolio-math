import { DownloadGate } from "../../components/features/DownloadGate";

const materials = [
  {
    id: 1,
    title: "Aula de Porcentagem - Livro de Apoio",
    description: "Um guia rápido com as principais fórmulas e exemplos práticos sobre porcentagem.",
    type: "PDF",
    fileUrl: "https://mymrspjrihlbrkswnzjl.supabase.co/storage/v1/object/public/materiais/MAP_08_Porcentagem_livro_apoio.pdf"
  },
  {
    id: 2,
    title: "Aula de Funções - Material de Apoio",
    description: "Resumo dos principais tipos de funções, gráficos e exercícios resolvidos.",
    type: "PDF",
    fileUrl: "https://mymrspjrihlbrkswnzjl.supabase.co/storage/v1/object/public/materiais/MAP_09_Funcoes_primeiro_e_segundo_grau.pdf"
  }
];

export default function MaterialsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-serif font-bold mb-8 text-text">Biblioteca de Estudos</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {materials.map((item) => (
          <div key={item.id} className="bg-surface/50 border border-muted/10 p-6 rounded-xl flex flex-col gap-4">
            <div>
              <span className="text-xs font-mono text-primary px-2 py-1 bg-primary/10 rounded">{item.type}</span>
              <h3 className="text-xl font-semibold mt-3 text-text">{item.title}</h3>
              <p className="text-primary text-sm mt-2">{item.description}</p>
            </div>
            <div className="mt-auto  pt-4">
              <DownloadGate fileName={item.title} fileUrl={item.fileUrl} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}