import React from 'react';
import { Card, Drawer, message, Modal, Space, Typography, Button, Empty, Radio } from 'antd';
import { DeleteOutlined, SyncOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Props {
  visible: boolean;
  projectList: Array<Record<string, string>>;
  onClose: () => void;
  onEdit: (record: Record<string, string>) => void;
  onRefresh: () => void;
  onAddProject: () => void;
}
const UPGRADE_OPTIONS = [{
  label: '全部更新',
  value: 'all',
}, {
  label: '部分更新(自定义接口将不会更新)',
  value: 'notDefine',
}];

export const ProjectList: React.FC<Props> = (props) => {
  const handleUpgrade = (project: Record<string, string>) => {
    let value = UPGRADE_OPTIONS[0].value;

    Modal.confirm({
      title: '请选择更新策略',
      content: <Radio.Group options={UPGRADE_OPTIONS} value={value} onChange={(e) => value = e.target.value} />,
      footer: null,
      // onOk: () => {
      //   return axios.post('/api/mock/project/upgrade', {
      //     id: project.id,
      //     projectId: project.projectId,
      //     token: project.token,
      //     intelligent: project.intelligent,
      //     prefix: project.prefix,
      //     upgradeType: value,
      //   }).then(() => {
      //     message.success('更新成功');
      //     props.onRefresh();
      //   })
      // }
    });
  };

  const handleDelete = (project: Record<string, string>) => {
    Modal.confirm({
      title: '删除项目后会同步删除其下的所有接口，是否确认删除？',
      onOk: () => {
        return axios.post('/api/mock/project/delete', {
          id: project.id,
        }).then(() => {
          message.success('删除成功');
          props.onRefresh();
        })
      }
    });
  };

  return (
    <Drawer
      title="项目列表"
      width={500}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={props.onAddProject}>添加</Button>}
      onClose={props.onClose}
      open={props.visible}
    >
      {props.projectList?.map((project) => {
        const actions: React.ReactNode[] = [
          <EditOutlined key="edit" onClick={() => props.onEdit(project)} />,
          <SyncOutlined key="upgrade" onClick={() => handleUpgrade(project)} />,
          <DeleteOutlined key="delete" style={{ color: 'red' }} onClick={() => handleDelete(project)} />,
        ];

        return (
          <Card actions={actions} key={project.id} style={{ marginBottom: 24 }}>
            <Space direction="vertical">
              <Typography.Text>项目id: {project.projectId}</Typography.Text>
              <Typography.Text>项目名称: {project.projectName}</Typography.Text>
            </Space>
          </Card>
        )
      })}
      {
        !props.projectList?.length ? (
          <Empty
            className="project-empty"
            style={{ transform: 'translateY(100%)'}}
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{ height: 150 }}
            description="暂无数据"
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={props.onAddProject}>添加项目</Button>
          </Empty>
        ) : null
      }
    </Drawer>
  )
};