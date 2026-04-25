import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../components/DashboardShell";
import { FileUpload } from "../components/FileUpload";
import { useAuth } from "../hooks/useAuth";
import type { Dataset } from "../types/data";
import { createDataset, fetchDatasets, uploadCsvFile } from "../utils/api";

type UploadStage = "idle" | "uploading" | "processing" | "ready" | "failed";

const maxFileSize = 5 * 1024 * 1024;

export function UploadPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [datasetName, setDatasetName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatasets = async () => {
      if (!token) {
        setIsLoadingDatasets(false);
        return;
      }

      try {
        const response = await fetchDatasets(token);
        setDatasets(response.datasets);
      } catch {
        setError("Unable to load datasets right now.");
      } finally {
        setIsLoadingDatasets(false);
      }
    };

    void loadDatasets();
  }, [token]);

  const handleFileSelect = (file: File | null) => {
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSelectedFile(null);
      setError("Only CSV files are allowed.");
      return;
    }

    if (file.size > maxFileSize) {
      setSelectedFile(null);
      setError("CSV file must be 5MB or smaller.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (!datasetName.trim()) {
      setError("Dataset name is required.");
      return;
    }

    if (!selectedFile) {
      setError("Select a CSV file before uploading.");
      return;
    }

    try {
      setError(null);
      setStage("uploading");

      const datasetResponse = await createDataset(token, datasetName.trim(), description.trim());
      setStage("processing");

      const uploadResponse = await uploadCsvFile(token, datasetResponse.dataset.id, selectedFile);
      setDatasets(current => [datasetResponse.dataset, ...current]);
      setStage("ready");

      window.setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
          state: {
            uploadMessage: `${uploadResponse.insertedCount} events ingested from ${uploadResponse.file.file_name}.`,
          },
        });
      }, 900);
    } catch (requestError) {
      setStage("failed");
      setError(requestError instanceof Error ? requestError.message : "Upload failed.");
    }
  };

  const statusCopy: Record<UploadStage, string> = {
    idle: "Ready to upload.",
    uploading: "Uploading file...",
    processing: "Processing file...",
    ready: "Upload complete.",
    failed: "Upload failed.",
  };

  const isBusy = stage === "uploading" || stage === "processing";

  return (
    <DashboardShell
      title="Upload"
      eyebrow="Datasets"
      description="Create a dataset and import a CSV file."
    >
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <div className="grid gap-5">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="dataset-name">
                Dataset name
              </label>
              <input
                id="dataset-name"
                value={datasetName}
                onChange={event => setDatasetName(event.target.value)}
                disabled={isBusy}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                placeholder="Dataset name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="dataset-description">
                Description
              </label>
              <textarea
                id="dataset-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                disabled={isBusy}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                placeholder="Description"
              />
            </div>

            <FileUpload selectedFile={selectedFile} disabled={isBusy} onFileSelect={handleFileSelect} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Status:</span> {statusCopy[stage]}
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              disabled={isBusy}
              onClick={handleUpload}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isBusy ? "Working..." : "Upload CSV"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Notes</p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li>CSV files only</li>
              <li>Maximum size 5MB</li>
              <li>Files are processed after upload</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent Datasets</p>
            {isLoadingDatasets ? (
              <p className="mt-4 text-sm text-slate-600">Loading...</p>
            ) : datasets.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No datasets yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {datasets.slice(0, 5).map(dataset => (
                  <div key={dataset.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{dataset.name}</p>
                    <p className="mt-1 text-slate-500">{dataset.description || "No description"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
