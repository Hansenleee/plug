import { Drawer, Button, message, Space, Dropdown, Modal } from 'antd';
import type { MenuInfo } from 'rc-menu/lib/interface';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useUnmount } from 'ahooks';
import { LLMMockButton } from './llm-mock-button';
import { AppContext } from '../../context';
import { BASE_API_PORT, JSON_RESULT_TAG } from '../../constants';
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
  const [llMockData, setLlmMockData] = useState({ loading: false });
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const editorParamsRef = useRef<any>();
  const socketRef = useRef<Socket>();
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
          }, 20);
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
        content: <MockParams ref={editorParamsRef} record={props.record} />,
        width: 650,
        height: 500,
        onOk: () => {
          const params = editorParamsRef.current.getValue();
          const parsedParams = JSON.parse(params);

          fetchRemoteMock({
            requestParams: parsedParams,
          });
        },
      });
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.close();
    }
  };

  const fetchMockDataByLLM = (params = {}) => {
    const now = Date.now();

    disconnectSocket();
    setLlmMockData({ loading: true });

    const socket = io(`ws://127.0.0.1:${BASE_API_PORT}`, { transports: ['websocket'] });
    let streamStr = '';

    socket.on('connect', () => {
      socket.on('PLUG_SOCKET', (args) => {
        if (args.name === 'MOCK_STREAM_ITEM') {
          const item = args.payload?.[0];

          if (item?.end) {
            message.success(`Mock 成功, 耗时: ${(Date.now() - now) / 1000}s`);

            setTimeout(() => {
              setLlmMockData({ loading: false });

              if (item.pagination) {
                try {
                  const parsedStream = JSON.parse(streamStr);

                  parsedStream.page = JSON.parse(item.content);
                  editorRef.current?.setValue(JSON.stringify(parsedStream));
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.log('[解析 LLM mock 数据异常]', err);
                }
              }

              editorRef.current?.getAction('editor.action.formatDocument')?.run();
              disconnectSocket();
            }, 200);

            return;
          }

          streamStr += item?.content;

          if (streamStr.includes(`<${JSON_RESULT_TAG}>`)) {
            streamStr = streamStr.replace(`<${JSON_RESULT_TAG}>`, '');
          }

          if (streamStr.includes(`</${JSON_RESULT_TAG}>`)) {
            streamStr = streamStr.replace(`</${JSON_RESULT_TAG}>`, '');
          }

          editorRef.current?.setValue(streamStr);
        }
      });

      socket.emit('PLUG_SOCKET', {
        name: 'MOCK_LLM_START',
        payload: {
          mockItem: props.record,
          ...params,
        },
      });
    });

    socketRef.current = socket;
  };

  const handleStopIntelligentMock = () => {
    disconnectSocket();
    setLlmMockData({ loading: false });
  };

  const fetchIntelligentMockData = (params = {}) => {
    return axios.get('/api/system/config').then((systemConfig: Record<string, any>) => {
      if (!systemConfig.LLMApiToken) {
        showLLMConfig();
        message.warning('「智能 Mock」前需要配置模型信息');

        return;
      }

      fetchMockDataByLLM(params);
    });
  };

  const handleClickIntelligentItem = (e: MenuInfo) => {
    if (e.key === 'pro') {
      return Modal.confirm({
        title: 'Mock 请求参数',
        content: <MockParams record={props.record} ref={editorParamsRef} />,
        width: 650,
        height: 500,
        onOk: () => {
          const params = editorParamsRef.current.getValue();
          const parsedParams = JSON.parse(params);

          fetchIntelligentMockData({
            requestParams: parsedParams,
          });
        },
      });
    }

    if (e.key === 'stop') {
      setLlmMockData({ loading: false });
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
    disconnectSocket();
  });

  return (
    <Drawer
      title="编辑"
      width="60%"
      style={{ minWidth: 600 }}
      extra={
        <Space>
          {props.record?.yapiId ? (
            <>
              <LLMMockButton
                loading={llMockData.loading}
                onClick={fetchIntelligentMockData}
                onItemClick={handleClickIntelligentItem}
                onStop={handleStopIntelligentMock}
              />
              <Dropdown.Button
                menu={{
                  items: [{ key: 'pro', label: '自定义请求参数' }],
                  onClick: handleClickRemoteItem,
                }}
                type="primary"
                loading={mocking}
                onClick={() => fetchRemoteMock()}
              >
                yapi Mock
              </Dropdown.Button>
            </>
          ) : null}
          <Button color="primary" variant="outlined" loading={saving} onClick={handleUpdateData}>
            保存
          </Button>
          <Button danger onClick={props.onClose}>
            取消
          </Button>
        </Space>
      }
      onClose={props.onClose}
      open={props.visible}
      destroyOnClose
    >
      <div id="editorId" style={{ height: '100%' }} />
    </Drawer>
  );
};
