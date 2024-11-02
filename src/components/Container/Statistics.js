import React, { Component } from 'react';
import { connect } from "react-redux";
import { getUserAttendanceByMonth } from '../../services/userService';
import './History.scss';
import Select from 'react-select';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

moment.locale('vi');

class Statistics extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        this.state = {
            listUser: [],
            selectedMonth: currentMonth,
            selectedYear: currentYear,
            time: ''
        };
    }

    async componentDidMount() {
        let date = new Date().getTime();
        let resUser = await getUserAttendanceByMonth(date);
        if (resUser && resUser.errCode === 0) {
            this.setState({
                listUser: resUser.data,
                time: date
            });
        }
    }

    handleMonthChange = (selectedOption) => {
        this.setState({ selectedMonth: selectedOption.value });
    }

    handleYearChange = (selectedOption) => {
        this.setState({ selectedYear: selectedOption.value });
    }

    handleSearch = async () => {
        let { selectedMonth, selectedYear } = this.state;
        let selectedDate = moment().year(selectedYear).month(selectedMonth).date(15);
        const timestamp = selectedDate.unix() * 1000;
        
        this.setState({
            time: timestamp
        });

        console.log('sfa', this.state.time); // Lưu ý: giá trị sẽ không ngay lập tức phản ánh
        let resUser = await getUserAttendanceByMonth(timestamp);
        if (resUser && resUser.errCode === 0) {
            this.setState({
                listUser: resUser.data
            });
        }
    };

    handleDetailUser = (id) => {
        const { navigate } = this.props;
        let { time } = this.state;
        navigate(`/detail-user?id=${id}&month=${time}`);
    }

    render() {
        const monthOptions = [
            { value: 0, label: 'Tháng 1' },
            { value: 1, label: 'Tháng 2' },
            { value: 2, label: 'Tháng 3' },
            { value: 3, label: 'Tháng 4' },
            { value: 4, label: 'Tháng 5' },
            { value: 5, label: 'Tháng 6' },
            { value: 6, label: 'Tháng 7' },
            { value: 7, label: 'Tháng 8' },
            { value: 8, label: 'Tháng 9' },
            { value: 9, label: 'Tháng 10' },
            { value: 10, label: 'Tháng 11' },
            { value: 11, label: 'Tháng 12' }
        ];

        const yearOptions = [];
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= currentYear - 10; year--) {
            yearOptions.push({ value: year, label: `Năm ${year}` });
        }

        let { listUser } = this.state;

        return (
            <div className='container history-container'>
                <div className='title m-3 fs-5'>Lịch sử quẹt thẻ</div>
                <div className='row'>
                    <div className='col-6 form-group'>
                        <label>Chọn tháng</label>
                        <Select
                            value={monthOptions.find(option => option.value === this.state.selectedMonth) || null}
                            onChange={this.handleMonthChange}
                            options={monthOptions}
                        />
                    </div>
                    <div className='col-6 form-group'>
                        <label>Chọn năm</label>
                        <Select
                            value={yearOptions.find(option => option.value === this.state.selectedYear) || null}
                            onChange={this.handleYearChange}
                            options={yearOptions}
                        />
                    </div>
                </div>
                <button className='btn btn-primary my-3' onClick={this.handleSearch}>
                    Tìm kiếm
                </button>
                <table className='table table-striped'>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Họ và tên</th>
                            <th>RFID</th>
                            <th>Giới tính</th>
                            <th>Phòng ban</th>
                            <th>Số công</th>
                            <th>Muộn</th>
                            <th>Xem chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listUser.length > 0
                            ? listUser.map((item, index) => (
                                <tr key={`user-${index}`}>
                                    <td>{index + 1}</td>
                                    <td>{item.fullName}</td>
                                    <td>{item.rfid}</td>
                                    <td>{item['genderData.valueV']}</td>
                                    <td>{item['positionData.valueV']}</td>
                                    <td>{item.totalAttendance}</td>
                                    <td>{item.lateAttendance}</td>
                                    <td>
                                        <button
                                            className='btn btn-secondary'
                                            onClick={() => this.handleDetailUser(item.id)}
                                        >
                                            Xem
                                        </button>
                                    </td>
                                </tr>
                            ))
                            : (
                                <tr>
                                    <td colSpan={8}>Không có dữ liệu</td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

const StatisticsWrapper = (props) => {
    const navigate = useNavigate();
    return <Statistics {...props} navigate={navigate} />;
};

export default connect(mapStateToProps)(StatisticsWrapper);
