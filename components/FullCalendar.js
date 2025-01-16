"use client";

// import React, { useState } from 'react';
import { connectWebSocket, disconnectWebSocket } from "./Websocket";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import React, { useState, useEffect } from 'react';

const Calendar = () => {
  const [events, setEvents] = useState([]); 
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/events");
        const data = await res.json();
  
        const formattedEvents = data.map((event) => ({
          title: event.name, 
          start: event.startTime,
          end: event.endTime,
          color: event.color,
        }));
  
        setEvents(formattedEvents); 
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
  
    fetchEvents();
  }, []);

  useEffect(() => {
    connectWebSocket((newEvent) => {
      console.log("New WebSocket Event:", newEvent);
  
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          title: newEvent.name, 
          start: newEvent.startTime,
          end: newEvent.endTime,
          color: newEvent.color,
        },
      ]);
    });
  
    return () => disconnectWebSocket(); 
  }, []);
  

  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [lastClickTime, setLastClickTime] = useState(null); 

  const createEvent = async (newEvent) => {
    try {
      const response = await fetch("http://localhost:8080/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });
      if (response.ok) {
        const createdEvent = await response.json();
        setEvents((prevEvents) => [...prevEvents, createdEvent]); 
      } else {
        console.error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };  

  const updateEvent = async (event) => {
    try {
      const response = await fetch(`http://localhost:8080/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === updatedEvent.id ? updatedEvent : e
          )
        ); 
      } else {
        console.error("Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/events/${eventId}`, {
        method: "DELETE", 
      });
  
      if (response.ok) {
        setEvents((prevEvents) =>
          prevEvents.filter((e) => e.id !== eventId)
        ); 
      } else {
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };  
  

  const handleDateClick = (info) => {
    const title = prompt("Enter event title:");
    if (title) {
      const newEvent = {
        name: title,
        startTime: info.dateStr,
        endTime: info.dateStr,
      };
      createEvent(newEvent); 
    }
  };
  
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  const handleDeleteEvent = (event) => {
    if (event) {
      if (confirm(`Delete event '${event.title}'?`)) {
        const filteredEvents = events.filter(
          (e) => e.title !== event.title || e.start !== event.startStr
        );
        setEvents(filteredEvents);
        setSelectedEvent(null); 
      }
    }
  };

  const handleEventChange = async (info) => {
    const updatedEvent = {
      id: info.event.id, 
      name: info.event.title, 
      startTime: info.event.start.toISOString(), 
      endTime: info.event.end ? info.event.end.toISOString() : null, 
    };
  
    console.log("Updated Event:", updatedEvent);
  
    try {
      const res = await fetch(`http://localhost:8080/api/events/${updatedEvent.id}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!res.ok) {
        throw new Error(`Failed to update event: ${res.statusText}`);
      }
  
      console.log("Event successfully updated");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };  

  const handleKeydown = (event) => {
    if (event.key === 'Backspace' && selectedEvent) {
      handleDeleteEvent(selectedEvent);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [selectedEvent]);

  return (
    <div className="calMain">
      <FullCalendar
        height={'100vh'}
        initialView="timeGridWeek"
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        titleFormat={{ month: 'long', year: 'numeric' }}
        header={{
          center: 'title',
        }}
        events={events}
        nowIndicator={true}
        editable={true} 
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventChange={(info) => {
          const updatedEvent = {
            id: info.event.id, 
            title: info.event.name, 
            start: info.event.startTime.toISOString(), 
            end: info.event.endTime.toISOString(), 
          };
          updateEvent(updatedEvent); 
        }}
        eventRemove={(info) => {
          deleteEvent(info.event.id); 
        }}
      />
    </div>
  );
};

export default Calendar;

// const Calendar = () => {
//   const [events, setEvents] = useState([]); // State to hold fetched events

//   // Fetch events from the backend
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch("http://localhost:8080/api/events");
//         const data = await response.json();
//         setEvents(data);
//       } catch (error) {
//         console.error("Failed to fetch events:", error);
//       }
//     };

//     fetchEvents();
//   }, []);
