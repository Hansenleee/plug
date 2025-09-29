import { useMount } from 'ahooks';
import { Select } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

export const LogsDateSelector: React.FC<Props> = (props) => {
  const [logsTypes, setLogsTypes] = useState<Array<{ label: string; value: string }>>([]);

  useMount(() => {
    axios.get<any, string[]>('/api/system/logs/logsDates').then((dates) => {
      setLogsTypes(dates.map((date) => ({ label: date, value: date })));
      props.onChange(dates[0]);
    });
  });

  return (
    <Select
      placeholder="请选择日期"
      options={logsTypes}
      style={{ width: 200 }}
      value={props.value}
      onChange={props.onChange}
    />
  );
};
