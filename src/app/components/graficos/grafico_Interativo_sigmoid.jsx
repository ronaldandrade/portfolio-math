'use client';

// components/GraficoAtivacao.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Gera os dados para o gráfico
const gerarDados = () => {
  const dados = [];
  for (let x = -10; x <= 10; x += 0.5) {
    const sigmoide = 1 / (1 + Math.exp(-x));
    const derivadaSigmoide = sigmoide * (1 - sigmoide);
    dados.push({ 
      x: x.toFixed(1), 
      sigmoide: sigmoide, 
      derivada: derivadaSigmoide 
    });
  }
  return dados;
};

export default function GraficoAtivacao() {
  const data = gerarDados();

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sigmoide" stroke="#8884d8" name="Função Sigmoide" dot={false} />
          <Line type="monotone" dataKey="derivada" stroke="#ff7300" name="Derivada (Max 0.25)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}