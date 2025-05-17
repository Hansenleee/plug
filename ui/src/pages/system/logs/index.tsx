import { Modal } from 'antd';
import React, { useEffect, useCallback, useRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SystemLogs: React.FC<Props> = (props) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const initEditor = useCallback(() => {
    const container = document.getElementById('logEditorId') as HTMLElement;

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

  useEffect(() => {
    if (props.open) {
      initEditor();
    }
  }, [initEditor, props.open]);

  return (
    <Modal title="系统日志" open={props.open} width={800} footer={null} onCancel={props.onClose}>
      <div style={{ height: '70vh' }}>
        <div id="logEditorId" style={{ height: '100%' }} />
      </div>
    </Modal>
  );
};
