import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code2,
  Minus,
  CheckSquare,
  Underline as UnderlineIcon,
  Highlighter,
} from "lucide-react";

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("URL de la imagen");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    const rows = parseInt(window.prompt("Número de filas", "3"));
    const cols = parseInt(window.prompt("Número de columnas", "3"));
    if (rows && cols) {
      editor.chain().focus().insertTable({ rows, cols }).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50 rounded-t-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("bold") ? "bg-gray-200" : ""
          }`}
          title="Negrita"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("italic") ? "bg-gray-200" : ""
          }`}
          title="Cursiva"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("underline") ? "bg-gray-200" : ""
          }`}
          title="Subrayado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("highlight") ? "bg-gray-200" : ""
          }`}
          title="Resaltar"
        >
          <Highlighter className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
          }`}
          title="Título 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
          }`}
          title="Título 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""
          }`}
          title="Título 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
          title="Lista con viñetas"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("orderedList") ? "bg-gray-200" : ""
          }`}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("taskList") ? "bg-gray-200" : ""
          }`}
          title="Lista de tareas"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
          }`}
          title="Alinear a la izquierda"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
          }`}
          title="Centrar"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
          }`}
          title="Alinear a la derecha"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const url = window.prompt("URL del enlace");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("link") ? "bg-gray-200" : ""
          }`}
          title="Insertar enlace"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200"
          title="Insertar imagen"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={addTable}
          className="p-2 rounded hover:bg-gray-200"
          title="Insertar tabla"
        >
          <TableIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("code") ? "bg-gray-200" : ""
          }`}
          title="Código en línea"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("codeBlock") ? "bg-gray-200" : ""
          }`}
          title="Bloque de código"
        >
          <Code2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("blockquote") ? "bg-gray-200" : ""
          }`}
          title="Cita"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Línea horizontal"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Deshacer"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Rehacer"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TiptapEditor = ({ content, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-100 p-4 rounded font-mono",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Escribe el contenido de la lección...",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  return (
    <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 p-6 overflow-y-auto" />
    </div>
  );
};

export default TiptapEditor;
