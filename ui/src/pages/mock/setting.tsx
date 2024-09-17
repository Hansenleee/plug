import React, { useEffect } from 'react';
import { Form } from 'antd';
import axios from 'axios';
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
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
    return axios.post('/api/mock/yapi/config', {
      ...values,
      mockHost: !values.mockHost ? [] : values.mockHost.split(','),
    }).then(() => {
      message.success('保存成功');
      props.onClose();
    });
  };

  useEffect(() => {
    if (props.open) {
      axios.get('/api/mock/yapi/config').then((initSetting: any) => {
        form.setFieldsValue({
          ...initSetting,
        });
      });
    }
  }, [form, props.open]);

  return (
    <ModalForm
      open={props.open}
      title="基础配置"
      form={form}
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormText
        name="host"
        label="yapi 完整域名(包含 http 或 https)"
        placeholder="请输入"
        rules={[{ required: true }]}
      />
      <ProFormSelect
        name="mockHost"
        label="需要 mock 的域名(多个域名可用,逗号隔开)"
        mode="tags"
        placeholder="请输入"
      />
    </ModalForm>
  );
};
