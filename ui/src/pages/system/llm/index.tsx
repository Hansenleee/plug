import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form, message, Typography } from 'antd';
import axios from 'axios';
import { useEffect } from 'react';

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
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormSelect
        name="LLMProvider"
        label="大模型提供方"
        placeholder="请选择"
        valueEnum={{ volcengine: '火山引擎', local: '本地 ollama' }}
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
      <ProFormText
        name="LLMId"
        label="大模型 ID"
      />
      <ProFormText
        name="LLMApiToken"
        label="API token"
        rules={[{ required: true }]}
        required
        extra={
          <Typography.Link
            href="https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey"
            target="_blank"
          >
            火山引擎申请 API 地址
          </Typography.Link>
        }
      />
    </ModalForm>
  );
};
