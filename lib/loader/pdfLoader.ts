import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const loadFileFromPath = (path: string) => {
  const loader = new PDFLoader(path);
  const docs = loader.load();

  return docs;
};
export const loadFileFromBuffer = (buffer: Blob) => {
  const loader = new PDFLoader(buffer);
  const docs = loader.load();

  return docs;
};
