"use client"; // Renders everything client-side

// import React, { useState } from 'react';
import { connectWebSocket, disconnectWebSocket } from "./Websocket"; // Imports websocket component
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import React, { useState, useEffect } from 'react';

const Calendar = () => {
  const [events, setEvents] = useState([]); // State holding list of events displayed
  
  // fetches events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/events"); // backend URL
        const data = await res.json();

        // formats events as per what is provided on the backend
        const formattedEvents = data.map((event) => ({
          id: event.id,
          title: event.name,
          start: event.startTime,
          end: event.endTime,
          color: event.color,
        }));

        setEvents(formattedEvents); // Displays events when fetched 
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents(); // Call to fetch events
  }, []); // Empty dependency ensures it is called only once

  // handle WebSocket updates for real-time events
  useEffect(() => {
    connectWebSocket((newEvent) => {
      console.log("New WebSocket Event:", newEvent);
      setEvents((prevEvents) => [ // adds new events to the calendar 
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
  
  // State for the currently selected event
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [lastClickTime, setLastClickTime] = useState(null); 

  // Create a new event and send it to the backend using the POST request
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

  // Added redundancy due to persisting errors of the events displaying incorrectly
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
  
  // Updates existing events in the backend and the state
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
        // Update state with new info
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
  
  // Deletes events using the DELETE request
  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/events/${eventId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        // updates the state immediately by removing the event
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
      } else {
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };
  
  // Creates events when an individual clikcs on the calendar 
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
  
  // Selects events
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  // Handles events being deleted by clicking backspace
  const handleDeleteEvent = (event) => {
    if (event) {
      if (confirm(`Delete event '${event.title}'?`)) {
        deleteEvent(event.id).then(() => {
          setSelectedEvent(null); // clears selection after the event has been deleted 
        }).catch((error) => {
          console.error("Error deleting event:", error);
        });
      }
    }
  };
  
  // Handles when event information and data is changed
  const handleEventChange = async (info) => {
    const updatedEvent = {
      id: info.event.id,
      name: info.event.title,
      startTime: info.event.start.toISOString(),
      endTime: info.event.end ? info.event.end.toISOString() : null,
      color: info.event.backgroundColor,
    };
  
    // updates the UI immediately to show the changes
    setEvents((prevEvents) => {
      return prevEvents.map((e) =>
        e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e
      );
    });
  
    // Send the update to the server
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
  
      // If the update fails, refresh events from the server
      fetchEventsFromBackend();
    }
  };
  
  // Ensures events are deleted when backspace is clicked
  const handleKeydown = (event) => {
    if (event.key === 'Backspace' && selectedEvent) {
      handleDeleteEvent(selectedEvent);
    }
  };

  // Adds listeners for keyboard functionality
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [selectedEvent]);

  // Returns fullCalendar component
  return (
        <div className="calMain">
          <FullCalendar
            height={'100vh'} // ensures full height of the screen is taken up
            initialView="timeGridWeek"
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            titleFormat={{ month: 'long', year: 'numeric' }}
            header={{ center: 'title' }}
            events={events}
            nowIndicator={true}
            editable={true} 
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventChange={(info) => handleEventChange(info)}
            eventRemove={(info) => deleteEvent(info.event.id)} 
          />
        </div>
      );
    };

export default Calendar;
