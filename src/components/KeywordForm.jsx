import { useState } from "react";

function KeywordForm({ onAdded }) {
  const [value, setValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const keyword = value.trim();
    if (!keyword) return;

    setAdding(true);
    setError(null);

    fetch("http://localhost:3000/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error);
        } else {
          setValue("");
          onAdded();
        }
      })
      .catch(() => setError("Failed to connect to backend"))
      .finally(() => setAdding(false));
  }

  return (
    <form className="keyword-form" onSubmit={handleSubmit}>
      <input
        className={`keyword-input${error ? " keyword-input-error" : ""}`}
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(null); }}
        placeholder="Add a keyword — e.g. Y2K fashion"
        disabled={adding}
      />
      <button
        className="btn btn-primary"
        type="submit"
        disabled={adding || !value.trim()}
      >
        {adding ? "Adding…" : "+ Add"}
      </button>
      {error && <span className="keyword-error">{error}</span>}
    </form>
  );
}

export default KeywordForm;
