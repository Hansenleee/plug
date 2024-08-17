import React, { useEffect, useRef } from 'react';
import { Drawer, Button, message } from 'antd';
import * as monaco from 'monaco-editor';

interface Props {
  visible: boolean;
  record?: Record<string, string>;
  onClose: () => void;
}

export const DataEditor: React.FC<Props> = (props) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const handleUpdateData = () => {
    message.success('修改成功');
    props.onClose();
  };

  useEffect(() => {
    if (props.visible) {
      const container = document.getElementById('editorId') as HTMLElement;

      editorRef.current = monaco.editor.create(container, {
        value: '',
        language: 'json',
        theme: "vs-dark",
        contextmenu: false,
        automaticLayout: true,
        tabSize: 2,
      });
    }
  }, [props.visible]);

  return (
    <Drawer
      title="编辑"
      width={600}
      extra={<Button type="primary" onClick={handleUpdateData}>确认</Button>}
      onClose={props.onClose}
      open={props.visible}
    >
      <div id="editorId" style={{ height: '100%' }} />
    </Drawer>
  )
};
