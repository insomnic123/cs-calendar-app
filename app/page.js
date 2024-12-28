"use client";

import Image from "next/image";
import Skibidi from '@/components/Skibidi';
import {Calendar} from "@nextui-org/calendar";
import {today, getLocalTimeZone} from "@internationalized/date";

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
      <Skibidi/>
    </div>
    <div className = "calSideBarB">
    </div>
    </>
  );
}
