import { Box, Stack } from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  AccessTime,
  ArrowForward,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  spots: number;
  registered: number;
}

const Events = () => {
  const router = useRouter();

  const events: Event[] = [
    {
      id: "1",
      title: "Free Health Checkup Camp",
      description:
        "Get comprehensive health screening including blood pressure, diabetes, and general wellness checks.",
      date: "Feb 15, 2026",
      time: "9:00 AM - 5:00 PM",
      location: "Community Center, Downtown",
      category: "Health Camp",
      image: "/img/camp.jpg",
      spots: 100,
      registered: 67,
    },
    {
      id: "2",
      title: "Mental Health Awareness Seminar",
      description:
        "Join expert psychiatrists discussing stress management, anxiety, and maintaining mental wellness.",
      date: "Feb 18, 2026",
      time: "2:00 PM - 4:30 PM",
      location: "MedBook Auditorium",
      category: "Seminar",
      image: "/img/seminar.jpg",
      spots: 150,
      registered: 89,
    },
    {
      id: "3",
      title: "Pediatric Care Workshop",
      description:
        "Learn essential childcare techniques, vaccination schedules, and nutrition tips from pediatric experts.",
      date: "Feb 22, 2026",
      time: "10:00 AM - 1:00 PM",
      location: "City Hospital, Hall A",
      category: "Workshop",
      image: "/img/smnr.jpg",
      spots: 80,
      registered: 45,
    },
  ];

  return (
    <Box className="events">
      <Stack className="events-container">
        {/* Header */}
        <Box className="events-header">
          <Box>
            <h2 className="events-title">Upcoming Health Events</h2>
            <p className="events-subtitle">
              Join our community health programs and workshops
            </p>
          </Box>
        </Box>

        {/* Events Grid */}
        <Box className="events-grid">
          {events.map((event) => (
            <Box key={event.id} className="event-card">
              <Box className="event-card-image">
                <img src={event.image} alt={event.title} />
                <Box className="event-card-category">{event.category}</Box>
              </Box>

              <Box className="event-card-content">
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-description">{event.description}</p>

                <Box className="event-card-details">
                  <Box className="event-detail">
                    <CalendarToday />
                    <span>{event.date}</span>
                  </Box>
                  <Box className="event-detail">
                    <AccessTime />
                    <span>{event.time}</span>
                  </Box>
                  <Box className="event-detail">
                    <LocationOn />
                    <span>{event.location}</span>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

export default Events;
