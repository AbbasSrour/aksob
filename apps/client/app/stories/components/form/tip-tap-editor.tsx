import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
	IconBold,
	IconItalic,
	IconList,
	IconListNumbers,
	IconQuote,
	IconH1,
	IconH2,
	IconH3,
	IconArrowBackUp,
	IconArrowForwardUp,
	IconStrikethrough,
} from "@tabler/icons-react";
import { cn } from "@aksob/ui/lib/utils";
import { forwardRef, useImperativeHandle } from "react";

interface TipTapEditorProps {
	placeholder?: string;
	className?: string;
	defaultValue?: string;
	value?: string;
	onChange?: (html: string) => void;
}

export interface TipTapEditorRef {
	editor: Editor | null;
}

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
					? "bg-[#076951]/10 text-[#076951]"
					: "text-muted-foreground/50 hover:bg-black/[0.04] hover:text-foreground/70",
			)}
			onClick={onClick}
			title={title}
		>
			<Icon size={15} strokeWidth={2} />
		</button>
	);
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
	if (!editor) return null;

	const groups = [
		[
			{
				icon: IconH1,
				title: "Heading 1",
				action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
				isActive: () => editor.isActive("heading", { level: 1 }),
			},
			{
				icon: IconH2,
				title: "Heading 2",
				action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
				isActive: () => editor.isActive("heading", { level: 2 }),
			},
			{
				icon: IconH3,
				title: "Heading 3",
				action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
				isActive: () => editor.isActive("heading", { level: 3 }),
			},
		],
		[
			{
				icon: IconBold,
				title: "Bold",
				action: () => editor.chain().focus().toggleBold().run(),
				isActive: () => editor.isActive("bold"),
			},
			{
				icon: IconItalic,
				title: "Italic",
				action: () => editor.chain().focus().toggleItalic().run(),
				isActive: () => editor.isActive("italic"),
			},
			{
				icon: IconStrikethrough,
				title: "Strikethrough",
				action: () => editor.chain().focus().toggleStrike().run(),
				isActive: () => editor.isActive("strike"),
			},
		],
		[
			{
				icon: IconList,
				title: "Bullet List",
				action: () => editor.chain().focus().toggleBulletList().run(),
				isActive: () => editor.isActive("bulletList"),
			},
			{
				icon: IconListNumbers,
				title: "Ordered List",
				action: () => editor.chain().focus().toggleOrderedList().run(),
				isActive: () => editor.isActive("orderedList"),
			},
			{
				icon: IconQuote,
				title: "Blockquote",
				action: () => editor.chain().focus().toggleBlockquote().run(),
				isActive: () => editor.isActive("blockquote"),
			},
		],
		[
			{
				icon: IconArrowBackUp,
				title: "Undo",
				action: () => editor.chain().focus().undo().run(),
				isActive: () => false,
			},
			{
				icon: IconArrowForwardUp,
				title: "Redo",
				action: () => editor.chain().focus().redo().run(),
				isActive: () => false,
			},
		],
	];

	return (
		<div className="sticky top-0 z-10 mb-8 -ml-1 rounded-lg border border-black/[0.06] bg-white/95 px-2 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm">
			<div className="flex flex-wrap items-center gap-0.5">
				{groups.map((group, gi) => (
					<div key={gi} className="flex items-center">
						{gi > 0 && <div className="mx-1.5 h-3.5 w-px bg-black/[0.08]" />}
						{group.map((item, bi) => (
							<ToolbarButton
								key={bi}
								icon={item.icon}
								title={item.title}
								onClick={item.action}
								active={item.isActive()}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
	function TipTapEditor(
		{ placeholder = "Write something...", className, defaultValue, value, onChange },
		ref,
	) {
		const editor = useEditor({
			immediatelyRender: false,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3],
					},
				}),
				Placeholder.configure({
					placeholder,
					emptyEditorClass:
						"is-editor-empty before:pointer-events-none before:absolute before:content-[attr(data-placeholder)] before:text-muted-foreground/25",
				}),
			],
			content: value ?? defaultValue ?? "",
			onUpdate: ({ editor }) => {
				onChange?.(editor.getHTML());
			},
			editorProps: {
				attributes: {
					class: cn(
						"prose prose-lg max-w-none focus:outline-none",
						"min-h-[320px]",
						"prose-headings:font-semibold prose-headings:tracking-tight",
						"prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
						"prose-p:leading-[1.75] prose-p:text-foreground/75",
						"prose-blockquote:border-l-[#076951] prose-blockquote:border-l-2 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-foreground/60",
						"prose-ul:my-5 prose-ol:my-5 prose-li:my-1",
						"prose-strong:text-foreground prose-strong:font-semibold",
					),
				},
			},
		});

		useImperativeHandle(ref, () => ({ editor }), [editor]);

		return (
			<div className={cn("relative", className)}>
				<EditorToolbar editor={editor} />
				<div className="relative">
					<EditorContent editor={editor} />
				</div>
			</div>
		);
	},
);
