import React from "react";
import "./Card.scss";
import { useNavigate } from "react-router-dom";

interface CardProps {
  name: string;
  info: string;
  creator: string;
  startTime: { _hex: string };
  endTime: { _hex: string };
  address: string;
}

const Card: React.FC<CardProps> = ({
  name,
  info,
  creator,
  startTime,
  endTime,
  address,
}) => {
  const start = parseInt(startTime._hex, 16);
  const end = parseInt(endTime._hex, 16);
  const startDateTime = new Date(start).toLocaleString();
  const endDateTime = new Date(end).toLocaleString();
  const navigate = useNavigate();
  return (
    <div className="card" onClick={() => navigate(`/exams/${address}`)}>
      <h2 className="name">{name}</h2>
      <p className="info">{info}</p>
      <div className="creator">Creator: {creator}</div>
      <div className="time">Start time: {startDateTime}</div>
      <div className="time">End time: {endDateTime}</div>
    </div>
  );
};

export default Card;
