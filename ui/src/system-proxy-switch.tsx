import React, { useState } from 'react';
import { message, Switch } from 'antd';
import axios from 'axios';
import { useMount } from 'ahooks';

export const SystemProxySwitch: React.FC<unknown> = () => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    isChecked: boolean,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();

    setLoading(true);

    return axios
      .post('/api/system/proxy/toggle', {
        enabled: isChecked,
      })
      .then(() => {
        setChecked(isChecked);

        if (isChecked) {
          message.success('已开启系统代理, Plug 会代理本机所有请求');
        } else {
          message.success(
            '已关闭系统代理, 如你想使用【科学上网】工具，需在【科学上网】工具上开启代理',
            3
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useMount(() => {
    setLoading(true);

    axios
      .get<any, { enabled: boolean }>('/api/system/proxy/status')
      .then((status) => {
        setChecked(!!status?.enabled);
      })
      .finally(() => {
        setLoading(false);
      });
  });

  return (
    <Switch
      checked={checked}
      loading={loading}
      checkedChildren="关闭系统代理"
      unCheckedChildren="开启系统代理"
      onChange={handleChange}
    />
  );
};
