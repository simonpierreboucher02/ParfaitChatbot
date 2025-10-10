import path from "path";
import fs from "fs";

interface EmbeddingData {
  id: string;
  documentId: string;
  chunkText: string;
  chunkIndex: number;
  embedding: number[];
}

class VectorStore {
  private embeddings: EmbeddingData[] = [];
  private storagePath = path.join(process.cwd(), "data", "vectors.json");

  constructor() {
    this.ensureDataDir();
    this.loadVectors();
  }

  private ensureDataDir() {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadVectors() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, "utf-8");
        this.embeddings = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading vectors:", error);
      this.embeddings = [];
    }
  }

  private saveVectors() {
    try {
      fs.writeFileSync(this.storagePath, JSON.stringify(this.embeddings, null, 2));
    } catch (error) {
      console.error("Error saving vectors:", error);
    }
  }

  addEmbedding(id: string, documentId: string, chunkText: string, chunkIndex: number, embedding: number[]) {
    this.embeddings.push({ id, documentId, chunkText, chunkIndex, embedding });
    this.saveVectors();
  }

  search(queryEmbedding: number[], k: number = 5): Array<EmbeddingData & { similarity: number }> {
    if (this.embeddings.length === 0) {
      return [];
    }

    const results = this.embeddings
      .map((item) => ({
        ...item,
        similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);

    return results;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  deleteByDocumentId(documentId: string) {
    this.embeddings = this.embeddings.filter(e => e.documentId !== documentId);
    this.saveVectors();
  }

  getCount(): number {
    return this.embeddings.length;
  }
}

export const vectorStore = new VectorStore();
