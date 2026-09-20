export function renderWorkflowsView() {
  const pipelines = [
    { name: "Executive Document RAG Pipeline", status: "Active", steps: 6, engine: "Azure GPT-4.1 + pgvector", icon: "⚡" },
    { name: "Financial KPI Margin Compression Diagnostic", status: "Ready", steps: 4, engine: "Azure GPT-4.1 Mini", icon: "📊" },
    { name: "Enterprise Due Diligence Red Flag Scanner", status: "Draft", steps: 7, engine: "Azure AI Foundry Agent", icon: "🛡️" }
  ];

  return `
    <div class="full-tab-workspace">
      <div>
        <h1 class="tab-header-title">Multi-Agent Workflow Pipelines</h1>
        <p class="tab-header-desc">Inspect, configure, and monitor orchestrated DAG pipelines that power ConsultAI decision making.</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:1rem;">
        ${pipelines.map(p => `
          <div style="background:#FFFFFF;border:1px solid var(--color-border);border-radius:var(--radius-md);padding:1.25rem;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow-sm);">
            <div style="display:flex;align-items:center;gap:1rem;">
              <div style="width:42px;height:42px;border-radius:10px;background:var(--color-primary-light);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-size:1.3rem;">
                ${p.icon}
              </div>
              <div>
                <div style="font-weight:700;font-size:0.95rem;color:var(--color-text-main);">${p.name}</div>
                <div style="font-size:0.75rem;color:var(--color-text-muted);">${p.steps} DAG Execution Nodes · Engine: ${p.engine}</div>
              </div>
            </div>
            <span style="font-size:0.75rem;font-weight:600;padding:0.25rem 0.65rem;border-radius:9999px;background:${p.status === 'Active' ? '#DEF7EC' : '#F1F5F9'};color:${p.status === 'Active' ? '#03543F' : '#475569'};">
              ${p.status}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
