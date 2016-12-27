import React from 'react'
import {
  View,
  StyleSheet
} from 'react-native'
import WheelPicker from './WheelPicker'
import moment from 'moment';

class DatePicker extends React.Component {
  constructor(props){
    super(props)
    this.selectedDate = this.props.initDate ? new Date(this.props.initDate) : new Date()
    let time12format = hourTo12Format(this.selectedDate.getHours())
    let time24format = this.selectedDate.getHours()

    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = this.selectedDate.getTime() - new Date().getTime();

    let millisBetweenStartDate, daysStartDate
    if (this.props.startDate) {
      millisBetweenStartDate = new Date(this.props.startDate).getTime() - new Date().getTime()
      daysStartDate = millisBetweenStartDate / millisecondsPerDay
    }

    var days = millisBetween / millisecondsPerDay;
    this.daysAfterSelectedDate = Math.round(daysStartDate)
    this.initDayInex = this.props.startDate ? Math.round(days) - Math.round(daysStartDate)  : Math.round(days)
    this.initHourInex = this.props.format24 ? time24format : time12format[0] - 1
    this.initMinuteInex = Math.round(this.selectedDate.getMinutes() / 5)
    this.initAmInex = time12format[1] === 'AM' ? 0 : 1
  }

  render() {
    return (
      <View style={styles.container}>
        <WheelPicker
          style={styles.dateWheelPicker}
          isAtmospheric
          isCurved
          visibleItemCount={8}
          data={this.props.days ? this.props.days : PickerDateArray(this.props.startDate, this.props.daysCount)}
          selectedItemTextColor={'black'}
          onItemSelected={(data)=> this.onDaySelected(data)}
          selectedItemPosition={this.initDayInex}
          />
        <WheelPicker
          style={styles.wheelPicker}
          isAtmospheric
          isCyclic
          isCurved
          visibleItemCount={8}
          data={this.props.hours ? this.props.hours : getHoursArray()}
          selectedItemTextColor={'black'}
          onItemSelected={(data)=> this.onHourSelected(data)}
          selectedItemPosition={this.initHourInex}
          />
        <WheelPicker
          style={styles.wheelPicker}
          isAtmospheric
          isCyclic
          isCurved
          visibleItemCount={8}
          data={this.props.minutes ? this.props.minutes : getFiveMinutesArray()}
          selectedItemTextColor={'black'}
          onItemSelected={(data)=> this.onMinuteSelected(data)}
          selectedItemPosition={this.initMinuteInex}
          />
        {this.renderAm()}
      </View>
    )
  }

  renderAm(){
    if (!this.props.format24) {
      return (
        <WheelPicker
          style={styles.wheelPicker}
          isAtmospheric
          isCurved
          visibleItemCount={8}
          data={getAmArray()}
          selectedItemTextColor={'black'}
          onItemSelected={(data)=> this.onAmSelected(data)}
          selectedItemPosition={this.initAmInex}
          />
      )
    }
  }

  onDaySelected(event){
    let hours = this.selectedDate.getHours()
    let minutes = this.selectedDate.getMinutes()
    if (event.data === 'Today') {
      this.selectedDate = new Date()
    } else {
      this.selectedDate = increaseDateByDays(new Date(), this.props.startDate ? this.daysAfterSelectedDate + event.position : event.position)
    }
    this.selectedDate.setHours(hours)
    this.selectedDate.setMinutes(minutes)
    this.onDateSelected()
  }

  onHourSelected(event){
    if (this.props.format24) {
      this.selectedDate.setHours(event.data)
    } else {
      let time12format = hourTo12Format(this.selectedDate.getHours())
      let newTime12Format = event.data + ' ' + time12format[1]
      let selectedHour24format = hourTo24Format(newTime12Format)
      this.selectedDate.setHours(selectedHour24format)
    }
    this.onDateSelected()
  }

  onMinuteSelected(event){
    this.selectedDate.setMinutes(event.data)
    this.onDateSelected()
  }

  onAmSelected(event){
    let time12format = hourTo12Format(this.selectedDate.getHours())
    let newTime12Format = time12format[0] + ' ' + event.data
    let selectedHour24format = hourTo24Format(newTime12Format)
    this.selectedDate.setHours(selectedHour24format)
    this.onDateSelected()
  }

  onDateSelected(){
    if (this.props.onDateSelected) {
      this.props.onDateSelected(this.selectedDate)
    }
  }

}

DatePicker.propTypes = {
  initDate: React.PropTypes.string,
  onDateSelected: React.PropTypes.func,
  startDate: React.PropTypes.string,
  daysCount: React.PropTypes.number,
  days: React.PropTypes.array,
  hours: React.PropTypes.array,
  minutes: React.PropTypes.array,
  format24: React.PropTypes.bool,
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  wheelPicker: {
    height: 150,
    width: null,
    flex:1,
  },
  dateWheelPicker: {
    height: 200,
    width: null,
    flex:3,
  },
});

// it takes in format '12 AM' and return 24 format
function hourTo24Format(hour) {
  return parseInt(moment(hour, ['h A']).format('H'), 10);
}

// it takes in format 23 and return [11,'PM'] format
function hourTo12Format(hour) {
  let currDate = new Date()
  currDate.setHours(hour)
  return dateTo12Hour(currDate.toISOString())
}

const dateTo12Hour = dateString => {
  let localDate = new Date(dateString);
  let hour = localDate.getHours();
  if (hour === 12 ) {
    return [('12'),('PM')];
  } if (hour === 0 ) {
    return [('12'),('AM')];
  }
  let afterMidday = hour % 12 === hour;
  hour = afterMidday ? hour : hour % 12;
  let amPm = afterMidday ? 'AM' : 'PM';
  return [(hour.toString()),(amPm)];
}

function increaseDateByDays(date, numOfDays) {
  let nextDate = new Date(date.valueOf());
  nextDate.setDate(nextDate.getDate() + numOfDays);
  return nextDate;
}

const PickerDateArray = (startDate, daysCount) => {
  startDate = startDate ? new Date(startDate) : new Date()
  daysCount = daysCount ? daysCount : 365
  let arr = []
  for (var i = 0; i < daysCount; i++) {
    if (i === 0 && startDate.getDate() === new Date().getDate() ) {
      arr.push('Today')
    } else {
      arr.push(formatDatePicker(new Date(new Date().setDate(startDate.getDate() + i))))
    }
  }
  return arr
}

function formatDatePicker(date) {
  let strDate = moment(date).format('ddd MMM D');
  return strDate;
}

function getHoursArray(){
  let arr = []
  for (var i = 1; i < 13; i++) {
    arr.push(i)
  }
  return arr
}

function getFiveMinutesArray(){
  let arr = []
  arr.push('00')
  arr.push('05')
  for (var i = 10; i < 60; i = i + 5) {
    arr.push('' + i)
  }
  return arr
}

function getAmArray(){
  let arr = []
  arr.push('AM')
  arr.push('PM')
  return arr
}
module.exports = DatePicker;