"use client";

import { useEffect, useState } from 'react';

export default function Skibidi() {
  const [message, setMessage] = useState('testdyuaufu');

  useEffect(() => {
    fetch('http://localhost:8080/api/greet')
      .then((response) => response.text())
      .then((data) => setMessage(data));
  }, []);

  return <h1>{message}</h1>;
}