import { Drawer, Button, message, Space, Spin, Dropdown, Modal } from 'antd';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import axios from 'axios';
import { useUnmount } from 'ahooks';
import { AppContext } from '../../context';
import { MockParams } from './mock-params';

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
  const editorParamsRef = useRef<any>();
  const { showLLMConfig } = useContext(AppContext);

  const handleUpdateData = () => {
    setSaving(true);

    return axios
      .post('/api/mock/common/data/update', {
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
        .post('/api/mock/common/data', { apiId: props.record?.id, ...params })
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

  const fetchRemoteMock = (params = {}) => {
    fetchMockData({ mockType: 'remote', ...params });
  };

  const handleClickRemoteItem = (e: any) => {
    if (e.key === 'pro') {
      return Modal.confirm({
        title: 'Mock 请求参数',
        content: <MockParams ref={editorParamsRef} />,
        width: 600,
        height: 400,
        onOk: () => {
          const params = editorParamsRef.current.getValue();
          const parsedParams = JSON.parse(params);

          fetchRemoteMock({
            requestParams: parsedParams
          });
        }
      });
    }
  };

  const fetchIntelligentMockData = (params = {}) => {
    return axios.get('/api/system/config').then((systemConfig: Record<string, any>) => {
      if (!systemConfig.LLMApiToken) {
        showLLMConfig();
        message.warning('「智能 Mock」前需要配置模型信息');

        return;
      }

      return fetchMockData({ mockType: 'intelligent', ...params }).then(() => {
        message.success('智能 Mock 成功');
      });
    });
  };

  const handleClickIntelligentItem = (e: any) => {
    if (e.key === 'pro') {
      return Modal.confirm({
        title: 'Mock 请求参数',
        content: <MockParams ref={editorParamsRef} />,
        width: 600,
        height: 400,
        onOk: () => {
          const params = editorParamsRef.current.getValue();
          const parsedParams = JSON.parse(params);

          fetchIntelligentMockData({
            requestParams: parsedParams
          });
        }
      });
    }
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
          <Dropdown.Button
            menu={{
              items: [{ key: 'pro', label: '自定义请求参数' }],
              onClick: handleClickIntelligentItem,
            }}
            loading={mocking}
            onClick={fetchIntelligentMockData}
          >
            AI Mock
          </Dropdown.Button>
          <Dropdown.Button
            menu={{
              items: [{ key: 'pro', label: '自定义请求参数' }],
              onClick: handleClickRemoteItem,
            }}
            loading={mocking}
            onClick={() => fetchRemoteMock()}
          >
            yapi Mock
          </Dropdown.Button>
          <Button type="primary" loading={saving} onClick={handleUpdateData}>
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
