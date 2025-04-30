import React, { useEffect } from 'react';
import { Form } from 'antd';
import axios from 'axios';
import { ModalForm, ProFormText, ProFormSwitch } from '@ant-design/pro-components';
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
      form.resetFields();
    }
  };

  const postProject = (values: Record<string, any>) => {
    const request = props.project
      ? axios.post('/api/mock/project/update', {
          ...values,
          id: props.project.id,
        })
      : axios.post('/api/mock/project/add', values);

    return request.then(() => {
      message.success('保存成功');
      props.onOk();
    });
  };

  const handleFinish = (values: Record<string, any>) => {
    return postProject(values);
  };

  useEffect(() => {
    if (props.open && props.project) {
      form.setFieldsValue(props.project);
    }
  }, [form, props.open, props.project]);

  return (
    <ModalForm
      open={props.open}
      title={props.project ? '修改项目' : '新增项目'}
      form={form}
      clearOnDestroy
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
        rules={[{ required: true }]}
      />
      <ProFormText name="prefix" label="接口前缀" placeholder="请输入" />
      <ProFormSwitch name="enable" label="启用状态" initialValue={true} />
    </ModalForm>
  );
};
