import { Form } from 'antd';
import { ModalForm, ProFormText, ProFormUploadButton } from '@ant-design/pro-components';
import { useEffect } from 'react';
import axios from 'axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const Certificate: React.FC<Props> = (props) => {
  const [form] = Form.useForm();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      props.onClose();
    }
  };

  useEffect(() => {
    if (props.open) {
      axios.get('/api/system/config').then((initSetting: any) => {
        form.setFieldsValue({
          ...initSetting,
          certificateUrl: [{url: initSetting.certificateUrl}]
        });
      });
    }
  }, [form, props.open]);

  return (
    <ModalForm
      open={props.open}
      title="证书管理"
      width={600}
      form={form}
      onFinish={() => Promise.resolve(props.onClose())}
      onOpenChange={handleOpenChange}
    >
      <ProFormUploadButton
        name="certificateUrl"
        label="在线证书"
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
        }}
        max={1}
        disabled
      />
      <ProFormText
        name="certificateDir"
        label="本地证书存储文件夹"
        disabled
      />
    </ModalForm>
  )
}
