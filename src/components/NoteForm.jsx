import { useState } from "react";

function NoteForm({ keywordId, onNoteSaved }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (!text.trim()) return;

    setSaving(true);

    fetch("http://localhost:3000/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword_id: keywordId, content: text }),
    })
      .then((res) => res.json())
      .then(() => {
        setText("");
        setSaving(false);
        onNoteSaved();
      })
      .catch(() => setSaving(false));
  }

  return (
    <div style={{ marginTop: "16px" }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a note about this trend..."
        rows={3}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: "8px", padding: "8px 16px", cursor: "pointer" }}
      >
        {saving ? "Saving..." : "Save note"}
      </button>
    </div>
  );
}

export default NoteForm;
