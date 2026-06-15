'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceDot, ResponsiveContainer } from 'recharts';

// Definição de algumas funções matemáticas para o usuário interagir
const FUNCOES = {
  quadratica: { label: 'f(x) = x²', fn: (x) => x ** 2 },
  linear: { label: 'f(x) = 2x + 1', fn: (x) => 2 * x + 1 },
  cubica: { label: 'f(x) = x³ - 2x', fn: (x) => x ** 3 - 2 * x }
};

export default function SimuladorLimites() {
  const [tipoFuncao, setTipoFuncao] = useState('quadratica');
  const [targetA, setTargetA] = useState(2);
  const [deltaX, setDeltaX] = useState(-1.2); // Distância de x' em relação ao ponto 'a'

  const fn = FUNCOES[tipoFuncao].fn;
  
  // Cálculos matemáticos baseados no estado
  const L = useMemo(() => fn(targetA), [fn, targetA]);
  const xLinha = useMemo(() => targetA + deltaX, [targetA, deltaX]);
  const fxLinha = useMemo(() => fn(xLinha), [fn, xLinha]);
  const erroY = useMemo(() => Math.abs(fxLinha - L), [fxLinha, L]);

  // Gera os pontos da curva dinamicamente ao redor do ponto 'a'
  const dadosGrafico = useMemo(() => {
    const pontos = [];
    const minX = targetA - 3;
    const maxX = targetA + 3;
    // Incrementos de 0.1 para desenhar a curva suavemente
    for (let x = minX; x <= maxX; x += 0.1) {
      pontos.push({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(fn(x).toFixed(2))
      });
    }
    return pontos;
  }, [targetA, fn]);

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1a202c', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontFamily: 'sans-serif', margin: '20px 0' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2d3748' }}>Simulador de Limites</h3>
      
      {/* Painel de Controles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Escolha a Função f(x):</label>
          <select 
            value={tipoFuncao} 
            onChange={(e) => { setTipoFuncao(e.target.value); setDeltaX(-1.2); }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
          >
            {Object.keys(FUNCOES).map(key => (
              <option key={key} value={key}>{FUNCOES[key].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Defina o Ponto &apos;a&apos;:</label>
          <input 
            type="number" 
            value={targetA} 
            onChange={(e) => { setTargetA(Number(e.target.value)); setDeltaX(-1.2); }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      {/* Slider de Aproximação */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
          Mover x&apos; em direção a &apos;a&apos; (x&apos; = <span style={{ color: '#38a169' }}>{xLinha.toFixed(2)}</span>):
        </label>
        <input 
          type="range" 
          min="-2" 
          max="2" 
          step="0.01" 
          value={deltaX} 
          onChange={(e) => setDeltaX(parseFloat(e.target.value))} 
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#718096', marginTop: '4px' }}>
          <span>Aproximação pela Esquerda (x&apos; &lt; a)</span>
          <span>Aproximação pela Direita (x&apos; &gt; a)</span>
        </div>
      </div>

      {/* Área do Gráfico */}
      <div style={{ width: '100%', height: 350, marginBottom: '24px', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosGrafico} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} stroke="#718096" />
            <YAxis type="number" stroke="#718096" />
            
            {/* Curva da Função */}
            <Line type="monotone" dataKey="y" stroke="#3182ce" dot={false} strokeWidth={2.5} isAnimationActive={false} />

            {/* Linhas de Projeção Fixas (a, L) */}
            <ReferenceLine x={targetA} stroke="#e53e3e" strokeDasharray="3 3" />
            <ReferenceLine y={L} stroke="#e53e3e" strokeDasharray="3 3" />
            <ReferenceDot x={targetA} y={L} r={6} fill="#e53e3e" stroke="#fff" strokeWidth={2} label={{ value: `L = ${L.toFixed(1)}`, position: 'top', fill: '#e53e3e', fontWeight: 'bold' }} />

            {/* Linhas de Projeção Móveis (x', f(x')) */}
            <ReferenceLine x={xLinha} stroke="#38a169" strokeDasharray="4 4" />
            <ReferenceLine y={fxLinha} stroke="#38a169" strokeDasharray="4 4" />
            <ReferenceDot x={xLinha} y={fxLinha} r={6} fill="#38a169" stroke="#fff" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de Dados Numéricos */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', border: '1px solid #e2e8f0' }}>
        <thead>
          <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '10px 12px', fontWeight: '600' }}>Métrica</th>
            <th style={{ padding: '10px 12px', fontWeight: '600' }}>Posição Atual</th>
            <th style={{ padding: '10px 12px', fontWeight: '600' }}>Distância Restante (Erro)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: '10px 12px' }}>Eixo X (Domínio)</td>
            <td style={{ padding: '10px 12px' }}>x&apos; = {xLinha.toFixed(4)}</td>
            <td style={{ padding: '10px 12px', color: '#dd6b20' }}>|x&apos; - a| = {Math.abs(deltaX).toFixed(4)}</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px' }}>Eixo Y (Imagem)</td>
            <td style={{ padding: '10px 12px' }}>f(x&apos;) = {fxLinha.toFixed(4)}</td>
            <td style={{ padding: '10px 12px', color: '#e53e3e', fontWeight: '600' }}>|f(x&apos;) - L| = {erroY.toFixed(4)}</td>
          </tr>
        </tbody>
      </table>
      
      <p style={{ fontSize: '13px', color: '#4a5568', marginTop: '12px', fontStyle: 'italic', lineHeight: '1.4' }}>
        * Observe analiticamente: Conforme a distância no domínio <strong>|x&apos; - a|</strong> encolhe em direção a zero, a distância na imagem <strong>|f(x&apos;) - L|</strong> também é forçada a diminuir, demonstrando o comportamento do limite.
      </p>
    </div>
  );
}