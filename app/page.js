"use client";

import Image from "next/image";
import Skibidi from '@/components/Skibidi';
import {Calendar} from "@nextui-org/calendar";
import {today, getLocalTimeZone} from "@internationalized/date";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { Draggable, DropArg } from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import React from 'react';
import dynamic from 'next/dynamic';

const Fc = dynamic(() => import('C:\Users\qazia\Desktop\CS12\Calendar App\cs-calendar-app\components\FullCalendar.js'), { ssr: false });

export default function Home() {
  return (<>
    <div className ="calSideBarA"> 
      <Calendar className = "MiniCalendar dark text-foreground bg-background" color="danger" isReadOnly aria-label="Date (Read Only)" value={today(getLocalTimeZone())}/>
      <h1 className = "saveMe">Tags</h1>
      <ul>
      <label className="container">One<input type="checkbox"/>
      <span className="checkmark"></span>
    </label>

    <label className="container">Two
      <input type="checkbox"/>
      <span className="checkmark"></span>
    </label>

    <label className="container">Three
      <input type="checkbox"/>
      <span className="checkmark"></span>
    </label>

    <label className="container">Four
      <input type="checkbox"/>
      <span className="checkmark"></span>
    </label>
      </ul>
    </div>
    <div className = "calMain">
      <div className = "grid grid-cols-10">
        <div className = "col-span-8">
          <Fc/>
        </div>
      </div>
    </div>
    <div className = "calSideBarB">
    </div>
    </>
  );
}
