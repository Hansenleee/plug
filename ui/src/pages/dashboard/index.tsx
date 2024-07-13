import { Table} from 'antd';
import React from 'react';
import { columns } from './column';
import { Search } from './search';
import './style.scss';

const DEMO = [{
  url: 'https://minyi.zjzwfw.gov.cn/dczjnewls/dczj/survey/form_3022.html',
  method: 'POST',
  status: '200',
  type: 'XHR',
  start: '12:10:11.888',
  duration: '0.8s',
  size: '0.5kb'
}];

const Dashbord: React.FC = () => {
  return (
    <div>
      <Search />
      <Table pagination={false} columns={columns} dataSource={DEMO} />
    </div>
  )
};

export default Dashbord;
