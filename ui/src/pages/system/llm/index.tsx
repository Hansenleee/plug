import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormDependency,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import axios from 'axios';
import { useEffect } from 'react';
import { LLMProviderEnum, LLM_APPLY_MAP } from './shared';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const LLMConfig: React.FC<Props> = (props) => {
  const [form] = Form.useForm<{ name: string; company: string }>();

  const handleFinish = (values: unknown) => {
    return axios.post('/api/system/config/llm', values).then(() => {
      message.success('修改成功');
      props.onClose();
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      props.onClose();
    }
  };

  useEffect(() => {
    if (props.open) {
      axios.get('/api/system/config').then((initSetting: any) => {
        form.setFieldsValue({
          ...initSetting,
        });
      });
    }
  }, [form, props.open]);

  return (
    <ModalForm
      open={props.open}
      title="模型管理"
      width={600}
      form={form}
      modalProps={{ zIndex: 1100 }}
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormSelect
        name="LLMProvider"
        label="大模型平台"
        placeholder="请选择"
        valueEnum={{
          [LLMProviderEnum.volcengine]: '火山引擎',
          [LLMProviderEnum.baidu]: '百度千帆',
          [LLMProviderEnum.local]: '本地 ollama',
        }}
        rules={[{ required: true }]}
        required
      />
      <ProFormSelect
        name="LLMType"
        label="大模型"
        placeholder="请选择"
        valueEnum={{ deepseekV3: 'deepseek V3', doubao: 'doubao', others: '其他模型' }}
        rules={[{ required: true }]}
        required
      />
      <ProFormText name="LLMId" label="大模型 ID" />
      <ProFormDependency name={['LLMProvider']}>
        {({ LLMProvider }) => {
          if (LLMProvider === LLMProviderEnum.local) {
            return null;
          }

          return (
            <ProFormText
              name="LLMApiToken"
              label="API token"
              rules={[{ required: true }]}
              required
              extra={LLM_APPLY_MAP[LLMProvider as LLMProviderEnum]}
            />
          );
        }}
      </ProFormDependency>
    </ModalForm>
  );
};
