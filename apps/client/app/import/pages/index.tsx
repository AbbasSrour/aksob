import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@aksob/ui/core/card";
import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

/**
 * File-based route page.
 *
 * This is intended for the TanStack-Start app structure (apps/client) which
 * uses virtual file routes. It loads as a client component so the upload
 * interaction stays fully browser-side. The backend API handles auth via
 * session cookies (credentials: "include").
 */

export const Route = createFileRoute("/admin/import")({
	head: () => ({
		meta: [{ title: "Import - AKSOB" }],
	}),
	component: ImportPage,
});

function ImportPage() {
	const [file, setFile] = useState<File | null>(null);
	const [importing, setImporting] = useState(false);
	const [result, setResult] = useState<Record<string, unknown> | null>(null);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFile(e.target.files?.[0] ?? null);
		setError(null);
		setResult(null);
	};

	const handleImport = async () => {
		if (!file) return;
		setImporting(true);
		setError(null);
		setResult(null);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch("/api/admin/import-excel", {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const responseText = await res.text();
			let json: {
				status?: string;
				error?: string;
				data?: Record<string, unknown>;
			};
			try {
				json = responseText ? JSON.parse(responseText) : {};
			} catch {
				setError(
					`Import failed with HTTP ${res.status}. Server returned a non-JSON response.`,
				);
				return;
			}
			if (!res.ok || json.status === "error") {
				setError(json.error ?? `Import failed with HTTP ${res.status}`);
				return;
			}
			setResult(json.data ?? null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setImporting(false);
		}
	};

	return (
		<Main>
			<PageHeader
				title="Import Data"
				description="Upload the AKSOB mixed Excel file. Rows with Class of are imported as alumni; rows without Class of are imported as students."
			/>

			<div className="max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle>Upload Mixed Alumni / Student Excel File</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Upload area */}
						<input
							ref={fileInputRef}
							type="file"
							accept=".xlsx"
							onChange={handleFileChange}
							className="hidden"
						/>

						{!file ? (
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground hover:text-[var(--aksob-primary)] hover:border-[var(--aksob-primary)] transition-colors cursor-pointer"
							>
								<Upload size={32} strokeWidth={1.5} />
								<span className="text-sm font-medium">
									Click to select mixed AKSOB Excel file
								</span>
								<span className="text-xs">.xlsx only</span>
							</button>
						) : (
							<div className="flex items-center justify-between border border-border rounded-xl p-4">
								<div className="flex items-center gap-3">
									<FileSpreadsheet
										size={24}
										className="text-[var(--aksob-primary)]"
									/>
									<div>
										<p className="text-sm font-medium">{file.name}</p>
										<p className="text-xs text-muted-foreground">
											{(file.size / 1024).toFixed(1)} KB
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => {
										setFile(null);
										setResult(null);
										if (fileInputRef.current) fileInputRef.current.value = "";
									}}
									className="text-muted-foreground hover:text-foreground"
								>
									<X size={18} />
								</button>
							</div>
						)}

						<Button
							onClick={handleImport}
							disabled={!file || importing}
							className="w-full"
						>
							{importing ? "Importing..." : "Import Mixed File"}
						</Button>

						{/* Error */}
						{error && (
							<div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
								{error}
							</div>
						)}

						{/* Results */}
						{result && (
							<div className="space-y-3 p-4 rounded-xl bg-muted/50">
								<div className="grid grid-cols-2 gap-2 text-sm">
									<Stat label="Total Rows" value={result.total as number} />
									<Stat
										label="Imported"
										value={result.imported as number}
										accent
									/>
									<Stat
										label="Alumni"
										value={result.importedAlumni as number}
									/>
									<Stat
										label="Students"
										value={result.importedStudents as number}
									/>
									<Stat
										label="No Email"
										value={result.skippedNoEmail as number}
									/>
									<Stat
										label="No Program"
										value={result.skippedNoProgram as number}
									/>
									<Stat
										label="Already Exist"
										value={result.skippedExistingUser as number}
									/>
									<Stat label="Errors" value={result.errors as number} danger />
								</div>
								{(result.unmatchedMajors as string[])?.length > 0 && (
									<div className="text-xs text-muted-foreground">
										<span className="font-medium">Unmatched majors:</span>{" "}
										{(result.unmatchedMajors as string[]).join(", ")}
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</Main>
	);
}

function Stat({
	label,
	value,
	accent,
	danger,
}: {
	label: string;
	value: number;
	accent?: boolean;
	danger?: boolean;
}) {
	const colorClass = danger
		? "text-destructive"
		: accent
			? "text-[var(--aksob-primary)]"
			: "text-foreground";
	return (
		<div className="flex justify-between items-center p-2 rounded-lg bg-background">
			<span className="text-muted-foreground">{label}</span>
			<span className={`font-semibold ${colorClass}`}>{value}</span>
		</div>
	);
}
