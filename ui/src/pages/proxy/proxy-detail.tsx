import React from 'react';
import { Form } from 'antd';
import {
  DrawerForm,
  ProForm,
  ProFormList,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';

interface Props {
  visible: boolean;
  onSave: () => void;
  onClose: () => void;
}

export const ProxyDetail: React.FC<Props> = (props) => {
  const [form] = Form.useForm();

  return (
    <DrawerForm
      title="代理项"
      width={600}
      form={form}
      onOpenChange={(value) => !value && props.onClose()}
      open={props.visible}
    >
      <ProFormText
        name="name"
        label="代理名称"
        placeholder="请输入代理名称"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="matchValue"
        label="匹配内容"
        extra="支持字符串和正则匹配"
        placeholder="请输入匹配内容"
        rules={[{ required: true }]}
      />
      <ProFormList
        className="proxy-detail-list"
        name="requestSetting"
        label="代理请求"
        initialValue={[]}
        copyIconProps={false}
      >
        <ProFormGroup key="group">
          <ProFormSelect
            name="type"
            label="类型"
            width={145}
            valueEnum={{
              addedHeaders: '增加请求头',
              addedUrlParams: '增加 query 参数',
              addedBodyPrams: '增加请求体参数',
            }}
          />
          <ProFormText name="key" width={180} label="key" />
          <ProFormText name="value" width={180} label="value" />
        </ProFormGroup>
      </ProFormList>
    </DrawerForm>
  );
};
