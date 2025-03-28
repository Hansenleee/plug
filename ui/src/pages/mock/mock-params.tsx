import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const MockParams =forwardRef((props, ref) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  useEffect(() => {
    const container = document.getElementById('paramsEditorId') as HTMLElement;

    editorRef.current = monaco.editor.create(container, {
      value: '',
      language: 'json',
      theme: 'vs-dark',
      contextmenu: true,
      automaticLayout: true,
      tabSize: 2,
      fontSize: 14,
    });
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return editorRef.current?.getValue()
      },
    };
  });

  return <div id="paramsEditorId" style={{ height: 300 }} />
})
