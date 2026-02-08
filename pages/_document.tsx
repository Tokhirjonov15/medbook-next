import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="title" content="MedBook" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/png" href="/img/logo.png" />

        {/** SEO */}
        <meta
          name="keyboard"
          content="MedBook, doctor, hospital, clinic, appointment, booking, online, platform"
        />
        <meta
          name="description"
          content={
            "MedBook is a platform for booking appointments with doctors and hospitals. | " +
            "MedBook - shifokorlar va shifoxonalar uchun onlayn rezervatsiya platformasi |" +
            "의사와 병원 예약 플랫폼"
          }
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
