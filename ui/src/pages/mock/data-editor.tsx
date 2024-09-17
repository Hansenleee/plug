import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer, Button, message } from 'antd';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import axios from 'axios';
import { useUnmount } from 'ahooks';

interface Props {
  visible: boolean;
  record?: Record<string, string>;
  onClose: () => void;
  onSave: () => void;
}

export const DataEditor: React.FC<Props> = (props) => {
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const handleUpdateData = () => {
    setSaving(true);

    return axios.post('/api/mock/common/data', {
      apiId: props.record?.id,
      mockString: editorRef.current?.getValue().replaceAll('\n', '').replaceAll('  ', ''),
    }).then(() => {
      message.success('修改成功');
      props.onSave();
    }).finally(() => {
      setSaving(false);
    });
  };

  const fetchMockData = useCallback(() => {
    return axios.get('/api/mock/common/data', {
      params: { apiId: props.record?.id }
    }).then((mockData) => {
      editorRef.current?.setValue(JSON.stringify(mockData, null, '  '));
    });
  }, [props.record?.id]);

  const initEditor = useCallback(() => {
    const container = document.getElementById('editorId') as HTMLElement;

    editorRef.current = monaco.editor.create(container, {
      value: '',
      language: 'json',
      theme: 'vs-dark',
      contextmenu: true,
      automaticLayout: true,
      tabSize: 2,
      fontSize: 14,
    });
  }, [])

  useEffect(() => {
    if (props.visible) {
      initEditor();
      fetchMockData();
    }
  }, [fetchMockData, initEditor, props.visible]);

  useUnmount(() => {
    editorRef.current?.dispose();
  });

  return (
    <Drawer
      title="编辑"
      width="60%"
      style={{ minWidth: 600 }}
      extra={<Button type="primary" loading={saving} onClick={handleUpdateData}>保存</Button>}
      onClose={props.onClose}
      open={props.visible}
      destroyOnClose
    >
      <div id="editorId" style={{ height: '100%' }} />
    </Drawer>
  )
};
