import { useMount } from 'ahooks';
import { Select } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

export const LogsTypeSelector: React.FC<Props> = (props) => {
  const [logsTypes, setLogsTypes] = useState<Array<{ label: string; value: string }>>([]);

  useMount(() => {
    axios.get<any, string[]>('/api/system/logs/logsTypes').then((types) => {
      setLogsTypes(types.map((type) => ({ label: type, value: type })));
      props.onChange(types[0]);
    });
  });

  return (
    <Select
      placeholder="请选择日志类型"
      options={logsTypes}
      style={{ width: 200 }}
      value={props.value}
      onChange={props.onChange}
    />
  );
};
