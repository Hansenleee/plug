import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Button, Space } from 'antd';
import axios from 'axios';

interface Props {
  record?: Record<string, any>;
}

export const MockParams =forwardRef<any, Props>((props, ref) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const updateEditorValue = (value: object) => {
    editorRef.current?.setValue(JSON.stringify(value));
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }

  const handleFetchDefault = () => {
    return axios
      .get('/api/mock/interface/detail/request', {
        params: {
          yapiId: props.record?.yapiId,
          token: props.record?.token,
        }
      })
      .then((requestMap) => {
        updateEditorValue(requestMap);
      })
  };

  const handlePagination = () => {
    updateEditorValue({
      page: {
        pageNo: 1,
        pageSize: 15
      }
    });
  };

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

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button color="primary" size="small" variant="outlined" onClick={handleFetchDefault}>默认请求参数</Button>
        <Button color="cyan" size="small" variant="outlined" onClick={handlePagination}>分页参数</Button>
      </Space>
      <div id="paramsEditorId" style={{ height: 400 }} />
    </div>
  )
})
