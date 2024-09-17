import { Form } from 'antd';
import { ModalForm, ProFormDigit } from '@ant-design/pro-components';
import { useEffect } from 'react';
import axios from 'axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const System: React.FC<Props> = (props) => {
  const [form] = Form.useForm<{ name: string; company: string }>();

  const handleFinish = () => {
    return Promise.resolve(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      props.onClose();
    }
  };

  useEffect(() => {
    if (props.open) {
      axios.get('/api/system/config')
    }
  }, [props.open]);

  return (
    <ModalForm
      open={props.open}
      title="系统配置"
      form={form}
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormDigit
        name="systemProxyPort"
        label="系统代理端口"
        placeholder="请输入"
        extra="如果系统设置了科学翻墙，请输入对应的端口"
      />
    </ModalForm>
  )
}
