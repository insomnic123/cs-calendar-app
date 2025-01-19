"use client";

import Image from "next/image";
import Skibidi from '@/components/Skibidi';
import {Calendar} from "@nextui-org/calendar";
import {today, getLocalTimeZone} from "@internationalized/date";
import React, {useState} from 'react';
import dynamic from 'next/dynamic';

// import {Button} from "@/components/Button"

const Fc = dynamic(() => import('@/components/FullCalendar.js'), { ssr: false });

export default function Home() {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('#000000');
  const [selectedEvent, setSelectedEvent] = useState(null);

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
  
        // Here you should notify the calendar to update events
        setEvents((prevEvents) => [...prevEvents, formattedEvent]); // Update the events state
      } else {
        console.error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
  
    if (title && startTime && endTime) {
      if (selectedEvent) {
        // Update existing event
        const updatedEvent = {
          id: selectedEvent.id,
          name: title,
          startTime,
          endTime,
          color,
        };
        updateEvent(updatedEvent); // Call the update logic
        setSelectedEvent(null); // Reset the selection
      } else {
        // Create a new event
        const newEvent = {
          name: title,
          startTime,
          endTime,
          color,
        };
        createEvent(newEvent); // Call the creation logic
      }
  
      // Reset form fields
      setTitle('');
      setStartTime('');
      setEndTime('');
      setColor('#000000');
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event); // Store the clicked event
    setTitle(event.title); // Populate form fields
    setStartTime(event.start); 
    setEndTime(event.end); 
    setColor(event.backgroundColor || '#000000');
  };
  
  return (
    <div className="calMain">
      <div className="calSideBarA">
        <Calendar
          className="MiniCalendar dark text-foreground bg-background"
          color="danger"
          isReadOnly
          aria-label="Date (Read Only)"
          value={today(getLocalTimeZone())}
        />
        <h1 className="saveMe">Tags</h1>
        <ul>
          <label className="container">
            One<input type="checkbox" />
            <span className="checkmark"></span>
          </label>
          <label className="container">
            Two<input type="checkbox" />
            <span className="checkmark"></span>
          </label>
          <label className="container">
            Three<input type="checkbox" />
            <span className="checkmark"></span>
          </label>
          <label className="container">
            Four<input type="checkbox" />
            <span className="checkmark"></span>
          </label>
        </ul>
      </div>
      <div className="calContent">
        <Fc />
      </div>
      <div className="calSideBarB">
        <h3 className="eventMenuTitle" >New Event</h3>
        <form className="event-form" onSubmit={handleFormSubmit}>
          <input type="text" className="event-title" required placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)}
          ></input>
          <div className="start-time">
            <h3>
            Start Time:
            <input type="datetime-local" required className="timeInputs" value={startTime} onChange={(e) => setStartTime(e.target.value)}/>
          </h3> 
          </div>
          <div className="endTime">
          <label>
            End Time:
            <input type="datetime-local" className="timeInputs" value={endTime} onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
          </div>
          <div>
          <label>
            Color:
            <input type="color" className="event-color"  value={color} onChange={(e) => setColor(e.target.value)}/>
          </label>
          </div>
          <div className = "sideMenuBButtons">
          <button type="submit" className="save-event">Save Event</button>
          <button type="button" className="cancel-event" onClick={() => setSelectedEvent(null)}
          >Cancel</button>
          </div>
        </form>
      </div>
      </div>
  );
}