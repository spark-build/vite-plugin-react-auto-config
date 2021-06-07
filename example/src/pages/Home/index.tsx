import './index.less';

import {
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  Popconfirm,
  Table,
  Modal,
  Button,
  Select,
  Transfer,
  Affix,
  Card,
  Space,
} from 'antd';
import { useState } from 'react';
import { useNavigate, useTranslation } from '@@/index';
import { SketchPicker } from 'react-color';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Wrap = ({ children }: React.PropsWithChildren<{}>) => {
  const [primaryColor, setPrimaryColor] = useState(
    () => document.getElementById('App')?.dataset?.primaryColor ?? '',
  );

  return (
    <div className="flex">
      <div className="mr-24px">{children}</div>

      <Affix>
        <Card title="切换主题色">
          <SketchPicker
            color={primaryColor}
            onChange={(v) => {
              setPrimaryColor(v.hex);

              window.dispatchEvent(
                new CustomEvent('primary-color-change', { detail: { primaryColor: v.hex } }),
              );
            }}
          />
        </Card>
      </Affix>
    </div>
  );
};

/**
 * @ref https://ant.design/components/config-provider-cn/
 */
const Components = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
  };

  const info = () => {
    Modal.info({
      title: 'some info',
      content: 'some info',
    });
  };

  const confirm = () => {
    Modal.confirm({
      title: 'some info',
      content: 'some info',
    });
  };

  return (
    <>
      <Button className="mb-24px" onClick={() => navigate('/other')}>
        {t('goTo')}
        {t('route.other')}
      </Button>

      <div className="locale-components">
        <div className="example">
          <Pagination defaultCurrent={1} total={50} showSizeChanger />
        </div>
        <div className="example">
          <Select showSearch style={{ width: 200 }}>
            <Option value="jack">jack</Option>
            <Option value="lucy">lucy</Option>
          </Select>
          <DatePicker />
          <TimePicker />
          <RangePicker style={{ width: 200 }} />
        </div>
        <div className="example">
          <Button type="primary" onClick={showModal}>
            Show Modal
          </Button>
          <Button onClick={info}>Show info</Button>
          <Button onClick={confirm}>Show confirm</Button>
          <Popconfirm title="Question?">
            <a href="#">Click to confirm</a>
          </Popconfirm>
        </div>
        <div className="example">
          <Transfer<any> dataSource={[]} showSearch targetKeys={[]} render={(item) => item.title} />
        </div>
        <div className="site-config-provider-calendar-wrapper">
          <Calendar fullscreen={false} />
        </div>
        <div className="example">
          <Table
            dataSource={[]}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                filters: [
                  {
                    text: 'filter1',
                    value: 'filter1',
                  },
                ],
              },
              {
                title: 'Age',
                dataIndex: 'age',
              },
            ]}
          />
        </div>
        <Modal title="Locale Modal" visible={visible} onCancel={hideModal}>
          <p>Locale Modal</p>
        </Modal>
      </div>
    </>
  );
};

export default function Home() {
  return (
    <Wrap>
      <Components />
    </Wrap>
  );
}
