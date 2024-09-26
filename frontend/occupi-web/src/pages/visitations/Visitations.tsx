// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import { Card, CardHeader, CardBody, Grid, Text, Spacer, Avatar } from '@nextui-org/react';
// import { Calendar, Lock, UserCircle, Mail } from 'lucide-react';

// interface BookingData {
//   occupiID: string;
//   roomName: string;
//   floorNo: string;
//   start: string;
//   end: string;
//   creators: string;
//   emails: string[];
//   checkedIn: boolean;
// }

// interface UserDetails {
//   email: string;
//   name: string;
//   dob: string;
//   gender: string;
//   employeeid: string;
//   number: string;
//   pronouns: string;
// }

// const BookingsCard = () => {
//   const [bookings, setBookings] = useState<BookingData[]>([]);
//   const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

//   useEffect(() => {
//     const fetchBookings = async () => {
//       try {
//         const response = await axios.get('/analytics/bookings-historical');
//         setBookings(response.data.data);
//       } catch (error) {
//         console.error('Error fetching bookings:', error);
//       }
//     };

//     const fetchUserDetails = async () => {
//       try {
//         const response = await axios.get('/api/user-details?email=tintinaustin12345@gmail.com');
//         setUserDetails(response.data.data);
//       } catch (error) {
//         console.error('Error fetching user details:', error);
//       }
//     };

//     fetchBookings();
//     fetchUserDetails();
//   }, []);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <Card>
//         <CardHeader>
//           <Text h1>Bookings and User Details</Text>
//         </CardHeader>
//         <CardBody>
//           {userDetails && (
//             <div>
//               <Grid.Container justify="space-between" align="center">
//                 <Grid>
//                   <Avatar size="lg" src={`https://ui-avatars.com/api/?name=${userDetails.name}`} />
//                 </Grid>
//                 <Grid>
//                   <Text h3>{userDetails.name}</Text>
//                   <Text size="$md" color="$text_col_secondary_alt">
//                     {userDetails.email}
//                   </Text>
//                   <Text size="$md" color="$text_col_secondary_alt">
//                     <Calendar size={16} />
//                     {userDetails.dob}
//                   </Text>
//                   <Text size="$md" color="$text_col_secondary_alt">
//                     <Mail size={16} />
//                     {userDetails.pronouns}
//                   </Text>
//                   <Text size="$md" color="$text_col_secondary_alt">
//                     <UserCircle size={16} />
//                     {userDetails.employeeid}
//                   </Text>
//                   <Text size="$md" color="$text_col_secondary_alt">
//                     <Lock size={16} />
//                     {userDetails.number}
//                   </Text>
//                 </Grid>
//               </Grid.Container>
//               <Spacer y={2} />
//             </div>
//           )}
//           <Text h2>Bookings</Text>
//           {bookings.map((booking, index) => (
//             <Card key={index} className='mb-5'>
//               <CardBody>
//                 <Grid.Container justify="space-between" align="center">
//                   <Grid>
//                     <Text h3>{booking.roomName}</Text>
//                     <Text size="$md" color="$text_col_secondary_alt">
//                       <Calendar size={16} />
//                       {booking.start} - {booking.end}
//                     </Text>
//                     <Text size="$md" color="$text_col_secondary_alt">
//                       <Lock size={16} />
//                       Floor {booking.floorNo}
//                     </Text>
//                   </Grid>
//                   <Grid>
//                     <Text h4>Booking ID</Text>
//                     <Text size="$md" color="$text_col_secondary_alt">
//                       {booking.occupiID}
//                     </Text>
//                     <Text h4>Creators</Text>
//                     <Text size="$md" color="$text_col_secondary_alt">
//                       {booking.creators}
//                     </Text>
//                     <Text h4>Checked In</Text>
//                     <Text size="$md" color="$text_col_secondary_alt">
//                       {booking.checkedIn ? 'Yes' : 'No'}
//                     </Text>
//                   </Grid>
//                 </Grid.Container>
//                 <Spacer y={1} />
//                 <Grid.Container align="center">
//                   <Grid>
//                     <Text h4>Attendees</Text>
//                     {booking.emails.map((email, i) => (
//                       <Grid.Container key={i} align="center" css={{ marginBottom: '$4' }}>
//                         <Grid>
//                           <Avatar
//                             size="md"
//                             src={`https://ui-avatars.com/api/?name=${email.split('@')[0]}`}
//                           />
//                         </Grid>
//                         <Grid>
//                           <Text size="$md" color="$text_col_secondary_alt">
//                             {email}
//                           </Text>
//                         </Grid>
//                       </Grid.Container>
//                     ))}
//                   </Grid>
//                 </Grid.Container>
//               </CardBody>
//             </Card>
//           ))}
//         </CardBody>
//       </Card>
//     </motion.div>
//   );
// };

// export default BookingsCard;


const Visitations = () => {
  return (
    <div>Visitations</div>
  )
}

export default Visitations