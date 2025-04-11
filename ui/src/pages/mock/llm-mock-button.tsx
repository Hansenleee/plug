import React from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { BorderOutlined } from '@ant-design/icons';

export interface Props {
  loading: boolean;
  onClick: () => void;
  onItemClick: (e: MenuInfo) => void;
  onStop: () => void;
}

export const LLMMockButton: React.FC<Props> = (props) => {
  if (props.loading) {
    return <Button type="primary" danger icon={<BorderOutlined />} onClick={props.onStop}>Stop AI Mock</Button>
  }

  return (
    <Dropdown.Button
      menu={{
        items: [{ key: 'pro', label: '自定义请求参数' }],
        onClick: props.onItemClick,
      }}
      type="primary"
      onClick={() => props.onClick()}
    >
      AI Mock
    </Dropdown.Button>
  )
};
