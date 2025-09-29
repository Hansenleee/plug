import { Button, Modal, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

import './style.scss';
import { LogsTypeSelector } from './logs-type-selector';
import { LogsDateSelector } from './logs-date-selector';
import axios from 'axios';
import { useUnmount } from 'ahooks';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SystemLogs: React.FC<Props> = (props) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const initSearch = useRef(false);
  const [searchParams, setSearchParams] = useState<{ logsType?: string; logsDate?: string }>({});

  const initEditor = useCallback(() => {
    const container = document.getElementById('logEditorId') as HTMLElement;

    editorRef.current = monaco.editor.create(container, {
      value: '',
      // language: 'json',
      theme: 'vs-dark',
      contextmenu: true,
      automaticLayout: true,
      tabSize: 2,
      fontSize: 14,
    });
  }, []);

  const handleSearch = () => {
    if (!searchParams.logsType || !searchParams.logsDate) {
      return;
    }

    return axios
      .get<any, string>('/api/system/logs/search', {
        params: searchParams,
      })
      .then((logsContent) => {
        editorRef.current?.setValue(
          decodeURIComponent(logsContent.replace(/\u001b/g, '').replace(/\[\d+m/g, ''))
        );
      });
  };

  useEffect(() => {
    if (props.open) {
      initEditor();
    }
  }, [initEditor, props.open]);

  useEffect(() => {
    if (!initSearch.current && searchParams.logsType && searchParams.logsDate) {
      handleSearch();
      initSearch.current = true;
    }
  }, [searchParams]);

  useUnmount(() => {
    editorRef.current?.dispose();
  });

  return (
    <Modal title="系统日志" open={props.open} width={1000} footer={null} onCancel={props.onClose}>
      <div className="system-logs-container">
        <Space style={{ marginBottom: 12, width: '100%' }}>
          <LogsTypeSelector
            value={searchParams.logsType}
            onChange={(value) => {
              setSearchParams((prev) => ({ ...prev, logsType: value }));
            }}
          />
          <LogsDateSelector
            value={searchParams.logsDate}
            onChange={(value) => {
              setSearchParams((prev) => ({ ...prev, logsDate: value }));
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
        </Space>
        <div id="logEditorId" className="system-logs-editor" />
      </div>
    </Modal>
  );
};
