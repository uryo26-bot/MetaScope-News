/**
 * バックエンドデータへの相対パス（API ルート用）
 * backend/data_paths.py と整合を保つ。
 */
import path from "path";

const BACKEND_DATA = path.join("backend", "data");

export const PATHS = {
  /** 電源割合 CSV */
  energyMix: path.join(BACKEND_DATA, "EneChart", "energy_mix_percentage.csv"),
  /** 日本輸入元割合（EneChart: LNG/石炭/石油） */
  enechartJapanImportShare: path.join(
    BACKEND_DATA,
    "EneChart",
    "Japan_import",
    "extractedData_AFpercentage"
  ),
  /** 世界輸出割合（EneChart: LNG等） */
  enechartWorldExportShare: path.join(
    BACKEND_DATA,
    "EneChart",
    "World_export",
    "extractedData_AFpercentage"
  ),
  metalchartImport: path.join(BACKEND_DATA, "MetalChart", "import"),
  metalchartProduction: path.join(BACKEND_DATA, "MetalChart", "production"),
  agricchartImport: path.join(BACKEND_DATA, "AgriChart", "import"),
  agricchartProduction: path.join(BACKEND_DATA, "AgriChart", "production"),
} as const;

/** process.cwd() が frontend/ または ルート の場合に対応 */
export function resolveDataPath(relativePath: string): string[] {
  return [
    path.join(process.cwd(), relativePath),
    path.join(process.cwd(), "..", relativePath),
  ];
}
