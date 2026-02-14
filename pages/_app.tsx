import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import Head from "next/head";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "@/apollo/client";
import { getJwtToken, updateUserInfo } from "@/libs/auth";
import "../scss/app.scss";
import "../scss/pc/main.scss";
import "../scss/mobile/main.scss";

export default function App({ Component, pageProps }: AppProps) {
  //@ts-ignore
  const [theme, setTheme] = useState(createTheme("light"));
  const client = useApollo((pageProps as any)?.initialApolloState);

  useEffect(() => {
    const token = getJwtToken();
    if (token) updateUserInfo(token);
  }, []);

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ApolloProvider>
  );
}
