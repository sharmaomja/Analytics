export type Dataset = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type FileRecord = {
  id: string;
  dataset_id: string;
  file_name: string;
  file_type: string;
  status: "uploaded" | "processing" | "ready" | "failed";
  created_at: string;
};

export type CreateDatasetResponse = {
  message: string;
  dataset: Dataset;
};

export type ListDatasetsResponse = {
  datasets: Dataset[];
};

export type UploadResponse = {
  message: string;
  dataset: Dataset;
  file: FileRecord;
  insertedCount: number;
};
