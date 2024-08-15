import React from 'react';
import { Card, Drawer, Space, Typography } from 'antd';
import { DeleteOutlined, SyncOutlined, EditOutlined } from '@ant-design/icons';

interface Props {
  visible: boolean;
  projectList: Array<Record<string, string>>;
  onClose: () => void;
  onEdit: (record: Record<string, string>) => void;
}

export const ProjectList: React.FC<Props> = (props) => {
  return (
    <Drawer title="项目列表" width={500} onClose={props.onClose} open={props.visible}>
      {props.projectList?.map((project) => {
        const actions: React.ReactNode[] = [
          <EditOutlined key="edit" onClick={() => props.onEdit(project)} />,
          <SyncOutlined key="upgrade" />,
          <DeleteOutlined key="delete" style={{ color: 'red' }} />,
        ];

        return <Card actions={actions}>
          <Space direction="vertical">
            <Typography.Text>id: {project.id}</Typography.Text>
            <Typography.Text>名称: {project.projectName}</Typography.Text>
          </Space>
        </Card>
      })}
    </Drawer>
  )
};