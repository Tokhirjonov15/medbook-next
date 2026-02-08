import { useRouter } from "next/router";

const DoctorDetail = () => {
  const router = useRouter();
  const { doctorId } = router.query;
  return <div>DOCTOR DETAIL {doctorId}</div>;
};

export default DoctorDetail;
