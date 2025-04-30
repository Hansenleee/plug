import { Form, message } from 'antd';
import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';
import { useEffect } from 'react';
import axios from 'axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const System: React.FC<Props> = (props) => {
  const [form] = Form.useForm<{ name: string; company: string }>();

  const handleFinish = (values: unknown) => {
    return axios.post('/api/system/config', values).then(() => {
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
      title="配置管理"
      width={600}
      form={form}
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormDigit
        name="originSystemProxyPort"
        label="系统代理端口"
        placeholder="请输入"
        extra="如果系统设置了科学翻墙，请输入对应的端口"
      />
      <ProFormText name="proxyPort" label="plug 端口" disabled />
      <ProFormText name="cacheDir" label="本地数据存储文件夹" disabled />
      <ProFormText name="logDir" label="系统日志文件夹" disabled />
    </ModalForm>
  );
};
