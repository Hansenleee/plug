import React, { useEffect } from 'react';
import { Form } from 'antd';
import axios from 'axios';
import { ModalForm, ProFormText, ProFormRadio, ProFormSwitch } from '@ant-design/pro-components';
import { message } from 'antd/lib';

interface Props {
  open: boolean;
  project?: any;
  onOk: () => void;
  onClose: () => void;
}

export const AddProject: React.FC<Props> = (props) => {
  const [form] = Form.useForm<{ name: string; company: string }>();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      props.onClose();
    }
  };

  const handleFinish = (values: any) => {
    const request = !!props.project ? axios.post('/api/mock/yapi/project/update', {
      ...values,
      id: props.project.id,
    }) : axios.post('/api/mock/yapi/addByProject', values);

    return request.then(() => {
      message.success('保存成功');
      props.onOk();
    });
  };

  useEffect(() => {
    if (props.open && props.project) {
      form.setFieldsValue(props.project);
    }
  }, [form, props.open, props.project])

  return (
    <ModalForm
      open={props.open}
      title={props.project ? '修改项目' : '新增项目'}
      form={form}
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormText
        name="token"
        label="yapi 项目 token"
        placeholder="请输入"
        disabled={!!props.project}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="projectName"
        label="yapi 项目名称"
        placeholder="请输入"
      />
      <ProFormSwitch
        name="enable"
        label="启用状态"
        initialValue={true}
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
