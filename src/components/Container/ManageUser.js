import React, { Component } from 'react';
import mqtt from 'mqtt';
import './ManageUser.scss';
import Select from 'react-select';
import { getAllCode, addNewUser, getAllUser, putSaveUser ,deleteUser,getUserByRfid} from '../../services/userService';
class ManageUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listUser: [],
      rfid: '',
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      listGender: [],
      gender: '',
      listPosition: [],
      position: '',
      isCreate: true,
      isConnected: false,

    };
  }

  async componentDidMount() {

    let genders = await getAllCode('GENDER');
    let positions = await getAllCode('POSITION');
    await this.getUser();
    if (genders.errCode === 0) {
      this.setState({
        listGender: this.buildDataInputSelect(genders.data)
      })
    }
    if (positions.errCode === 0) {
      this.setState({
        listPosition: this.buildDataInputSelect(positions.data)
      })
    }

    // Cấu hình kết nối đến HiveMQ Cloud qua WebSocket (wss)
    const options = {
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`, // Thêm clientId ngẫu nhiên
      username: 'nhom1', // Thay bằng username của bạn
      password: '123456', // Thay bằng password của bạn
      protocol: 'wss', // Kết nối qua giao thức wss (WebSocket Secure)
    };

    // Kết nối tới HiveMQ Cloud qua WebSocket
    this.client = mqtt.connect('wss://99ae98df26c84e4fad0e757738d87df2.s1.eu.hivemq.cloud:8884/mqtt', options);

    this.client.on('connect', () => {
      console.log('Đã kết nối tới HiveMQ Cloud');
      this.setState({ isConnected: true });

      // Subscribe vào topic "topic/rfid"
      this.client.subscribe('topic/rfid', (err) => {
        if (err) {
          console.error('Lỗi khi subscribe vào topic:', err);
        }
      });
    });

    // Lắng nghe và xử lý dữ liệu từ MQTT broker cho mọi topic
    this.client.on('message',async (topic, message) => {
      const receivedMessage = message.toString(); // Chuyển buffer thành chuỗi

      // Kiểm tra nếu topic là 'topic/rfid' thì lưu dữ liệu RFID
      if (topic === 'topic/rfid') {
        try {
          // Gọi hàm getUserByRfid và đợi kết quả
          let res = await getUserByRfid(receivedMessage);
          // Kiểm tra nếu res.data có tồn tại và không phải là mảng rỗng
          if (res && res.data && res.data.length===0) {
            this.setState({ rfid: receivedMessage });
          } 
        } catch (error) {
          console.error('Lỗi khi gọi getUserByRfid:', error);
        }
      }

      // Bạn có thể thêm các logic xử lý cho các topic khác tại đây
      console.log(`Nhận được từ topic ${topic}: ${receivedMessage}`);
    });
  }
  getUser = async () => {
    let users = await getAllUser();
    if (users.errCode === 0) {
      this.setState({
        listUser: users.data

      })
    }
  }

  componentWillUnmount() {
    if (this.client) {
      this.client.end();
    }
  }

  handeleOnChangeInput = (event, id) => {
    let stateCopy = { ...this.state };
    stateCopy[id] = event.target.value;
    this.setState({
      ...stateCopy
    })
    console.log(this.state)
  };
  buildDataInputSelect = (inputData) => {
    let result = [];
    inputData.forEach((item) => {
        let object = {};
        object.label = item.valueV;
        object.value = item.keyMap;
        result.push(object);
    });
    return result;
}

  handleChangeSelected = async (selectedOption, name) => {
    let stateName = name.name;
    let copyState = { ...this.sate };
    copyState[stateName] = selectedOption;
    this.setState({
      ...copyState
    })
  }
  handleAddNewUser = async () => {
    let res = await addNewUser({
      rfid: this.state.rfid,
      fullName: this.state.fullName,
      email: this.state.email,
      phoneNumber: this.state.phoneNumber,
      address: this.state.address,
      gender: this.state.gender.value,
      position: this.state.position.value
    })
    if (res.errCode === 0) {
      this.setState({
        rfid: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        gender: '',
        position: ''
      })
      await this.getUser();
    }
  }
  handleUpdateUser = async (item) => {
    this.setState({
      isCreate: false,
      rfid: item.rfid,
      fullName: item.fullName,
      email: item.email,
      phoneNumber: item.phonenumber,
      address: item.address,
      gender: this.state.listGender.find(itemGender => {
        return itemGender && itemGender.value === item.gender;
      }),
      position: this.state.listPosition.find(itemPosition => {
        return itemPosition && itemPosition.value === item.roleId;
      })
    }, );
  }
  handleSaveUser=async()=>{
    let res= await putSaveUser({
      rfid: this.state.rfid,
      fullName: this.state.fullName,
      email: this.state.email,
      phoneNumber: this.state.phoneNumber,
      address: this.state.address,
      gender: this.state.gender.value,
      position: this.state.position.value
    })
    if(res.errCode===0){
      this.setState({
        rfid: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        gender: '',
        position: '',
        isCreate:true
      })
      await this.getUser();
    }
  }
  handleDeleteUser=async(item)=>{
    let res = await deleteUser(item.id);
    if(res.errCode===0) {
      await this.getUser();
    }
  }
  handleCancel=()=>{
    this.setState({
      rfid: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      gender: '',
      position: '',
      isCreate:true
    })
  }
  render() {
    let { isCreate, listUser } = this.state;
    return (
      <div className='manage-user-container container'>
        <div className='title'>Quản lý Nhân viên</div>
        <div className='row'>
          <div className='col-3 form-group'>
            <label>RFID:</label>
            <input className='form-control'
              type='text'
              value={this.state.rfid}
              onChange={(event) => this.handeleOnChangeInput(event, 'rfid')}
            />
          </div>
          <div className='col-3 form-group'>
            <label>Họ và tên:</label>
            <input className='form-control'
              type='text'
              value={this.state.fullName}
              onChange={(event) => this.handeleOnChangeInput(event, 'fullName')}
            />
          </div>
          <div className='col-3 form-group'>
            <label>Email:</label>
            <input className='form-control'
              type='text'
              value={this.state.email}
              onChange={(event) => this.handeleOnChangeInput(event, 'email')}
            />
          </div>
          <div className='col-3 form-group'>
            <label>Số điện thoại:</label>
            <input className='form-control'
              onChange={(event) => this.handeleOnChangeInput(event, 'phoneNumber')}
              type='text'
              value={this.state.phoneNumber} />
          </div>
          <div className='col-3 form-group'>
            <label>Giới tính:</label>
            <Select
              value={this.state.gender}
              onChange={this.handleChangeSelected}
              options={this.state.listGender}
              name="gender"
              placeholder={'Chọn giới tính'}
            />
          </div>
          <div className='col-3 form-group'>
            <label>Chức vụ:</label>
            <Select
              value={this.state.position}
              onChange={this.handleChangeSelected}
              options={this.state.listPosition}
              name="position"
              placeholder={'Chọn Chức vụ'}
            />
          </div>
          <div className='col-6 form-group'>
            <label>Địa chỉ:</label>
            <input className='form-control'
              onChange={(event) => this.handeleOnChangeInput(event, 'address')}
              type='text'
              value={this.state.address} />
          </div>
        </div>
        <div className='my-3'>
          {isCreate === true ?
            <button className='btn-create btn btn-primary'
              onClick={() => this.handleAddNewUser()}
            >Thêm nhân viên</button> :
            <button className='btn-update btn btn-success'
              onClick={()=>this.handleSaveUser()}
            >Sửa thông tin</button>
            
          }
          <button className='btn-update btn btn-secondary mx-2'
              onClick={()=>this.handleCancel()}
            >Cancel</button>
        </div>
        <div className='tb-user text-center'>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>STT:</th>
                <th>RFID:</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Giới tính</th>
                <th>Phòng ban</th>
                <th>Địa chỉ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {listUser && listUser.length > 0 &&
                listUser.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td>{index+1}</td>
                      <td>{item.rfid}</td>
                      <td>{item.fullName}</td>
                      
                      <td>{item.email}</td>
                      <td>{item['genderData.valueV']}</td>
                      <td>{item['positionData.valueV']}</td>
                      <td>{item.address}</td>
                      <td><button className='btn btn-warning' onClick={()=>this.handleUpdateUser(item)}>Sửa</button>
                          <button className='btn btn-danger' onClick={()=>this.handleDeleteUser(item)}>xoá</button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default ManageUser;
