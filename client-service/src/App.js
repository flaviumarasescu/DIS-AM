import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState({});

  const getData = async () => {
    // const resGet = await axios
    //   .get("api/query/concert")
    //   .catch((e) => console.log("e", e));
    // const resGet = await axios.get("api/query").catch(e => console.log('e',e));
    const resPost = await axios
      // .post(
      //   "api/query/concert",
      //   {
      .post(
        'api/query/concert',
        {
          concertData: {
            concertId: '60a1f8b7bb24d732c88b1c71',
            userPIN: '60a1f8b7bb24d732c88b1c72',
            tickets: [
              { ticketId: '60a1f8b7bb24d732c88b1c79', seatNumber: 'A1' },
              { ticketId: '60a1f8b7bb24d732c88b1c78', seatNumber: 'A2' },
            ],
            expirationTime: '2024-02-25T12:00:00Z',
          },
          paymentData: {
            userPIN: '60a1f8b7bb24d732c88b1c72',
            amount: 100.0,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'arraybuffer',
        }
      )
      .catch((e) => console.log('e', e));
    // console.log("resGet", resGet);
    if (resPost?.data) {
      // Create a Blob from the array buffer
      const pdfBlob = new Blob([resPost?.data], { type: 'application/pdf' });

      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = 'downloaded.pdf';

      // Append the link to the body and trigger a click event to initiate the download
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Remove the link from the DOM
      document.body.removeChild(downloadLink);

      console.log('PDF downloaded successfully!!');
      // if (resGet) {
      //   const data = await resGet?.json();
      //   setData(JSON.parse(JSON.stringify(data)));
      // }
    }
  };

  // useEffect(() => {
  //   try {
  //     const getData = async () => {
  //       // const resGet = await axios
  //       //   .get("api/query/concert")
  //       //   .catch((e) => console.log("e", e));
  //       // const resGet = await axios.get("api/query").catch(e => console.log('e',e));
  //       const resPost = await axios
  //         // .post(
  //         //   "api/query/concert",
  //         //   {
  //         .post(
  //           'api/query/concert',
  //           {
  //             concertData: {
  //               concertId: '60a1f8b7bb24d732c88b1c71',
  //               userPIN: '60a1f8b7bb24d732c88b1c72',
  //               tickets: [
  //                 { ticketId: '60a1f8b7bb24d732c88b1c79', seatNumber: 'A1' },
  //                 { ticketId: '60a1f8b7bb24d732c88b1c78', seatNumber: 'A2' },
  //               ],
  //               expirationTime: '2024-02-25T12:00:00Z',
  //             },
  //             paymentData: {
  //               userPIN: '60a1f8b7bb24d732c88b1c72',
  //               amount: 100.0,
  //             },
  //           },
  //           {
  //             headers: { 'Content-Type': 'application/json' },
  //             responseType: 'arraybuffer',
  //           }
  //         )
  //         .catch((e) => console.log('e', e));
  //       // console.log("resGet", resGet);
  //       console.log('resPost', resPost?.data);
  //       // Create a Blob from the array buffer
  //       const pdfBlob = new Blob([resPost.data], { type: 'application/pdf' });

  //       // Create a download link
  //       const downloadLink = document.createElement('a');
  //       downloadLink.href = URL.createObjectURL(pdfBlob);
  //       downloadLink.download = 'downloaded.pdf';

  //       // Append the link to the body and trigger a click event to initiate the download
  //       document.body.appendChild(downloadLink);
  //       downloadLink.click();

  //       // Remove the link from the DOM
  //       document.body.removeChild(downloadLink);

  //       console.log('PDF downloaded successfully!');
  //       // if (resGet) {
  //       //   const data = await resGet?.json();
  //       //   setData(JSON.parse(JSON.stringify(data)));
  //       // }
  //     };

  //     getData();
  //   } catch (e) {
  //     console.log('FE err', e);
  //   }
  // }, []);

  // console.log('{data}', data);
  return (
    <div className='App'>
      <div>ticketing app AS</div>
      <button onClick={() => getData()}>Get ticket</button>
    </div>
  );
}

export default App;
