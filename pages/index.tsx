import { Box, Container, Stack } from "@mui/material";

export default function Home() {
  return (
    <>
      <Stack sx={{ background: "#81c784" }}>Header</Stack>
      <Container>
        <Stack flexDirection={"column"}>
          <Box>Upcoming Appointments</Box>
          <Box>Browse by Specialization</Box>
          <Box>Top Rated Doctors</Box>
          <Box>Events</Box>
        </Stack>
      </Container>
      <Stack sx={{ background: "#81c784" }}>Footer</Stack>
    </>
  );
}
