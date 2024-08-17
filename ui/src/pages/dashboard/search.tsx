import React, { useState } from 'react';
import { Input, Space, Button } from 'antd';
import { PauseOutlined, ClearOutlined, CaretRightOutlined } from '@ant-design/icons';

interface Props {
  onSearch: (value: string) => void;
  onClear: () => void;
}

export const Search: React.FC<Props> = (props) => {
  const [isStart, setIsStart] = useState(true);

  const handlePause = () => {
    setIsStart(false);
  };

  const handleStart = () => {
    setIsStart(true);
  };

  return (
    <Space style={{ marginBottom: 20 }}>
      <Input.Search placeholder="请输接口地址" onSearch={props.onSearch} size="middle" style={{ width: 300 }} />
      {isStart ? (
        <Button type="primary" danger icon={<PauseOutlined />} size="middle" onClick={handlePause}>
          暂停
        </Button>
      ) : (
        <Button type="primary" icon={<CaretRightOutlined />} size="middle" onClick={handleStart}>
          开始
        </Button>
      )}
      <Button icon={<ClearOutlined />} size="middle" onClick={props.onClear}>
        清空
      </Button>
    </Space>
  );
};
