import React from 'react';
import { Form } from 'antd';
import axios from 'axios';
import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormDigit,
  ProFormRadio,
  ProFormDependency,
  ProFormSwitch,
} from '@ant-design/pro-components';
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
    return axios.post('/api/mock/interface/add', values).then(() => {
      message.success('添加成功');
      props.onOk();
    });
  };

  return (
    <ModalForm
      open={props.open}
      title={props.record ? '修改' : '新增'}
      form={form}
      clearOnDestroy
      onFinish={handleFinish}
      onOpenChange={handleOpenChange}
    >
      <ProFormRadio.Group
        name="apiType"
        label="mock 类型"
        rules={[{ required: true }]}
        options={[
          {
            label: 'yapi',
            value: 'yapi',
          },
          {
            label: '自定义',
            value: 'default',
          },
        ]}
        initialValue="yapi"
      />
      <ProFormDependency name={['apiType']}>
        {({ apiType }) => {
          if (apiType === 'yapi') {
            return (
              <>
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
              </>
            );
          }

          return (
            <>
              <ProFormText name="title" label="描述" placeholder="请输入" />
              <ProFormText
                name="url"
                label="接口地址"
                placeholder="请输入"
                rules={[{ required: true }]}
              />
            </>
          );
        }}
      </ProFormDependency>
      <ProForm.Group>
        <ProFormDigit
          name="responseTime"
          extra="0代表不限制"
          label="接口响应时间(单位毫秒)"
          min={0}
          initialValue={0}
        />
        <ProFormSwitch name="intelligent" label="智能 Mock" initialValue={false} disabled />
      </ProForm.Group>
    </ModalForm>
  );
};
