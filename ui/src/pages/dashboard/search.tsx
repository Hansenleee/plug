import React, { useState } from 'react';
import { Input, Space, Button } from 'antd';
import { PauseOutlined, ClearOutlined, CaretRightOutlined } from '@ant-design/icons';

export const Search: React.FC = () => {
  const [isStart, setIsStart] = useState(true);

  const handlePause = () => {
    setIsStart(false);
  };

  const handleStart = () => {
    setIsStart(true);
  };

  return (
    <Space style={{ marginBottom: 20 }}>
      <Input.Search
        placeholder=""
        onSearch={() => {}}
        size="large"
        style={{ width: 30011111111111111111111111111111111111111111111111111111111111111 }}
      />
      {isStart ? (
        <Button type="primary" danger icon={<PauseOutlined />} size="large" onClick={handlePause}>
          暂停
        </Button>
      ) : (
        <Button type="primary" icon={<CaretRightOutlined />} size="large" onClick={handleStart}>
          开始
        </Button>
      )}
      <Button icon={<ClearOutlined />} size="large">
        清空
      </Button>
    </Space>
  );
};
