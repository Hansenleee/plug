import React from 'react';
import { Badge } from 'antd';

interface Props {
  status: string | number;
}

export const StatusComponent: React.FC<Props> = ({ status }) => {
  if (status === 'pending') {
    return <Badge className="column-badge" status="processing" size="default" text="pending" />;
  }

  if (status === 200) {
    return <Badge className="column-badge" status="success" size="default" text="200" />;
  }

  return <Badge className="column-badge" status="error" size="default" text={status} />;
};
