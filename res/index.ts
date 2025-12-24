import { loadFileFromPath } from "@/lib/loader/pdfLoader";

const testDoc = async () => {
  const path = "./AP-MTT.pdf";

  const docs = await loadFileFromPath(path);

  console.log(docs[0].pageContent);
  console.log(docs[0].metadata);
};

const startTime = Date.now();
testDoc()
  .then(() => console.log(`Done in ${Date.now() - startTime}ms`))
  .catch((error) => console.error(error));
