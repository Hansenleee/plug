import React, { useEffect } from 'react';
import { Form } from 'antd';
import axios from 'axios';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd/lib';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const Setting: React.FC<Props> = (props) => {
  const [form] = Form.useForm();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      props.onClose();
    }
  };

  const handleFinish = (values: any) => {
    return axios.post('/api/mock/yapi/config', values).then(() => {
      message.success('保存成功');
      props.onClose();
    });
  };

  useEffect(() => {
    if (props.open) {
      axios.get('/api/mock/yapi/config').then((initSetting) => {
        form.setFieldsValue(initSetting);
      });
    }
  }, [form, props.open]);

  return (
    <ModalForm
      open={props.open}
      title="yapi 配置"
      form={form}
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormText
        name="host"
        label="yapi 域名"
        placeholder="请输入"
        rules={[{ required: true }]}
      />
    </ModalForm>
  );
};
