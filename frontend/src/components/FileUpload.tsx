import { useRef, useState } from "react";

type FileUploadProps = {
  selectedFile: File | null;
  disabled: boolean;
  onFileSelect: (file: File | null) => void;
};

export function FileUpload({ selectedFile, disabled, onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        disabled={disabled}
        onChange={event => onFileSelect(event.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={openPicker}
        onDragOver={event => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={event => {
          event.preventDefault();
          setIsDragging(false);

          if (disabled) {
            return;
          }

          onFileSelect(event.dataTransfer.files?.[0] ?? null);
        }}
        className={[
          "flex w-full flex-col items-center justify-center rounded-[2rem] border border-dashed px-6 py-10 text-center transition",
          isDragging ? "border-slate-900 bg-slate-50" : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        ].join(" ")}
      >
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">File</span>
        <span className="mt-4 text-lg font-semibold text-slate-900">Drag and drop a CSV file</span>
        <span className="mt-2 text-sm text-slate-500">or click to browse from your computer</span>
        <span className="mt-5 text-xs uppercase tracking-[0.25em] text-slate-400">Max file size 5MB</span>
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        {selectedFile ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-slate-900">{selectedFile.name}</span>
            <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <span>No file selected.</span>
        )}
      </div>
    </div>
  );
}
