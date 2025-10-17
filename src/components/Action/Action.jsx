import React from 'react';
import { DeleteOutlined, DownOutlined, EditOutlined, EyeOutlined, MoreOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, message, Space, Tooltip } from 'antd';

const Action = (props) => {
  const handleMenuClick = (e) => {
    if (e.key == 1) props?.viewItem(props?.item);
    if (e.key == 2) props?.editItem(props?.item);
    if (e.key == 3) props?.deleteItem(props?.item);
  };

  const items = [
    props?.viewItem && {
      label: 'View',
      key: '1',
      icon: <EyeOutlined />
    },
    props?.editItem && {
      label: 'Edit',
      key: '2',
      icon: <EditOutlined />
    },
    props?.deleteItem && {
      label: 'Delete',
      key: '3',
      icon: <DeleteOutlined />,
      danger: true
    }
    // props?.action && {
    //   label: props?.action?.name,
    //   key: '4',
    //   icon: <DeleteOutlined />,
    //   danger: true
    // },
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick
  };

  return (
    <Dropdown menu={menuProps}>
      <Space>
        <MoreOutlined style={{ fontSize: 24, fontWeight: 'bold' }} />
      </Space>
    </Dropdown>
  );
};
export default Action;
