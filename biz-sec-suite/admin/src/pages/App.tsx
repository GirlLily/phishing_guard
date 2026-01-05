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
    <div className="app-shell">
      <h1>Biz Sec Suite Admin</h1>
      <div className="stack">
        <section className="card">
          <label>Company ID</label>
          <div className="row">
            <input value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="contoso" />
            <button onClick={() => void createCompany()}>Ensure</button>
            <button className="secondary" onClick={() => void fetchPolicy()}>
              Refresh Policy
            </button>
          </div>
          {message && <div className="message">{message}</div>}
          {policy && (
            <div className="row" style={{ marginTop: 10, gap: 14 }}>
              <span className="tag">v{policy.version}</span>
              <span className="message">Issued: {policy.issuedAt}</span>
            </div>
          )}
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0 }}>Allowlist</h2>
          <AllowlistEditor onSave={(list) => void updateAllowlist(list)} />
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0 }}>Recent Events</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Origin</th>
                  <th>Band</th>
                  <th>Type</th>
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
          </div>
        </section>
      </div>
    </div>
  );
}

function AllowlistEditor({ onSave }: { onSave: (list: string[]) => void }): JSX.Element {
  const [text, setText] = useState("");
  const [items, setItems] = useState<string[]>([]);
  return (
    <div className="stack">
      <div className="row">
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
      <ul className="list">
        {items.map((i, idx) => (
          <li key={idx}>
            {i}{" "}
            <button className="secondary" onClick={() => setItems((prev) => prev.filter((_, j) => j !== idx))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button onClick={() => onSave(items)}>Save Allowlist</button>
      </div>
    </div>
  );
}
