import {
	AlignJustify,
	Bold,
	Heading1,
	Heading2,
	Heading3,
	Image as ImageIcon,
	Italic,
	Link,
	List,
	ListOrdered,
	Quote,
	Redo2,
	Strikethrough,
	Trash2,
	Type,
	Undo2,
} from "lucide-react";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { LineHeight as LineHeightExt } from "@tiptap/extension-text-style/line-height";
import {
	type Editor,
	EditorContent,
	useEditor,
	useEditorState,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";

import { cn } from "~/app/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────

export interface TipTapEditorProps {
	placeholder?: string;
	className?: string;
	defaultValue?: string;
	value?: string;
	onChange?: (html: string) => void;
	/** Called when an image is added. Return a URL string to insert (e.g. blob URL). */
	onImageAdd?: (file: File) => string;
	/** Maximum number of images allowed in the editor content. Default: 10. */
	maxImages?: number;
}

export interface TipTapEditorRef {
	editor: Editor | null;
}

// ─── Constants ───────────────────────────────────────────────────────

const MAX_IMAGES_DEFAULT = 10;

const FONT_SIZES = [
	{ label: "Default", value: "" },
	{ label: "Small", value: "13px" },
	{ label: "Normal", value: "16px" },
	{ label: "Large", value: "20px" },
	{ label: "XL", value: "24px" },
] as const;

const LINE_HEIGHTS = [
	{ label: "Default", value: "" },
	{ label: "1.2", value: "1.2" },
	{ label: "1.4", value: "1.4" },
	{ label: "1.6", value: "1.6" },
	{ label: "1.8", value: "1.8" },
	{ label: "2.0", value: "2" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────

function countImages(editor: Editor): number {
	let count = 0;
	editor.state.doc.descendants((node) => {
		if (node.type.name === "image") count++;
	});
	return count;
}

// ─── Toolbar Button ──────────────────────────────────────────────────

function ToolbarButton({
	active,
	onClick,
	icon: Icon,
	title,
}: {
	active?: boolean;
	onClick: () => void;
	icon: React.ElementType;
	title: string;
}) {
	return (
		<button
			type="button"
			className={cn(
				"flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150",
				active
					? "bg-[var(--aksob-primary)]/10 text-[var(--aksob-primary)]"
					: "text-[var(--gray-400)] hover:bg-black/[0.04] hover:text-[var(--gray-600)]",
			)}
			onClick={onClick}
			onMouseDown={(e) => e.preventDefault()}
			title={title}
		>
			<Icon size={15} strokeWidth={2} />
		</button>
	);
}

// ─── Toolbar Select ──────────────────────────────────────────────────

function ToolbarSelect({
	value,
	options,
	onChange,
	icon: Icon,
	title,
}: {
	value: string;
	options: ReadonlyArray<{ label: string; value: string }>;
	onChange: (value: string) => void;
	icon: React.ElementType;
	title: string;
}) {
	return (
		<div className="relative flex items-center">
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-7 appearance-none rounded-md border border-transparent bg-transparent pl-7 pr-2 text-xs text-[var(--gray-600)] hover:bg-black/[0.04] hover:text-[var(--gray-700)] focus:border-[var(--aksob-primary)]/30 focus:outline-none"
				title={title}
			>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			<Icon
				size={14}
				strokeWidth={2}
				className="pointer-events-none absolute left-2 text-[var(--gray-400)]"
			/>
		</div>
	);
}

// ─── Editor Toolbar ──────────────────────────────────────────────────

function EditorToolbar({
	editor,
	onImageAdd,
	maxImages,
}: {
	editor: Editor | null;
	onImageAdd?: (file: File) => string;
	maxImages: number;
}) {
	const editorState = useEditorState({
		editor,
		selector: useCallback(({ editor: ed }: { editor: Editor | null }) => {
			if (!ed) return null;
			return {
				heading1: ed.isActive("heading", { level: 1 }),
				heading2: ed.isActive("heading", { level: 2 }),
				heading3: ed.isActive("heading", { level: 3 }),
				bold: ed.isActive("bold"),
				italic: ed.isActive("italic"),
				strike: ed.isActive("strike"),
				link: ed.isActive("link"),
				bulletList: ed.isActive("bulletList"),
				orderedList: ed.isActive("orderedList"),
				blockquote: ed.isActive("blockquote"),
				fontSize:
					(ed.getAttributes("textStyle") as { fontSize?: string })?.fontSize ??
					"",
				lineHeight:
					(ed.getAttributes("textStyle") as { lineHeight?: string })
						?.lineHeight ?? "",
			};
		}, []),
	});

	if (!editor || !editorState) return null;

	const imageCount = countImages(editor);

	const handleImageAdd = () => {
		if (!onImageAdd) return;
		if (imageCount >= maxImages) return;

		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;
			const url = onImageAdd(file);
			editor.chain().focus().setImage({ src: url }).run();
		};
		input.click();
	};

	const groups = [
		[
			{
				icon: Heading1,
				title: "Heading 1",
				action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
				active: editorState.heading1,
			},
			{
				icon: Heading2,
				title: "Heading 2",
				action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
				active: editorState.heading2,
			},
			{
				icon: Heading3,
				title: "Heading 3",
				action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
				active: editorState.heading3,
			},
		],
		[
			{
				icon: Bold,
				title: "Bold",
				action: () => editor.chain().focus().toggleBold().run(),
				active: editorState.bold,
			},
			{
				icon: Italic,
				title: "Italic",
				action: () => editor.chain().focus().toggleItalic().run(),
				active: editorState.italic,
			},
			{
				icon: Strikethrough,
				title: "Strikethrough",
				action: () => editor.chain().focus().toggleStrike().run(),
				active: editorState.strike,
			},
			{
				icon: Link,
				title: "Link",
				action: () => {
					if (editorState.link) {
						editor.chain().focus().unsetLink().run();
					} else {
						const url = window.prompt("Enter URL:");
						if (url) {
							editor.chain().focus().setLink({ href: url }).run();
						}
					}
				},
				active: editorState.link,
			},
			...(onImageAdd
				? [
						{
							icon: ImageIcon,
							title:
								imageCount >= maxImages ? "Image limit reached" : "Add Image",
							action: handleImageAdd,
							active: false as const,
						},
					]
				: []),
		],
		[
			{
				icon: List,
				title: "Bullet List",
				action: () => editor.chain().focus().toggleBulletList().run(),
				active: editorState.bulletList,
			},
			{
				icon: ListOrdered,
				title: "Ordered List",
				action: () => editor.chain().focus().toggleOrderedList().run(),
				active: editorState.orderedList,
			},
			{
				icon: Quote,
				title: "Blockquote",
				action: () => editor.chain().focus().toggleBlockquote().run(),
				active: editorState.blockquote,
			},
		],
	];

	const handleFontSize = (value: string) => {
		if (!value) {
			editor.chain().focus().unsetFontSize().run();
		} else {
			editor.chain().focus().setFontSize(value).run();
		}
	};

	const handleLineHeight = (value: string) => {
		if (!value) {
			editor.chain().focus().unsetLineHeight().run();
		} else {
			editor.chain().focus().setLineHeight(value).run();
		}
	};

	return (
		<div className="sticky top-0 z-10 -ml-1 rounded-lg border border-[var(--gray-200)] bg-white/95 px-2 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm">
			<div className="flex flex-wrap items-center gap-0.5">
				{groups.map((group, gi) => (
					<div key={gi} className="flex items-center">
						{gi > 0 && (
							<div className="mx-1.5 h-3.5 w-px bg-[var(--gray-200)]" />
						)}
						{group.map((item, bi) => (
							<ToolbarButton
								key={bi}
								icon={item.icon}
								title={item.title}
								onClick={item.action}
								active={item.active}
							/>
						))}
					</div>
				))}
				<div className="mx-1.5 h-3.5 w-px bg-[var(--gray-200)]" />
				<ToolbarSelect
					value={editorState.fontSize}
					options={FONT_SIZES}
					onChange={handleFontSize}
					icon={Type}
					title="Font size"
				/>
				<ToolbarSelect
					value={editorState.lineHeight}
					options={LINE_HEIGHTS}
					onChange={handleLineHeight}
					icon={AlignJustify}
					title="Line height"
				/>
				<div className="mx-1.5 h-3.5 w-px bg-[var(--gray-200)]" />
				<ToolbarButton
					icon={Undo2}
					title="Undo"
					onClick={() => editor.chain().focus().undo().run()}
				/>
				<ToolbarButton
					icon={Redo2}
					title="Redo"
					onClick={() => editor.chain().focus().redo().run()}
				/>
			</div>
		</div>
	);
}

// ─── Editor Component ────────────────────────────────────────────────

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
	function TipTapEditor(
		{
			placeholder = "Write something...",
			className,
			defaultValue,
			value,
			onChange,
			onImageAdd,
			maxImages = MAX_IMAGES_DEFAULT,
		},
		ref,
	) {
		const [focused, setFocused] = useState(false);

		const editor = useEditor({
			immediatelyRender: false,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3],
					},
				}),
				LinkExt.configure({
					openOnClick: false,
					autolink: true,
				}),
				Image.configure({
					HTMLAttributes: {
						class: "max-w-full rounded-lg",
					},
				}),
				TextStyle,
				FontSize,
				LineHeightExt,
				Placeholder.configure({
					placeholder,
					emptyEditorClass:
						"is-editor-empty before:pointer-events-none before:absolute before:content-[attr(data-placeholder)] before:text-[var(--gray-400)]/25",
				}),
			],
			content: value ?? defaultValue ?? "",
			onUpdate: ({ editor: ed }) => {
				onChange?.(ed.getHTML());
			},
			onFocus: () => setFocused(true),
			onBlur: () => setFocused(false),
			editorProps: {
				attributes: {
					class: cn(
						"prose prose-aksob max-w-none focus:outline-none",
						"min-h-[320px]",
					),
				},
				handlePaste: onImageAdd
					? (_view, event) => {
							const items = event.clipboardData?.items;
							if (!items) return false;

							for (let i = 0; i < items.length; i++) {
								const item = items[i];
								if (item.type.startsWith("image/")) {
									const file = item.getAsFile();
									if (file) {
										if (countImages(editor) >= maxImages) {
											event.preventDefault();
											return true;
										}
										event.preventDefault();
										const url = onImageAdd(file);
										editor.chain().focus().setImage({ src: url }).run();
										return true;
									}
								}
							}
							return false;
						}
					: undefined,
				handleDrop: onImageAdd
					? (_view, event) => {
							const files = event.dataTransfer?.files;
							if (!files || files.length === 0) return false;

							for (let i = 0; i < files.length; i++) {
								const file = files[i];
								if (file.type.startsWith("image/")) {
									if (countImages(editor) >= maxImages) {
										event.preventDefault();
										return true;
									}
									event.preventDefault();
									const url = onImageAdd(file);
									editor.chain().focus().setImage({ src: url }).run();
									return true;
								}
							}
							return false;
						}
					: undefined,
			},
		});

		useImperativeHandle(ref, () => ({ editor }), [editor]);

		// Sync external value changes (e.g. loading existing story for edit)
		useEffect(() => {
			if (!editor) return;
			const incoming = value ?? defaultValue ?? "";
			const current = editor.getHTML();
			if (incoming && incoming !== current) {
				editor.commands.setContent(incoming);
			}
		}, [editor, value, defaultValue]);

		if (!editor) return null;

		return (
			<div className={cn("relative", className)}>
				<div
					className={cn(
						"grid transition-all duration-200",
						focused
							? "grid-rows-[1fr] mb-8 opacity-100"
							: "grid-rows-[0fr] opacity-0 pointer-events-none",
					)}
				>
					<div className="overflow-hidden">
						<EditorToolbar
							editor={editor}
							onImageAdd={onImageAdd}
							maxImages={maxImages}
						/>
					</div>
				</div>
				<BubbleMenu
					editor={editor}
					shouldShow={({ editor: ed }) => ed.isActive("image")}
					tippyOptions={{
						duration: 150,
						arrow: false,
						maxWidth: 200,
						placement: "top",
						offset: [0, 8],
						appendTo: () => document.body,
						popperOptions: {
							modifiers: [
								{
									name: "flip",
									options: {
										fallbackPlacements: ["bottom"],
									},
								},
								{
									name: "preventOverflow",
									options: {
										padding: { top: 48 },
									},
								},
							],
						},
					}}
					className="flex items-center gap-1 rounded-lg border border-[var(--gray-200)] bg-white px-1.5 py-1 shadow-lg"
				>
					<button
						type="button"
						onClick={() => editor.chain().focus().deleteSelection().run()}
						className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-red-600 hover:bg-red-50"
						title="Delete image"
					>
						<Trash2 size={14} />
						Delete
					</button>
				</BubbleMenu>
				<div className="relative">
					<EditorContent editor={editor} />
				</div>
			</div>
		);
	},
);
