import React, { Component } from 'react';
import { connect } from "react-redux";
import { getAllUser, getAllHistory } from '../../services/userService';
import './History.scss';
import Select from 'react-select';
import moment from 'moment-timezone'; // Nhớ import moment-timezone

class History extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Định dạng ngày thành YYYY-MM-DD

        this.state = {
            listUser: [],
            listSelecteUser: [],
            selectedUser: {},
            selectedDate: formattedDate, // Khởi tạo giá trị date là ngày hôm nay
            listHistory: []
        };
    }

    async componentDidMount() {
        let resUser = await getAllUser();
        if (resUser && resUser.errCode === 0) {
            this.setState({
                listUser: resUser.data
            });
        }
        this.buildDataUser();
    }

    buildDataUser = () => {
        let result = [];
        let { listUser } = this.state;
        listUser.map(item => {
            let Object = {};
            Object.label = item.fullName;
            Object.value = item.id;
            result.push(Object);
        });
        this.setState({
            listSelecteUser: result
        });
    };

    handleUserChange = (selectedOption) => {
        this.setState({
            selectedUser: selectedOption
        }); 
    };

    handleDateChange = (event) => {
        this.setState({ selectedDate: event.target.value });
    };

    handleSearch = async () => {
        let { selectedDate, selectedUser } = this.state;

        // Chuyển đổi selectedDate sang timestamp
        const timestamp = moment.tz(selectedDate, 'Asia/Ho_Chi_Minh').startOf('day').valueOf(); // 00:00:00
        let res = await getAllHistory({
            userId: selectedUser.value,
            timestamp: timestamp
        });

        if (res && res.errCode === 0) {
            this.setState({
                listHistory: res.data
            });
        }
        console.log('Lịch sử quẹt thẻ:', this.state.listHistory);
    };

    // Hàm chuyển timestamp sang múi giờ Asia/Ho_Chi_Minh và định dạng lại
    convertTimestampToTimezone = (timestamp) => {
        const timeInMillis = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

        // Chuyển đổi timestamp sang moment với múi giờ +7:00
        let dateInTimezone = moment.tz(timeInMillis, 'Asia/Ho_Chi_Minh');

        // Trả về định dạng ngày
        return dateInTimezone.format('YYYY-MM-DD HH:mm:ss'); // Bạn có thể thay đổi định dạng theo ý muốn
    }

    render() {
        const today = new Date().toISOString().split('T')[0];
        let { listHistory } = this.state;

        return (
            <div className='container history-container'>
                <div className='title m-3 fs-5'>Lịch sử quẹt thẻ</div>
                <div className='row'>
                    <div className='col-6 form-group'>
                        <label>Chọn Nhân viên</label>
                        <Select
                            value={this.state.selectedUser}
                            options={this.state.listSelecteUser}
                            onChange={this.handleUserChange}
                            name="user"
                            placeholder={'Chọn nhân viên'}
                        />
                    </div>
                    <div className='col-6 form-group'>
                        <label>Chọn ngày</label>
                        <input className='form-control'
                            type='date'
                            value={this.state.selectedDate}
                            onChange={this.handleDateChange}
                            max={today} // Giới hạn không cho chọn ngày sau hôm nay
                        />
                    </div>
                </div>
                <button className='btn btn-primary my-3'
                    onClick={() => this.handleSearch()}
                >Tìm kiếm</button>

                {/* Hiển thị bảng lịch sử */}
                <div>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listHistory && listHistory.length > 0
                                ? listHistory.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        {/* Sử dụng hàm convertTimestampToTimezone để chuyển đổi timestamp */}
                                        <td>{this.convertTimestampToTimezone(item.timecheck)}</td>
                                    </tr>
                                ))
                                : <tr><td colSpan="2">Không có dữ liệu</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(History);
