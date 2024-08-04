import React from 'react';
import { Form } from 'antd';
import axios from 'axios';
import { ModalForm, ProFormText } from '@ant-design/pro-components';

interface Props {
  open: boolean;
  record?: any;
  onClose: () => void;
}

export const AddUpdate: React.FC<Props> = (props) => {
  const [form] = Form.useForm<{ name: string; company: string }>();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      props.onClose();
    }
  };

  const handleFinish = (values: any) => {
    return axios.post('/api/mock/yapi/addById', values).then((res) => {
      console.log(11111, res);
    });
  };

  return (
    <ModalForm
      open={props.open}
      title={props.record ? '修改' : '新增'}
      form={form}
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormText
        name="yapiId"
        label="yapi 接口 id"
        placeholder="请输入"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="token"
        label="yapi项目 token"
        placeholder="请输入"
        rules={[{ required: true }]}
      />
    </ModalForm>
  );
};
