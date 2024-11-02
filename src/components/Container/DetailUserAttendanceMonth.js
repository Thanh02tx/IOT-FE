import React, { Component } from 'react';
import { connect } from "react-redux";
import { useLocation } from 'react-router-dom'; // Thêm import useLocation
import { getAttendanceByIdAndMonth } from '../../services/userService';
import moment from 'moment-timezone';
class DetailUserAttendanceMonth extends Component {
    constructor(props) {
        super(props);
        const { id, month } = this.parseQueryParams(); // Lấy id và month từ query parameters
        this.state = {
            id: id || '',
            month: month || '',
            userAttendance: {}
        };
    }

    parseQueryParams = () => {
        const { search } = this.props.location; // Lấy search từ props.location
        const params = new URLSearchParams(search);
        return {
            id: params.get('id'),
            month: params.get('month')
        };
    }

    async componentDidMount() {
        const { id, month } = this.state;
        if (id && month) {
            let res = await getAttendanceByIdAndMonth({
                id: id,
                month: month
            });
            if (res && res.errCode === 0) {
                this.setState({
                    userAttendance: res.data
                });
            }
        }
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
        const { userAttendance } = this.state;
        
        return (
            <div className='container'>
                <div className='fs-3 m-3 text-center'>
                    Thông tin điểm danh của nhân viên: {userAttendance.fullName}
                </div>
                <div>
                    <table className='table table-striped'>
                        <thead>
                            <th>STT</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                        </thead>
                        <tbody>
                            {userAttendance.listAttendance && userAttendance.listAttendance.length > 0 ?
                                userAttendance.listAttendance.map((item, index) => {
                                    return (
                                        <tr key={`atten-${index}`}>
                                            <td>{index+1}</td>
                                            <td>{this.convertTimestampToDate(item.timecheck)}</td>
                                            <td>{item.status==='M'?'Muộn':'Đúng giờ'}</td>
                                        </tr>
                                    )
                                })
                                :
                                <tr>
                                    <td colSpan={3}>Không có dữ liệu</td>
                                </tr>  
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

// Chuyển đổi thành functional component để sử dụng useLocation
const DetailUserAttendanceMonthWithLocation = (props) => {
    const location = useLocation(); // Lấy location từ hook useLocation
    return <DetailUserAttendanceMonth {...props} location={location} />; // Truyền location cho component
};

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DetailUserAttendanceMonthWithLocation);
