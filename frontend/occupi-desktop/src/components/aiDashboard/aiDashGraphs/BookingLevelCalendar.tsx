import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Tooltip } from "@nextui-org/react";
import { Calendar } from 'lucide-react';

interface BookingData {
  Predicted_Class: number;
  Predicted_Attendance_Level: string;
  Special_Event: boolean;
}

interface HolidayData {
  [key: string]: string;
}

const BookingLevelCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingData, setBookingData] = useState<{ [key: string]: BookingData }>({});
  const [holidayData, setHolidayData] = useState<HolidayData>({});

  useEffect(() => {
    const fetchBookingDataForMonth = async () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const fetchPromises = [];
      for (let day = 1; day <= daysInMonth + 1; day++) {  // Fetch one extra day
        const date = new Date(year, month, day);
        const formattedDate = date.toISOString().split('T')[0];
        fetchPromises.push(
          fetch(`https://ai.occupi.tech/predict_date?date=${formattedDate}`)
            .then(response => response.json())
            .then(data => ({ [formattedDate]: data }))
            .catch(error => {
              console.error(`Error fetching data for ${formattedDate}:`, error);
              return { [formattedDate]: null };
            })
        );
      }

      try {
        const results = await Promise.all(fetchPromises);
        const newBookingData = Object.assign({}, ...results);
        // Shift all predictions down by one day
        const shiftedBookingData = Object.entries(newBookingData).reduce((acc: { [key: string]: BookingData }, [date, data]) => {
          const shiftedDate = new Date(date);
          shiftedDate.setDate(shiftedDate.getDate() - 1);
          const shiftedDateString = shiftedDate.toISOString().split('T')[0];
          acc[shiftedDateString] = data as BookingData;
          return acc;
        }, {});
        setBookingData(shiftedBookingData);
      } catch (error) {
        console.error('Error fetching booking data:', error);
      }
    };

    const fetchHolidays = async () => {
      const year = selectedDate.getFullYear();
      try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ZA`);
        const holidays = await response.json();
        const holidayMap = holidays.reduce((acc: HolidayData, holiday: { date: string; name: string }) => {
          // Move the holiday one day back
          const holidayDate = new Date(holiday.date);
          holidayDate.setDate(holidayDate.getDate() - 1);
          const adjustedDate = holidayDate.toISOString().split('T')[0];
          acc[adjustedDate] = holiday.name;
          return acc;
        }, {});
        setHolidayData(holidayMap);
      } catch (error) {
        console.error('Error fetching holiday data:', error);
      }
    };

    fetchBookingDataForMonth();
    fetchHolidays();
  }, [selectedDate]);

  const getColorClass = (predictedClass: number, isHoliday: boolean) => {
    if (isHoliday) return 'bg-purple-400';
    const classes: string[] = [
      'bg-success-200',
      'bg-warning-200',
      'bg-warning-400',
      'bg-danger-200',
      'bg-secondary-200'
    ];
    return classes[predictedClass] || 'bg-default-200';
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 2).getDay();
    const days = [];

    for (let i = 1; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const formattedDate = date.toISOString().split('T')[0];
      const dayData = bookingData[formattedDate];
      const holiday = holidayData[formattedDate];

      const colorClass = getColorClass(dayData?.Predicted_Class, !!holiday);

      days.push(
        <Tooltip
          key={day}
          content={
            <div>
              {holiday && (
                <>
                  <p className='text-text_col_secondary_alt'><strong>{holiday}</strong></p>
                  <p className="text-yellow-400">Note: Predictions on Special days may be inaccurate.</p>
                </>
              )}
              {dayData ? (
                <>
                  <p className='text-text_col_secondary_alt'>Predicted Attendance: {dayData.Predicted_Attendance_Level}</p>
                  <p className='text-text_col_secondary_alt'>Special Event: {dayData.Special_Event || holiday ? 'Yes' : 'No'}</p>
                </>
              ) : 'No data available'}
            </div>
          }
        >
          <div className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer ${colorClass} ${holiday ? 'border-2 border-purple-600' : ''}`}>
            {day}
          </div>
        </Tooltip>
      );
    }

    return days;
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex justify-between items-center">
        <button onClick={handlePrevMonth}>&lt;</button>
        <div className="flex gap-3 items-center">
          <Calendar />
          <div className="flex flex-col">
            <p className="text-md text-text_col_secondary_alt">Booking Level Calendar</p>
            <p className="text-small text-default-500">
              {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button onClick={handleNextMonth}>&gt;</button>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold">{day}</div>
          ))}
          {renderCalendar()}
        </div>
      </CardBody>
    </Card>
  );
};

export default BookingLevelCalendar;