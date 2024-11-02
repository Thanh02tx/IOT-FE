import React, { Component } from 'react';
import { connect } from "react-redux";
import { fetchAllAttendanceToday } from '../../redux/action/adminActions'; // Nhập action creator
import { getAllUser, createAttendanceAndHistory } from '../../services/userService';
import './AttendanceToday.scss';
import moment from 'moment-timezone';

class AttendanceToday extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allUser: [],
            listUserTable: []
        };
    }

    async componentDidMount() {
        let res = await getAllUser();
        if (res && res.errCode === 0) {
            this.setState({
                allUser: res.data
            });
        }

        this.props.fetchAllAttendanceToday();
        this.buildData();
        this.interval = setInterval(() => {
            this.props.fetchAllAttendanceToday();
            this.buildData();
        }, 10000);
    }

    async componentDidUpdate(prevProps) {
        if (this.props.allAttendanceToday !== prevProps.allAttendanceToday || this.state.allUser.length === 0) {
            this.buildData();
        }
    }

    buildData = () => {
        let allAttendance = this.props.allAttendanceToday; // Sử dụng props đúng tên
        let updatedUsers = this.state.allUser.map(item => {
            // Tìm kiếm trong allAttendance xem có item nào có id trùng với item hiện tại không
            let attendance = allAttendance.find(check => check.idUser === item.id);

            // Nếu tìm thấy thì cập nhật status và timecheck
            if (attendance) {
                return {
                    ...item,
                    isAttendance: true,
                    timecheck: this.convertTimestampToDate(attendance.timecheck), // Cập nhật timecheck từ listcheck
                    status: attendance.status,
                    note: attendance.note
                };
            }

            // Nếu không tìm thấy, giữ nguyên item với status là false
            return {
                ...item,
                isAttendance: false,
                timecheck: '00:00:00',
                status: 'Chưa chấm công',
                note: ''
            };
        });

        // Cập nhật lại state
        this.setState({
            listUserTable: updatedUsers
        });
    }

    handleAttendance = async (item) => {
        let res = await createAttendanceAndHistory({
            id: item.id,
            timestamp: new Date().getTime(),
            note: 'Admin chấm công hộ'
        });
        if (res && res.errCode === 0) {
            this.props.fetchAllAttendanceToday();
            this.buildData();
        }
    }

    handleDeleteAttendance = async (item) => {
        // Logic để xóa attendance (nếu cần)
    }

    convertTimestampToDate(timestamp) {
        // Nếu timestamp là chuỗi, chuyển đổi về số
        const timeInMillis = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

        // Chuyển đổi timestamp sang moment với múi giờ +7:00
        let dateInTimezone = moment.tz(timeInMillis, 'Asia/Ho_Chi_Minh');

        // Trả về định dạng ngày
        return dateInTimezone.format('YYYY-MM-DD HH:mm:ss'); // Bạn có thể thay đổi định dạng theo ý muốn
    }

    render() {
        let { listUserTable } = this.state;
        console.log('User Table Data:', listUserTable);
        return (
            <div className='container home-container'>
                <div className='title'>
                    Danh sách điểm danh ngày hôm nay
                </div>

                <div className='table-attendance'>
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>RFID</th>
                                <th>Họ và tên</th>
                                <th>Thời gian chấm công</th>
                                <th>Trạng thái</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listUserTable && listUserTable.length > 0 &&
                                listUserTable.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.rfid}</td>
                                            <td>{item.fullName}</td>
                                            <td>{item.timecheck}</td> {/* Sửa: sử dụng item.timecheck thay vì this.item.timecheck */}
                                            <td>{item.status==='M'?'Muộn':'Đúng giờ'}</td>
                                            <td>{item.note}</td>
                                            <td>
                                                {item.isAttendance ? '' :
                                                    <button className='btn btn-secondary'
                                                        onClick={() => this.handleAttendance(item)}
                                                    >Chấm công</button>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        allAttendanceToday: state.admin.allAttendanceToday // Đảm bảo truy cập đúng vị trí
    };
};

const mapDispatchToProps = {
    fetchAllAttendanceToday, // Kết nối action creator
};

export default connect(mapStateToProps, mapDispatchToProps)(AttendanceToday);
