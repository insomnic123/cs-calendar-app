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
          id: event.id,
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

  // handle WebSocket updates for real-time events
  useEffect(() => {
    connectWebSocket((newEvent) => {
      console.log("New WebSocket Event:", newEvent);
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: newEvent.id,
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
        const formattedEvent = {
          id: createdEvent.id,
          title: createdEvent.name,
          start: createdEvent.startTime,
          end: createdEvent.endTime,
          color: createdEvent.color,
        };
  
        // Update the state directly with the new event
        setEvents((prevEvents) => [...prevEvents, formattedEvent]);
      } else {
        console.error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };
  

  const fetchEventsFromBackend = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/events");
      const data = await res.json();
  
      const formattedEvents = data.map((event) => ({
        id: event.id,
        title: event.name,
        start: event.startTime,
        end: event.endTime,
        color: event.color,
      }));
  
      setEvents([...formattedEvents]);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };
  
  
  const updateEvent = async (updatedEvent) => {
    try {
      const response = await fetch(`http://localhost:8080/api/events/${updatedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: updatedEvent.id,
          name: updatedEvent.name,
          startTime: updatedEvent.startTime, 
          endTime: updatedEvent.endTime, 
          color: updatedEvent.color,
        }),
      });
      if (response.ok) {
        const updatedEventFromServer = await response.json();
        setEvents((prevEvents) =>
          prevEvents.map((e) => (e.id === updatedEvent.id ? updatedEventFromServer : e))
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
        // Update the state immediately by removing the event
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
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
        deleteEvent(event.id); 
      }
    }
  };
  
  const handleEventChange = async (info) => {
    const updatedEvent = {
      id: info.event.id,
      name: info.event.title,
      startTime: info.event.start.toISOString(),
      endTime: info.event.end ? info.event.end.toISOString() : null,
      color: info.event.backgroundColor,
    };
  
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((e) =>
        e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e
      );
      return [...updatedEvents]; 
    });
  
    try {
      const res = await fetch(`http://localhost:8080/api/events/${updatedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!res.ok) {
        throw new Error("Failed to update event");
      }
  
      console.log("Event successfully updated");
    } catch (error) {
      console.error("Error updating event:", error);
     
      fetchEventsFromBackend(); 
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
            name: info.event.title,
            startTime: info.event.start.toISOString(),
            endTime: info.event.end ? info.event.end.toISOString() : null,
            color: info.event.backgroundColor,
          };
          setEvents((prevEvents) =>
            prevEvents.map((e) =>
              e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e
            )
          );
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
