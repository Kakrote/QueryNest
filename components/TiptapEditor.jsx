import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, BlocksIcon, Code2, Minus, Undo2, Redo2, Pilcrow
} from 'lucide-react';

const TiptapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return null;

  const toolbarButton = (label, Icon, command, active = false) => (
    <button
      type="button"
      onClick={command}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all border
        ${
          active
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
        }`}
      title={label}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="w-full border rounded-md shadow-sm overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50">
        {toolbarButton('Bold', Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {toolbarButton('Italic', Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {toolbarButton('Strikethrough', Strikethrough, () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
        {toolbarButton('Inline Code', Code, () => editor.chain().focus().toggleCode().run(), editor.isActive('code'))}
        {toolbarButton('Paragraph', Pilcrow, () => editor.chain().focus().setParagraph().run(), editor.isActive('paragraph'))}
        {toolbarButton('Heading 1', Heading1, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
        {toolbarButton('Heading 2', Heading2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        {toolbarButton('Heading 3', Heading3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
        {toolbarButton('Bullet List', List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {toolbarButton('Ordered List', ListOrdered, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {toolbarButton('Blockquote', BlocksIcon, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
        {toolbarButton('Code Block', Code2, () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'))}
        {toolbarButton('Horizontal Rule', Minus, () => editor.chain().focus().setHorizontalRule().run())}
        {toolbarButton('Undo', Undo2, () => editor.chain().focus().undo().run())}
        {toolbarButton('Redo', Redo2, () => editor.chain().focus().redo().run())}
      </div>

      {/* Editor Content */}
      <div className="min-h-[160px] p-4 focus:outline-none prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
