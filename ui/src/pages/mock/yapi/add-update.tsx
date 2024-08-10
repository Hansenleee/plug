import React from 'react';
import { Form } from 'antd';
import axios from 'axios';
import { ModalForm, ProFormText, ProFormRadio } from '@ant-design/pro-components';
import { message } from 'antd/lib';

interface Props {
  open: boolean;
  record?: any;
  onOk: () => void;
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
    return axios.post('/api/mock/yapi/addById', values).then(() => {
      message.success('添加成功');
      props.onOk();
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
      <ProFormRadio.Group
        name="dataType"
        label="mock 数据来源"
        rules={[{ required: true }]}
        options={[
          {
            label: 'yapi',
            value: 'url',
          },
          {
            label: '自定义',
            value: 'define',
            disabled: true,
          },
        ]}
        initialValue="url"
      />
    </ModalForm>
  );
};
