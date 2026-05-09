import { Button } from "@aksob/ui/core/button";
import { Input } from "@aksob/ui/core/input";
import { cn } from "@aksob/ui/lib/utils";
import { IconCheck, IconPlus, IconTag, IconTrash } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { NewsCategory } from "@/app/news/hooks/api/news.functions";
import {
	newsQueries,
	useCreateNewsCategory,
	useDeleteNewsCategory,
} from "@/app/news/hooks/api/news.queries";
import { useSession } from "@/lib/auth";

interface NewsCategorySelectorProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

const CATEGORY_DOTS = [
	"bg-blue-500",
	"bg-amber-500",
	"bg-violet-500",
	"bg-emerald-500",
	"bg-rose-500",
	"bg-cyan-500",
	"bg-teal-500",
	"bg-indigo-500",
	"bg-orange-500",
	"bg-pink-500",
];

function getCategoryDot(categories: NewsCategory[], cat: NewsCategory): string {
	const idx = categories.indexOf(cat);
	return CATEGORY_DOTS[idx % CATEGORY_DOTS.length] ?? "bg-gray-400";
}

export function NewsCategorySelector({
	value,
	onChange,
	disabled = false,
}: NewsCategorySelectorProps) {
	const queryClient = useQueryClient();
	const { data: sessionData } = useSession();
	const isAdmin = sessionData?.user?.role === "admin";
	const [isAdding, setIsAdding] = useState(false);
	const [newName, setNewName] = useState("");
	const { mutate: createCategory, isPending: isCreating } =
		useCreateNewsCategory();
	const { mutate: deleteCategory, isPending: isDeleting } =
		useDeleteNewsCategory();

	const { data: categories = [] } = useQuery(newsQueries.categories());

	const handleCreate = useCallback(() => {
		const trimmed = newName.trim();
		if (!trimmed) return;

		createCategory(
			{ name: trimmed },
			{
				onSuccess: (created) => {
					void queryClient.invalidateQueries({
						queryKey: newsQueries.entity.queryKey,
					});
					onChange(created.id);
					setNewName("");
					setIsAdding(false);
				},
			},
		);
	}, [createCategory, newName, onChange, queryClient]);

	return (
		<div className="space-y-2.5">
			<div className="flex items-center gap-2">
				<IconTag size={13} className="text-muted-foreground/40" />
				<span className="text-xs font-medium text-foreground/70">Category</span>
			</div>
			<div className="space-y-2">
				{categories.map((cat) => {
					const isSelected = value === cat.id;
					const dot = getCategoryDot(categories, cat);
					return (
						<div
							key={cat.id}
							className={cn(
								"group flex items-center rounded-lg border text-xs font-medium transition-all duration-200",
								isSelected
									? "border-[#076951] bg-[#076951] text-white shadow-sm"
									: "border-[#e8e6e1] bg-white text-foreground/70 hover:border-[#076951]/30 hover:bg-[#076951]/[0.04] hover:shadow-sm",
							)}
						>
							<button
								type="button"
								onClick={() => onChange(isSelected ? "" : cat.id)}
								disabled={disabled}
								className="flex flex-1 items-center gap-2.5 px-3 py-2.5 text-left"
							>
								<span
									className={cn(
										"h-2 w-2 flex-shrink-0 rounded-full transition-colors",
										isSelected ? "bg-white/80" : dot,
									)}
								/>
								<span className="truncate">{cat.name}</span>
								{isSelected && (
									<IconCheck size={13} className="flex-shrink-0 opacity-80" />
								)}
							</button>
							{isAdmin && (
								<button
									type="button"
									className={cn(
										"mr-1.5 flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100",
										isSelected
											? "text-white/60 hover:bg-white/20 hover:text-white"
											: "text-muted-foreground/30 hover:bg-red-50 hover:text-destructive",
									)}
									disabled={isDeleting}
									onClick={() => {
										if (isSelected) onChange("");
										deleteCategory({ id: cat.id });
									}}
								>
									<IconTrash size={14} />
								</button>
							)}
						</div>
					);
				})}

				{/* Add new category */}
				{isAdding ? (
					<div className="flex items-center gap-1.5">
						<Input
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Category name"
							className="h-9 flex-1 border-[#e8e6e1] text-xs"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter") handleCreate();
								if (e.key === "Escape") {
									setIsAdding(false);
									setNewName("");
								}
							}}
						/>
						<Button
							type="button"
							size="sm"
							className="h-9 bg-[#076951] px-3 text-xs hover:bg-[#16876b]"
							onClick={handleCreate}
							disabled={!newName.trim() || isCreating}
						>
							{isCreating ? "..." : "Add"}
						</Button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => setIsAdding(true)}
						disabled={disabled}
						className={cn(
							"flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs font-medium transition-colors",
							"border-[#e8e6e1] text-muted-foreground/50 hover:border-[#076951]/30 hover:bg-[#076951]/[0.03] hover:text-[#076951]",
						)}
					>
						<IconPlus size={14} />
						<span>Add category</span>
					</button>
				)}
			</div>
		</div>
	);
}
