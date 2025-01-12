"use client";

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  const [events, setEvents] = useState([
    { title: 'Event 1', date: '2025-01-12' },
    { title: 'Event 2', date: '2025-01-15' },
  ]);

//   const handleDateClick = (info) => {
//     const newEventTitle = prompt('Enter event title:');
//     if (newEventTitle) {
//       setEvents([
//         ...events,
//         { title: newEventTitle, date: info.dateStr },
//       ]);
//     }
//   };

//   const handleEventClick = (info) => {
//     if (confirm(`Delete event '${info.event.title}'?`)) {
//       const filteredEvents = events.filter(
//         (event) => event.title !== info.event.title || event.date !== info.event.startStr
//       );
//       setEvents(filteredEvents);
//     }
//   };

  return (
    <FullCalendar
      height = {'100vh' }
          initialView="timeGridWeek"
          plugins={[
            dayGridPlugin,
            interactionPlugin,
            timeGridPlugin
          ]}
          titleFormat={{ month: 'long', year: 'numeric' }}
          header = {{
            center:'title',
          }
        }
          event={{}}
          nowIndicator = {true}
          editable = {true}
    />
  );
};

export default Calendar;
