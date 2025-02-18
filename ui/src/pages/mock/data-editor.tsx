import { Drawer, Button, message, Space, Spin } from 'antd';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const [mocking, setMocking] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const handleUpdateData = () => {
    setSaving(true);

    return axios
      .post('/api/mock/common/data', {
        apiId: props.record?.id,
        mockString: editorRef.current?.getValue(),
      })
      .then(() => {
        message.success('修改成功');
        props.onSave();
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const fetchMockData = useCallback(
    (params = {}) => {
      setMocking(true);
      return axios
        .get('/api/mock/common/data', {
          params: { apiId: props.record?.id, ...params },
        })
        .then((mockData) => {
          editorRef.current?.setValue(mockData as unknown as string);
          setTimeout(() => {
            editorRef.current?.getAction('editor.action.formatDocument')?.run();
          }, 100);
        })
        .finally(() => {
          setMocking(false);
        });
    },
    [props.record?.id]
  );

  const fetchRemoteMockDataForce = () => {
    return fetchMockData({ mockType: 'intelligent' });
  };

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
  }, []);

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
      extra={
        <Space>
          <Button onClick={fetchRemoteMockDataForce} loading={mocking}>智能 Mock</Button>
          <Button type="primary" size="small" loading={saving} onClick={handleUpdateData}>
            保存
          </Button>
        </Space>
      }
      onClose={props.onClose}
      open={props.visible}
      destroyOnClose
    >
      <Spin tip="数据 Mock 中，请耐心等候" spinning={mocking} wrapperClassName="data-editor-class">
        <div id="editorId" style={{ height: '100%' }} />
      </Spin>
    </Drawer>
  );
};
