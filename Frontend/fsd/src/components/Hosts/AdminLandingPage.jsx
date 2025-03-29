import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Avatar, 
  Badge, 
  Input, 
  Button, 
  Table, 
  Dropdown, 
  Space, 
  Tag, 
  Statistic, 
  notification, 
  Switch, 
  Tabs, 
  Modal, 
  Form, 
  Select, 
  Radio, 
  Menu, 
  Tooltip 
} from 'antd';
import { 
  BellOutlined, 
  SearchOutlined, 
  UserOutlined, 
  SettingOutlined, 
  FlagOutlined, 
  BulbOutlined, 
  TeamOutlined, 
  NotificationOutlined, 
  DownOutlined, 
  MenuOutlined, 
  CloseOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import * as echarts from 'echarts';

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AdminLandingPage = () => {
  const [notifications, setNotifications] = useState(5);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [noticeModal, setNoticeModal] = useState(false);
  const [flagModal, setFlagModal] = useState(false);
  const [flagType, setFlagType] = useState('student');
  const [flagReason, setFlagReason] = useState('');
  const [flaggedPerson, setFlaggedPerson] = useState('');
  const [form] = Form.useForm();

  // Hero section visibility state
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!showDashboard) return;
    
    const chart = echarts.init(document.getElementById('participationChart'));
    const options = {
      animation: false,
      title: {
        text: 'Hackathon Participation Trends',
        textStyle: {
          color: darkMode ? '#fff' : '#333',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330],
        type: 'line',
        smooth: true
      }]
    };
    chart.setOption(options);
    
    const handleResize = () => {
      chart.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [darkMode, showDashboard]);

  const recentHackathons = [
    {
      key: '1',
      name: 'AI Innovation Challenge 2025',
      participants: 234,
      status: 'Active',
      startDate: '2025-03-15',
      endDate: '2025-04-15'
    },
    {
      key: '2',
      name: 'Global Blockchain Hackathon',
      participants: 189,
      status: 'Upcoming',
      startDate: '2025-04-01',
      endDate: '2025-04-30'
    },
    {
      key: '3',
      name: 'Sustainable Tech Summit',
      participants: 156,
      status: 'Completed',
      startDate: '2025-02-01',
      endDate: '2025-03-01'
    }
  ];

  const mentors = [
    {
      key: '1',
      name: 'Dr. James Wilson',
      specialty: 'AI & Machine Learning',
      students: 12,
      status: 'Active'
    },
    {
      key: '2',
      name: 'Prof. Sophia Rodriguez',
      specialty: 'Blockchain Development',
      students: 8,
      status: 'Active'
    },
    {
      key: '3',
      name: 'Dr. Robert Chen',
      specialty: 'Cybersecurity',
      students: 15,
      status: 'On Leave'
    }
  ];

  const students = [
    { name: 'Emily Thompson', status: 'Active', mentor: 'Dr. James Wilson', flagged: false },
    { name: 'Michael Chen', status: 'Active', mentor: 'Prof. Sophia Rodriguez', flagged: false },
    { name: 'Sarah Williams', status: 'Active', mentor: 'Dr. Robert Chen', flagged: true },
    { name: 'David Johnson', status: 'Inactive', mentor: 'Dr. James Wilson', flagged: false },
    { name: 'Jessica Martinez', status: 'Active', mentor: 'Prof. Sophia Rodriguez', flagged: true }
  ];

  const columns = [
    {
      title: 'Hackathon Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : status === 'Upcoming' ? 'blue' : 'gray'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record) => `${record.startDate} - ${record.endDate}`,
    }
  ];

  const mentorColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Button 
            type="text" 
            icon={<FlagOutlined />} 
            onClick={() => handleFlagPerson(record.name, 'mentor')}
            className="!rounded-button whitespace-nowrap"
          />
          <Button 
            type="text" 
            icon={<MessageOutlined />} 
            className="!rounded-button whitespace-nowrap"
          />
        </Space>
      ),
    }
  ];

  const handleCreateHackathon = () => {
    notification.success({
      message: 'Success',
      description: 'New hackathon created successfully!',
    });
  };

  const handlePublishNotice = () => {
    setNoticeModal(true);
  };

  const handleFlagPerson = (name, type) => {
    setFlaggedPerson(name);
    setFlagType(type);
    setFlagModal(true);
  };

  const handleSubmitFlag = () => {
    notification.success({
      message: 'Flag Submitted',
      description: `${flaggedPerson} has been flagged for review.`,
    });
    setFlagModal(false);
    setFlagReason('');
  };

  const handleSubmitNotice = (values) => {
    notification.success({
      message: 'Notice Published',
      description: `Your notice has been published to ${values.audience}.`,
    });
    setNoticeModal(false);
    form.resetFields();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const MessageOutlined = () => (
    <i className="fas fa-comment-dots"></i>
  );

  return (
    <Layout className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : ''}`}>
      <Header className={`flex items-center justify-between px-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md`}>
        <div className="flex items-center">
          <div className={`text-2xl font-bold mr-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>AdminHub</div>
          <Input
            prefix={<SearchOutlined className={darkMode ? 'text-gray-400' : 'text-gray-500'} />}
            placeholder="Search hackathons, students, or users..."
            className={`w-96 !rounded-button ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
          />
        </div>
        <div className="flex items-center gap-4">
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              checkedChildren={<i className="fas fa-moon"></i>}
              unCheckedChildren={<i className="fas fa-sun"></i>}
              className="!rounded-button"
            />
          </Tooltip>
          <Badge count={notifications} className="cursor-pointer">
            <BellOutlined className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </Badge>
          <Avatar icon={<UserOutlined />} className="cursor-pointer" />
          <SettingOutlined className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} cursor-pointer`} />
        </div>
      </Header>
      
      {!showDashboard && (
        <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <div className="max-w-[1440px] mx-auto py-16 px-6 flex items-center">
            <div className="w-1/2 pr-8">
              <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Hackathon Management Platform
              </h1>
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Streamline your hackathon organization process with our comprehensive management platform. 
                Manage students, mentors, and events all in one place.
              </p>
              <div className="flex gap-4">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={() => setShowDashboard(true)}
                  className="!rounded-button whitespace-nowrap"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  size="large" 
                  className="!rounded-button whitespace-nowrap"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="w-1/2">
              <div className="relative h-80 rounded-lg overflow-hidden">
                <img 
                  src="https://public.readdy.ai/ai/img_res/83b56d53cedf9fe831ac924a1c7f8084.jpg" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Layout className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
        {showDashboard && (
          <Content className="p-6 max-w-[1440px] mx-auto w-full">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}>
                <Statistic
                  title={<span className={darkMode ? 'text-gray-300' : ''}>Active Users</span>}
                  value={1234}
                  prefix={<UserOutlined />}
                  suffix={<small className="text-green-500 ml-2">+15%</small>}
                  valueStyle={{ color: darkMode ? 'white' : 'inherit' }}
                />
              </Card>
              <Card className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}>
                <Statistic
                  title={<span className={darkMode ? 'text-gray-300' : ''}>Ongoing Hackathons</span>}
                  value={8}
                  prefix={<i className="fas fa-laptop-code"></i>}
                  suffix={<small className="text-green-500 ml-2">+2</small>}
                  valueStyle={{ color: darkMode ? 'white' : 'inherit' }}
                />
              </Card>
              <Card className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}>
                <Statistic
                  title={<span className={darkMode ? 'text-gray-300' : ''}>Registered Students</span>}
                  value={3567}
                  prefix={<i className="fas fa-graduation-cap"></i>}
                  suffix={<small className="text-red-500 ml-2">-3%</small>}
                  valueStyle={{ color: darkMode ? 'white' : 'inherit' }}
                />
              </Card>
              <Card className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}>
                <Statistic
                  title={<span className={darkMode ? 'text-gray-300' : ''}>Active Mentors</span>}
                  value={142}
                  prefix={<TeamOutlined />}
                  suffix={<small className="text-green-500 ml-2">+5%</small>}
                  valueStyle={{ color: darkMode ? 'white' : 'inherit' }}
                />
              </Card>
            </div>
            
            <Tabs 
              defaultActiveKey="hackathons" 
              className={`mb-6 ${darkMode ? 'ant-tabs-dark' : ''}`}
              type="card"
            >
              <TabPane tab="Hackathons" key="hackathons">
                <div className="grid grid-cols-2 gap-6">
                  <Card 
                    title={<span className={darkMode ? 'text-white' : ''}>Participation Analytics</span>} 
                    className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                  >
                    <div id="participationChart" style={{ height: '300px' }}></div>
                  </Card>
                  <Card 
                    title={<span className={darkMode ? 'text-white' : ''}>Recent Hackathons</span>} 
                    className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                    extra={
                      <Button type="primary" onClick={handleCreateHackathon} className="!rounded-button whitespace-nowrap">
                        Create New
                      </Button>
                    }
                  >
                    <Table
                      columns={columns}
                      dataSource={recentHackathons}
                      pagination={false}
                      className={`w-full ${darkMode ? 'table-dark' : ''}`}
                    />
                  </Card>
                </div>
              </TabPane>
              <TabPane tab="Mentors" key="mentors">
                <Card 
                  title={<span className={darkMode ? 'text-white' : ''}>Mentor Management</span>} 
                  className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                  extra={
                    <Button type="primary" className="!rounded-button whitespace-nowrap">
                      Add New Mentor
                    </Button>
                  }
                >
                  <Table
                    columns={mentorColumns}
                    dataSource={mentors}
                    pagination={false}
                    className={`w-full ${darkMode ? 'table-dark' : ''}`}
                  />
                </Card>
              </TabPane>
              <TabPane tab="Students" key="students">
                <Card 
                  title={<span className={darkMode ? 'text-white' : ''}>Student Management</span>} 
                  className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                >
                  <div className="overflow-x-auto">
                    <table className={`min-w-full ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Mentor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Flagged</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={darkMode ? 'bg-gray-700' : 'bg-white'}>
                        {students.map((student, index) => (
                          <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-750' : 'bg-gray-50') : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Tag color={student.status === 'Active' ? 'green' : 'gray'}>
                                {student.status}
                              </Tag>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.mentor}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {student.flagged ? 
                                <Tag color="red">Flagged</Tag> : 
                                <Tag color="green">Good Standing</Tag>
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Space>
                                <Button 
                                  type="text" 
                                  icon={<FlagOutlined />} 
                                  onClick={() => handleFlagPerson(student.name, 'student')}
                                  className="!rounded-button whitespace-nowrap"
                                />
                                <Button 
                                  type="text" 
                                  icon={<MessageOutlined />}
                                  className="!rounded-button whitespace-nowrap"
                                />
                              </Space>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabPane>
              <TabPane tab="Notices" key="notices">
                <Card 
                  title={<span className={darkMode ? 'text-white' : ''}>Announcement Management</span>} 
                  className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                  extra={
                    <Button 
                      type="primary" 
                      icon={<NotificationOutlined />} 
                      onClick={handlePublishNotice}
                      className="!rounded-button whitespace-nowrap"
                    >
                      Publish Notice
                    </Button>
                  }
                >
                  <div className={`space-y-4 ${darkMode ? 'text-white' : ''}`}>
                    {[
                      { title: 'System Maintenance', content: 'The platform will be down for maintenance on April 5th from 2-4 AM EST.', date: '2025-03-29', audience: 'All Users' },
                      { title: 'New Hackathon Announced', content: 'Registration for the Quantum Computing Challenge is now open!', date: '2025-03-28', audience: 'Students' },
                      { title: 'Mentor Training Session', content: 'Mandatory training session for all mentors on April 10th.', date: '2025-03-27', audience: 'Mentors' }
                    ].map((notice, index) => (
                      <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{notice.title}</h3>
                            <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notice.content}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Tag color="blue">{notice.audience}</Tag>
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Published: {notice.date}</span>
                            </div>
                          </div>
                          <Space>
                            <Button type="text" icon={<i className="fas fa-edit"></i>} className="!rounded-button whitespace-nowrap" />
                            <Button type="text" danger icon={<i className="fas fa-trash"></i>} className="!rounded-button whitespace-nowrap" />
                          </Space>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabPane>
            </Tabs>
            
            <div className="grid grid-cols-3 gap-6">
              <Card 
                title={<span className={darkMode ? 'text-white' : ''}>Quick Actions</span>} 
                className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              >
                <div className="space-y-4">
                  <Button type="primary" block className="!rounded-button whitespace-nowrap">
                    <i className="fas fa-plus mr-2"></i>Create Hackathon
                  </Button>
                  <Button block className={`!rounded-button whitespace-nowrap ${darkMode ? 'text-white border-gray-600 hover:border-gray-500' : ''}`}>
                    <i className="fas fa-user-plus mr-2"></i>Add Student
                  </Button>
                  <Button block className={`!rounded-button whitespace-nowrap ${darkMode ? 'text-white border-gray-600 hover:border-gray-500' : ''}`}>
                    <TeamOutlined className="mr-2" />Add Mentor
                  </Button>
                  <Button block className={`!rounded-button whitespace-nowrap ${darkMode ? 'text-white border-gray-600 hover:border-gray-500' : ''}`}>
                    <NotificationOutlined className="mr-2" />Publish Notice
                  </Button>
                  <Button block className={`!rounded-button whitespace-nowrap ${darkMode ? 'text-white border-gray-600 hover:border-gray-500' : ''}`}>
                    <i className="fas fa-file-export mr-2"></i>Generate Report
                  </Button>
                </div>
              </Card>
              <Card 
                title={<span className={darkMode ? 'text-white' : ''}>Flagged Users</span>} 
                className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              >
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Williams', type: 'Student', reason: 'Missed multiple deadlines', date: '2025-03-25' },
                    { name: 'Jessica Martinez', type: 'Student', reason: 'Code of conduct violation', date: '2025-03-27' },
                    { name: 'Dr. Robert Chen', type: 'Mentor', reason: 'Unresponsive to students', date: '2025-03-28' }
                  ].map((user, index) => (
                    <div key={index} className={`p-3 rounded flex items-center justify-between ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                      <div>
                        <div className="flex items-center">
                          <FlagOutlined className="text-red-500 mr-2" />
                          <span className="font-medium">{user.name}</span>
                          <Tag color="blue" className="ml-2">{user.type}</Tag>
                        </div>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.reason}</p>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Flagged on: {user.date}</span>
                      </div>
                      <Space>
                        <Button 
                          type="text" 
                          icon={<CheckOutlined />} 
                          className="text-green-500 !rounded-button whitespace-nowrap" 
                        />
                        <Button 
                          type="text" 
                          icon={<CloseOutlined />} 
                          className="text-red-500 !rounded-button whitespace-nowrap" 
                        />
                      </Space>
                    </div>
                  ))}
                </div>
              </Card>
              <Card 
                title={<span className={darkMode ? 'text-white' : ''}>System Updates</span>} 
                className={`shadow-sm !rounded-button ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              >
                <div className="space-y-4">
                  {[
                    { text: 'Security patch deployed', type: 'success' },
                    { text: 'Database backup completed', type: 'info' },
                    { text: 'New feature rollout', type: 'warning' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <Tag color={item.type === 'success' ? 'green' : item.type === 'info' ? 'blue' : 'orange'}>
                        {item.type.toUpperCase()}
                      </Tag>
                      <span className="ml-2">{item.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Content>
        )}
      </Layout>
      
      {/* Flag User Modal */}
      <Modal
        title={`Flag ${flagType === 'student' ? 'Student' : 'Mentor'}`}
        open={flagModal}
        onCancel={() => setFlagModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setFlagModal(false)} className="!rounded-button whitespace-nowrap">
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmitFlag} className="!rounded-button whitespace-nowrap">
            Submit Flag
          </Button>
        ]}
      >
        <div className="space-y-4">
          <div>
            <p className="font-medium">Name:</p>
            <p>{flaggedPerson}</p>
          </div>
          <div>
            <p className="font-medium">Flag Reason:</p>
            <Radio.Group onChange={(e) => setFlagReason(e.target.value)} value={flagReason}>
              <Space direction="vertical">
                <Radio value="conduct">Code of Conduct Violation</Radio>
                <Radio value="performance">Performance Issues</Radio>
                <Radio value="attendance">Poor Attendance</Radio>
                <Radio value="other">Other</Radio>
              </Space>
            </Radio.Group>
          </div>
          <div>
            <p className="font-medium">Additional Comments:</p>
            <TextArea rows={4} />
          </div>
        </div>
      </Modal>
      
      {/* Publish Notice Modal */}
      <Modal
        title="Publish Notice"
        open={noticeModal}
        onCancel={() => setNoticeModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitNotice}
        >
          <Form.Item
            name="title"
            label="Notice Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Notice Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="audience"
            label="Target Audience"
            rules={[{ required: true, message: 'Please select an audience' }]}
          >
            <Select>
              <Option value="All Users">All Users</Option>
              <Option value="Students">Students Only</Option>
              <Option value="Mentors">Mentors Only</Option>
              <Option value="Administrators">Administrators Only</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority Level"
          >
            <Select defaultValue="Normal">
              <Option value="Low">Low</Option>
              <Option value="Normal">Normal</Option>
              <Option value="High">High</Option>
            <Option value="Urgent">Urgent</Option>
          </Select>
        </Form.Item>
        <Form.Item className="flex justify-end mb-0">
          <Space>
            <Button onClick={() => setNoticeModal(false)} className="!rounded-button whitespace-nowrap">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="!rounded-button whitespace-nowrap">
              Publish
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
    
    <style jsx global>{`
      .dark-theme .ant-card-head {
        background-color: #374151;
        border-bottom: 1px solid #4B5563;
      }
      
      .dark-theme .ant-tabs-tab {
        background-color: #374151 !important;
        border-color: #4B5563 !important;
        color: #E5E7EB !important;
      }
      
      .dark-theme .ant-tabs-tab-active {
        background-color: #4B5563 !important;
      }
      
      .dark-theme .ant-tabs-nav::before {
        border-bottom: 1px solid #4B5563 !important;
      }
      
      .dark-theme .ant-table {
        background-color: #374151;
        color: white;
      }
      
      .dark-theme .ant-table-thead > tr > th {
        background-color: #1F2937 !important;
        color: #E5E7EB !important;
        border-bottom: 1px solid #4B5563 !important;
      }
      
      .dark-theme .ant-table-tbody > tr > td {
        border-bottom: 1px solid #4B5563 !important;
      }
      
      .dark-theme .ant-table-tbody > tr:hover > td {
        background-color: #4B5563 !important;
      }
      
      .dark-theme .ant-modal-content,
      .dark-theme .ant-modal-header {
        background-color: #374151;
        color: white;
      }
      
      .dark-theme .ant-modal-title {
        color: white;
      }
      
      .dark-theme .ant-form-item-label > label {
        color: #E5E7EB;
      }
      
      .dark-theme .ant-input,
      .dark-theme .ant-select-selector,
      .dark-theme .ant-input-number,
      .dark-theme .ant-picker {
        background-color: #4B5563 !important;
        border-color: #6B7280 !important;
        color: white !important;
      }
      
      .dark-theme .ant-select-selection-item {
        color: white !important;
      }
      
      .dark-theme .ant-select-arrow {
        color: #E5E7EB !important;
      }
    `}</style>
  </Layout>
);
};
export default AdminLandingPage
