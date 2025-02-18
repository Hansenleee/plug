import React, { useContext, useEffect } from 'react';
import { Form } from 'antd';
import axios from 'axios';
import { ModalForm, ProFormText, ProFormSwitch, ProForm, ProFormRadio, ProFormDependency } from '@ant-design/pro-components';
import { message } from 'antd/lib';
import { AppContext } from '../../context';

interface Props {
  open: boolean;
  project?: any;
  onOk: () => void;
  onClose: () => void;
}

export const AddProject: React.FC<Props> = (props) => {
  const [form] = Form.useForm<{ name: string; company: string }>();
  const { showLLMConfig } = useContext(AppContext);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      props.onClose();
      form.resetFields();
    }
  };

  const postProject = (values: Record<string, any>) => {
    const request = !!props.project ? axios.post('/api/mock/project/update', {
      ...values,
      id: props.project.id,
    }) : axios.post('/api/mock/project/add', values);

    return request.then(() => {
      message.success('保存成功');
      props.onOk();
    });
  };

  const handleFinish = (values: Record<string, any>) => {
    if (values.intelligent) {
      return axios.get('/api/system/config').then((systemConfig: Record<string, any>) => {
        if (!systemConfig.LLMApiToken) {
          showLLMConfig();
          message.warning('开启「智能 Mock」前需要配置模型信息');

          return;
        }

        return postProject(values);
      });
    }

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
      <ProFormText
        name="prefix"
        label="接口前缀"
        placeholder="请输入"
      />
      <ProFormSwitch
        name="enable"
        label="启用状态"
        initialValue={true}
      />
      <ProForm.Group>
        <ProFormSwitch
          name="intelligent"
          label="智能 Mock"
          initialValue={false}
          tooltip="智能 Mock 会将 Mock 的内容缓存到本地，点击列表页的同步会更新 Mock 内容"
          extra="智能 Mock 需要更长(10s 左右)的等待时间"
          disabled={true}
        />
        <ProFormDependency name={['intelligent']}>
          {({ intelligent }) => {
            return intelligent ? (
              <ProFormRadio.Group
                name="intelligentTriggerType"
                label="触发方式"
                options={[
                  {
                    label: '调用时触发',
                    value: 'invoke',
                  },
                  {
                    label: '创建时触发',
                    value: 'create',
                  },
                ]}
                rules={[{ required: true }]}
              />
            ) : null;
          }}
        </ProFormDependency>
      </ProForm.Group>
    </ModalForm>
  );
};
