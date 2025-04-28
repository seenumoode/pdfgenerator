import { useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setPdfUrl("");

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const blob = await response.blob();
      const pdfBlobUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfBlobUrl);
    } catch (err) {
      setError(err.message || "Failed to generate PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Webpage to PDF Converter</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL (e.g., https://example.com)"
          className={styles.input}
          disabled={isLoading}
        />
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate PDF"}
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      {pdfUrl && (
        <div className={styles.result}>
          <p>PDF generated successfully!</p>
          <a
            href={pdfUrl}
            download="output.pdf"
            className={styles.downloadLink}
          >
            Download PDF
          </a>
          <iframe src={pdfUrl} className={styles.preview} title="PDF Preview" />
        </div>
      )}
    </div>
  );
}
