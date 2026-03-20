'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

import { Box, Stack, Button } from '@mui/material';

const Editor = ({ value, onChange, placeholder }) => {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CodeBlock,
      HorizontalRule,
      TextStyle,
      Highlight.configure({
        multicolor: true
      }),
      Color,
      Image,

      Link.configure({
        openOnClick: true
      }),

      Placeholder.configure({
        placeholder: placeholder || "Write something..."
      }),

      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),

      Table.configure({
        resizable: true
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],

    content: value,

    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const setColor = () => {
    const color = window.prompt("Enter color (red, #ff0000, etc)");
    if (color) editor.chain().focus().setColor(color).run();
  };

  const getBtnVariant = (name, attrs = {}) =>
    editor.isActive(name, attrs) ? "contained" : "outlined";

  return (
    <Box sx={{ width: '100%' }}>

      {/* MAIN TOOLBAR */}

      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1}>

        <Button size="small" variant={getBtnVariant('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>

        <Button size="small" variant={getBtnVariant('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>

        <Button size="small" variant={getBtnVariant('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Underline
        </Button>

        <Button size="small" onClick={setColor}>
          Text Color
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().toggleHighlight().run()}>
          Highlight
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullet List
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numbered List
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          Left
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          Center
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          Right
        </Button>

        <Button size="small" onClick={addLink}>
          Link
        </Button>

        <Button size="small" onClick={addImage}>
          Image
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Divider
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </Button>

      </Stack>

      {/* TABLE TOOLBAR */}

      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1}>

        <Button size="small"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
          Insert Table
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().addRowAfter().run()}>
          Add Row
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().addColumnAfter().run()}>
          Add Column
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().deleteRow().run()}>
          Delete Row
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().deleteColumn().run()}>
          Delete Column
        </Button>

        <Button size="small"
          onClick={() => editor.chain().focus().deleteTable().run()}>
          Delete Table
        </Button>

      </Stack>

      {/* EDITOR */}

      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 2,
          minHeight: 250,

          "& .tiptap": {
            outline: "none",
            minHeight: "200px",

            "& p": { margin: "0 0 10px 0" },

            "& ul, & ol": {
              paddingLeft: "20px"
            },

            "& table": {
              borderCollapse: "collapse",
              width: "100%"
            },

            "& td, & th": {
              border: "1px solid #ddd",
              padding: "8px"
            },

            "& pre": {
              background: "#f4f4f4",
              padding: "10px",
              borderRadius: "4px"
            }
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>

    </Box>
  );
};

export default Editor;