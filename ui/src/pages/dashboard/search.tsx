import { PauseOutlined, ClearOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Input, Space, Button, Radio } from 'antd';
import React, { useState } from 'react';
import { SearchContentType } from './shared';

interface Props {
  searchContentType: string | SearchContentType;
  onSearch: (value: string) => void;
  onClear: () => void;
  onSearchContentTypeChange: (value: string | SearchContentType) => void;
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
    <Space className="dashboard-search-container">
      <Input.Search
        placeholder="请输接口地址"
        onSearch={props.onSearch}
        size="middle"
        style={{ width: 300 }}
      />
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
      <Radio.Group
        value={props.searchContentType}
        style={{ paddingLeft: 20 }}
        onChange={(e) => props.onSearchContentTypeChange(e.target.value)}
      >
        <Radio.Button value={SearchContentType.ALL}>全部</Radio.Button>
        <Radio.Button value="json">application/json</Radio.Button>
        <Radio.Button value="javascript">js</Radio.Button>
        <Radio.Button value="css">css</Radio.Button>
        <Radio.Button value="image">image</Radio.Button>
      </Radio.Group>
    </Space>
  );
};
