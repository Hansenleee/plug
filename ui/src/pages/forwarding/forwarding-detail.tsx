import React, { useEffect } from 'react';
import { Form, message, Tooltip } from 'antd';
import {
  DrawerForm,
  ProFormList,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
} from '@ant-design/pro-components';
import axios from 'axios';

interface Props {
  detail?: Record<string, any>;
  visible: boolean;
  onSave: () => void;
  onClose: () => void;
}

export const ForwardingDetail: React.FC<Props> = (props) => {
  const [form] = Form.useForm();

  const transformSetting2Map = (settingList: Array<Record<string, any>>) => {
    return settingList.reduce<Record<string, any[]>>((totalMap, current) => {
      const { type } = current;
      const newItem = { key: current.key, value: current.value };

      if (totalMap[type]) {
        totalMap[type].push(newItem);
      } else {
        totalMap[type] = [newItem];
      }

      return totalMap;
    }, {});
  };

  const transformSetting2Array = (settingMap: Record<string, any[]> = {}) => {
    return Object.entries(settingMap).reduce<Array<Record<string, any>>>((total, [key, values]) => {
      return [
        ...total,
        ...values.map((value) => ({
          ...value,
          type: key,
        })),
      ];
    }, []);
  };

  const handleSubmit = (values: Record<string, any>) => {
    const { requestSetting, responseSetting } = values;

    if (!props.detail) {
      return axios
        .post('/api/forward/item/add', {
          ...values,
          requestSetting: transformSetting2Map(requestSetting),
          responseSetting: transformSetting2Map(responseSetting),
        })
        .then(() => {
          form.resetFields();
          message.success('保存成功');
          props.onSave();
        });
    }

    return axios
      .post('/api/forward/item/update', {
        id: props.detail.id,
        ...values,
        requestSetting: transformSetting2Map(requestSetting),
        responseSetting: transformSetting2Map(responseSetting),
      })
      .then(() => {
        form.resetFields();
        message.success('修改成功');
        props.onSave();
      });
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.resetFields();
      props.onClose();
    }
  };

  useEffect(() => {
    if (props.visible) {
      form.setFieldsValue({
        ...props.detail,
        requestSetting: transformSetting2Array(props.detail?.requestSetting),
        responseSetting: transformSetting2Array(props.detail?.responseSetting),
      });
    }
  }, [props.visible]);

  return (
    <DrawerForm
      title="转发规则"
      width={600}
      form={form}
      onOpenChange={handleOpenChange}
      open={props.visible}
      onFinish={handleSubmit}
    >
      <ProFormText
        name="name"
        label="转发规则名称"
        placeholder="请输入转发规则名称"
        rules={[{ required: true }]}
      />
      <ProFormGroup size={8}>
        <ProFormSelect
          name="matchType"
          label="匹配方式"
          valueEnum={{
            string: '字符串',
            regExp: '正则',
          }}
          width={145}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="matchValue"
          label="匹配值"
          placeholder="请输入匹配值"
          width={398}
          rules={[{ required: true }]}
        />
      </ProFormGroup>
      <ProFormText name="forwardValue" label="转发地址" placeholder="请输入匹配值" />
      <ProFormDigit
        name="rt"
        extra="0代表不限制"
        label="接口响应时间(单位毫秒)"
        min={0}
        initialValue={0}
      />
      <ProFormList name="requestSetting" label="请求头配置" initialValue={[]} copyIconProps={false}>
        <ProFormGroup key="group" size={8}>
          <ProFormSelect
            name="type"
            label="类型"
            width={145}
            valueEnum={{
              addedHeaders: '增加请求头',
              addedUrlParams: '增加 query 参数',
              addedBodyPrams: {
                text: <Tooltip title="后续逐步支持">增加请求体参数</Tooltip>,
                disabled: true,
              },
            }}
          />
          <ProFormText name="key" width={180} label="key" />
          <ProFormText name="value" width={180} label="value" />
        </ProFormGroup>
      </ProFormList>
      <ProFormList
        name="responseSetting"
        label="响应头配置"
        initialValue={[]}
        copyIconProps={false}
      >
        <ProFormGroup key="group" size={8}>
          <ProFormSelect
            name="type"
            label="类型"
            width={145}
            valueEnum={{
              addedHeaders: '增加响应头',
            }}
            initialValue="addedHeaders"
          />
          <ProFormText name="key" width={180} label="key" />
          <ProFormText name="value" width={180} label="value" />
        </ProFormGroup>
      </ProFormList>
    </DrawerForm>
  );
};
