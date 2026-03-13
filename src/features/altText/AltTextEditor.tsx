// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Alt Text — UI Editor                                           ║
// ║  The textarea + save button inside the detail panel.                     ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: placeholder text, button label, layout                 ║
// ║  → Save logic: saveAltText.ts                                            ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { useIsAllowedTo } from "framer-plugin"
import { panel } from "../../design/layout"

interface AltTextEditorProps {
  value:       string
  saving:      boolean
  saveSuccess: boolean
  justAdded:   boolean
  addMode:     "set" | "add" | null
  onChange:    (v: string) => void
  onSave:      () => void
}

export function AltTextEditor({
  value, saving, saveSuccess,
  justAdded, addMode,
  onChange, onSave,
}: AltTextEditorProps) {
  const canEdit = useIsAllowedTo("setAttributes")

  return (
    <div className="alt-section">
      <div className="meta-label">ALT TEXT</div>
      <textarea
        className="alt-input"
        rows={panel.altTextRows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          canEdit
            ? "Describe this image for accessibility…"
            : "You don't have permission to edit this project."
        }
        disabled={!canEdit}
      />
      {saveSuccess && (
        <div className="feedback-ok">✓ Alt text saved!</div>
      )}
      {justAdded && (
        <div className="feedback-ok">
          {addMode === "set" ? "✓ Set on selected frame!" : "✓ Added to canvas!"}
        </div>
      )}
      <button
        className="btn-primary"
        onClick={onSave}
        disabled={saving || !canEdit}
        title={!canEdit ? "You don't have permission to edit this project" : undefined}
      >
        {saving ? "Saving…" : "Save Alt Text"}
      </button>
    </div>
  )
}
