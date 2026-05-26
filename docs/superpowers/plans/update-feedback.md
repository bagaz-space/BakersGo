# Update Feedback

Use this file to write your update points. Claude will read this file, analyse your intent, and implement changes with better results.

## How to Write Your Points

Use this format for each item:

```
### [TYPE] Short title
Description of what you want changed or added.
```

**Types:**
- `[FEATURE]` — new functionality
- `[FIX]` — bug or broken behavior
- `[UI]` — visual or UX change
- `[BACKEND]` — API, database, or server-side change
- `[REFACTOR]` — code cleanup without behavior change

---

## Pending Updates

### [UI] Login/signup button loading spinner
Show a loading spinner on the login and signup submit buttons while the auth request is in progress, to give user feedback and prevent double-submit.

### [UI] Remove stok input from Modal Master Bahan
The "Stok" input field inside the Master Bahan modal is unnecessary. Remove it entirely.

### [FEATURE] Move Ukuran Batch & Satuan Batch from Master Resep to HPP Menu
These two fields do not belong in the Master Resep modal. Move them into HPP Menu, placing them under the "Pilih Resep" container. Adjust all calculations that use these values to read from their new location in HPP Menu.

### [UI] Rename Ukuran Batch → Jumlah Produksi and Satuan Batch → Satuan Produksi
After the move, rename:
- "Ukuran Batch" → "Jumlah Produksi"
- "Satuan Batch" → "Satuan Produksi"
Apply this rename everywhere the labels appear (UI labels, state keys, API fields if any).

### [UI] Remove old Ukuran Batch section in HPP Menu (under Pilih Resep)
HPP Menu currently has its own "Ukuran Batch" section under "Pilih Resep". Remove it — it is replaced by the fields migrated from Master Resep in the task above.

