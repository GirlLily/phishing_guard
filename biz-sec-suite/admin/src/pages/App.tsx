import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_POLICY_API_BASE || "";
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "";

type PolicySummary = {
  companyId: string;
  version: number;
  issuedAt: string;
};

type EventItem = {
  origin: string;
  similarityBand: string;
  ts: string;
  type: string;
};

export function App(): JSX.Element {
  const [companyId, setCompanyId] = useState("");
  const [policy, setPolicy] = useState<PolicySummary | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState("");

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(API_TOKEN ? { authorization: `Bearer ${API_TOKEN}` } : {})
  };

  async function fetchPolicy(): Promise<void> {
    if (!companyId || !API_BASE) return;
    const res = await fetch(`${API_BASE}/policy/${companyId}`);
    if (!res.ok) {
      setMessage("No policy yet");
      setPolicy(null);
      return;
    }
    const data = await res.json();
    setPolicy({ companyId: data.companyId, version: data.version, issuedAt: data.issuedAt });
    setMessage("");
  }

  async function fetchEvents(): Promise<void> {
    if (!API_BASE) return;
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) return;
    const data = await res.json();
    setEvents(data.slice(-50).reverse());
  }

  async function updateAllowlist(list: string[]): Promise<void> {
    if (!companyId || !API_BASE) return;
    await fetch(`${API_BASE}/companies/${companyId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ authOriginsAllowlist: list })
    });
    setMessage("Allowlist updated");
    await fetchPolicy();
  }

  async function createCompany(): Promise<void> {
    if (!companyId || !API_BASE) return;
    await fetch(`${API_BASE}/companies`, {
      method: "POST",
      headers,
      body: JSON.stringify({ companyId })
    });
    setMessage("Company ensured");
    await fetchPolicy();
  }

  useEffect(() => {
    void fetchEvents();
  }, []);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", padding: "16px", maxWidth: 900, margin: "0 auto" }}>
      <h1>Biz Sec Suite Admin</h1>
      <section style={{ marginBottom: 24 }}>
        <label>Company ID</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="contoso" />
          <button onClick={() => void createCompany()}>Ensure Company</button>
          <button onClick={() => void fetchPolicy()}>Fetch Policy</button>
        </div>
        {message && <p>{message}</p>}
        {policy && (
          <div style={{ marginTop: 12 }}>
            <div>Version: {policy.version}</div>
            <div>Issued: {policy.issuedAt}</div>
          </div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Allowlist</h2>
        <AllowlistEditor onSave={(list) => void updateAllowlist(list)} />
      </section>

      <section>
        <h2>Recent Events</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Time</th>
              <th align="left">Origin</th>
              <th align="left">Band</th>
              <th align="left">Type</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, idx) => (
              <tr key={idx}>
                <td>{e.ts}</td>
                <td>{e.origin}</td>
                <td>{e.similarityBand}</td>
                <td>{e.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function AllowlistEditor({ onSave }: { onSave: (list: string[]) => void }): JSX.Element {
  const [text, setText] = useState("");
  const [items, setItems] = useState<string[]>([]);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="https://login.microsoftonline.com" />
        <button
          onClick={() => {
            if (!text.trim()) return;
            setItems((prev) => [...prev, text.trim()]);
            setText("");
          }}
        >
          Add
        </button>
      </div>
      <ul>
        {items.map((i, idx) => (
          <li key={idx}>
            {i} <button onClick={() => setItems((prev) => prev.filter((_, j) => j !== idx))}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => onSave(items)}>Save Allowlist</button>
    </div>
  );
}
